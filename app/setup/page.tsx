"use client"

import Link from "next/link"
import { ArrowLeft, Database, Users, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DatabaseSetup() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            Back to Store
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Setup</h1>
            <p className="text-gray-600">Set up your Palestinian Kufiya Store database</p>
          </div>

          {/* Database Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Database Connection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600">Host:</span>
                  <div className="font-mono text-sm bg-gray-100 p-2 rounded">
                    db.ihqhzvtsphsrtjootjnw.supabase.co:5432
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Database:</span>
                  <div className="font-mono text-sm bg-gray-100 p-2 rounded">postgres</div>
                </div>
                <div>
                  <span className="text-gray-600">User:</span>
                  <div className="font-mono text-sm bg-gray-100 p-2 rounded">postgres</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to create the tables</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                Open your Supabase SQL editor and paste the contents of <code>scripts/direct-setup.sql</code>.
              </p>
              <p>
                Click <strong>RUN</strong>. When it finishes you can log in with:
              </p>
              <ul className="list-disc pl-6">
                <li>admin / admin123</li>
                <li>mohamed.helles97 / Lplp12345$$</li>
                <li>test / test123</li>
              </ul>
              <Link href="/admin/login">
                <Button className="mt-4 w-full">Go to Admin Login</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Admin Credentials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Admin Login Credentials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Default Admin</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Username:</strong> admin
                    </p>
                    <p>
                      <strong>Password:</strong> admin123
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Mohamed Admin</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Username:</strong> mohamed.helles97
                    </p>
                    <p>
                      <strong>Password:</strong> Lplp12345$$
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Test Admin</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Username:</strong> test
                    </p>
                    <p>
                      <strong>Password:</strong> test123
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/admin/login">
                  <Button className="w-full">Go to Admin Login</Button>
                </Link>
                <Link href="/test-connection">
                  <Button variant="outline" className="w-full">
                    Test Database Connection
                  </Button>
                </Link>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  1. <strong>Run the setup</strong> by pasting the contents of <code>scripts/direct-setup.sql</code>{" "}
                  into your Supabase SQL editor and clicking "Run".
                </p>
                <p>
                  2. <strong>Wait for completion</strong> - you'll see a success message in the Supabase SQL editor.
                </p>
                <p>
                  3. <strong>Login to admin</strong> using any of the credentials above
                </p>
                <p>
                  4. <strong>Test the store</strong> by placing an order and viewing it in the dashboard
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
