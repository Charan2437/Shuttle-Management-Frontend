"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Route,
  CreditCard,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity,
  DollarSign,
  Bus,
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data for wallet analytics
const walletAnalytics = {
  totalBalance: 2450000,
  monthlyAllocated: 180000,
  monthlySpent: 165000,
  avgBalance: 1590,
  lowBalanceUsers: 234,
  topUpRequests: 45,
}

// Removed all other mock data: systemMetrics, routeUsageData, hourlyBookingData, transferAnalytics, peakHoursData, routeEfficiencyData

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d")
  const [selectedMetric, setSelectedMetric] = useState("bookings")
  const [activeTab, setActiveTab] = useState("overview")
  const [overview, setOverview] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [routesData, setRoutesData] = useState<any | null>(null)
  const [routesLoading, setRoutesLoading] = useState(false)
  const [routesError, setRoutesError] = useState<string | null>(null)
  const [studentsData, setStudentsData] = useState<any | null>(null)
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [studentsError, setStudentsError] = useState<string | null>(null)
  const [selectedRoute, setSelectedRoute] = useState<string>("")
  const [routeHourlyData, setRouteHourlyData] = useState<any | null>(null)
  const [routeHourlyLoading, setRouteHourlyLoading] = useState(false)
  const [routeHourlyError, setRouteHourlyError] = useState<string | null>(null)

  // Fetch analytics data on mount
  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    Promise.all([
      fetch("http://localhost:8081/api/admin/analytics/overview", jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : undefined).then((r) => r.json()),
      fetch("http://localhost:8081/api/admin/analytics/routes", jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : undefined).then((r) => r.json()),
      fetch("http://localhost:8081/api/admin/analytics/students", jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : undefined).then((r) => r.json()),
    ])
      .then(([overview, routes, students]) => {
        setOverview(overview)
        setRoutesData(routes)
        setStudentsData(students)
      })
      .catch(() => {
        setError("Failed to load analytics data")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // Fetch routes analytics when routes tab is selected
  useEffect(() => {
    if (selectedMetric !== "routes") return
    setRoutesLoading(true)
    setRoutesError(null)
    fetch("http://localhost:8081/api/admin/analytics/routes", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch routes analytics")
        return res.json()
      })
      .then(data => setRoutesData(data))
      .catch(err => setRoutesError(err.message || "Error loading routes analytics"))
      .finally(() => setRoutesLoading(false))
  }, [selectedMetric])

  // Fetch students analytics when students tab is selected
  useEffect(() => {
    if (selectedMetric !== "students") return
    setStudentsLoading(true)
    setStudentsError(null)
    fetch("http://localhost:8081/api/admin/analytics/students", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch students analytics")
        return res.json()
      })
      .then(data => setStudentsData(data))
      .catch(err => setStudentsError(err.message || "Error loading students analytics"))
      .finally(() => setStudentsLoading(false))
  }, [selectedMetric])

  // Fetch route-specific hourly bookings when route is selected
  useEffect(() => {
    if (!selectedRoute) {
      setRouteHourlyData(null)
      return
    }
    
    setRouteHourlyLoading(true)
    setRouteHourlyError(null)
    
    fetch("http://localhost:8081/api/admin/analytics/routes/hourly-bookings/by-name", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify({
        routeName: selectedRoute
      })
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch route hourly bookings")
        return res.json()
      })
      .then(data => {
        // Transform the data for the chart
        const transformedData = []
        for (let hour = 6; hour <= 23; hour++) {
          transformedData.push({
            hour: `${hour}:00`,
            bookings: data.hourlyBookingPattern[hour.toString()] || 0
          })
        }
        setRouteHourlyData(transformedData)
      })
      .catch(err => setRouteHourlyError(err.message || "Error loading route hourly bookings"))
      .finally(() => setRouteHourlyLoading(false))
  }, [selectedRoute])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleExport = () => {
    let csvContent = ""
    let filename = ""

    switch (activeTab) {
      case "overview":
        if (overview) {
          const headers = ["Metric", "Value", "Description"]
          const rows = [
            ["Total Active Students", overview.totalActiveStudents || 0, "Registered and active users"],
            ["Daily Bookings (Avg)", overview.averageBookingsPerDay || 0, "Average bookings per day"],
            ["Peak Hour", overview.peakHour ? `${overview.peakHour.hour}:00` : "N/A", "Hour with highest bookings"],
            ["Peak Hour Bookings", overview.peakHour ? overview.peakHour.count : 0, "Number of bookings at peak hour"],
          ]
          
          // Add hourly booking pattern data
          if (overview.hourlyBookingPattern) {
            rows.push(["", "", ""]) // Empty row for separation
            rows.push(["Hour", "Bookings", "Hourly booking count"])
            overview.hourlyBookingPattern.forEach((hour: any) => {
              rows.push([`${hour.hour}:00`, hour.count, `Bookings at ${hour.hour}:00`])
            })
          }
          
          csvContent = [headers, ...rows].map((r) => r.map((v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n")
          filename = `analytics-overview-${Date.now()}.csv`
        }
        break

      case "routes":
        if (routesData) {
          const headers = ["Route Name", "Route ID", "Bookings", "Efficiency (%)", "Revenue (₹)", "Description"]
          const rows = routesData.routes?.map((route: any) => [
            route.routeName,
            route.routeId,
            route.bookings,
            route.efficiency || 0,
            route.revenue || 0,
            `Route performance data for ${route.routeName}`
          ]) || []
          
          // Add top routes data
          if (routesData.topRoutes) {
            rows.push(["", "", "", "", "", ""]) // Empty row for separation
            rows.push(["Top Routes by Bookings", "", "", "", "", ""])
            routesData.topRoutes.forEach((route: any) => {
              rows.push([route.routeName, route.routeId, route.bookings, "", "", "Top performing route"])
            })
          }
          
          csvContent = [headers, ...rows].map((r) => r.map((v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n")
          filename = `analytics-routes-${Date.now()}.csv`
        }
        break

      case "students":
        if (studentsData) {
          const headers = ["Metric", "Value", "Description"]
          const rows = [
            ["Active Students", studentsData.activeStudents || 0, "Number of active students"],
            ["New Registrations", studentsData.newRegistrations || 0, "New student registrations"],
            ["Avg Trips per Student", studentsData.avgTripsPerStudent || 0, "Average trips per student"],
          ]
          
          // Add user segments data
          if (studentsData.userSegments) {
            rows.push(["", "", ""]) // Empty row for separation
            rows.push(["User Segment", "Count", "Criteria"])
            studentsData.userSegments.forEach((segment: any) => {
              rows.push([segment.label, segment.count, segment.criteria])
            })
          }
          
          csvContent = [headers, ...rows].map((r) => r.map((v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n")
          filename = `analytics-students-${Date.now()}.csv`
        }
        break

      case "financial":
        const headers = ["Metric", "Value", "Description"]
        const rows = [
          ["Total Wallet Balance", formatCurrency(walletAnalytics.totalBalance), "Total balance across all students"],
          ["Monthly Allocated", formatCurrency(walletAnalytics.monthlyAllocated), "Points allocated this month"],
          ["Monthly Spent", formatCurrency(walletAnalytics.monthlySpent), "Points spent this month"],
          ["Avg Balance per Student", formatCurrency(walletAnalytics.avgBalance), "Average balance per student"],
          ["Low Balance Users", walletAnalytics.lowBalanceUsers, "Students with balance below ₹500"],
          ["Pending Top-ups", walletAnalytics.topUpRequests, "Awaiting payment confirmation"],
          ["Healthy Balances", loading ? "..." : error ? "-" : (overview?.totalActiveStudents ? overview.totalActiveStudents - walletAnalytics.lowBalanceUsers : "-"), "Students with sufficient balance"],
        ]
        csvContent = [headers, ...rows].map((r) => r.map((v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n")
        filename = `analytics-financial-${Date.now()}.csv`
        break

      case "operations":
        const opHeaders = ["Metric", "Value", "Change", "Description"]
        const opRows = [
          ["Fleet Utilization", "87.3%", "+4.2%", "Current fleet utilization rate"],
          ["On-Time Performance", "91.2%", "+1.8%", "Service on-time performance"],
          ["Customer Satisfaction", "4.3/5", "+0.2", "Customer satisfaction rating"],
          ["API Response Time", "120ms", "", "Average API response time"],
          ["Database Performance", "Optimal", "", "Database performance status"],
          ["Cache Hit Rate", "94.2%", "", "Cache hit rate percentage"],
          ["Error Rate", "0.03%", "", "System error rate"],
          ["Booking Success Rate", "98.7%", "", "Booking success rate"],
          ["Payment Success Rate", "99.2%", "", "Payment success rate"],
          ["Route Optimization", "92.1%", "", "Route optimization efficiency"],
        ]
        csvContent = [opHeaders, ...opRows].map((r) => r.map((v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n")
        filename = `analytics-operations-${Date.now()}.csv`
        break

      case "predictive":
        const predHeaders = ["Category", "Metric", "Value", "Confidence", "Description"]
        const predRows = [
          ["Demand Predictions", "Tomorrow's Peak Hours", "8-9 AM", "High Confidence", "Expected 15% increase in bookings due to exam schedule"],
          ["Demand Predictions", "Weekend Demand", "Sports Complex", "Medium Confidence", "Sports event expected to increase usage by 40%"],
          ["Optimization Recommendations", "Route Optimization", "Main Campus Loop", "Action Required", "Consider adding express service during peak hours"],
          ["Optimization Recommendations", "Capacity Planning", "Library Shuttle", "Suggestion", "Consider frequency increase due to consistent high demand"],
        ]
        csvContent = [predHeaders, ...predRows].map((r) => r.map((v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n")
        filename = `analytics-predictive-${Date.now()}.csv`
        break

      default:
        return
    }

    if (csvContent) {
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", filename)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleRefresh = () => {
    setLoading(true)
    setError(null)
    const jwt = localStorage.getItem("jwt");
    Promise.all([
      fetch("http://localhost:8081/api/admin/analytics/overview", jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : undefined).then((r) => r.json()),
      fetch("http://localhost:8081/api/admin/analytics/routes", jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : undefined).then((r) => r.json()),
      fetch("http://localhost:8081/api/admin/analytics/students", jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : undefined).then((r) => r.json()),
    ])
      .then(([overview, routes, students]) => {
        setOverview(overview)
        setRoutesData(routes)
        setStudentsData(students)
      })
      .catch(() => {
        setError("Failed to load analytics data")
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const MetricCard = ({
    title,
    value,
    change,
    icon: Icon,
    trend = "up",
    description,
  }: {
    title: string
    value: string | number
    change: string
    icon: any
    trend?: "up" | "down" | "neutral"
    description?: string
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          {trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
          {trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
          <span className={cn(trend === "up" && "text-green-500", trend === "down" && "text-red-500")}>{change}</span>
          <span>from last period</span>
        </div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive insights into shuttle system performance and usage</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Active Students"
          value={loading ? "..." : error ? "-" : overview?.totalActiveStudents?.toLocaleString() ?? "-"}
          change=""
          icon={Users}
          trend="up"
          description="Registered and active users"
        />
        <MetricCard
          title="Daily Bookings (Avg)"
          value={loading ? "..." : error ? "-" : overview?.averageBookingsPerDay ?? "-"}
          change=""
          icon={Calendar}
          trend="up"
          description="Average bookings per day"
        />
        <MetricCard
          title="Peak Hour"
          value={loading ? "..." : error ? "-" : (overview?.peakHour ? `${overview.peakHour.hour}:00 (${overview.peakHour.count} bookings)` : "-")}
          change=""
          icon={Clock}
          trend="up"
          description="Hour with highest bookings"
        />
      </div>
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="routes" onClick={() => setSelectedMetric("routes")}>Routes</TabsTrigger>
          <TabsTrigger value="students" onClick={() => setSelectedMetric("students")}>Students</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="predictive">Predictive</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Hourly Booking Trends */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Hourly Booking Patterns</CardTitle>
                <CardDescription>Booking volume throughout the day</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div>Loading...</div>
                ) : error ? (
                  <div className="text-red-500">{error}</div>
                ) : overview?.hourlyBookingPattern ? (
                <ChartContainer
                  config={{
                    bookings: { label: "Bookings", color: "hsl(var(--chart-1))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={Array.from({ length: 24 }, (_, hour) => {
                          const found = overview.hourlyBookingPattern.find((h: any) => h.hour === hour)
                          return { hour: `${hour}:00`, bookings: found ? found.count : 0 }
                        })}
                      >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="bookings"
                        stackId="1"
                        stroke="var(--color-bookings)"
                        fill="var(--color-bookings)"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Routes Tab */}
        <TabsContent value="routes" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Route Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Route Performance Metrics</CardTitle>
                <CardDescription>Usage, efficiency, and revenue by route</CardDescription>
              </CardHeader>
              <CardContent>
                {routesLoading ? (
                  <div>Loading...</div>
                ) : routesError ? (
                  <div className="text-red-500">{routesError}</div>
                ) : routesData?.routes ? (
                <div className="space-y-4">
                    {routesData.routes.map((route: any, index: number) => (
                      <div key={route.routeId} className="space-y-2">
                      <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{route.routeName}</span>
                        <Badge variant="outline">{route.bookings} bookings</Badge>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Efficiency</span>
                              <span>{route.efficiency !== null ? `${route.efficiency}%` : "-"}</span>
                            </div>
                            <Progress value={route.efficiency || 0} className="h-2" />
                          </div>
                          <div className="text-sm font-medium">{formatCurrency(route.revenue)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Route-Specific Hourly Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Route Hourly Bookings</CardTitle>
                <CardDescription>Hourly booking patterns for selected route</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Route Selection Dropdown */}
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium">Select Route:</label>
                    <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Choose a route" />
                      </SelectTrigger>
                      <SelectContent>
                        {routesData?.routes?.map((route: any) => (
                          <SelectItem key={route.routeId} value={route.routeName}>
                            {route.routeName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Chart */}
                  {!selectedRoute ? (
                    <div className="text-center py-8">
                      <Route className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">Select a route to view hourly booking patterns</p>
                    </div>
                  ) : routeHourlyLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a5f] mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading hourly data...</p>
                    </div>
                  ) : routeHourlyError ? (
                    <div className="text-center py-8">
                      <p className="text-red-500">{routeHourlyError}</p>
                    </div>
                  ) : routeHourlyData ? (
                <ChartContainer
                  config={{
                        bookings: { label: "Bookings", color: "hsl(var(--chart-1))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={routeHourlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="hour" />
                          <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                          <Area
                            type="monotone"
                            dataKey="bookings"
                            stroke="var(--color-bookings)"
                            fill="var(--color-bookings)"
                            fillOpacity={0.6}
                          />
                        </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Routes */}
          <Card>
            <CardHeader>
              <CardTitle>Top Routes by Bookings</CardTitle>
              <CardDescription>Most popular routes in the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              {routesLoading ? (
                <div>Loading...</div>
              ) : routesError ? (
                <div className="text-red-500">{routesError}</div>
              ) : routesData?.topRoutes ? (
                <div className="space-y-2">
                  {routesData.topRoutes.map((route: any, idx: number) => (
                    <div key={route.routeId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="font-medium">{route.routeName}</span>
                      <Badge variant="secondary">{route.bookings} bookings</Badge>
                  </div>
                ))}
              </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title="Active Students"
              value={studentsLoading ? "..." : studentsError ? "-" : studentsData?.activeStudents ?? "-"}
              change=""
              icon={Users}
              trend="up"
            />
            <MetricCard
              title="New Registrations"
              value={studentsLoading ? "..." : studentsError ? "-" : studentsData?.newRegistrations ?? "-"}
              change=""
              icon={Users}
              trend="up"
            />
            <MetricCard
              title="Avg Trips per Student"
              value={studentsLoading ? "..." : studentsError ? "-" : studentsData?.avgTripsPerStudent ?? "-"}
              change=""
              icon={Route}
              trend="up"
            />
          </div>

          {/* Student Usage Patterns */}
          <Card>
            <CardHeader>
              <CardTitle>Student Usage Patterns</CardTitle>
              <CardDescription>Analysis of student booking behavior and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Top User Segments</h4>
                  <div className="space-y-3">
                    {studentsData?.userSegments?.map((segment: any, idx: number) => (
                      <div key={segment.label} className="flex justify-between items-center">
                        <span className="text-sm">{segment.label} ({segment.criteria})</span>
                        <Badge>{segment.count} students</Badge>
                    </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard
              title="Total Wallet Balance"
              value={formatCurrency(walletAnalytics.totalBalance)}
              change="+3.2%"
              icon={CreditCard}
              trend="up"
            />
            <MetricCard
              title="Monthly Allocated"
              value={formatCurrency(walletAnalytics.monthlyAllocated)}
              change="+8.1%"
              icon={DollarSign}
              trend="up"
            />
            <MetricCard
              title="Monthly Spent"
              value={formatCurrency(walletAnalytics.monthlySpent)}
              change="+12.5%"
              icon={TrendingUp}
              trend="up"
            />
            <MetricCard
              title="Avg Balance per Student"
              value={formatCurrency(walletAnalytics.avgBalance)}
              change="-2.3%"
              icon={Users}
              trend="down"
            />
          </div>

          {/* Financial Analytics */}
          <div className="grid gap-4 md:grid-cols-1">
            {/* Wallet Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Wallet Status Overview</CardTitle>
                <CardDescription>Student wallet health and top-up requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <div>
                      <div className="font-medium">Low Balance Alerts</div>
                      <div className="text-sm text-muted-foreground">Students with balance below ₹500</div>
                    </div>
                  </div>
                  <Badge variant="destructive">{walletAnalytics.lowBalanceUsers}</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium">Pending Top-ups</div>
                      <div className="text-sm text-muted-foreground">Awaiting payment confirmation</div>
                    </div>
                  </div>
                  <Badge variant="secondary">{walletAnalytics.topUpRequests}</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-medium">Healthy Balances</div>
                      <div className="text-sm text-muted-foreground">Students with sufficient balance</div>
                    </div>
                  </div>
                  <Badge variant="default">
                    {loading ? "..." : error ? "-" : (overview?.totalActiveStudents ? overview.totalActiveStudents - walletAnalytics.lowBalanceUsers : "-")}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard title="Fleet Utilization" value="87.3%" change="+4.2%" icon={Bus} trend="up" />
            <MetricCard title="On-Time Performance" value="91.2%" change="+1.8%" icon={Clock} trend="up" />
            <MetricCard title="Customer Satisfaction" value="4.3/5" change="+0.2" icon={CheckCircle} trend="up" />
          </div>

          {/* Operational Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Operational Performance</CardTitle>
              <CardDescription>Key operational metrics and system health indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">System Health</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">API Response Time</span>
                      <Badge variant="default">120ms</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Database Performance</span>
                      <Badge variant="default">Optimal</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Cache Hit Rate</span>
                      <Badge variant="default">94.2%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Error Rate</span>
                      <Badge variant="default">0.03%</Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Service Quality</h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Booking Success Rate</span>
                        <span>98.7%</span>
                      </div>
                      <Progress value={98.7} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Payment Success Rate</span>
                        <span>99.2%</span>
                      </div>
                      <Progress value={99.2} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Route Optimization</span>
                        <span>92.1%</span>
                      </div>
                      <Progress value={92.1} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictive Tab */}
        <TabsContent value="predictive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Predictive Analytics & Insights</CardTitle>
              <CardDescription>AI-powered predictions and recommendations for system optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Demand Predictions</h4>
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Tomorrow's Peak Hours</span>
                        <Badge>High Confidence</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Expected 15% increase in bookings between 8-9 AM due to exam schedule
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Weekend Demand</span>
                        <Badge variant="secondary">Medium Confidence</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Sports event expected to increase Sports Complex route usage by 40%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Optimization Recommendations</h4>
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Route Optimization</span>
                        <Badge variant="default">Action Required</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Consider adding express service for Main Campus Loop during peak hours
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Capacity Planning</span>
                        <Badge variant="outline">Suggestion</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Library Shuttle showing consistent high demand - consider frequency increase
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Forecasting Charts */}
          <Card>
            <CardHeader>
              <CardTitle>Demand Forecasting</CardTitle>
              <CardDescription>Predicted booking patterns for the next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">Demand forecasting charts will be available soon</p>
                <p className="text-sm text-gray-400 mt-2">This feature is under development</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
