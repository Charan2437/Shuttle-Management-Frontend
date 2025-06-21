"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  MapPin,
  Clock,
  Bus,
  Navigation,
  Search,
  Filter,
  Route,
  Users,
  Star,
  Zap,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { formatTime } from "@/lib/utils"

interface Stop {
  id: string
  name: string
  coordinates: { lat: number; lng: number }
  facilities: string[]
  estimatedTime?: number
}

interface RouteInfo {
  id: string
  name: string
  stops: Stop[]
  color: string
  operatingHours: { start: string; end: string }
  frequency: number // minutes
  estimatedDuration: number
  fareStructure: { basePrice: number; peakMultiplier: number }
  currentOccupancy: "Low" | "Medium" | "High"
  nextDepartures: Date[]
  isActive: boolean
  rating: number
}

export default function RoutesAndStops() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRoute, setSelectedRoute] = useState<string>("all")
  const [facilityFilter, setFacilityFilter] = useState<string>("all")

  // Mock routes data
  const routes: RouteInfo[] = [
    {
      id: "route1",
      name: "Campus Loop",
      color: "#1e3a5f",
      stops: [
        { id: "stop1", name: "Main Gate", coordinates: { lat: 0, lng: 0 }, facilities: ["WiFi", "Shelter", "Seating"] },
        { id: "stop2", name: "Library", coordinates: { lat: 0, lng: 0 }, facilities: ["WiFi", "Shelter", "Lighting"] },
        {
          id: "stop3",
          name: "Engineering Building",
          coordinates: { lat: 0, lng: 0 },
          facilities: ["Shelter", "Seating"],
        },
        {
          id: "stop4",
          name: "Cafeteria",
          coordinates: { lat: 0, lng: 0 },
          facilities: ["WiFi", "Shelter", "Seating", "Vending"],
        },
        {
          id: "stop5",
          name: "Dormitory Block A",
          coordinates: { lat: 0, lng: 0 },
          facilities: ["Shelter", "Lighting"],
        },
      ],
      operatingHours: { start: "06:00", end: "22:00" },
      frequency: 15,
      estimatedDuration: 25,
      fareStructure: { basePrice: 20, peakMultiplier: 1.25 },
      currentOccupancy: "Medium",
      nextDepartures: [
        new Date(Date.now() + 5 * 60 * 1000),
        new Date(Date.now() + 20 * 60 * 1000),
        new Date(Date.now() + 35 * 60 * 1000),
      ],
      isActive: true,
      rating: 4.5,
    },
    {
      id: "route2",
      name: "Academic Circuit",
      color: "#059669",
      stops: [
        { id: "stop6", name: "Science Block", coordinates: { lat: 0, lng: 0 }, facilities: ["WiFi", "Shelter"] },
        {
          id: "stop7",
          name: "Engineering Building",
          coordinates: { lat: 0, lng: 0 },
          facilities: ["Shelter", "Seating"],
        },
        { id: "stop8", name: "Library", coordinates: { lat: 0, lng: 0 }, facilities: ["WiFi", "Shelter", "Lighting"] },
        {
          id: "stop9",
          name: "Admin Building",
          coordinates: { lat: 0, lng: 0 },
          facilities: ["Shelter", "Seating", "Information"],
        },
      ],
      operatingHours: { start: "07:00", end: "19:00" },
      frequency: 20,
      estimatedDuration: 18,
      fareStructure: { basePrice: 25, peakMultiplier: 1.2 },
      currentOccupancy: "Low",
      nextDepartures: [new Date(Date.now() + 8 * 60 * 1000), new Date(Date.now() + 28 * 60 * 1000)],
      isActive: true,
      rating: 4.2,
    },
    {
      id: "route3",
      name: "Residential Route",
      color: "#dc2626",
      stops: [
        {
          id: "stop10",
          name: "Dormitory Block A",
          coordinates: { lat: 0, lng: 0 },
          facilities: ["Shelter", "Lighting"],
        },
        {
          id: "stop11",
          name: "Dormitory Block B",
          coordinates: { lat: 0, lng: 0 },
          facilities: ["WiFi", "Shelter", "Seating"],
        },
        {
          id: "stop12",
          name: "Sports Complex",
          coordinates: { lat: 0, lng: 0 },
          facilities: ["Shelter", "Seating", "Water"],
        },
        { id: "stop13", name: "Medical Center", coordinates: { lat: 0, lng: 0 }, facilities: ["Shelter", "Emergency"] },
      ],
      operatingHours: { start: "06:30", end: "23:00" },
      frequency: 12,
      estimatedDuration: 15,
      fareStructure: { basePrice: 15, peakMultiplier: 1.3 },
      currentOccupancy: "High",
      nextDepartures: [new Date(Date.now() + 3 * 60 * 1000), new Date(Date.now() + 15 * 60 * 1000)],
      isActive: true,
      rating: 4.8,
    },
  ]

  // Get all unique stops
  const allStops = routes
    .flatMap((route) => route.stops)
    .filter((stop, index, self) => self.findIndex((s) => s.id === stop.id) === index)

  // Filter stops based on search and filters
  const filteredStops = allStops.filter((stop) => {
    const matchesSearch = stop.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFacility = facilityFilter === "all" || stop.facilities.includes(facilityFilter)
    return matchesSearch && matchesFacility
  })

  // Filter routes
  const filteredRoutes = selectedRoute === "all" ? routes : routes.filter((route) => route.id === selectedRoute)

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

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
        <span className="text-sm ml-1">{rating}</span>
      </div>
    )
  }

  const getFacilityIcon = (facility: string) => {
    switch (facility) {
      case "WiFi":
        return "📶"
      case "Shelter":
        return "🏠"
      case "Seating":
        return "🪑"
      case "Lighting":
        return "💡"
      case "Vending":
        return "🥤"
      case "Information":
        return "ℹ️"
      case "Emergency":
        return "🚨"
      case "Water":
        return "💧"
      default:
        return "📍"
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Routes & Stops</h1>
            <p className="text-gray-600">Explore available shuttle routes and stop information</p>
          </div>
          <Button asChild className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
            <Link href="/dashboard/student/book">
              <Bus className="mr-2 h-4 w-4" />
              Book Shuttle
            </Link>
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
              <Route className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{routes.filter((r) => r.isActive).length}</div>
              <p className="text-xs text-muted-foreground">Currently operating</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stops</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allStops.length}</div>
              <p className="text-xs text-muted-foreground">Across campus</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Frequency</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(routes.reduce((acc, r) => acc + r.frequency, 0) / routes.length)} min
              </div>
              <p className="text-xs text-muted-foreground">Between shuttles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Service Hours</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">16.5</div>
              <p className="text-xs text-muted-foreground">Hours daily</p>
            </CardContent>
          </Card>
        </div>

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
                  placeholder="Search stops..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by route" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Routes</SelectItem>
                  {routes.map((route) => (
                    <SelectItem key={route.id} value={route.id}>
                      {route.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={facilityFilter} onValueChange={setFacilityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by facility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Facilities</SelectItem>
                  <SelectItem value="WiFi">WiFi</SelectItem>
                  <SelectItem value="Shelter">Shelter</SelectItem>
                  <SelectItem value="Seating">Seating</SelectItem>
                  <SelectItem value="Lighting">Lighting</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedRoute("all")
                  setFacilityFilter("all")
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Routes Section */}
        <Card>
          <CardHeader>
            <CardTitle>Available Routes</CardTitle>
            <CardDescription>Current shuttle routes with real-time information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {filteredRoutes.map((route) => (
                <div key={route.id} className="border rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: route.color }}></div>
                      <div>
                        <h3 className="text-xl font-semibold">{route.name}</h3>
                        <p className="text-sm text-gray-500">
                          {route.stops.length} stops • {route.estimatedDuration} min journey
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getOccupancyColor(route.currentOccupancy)}>
                        {route.currentOccupancy} occupancy
                      </Badge>
                      {renderStars(route.rating)}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>
                          Operating: {route.operatingHours.start} - {route.operatingHours.end}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Bus className="h-4 w-4 text-gray-400" />
                        <span>Every {route.frequency} minutes</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>Base fare: {route.fareStructure.basePrice} pts</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Zap className="h-4 w-4 text-gray-400" />
                        <span>Peak: +{Math.round((route.fareStructure.peakMultiplier - 1) * 100)}%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Next departures:</div>
                      <div className="space-y-1">
                        {route.nextDepartures.slice(0, 2).map((departure, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            {formatTime(departure)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Route Stops */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Route Stops</h4>
                    <div className="flex flex-wrap gap-2">
                      {route.stops.map((stop, index) => (
                        <div key={stop.id} className="flex items-center space-x-2">
                          <Badge variant="outline" className="flex items-center space-x-1">
                            <span>{index + 1}</span>
                            <span>{stop.name}</span>
                          </Badge>
                          {index < route.stops.length - 1 && <span className="text-gray-400">→</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button asChild size="sm" className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
                      <Link href={`/dashboard/student/book?route=${route.id}`}>Book This Route</Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      <Navigation className="mr-2 h-4 w-4" />
                      Track Live
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stops Section */}
        <Card>
          <CardHeader>
            <CardTitle>All Stops ({filteredStops.length})</CardTitle>
            <CardDescription>Complete list of shuttle stops with facilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredStops.map((stop) => (
                <div key={stop.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{stop.name}</h4>
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">Available facilities:</div>
                    <div className="flex flex-wrap gap-1">
                      {stop.facilities.map((facility) => (
                        <Badge key={facility} variant="secondary" className="text-xs">
                          {getFacilityIcon(facility)} {facility}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Served by:{" "}
                    {routes
                      .filter((r) => r.stops.some((s) => s.id === stop.id))
                      .map((r) => r.name)
                      .join(", ")}
                  </div>
                </div>
              ))}
            </div>

            {filteredStops.length === 0 && (
              <div className="text-center py-8">
                <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No stops found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service Status */}
        <Card>
          <CardHeader>
            <CardTitle>Service Status</CardTitle>
            <CardDescription>Current system status and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-green-800">All Routes Operational</div>
                  <div className="text-sm text-green-600">Normal service on all routes</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <div>
                  <div className="font-medium text-yellow-800">Peak Hours Active</div>
                  <div className="text-sm text-yellow-600">Higher fares and demand expected until 9:00 AM</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Navigation className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="font-medium text-blue-800">Real-time Tracking Available</div>
                  <div className="text-sm text-blue-600">Live shuttle locations and arrival times</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
