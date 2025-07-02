"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import {
  addToCart,
  removeFromCart,
  type Product,
  type CartItem,
} from "@/lib/cart";
import type { Language } from "@/lib/i18n";

interface ProductCardProps {
  product: Product;
  language: Language;
  onCartUpdate?: () => void;
}

function getCartFromStorage() {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem("kufiya_cart_items");
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function ProductCard({
  product,
  language,
  onCartUpdate,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const [isInCart, setIsInCart] = useState(false);

  // On mount, sync optimisticCart with real cart
  useEffect(() => {
    const cart = getCartFromStorage();
    setIsInCart(cart.some((item: CartItem) => item.product_id === product.id));
  }, [product.id]);

  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsProcessing(true);
    try {
      const result = await addToCart(product, 1);
      if (!result.success) {
        toast({
          title: language === "ar" ? "خطأ" : "Error",
          description:
            result.error ||
            (language === "ar"
              ? "فشل في إضافة المنتج"
              : "Failed to add product"),
          variant: "destructive",
        });
      } else {
        toast({
          title: language === "ar" ? "تمت الإضافة للسلة" : "Added to Cart",
          description:
            language === "ar"
              ? `تم إضافة ${product.name_ar} إلى سلة التسوق`
              : `${product.name} has been added to your cart`,
        });
        onCartUpdate?.();
        setIsInCart(true);
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
      setIsProcessing(false);
    }
  };

  const handleRemoveFromCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsProcessing(true);
    // Find the cart item id
    const cart = getCartFromStorage();
    const cartItem = cart.find(
      (item: CartItem) => item.product_id === product.id
    );
    if (!cartItem) {
      setIsProcessing(false);
      return;
    }
    try {
      const result = await removeFromCart(cartItem.id);
      if (!result.success) {
        toast({
          title: language === "ar" ? "خطأ" : "Error",
          description:
            result.error ||
            (language === "ar" ? "فشل في حذف المنتج" : "Failed to remove item"),
          variant: "destructive",
        });
      } else {
        toast({
          title: language === "ar" ? "تم الحذف" : "Item Removed",
          description:
            language === "ar"
              ? `تم حذف ${product.name_ar} من السلة`
              : `${product.name} removed from cart`,
        });
        onCartUpdate?.();
        setIsInCart(false);
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
      setIsProcessing(false);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

  const discountPercentage = product.original_price
    ? Math.round(
        ((product.original_price - product.price) / product.original_price) *
          100
      )
    : 0;

  return (
    <Card
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.id}?lang=${language}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {/* Product Images */}
          <Image
            src={isHovered ? product.image_hover : product.image_primary}
            alt={language === "ar" ? product.name_ar : product.name}
            fill
            className="object-cover transition-all duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
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
            {product.stock_quantity < 10 && product.stock_quantity > 0 && (
              <Badge variant="outline" className="bg-white/90">
                {language === "ar" ? "كمية محدودة" : "Limited Stock"}
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm transition-all duration-200 hover:bg-white hover:scale-110 ${
              isWishlisted ? "text-red-500" : "text-gray-600"
            }`}
            onClick={handleWishlist}
          >
            <Heart
              className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`}
            />
          </Button>

          {/* Quick Add to Cart - Shows on Hover */}
          <div
            className={`absolute bottom-3 left-3 right-3 transition-all duration-300 ${
              isHovered
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2"
            }`}
          >
            <Button
              onClick={isInCart ? handleRemoveFromCart : handleAddToCart}
              disabled={isProcessing || product.stock_quantity === 0}
              className={`w-full ${
                isInCart
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              } text-white`}
              size="sm"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {language === "ar"
                    ? isInCart
                      ? "جاري الحذف..."
                      : "جاري الإضافة..."
                    : isInCart
                    ? "Removing..."
                    : "Adding..."}
                </div>
              ) : product.stock_quantity === 0 ? (
                language === "ar" ? (
                  "نفدت الكمية"
                ) : (
                  "Out of Stock"
                )
              ) : isInCart ? (
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  {language === "ar" ? "إزالة من السلة" : "Remove from Cart"}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  {language === "ar" ? "أضف للسلة" : "Add to Cart"}
                </div>
              )}
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Product Name */}
          <h3 className="font-semibold text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
            {language === "ar" ? product.name_ar : product.name}
          </h3>

          {/* Rating (placeholder for now) */}
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="w-3 h-3 fill-yellow-400 text-yellow-400"
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">(4.8)</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-lg text-green-600">
              ${product.price.toFixed(2)}
            </span>
            {product.original_price && (
              <span className="text-sm text-gray-500 line-through">
                ${product.original_price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}
