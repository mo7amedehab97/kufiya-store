"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Shield,
  Truck,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { LanguageSwitcher } from "@/components/language-switcher";
import { CouponInput } from "@/components/coupon-input";
import { ShippingSelector } from "@/components/shipping-selector";
import {
  validateCardNumber,
  validateCVV,
  validateExpiryDate,
  getCardType,
} from "@/lib/card-validation";
import { getCartItems, clearCart, type CartSummary } from "@/lib/cart";
import { supabase } from "@/lib/supabase";
import { type Language, t, getLanguageDirection } from "@/lib/i18n";
import SpecialLoader from "@/components/SpecialLoader";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("en");
  const [cart, setCart] = useState<CartSummary>({
    items: [],
    subtotal: 0,
    itemCount: 0,
    totalQuantity: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    // Customer Info
    firstName: "",
    lastName: "",
    email: "",
    phone: "",

    // Shipping Address
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",

    // Payment Info
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
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
    try {
      const cartData = await getCartItems();
      setCart(cartData);

      if (cartData.items.length === 0) {
        // If cart is empty, redirect to store
        router.push(`/?lang=${language}`);
        return;
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Real-time validation for card fields
    if (field === "cardNumber") {
      const isValid = validateCardNumber(value);
      if (value && !isValid) {
        setFormErrors((prev) => ({
          ...prev,
          cardNumber:
            language === "ar" ? "رقم البطاقة غير صحيح" : "Invalid card number",
        }));
      }
    } else if (field === "cvv") {
      const cardType = getCardType(formData.cardNumber || "");
      const isValid = validateCVV(value, cardType?.name || "");
      if (value && !isValid) {
        setFormErrors((prev) => ({
          ...prev,
          cvv: language === "ar" ? "رمز الأمان غير صحيح" : "Invalid CVV",
        }));
      }
    } else if (field === "expiryDate") {
      const isValid = validateExpiryDate(value);
      if (value && !isValid) {
        setFormErrors((prev) => ({
          ...prev,
          expiryDate:
            language === "ar"
              ? "تاريخ انتهاء الصلاحية غير صحيح"
              : "Invalid expiry date",
        }));
      }
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Required fields
    const requiredFields = {
      firstName:
        language === "ar" ? "الاسم الأول مطلوب" : "First name is required",
      lastName:
        language === "ar" ? "اسم العائلة مطلوب" : "Last name is required",
      email:
        language === "ar" ? "البريد الإلكتروني مطلوب" : "Email is required",
      phone:
        language === "ar" ? "رقم الهاتف مطلوب" : "Phone number is required",
      address: language === "ar" ? "العنوان مطلوب" : "Address is required",
      city: language === "ar" ? "المدينة مطلوبة" : "City is required",
      zipCode:
        language === "ar" ? "الرمز البريدي مطلوب" : "ZIP code is required",
      cardNumber:
        language === "ar" ? "رقم البطاقة مطلوب" : "Card number is required",
      expiryDate:
        language === "ar"
          ? "تاريخ انتهاء الصلاحية مطلوب"
          : "Expiry date is required",
      cvv: language === "ar" ? "رمز الأمان مطلوب" : "CVV is required",
      cardholderName:
        language === "ar"
          ? "اسم حامل البطاقة مطلوب"
          : "Cardholder name is required",
    };

    Object.entries(requiredFields).forEach(([field, message]) => {
      if (!formData[field as keyof typeof formData]) {
        errors[field] = message;
      }
    });

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email =
        language === "ar"
          ? "البريد الإلكتروني غير صحيح"
          : "Invalid email address";
    }

    // Card validations
    if (formData.cardNumber && !validateCardNumber(formData.cardNumber)) {
      errors.cardNumber =
        language === "ar" ? "رقم البطاقة غير صحيح" : "Invalid card number";
    }

    if (formData.cvv) {
      const cardType = getCardType(formData.cardNumber || "");
      if (!validateCVV(formData.cvv, cardType?.name || "").isValid) {
        errors.cvv = language === "ar" ? "رمز الأمان غير صحيح" : "Invalid CVV";
      }
    }

    if (formData.expiryDate && !validateExpiryDate(formData.expiryDate)) {
      errors.expiryDate =
        language === "ar"
          ? "تاريخ انتهاء الصلاحية غير صحيح"
          : "Invalid expiry date";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: language === "ar" ? "خطأ في النموذج" : "Form Error",
        description:
          language === "ar"
            ? "يرجى تصحيح الأخطاء المحددة"
            : "Please correct the highlighted errors",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Calculate totals
      const subtotal = cart.subtotal;
      const couponDiscount = appliedCoupon?.discountAmount || 0;
      const shippingCost = selectedShipping?.price || 0;
      const tax = (subtotal - couponDiscount + shippingCost) * 0.08;
      const total = subtotal - couponDiscount + shippingCost + tax;

      // Create order in database
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: `${formData.firstName} ${formData.lastName}`,
          customer_email: formData.email,
          customer_phone: formData.phone,
          shipping_address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`,
          payment_method: "credit_card",
          card_last_four: formData.cardNumber.slice(-4),
          card_type: getCardType(formData.cardNumber || "")?.name || "",
          subtotal: subtotal,
          shipping_cost: shippingCost,
          tax_amount: tax,
          discount_amount: couponDiscount,
          total_amount: total,
          coupon_code: appliedCoupon?.code || null,
          shipping_method: selectedShipping?.name || "Standard",
          order_status: "confirmed",
          payment_status: "paid",
        })
        .select()
        .single();

      if (orderError) {
        throw new Error(orderError.message);
      }

      // Create order items
      const orderItems = cart.items.map((item) => ({
        order_id: orderData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        product_name: item.product?.name || "",
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        throw new Error(itemsError.message);
      }

      // Update product stock
      for (const item of cart.items) {
        if (item.product) {
          await supabase
            .from("products")
            .update({
              stock_quantity: Math.max(
                0,
                item.product.stock_quantity - item.quantity
              ),
            })
            .eq("id", item.product_id);
        }
      }

      // Update coupon usage if applied
      if (appliedCoupon) {
        await supabase
          .from("coupons")
          .update({
            used_count: appliedCoupon.used_count + 1,
          })
          .eq("id", appliedCoupon.id);
      }

      // Clear cart
      await clearCart();

      // Redirect to success page
      router.push(`/payment/success?order=${orderData.id}&lang=${language}`);
    } catch (error) {
      console.error("Error processing order:", error);
      toast({
        title: language === "ar" ? "خطأ في المعالجة" : "Processing Error",
        description:
          language === "ar"
            ? "حدث خطأ أثناء معالجة طلبك"
            : "An error occurred while processing your order",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate totals
  const subtotal = cart.subtotal;
  const couponDiscount = appliedCoupon?.discountAmount || 0;
  const shippingCost = selectedShipping?.price || 0;
  const tax = (subtotal - couponDiscount + shippingCost) * 0.08;
  const total = subtotal - couponDiscount + shippingCost + tax;

  const cardType = getCardType(formData.cardNumber);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <SpecialLoader fullscreen={false} />
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
          <div className="flex items-center gap-4">
            <Link
              href={`/cart?lang=${language}`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              {language === "ar" ? "العودة للسلة" : "Back to Cart"}
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-6 rounded-sm overflow-hidden shadow-sm">
                <Image
                  src="/images/palestine-flag.png"
                  alt="Palestinian Flag"
                  width={32}
                  height={24}
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-lg font-bold text-gray-900">
                {t("store_name", language)}
              </h1>
            </div>
          </div>
          <LanguageSwitcher
            currentLang={language}
            onLanguageChange={handleLanguageChange}
          />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {language === "ar" ? "إتمام الطلب" : "Complete Your Order"}
            </h1>
            <p className="text-gray-600">
              {language === "ar"
                ? "خطوة واحدة فقط لإتمام طلبك"
                : "Just one step away from your beautiful kufiya"}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-semibold">1</span>
                      </div>
                      {language === "ar"
                        ? "معلومات العميل"
                        : "Customer Information"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">
                          {language === "ar" ? "الاسم الأول" : "First Name"} *
                        </Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) =>
                            handleInputChange("firstName", e.target.value)
                          }
                          className={
                            formErrors.firstName ? "border-red-500" : ""
                          }
                        />
                        {formErrors.firstName && (
                          <p className="text-red-500 text-sm mt-1">
                            {formErrors.firstName}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="lastName">
                          {language === "ar" ? "اسم العائلة" : "Last Name"} *
                        </Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) =>
                            handleInputChange("lastName", e.target.value)
                          }
                          className={
                            formErrors.lastName ? "border-red-500" : ""
                          }
                        />
                        {formErrors.lastName && (
                          <p className="text-red-500 text-sm mt-1">
                            {formErrors.lastName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">
                          {language === "ar" ? "البريد الإلكتروني" : "Email"} *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          className={formErrors.email ? "border-red-500" : ""}
                        />
                        {formErrors.email && (
                          <p className="text-red-500 text-sm mt-1">
                            {formErrors.email}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="phone">
                          {language === "ar" ? "رقم الهاتف" : "Phone Number"} *
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          className={formErrors.phone ? "border-red-500" : ""}
                        />
                        {formErrors.phone && (
                          <p className="text-red-500 text-sm mt-1">
                            {formErrors.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-semibold">2</span>
                      </div>
                      {language === "ar" ? "عنوان الشحن" : "Shipping Address"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="address">
                        {language === "ar" ? "العنوان" : "Address"} *
                      </Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        className={formErrors.address ? "border-red-500" : ""}
                        placeholder={
                          language === "ar" ? "الشارع والرقم" : "Street address"
                        }
                      />
                      {formErrors.address && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.address}
                        </p>
                      )}
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">
                          {language === "ar" ? "المدينة" : "City"} *
                        </Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) =>
                            handleInputChange("city", e.target.value)
                          }
                          className={formErrors.city ? "border-red-500" : ""}
                        />
                        {formErrors.city && (
                          <p className="text-red-500 text-sm mt-1">
                            {formErrors.city}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="state">
                          {language === "ar"
                            ? "الولاية/المحافظة"
                            : "State/Province"}
                        </Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) =>
                            handleInputChange("state", e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="zipCode">
                          {language === "ar"
                            ? "الرمز البريدي"
                            : "ZIP/Postal Code"}{" "}
                          *
                        </Label>
                        <Input
                          id="zipCode"
                          value={formData.zipCode}
                          onChange={(e) =>
                            handleInputChange("zipCode", e.target.value)
                          }
                          className={formErrors.zipCode ? "border-red-500" : ""}
                        />
                        {formErrors.zipCode && (
                          <p className="text-red-500 text-sm mt-1">
                            {formErrors.zipCode}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="country">
                          {language === "ar" ? "البلد" : "Country"} *
                        </Label>
                        <Select
                          value={formData.country}
                          onValueChange={(value) =>
                            handleInputChange("country", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="US">United States</SelectItem>
                            <SelectItem value="CA">Canada</SelectItem>
                            <SelectItem value="GB">United Kingdom</SelectItem>
                            <SelectItem value="DE">Germany</SelectItem>
                            <SelectItem value="FR">France</SelectItem>
                            <SelectItem value="AU">Australia</SelectItem>
                            <SelectItem value="PS">Palestine</SelectItem>
                            <SelectItem value="JO">Jordan</SelectItem>
                            <SelectItem value="LB">Lebanon</SelectItem>
                            <SelectItem value="SY">Syria</SelectItem>
                            <SelectItem value="EG">Egypt</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-semibold">3</span>
                      </div>
                      {language === "ar"
                        ? "معلومات الدفع"
                        : "Payment Information"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="cardholderName">
                        {language === "ar"
                          ? "اسم حامل البطاقة"
                          : "Cardholder Name"}{" "}
                        *
                      </Label>
                      <Input
                        id="cardholderName"
                        value={formData.cardholderName}
                        onChange={(e) =>
                          handleInputChange("cardholderName", e.target.value)
                        }
                        className={
                          formErrors.cardholderName ? "border-red-500" : ""
                        }
                        placeholder={
                          language === "ar"
                            ? "الاسم كما يظهر على البطاقة"
                            : "Name as it appears on card"
                        }
                      />
                      {formErrors.cardholderName && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.cardholderName}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="cardNumber">
                        {language === "ar" ? "رقم البطاقة" : "Card Number"} *
                      </Label>
                      <div className="relative">
                        <Input
                          id="cardNumber"
                          value={formData.cardNumber}
                          onChange={(e) =>
                            handleInputChange(
                              "cardNumber",
                              e.target.value.replace(/\s/g, "")
                            )
                          }
                          className={`${
                            formErrors.cardNumber ? "border-red-500" : ""
                          } pr-12`}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                        />
                        {cardType && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <CreditCard className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      {formErrors.cardNumber && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.cardNumber}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">
                          {language === "ar"
                            ? "تاريخ انتهاء الصلاحية"
                            : "Expiry Date"}{" "}
                          *
                        </Label>
                        <Input
                          id="expiryDate"
                          value={formData.expiryDate}
                          onChange={(e) =>
                            handleInputChange("expiryDate", e.target.value)
                          }
                          className={
                            formErrors.expiryDate ? "border-red-500" : ""
                          }
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                        {formErrors.expiryDate && (
                          <p className="text-red-500 text-sm mt-1">
                            {formErrors.expiryDate}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="cvv">
                          {language === "ar" ? "رمز الأمان" : "CVV"} *
                        </Label>
                        <Input
                          id="cvv"
                          value={formData.cvv}
                          onChange={(e) =>
                            handleInputChange("cvv", e.target.value)
                          }
                          className={formErrors.cvv ? "border-red-500" : ""}
                          placeholder="123"
                          maxLength={4}
                        />
                        {formErrors.cvv && (
                          <p className="text-red-500 text-sm mt-1">
                            {formErrors.cvv}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary Sidebar */}
              <div className="space-y-6">
                {/* Cart Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      {language === "ar" ? "طلبك" : "Your Order"} (
                      {cart.itemCount})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cart.items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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
                          <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2">
                            {language === "ar"
                              ? item.product?.name_ar
                              : item.product?.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            ${item.price.toFixed(2)} each
                          </p>
                          <p className="font-semibold text-sm">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Coupon */}
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

                {/* Shipping */}
                <Card>
                  <CardContent className="p-4">
                    <ShippingSelector
                      onShippingChange={setSelectedShipping}
                      selectedMethod={selectedShipping}
                      language={language}
                    />
                  </CardContent>
                </Card>

                {/* Order Total */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {language === "ar" ? "ملخص الطلب" : "Order Summary"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>
                        {language === "ar" ? "المجموع الفرعي" : "Subtotal"}
                      </span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>
                          {language === "ar" ? "الخصم" : "Discount"} (
                          {appliedCoupon.code})
                        </span>
                        <span>-${couponDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>{language === "ar" ? "الشحن" : "Shipping"}</span>
                      <span
                        className={shippingCost === 0 ? "text-green-600" : ""}
                      >
                        {shippingCost === 0
                          ? language === "ar"
                            ? "مجاني"
                            : "Free"
                          : `$${shippingCost.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{language === "ar" ? "الضريبة" : "Tax"}</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>{language === "ar" ? "المجموع" : "Total"}</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {language === "ar" ? "جاري المعالجة..." : "Processing..."}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      {language === "ar" ? "إتمام الطلب" : "Complete Order"} - $
                      {total.toFixed(2)}
                    </div>
                  )}
                </Button>

                {/* Security Notice */}
                <div className="text-center text-xs text-gray-500 space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <Shield className="w-3 h-3" />
                    <span>
                      {language === "ar"
                        ? "دفع آمن ومشفر"
                        : "Secure & encrypted payment"}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Truck className="w-3 h-3" />
                    <span>
                      {language === "ar"
                        ? "شحن سريع وموثوق"
                        : "Fast & reliable shipping"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
