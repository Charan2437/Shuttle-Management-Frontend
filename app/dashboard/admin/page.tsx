"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  Route,
  Calendar,
  TrendingUp,
  MapPin,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { mockBookings, mockStudents, mockRoutes } from "@/lib/data/static-data"

// Mock analytics data
const analyticsData = {
  totalStudents: mockStudents.length,
  activeRoutes: mockRoutes.filter((r) => r.isActive).length,
  totalBookings: mockBookings.length,
  totalRevenue: 1250,
  dailyBookings: [
    { day: "Mon", bookings: 45 },
    { day: "Tue", bookings: 52 },
    { day: "Wed", bookings: 48 },
    { day: "Thu", bookings: 61 },
    { day: "Fri", bookings: 55 },
    { day: "Sat", bookings: 32 },
    { day: "Sun", bookings: 28 },
  ],
  routePerformance: mockRoutes.map((route) => ({
    ...route,
    bookings: Math.floor(Math.random() * 100) + 20,
    revenue: Math.floor(Math.random() * 500) + 100,
    efficiency: Math.floor(Math.random() * 30) + 70,
  })),
  recentAlerts: [
    { id: 1, type: "warning", message: "Route 2 experiencing delays", time: "5 min ago" },
    { id: 2, type: "info", message: "New student registration pending", time: "15 min ago" },
    { id: 3, type: "success", message: "System backup completed", time: "1 hour ago" },
  ],
}

export default function AdminDashboard() {
  const stats = [
    {
      name: "Total Students",
      value: analyticsData.totalStudents.toString(),
      change: "+12%",
      changeType: "positive" as const,
      icon: Users,
    },
    {
      name: "Active Routes",
      value: analyticsData.activeRoutes.toString(),
      change: "No change",
      changeType: "neutral" as const,
      icon: Route,
    },
    {
      name: "Today's Bookings",
      value: "47",
      change: "+8%",
      changeType: "positive" as const,
      icon: Calendar,
    },
    {
      name: "Revenue (This Month)",
      value: `$${analyticsData.totalRevenue}`,
      change: "+15%",
      changeType: "positive" as const,
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600">Monitor your shuttle management system performance</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Clock className="mr-2 h-4 w-4" />
            Real-time View
          </Button>
          <Button className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">Generate Report</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stat.changeType === "positive" && <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />}
                {stat.changeType === "negative" && <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />}
                <span
                  className={
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : stat.changeType === "negative"
                        ? "text-red-600"
                        : "text-gray-600"
                  }
                >
                  {stat.change}
                </span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Route Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Route Performance</CardTitle>
            <CardDescription>Current performance metrics for all active routes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.routePerformance.map((route) => (
                <div key={route.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: route.color }} />
                    <div>
                      <p className="font-medium">{route.name}</p>
                      <p className="text-sm text-gray-500">{route.bookings} bookings today</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${route.revenue}</p>
                    <Badge variant={route.efficiency > 80 ? "default" : "secondary"}>
                      {route.efficiency}% efficient
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Recent system notifications and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    {alert.type === "warning" && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                    {alert.type === "info" && <Clock className="h-5 w-5 text-blue-500" />}
                    {alert.type === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Route className="h-6 w-6" />
              <span>Add New Route</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <MapPin className="h-6 w-6" />
              <span>Add Bus Stop</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Users className="h-6 w-6" />
              <span>Manage Students</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <CreditCard className="h-6 w-6" />
              <span>Allocate Points</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
