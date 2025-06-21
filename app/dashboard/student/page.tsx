"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bus, CreditCard, Calendar, MapPin, ArrowLeft, Clock, Route, TrendingUp, Star } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { formatTime, formatDate } from "@/lib/utils"

export default function StudentDashboard() {
  const { toast } = useToast()
  const [currentTime, setCurrentTime] = useState(new Date())

  // Get student info from localStorage
  const [student, setStudent] = useState<{ name: string; email: string; studentId?: string } | null>(null)
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user")
      const studentId = localStorage.getItem("studentId")
      if (userStr) {
        const user = JSON.parse(userStr)
        setStudent({
          name: user.name,
          email: user.email,
          studentId: user.studentId || studentId || "-"
        })
      }
    } catch {
      setStudent(null)
    }
  }, [])

  // State for API data
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [walletData, setWalletData] = useState<any | null>(null)
  const [travelAnalytics, setTravelAnalytics] = useState<any | null>(null)
  const [frequentRoutes, setFrequentRoutes] = useState<any[]>([])
  const [recentTrips, setRecentTrips] = useState<any[]>([])
  const [upcomingBooking, setUpcomingBooking] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookingLoading, setBookingLoading] = useState(false)

  // Fetch wallet balance
  useEffect(() => {
    async function fetchWalletBalance() {
      const jwt = localStorage.getItem("jwt")
      if (!jwt) return

      try {
        const res = await fetch("http://localhost:8081/api/student/wallet", {
          headers: { Authorization: `Bearer ${jwt}` },
        })
        if (res.ok) {
          const data = await res.json()
          setWalletData(data)
          setWalletBalance(data.walletBalance || 0)
        }
      } catch (err) {
        console.error("Error fetching wallet balance:", err)
      }
    }
    fetchWalletBalance()
  }, [])

  // Fetch travel analytics
  useEffect(() => {
    async function fetchTravelAnalytics() {
      const jwt = localStorage.getItem("jwt")
      if (!jwt) return

      try {
        const res = await fetch("http://localhost:8081/api/student/bookings/analytics/travel", {
          headers: { Authorization: `Bearer ${jwt}` },
        })
        if (res.ok) {
          const data = await res.json()
          setTravelAnalytics(data)
        }
      } catch (err) {
        console.error("Error fetching travel analytics:", err)
      }
    }
    fetchTravelAnalytics()
  }, [])

  // Fetch frequent routes
  useEffect(() => {
    async function fetchFrequentRoutes() {
      const jwt = localStorage.getItem("jwt")
      if (!jwt) return

      try {
        const res = await fetch("http://localhost:8081/api/student/bookings/routes/frequent", {
          headers: { Authorization: `Bearer ${jwt}` },
        })
        if (res.ok) {
          const data = await res.json()
          setFrequentRoutes(data.slice(0, 3)) // Show top 3 routes
        }
      } catch (err) {
        console.error("Error fetching frequent routes:", err)
      }
    }
    fetchFrequentRoutes()
  }, [])

  // Fetch recent trips
  useEffect(() => {
    async function fetchRecentTrips() {
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
        // Map snake_case to camelCase and take only recent 3 trips
        setRecentTrips(
          data.slice(0, 3).map((t: any) => ({
            id: t.bookingid,
            fromStop: t.fromstop,
            toStop: t.tostop,
            route: t.routename,
            date: new Date(t.scheduledtime),
            pointsDeducted: t.pointsdeducted,
            status: t.status,
          }))
        )
      } catch (err: any) {
        setError(err.message || "Error loading recent trips")
      } finally {
        setLoading(false)
      }
    }
    fetchRecentTrips()
  }, [])

  // Fetch upcoming booking
  useEffect(() => {
    async function fetchUpcomingBooking() {
      const jwt = localStorage.getItem("jwt")
      if (!jwt) return

      try {
        const res = await fetch("http://localhost:8081/api/student/bookings/upcoming", {
          headers: { Authorization: `Bearer ${jwt}` },
        })
        if (res.ok) {
          const data = await res.json()
          if (data && data.length > 0) {
            setUpcomingBooking(data[0]) // Take the first upcoming booking
          } else {
            setUpcomingBooking(null)
          }
        }
      } catch (err) {
        console.error("Error fetching upcoming booking:", err)
        setUpcomingBooking(null)
      }
    }
    fetchUpcomingBooking()
  }, [])

  // Cancel booking function
  const handleCancelBooking = async (bookingId: string) => {
    setBookingLoading(true)
    const jwt = localStorage.getItem("jwt")
    if (!jwt) {
      toast({
        title: "Error",
        description: "Not authenticated",
        variant: "destructive",
      })
      setBookingLoading(false)
      return
    }

    try {
      const res = await fetch(`http://localhost:8081/api/student/bookings/cancel/${bookingId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${jwt}` },
      })
      
      if (res.ok) {
        toast({
          title: "Success",
          description: "Booking cancelled successfully",
        })
        setUpcomingBooking(null) // Remove the booking from display
      } else {
        const errorData = await res.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to cancel booking",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to cancel booking",
        variant: "destructive",
      })
    } finally {
      setBookingLoading(false)
    }
  }

  // Mark booking as completed function
  const handleMarkCompleted = async (bookingId: string) => {
    setBookingLoading(true)
    const jwt = localStorage.getItem("jwt")
    if (!jwt) {
      toast({
        title: "Error",
        description: "Not authenticated",
        variant: "destructive",
      })
      setBookingLoading(false)
      return
    }

    try {
      const res = await fetch(`http://localhost:8081/api/student/bookings/mark-completed/${bookingId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${jwt}` },
      })
      
      if (res.ok) {
        toast({
          title: "Success",
          description: "Booking marked as completed",
        })
        setUpcomingBooking(null) // Remove the booking from display
      } else {
        const errorData = await res.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to mark booking as completed",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to mark booking as completed",
        variant: "destructive",
      })
    } finally {
      setBookingLoading(false)
    }
  }

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getBalanceStatus = (balance: number) => {
    if (balance >= 1000) return { status: "Healthy", color: "bg-green-500" }
    if (balance >= 500) return { status: "Moderate", color: "bg-yellow-500" }
    return { status: "Low", color: "bg-red-500" }
  }

  const balanceStatus = getBalanceStatus(walletBalance || 0)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/" className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Home
                </Link>
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white font-semibold">
                {student?.name
                  ? student.name.split(" ").map((n) => n[0]).join("")
                  : "--"}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {student?.name || "--"}!</h1>
                <p className="text-gray-600">
                  {student?.email || "--"} • {student?.studentId || "--"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button asChild variant="outline">
              <Link href="/dashboard/student/book">
                <Bus className="mr-2 h-4 w-4" />
                Book Shuttle
              </Link>
            </Button>
            <Button asChild className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
              <Link href="/dashboard/student/wallet">
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Wallet
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${balanceStatus.color}`} />
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {walletBalance !== null ? `${walletBalance} pts` : "Loading..."}
              </div>
              <p className="text-xs text-muted-foreground">
                Status: <span className="font-medium">{balanceStatus.status}</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {travelAnalytics ? travelAnalytics.totalTrips : "Loading..."}
              </div>
              <p className="text-xs text-muted-foreground">Trips completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorite Route</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {travelAnalytics?.favoriteRoute ? travelAnalytics.favoriteRoute.routeName : "Loading..."}
              </div>
              <p className="text-xs text-muted-foreground">
                {travelAnalytics?.favoriteRoute ? `${travelAnalytics.favoriteRoute.tripCount} trips` : "Most used route"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Points Spent</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {walletData ? walletData.totalSpent : "Loading..."}
              </div>
              <p className="text-xs text-muted-foreground">Total points spent</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Upcoming Booking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Next Booking
              </CardTitle>
              <CardDescription>Your upcoming shuttle reservation</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingBooking ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {upcomingBooking.status?.toUpperCase() || "CONFIRMED"}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {formatTime(new Date(upcomingBooking.scheduledtime || upcomingBooking.scheduledTime))}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">From:</span>
                      <span className="font-medium">{upcomingBooking.fromstop || upcomingBooking.fromStop}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">To:</span>
                      <span className="font-medium">{upcomingBooking.tostop || upcomingBooking.toStop}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Route:</span>
                      <span className="font-medium">{upcomingBooking.routename || upcomingBooking.route}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Booking ID:</span>
                      <span className="font-medium">{upcomingBooking.bookingid || upcomingBooking.id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Cost:</span>
                      <span className="font-medium">{upcomingBooking.pointsdeducted || upcomingBooking.pointsDeducted} pts</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => handleMarkCompleted(upcomingBooking.bookingid || upcomingBooking.id)}
                      disabled={bookingLoading}
                    >
                      {bookingLoading ? "Processing..." : "Mark Completed"}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      className="flex-1" 
                      onClick={() => handleCancelBooking(upcomingBooking.bookingid || upcomingBooking.id)}
                      disabled={bookingLoading}
                    >
                      {bookingLoading ? "Processing..." : "Cancel"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">No upcoming bookings</p>
                  <Button asChild>
                    <Link href="/dashboard/student/book">Book a Shuttle</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Trips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Route className="mr-2 h-5 w-5" />
                Recent Trips
              </CardTitle>
              <CardDescription>Your latest shuttle journeys</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1e3a5f] mx-auto mb-2"></div>
                    <p className="text-gray-500">Loading recent trips...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-4">
                    <p className="text-red-500">{error}</p>
                  </div>
                ) : recentTrips.length > 0 ? (
                  recentTrips.map((trip) => (
                    <div key={trip.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {trip.fromStop} → {trip.toStop}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(trip.date)} • {trip.pointsDeducted} pts
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {trip.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <Route className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-500">No recent trips found</p>
                  </div>
                )}
                <Button asChild variant="outline" className="w-full">
                  <Link href="/dashboard/student/history">View All History</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Frequent Routes & Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Frequent Routes */}
          <Card>
            <CardHeader>
              <CardTitle>Frequent Routes</CardTitle>
              <CardDescription>Your most used routes with statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {frequentRoutes.length > 0 ? (
                  frequentRoutes.map((route, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{route.routename || route.routeName}</div>
                        <div className="text-sm text-gray-500">
                          {route.fromstop || route.fromStop} → {route.tostop || route.toStop}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {route.tripcount || route.tripCount} trips
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        #{index + 1}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <Route className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-500">No frequent routes found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Frequently used features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/dashboard/student/book">
                    <Bus className="mr-2 h-4 w-4" />
                    Book New Trip
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/dashboard/student/routes">
                    <MapPin className="mr-2 h-4 w-4" />
                    View Routes & Stops
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/dashboard/student/wallet">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Recharge Wallet
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/dashboard/student/history">
                    <Calendar className="mr-2 h-4 w-4" />
                    Trip History
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
