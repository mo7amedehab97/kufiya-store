"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Plus, Minus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LanguageSwitcher } from "@/components/language-switcher";
import { CouponInput } from "@/components/coupon-input";
import { ShippingSelector } from "@/components/shipping-selector";
import { toast } from "@/hooks/use-toast";
import {
  getCartItems,
  updateCartItemQuantity,
  removeFromCart,
  validateCart,
  type CartSummary,
} from "@/lib/cart";
import { type Language, t, getLanguageDirection } from "@/lib/i18n";

export default function CartPage() {
  const searchParams = useSearchParams();
  const [language, setLanguage] = useState<Language>("en");
  const [cart, setCart] = useState<CartSummary>({
    items: [],
    subtotal: 0,
    itemCount: 0,
    totalQuantity: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [selectedShipping, setSelectedShipping] = useState<any>(null);

  useEffect(() => {
    // Load language from URL params or localStorage
    const langParam = searchParams.get("lang") as Language;
    const savedLang = localStorage.getItem("language") as Language;

    const initialLang = langParam || savedLang || "en";
    if (initialLang === "en" || initialLang === "ar") {
      setLanguage(initialLang);
      document.documentElement.dir = getLanguageDirection(initialLang);
      document.documentElement.lang = initialLang;
    }

    loadCart();
  }, [searchParams]);

  const loadCart = async () => {
    setIsLoading(true);
    try {
      const cartData = await getCartItems();
      setCart(cartData);

      // Validate cart
      const validation = await validateCart();
      if (!validation.isValid) {
        validation.errors.forEach((error) => {
          toast({
            title: language === "ar" ? "تحديث السلة" : "Cart Updated",
            description: error,
            variant: "destructive",
          });
        });
        // Reload cart after validation updates
        const updatedCart = await getCartItems();
        setCart(updatedCart);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
    document.documentElement.dir = getLanguageDirection(lang);
    document.documentElement.lang = lang;
  };

  const handleQuantityChange = async (
    cartItemId: number,
    newQuantity: number
  ) => {
    try {
      const result = await updateCartItemQuantity(cartItemId, newQuantity);

      if (result.success) {
        await loadCart();
        toast({
          title: language === "ar" ? "تم التحديث" : "Updated",
          description:
            language === "ar"
              ? "تم تحديث كمية المنتج"
              : "Product quantity updated",
        });
      } else {
        toast({
          title: language === "ar" ? "خطأ" : "Error",
          description:
            result.error ||
            (language === "ar"
              ? "فشل في تحديث الكمية"
              : "Failed to update quantity"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description:
          language === "ar"
            ? "حدث خطأ غير متوقع"
            : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleRemoveItem = async (cartItemId: number, productName: string) => {
    try {
      const result = await removeFromCart(cartItemId);

      if (result.success) {
        await loadCart();
        toast({
          title: language === "ar" ? "تم الحذف" : "Item Removed",
          description:
            language === "ar"
              ? `تم حذف ${productName} من السلة`
              : `${productName} removed from cart`,
        });
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
      console.error("Error removing item:", error);
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description:
          language === "ar"
            ? "حدث خطأ غير متوقع"
            : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  // Calculate totals
  const subtotal = cart.subtotal;
  const couponDiscount = appliedCoupon?.discountAmount || 0;
  const shippingCost = selectedShipping?.price || 0;
  const tax = (subtotal - couponDiscount + shippingCost) * 0.08;
  const total = subtotal - couponDiscount + shippingCost + tax;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-green-50 to-white"
      dir={getLanguageDirection(language)}
    >
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            href={`/?lang=${language}`}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            {t("back_to_store", language)}
          </Link>
          <LanguageSwitcher
            currentLang={language}
            onLanguageChange={handleLanguageChange}
          />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {cart.items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {language === "ar" ? "سلة التسوق فارغة" : "Your cart is empty"}
            </h1>
            <p className="text-gray-600 mb-8">
              {language === "ar"
                ? "ابدأ بإضافة بعض الكوفيات الجميلة إلى سلتك!"
                : "Start adding some beautiful kufiyas to your cart!"}
            </p>
            <Link href={`/?lang=${language}`}>
              <Button className="bg-green-600 hover:bg-green-700">
                {language === "ar" ? "تسوق الآن" : "Start Shopping"}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              {language === "ar" ? "سلة التسوق" : "Shopping Cart"} (
              {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"})
            </h1>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.items.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={
                              item.product?.image_primary || "/placeholder.svg"
                            }
                            alt={
                              language === "ar"
                                ? item.product?.name_ar || ""
                                : item.product?.name || ""
                            }
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {language === "ar"
                                  ? item.product?.name_ar
                                  : item.product?.name}
                              </h3>
                              <p className="text-gray-600 text-sm">
                                SKU: {item.product?.sku} •{" "}
                                {language === "ar" ? "متوفر" : "In Stock"}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() =>
                                handleRemoveItem(
                                  item.id,
                                  language === "ar"
                                    ? item.product?.name_ar || ""
                                    : item.product?.name || ""
                                )
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    item.quantity - 1
                                  )
                                }
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-12 text-center font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    item.quantity + 1
                                  )
                                }
                                disabled={
                                  item.quantity >=
                                  (item.product?.stock_quantity || 0)
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            <div className="text-right">
                              <p className="text-sm text-gray-500">
                                ${item.price.toFixed(2)} each
                              </p>
                              <p className="font-semibold text-lg">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {language === "ar" ? "ملخص الطلب" : "Order Summary"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>
                          {language === "ar" ? "المجموع الفرعي" : "Subtotal"}
                        </span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      {appliedCoupon && (
                        <div className="flex justify-between text-green-600">
                          <span>
                            {t("discount", language)} ({appliedCoupon.code})
                          </span>
                          <span>-${couponDiscount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>{language === "ar" ? "الشحن" : "Shipping"}</span>
                        <span
                          className={shippingCost === 0 ? "text-green-600" : ""}
                        >
                          {shippingCost === 0
                            ? t("free", language)
                            : `$${shippingCost.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{language === "ar" ? "الضريبة" : "Tax"}</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>{language === "ar" ? "المجموع" : "Total"}</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Coupon Input */}
                <Card>
                  <CardContent className="p-4">
                    <CouponInput
                      onCouponApplied={setAppliedCoupon}
                      onCouponRemoved={() => setAppliedCoupon(null)}
                      appliedCoupon={appliedCoupon}
                      orderAmount={subtotal}
                      language={language}
                    />
                  </CardContent>
                </Card>

                {/* Shipping Selector */}
                <Card>
                  <CardContent className="p-4">
                    <ShippingSelector
                      onShippingChange={setSelectedShipping}
                      selectedMethod={selectedShipping}
                      language={language}
                    />
                  </CardContent>
                </Card>

                {/* Checkout Button */}
                <Link href={`/payment?lang=${language}`}>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    {language === "ar" ? "متابعة للدفع" : "Proceed to Checkout"}{" "}
                    - ${total.toFixed(2)}
                  </Button>
                </Link>

                <div className="text-center text-sm text-gray-500">
                  {language === "ar"
                    ? "دفع آمن ومشفر"
                    : "Secure and encrypted payment"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
