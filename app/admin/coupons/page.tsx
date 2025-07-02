"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Tag,
  Calendar,
  Users,
  Percent,
  DollarSign,
  Copy,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"

interface Coupon {
  id: number
  code: string
  discount_type: "percentage" | "fixed"
  discount_value: number
  min_order_amount: number
  max_uses: number | null
  current_uses: number
  expires_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [adminUser, setAdminUser] = useState<any>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [copiedCode, setCopiedCode] = useState("")
  const router = useRouter()

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: "",
    min_order_amount: "",
    max_uses: "",
    expires_at: "",
    is_active: true,
  })

  useEffect(() => {
    checkAuthentication()
  }, [router])

  const checkAuthentication = async () => {
    try {
      const isAuthenticated = localStorage.getItem("admin-authenticated")
      const user = localStorage.getItem("admin-user")

      if (!isAuthenticated || !user) {
        router.push("/admin/login")
        return
      }

      const userData = JSON.parse(user)
      setAdminUser(userData)

      const { data, error } = await supabase.from("admin_users").select("*").eq("username", userData.username).single()

      if (error || !data) {
        localStorage.removeItem("admin-authenticated")
        localStorage.removeItem("admin-user")
        router.push("/admin/login")
        return
      }

      loadCoupons()
    } catch (err) {
      console.error("Authentication check failed:", err)
      router.push("/admin/login")
    }
  }

  const loadCoupons = async () => {
    try {
      setError("")
      const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false })

      if (error) {
        setError(`Error loading coupons: ${error.message}`)
        console.error("Error loading coupons:", error)
        return
      }

      setCoupons(data || [])
    } catch (err: any) {
      setError(`Error loading coupons: ${err.message}`)
      console.error("Error loading coupons:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      // Validation
      if (!formData.code.trim()) {
        setError("Coupon code is required")
        return
      }

      if (!formData.discount_value || Number.parseFloat(formData.discount_value) <= 0) {
        setError("Discount value must be greater than 0")
        return
      }

      if (formData.discount_type === "percentage" && Number.parseFloat(formData.discount_value) > 100) {
        setError("Percentage discount cannot exceed 100%")
        return
      }

      const couponData = {
        code: formData.code.toUpperCase().trim(),
        discount_type: formData.discount_type,
        discount_value: Number.parseFloat(formData.discount_value),
        min_order_amount: Number.parseFloat(formData.min_order_amount) || 0,
        max_uses: formData.max_uses ? Number.parseInt(formData.max_uses) : null,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        is_active: formData.is_active,
        updated_at: new Date().toISOString(),
      }

      if (editingCoupon) {
        // Update existing coupon
        const { error } = await supabase.from("coupons").update(couponData).eq("id", editingCoupon.id)

        if (error) {
          if (error.code === "23505") {
            setError("A coupon with this code already exists")
          } else {
            throw error
          }
          return
        }

        setSuccess("Coupon updated successfully!")
      } else {
        // Create new coupon
        const { error } = await supabase.from("coupons").insert([couponData])

        if (error) {
          if (error.code === "23505") {
            setError("A coupon with this code already exists")
          } else {
            throw error
          }
          return
        }

        setSuccess("Coupon created successfully!")
      }

      // Reset form and close dialog
      resetForm()
      loadCoupons()
    } catch (err: any) {
      console.error("Error saving coupon:", err)
      setError("Error saving coupon. Please try again.")
    }
  }

  const resetForm = () => {
    setFormData({
      code: "",
      discount_type: "percentage",
      discount_value: "",
      min_order_amount: "",
      max_uses: "",
      expires_at: "",
      is_active: true,
    })
    setIsCreateDialogOpen(false)
    setEditingCoupon(null)
    setError("")
    setSuccess("")
  }

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      min_order_amount: coupon.min_order_amount.toString(),
      max_uses: coupon.max_uses?.toString() || "",
      expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().split("T")[0] : "",
      is_active: coupon.is_active,
    })
    setError("")
    setSuccess("")
    setIsCreateDialogOpen(true)
  }

  const handleDelete = async (coupon: Coupon) => {
    const confirmMessage = `Are you sure you want to delete coupon "${coupon.code}"?\n\nThis action cannot be undone and will affect any customers who have this coupon.`

    if (!confirm(confirmMessage)) return

    try {
      setError("")
      const { error } = await supabase.from("coupons").delete().eq("id", coupon.id)

      if (error) throw error

      setSuccess(`Coupon "${coupon.code}" deleted successfully!`)
      loadCoupons()
    } catch (err: any) {
      console.error("Error deleting coupon:", err)
      setError("Error deleting coupon. Please try again.")
    }
  }

  const toggleCouponStatus = async (coupon: Coupon) => {
    try {
      setError("")
      const { error } = await supabase
        .from("coupons")
        .update({
          is_active: !coupon.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", coupon.id)

      if (error) throw error

      setSuccess(`Coupon "${coupon.code}" ${!coupon.is_active ? "activated" : "deactivated"} successfully!`)
      loadCoupons()
    } catch (err: any) {
      console.error("Error updating coupon status:", err)
      setError("Error updating coupon status. Please try again.")
    }
  }

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(""), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const generateRandomCode = () => {
    const prefixes = ["SAVE", "DEAL", "OFFER", "SPECIAL", "PROMO"]
    const numbers = Math.floor(Math.random() * 90) + 10
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    return `${prefix}${numbers}`
  }

  const getDiscountDisplay = (coupon: Coupon) => {
    if (coupon.discount_type === "percentage") {
      return `${coupon.discount_value}% OFF`
    } else {
      return `$${coupon.discount_value.toFixed(2)} OFF`
    }
  }

  const isExpired = (coupon: Coupon) => {
    return coupon.expires_at && new Date(coupon.expires_at) < new Date()
  }

  const isMaxedOut = (coupon: Coupon) => {
    return coupon.max_uses && coupon.current_uses >= coupon.max_uses
  }

  const activeCoupons = coupons.filter((c) => c.is_active && !isExpired(c) && !isMaxedOut(c))
  const expiredCoupons = coupons.filter((c) => isExpired(c))
  const maxedOutCoupons = coupons.filter((c) => isMaxedOut(c))
  const totalUses = coupons.reduce((sum, c) => sum + c.current_uses, 0)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading coupons...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-6 rounded-sm overflow-hidden shadow-sm">
                <Image
                  src="/images/palestine-flag.png"
                  alt="Palestinian Flag"
                  width={32}
                  height={24}
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Manage Coupons</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {adminUser?.username}</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Alerts */}
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6" variant="default">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{coupons.length}</div>
              <p className="text-xs text-muted-foreground">All time created</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Coupons</CardTitle>
              <Tag className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCoupons.length}</div>
              <p className="text-xs text-muted-foreground">Currently available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Uses</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUses}</div>
              <p className="text-xs text-muted-foreground">Times redeemed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
              <Calendar className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expiredCoupons.length}</div>
              <p className="text-xs text-muted-foreground">Past expiry date</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 flex flex-wrap gap-4">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create New Coupon
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="code">Coupon Code *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="WELCOME10"
                      className="flex-1"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormData({ ...formData, code: generateRandomCode() })}
                    >
                      Generate
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Use letters and numbers only</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discount_type">Discount Type *</Label>
                    <Select
                      value={formData.discount_type}
                      onValueChange={(value: "percentage" | "fixed") =>
                        setFormData({ ...formData, discount_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">
                          <div className="flex items-center gap-2">
                            <Percent className="w-4 h-4" />
                            Percentage
                          </div>
                        </SelectItem>
                        <SelectItem value="fixed">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Fixed Amount
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="discount_value">
                      Discount Value * {formData.discount_type === "percentage" ? "(%)" : "($)"}
                    </Label>
                    <Input
                      id="discount_value"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={formData.discount_type === "percentage" ? "100" : undefined}
                      value={formData.discount_value}
                      onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                      placeholder={formData.discount_type === "percentage" ? "10" : "5.00"}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="min_order_amount">Minimum Order Amount ($)</Label>
                  <Input
                    id="min_order_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty for no minimum</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="max_uses">Maximum Uses</Label>
                    <Input
                      id="max_uses"
                      type="number"
                      min="1"
                      value={formData.max_uses}
                      onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                      placeholder="100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited</p>
                  </div>

                  <div>
                    <Label htmlFor="expires_at">Expiry Date</Label>
                    <Input
                      id="expires_at"
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={formData.expires_at}
                      onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty for no expiry</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="is_active">Active (customers can use this coupon)</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingCoupon ? "Update Coupon" : "Create Coupon"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={loadCoupons}>
            <Tag className="w-4 h-4 mr-2" />
            Refresh Coupons
          </Button>
        </div>

        {/* Coupons Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>All Coupons ({coupons.length})</CardTitle>
              <div className="text-sm text-gray-500">
                {activeCoupons.length} active • {expiredCoupons.length} expired • {maxedOutCoupons.length} maxed out
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Min Order</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id} className={isExpired(coupon) ? "opacity-60" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-bold text-sm bg-gray-100 px-2 py-1 rounded">
                            {coupon.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(coupon.code)}
                            className="h-6 w-6 p-0"
                          >
                            {copiedCode === coupon.code ? (
                              <CheckCircle className="w-3 h-3 text-green-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {coupon.discount_type === "percentage" ? (
                            <Percent className="w-4 h-4 text-blue-600" />
                          ) : (
                            <DollarSign className="w-4 h-4 text-green-600" />
                          )}
                          <span className="font-semibold">{getDiscountDisplay(coupon)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {coupon.min_order_amount > 0 ? `$${coupon.min_order_amount.toFixed(2)}` : "No minimum"}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{coupon.current_uses}</span>
                            {coupon.max_uses && (
                              <>
                                <span className="text-gray-400">/</span>
                                <span className="text-gray-600">{coupon.max_uses}</span>
                              </>
                            )}
                          </div>
                          {coupon.max_uses && (
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${isMaxedOut(coupon) ? "bg-red-500" : "bg-blue-500"}`}
                                style={{
                                  width: `${Math.min((coupon.current_uses / coupon.max_uses) * 100, 100)}%`,
                                }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {coupon.expires_at ? (
                          <div className="space-y-1">
                            <div className={`text-sm ${isExpired(coupon) ? "text-red-600 font-medium" : ""}`}>
                              {new Date(coupon.expires_at).toLocaleDateString()}
                            </div>
                            {isExpired(coupon) && (
                              <Badge variant="destructive" className="text-xs">
                                Expired
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500">Never expires</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge
                            className={`cursor-pointer ${
                              coupon.is_active
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            }`}
                            onClick={() => toggleCouponStatus(coupon)}
                          >
                            {coupon.is_active ? "Active" : "Inactive"}
                          </Badge>
                          {isMaxedOut(coupon) && (
                            <Badge variant="secondary" className="text-xs">
                              Maxed Out
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(coupon)} className="h-8 w-8 p-0">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(coupon)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {coupons.length === 0 && (
              <div className="text-center py-12">
                <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No coupons yet</h3>
                <p className="text-gray-500 mb-4">Create your first coupon to start offering discounts to customers.</p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Coupon
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">💡 Coupon Management Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Best Practices:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Use clear, memorable coupon codes</li>
                  <li>• Set reasonable expiry dates</li>
                  <li>• Monitor usage to prevent abuse</li>
                  <li>• Test coupons before sharing</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Popular Coupon Ideas:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• WELCOME10 - New customer discount</li>
                  <li>• FREESHIP - Free shipping offer</li>
                  <li>• SAVE20 - Percentage discount</li>
                  <li>• LOYALTY15 - Returning customer reward</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
