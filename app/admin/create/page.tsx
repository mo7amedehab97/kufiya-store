"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  UserPlus,
  User,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";

export default function CreateAdmin() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("admin-authenticated");
    const user = localStorage.getItem("admin-user");

    if (!isAuthenticated || !user) {
      router.push("/admin/login");
      return;
    }

    setAdminUser(JSON.parse(user));
  }, [router]);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .single();

      if (existingUser) {
        setError("Username already exists");
        setIsLoading(false);
        return;
      }

      // Create new admin user
      const hashedPassword = `$2a$10$rOvHv.ZxTbYmF6Q.VYR5/.gY8RoV7nR3.Bd8nE/v9YgJ3Y9K2J4oe`;
      const { error: insertError } = await supabase.from("users").insert([
        {
          username,
          email,
          password_hash: hashedPassword,
          is_admin: true,
        },
      ]);

      if (insertError) {
        throw new Error("Failed to create admin user");
      }

      setSuccess(`Admin user "${username}" created successfully!`);

      // Clear form
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError("Failed to create admin user. Please try again.");
      console.error("Create admin error:", err);
    }

    setIsLoading(false);
  };

  if (!adminUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-red-500 via-white to-green-500 rounded-full"></div>
              <h1 className="text-xl font-bold text-gray-900">
                Create Admin User
              </h1>
            </div>
          </div>
          <span className="text-sm text-gray-600">
            Logged in as: {adminUser?.username}
          </span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-green-600" />
                Create New Admin
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-4" variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-4" variant="default">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-green-700">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleCreateAdmin} className="space-y-4">
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
                      placeholder="Enter username"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      placeholder="Enter email address"
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
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      placeholder="Enter password"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      placeholder="Confirm password"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Admin..." : "Create Admin User"}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">
                  ⚠️ Security Note:
                </h4>
                <p className="text-sm text-yellow-700">
                  In production, passwords should be properly hashed using
                  bcrypt or similar secure hashing algorithms. This demo uses
                  simplified authentication for demonstration purposes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
