"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Shield, Truck, Heart, Filter, Grid, List, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ProductCard } from "@/components/product-card";
import { ShoppingCart } from "@/components/shopping-cart";
import { supabase } from "@/lib/supabase";
import { getCartItemCount, type Product } from "@/lib/cart";
import { type Language, t, getLanguageDirection } from "@/lib/i18n";
import { addToCart } from "@/lib/cart";
import { toast } from "@/components/ui/use-toast";
import SpecialLoader from "@/components/SpecialLoader";

export default function ProductCatalogPage() {
  const [language, setLanguage] = useState<Language>("en");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [sortBy, setSortBy] = useState("featured");
  const [filterBy, setFilterBy] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  useEffect(() => {
    // Load language from localStorage
    const savedLang = localStorage.getItem("language") as Language;
    if (savedLang && (savedLang === "en" || savedLang === "ar")) {
      setLanguage(savedLang);
    }
    loadProducts();
    loadCartCount();
  }, []);

  useEffect(() => {
    // Update document direction when language changes
    document.documentElement.dir = getLanguageDirection(language);
    document.documentElement.lang = language;
  }, [language]);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading products:", error);
        return;
      }

      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCartCount = async () => {
    try {
      const count = await getCartItemCount();
      setCartItemCount(count);
    } catch (error) {
      console.error("Error loading cart count:", error);
    }
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
    document.documentElement.dir = getLanguageDirection(lang);
    document.documentElement.lang = lang;
  };

  const handleCartUpdate = () => {
    loadCartCount();
  };

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          (p.name_ar && p.name_ar.includes(term))
      );
    }

    // Apply filters
    if (filterBy !== "all") {
      if (filterBy === "featured") {
        filtered = filtered.filter((p) => p.is_featured);
      } else if (filterBy === "sale") {
        filtered = filtered.filter(
          (p) => p.original_price && p.original_price > p.price
        );
      } else if (filterBy === "new") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filtered = filtered.filter((p) => new Date(p.created_at) > oneWeekAgo);
      } else {
        // Filter by color/tag
        filtered = filtered.filter((p) => p.tags?.includes(filterBy));
      }
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      default: // featured
        filtered.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });
    }

    setFilteredProducts(filtered);
  }, [products, sortBy, filterBy, searchTerm]);

  const uniqueTags = Array.from(new Set(products.flatMap((p) => p.tags || [])));
  const featuredProducts = products.filter((p) => p.is_featured).slice(0, 4);

  if (isLoading) {
    return (
      <SpecialLoader />

      // <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
      //   <Loader />
      // </div>
    );
  }

  const handleBuyNow = async () => {
    // Add product to cart first
    const result = await addToCart(1, 1); // Assuming product ID 1 for the main kufiya

    if (result.success) {
      // Go directly to payment
      window.location.href = `/payment?lang=${language}`;
    } else {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description:
          result.error ||
          (language === "ar" ? "فشل في إضافة المنتج" : "Failed to add product"),
        variant: "destructive",
      });
    }
  };

  // Voice search handler
  const handleVoiceSearch = () => {
    setSpeechError(null);
    // TypeScript: SpeechRecognition is not in the standard DOM lib, so we use 'as any' for compatibility
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError("Voice search is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = language === "ar" ? "ar-EG" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchTerm(transcript);
      setIsListening(false);
    };
    recognition.onerror = (event: any) => {
      setSpeechError(event.error || "Voice search error");
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    recognition.start();
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-green-50 to-white"
      dir={getLanguageDirection(language)}
    >
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-7 rounded-sm overflow-hidden shadow-sm">
              <Image
                src="/images/palestine-flag.png"
                alt="Palestinian Flag"
                width={40}
                height={28}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              {t("store_name", language)}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher
              currentLang={language}
              onLanguageChange={handleLanguageChange}
            />
            <ShoppingCart
              language={language}
              cartItemCount={cartItemCount}
              onCartUpdate={handleCartUpdate}
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {language === "ar"
              ? "مجموعة الكوفيات الفلسطينية الأصيلة"
              : "Authentic Palestinian Kufiya Collection"}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            {language === "ar"
              ? "اكتشف مجموعتنا المتنوعة من الكوفيات الفلسطينية المصنوعة يدوياً بأنماط تقليدية وألوان جميلة"
              : "Discover our diverse collection of handcrafted Palestinian kufiyas with traditional patterns and beautiful colors"}
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">
                  {t("authentic_quality", language)}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("quality_description", language)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Heart className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">
                  {t("supporting_artisans", language)}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("artisans_description", language)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Truck className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">
                  {t("fast_delivery", language)}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("delivery_description", language)}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-8">
              {language === "ar" ? "المنتجات المميزة" : "Featured Products"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  language={language}
                  onCartUpdate={handleCartUpdate}
                />
              ))}
            </div>
          </div>
        )}

        {/* Filters and Sorting */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">
              {language === "ar" ? "جميع المنتجات" : "All Products"} (
              {filteredProducts.length})
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input and Voice Search */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between ">
              <div className="flex items-center gap-2 w-full max-w-md">
                <input
                  type="text"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder={
                    language === "ar"
                      ? "ابحث عن منتج بالاسم..."
                      : "Search product by name..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  dir={language === "ar" ? "rtl" : "ltr"}
                />
                <Button
                  type="button"
                  onClick={handleVoiceSearch}
                  variant={isListening ? "secondary" : "outline"}
                  className="flex items-center justify-center px-3 relative"
                  disabled={isListening}
                  aria-label={language === "ar" ? "بحث صوتي" : "Voice search"}
                >
                  {/* Pulsing ring when listening */}
                  {isListening && (
                    <span className="absolute inline-flex h-10 w-10 rounded-full bg-green-400 opacity-30 animate-ping -z-10"></span>
                  )}
                  <Mic
                    className={`w-6 h-6 ${
                      isListening ? "text-green-600" : "text-gray-500"
                    }`}
                  />
                  {isListening && (
                    <span className="ml-2 text-green-600 animate-pulse">
                      {language === "ar" ? "يستمع..." : "Listening..."}
                    </span>
                  )}
                </Button>
              </div>
              {speechError && (
                <div className="text-red-500 text-sm mt-2">{speechError}</div>
              )}
            </div>
            {/* Filter */}
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue
                  placeholder={language === "ar" ? "تصفية" : "Filter"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {language === "ar" ? "جميع المنتجات" : "All Products"}
                </SelectItem>
                <SelectItem value="featured">
                  {language === "ar" ? "مميز" : "Featured"}
                </SelectItem>
                <SelectItem value="sale">
                  {language === "ar" ? "تخفيضات" : "On Sale"}
                </SelectItem>
                <SelectItem value="new">
                  {language === "ar" ? "جديد" : "New"}
                </SelectItem>
                {uniqueTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue
                  placeholder={language === "ar" ? "ترتيب" : "Sort"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">
                  {language === "ar" ? "مميز" : "Featured"}
                </SelectItem>
                <SelectItem value="newest">
                  {language === "ar" ? "الأحدث" : "Newest"}
                </SelectItem>
                <SelectItem value="price-low">
                  {language === "ar"
                    ? "السعر: منخفض إلى عالي"
                    : "Price: Low to High"}
                </SelectItem>
                <SelectItem value="price-high">
                  {language === "ar"
                    ? "السعر: عالي إلى منخفض"
                    : "Price: High to Low"}
                </SelectItem>
                <SelectItem value="name">
                  {language === "ar" ? "الاسم" : "Name"}
                </SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Heart className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {language === "ar" ? "لا توجد منتجات" : "No products found"}
            </h3>
            <p className="text-gray-500 mb-4">
              {language === "ar"
                ? "جرب تغيير المرشحات أو البحث"
                : "Try changing your filters or search terms"}
            </p>
            <Button onClick={() => setFilterBy("all")} variant="outline">
              {language === "ar" ? "عرض جميع المنتجات" : "Show All Products"}
            </Button>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-6"
            }
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                language={language}
                onCartUpdate={handleCartUpdate}
              />
            ))}
          </div>
        )}

        {/* Newsletter Section */}
        <div className="mt-16 bg-green-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {language === "ar"
              ? "ابق على اطلاع بأحدث المنتجات"
              : "Stay Updated with Latest Products"}
          </h2>
          <p className="text-gray-600 mb-6">
            {language === "ar"
              ? "اشترك في نشرتنا الإخبارية للحصول على أحدث المنتجات والعروض الخاصة"
              : "Subscribe to our newsletter for latest products and special offers"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder={
                language === "ar" ? "أدخل بريدك الإلكتروني" : "Enter your email"
              }
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Button
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={handleBuyNow}
            >
              {t("buy_now", language)} - $10.00
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
