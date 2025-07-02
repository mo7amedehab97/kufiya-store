"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, AlertCircle, Tag } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { type Language, t } from "@/lib/i18n"

interface CouponInputProps {
  onCouponApplied: (coupon: any) => void
  onCouponRemoved: () => void
  appliedCoupon: any
  orderAmount: number
  language: Language
}

export function CouponInput({
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon,
  orderAmount,
  language,
}: CouponInputProps) {
  const [couponCode, setCouponCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const applyCoupon = async () => {
    if (!couponCode.trim()) return

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // Check if coupon exists and is valid
      const { data: coupon, error: couponError } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase())
        .eq("is_active", true)
        .single()

      if (couponError || !coupon) {
        setError(t("invalid_coupon", language))
        setIsLoading(false)
        return
      }

      // Check if coupon has expired
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        setError(t("invalid_coupon", language))
        setIsLoading(false)
        return
      }

      // Check if coupon has reached max uses
      if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
        setError(t("invalid_coupon", language))
        setIsLoading(false)
        return
      }

      // Check minimum order amount
      if (coupon.min_order_amount && orderAmount < coupon.min_order_amount) {
        setError(`Minimum order amount is $${coupon.min_order_amount}`)
        setIsLoading(false)
        return
      }

      // Calculate discount
      let discountAmount = 0
      if (coupon.discount_type === "percentage") {
        discountAmount = (orderAmount * coupon.discount_value) / 100
      } else {
        discountAmount = coupon.discount_value
      }

      // Don't allow discount to exceed order amount
      discountAmount = Math.min(discountAmount, orderAmount)

      setSuccess(t("coupon_applied", language))
      onCouponApplied({ ...coupon, discountAmount })
      setCouponCode("")
    } catch (err) {
      setError(t("invalid_coupon", language))
    } finally {
      setIsLoading(false)
    }
  }

  const removeCoupon = () => {
    onCouponRemoved()
    setSuccess("")
    setError("")
  }

  return (
    <div className="space-y-3">
      {!appliedCoupon ? (
        <div className="space-y-2">
          <Label htmlFor="couponCode" className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            {t("coupon_code", language)}
          </Label>
          <div className="flex gap-2">
            <Input
              id="couponCode"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="WELCOME10"
              className="flex-1"
            />
            <Button onClick={applyCoupon} disabled={isLoading || !couponCode.trim()} variant="outline">
              {isLoading ? "..." : t("apply_coupon", language)}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-green-800 font-medium">
              {appliedCoupon.code} - ${appliedCoupon.discountAmount.toFixed(2)} {t("discount", language)}
            </span>
          </div>
          <Button onClick={removeCoupon} variant="ghost" size="sm" className="text-green-700 hover:text-green-900">
            ×
          </Button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle className="w-4 h-4" />
          {success}
        </div>
      )}
    </div>
  )
}
