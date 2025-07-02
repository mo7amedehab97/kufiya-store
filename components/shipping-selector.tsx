"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Truck, Clock, Zap } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { type Language, t } from "@/lib/i18n"

interface ShippingMethod {
  id: number
  name: string
  name_ar: string
  description: string
  description_ar: string
  price: number
  estimated_days_min: number
  estimated_days_max: number
}

interface ShippingSelectorProps {
  onShippingChange: (method: ShippingMethod) => void
  selectedMethod: ShippingMethod | null
  language: Language
}

export function ShippingSelector({ onShippingChange, selectedMethod, language }: ShippingSelectorProps) {
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadShippingMethods()
  }, [])

  const loadShippingMethods = async () => {
    try {
      const { data, error } = await supabase
        .from("shipping_methods")
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true })

      if (error) {
        console.error("Error loading shipping methods:", error)
        return
      }

      setShippingMethods(data || [])

      // Auto-select first method (usually free shipping)
      if (data && data.length > 0 && !selectedMethod) {
        onShippingChange(data[0])
      }
    } catch (err) {
      console.error("Error loading shipping methods:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const getShippingIcon = (methodName: string) => {
    if (methodName.toLowerCase().includes("express")) return <Zap className="w-5 h-5 text-blue-600" />
    if (methodName.toLowerCase().includes("overnight")) return <Clock className="w-5 h-5 text-red-600" />
    return <Truck className="w-5 h-5 text-green-600" />
  }

  if (isLoading) {
    return <div className="text-sm text-gray-500">{t("loading", language)}</div>
  }

  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">{t("shipping_method", language)}</Label>
      <RadioGroup
        value={selectedMethod?.id.toString()}
        onValueChange={(value) => {
          const method = shippingMethods.find((m) => m.id.toString() === value)
          if (method) onShippingChange(method)
        }}
        className="space-y-3"
      >
        {shippingMethods.map((method) => (
          <div key={method.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value={method.id.toString()} id={`shipping-${method.id}`} />
            <div className="flex-1 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getShippingIcon(method.name)}
                <div>
                  <Label htmlFor={`shipping-${method.id}`} className="font-medium cursor-pointer">
                    {language === "ar" ? method.name_ar : method.name}
                  </Label>
                  <p className="text-sm text-gray-600">
                    {language === "ar" ? method.description_ar : method.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {method.estimated_days_min === method.estimated_days_max
                      ? `${method.estimated_days_min} ${method.estimated_days_min === 1 ? "day" : "days"}`
                      : `${method.estimated_days_min}-${method.estimated_days_max} days`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  {method.price === 0 ? t("free", language) : `$${method.price.toFixed(2)}`}
                </div>
              </div>
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
