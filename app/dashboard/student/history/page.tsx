"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Calendar,
  Download,
  Search,
  Filter,
  MapPin,
  Clock,
  CreditCard,
  Route,
  Star,
  TrendingUp,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { formatDate, formatTime } from "@/lib/utils"

interface TripHistory {
  id: string
  fromStop: string
  toStop: string
  route: string
  date: Date
  departureTime: Date
  arrivalTime: Date
  pointsDeducted: number
  status: "completed" | "cancelled" | "no-show"
  rating?: number
  transferRequired: boolean
  transferDetails?: {
    transferStop: string
    waitTime: number
  }
}

export default function TripHistory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [routeFilter, setRouteFilter] = useState("all")
  const [tripHistory, setTripHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTrips() {
      setLoading(true)
      setError(null)
      const jwt = localStorage.getItem("jwt")
      if (!jwt) {
        setError("Not authenticated")
        setLoading(false)
        return
      }
      try {
        const res = await fetch("http://localhost:8081/api/student/bookings/history", {
          headers: { Authorization: `Bearer ${jwt}` },
        })
        if (!res.ok) throw new Error("Failed to fetch trip history")
        const data = await res.json()
        console.log("Trip history API response:", data)
        // Map snake_case to camelCase for UI
        setTripHistory(
          data.map((t: any) => ({
            id: t.bookingid,
            fromStop: t.fromstop,
            toStop: t.tostop,
            route: t.routename,
            date: new Date(t.scheduledtime),
            departureTime: new Date(t.scheduledtime),
            arrivalTime: new Date(t.scheduledtime), // No arrival in API, use scheduled
            pointsDeducted: t.pointsdeducted,
            status: t.status,
            rating: undefined, // Not in API
            transferRequired: t.transfers && t.transfers.length > 0,
            transferDetails:
              t.transfers && t.transfers.length > 0
                ? t.transfers.map((tr: any) => ({
                    fromStop: tr.fromstop,
                    toStop: tr.tostop,
                    transferStop: tr.transferstop,
                    waitTime: tr.estimated_wait_time,
                    transferOrder: tr.transfer_order,
                  }))
                : [],
            bookingReference: t.bookingreference,
            createdAt: t.createdat,
          }))
        )
      } catch (err: any) {
        setError(err.message || "Error loading trip history")
      } finally {
        setLoading(false)
      }
    }
    fetchTrips()
  }, [])

  const [frequentRoutes, setFrequentRoutes] = useState<any[]>([])
  const [monthlyStats, setMonthlyStats] = useState<any>(null)

  useEffect(() => {
    async function fetchAnalytics() {
      const jwt = localStorage.getItem("jwt")
      if (!jwt) return

      // Frequent Routes
      const routesRes = await fetch("http://localhost:8081/api/student/bookings/routes/frequent", {
        headers: { Authorization: `Bearer ${jwt}` },
      })
      if (routesRes.ok) {
        const routesData = await routesRes.json()
        console.log("Frequent routes API response:", routesData)
        // Map snake_case to camelCase for UI
        setFrequentRoutes(
          routesData.map((r: any) => ({
            routeId: r.routeid || r.routeId,
            routeName: r.routename || r.routeName,
            fromStop: r.fromstop || r.fromStop,
            toStop: r.tostop || r.toStop,
            tripCount: r.tripcount || r.tripCount,
            lastUsed: r.lastused ? new Date(r.lastused) : null,
          }))
        )
      }

      // Monthly Statistics
      const statsRes = await fetch("http://localhost:8081/api/student/analytics/monthly", {
        headers: { Authorization: `Bearer ${jwt}` },
      })
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setMonthlyStats(statsData)
      }
    }
    fetchAnalytics()
  }, [])

  const [travelAnalytics, setTravelAnalytics] = useState<any | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTravelAnalytics() {
      setAnalyticsLoading(true)
      setAnalyticsError(null)
      const jwt = localStorage.getItem("jwt")
      if (!jwt) {
        setAnalyticsError("Not authenticated")
        setAnalyticsLoading(false)
        return
      }
      try {
        const res = await fetch("http://localhost:8081/api/student/bookings/analytics/travel", {
          headers: { Authorization: `Bearer ${jwt}` },
        })
        if (!res.ok) throw new Error("Failed to fetch travel analytics")
        const data = await res.json()
        setTravelAnalytics(data)
      } catch (err: any) {
        setAnalyticsError(err.message || "Error loading analytics")
      } finally {
        setAnalyticsLoading(false)
      }
    }
    fetchTravelAnalytics()
  }, [])

  // Filter trips based on search and filters
  const filteredTrips = tripHistory.filter((trip) => {
    const matchesSearch =
      trip.fromStop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.toStop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.route.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || trip.status === statusFilter
    const matchesRoute = routeFilter === "all" || trip.route === routeFilter

    return matchesSearch && matchesStatus && matchesRoute
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      case "no-show":
        return <Badge className="bg-gray-100 text-gray-800">No Show</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const renderStars = (rating?: number) => {
    if (!rating) return null
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/student" className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Trip History</h1>
            <p className="text-gray-600">View your past journeys and travel patterns</p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export History
          </Button>
        </div>

        {/* Monthly Overview */}
        <div className="grid gap-4 md:grid-cols-6">
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <div className="text-sm font-medium">Total Trips</div>
                <div className="text-2xl font-bold">
                  {analyticsLoading ? "..." : analyticsError ? "-" : travelAnalytics?.totalTrips ?? "-"}
                </div>
              </div>
            </CardHeader>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <div className="text-sm font-medium">Favorite Route</div>
                <div className="text-base font-semibold">
                  {analyticsLoading ? "..." : analyticsError ? "-" : travelAnalytics?.favoriteRoute?.routeName || "-"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {travelAnalytics?.favoriteRoute ? `${travelAnalytics.favoriteRoute.fromStop} → ${travelAnalytics.favoriteRoute.toStop}` : ""}
                </div>
              </div>
            </CardHeader>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <div className="text-sm font-medium">Peak Time</div>
                <div className="text-base font-semibold">
                  {analyticsLoading ? "..." : analyticsError ? "-" : travelAnalytics?.peakTime || "-"}
                </div>
              </div>
            </CardHeader>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <div className="text-sm font-medium">Avg. Rating</div>
                <div className="text-2xl font-bold">
                  {analyticsLoading ? "..." : analyticsError ? "-" : (travelAnalytics?.avgRating ?? "-")}
                </div>
              </div>
            </CardHeader>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <div className="text-sm font-medium">Points Spent</div>
                <div className="text-2xl font-bold">
                  {analyticsLoading ? "..." : analyticsError ? "-" : travelAnalytics?.totalPointsSpent ?? "-"}
                </div>
              </div>
            </CardHeader>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <div className="text-sm font-medium">Points Saved</div>
                <div className="text-2xl font-bold">
                  {analyticsLoading ? "..." : analyticsError ? "-" : travelAnalytics?.pointsSaved ?? "-"}
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
        {/* Usage Pattern Chart */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Usage Pattern</h2>
          {analyticsLoading ? (
            <div>Loading analytics...</div>
          ) : analyticsError ? (
            <div className="text-red-500">{analyticsError}</div>
          ) : travelAnalytics?.usagePattern ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {travelAnalytics.usagePattern.map((pattern: any) => (
                <Card key={pattern.period}>
                  <CardHeader>
                    <div className="text-sm font-medium">{pattern.period}</div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{pattern.trips}</div>
                    <div className="text-xs text-muted-foreground">{pattern.percentage}% of trips</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="history">Trip History</TabsTrigger>
            <TabsTrigger value="frequent">Frequent Routes</TabsTrigger>
            <TabsTrigger value="analytics">Travel Analytics</TabsTrigger>
          </TabsList>

          {/* Trip History Tab */}
          <TabsContent value="history" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="mr-2 h-5 w-5" />
                  Filter & Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search trips..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="no-show">No Show</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={routeFilter} onValueChange={setRouteFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by route" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Routes</SelectItem>
                      <SelectItem value="Campus Loop">Campus Loop</SelectItem>
                      <SelectItem value="Academic Circuit">Academic Circuit</SelectItem>
                      <SelectItem value="Residential Route">Residential Route</SelectItem>
                      <SelectItem value="Evening Express">Evening Express</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("")
                      setStatusFilter("all")
                      setRouteFilter("all")
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Trip List */}
            <Card>
              <CardHeader>
                <CardTitle>Your Trips ({filteredTrips.length})</CardTitle>
                <CardDescription>Detailed history of your shuttle journeys</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTrips.map((trip) => (
                    <div key={trip.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="font-semibold text-lg">{trip.route}</div>
                          {getStatusBadge(trip.status)}
                          {trip.transferRequired && <Badge variant="outline">Transfer Required</Badge>}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-[#1e3a5f]">
                            {trip.pointsDeducted > 0 ? `${trip.pointsDeducted} pts` : "Refunded"}
                          </div>
                          <div className="text-sm text-gray-500">{formatDate(trip.date)}</div>
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">From:</span>
                            <span className="font-medium">{trip.fromStop}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">To:</span>
                            <span className="font-medium">{trip.toStop}</span>
                          </div>
                          {trip.transferDetails && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Transfer at:</span>
                              <span className="font-medium">{trip.transferDetails.transferStop}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Departure:</span>
                            <span className="font-medium">{formatTime(trip.departureTime)}</span>
                          </div>
                          {trip.status === "completed" && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Arrival:</span>
                              <span className="font-medium">{formatTime(trip.arrivalTime)}</span>
                            </div>
                          )}
                          {trip.rating && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Rating:</span>
                              {renderStars(trip.rating)}
                            </div>
                          )}
                        </div>
                      </div>

                      {trip.transferDetails && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                          <div className="text-sm text-yellow-800">
                            Transfer journey with {trip.transferDetails.waitTime} min wait time at{" "}
                            {trip.transferDetails.transferStop}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {filteredTrips.length === 0 && (
                    <div className="text-center py-8">
                      <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">No trips found matching your criteria</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Frequent Routes Tab */}
          <TabsContent value="frequent" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Frequent Routes</CardTitle>
                <CardDescription>Routes you use most often with statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {frequentRoutes.length === 0 && (
                    <div className="text-center py-8">
                      <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">No frequent routes found</p>
                    </div>
                  )}
                  {frequentRoutes.map((route, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{route.routeName}</div>
                          <div className="text-sm text-gray-500">
                            {route.fromStop} → {route.toStop}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Last used: {route.lastUsed ? formatDate(route.lastUsed) + ' ' + formatTime(route.lastUsed) : '--'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-[#1e3a5f]">{route.tripCount} trips</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {analyticsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a5f] mx-auto mb-4"></div>
                <p className="text-gray-500">Loading analytics...</p>
              </div>
            ) : analyticsError ? (
              <div className="text-center py-8">
                <p className="text-red-500">{analyticsError}</p>
              </div>
            ) : travelAnalytics ? (
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="mr-2 h-5 w-5" />
                      Usage Patterns
                    </CardTitle>
                    <CardDescription>Your travel behavior analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {travelAnalytics.usagePattern?.map((pattern: any, index: number) => (
                        <div key={pattern.period} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{pattern.period}</span>
                            <span className="font-medium">{pattern.percentage}% ({pattern.trips} trips)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                index === 0 ? 'bg-blue-500' : 
                                index === 1 ? 'bg-green-500' : 'bg-purple-500'
                              }`} 
                              style={{ width: `${pattern.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cost Analysis</CardTitle>
                    <CardDescription>Your spending breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total points spent</span>
                        <span className="font-semibold">{travelAnalytics.totalPointsSpent} pts</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Average cost per trip</span>
                        <span className="font-semibold">
                          {travelAnalytics.totalTrips > 0 
                            ? Math.round(travelAnalytics.totalPointsSpent / travelAnalytics.totalTrips) 
                            : 0} pts
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Peak travel time</span>
                        <span className="font-semibold">{travelAnalytics.peakTime}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Favorite Route Card */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Route className="mr-2 h-5 w-5" />
                      Favorite Route
                    </CardTitle>
                    <CardDescription>Your most frequently used route</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {travelAnalytics.favoriteRoute ? (
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center font-semibold">
                            <Route className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="font-semibold text-lg">{travelAnalytics.favoriteRoute.routeName}</div>
                            <div className="text-sm text-gray-600">
                              {travelAnalytics.favoriteRoute.fromStop} → {travelAnalytics.favoriteRoute.toStop}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Route ID: {travelAnalytics.favoriteRoute.routeId}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#1e3a5f]">{travelAnalytics.favoriteRoute.tripCount} trips</div>
                          <div className="text-sm text-gray-500">Most used</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Route className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">No favorite route data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No analytics data available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
