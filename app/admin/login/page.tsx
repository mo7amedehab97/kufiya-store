"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Lock, User, AlertCircle, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"

export default function AdminLogin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log("Attempting login for username:", username)

      // Check if user exists in database with matching username and password
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .eq("username", username)
        .eq("password_hash", password) // Direct password comparison for now
        .single()

      console.log("Database response:", { data, error })

      if (error || !data) {
        console.log("Login failed:", error?.message)
        setError("Invalid username or password. Please check your credentials.")
        setIsLoading(false)
        return
      }

      console.log("Login successful for user:", data.username)

      // Store admin session
      localStorage.setItem("admin-authenticated", "true")
      localStorage.setItem("admin-user", JSON.stringify(data))

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Login error:", err)
      setError("Login failed. Please try again.")
    }

    setIsLoading(false)
  }

  const fillTestCredentials = (user: "admin" | "mohamed" | "test") => {
    if (user === "admin") {
      setUsername("admin")
      setPassword("admin123")
    } else if (user === "mohamed") {
      setUsername("mohamed.helles97")
      setPassword("Lplp12345$$")
    } else if (user === "test") {
      setUsername("test")
      setPassword("test123")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-5 h-5" />
            Back to Store
          </Link>
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-7 rounded-sm overflow-hidden shadow-sm">
              <Image
                src="/images/palestine-flag.png"
                alt="Palestinian Flag"
                width={40}
                height={28}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Kufiya Store</h1>
          </div>
          <p className="text-gray-600">Admin Dashboard Login</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-green-600" />
              Admin Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
