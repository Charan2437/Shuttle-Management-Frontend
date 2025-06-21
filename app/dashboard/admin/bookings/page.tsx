"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  User,
  Clock,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
} from "lucide-react"
import { formatDate, formatTime } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function BookingManagement() {
  const { toast } = useToast()
  const [bookings, setBookings] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(false)

  // Fetch bookings from API
  useEffect(() => {
    async function fetchBookings() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (statusFilter !== "all") params.append("status", statusFilter)
        if (searchTerm) params.append("search", searchTerm)
        const jwt = localStorage.getItem("jwt");
        const res = await fetch(`http://localhost:8081/api/admin/bookings?${params.toString()}`, jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : undefined)
        if (!res.ok) throw new Error("Failed to fetch bookings")
        const data = await res.json()
        // If paginated, use data.content; else use data
        setBookings(Array.isArray(data.content) ? data.content : data)
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Failed to load bookings",
          description: "Could not fetch bookings from the server.",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [statusFilter, searchTerm])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:8081/api/admin/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      const result = await res.json()
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        )
      )
      toast({
        variant: "success",
        title: "Booking Status Updated",
        description: `Booking ${bookingId.slice(-8)} status changed to ${newStatus}.`,
      })
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to update status",
        description: "Could not update booking status.",
      })
    }
  }

  // Ensure bookings is always an array
  const safeBookings: any[] = Array.isArray(bookings) ? bookings : [];

  const bookingStats = {
    total: safeBookings.length,
    confirmed: safeBookings.filter((b) => b.status === "confirmed").length,
    completed: safeBookings.filter((b) => b.status === "completed").length,
    cancelled: safeBookings.filter((b) => b.status === "cancelled").length,
    pending: safeBookings.filter((b) => b.status === "pending").length,
  }

  // Export bookings as CSV (frontend only)
  const handleExportReport = () => {
    if (!safeBookings.length) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "No bookings to export.",
      })
      return
    }
    // Define CSV headers
    const headers = [
      "Booking ID",
      "Student Name",
      "Student ID",
      "Route Name",
      "From Stop",
      "To Stop",
      "Scheduled Time",
      "Status",
      "Points Deducted",
      "Booking Reference",
      "Notes",
      "Created At"
    ]
    // Map bookings to CSV rows
    const rows = safeBookings.map(b => [
      b.id,
      b.student?.name || "",
      b.student?.studentId || "",
      b.route?.name || "",
      b.fromStop?.name || "",
      b.toStop?.name || "",
      b.scheduledTime ? new Date(b.scheduledTime).toLocaleString() : "",
      b.status,
      b.pointsDeducted,
      b.bookingReference,
      b.notes || "",
      b.createdAt ? new Date(b.createdAt).toLocaleString() : ""
    ])
    // Convert to CSV string
    const csv = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(","))
      .join("\r\n")
    // Download
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bookings_report_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600">Monitor and manage all shuttle bookings</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleExportReport}>
            <Calendar className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingStats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{bookingStats.confirmed}</div>
            <p className="text-xs text-muted-foreground">Ready to go</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{bookingStats.completed}</div>
            <p className="text-xs text-muted-foreground">Finished trips</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{bookingStats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{bookingStats.cancelled}</div>
            <p className="text-xs text-muted-foreground">Cancelled trips</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by student name, ID, or booking ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings ({bookings.length})</CardTitle>
          <CardDescription>Manage and monitor shuttle bookings</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-center text-gray-500">Loading bookings...</div>
          ) : safeBookings.length === 0 ? (
            <div className="py-10 text-center text-gray-500">No bookings found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Journey</TableHead>
                  <TableHead>Scheduled Time</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeBookings.map((booking) => {
                  return (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="font-mono text-sm">{booking.id.slice(-8)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">{booking.student?.name}</div>
                            <div className="text-sm text-gray-500">{booking.student?.studentId}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: booking.route?.color }} />
                          <span>{booking.route?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 text-sm">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span>{booking.fromStop?.name}</span>
                          <span>→</span>
                          <span>{booking.toStop?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="text-sm">{formatDate(booking.scheduledTime)}</div>
                            <div className="text-xs text-gray-500">{formatTime(booking.scheduledTime)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <CreditCard className="h-4 w-4 text-gray-400" />
                          <span>{booking.pointsDeducted} pts</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(booking.status)}
                          {getStatusBadge(booking.status)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Select value={booking.status} onValueChange={(value) => handleStatusChange(booking.id, value)}>
                            <SelectTrigger className="w-[120px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
