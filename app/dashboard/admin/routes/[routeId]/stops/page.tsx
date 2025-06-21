// Route Stops Management Page for Admin
// --------------------------------------
// This page allows admin users to manage the stops for a specific shuttle route.
// Features include:
// - Viewing and editing the list/order of stops for a route
// - Adding, editing, and removing stops
// - Drag-and-drop reordering of stops
// - Displaying route summary (total stops, distance, time, status)
// - Dialogs for adding new stops and editing stop details
// - Toast notifications for user feedback
//
// Author: [Your Team/Company Name]
// Date: [2025-06-21]

"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Search,
  GripVertical,
  Clock,
  Navigation,
  Save,
  X,
  RouteIcon,
} from "lucide-react"
import type { Route, Stop } from "@/types"
import { useToast } from "@/hooks/use-toast"

// RouteStop interface represents a stop as part of a route, including order and travel details
interface RouteStop {
  id: string
  stopId: string
  stopOrder: number
  estimatedTravelTime?: number
  distanceFromPrevious?: number
  stop: Stop
}

/**
 * Main component for managing stops in a route.
 * Handles data fetching, state management, and all user interactions.
 */
export default function RouteStopsManagement({ params }: { params: { routeId: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const routeId = params.routeId

  // State variables for route, stops, dialogs, and form fields
  const [route, setRoute] = useState<Route | null>(null)
  const [routeStops, setRouteStops] = useState<RouteStop[]>([])
  const [allStops, setAllStops] = useState<Stop[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddStopDialogOpen, setIsAddStopDialogOpen] = useState(false)
  const [editingStop, setEditingStop] = useState<RouteStop | null>(null)
  const [selectedStopId, setSelectedStopId] = useState("")
  const [travelTime, setTravelTime] = useState("")
  const [distance, setDistance] = useState("")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newStop, setNewStop] = useState({
    name: "",
    description: "",
    latitude: "",
    longitude: "",
    address: "",
    estimatedTravelTime: "",
    distanceFromPrevious: ""
  })

  // Fetch route and all stops data on mount or when routeId changes
  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    Promise.all([
      fetch(`http://localhost:8081/api/routes/${routeId}`,
        jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : undefined
      ).then((res) => res.json()),
      fetch("http://localhost:8081/api/stops",
        jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : undefined
      ).then((res) => res.json())
    ])
      .then(([routeData, allStopsData]) => {
        setRoute(routeData)
        setRouteStops(routeData.stops || [])
        setAllStops(allStopsData)
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Failed to load data",
          description: "Could not fetch route and stops data.",
        })
      })
  }, [routeId])

  // Filter stops not already in the route
  const availableStops = allStops.filter(
    (stop) => !routeStops.some((routeStop) => routeStop.stopId === stop.id)
  )

  // Filter available stops by search term
  const filteredAvailableStops = availableStops.filter(
    (stop) =>
      stop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stop.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  /**
   * Handles drag-and-drop reordering of route stops.
   * Updates stop order and marks changes as unsaved.
   */
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(routeStops)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update stop orders
    const updatedItems = items.map((item, index) => ({
      ...item,
      stopOrder: index + 1,
    }))

    setRouteStops(updatedItems)
    setHasUnsavedChanges(true)
  }

  /**
   * Adds a selected stop to the route with optional travel time and distance.
   * Shows a toast on success and resets the form.
   */
  const handleAddStop = () => {
    if (!selectedStopId) return

    const selectedStop = availableStops.find((stop) => stop.id === selectedStopId)
    if (!selectedStop) return

    const newRouteStop: RouteStop = {
      id: `route-stop-${Date.now()}`,
      stopId: selectedStopId,
      stopOrder: routeStops.length + 1,
      estimatedTravelTime: travelTime ? Number.parseInt(travelTime) : undefined,
      distanceFromPrevious: distance ? Number.parseFloat(distance) : undefined,
      stop: selectedStop,
    }

    setRouteStops([...routeStops, newRouteStop])
    setHasUnsavedChanges(true)

    toast({
      variant: "success",
      title: "Stop Added",
      description: `${selectedStop.name} has been added to the route.`,
    })

    setSelectedStopId("")
    setTravelTime("")
    setDistance("")
    setIsAddStopDialogOpen(false)
  }

  /**
   * Opens the edit dialog for a route stop.
   * Pre-fills travel time and distance fields.
   */
  const handleEditStop = (routeStop: RouteStop) => {
    setEditingStop(routeStop)
    setTravelTime(routeStop.estimatedTravelTime?.toString() || "")
    setDistance(routeStop.distanceFromPrevious?.toString() || "")
  }

  /**
   * Updates the details of a stop in the route.
   * Shows a toast on success and resets the edit form.
   */
  const handleUpdateStop = () => {
    if (!editingStop) return

    const updatedRouteStops = routeStops.map((rs) =>
      rs.id === editingStop.id
        ? {
            ...rs,
            estimatedTravelTime: travelTime ? Number.parseInt(travelTime) : undefined,
            distanceFromPrevious: distance ? Number.parseFloat(distance) : undefined,
          }
        : rs,
    )

    setRouteStops(updatedRouteStops)
    setHasUnsavedChanges(true)

    toast({
      variant: "success",
      title: "Stop Updated",
      description: `${editingStop.stop.name} details have been updated.`,
    })

    setEditingStop(null)
    setTravelTime("")
    setDistance("")
  }

  /**
   * Removes a stop from the route and updates the order.
   * Shows a toast on removal.
   */
  const handleRemoveStop = (routeStopId: string) => {
    const routeStop = routeStops.find((rs) => rs.id === routeStopId)
    if (!routeStop) return

    const updatedRouteStops = routeStops
      .filter((rs) => rs.id !== routeStopId)
      .map((rs, index) => ({ ...rs, stopOrder: index + 1 }))

    setRouteStops(updatedRouteStops)
    setHasUnsavedChanges(true)

    toast({
      variant: "default",
      title: "Stop Removed",
      description: `${routeStop.stop.name} has been removed from the route.`,
    })
  }

  /**
   * Saves the current route stops (stub for API integration).
   * Shows a toast on success.
   */
  const handleSaveChanges = () => {
    // In a real app, this would make an API call to save the route stops
    console.log("Saving route stops:", routeStops)
    setHasUnsavedChanges(false)

    toast({
      variant: "success",
      title: "Changes Saved",
      description: "Route stops have been updated successfully.",
    })
  }

  /**
   * Discards unsaved changes and reloads the page.
   * Shows a warning toast.
   */
  const handleDiscardChanges = () => {
    toast({
      variant: "warning",
      title: "Changes Discarded",
      description: "All unsaved changes have been reverted.",
    })
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  /**
   * Calculates the total distance of the route.
   */
  const getTotalDistance = () => {
    return routeStops.reduce((total, stop) => total + (stop.distanceFromPrevious || 0), 0)
  }

  /**
   * Calculates the total estimated travel time for the route.
   */
  const getTotalTime = () => {
    return routeStops.reduce((total, stop) => total + (stop.estimatedTravelTime || 0), 0)
  }

  // Show loading state if route is not loaded
  if (!route) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-lg font-medium">Route not found</div>
          <Button asChild className="mt-4">
            <a href="/dashboard/admin/routes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Routes
            </a>
          </Button>
        </div>
      </div>
    )
  }

  // Main render: route summary, stop management table, dialogs
  return (
    <div className="space-y-6">
      {/* Header: route info and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Routes
          </Button>
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: route.color }} />
              <h1 className="text-2xl font-bold text-gray-900">{route.name} - Stop Management</h1>
            </div>
            <p className="text-gray-600">Manage stops, order, and timing for this route</p>
          </div>
        </div>
        <div className="flex space-x-3">
          {hasUnsavedChanges && (
            <>
              <Button variant="outline" onClick={handleDiscardChanges}>
                <X className="mr-2 h-4 w-4" />
                Discard Changes
              </Button>
              <Button onClick={handleSaveChanges} className="bg-green-600 hover:bg-green-700">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </>
          )}
          {/* Add Stop Dialog Trigger */}
          <Dialog open={isAddStopDialogOpen} onOpenChange={setIsAddStopDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Stop
              </Button>
            </DialogTrigger>
            {/* Add Stop Dialog Content */}
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Stop to Route</DialogTitle>
                <DialogDescription>Select a stop and configure its timing details.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Search and select available stops */}
                <div className="space-y-2">
                  <Label>Search Available Stops</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search stops not yet in this route..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {filteredAvailableStops.length} of {availableStops.length} stops available to add
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Select Stop</Label>
                  <Select value={selectedStopId} onValueChange={setSelectedStopId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a stop" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredAvailableStops.length === 0 ? (
                        <div className="px-2 py-1 text-sm text-muted-foreground">
                          {searchTerm ? "No stops found matching your search" : "All stops are already added to this route"}
                        </div>
                      ) : (
                        filteredAvailableStops.map((stop) => (
                          <SelectItem key={stop.id} value={stop.id}>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4" />
                              <span>{stop.name}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Travel time and distance fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Travel Time (minutes)</Label>
                    <Input
                      type="number"
                      placeholder="5"
                      value={travelTime}
                      onChange={(e) => setTravelTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Distance (km)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="1.2"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddStopDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddStop} disabled={!selectedStopId}>
                  Add Stop
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Route Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Total Stops */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stops</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routeStops.length}</div>
            <p className="text-xs text-muted-foreground">Stops on this route</p>
          </CardContent>
        </Card>
        {/* Total Distance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Distance</CardTitle>
            <Navigation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalDistance().toFixed(1)} km</div>
            <p className="text-xs text-muted-foreground">Estimated total distance</p>
          </CardContent>
        </Card>
        {/* Total Time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalTime()} min</div>
            <p className="text-xs text-muted-foreground">Estimated travel time</p>
          </CardContent>
        </Card>
        {/* Route Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Route Status</CardTitle>
            <RouteIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={route.isActive ? "default" : "secondary"}>{route.isActive ? "Active" : "Inactive"}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Current status</p>
          </CardContent>
        </Card>
      </div>

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-yellow-800">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              <span className="font-medium">You have unsaved changes</span>
              <span className="text-sm">Remember to save your changes before leaving this page.</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Route Stops Management Table */}
      <Card>
        <CardHeader>
          <CardTitle>Route Stops ({routeStops.length})</CardTitle>
          <CardDescription>
            Drag and drop to reorder stops. The first stop is the starting point of the route.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="route-stops">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead>Stop Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Travel Time</TableHead>
                        <TableHead>Distance</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {routeStops.map((routeStop, index) => (
                        <Draggable key={routeStop.id} draggableId={routeStop.id} index={index}>
                          {(provided, snapshot) => (
                            <TableRow
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={snapshot.isDragging ? "bg-gray-50" : ""}
                            >
                              <TableCell {...provided.dragHandleProps}>
                                <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">#{routeStop.stopOrder}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  {/* Stop name and description */}
                                  <div className="font-medium">{routeStop.name}</div>
                                  <div className="text-sm text-gray-500">{routeStop.description}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm font-mono">
                                  {/* Show coordinates if available */}
                                  {typeof routeStop.latitude === "number" && typeof routeStop.longitude === "number"
                                    ? `${routeStop.latitude.toFixed(4)}, ${routeStop.longitude.toFixed(4)}`
                                    : <span className="text-red-500">No coordinates</span>
                                  }
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span>{routeStop.estimatedTravelTime || 0} min</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <Navigation className="h-4 w-4 text-gray-400" />
                                  <span>{routeStop.distanceFromPrevious?.toFixed(1) || 0} km</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  {/* Edit and Remove actions */}
                                  <Button variant="ghost" size="sm" onClick={() => handleEditStop(routeStop)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleRemoveStop(routeStop.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Empty state if no stops */}
          {routeStops.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No stops added</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding your first stop to this route.</p>
              <div className="mt-6">
                <Button onClick={() => setIsAddStopDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Stop
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Stop Dialog */}
      <Dialog open={!!editingStop} onOpenChange={() => setEditingStop(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Stop Details</DialogTitle>
            <DialogDescription>Update timing and distance information for this stop.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Stop Name</Label>
              <Input value={editingStop?.stop.name || ""} disabled />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Travel Time (minutes)</Label>
                <Input
                  type="number"
                  placeholder="5"
                  value={travelTime}
                  onChange={(e) => setTravelTime(e.target.value)}
                />
                <p className="text-xs text-gray-500">Time to reach this stop from the previous one</p>
              </div>
              <div className="space-y-2">
                <Label>Distance (km)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="1.2"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                />
                <p className="text-xs text-gray-500">Distance from the previous stop</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingStop(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStop}>Update Stop</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Stop Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Stop</DialogTitle>
            <DialogDescription>Enter details for the new stop.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stop-name" className="text-right">Name</Label>
              <Input id="stop-name" value={newStop.name} onChange={e => setNewStop({ ...newStop, name: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stop-description" className="text-right">Description</Label>
              <Input id="stop-description" value={newStop.description} onChange={e => setNewStop({ ...newStop, description: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stop-address" className="text-right">Address</Label>
              <Input id="stop-address" value={newStop.address} onChange={e => setNewStop({ ...newStop, address: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stop-latitude" className="text-right">Latitude</Label>
              <Input id="stop-latitude" type="number" value={newStop.latitude} onChange={e => setNewStop({ ...newStop, latitude: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stop-longitude" className="text-right">Longitude</Label>
              <Input id="stop-longitude" type="number" value={newStop.longitude} onChange={e => setNewStop({ ...newStop, longitude: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stop-travel-time" className="text-right">Travel Time (min)</Label>
              <Input id="stop-travel-time" type="number" value={newStop.estimatedTravelTime} onChange={e => setNewStop({ ...newStop, estimatedTravelTime: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stop-distance" className="text-right">Distance (km)</Label>
              <Input id="stop-distance" type="number" value={newStop.distanceFromPrevious} onChange={e => setNewStop({ ...newStop, distanceFromPrevious: e.target.value })} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={async () => {
                try {
                  const jwt = localStorage.getItem("jwt");
                  const res = await fetch(`http://localhost:8081/api/routes/${routeId}/stops`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
                    },
                    body: JSON.stringify({
                      name: newStop.name,
                      description: newStop.description,
                      address: newStop.address,
                      latitude: parseFloat(newStop.latitude),
                      longitude: parseFloat(newStop.longitude),
                      estimatedTravelTime: parseInt(newStop.estimatedTravelTime),
                      distanceFromPrevious: parseFloat(newStop.distanceFromPrevious)
                    })
                  })
                  if (!res.ok) throw new Error("Failed to add stop")
                  const addedStop = await res.json()
                  setRouteStops(prev => [...prev, addedStop])
                  setIsAddDialogOpen(false)
                  setNewStop({ name: "", description: "", latitude: "", longitude: "", address: "", estimatedTravelTime: "", distanceFromPrevious: "" })
                  toast({ variant: "success", title: "Stop Added", description: "New stop has been added to the route." })
                } catch (err) {
                  toast({ variant: "destructive", title: "Failed to add stop", description: (err as Error).message })
                }
              }}
              className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
            >
              Add Stop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
