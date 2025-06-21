"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Search,
  Filter,
  MoreHorizontal,
  Navigation,
  Wifi,
  Umbrella,
  Monitor,
  Phone,
  Droplets,
  Accessibility,
  Camera,
  Clock,
  Users,
  TrendingUp,
} from "lucide-react"
import { mockStops } from "@/lib/data/static-data"
import type { Stop } from "@/types"

// Add this import at the top
import { useToast } from "@/hooks/use-toast"

// Define Stop type matching backend
interface Stop {
  id?: string
  name: string
  description?: string
  latitude: number
  longitude: number
  address?: string
  isActive?: boolean
}

export default function StopManagement() {
  const { toast } = useToast()
  const [stops, setStops] = useState<Stop[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newStop, setNewStop] = useState<Stop>({ name: "", description: "", latitude: 0, longitude: 0, address: "" })
  const [editingStop, setEditingStop] = useState<Stop | null>(null)

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    fetch("http://localhost:8081/api/stops", jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : undefined)
      .then((res) => res.json())
      .then((data) => setStops(data))
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Failed to load stops",
          description: "Could not fetch stops from the server.",
        })
      })
  }, [])

  // Add Stop
  const handleAddStop = async () => {
    try {
      const jwt = localStorage.getItem("jwt");
      const res = await fetch("http://localhost:8081/api/admin/stops", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
        },
        body: JSON.stringify(newStop),
      })
      if (!res.ok) throw new Error("Failed to add stop")
      const addedStop = await res.json()
      setStops((prev) => [...prev, addedStop])
      setIsAddDialogOpen(false)
      setNewStop({ name: "", description: "", latitude: 0, longitude: 0, address: "" })
      toast({ variant: "success", title: "Stop Added", description: "New stop has been added." })
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to add stop", description: (err as Error).message })
    }
  }

  // Edit Stop
  const handleEditStop = async () => {
    if (!editingStop) return
    try {
      const jwt = localStorage.getItem("jwt");
      const res = await fetch(`http://localhost:8081/api/admin/stops/${editingStop.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
        },
        body: JSON.stringify(editingStop),
      })
      if (!res.ok) throw new Error("Failed to update stop")
      const updatedStop = await res.json()
      setStops((prev) => prev.map((s) => s.id === updatedStop.id ? updatedStop : s))
      setIsEditDialogOpen(false)
      setEditingStop(null)
      toast({ variant: "success", title: "Stop Updated", description: "Stop details have been updated." })
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to update stop", description: (err as Error).message })
    }
  }

  const filteredStops = stops.filter((stop) => {
    const matchesSearch =
      stop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stop.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stop.address?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  const stopStats = {
    total: stops.length,
    active: stops.filter((s) => s.isActive).length,
    excellent: stops.filter((s) => s.condition === "excellent").length,
    needsMaintenance: stops.filter((s) => s.condition === "poor" || s.condition === "fair").length,
    averageUsage: Math.round(stops.reduce((acc, stop) => acc + (stop.dailyUsage || 0), 0) / stops.length),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stop Management</h1>
          <p className="text-gray-600">Manage bus stops, facilities, and maintenance schedules</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
              <Plus className="mr-2 h-4 w-4" />
              Add New Stop
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Bus Stop</DialogTitle>
              <DialogDescription>Add a new bus stop with location details and facilities.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stop-name">Stop Name *</Label>
                  <Input
                    id="stop-name"
                    placeholder="Main Gate"
                    value={newStop.name}
                    onChange={(e) => setNewStop({ ...newStop, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the stop location..."
                  value={newStop.description}
                  onChange={(e) => setNewStop({ ...newStop, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="123 University Ave, Campus"
                  value={newStop.address}
                  onChange={(e) => setNewStop({ ...newStop, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude *</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    placeholder="40.7128"
                    value={newStop.latitude}
                    onChange={(e) => setNewStop({ ...newStop, latitude: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude *</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    placeholder="-74.0060"
                    value={newStop.longitude}
                    onChange={(e) => setNewStop({ ...newStop, longitude: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddStop}
                className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
                disabled={!newStop.name || !newStop.latitude || !newStop.longitude}
              >
                Create Stop
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stops</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stopStats.total}</div>
            <p className="text-xs text-muted-foreground">{stopStats.active} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Excellent Condition</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stopStats.excellent}</div>
            <p className="text-xs text-muted-foreground">Top condition stops</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Maintenance</CardTitle>
            <Navigation className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stopStats.needsMaintenance}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Daily Usage</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stopStats.averageUsage}</div>
            <p className="text-xs text-muted-foreground">Students per day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Used Stop</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Main Gate</div>
            <p className="text-xs text-muted-foreground">245 daily users</p>
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
                placeholder="Search stops by name, description, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stops Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bus Stops ({filteredStops.length})</CardTitle>
          <CardDescription>Manage bus stop locations, facilities, and maintenance status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStops.map((stop) => (
                <TableRow key={stop.id}>
                  <TableCell>{stop.name}</TableCell>
                  <TableCell>{stop.description}</TableCell>
                  <TableCell>
                    {typeof stop.latitude === "number" && typeof stop.longitude === "number"
                      ? `${stop.latitude.toFixed(4)}, ${stop.longitude.toFixed(4)}`
                      : <span className="text-red-500">No coordinates</span>
                    }
                  </TableCell>
                  <TableCell>{stop.address}</TableCell>
                  <TableCell>
                    <Badge variant={stop.isActive ? "default" : "secondary"}>
                      {stop.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => {
                        setEditingStop(stop);
                        setIsEditDialogOpen(true);
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={async () => {
                        if (!stop.id) return;
                        try {
                          const jwt = localStorage.getItem("jwt");
                          const res = await fetch(`http://localhost:8081/api/admin/stops/${stop.id}`, {
                            method: "DELETE",
                            headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined,
                          })
                          if (!res.ok) throw new Error("Failed to delete stop")
                          setStops((prev) => prev.filter((s) => s.id !== stop.id))
                          toast({ variant: "success", title: "Stop Deleted", description: "Stop has been removed." })
                        } catch (err) {
                          toast({ variant: "destructive", title: "Failed to delete stop", description: (err as Error).message })
                        }
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Stop Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Stop</DialogTitle>
            <DialogDescription>Update the details for this stop.</DialogDescription>
          </DialogHeader>
          {editingStop && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-stop-name" className="text-right">Name</Label>
                <Input id="edit-stop-name" value={editingStop.name} onChange={e => setEditingStop({ ...editingStop, name: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-stop-description" className="text-right">Description</Label>
                <Input id="edit-stop-description" value={editingStop.description} onChange={e => setEditingStop({ ...editingStop, description: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-stop-address" className="text-right">Address</Label>
                <Input id="edit-stop-address" value={editingStop.address} onChange={e => setEditingStop({ ...editingStop, address: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-stop-latitude" className="text-right">Latitude</Label>
                <Input id="edit-stop-latitude" type="number" value={editingStop.latitude} onChange={e => setEditingStop({ ...editingStop, latitude: Number(e.target.value) })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-stop-longitude" className="text-right">Longitude</Label>
                <Input id="edit-stop-longitude" type="number" value={editingStop.longitude} onChange={e => setEditingStop({ ...editingStop, longitude: Number(e.target.value) })} className="col-span-3" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleEditStop}
              className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
