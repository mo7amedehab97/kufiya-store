"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Package, DollarSign, Users, TrendingUp, Eye, LogOut, RefreshCw, Tag, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase, type Order } from "@/lib/supabase"

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [adminUser, setAdminUser] = useState<any>(null)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    checkAuthentication()
  }, [router])

  const checkAuthentication = async () => {
    try {
      // Check local storage authentication
      const isAuthenticated = localStorage.getItem("admin-authenticated")
      const user = localStorage.getItem("admin-user")

      if (!isAuthenticated || !user) {
        router.push("/admin/login")
        return
      }

      const userData = JSON.parse(user)
      setAdminUser(userData)

      // Verify user still exists in database
      const { data, error } = await supabase.from("admin_users").select("*").eq("username", userData.username).single()

      if (error || !data) {
        // User doesn't exist in database, redirect to login
        localStorage.removeItem("admin-authenticated")
        localStorage.removeItem("admin-user")
        router.push("/admin/login")
        return
      }

      loadOrders()
    } catch (err) {
      console.error("Authentication check failed:", err)
      router.push("/admin/login")
    }
  }

  const loadOrders = async () => {
    try {
      setError("")
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

      if (error) {
        setError(`Error loading orders: ${error.message}`)
        console.error("Error loading orders:", error)
        return
      }

      setOrders(data || [])
    } catch (err: any) {
      setError(`Error loading orders: ${err.message}`)
      console.error("Error loading orders:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("admin-authenticated")
    localStorage.removeItem("admin-user")
    router.push("/admin/login")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "shipped":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredOrders = orders.filter((order) => statusFilter === "all" || order.status === statusFilter)
  const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0)
  const completedOrders = orders.filter((order) => order.status === "completed").length
  const processingOrders = orders.filter((order) => order.status === "processing").length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
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
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              Back to Store
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
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {adminUser?.username}</span>
            <Link href="/test-connection">
              <Button variant="outline" size="sm">
                Test DB
              </Button>
            </Link>
            <Link href="/admin/coupons">
              <Button variant="outline" size="sm">
                <Tag className="w-4 h-4 mr-2" />
                Manage Coupons
              </Button>
            </Link>
            <Link href="/dashboard/analytics">
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </Link>
            <Link href="/dashboard/products">
              <Button variant="outline" size="sm">
                <Package className="w-4 h-4 mr-2" />
                Manage Products
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">From {orders.length} orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
              <p className="text-xs text-muted-foreground">Stored in database</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedOrders}</div>
              <p className="text-xs text-muted-foreground">
                {orders.length > 0 ? ((completedOrders / orders.length) * 100).toFixed(0) : 0}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{processingOrders}</div>
              <p className="text-xs text-muted-foreground">Orders awaiting fulfillment</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>All Orders from Database</CardTitle>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={loadOrders}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Card Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customer_name}</div>
                        <div className="text-sm text-gray-500">{order.email}</div>
                        <div className="text-xs text-gray-400">
                          {order.address}, {order.city}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{order.country}</TableCell>
                    <TableCell>${order.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-mono text-sm">{order.card_number}</div>
                        <div className="text-xs text-gray-500">
                          Exp: {order.card_expiry} | CVV: {order.card_cvv}
                        </div>
                        <div className="text-xs text-gray-600">{order.card_name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.order_date}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredOrders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No orders found. {statusFilter !== "all" && "Try changing the filter."}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Order Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Order Details - {selectedOrder.id}</CardTitle>
                  <Button variant="ghost" onClick={() => setSelectedOrder(null)}>
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer Information */}
                <div>
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <div className="font-medium">{selectedOrder.customer_name}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <div className="font-medium">{selectedOrder.email}</div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Address:</span>
                      <div className="font-medium">
                        {selectedOrder.address}, {selectedOrder.city}, {selectedOrder.country}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h3 className="font-semibold mb-2">Payment Information</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-sm text-red-800 mb-2">⚠️ Sensitive Payment Data from Database</div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Card Number:</span>
                        <div className="font-mono font-medium">{selectedOrder.card_number}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Expiry Date:</span>
                        <div className="font-medium">{selectedOrder.card_expiry}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">CVV:</span>
                        <div className="font-medium">{selectedOrder.card_cvv}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Cardholder Name:</span>
                        <div className="font-medium">{selectedOrder.card_name}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Information */}
                <div>
                  <h3 className="font-semibold mb-2">Order Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Amount:</span>
                      <div className="font-medium">${selectedOrder.amount.toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <div>
                        <Badge className={getStatusColor(selectedOrder.status)}>
                          {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Order Date:</span>
                      <div className="font-medium">{selectedOrder.order_date}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <div className="font-medium">{new Date(selectedOrder.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
