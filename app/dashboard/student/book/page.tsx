"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  MapPin,
  Clock,
  Route,
  CreditCard,
  Navigation,
  RefreshCw,
  ArrowRight,
  Bus,
  Users,
  Zap,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { formatTime } from "@/lib/utils"

interface RouteOption {
  id: string
  name: string
  fromStop: string
  toStop: string
  duration: number
  cost: number
  transfers: number
  occupancy: "Low" | "Medium" | "High"
  nextDeparture: Date
  type: "Direct" | "Transfer"
  transferDetails?: {
    transferStop: string
    waitTime: number
    totalDuration: number
  }
}

export default function BookShuttle() {
  const { toast } = useToast()
  const [fromStop, setFromStop] = useState("")
  const [toStop, setToStop] = useState("")
  const [departureTime, setDepartureTime] = useState("")
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([])
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<string | null>(null)
  // --- stops integration ---
  const [stops, setStops] = useState<{ id: string; name: string }[]>([])
  const [stopsLoading, setStopsLoading] = useState(true)
  const [stopsError, setStopsError] = useState<string | null>(null)

  // --- Wallet Balance State ---
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [walletLoading, setWalletLoading] = useState(true)
  const [walletError, setWalletError] = useState<string | null>(null)

  // --- Store optimize API response for booking ---
  const [optimizeApiResponse, setOptimizeApiResponse] = useState<any[]>([])

  // Mock route options
  const mockRouteOptions: RouteOption[] = [
    {
      id: "route1",
      name: "Campus Loop",
      fromStop: "Library",
      toStop: "Dormitory Block A",
      duration: 15,
      cost: 25,
      transfers: 0,
      occupancy: "Low",
      nextDeparture: new Date(Date.now() + 10 * 60 * 1000),
      type: "Direct",
    },
    {
      id: "route2",
      name: "Academic Circuit + Residential",
      fromStop: "Library",
      toStop: "Dormitory Block A",
      duration: 12,
      cost: 20,
      transfers: 1,
      occupancy: "Medium",
      nextDeparture: new Date(Date.now() + 5 * 60 * 1000),
      type: "Transfer",
      transferDetails: {
        transferStop: "Main Gate",
        waitTime: 3,
        totalDuration: 12,
      },
    },
    {
      id: "route3",
      name: "Express Route",
      fromStop: "Library",
      toStop: "Dormitory Block A",
      duration: 8,
      cost: 35,
      transfers: 0,
      occupancy: "High",
      nextDeparture: new Date(Date.now() + 15 * 60 * 1000),
      type: "Direct",
    },
  ]

  useEffect(() => {
    setStopsLoading(true)
    const jwt = localStorage.getItem("jwt")
    fetch("http://localhost:8081/api/stops", jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : undefined)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch stops")
        const data = await res.json()
        setStops(data.filter((s: any) => s.isActive).map((s: any) => ({ id: s.id, name: s.name })))
        setStopsError(null)
      })
      .catch((err) => {
        setStopsError("Could not load stops. Please try again later.")
        setStops([])
      })
      .finally(() => setStopsLoading(false))
  }, [])

  // Fetch wallet balance
  useEffect(() => {
    const jwt = localStorage.getItem("jwt")
    if (!jwt) return
    async function fetchWallet() {
      setWalletLoading(true)
      setWalletError(null)
      try {
        const res = await fetch("http://localhost:8081/api/student/wallet", {
          headers: { Authorization: `Bearer ${jwt}` },
        })
        if (!res.ok) throw new Error("Failed to fetch wallet data")
        const data = await res.json()
        setWalletBalance(data.walletBalance)
      } catch (err: any) {
        setWalletError(err.message || "Error loading wallet data")
      } finally {
        setWalletLoading(false)
      }
    }
    fetchWallet()
  }, [])

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Mock location detection
          setCurrentLocation("Library")
          setFromStop("Library")
          toast({
            variant: "success",
            title: "Location Detected",
            description: "Your current location has been set to Library.",
          })
        },
        (error) => {
          toast({
            variant: "destructive",
            title: "Location Error",
            description: "Unable to detect your location. Please select manually.",
          })
        },
      )
    }
  }

  // Helper to get stop id by name
  const getStopIdByName = (name: string) => stops.find((s) => s.name === name)?.id

  // Search for routes
  const searchRoutes = async () => {
    if (!fromStop || !toStop) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select both departure and destination stops.",
      })
      return
    }

    if (fromStop === toStop) {
      toast({
        variant: "destructive",
        title: "Invalid Route",
        description: "Departure and destination stops cannot be the same.",
      })
      return
    }

    setIsSearching(true)
    setRouteOptions([])
    const start_stop_id = getStopIdByName(fromStop)
    const end_stop_id = getStopIdByName(toStop)
    if (!start_stop_id || !end_stop_id) {
      toast({
        variant: "destructive",
        title: "Invalid Stops",
        description: "Could not resolve stop IDs.",
      })
      setIsSearching(false)
      return
    }
    // Format departure_time to always have seconds
    let departure_time = ""
    if (departureTime) {
      // If user entered only HH:mm, append :00 for seconds
      const today = new Date().toISOString().split("T")[0]
      departure_time = `${today}T${departureTime.length === 5 ? departureTime + ':00' : departureTime}`
    } else {
      departure_time = new Date().toISOString().slice(0,19) // YYYY-MM-DDTHH:mm:ss
    }
    const url = `http://localhost:8081/api/routes/optimize?start_stop_id=${start_stop_id}&end_stop_id=${end_stop_id}&departure_time=${encodeURIComponent(departure_time)}`
    try {
      const jwt = localStorage.getItem("jwt")
      const res = await fetch(url, jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : undefined)
      if (!res.ok) throw new Error("Failed to fetch routes")
      const data = await res.json()
      console.log("Optimize API response:", data)
      setOptimizeApiResponse(data)
      // Map API response to RouteOption[]
      const mapped = data.map((route: any, idx: number) => {
        const firstLeg = route.legs[0]
        const lastLeg = route.legs[route.legs.length - 1]
        return {
          id: `route_${idx}`,
          name: route.legs.map((l: any) => l.route_name).join(" + "),
          fromStop: stops.find((s) => s.id === firstLeg.from)?.name || "",
          toStop: stops.find((s) => s.id === lastLeg.to)?.name || "",
          duration: route.total_time,
          cost: Math.round(route.total_cost),
          transfers: route.legs.length - 1,
          occupancy: route.max_crowding < 0.33 ? "Low" : route.max_crowding < 0.66 ? "Medium" : "High",
          nextDeparture: new Date(), // Not provided, so use now
          type: route.legs.length > 1 ? "Transfer" : "Direct",
          transferDetails: route.legs.length > 1 ? {
            transferStop: stops.find((s) => s.id === route.legs[0].to)?.name || "",
            waitTime: 0, // Not provided
            totalDuration: route.total_time,
          } : undefined,
        }
      })
      setRouteOptions(mapped)
      toast({
        variant: "success",
        title: "Routes Found",
        description: `Found ${mapped.length} route options for your journey.`,
      })
    } catch (err) {
      setRouteOptions([])
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch routes. Please try again.",
      })
    } finally {
      setIsSearching(false)
    }
  }

  // Book selected route
  const bookRoute = async () => {
    if (!selectedRoute) return
    if ((walletBalance ?? 0) < selectedRoute.cost) {
      toast({
        variant: "destructive",
        title: "Insufficient Balance",
        description: "Please recharge your wallet to book this trip.",
      })
      return
    }
    const jwt = localStorage.getItem("jwt")
    const studentId = localStorage.getItem("studentId")
    if (!jwt || !studentId) {
      toast({
        variant: "destructive",
        title: "Not Authenticated",
        description: "Please log in again.",
      })
      return
    }
    // Use optimizeApiResponse from state
    const routeIdx = routeOptions.findIndex(r => r.id === selectedRoute.id)
    let legs: any[] = []
    // Helper to format date as YYYY-MM-DDTHH:mm:ss
    function formatDateTimeNoMs(date: Date | string) {
      const d = typeof date === "string" ? new Date(date) : date
      const pad = (n: number) => n.toString().padStart(2, "0")
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    }
    if (optimizeApiResponse && Array.isArray(optimizeApiResponse) && optimizeApiResponse[routeIdx]) {
      legs = optimizeApiResponse[routeIdx].legs.map((leg: any) => ({
        routeId: leg.route_id,
        fromStopId: leg.from,
        toStopId: leg.to,
        scheduledTime: leg.scheduled_time ? formatDateTimeNoMs(leg.scheduled_time) : formatDateTimeNoMs(new Date()),
        cost: leg.cost
      }))
    } else {
      legs = [{
        routeId: "",
        fromStopId: stops.find(s => s.name === selectedRoute.fromStop)?.id,
        toStopId: stops.find(s => s.name === selectedRoute.toStop)?.id,
        scheduledTime: formatDateTimeNoMs(new Date()),
        cost: selectedRoute.cost
      }]
    }
    // Validate all fields
    const uuidRegex = /^[0-9a-fA-F-]{36}$/
    for (let i = 0; i < legs.length; i++) {
      const l = legs[i]
      if (!uuidRegex.test(l.routeId) || !uuidRegex.test(l.fromStopId) || !uuidRegex.test(l.toStopId)) {
        toast({
          variant: "destructive",
          title: "Booking Failed",
          description: `Invalid data in booking request at leg ${i + 1}. Please try another route or contact support.`,
        })
        return
      }
    }
    // Print request body for debugging
    const requestBody = { studentId, legs, totalCost: selectedRoute.cost }
    console.log("Booking request body:", requestBody)
    try {
      const res = await fetch("http://localhost:8081/api/student/bookings/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(requestBody),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast({
          variant: "success",
          title: "Booking Confirmed",
          description: `Reference: ${data.bookingReference}`,
        })
        setWalletBalance((prev) => (prev ?? 0) - selectedRoute.cost)
        setSelectedRoute(null)
        setRouteOptions([])
        setFromStop("")
        setToStop("")
      } else {
        toast({
          variant: "destructive",
          title: "Booking Failed",
          description: data.message || "Could not confirm booking.",
        })
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Could not confirm booking.",
      })
    }
  }

  const getOccupancyColor = (occupancy: string) => {
    switch (occupancy) {
      case "Low":
        return "bg-green-100 text-green-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "High":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
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
            <h1 className="text-2xl font-bold text-gray-900">Book a Shuttle</h1>
            <p className="text-gray-600">Find the best route for your journey</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Wallet Balance</div>
            <div className="text-xl font-bold text-[#1e3a5f]">
              {walletLoading ? "..." : walletError ? "--" : `${walletBalance ?? 0} pts`}
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Journey Details
            </CardTitle>
            <CardDescription>Select your departure and destination stops</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="from">From</Label>
                <div className="flex space-x-2">
                  <Select value={fromStop} onValueChange={setFromStop} disabled={stopsLoading || !!stopsError}>
                    <SelectTrigger>
                      <SelectValue placeholder={stopsLoading ? "Loading stops..." : stopsError ? stopsError : "Select departure stop"} />
                    </SelectTrigger>
                    <SelectContent>
                      {stops.map((stop) => (
                        <SelectItem key={stop.id} value={stop.name}>
                          {stop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={getCurrentLocation} title="Use current location" disabled={stopsLoading || !!stopsError}>
                    <Navigation className="h-4 w-4" />
                  </Button>
                </div>
                {currentLocation && <p className="text-xs text-green-600">📍 Current location: {currentLocation}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="to">To</Label>
                <Select value={toStop} onValueChange={setToStop} disabled={stopsLoading || !!stopsError}>
                  <SelectTrigger>
                    <SelectValue placeholder={stopsLoading ? "Loading stops..." : stopsError ? stopsError : "Select destination stop"} />
                  </SelectTrigger>
                  <SelectContent>
                    {stops.map((stop) => (
                      <SelectItem key={stop.id} value={stop.name}>
                        {stop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Preferred Departure Time (Optional)</Label>
              <Input
                id="time"
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="max-w-xs"
              />
            </div>

            <Button onClick={searchRoutes} disabled={isSearching} className="w-full bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
              {isSearching ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Searching Routes...
                </>
              ) : (
                <>
                  <Route className="mr-2 h-4 w-4" />
                  Find Best Routes
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Route Options */}
        {routeOptions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Available Routes</CardTitle>
              <CardDescription>Choose the best option for your journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {routeOptions.map((route) => (
                <div
                  key={route.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedRoute?.id === route.id
                      ? "border-[#1e3a5f] bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedRoute(route)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="font-semibold text-lg">{route.name}</div>
                      <Badge variant="secondary" className={getOccupancyColor(route.occupancy)}>
                        {route.occupancy} occupancy
                      </Badge>
                      {route.type === "Transfer" && <Badge variant="outline">{route.transfers} Transfer</Badge>}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#1e3a5f]">{route.cost} pts</div>
                      <div className="text-sm text-gray-500">per person</div>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{route.duration} min</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Bus className="h-4 w-4 text-gray-400" />
                      <span>Next: {formatTime(route.nextDeparture)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{route.occupancy} demand</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-gray-400" />
                      <span>{route.type}</span>
                    </div>
                  </div>

                  {route.transferDetails && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <div className="flex items-center space-x-2 text-sm text-yellow-800">
                        <AlertCircle className="h-4 w-4" />
                        <span>
                          Transfer at {route.transferDetails.transferStop} •{route.transferDetails.waitTime} min wait
                          time
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{route.fromStop}</span>
                      <ArrowRight className="h-4 w-4" />
                      <span>{route.toStop}</span>
                    </div>
                    {selectedRoute?.id === route.id && <Badge className="bg-[#1e3a5f]">Selected</Badge>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Booking Confirmation */}
        {selectedRoute && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Confirm Booking
              </CardTitle>
              <CardDescription>Review your selection and confirm</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Route:</span>
                    <span className="font-medium">{selectedRoute.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Journey:</span>
                    <span className="font-medium">
                      {selectedRoute.fromStop} → {selectedRoute.toStop}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Departure:</span>
                    <span className="font-medium">{formatTime(selectedRoute.nextDeparture)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">{selectedRoute.duration} minutes</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total Cost:</span>
                    <span>{selectedRoute.cost} points</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Remaining Balance:</span>
                    <span>{walletBalance! - selectedRoute.cost} points</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={bookRoute}
                className="w-full bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
                disabled={walletBalance! < selectedRoute.cost}
              >
                {walletBalance! < selectedRoute.cost ? "Insufficient Balance - Recharge Wallet" : "Confirm Booking"}
              </Button>

              {walletBalance! < selectedRoute.cost && (
                <Button asChild variant="outline" className="w-full">
                  <Link href="/dashboard/student/wallet">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Recharge Wallet
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
