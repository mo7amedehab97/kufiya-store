"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Heart,
  Share2,
  ShoppingCart,
  Minus,
  Plus,
  ArrowLeft,
  Shield,
  Truck,
  RotateCcw,
  Check,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ShoppingCart as ShoppingCartComponent } from "@/components/shopping-cart";
import { ProductCard } from "@/components/product-card";
import { supabase } from "@/lib/supabase";
import {
  addToCart,
  getCartItemCount,
  type Product,
  removeFromCart,
  getCartFromStorage,
} from "@/lib/cart";
import { type Language, t, getLanguageDirection } from "@/lib/i18n";
import SpecialLoader from "@/components/SpecialLoader";

interface ProductReview {
  id: number;
  product_id: number;
  customer_name: string;
  rating: number;
  review_text: string;
  is_verified: boolean;
  created_at: string;
}

export default function ProductDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = Number.parseInt(params.id as string);

  const [language, setLanguage] = useState<Language>("en");
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [cartItemId, setCartItemId] = useState<number | null>(null);

  useEffect(() => {
    // Load language from URL params or localStorage
    const langParam = searchParams.get("lang") as Language;
    const savedLang = localStorage.getItem("language") as Language;

    if (langParam && (langParam === "en" || langParam === "ar")) {
      setLanguage(langParam);
      localStorage.setItem("language", langParam);
    } else if (savedLang && (savedLang === "en" || savedLang === "ar")) {
      setLanguage(savedLang);
    }

    loadProduct();
    loadCartCount();
    checkIfInCart();
  }, [productId]);

  useEffect(() => {
    document.documentElement.dir = getLanguageDirection(language);
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    checkIfInCart();
  }, [product]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);

      // Load main product
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .eq("is_active", true)
        .single();

      if (productError || !productData) {
        console.error("Product not found:", productError);
        router.push("/");
        return;
      }

      setProduct(productData);

      // Load related products (same category, excluding current product)
      const { data: relatedData, error: relatedError } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .eq("category", productData.category)
        .neq("id", productId)
        .limit(4);

      if (!relatedError && relatedData) {
        setRelatedProducts(relatedData);
      }

      // Load reviews (mock data for now)
      const mockReviews: ProductReview[] = [
        {
          id: 1,
          product_id: productId,
          customer_name: "Sarah M.",
          rating: 5,
          review_text:
            "Absolutely beautiful kufiya! The quality is exceptional and it arrived quickly. You can really feel the craftsmanship in every thread.",
          is_verified: true,
          created_at: "2024-01-15T10:30:00Z",
        },
        {
          id: 2,
          product_id: productId,
          customer_name: "Ahmed K.",
          rating: 5,
          review_text:
            "This is authentic Palestinian kufiya at its finest. The traditional pattern is perfect and the cotton is so soft.",
          is_verified: true,
          created_at: "2024-01-10T14:20:00Z",
        },
        {
          id: 3,
          product_id: productId,
          customer_name: "Maria L.",
          rating: 4,
          review_text:
            "Great quality and fast shipping. The colors are exactly as shown in the photos. Very happy with my purchase!",
          is_verified: true,
          created_at: "2024-01-08T09:15:00Z",
        },
      ];
      setReviews(mockReviews);
    } catch (error) {
      console.error("Error loading product:", error);
      router.push("/");
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

  const checkIfInCart = () => {
    if (!product) return;
    const cart = getCartFromStorage();
    const cartItem = cart.find((item: any) => item.product_id === product.id);
    setIsInCart(!!cartItem);
    setCartItemId(cartItem ? cartItem.id : null);
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
    // Update URL with language parameter
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("lang", lang);
    router.replace(newUrl.pathname + newUrl.search);
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);

    try {
      const result = await addToCart(product, quantity);

      if (result.success) {
        toast({
          title: language === "ar" ? "تمت الإضافة للسلة" : "Added to Cart",
          description:
            language === "ar"
              ? `تم إضافة ${quantity} من ${product.name_ar} إلى سلة التسوق`
              : `${quantity} ${product.name} added to your cart`,
        });

        loadCartCount();
        checkIfInCart();
      } else {
        toast({
          title: language === "ar" ? "خطأ" : "Error",
          description:
            result.error ||
            (language === "ar"
              ? "فشل في إضافة المنتج"
              : "Failed to add product"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description:
          language === "ar"
            ? "حدث خطأ غير متوقع"
            : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleRemoveFromCart = async () => {
    if (!cartItemId) return;
    setIsAddingToCart(true);
    try {
      const result = await removeFromCart(cartItemId);
      if (result.success) {
        toast({
          title: language === "ar" ? "تم الحذف" : "Item Removed",
          description:
            language === "ar"
              ? `تم حذف ${product?.name_ar} من السلة`
              : `${product?.name} removed from cart`,
        });
        loadCartCount();
        checkIfInCart();
      } else {
        toast({
          title: language === "ar" ? "خطأ" : "Error",
          description:
            result.error ||
            (language === "ar" ? "فشل في حذف المنتج" : "Failed to remove item"),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description:
          language === "ar"
            ? "حدث خطأ غير متوقع"
            : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = () => {
    if (!product) return;

    setIsWishlisted(!isWishlisted);

    toast({
      title: isWishlisted
        ? language === "ar"
          ? "تم الحذف من المفضلة"
          : "Removed from Wishlist"
        : language === "ar"
        ? "تم الإضافة للمفضلة"
        : "Added to Wishlist",
      description: isWishlisted
        ? language === "ar"
          ? `تم حذف ${product.name_ar} من المفضلة`
          : `${product.name} removed from wishlist`
        : language === "ar"
        ? `تم إضافة ${product.name_ar} للمفضلة`
        : `${product.name} added to wishlist`,
    });
  };

  const handleShare = async () => {
    if (!product) return;

    const shareData = {
      title: language === "ar" ? product.name_ar : product.name,
      text: language === "ar" ? product.description_ar : product.description,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: language === "ar" ? "تم النسخ" : "Link Copied",
          description:
            language === "ar"
              ? "تم نسخ رابط المنتج"
              : "Product link copied to clipboard",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    setIsAddingToCart(true);
    try {
      const result = await addToCart(product, quantity);
      if (result.success) {
        router.push(`/payment?lang=${language}`);
      } else {
        toast({
          title: language === "ar" ? "خطأ" : "Error",
          description:
            result.error ||
            (language === "ar"
              ? "فشل في إضافة المنتج"
              : "Failed to add product"),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description:
          language === "ar"
            ? "حدث خطأ غير متوقع"
            : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <SpecialLoader fullscreen={false} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {language === "ar" ? "المنتج غير موجود" : "Product Not Found"}
          </h2>
          <p className="text-gray-500 mb-4">
            {language === "ar"
              ? "المنتج المطلوب غير متوفر"
              : "The requested product is not available"}
          </p>
          <Link href="/">
            <Button>
              {language === "ar" ? "العودة للمتجر" : "Back to Store"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const productImages = [
    product.image_primary,
    product.image_hover,
    ...(product.image_gallery || []),
  ];
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 5;
  const discountPercentage = product.original_price
    ? Math.round(
        ((product.original_price - product.price) / product.original_price) *
          100
      )
    : 0;

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
            <ShoppingCartComponent
              language={language}
              cartItemCount={cartItemCount}
              onCartUpdate={loadCartCount}
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-green-600">
            {language === "ar" ? "الرئيسية" : "Home"}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="capitalize">{product.category}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">
            {language === "ar" ? product.name_ar : product.name}
          </span>
        </nav>

        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === "ar" ? "العودة" : "Back"}
        </Button>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 relative">
              <Image
                src={productImages[selectedImageIndex] || "/placeholder.svg"}
                alt={language === "ar" ? product.name_ar : product.name}
                fill
                className="object-cover"
                priority
              />

              {/* Image Navigation */}
              {productImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white"
                    onClick={() =>
                      setSelectedImageIndex(
                        selectedImageIndex > 0
                          ? selectedImageIndex - 1
                          : productImages.length - 1
                      )
                    }
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white"
                    onClick={() =>
                      setSelectedImageIndex(
                        selectedImageIndex < productImages.length - 1
                          ? selectedImageIndex + 1
                          : 0
                      )
                    }
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.is_featured && (
                  <Badge className="bg-green-600 text-white">
                    {language === "ar" ? "مميز" : "Featured"}
                  </Badge>
                )}
                {discountPercentage > 0 && (
                  <Badge className="bg-red-600 text-white">
                    -{discountPercentage}%
                  </Badge>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {productImages.map((image, index) => (
                  <div
                    key={index}
                    className={`aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer transition-all ${
                      selectedImageIndex === index
                        ? "ring-2 ring-green-600"
                        : "hover:opacity-80"
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${
                        language === "ar" ? product.name_ar : product.name
                      } - Image ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Product Title & Rating */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {language === "ar" ? product.name_ar : product.name}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(averageRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">
                    {averageRating.toFixed(1)} ({reviews.length}{" "}
                    {language === "ar" ? "تقييم" : "reviews"})
                  </span>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  {product.category}
                </Badge>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-green-600">
                ${product.price.toFixed(2)}
              </span>
              {product.original_price && (
                <span className="text-xl text-gray-500 line-through">
                  ${product.original_price.toFixed(2)}
                </span>
              )}
              {discountPercentage > 0 && (
                <Badge className="bg-red-100 text-red-800">
                  {language === "ar" ? "وفر" : "Save"} {discountPercentage}%
                </Badge>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stock_quantity > 0 ? (
                <>
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-green-600 font-medium">
                    {language === "ar" ? "متوفر في المخزون" : "In Stock"}
                  </span>
                  {product.stock_quantity < 10 && (
                    <span className="text-orange-600 text-sm">
                      ({product.stock_quantity}{" "}
                      {language === "ar" ? "متبقي" : "left"})
                    </span>
                  )}
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-600 font-medium">
                    {language === "ar" ? "نفدت الكمية" : "Out of Stock"}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {language === "ar" ? "الوصف" : "Description"}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {language === "ar"
                  ? product.description_ar
                  : product.description}
              </p>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {language === "ar" ? "العلامات" : "Tags"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {language === "ar" ? "الكمية" : "Quantity"}
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setQuantity(
                        Math.min(product.stock_quantity, quantity + 1)
                      )
                    }
                    disabled={quantity >= product.stock_quantity}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <span className="text-sm text-gray-500">
                  {language === "ar" ? "الحد الأقصى:" : "Max:"}{" "}
                  {product.stock_quantity}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex gap-3">
                {isInCart ? (
                  <Button
                    size="lg"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleRemoveFromCart}
                    disabled={isAddingToCart}
                  >
                    {isAddingToCart ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {language === "ar" ? "جاري الحذف..." : "Removing..."}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5" />
                        {language === "ar"
                          ? "حذف من السلة"
                          : "Delete from Cart"}
                      </div>
                    )}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || product.stock_quantity === 0}
                  >
                    {isAddingToCart ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {language === "ar" ? "جاري الإضافة..." : "Adding..."}
                      </div>
                    ) : product.stock_quantity === 0 ? (
                      language === "ar" ? (
                        "نفدت الكمية"
                      ) : (
                        "Out of Stock"
                      )
                    ) : (
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5" />
                        {language === "ar" ? "أضف للسلة" : "Add to Cart"} - $
                        {(product.price * quantity).toFixed(2)}
                      </div>
                    )}
                  </Button>
                )}
                <Button
                  size="lg"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleBuyNow}
                  disabled={isAddingToCart || product.stock_quantity === 0}
                >
                  {isAddingToCart ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {language === "ar" ? "جاري الشراء..." : "Processing..."}
                    </div>
                  ) : product.stock_quantity === 0 ? (
                    language === "ar" ? (
                      "نفدت الكمية"
                    ) : (
                      "Out of Stock"
                    )
                  ) : (
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      {language === "ar" ? "اشتري الآن" : "Buy Now"}
                    </div>
                  )}
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={handleWishlist}
                >
                  <Heart
                    className={`w-5 h-5 mr-2 ${
                      isWishlisted ? "fill-current text-red-500" : ""
                    }`}
                  />
                  {language === "ar" ? "المفضلة" : "Wishlist"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={handleShare}
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  {language === "ar" ? "مشاركة" : "Share"}
                </Button>
              </div>
            </div>

            {/* Product Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium">
                  {language === "ar" ? "جودة أصيلة" : "Authentic Quality"}
                </p>
              </div>
              <div className="text-center">
                <Truck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium">
                  {language === "ar" ? "شحن مجاني" : "Free Shipping"}
                </p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium">
                  {language === "ar" ? "إرجاع سهل" : "Easy Returns"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="reviews" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="reviews">
                {language === "ar" ? "التقييمات" : "Reviews"} ({reviews.length})
              </TabsTrigger>
              <TabsTrigger value="details">
                {language === "ar" ? "التفاصيل" : "Details"}
              </TabsTrigger>
              <TabsTrigger value="shipping">
                {language === "ar" ? "الشحن" : "Shipping"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">
                    {language === "ar" ? "تقييمات العملاء" : "Customer Reviews"}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Math.round(averageRating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-semibold">
                      {averageRating.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="grid gap-6">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-green-100 text-green-700">
                              {review.customer_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold">
                                  {review.customer_name}
                                </h4>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`w-4 h-4 ${
                                          star <= review.rating
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  {review.is_verified && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs bg-green-100 text-green-700"
                                    >
                                      {language === "ar"
                                        ? "مشتري موثق"
                                        : "Verified Purchase"}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(
                                  review.created_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                              {review.review_text}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">
                        {language === "ar"
                          ? "مواصفات المنتج"
                          : "Product Specifications"}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {language === "ar" ? "المادة:" : "Material:"}
                          </span>
                          <span>100% Cotton</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {language === "ar" ? "الحجم:" : "Size:"}
                          </span>
                          <span>120cm x 120cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {language === "ar" ? "الوزن:" : "Weight:"}
                          </span>
                          <span>200g</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {language === "ar" ? "المنشأ:" : "Origin:"}
                          </span>
                          <span>Palestine</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {language === "ar" ? "العناية:" : "Care:"}
                          </span>
                          <span>
                            {language === "ar" ? "غسيل يدوي" : "Hand wash"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">
                        {language === "ar" ? "الميزات" : "Features"}
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600" />
                          {language === "ar"
                            ? "نسج تقليدي يدوي"
                            : "Traditional hand-woven"}
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600" />
                          {language === "ar"
                            ? "قطن عالي الجودة"
                            : "Premium cotton quality"}
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600" />
                          {language === "ar"
                            ? "نمط فلسطيني أصيل"
                            : "Authentic Palestinian pattern"}
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600" />
                          {language === "ar"
                            ? "خيوط مقاومة للبهتان"
                            : "Fade-resistant threads"}
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shipping" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">
                        {language === "ar"
                          ? "معلومات الشحن"
                          : "Shipping Information"}
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-blue-600" />
                          <span>
                            {language === "ar"
                              ? "شحن مجاني للطلبات فوق $50"
                              : "Free shipping on orders over $50"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span>
                            {language === "ar"
                              ? "تأمين شامل للشحنة"
                              : "Full shipping insurance"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <RotateCcw className="w-4 h-4 text-purple-600" />
                          <span>
                            {language === "ar"
                              ? "إرجاع مجاني خلال 30 يوم"
                              : "Free returns within 30 days"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">
                        {language === "ar" ? "أوقات التسليم" : "Delivery Times"}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {language === "ar" ? "محلي:" : "Local:"}
                          </span>
                          <span>2-3 {language === "ar" ? "أيام" : "days"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {language === "ar" ? "دولي:" : "International:"}
                          </span>
                          <span>7-14 {language === "ar" ? "يوم" : "days"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {language === "ar" ? "سريع:" : "Express:"}
                          </span>
                          <span>1-2 {language === "ar" ? "أيام" : "days"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8">
              {language === "ar" ? "منتجات ذات صلة" : "Related Products"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  language={language}
                  onCartUpdate={loadCartCount}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
