"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Database,
  CheckCircle,
  XCircle,
  Loader,
  Users,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabase";

export default function TestConnection() {
  const [connectionStatus, setConnectionStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [tablesExist, setTablesExist] = useState<boolean>(false);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [orderCount, setOrderCount] = useState<number>(0);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setConnectionStatus("loading");
      setError("");

      // Test admin users table
      const { data: adminData, error: adminError } = await supabase
        .from("users")
        .select("*");

      // Test orders table
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*", { count: "exact" });

      if (adminError) {
        throw new Error(`Admin table error: ${adminError.message}`);
      }

      if (orderError && !orderError.message.includes("does not exist")) {
        throw new Error(`Orders table error: ${orderError.message}`);
      }

      // Set results
      setTablesExist(true);
      setAdminUsers(adminData || []);
      setOrderCount(orderData?.length || 0);
      setConnectionStatus("success");
    } catch (err: any) {
      setError(err.message);
      setConnectionStatus("error");
      setTablesExist(false);
    }
  };

  const testLogin = async (username: string, password: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .eq("password_hash", password)
        .eq("is_admin", true)
        .single();

      if (error || !data) {
        alert(`❌ Login failed for ${username}`);
      } else {
        alert(`✅ Login successful for ${username}!`);
      }
    } catch (err) {
      alert(`❌ Error testing login for ${username}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Store
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Database Connection & Admin Test
            </h1>
            <p className="text-gray-600">
              Testing connection and admin authentication
            </p>
          </div>

          {/* Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                {connectionStatus === "loading" && (
                  <>
                    <Loader className="w-5 h-5 animate-spin text-blue-600" />
                    <span>Testing connection...</span>
                  </>
                )}
                {connectionStatus === "success" && (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-700 font-medium">
                      Connected successfully!
                    </span>
                  </>
                )}
                {connectionStatus === "error" && (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-700 font-medium">
                      Connection failed
                    </span>
                  </>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <span className="text-gray-600">Admin Users:</span>
                  <div className="font-medium">{adminUsers.length} users</div>
                </div>
                <div>
                  <span className="text-gray-600">Orders:</span>
                  <div className="font-medium">{orderCount} orders</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Users Table */}
          {adminUsers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Admin Users in Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Password</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell className="font-medium">
                          {user.username}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {user.password_hash}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              testLogin(user.username, user.password_hash)
                            }
                          >
                            Test Login
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={testConnection} variant="outline">
                  Refresh Connection
                </Button>
                <Link href="/admin/login">
                  <Button className="w-full">Go to Admin Login</Button>
                </Link>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">
                  ✅ Ready to Login:
                </h4>
                <div className="space-y-1 text-sm text-green-700">
                  <p>
                    • Username: <code>admin</code> | Password:{" "}
                    <code>admin123</code>
                  </p>
                  <p>
                    • Username: <code>mohamed.helles97</code> | Password:{" "}
                    <code>Lplp12345$$</code>
                  </p>
                  <p>
                    • Username: <code>test</code> | Password:{" "}
                    <code>test123</code>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <p>
                  <strong>1. Run SQL Script:</strong> Execute
                  `scripts/003-add-admin-passwords.sql` in your Supabase SQL
                  Editor
                </p>
                <p>
                  <strong>2. Test Connection:</strong> Use the "Refresh
                  Connection" button above
                </p>
                <p>
                  <strong>3. Test Login:</strong> Click "Test Login" buttons for
                  each user
                </p>
                <p>
                  <strong>4. Access Dashboard:</strong> Use the admin login page
                  with any of the credentials above
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
