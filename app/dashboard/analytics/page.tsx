"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Users,
  Globe,
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  TrendingUp,
  Eye,
  MousePointer,
  CreditCard,
  BarChart3,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
  const router = useRouter();

  useEffect(() => {
    checkAuthentication();
  }, [router]);

  const checkAuthentication = async () => {
    try {
      const isAuthenticated = localStorage.getItem("admin-authenticated");
      const user = localStorage.getItem("admin-user");

      if (!isAuthenticated || !user) {
        router.push("/admin/login");
        return;
      }

      const userData = JSON.parse(user);
      setAdminUser(userData);

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", userData.username)
        .eq("is_admin", true)
        .single();

      if (error || !data) {
        localStorage.removeItem("admin-authenticated");
        localStorage.removeItem("admin-user");
        router.push("/admin/login");
        return;
      }

      loadAnalytics();
    } catch (err) {
      console.error("Authentication check failed:", err);
      router.push("/admin/login");
    }
  };

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      const days =
        selectedTimeRange === "24h" ? 1 : selectedTimeRange === "7d" ? 7 : 30;
      startDate.setDate(endDate.getDate() - days);

      // Load all analytics data
      const [visitorsResult, pageViewsResult, eventsResult, conversionResult] =
        await Promise.all([
          supabase
            .from("visitors")
            .select("*")
            .gte("created_at", startDate.toISOString())
            .lte("created_at", endDate.toISOString()),
          supabase
            .from("page_views")
            .select("*")
            .gte("created_at", startDate.toISOString())
            .lte("created_at", endDate.toISOString()),
          supabase
            .from("visitor_events")
            .select("*")
            .gte("created_at", startDate.toISOString())
            .lte("created_at", endDate.toISOString()),
          supabase
            .from("conversion_funnel")
            .select("*")
            .gte("completed_at", startDate.toISOString())
            .lte("completed_at", endDate.toISOString()),
        ]);

      const visitors = visitorsResult.data || [];
      const pageViews = pageViewsResult.data || [];
      const events = eventsResult.data || [];
      const conversions = conversionResult.data || [];

      // Calculate stats
      const totalVisitors = visitors.length;
      const totalSessions = new Set(visitors.map((v) => v.session_id)).size;
      const averageSessionDuration =
        visitors.reduce((sum, v) => sum + (v.session_duration || 0), 0) /
          totalVisitors || 0;
      const totalPageViews = pageViews.length;
      const bounceRate =
        (visitors.filter((v) => v.page_views === 1).length / totalVisitors) *
          100 || 0;
      const completedPayments = visitors.filter(
        (v) => v.completed_payment
      ).length;
      const conversionRate = (completedPayments / totalVisitors) * 100 || 0;

      // Top countries
      const countryCount = visitors.reduce((acc: any, v) => {
        const country = v.country || "Unknown";
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {});
      const topCountries = Object.entries(countryCount)
        .map(([country, count]: [string, any]) => ({
          country,
          count,
          percentage: (count / totalVisitors) * 100,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Device breakdown
      const deviceCount = visitors.reduce((acc: any, v) => {
        const device = v.device_type || "unknown";
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      }, {});
      const deviceBreakdown = Object.entries(deviceCount).map(
        ([device_type, count]: [string, any]) => ({
          device_type,
          count,
          percentage: (count / totalVisitors) * 100,
        })
      );

      // Browser breakdown
      const browserCount = visitors.reduce((acc: any, v) => {
        const browser = v.browser_name || "unknown";
        acc[browser] = (acc[browser] || 0) + 1;
        return acc;
      }, {});
      const browserBreakdown = Object.entries(browserCount)
        .map(([browser_name, count]: [string, any]) => ({
          browser_name,
          count,
          percentage: (count / totalVisitors) * 100,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Top pages
      const pageCount = pageViews.reduce((acc: any, pv) => {
        const page = pv.page_url;
        if (!acc[page]) {
          acc[page] = { views: 0, totalTime: 0 };
        }
        acc[page].views += 1;
        acc[page].totalTime += pv.time_on_page || 0;
        return acc;
      }, {});
      const topPages = Object.entries(pageCount)
        .map(([page_url, data]: [string, any]) => ({
          page_url,
          views: data.views,
          avg_time: data.totalTime / data.views || 0,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // Conversion funnel
      const funnelSteps = [
        "landing",
        "product_view",
        "checkout_start",
        "payment_complete",
      ];
      const conversionFunnel = funnelSteps.map((step, index) => {
        const stepCount = conversions.filter(
          (c) => c.step_name === step
        ).length;
        const previousStepCount =
          index === 0
            ? totalVisitors
            : conversions.filter((c) => c.step_name === funnelSteps[index - 1])
                .length;
        return {
          step_name: step,
          count: stepCount,
          conversion_rate:
            previousStepCount > 0 ? (stepCount / previousStepCount) * 100 : 0,
        };
      });

      // Recent visitors (last 10)
      const recentVisitors = visitors
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 10);

      // Hourly traffic
      const hourlyTraffic = Array.from({ length: 24 }, (_, hour) => {
        const hourVisitors = visitors.filter((v) => {
          const visitHour = new Date(v.created_at).getHours();
          return visitHour === hour;
        }).length;
        return { hour, visitors: hourVisitors };
      });

      const paymentAttempts = visitors.filter((v) => v.started_checkout).length;

      setStats({
        totalVisitors,
        totalSessions,
        averageSessionDuration,
        totalPageViews,
        bounceRate,
        conversionRate,
        topCountries,
        deviceBreakdown,
        browserBreakdown,
        topPages,
        conversionFunnel,
        recentVisitors,
        hourlyTraffic,
        paymentAttempts,
        completedPayments,
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (adminUser) {
      loadAnalytics();
    }
  }, [selectedTimeRange, adminUser]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "mobile":
        return <Smartphone className="w-4 h-4" />;
      case "tablet":
        return <Tablet className="w-4 h-4" />;
      case "desktop":
        return <Monitor className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getCountryFlag = (countryCode: string) => {
    // Simple flag emoji mapping
    const flags: Record<string, string> = {
      PS: "🇵🇸",
      US: "🇺🇸",
      GB: "🇬🇧",
      DE: "🇩🇪",
      FR: "🇫🇷",
      CA: "🇨🇦",
      AU: "🇦🇺",
      JO: "🇯🇴",
      EG: "🇪🇬",
      SA: "🇸🇦",
    };
    return flags[countryCode] || "🌍";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading analytics...</p>
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
              <h1 className="text-xl font-bold text-gray-900">
                Visitor Analytics
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <span className="text-sm text-gray-600">
              Welcome, {adminUser?.username}
            </span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Visitors
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalVisitors || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalSessions || 0} sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Session Duration
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDuration(Math.round(stats?.averageSessionDuration || 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalPageViews || 0} page views
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Conversion Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.conversionRate.toFixed(1) || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.completedPayments || 0} / {stats?.totalVisitors || 0}{" "}
                converted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.bounceRate.toFixed(1) || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Single page visits
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="geography">Geography</TabsTrigger>
            <TabsTrigger value="technology">Technology</TabsTrigger>
            <TabsTrigger value="behavior">Behavior</TabsTrigger>
            <TabsTrigger value="conversions">Conversions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Visitors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Recent Visitors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.recentVisitors.map((visitor, index) => (
                      <div
                        key={visitor.visitor_id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            {getCountryFlag(visitor.country_code)}
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {visitor.country || "Unknown"} •{" "}
                              {visitor.city || "Unknown City"}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                              {getDeviceIcon(visitor.device_type)}
                              {visitor.device_type} • {visitor.browser_name}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {formatDuration(visitor.session_duration || 0)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {visitor.page_views || 0} pages
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Pages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Top Pages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.topPages.map((page, index) => (
                      <div key={page.page_url} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            {page.page_url}
                          </span>
                          <span className="text-sm text-gray-500">
                            {page.views} views
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>
                            Avg. time:{" "}
                            {formatDuration(Math.round(page.avg_time))}
                          </span>
                          <span>
                            {(
                              (page.views / (stats?.totalPageViews || 1)) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <Progress
                          value={
                            (page.views / (stats?.topPages[0]?.views || 1)) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="geography" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Visitors by Country
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Country</TableHead>
                      <TableHead>Visitors</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Progress</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats?.topCountries.map((country, index) => (
                      <TableRow key={country.country}>
                        <TableCell className="flex items-center gap-2">
                          <span className="text-lg">
                            {getCountryFlag("PS")}
                          </span>
                          {country.country}
                        </TableCell>
                        <TableCell>{country.count}</TableCell>
                        <TableCell>{country.percentage.toFixed(1)}%</TableCell>
                        <TableCell className="w-32">
                          <Progress
                            value={country.percentage}
                            className="h-2"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="technology" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Device Types */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Device Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.deviceBreakdown.map((device) => (
                      <div key={device.device_type} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(device.device_type)}
                            <span className="capitalize">
                              {device.device_type}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {device.count} ({device.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={device.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Browsers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Browsers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.browserBreakdown.map((browser) => (
                      <div key={browser.browser_name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>{browser.browser_name}</span>
                          <span className="text-sm text-gray-500">
                            {browser.count} ({browser.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={browser.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="behavior" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MousePointer className="w-5 h-5" />
                  User Behavior
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {stats?.totalPageViews || 0}
                    </div>
                    <div className="text-sm text-gray-600">
                      Total Page Views
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {(
                        (stats?.totalPageViews || 0) /
                        (stats?.totalVisitors || 1)
                      ).toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Pages per Session
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {stats?.bounceRate.toFixed(1) || 0}%
                    </div>
                    <div className="text-sm text-gray-600">Bounce Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversions" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Conversion Funnel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Conversion Funnel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.conversionFunnel.map((step, index) => (
                      <div key={step.step_name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="capitalize font-medium">
                            {step.step_name.replace("_", " ")}
                          </span>
                          <span className="text-sm text-gray-500">
                            {step.count} visitors (
                            {step.conversion_rate.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress
                          value={step.conversion_rate}
                          className="h-3"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {stats?.paymentAttempts || 0}
                        </div>
                        <div className="text-sm text-blue-700">
                          Payment Attempts
                        </div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {stats?.completedPayments || 0}
                        </div>
                        <div className="text-sm text-green-700">
                          Completed Payments
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Payment Success Rate</span>
                        <span className="font-medium">
                          {stats?.paymentAttempts
                            ? (
                                (stats.completedPayments /
                                  stats.paymentAttempts) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          stats?.paymentAttempts
                            ? (stats.completedPayments /
                                stats.paymentAttempts) *
                              100
                            : 0
                        }
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
