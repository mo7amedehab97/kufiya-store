"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCartIcon as CartIcon,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import {
  getCartItems,
  updateCartItemQuantity,
  removeFromCart,
  type CartSummary,
} from "@/lib/cart";
import type { Language } from "@/lib/i18n";
import SpecialLoader from "@/components/SpecialLoader";

interface ShoppingCartProps {
  language: Language;
  cartItemCount: number;
  onCartUpdate: () => void;
}

export function ShoppingCart({
  language,
  cartItemCount,
  onCartUpdate,
}: ShoppingCartProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState<CartSummary>({
    items: [],
    subtotal: 0,
    itemCount: 0,
    totalQuantity: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadCart = async () => {
    setIsLoading(true);
    try {
      const cartData = await getCartItems();
      setCart(cartData);
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCart();
    }
  }, [isOpen]);

  const handleQuantityChange = async (
    cartItemId: number,
    newQuantity: number
  ) => {
    try {
      const result = await updateCartItemQuantity(cartItemId, newQuantity);

      if (result.success) {
        await loadCart();
        onCartUpdate();
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

  const handleRemoveItem = async (cartItemId: number) => {
    try {
      const result = await removeFromCart(cartItemId);

      if (result.success) {
        await loadCart();
        onCartUpdate();
        toast({
          title: language === "ar" ? "تم الحذف" : "Item Removed",
          description:
            language === "ar"
              ? "تم حذف المنتج من السلة"
              : "Item removed from cart",
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

  const tax = cart.subtotal * 0.08;
  const total = cart.subtotal + tax;
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <CartIcon className="h-4 w-4" />
          {cartItemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-green-600 text-white text-xs">
              {cartItemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <CartIcon className="h-5 w-5" />
            {language === "ar" ? "سلة التسوق" : "Shopping Cart"}
            {cart.itemCount > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <SpecialLoader fullscreen={false} />
            </div>
          ) : cart.items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <CartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {language === "ar" ? "السلة فارغة" : "Your cart is empty"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {language === "ar"
                    ? "ابدأ بإضافة بعض الكوفيات الجميلة!"
                    : "Start adding some beautiful kufiyas!"}
                </p>
                <Button
                  onClick={() => setIsOpen(false)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {language === "ar" ? "تسوق الآن" : "Start Shopping"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 border rounded-lg"
                  >
                    <div className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={item.product?.image_primary || "/placeholder.svg"}
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
                      <h4 className="font-medium text-sm line-clamp-2">
                        {language === "ar"
                          ? item.product?.name_ar
                          : item.product?.name}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        ${item.price.toFixed(2)} each
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          disabled={
                            item.quantity >= (item.product?.stock_quantity || 0)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <p className="font-semibold text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="border-t pt-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      {language === "ar" ? "المجموع الفرعي" : "Subtotal"}
                    </span>
                    <span>${cart.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{language === "ar" ? "الضريبة" : "Tax"}</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>{language === "ar" ? "المجموع" : "Total"}</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Link
                    href={`/cart?lang=${language}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Button variant="outline" className="w-full">
                      {language === "ar" ? "عرض السلة" : "View Cart"}
                    </Button>
                  </Link>
                  <Link
                    href={`/payment?lang=${language}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      {language === "ar" ? "الدفع" : "Checkout"} - $
                      {total.toFixed(2)}
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
