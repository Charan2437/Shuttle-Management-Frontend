"use client"

import { useState, useEffect, useCallback } from "react"
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
import { Select } from "@/components/ui/select"
import { Plus, Edit, Trash2, MapPin, Clock, Users, DollarSign, Search, Filter, MoreHorizontal } from "lucide-react"
import type { Route } from "@/types"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function RouteManagement() {
  const { toast } = useToast()
  const [routes, setRoutes] = useState<Route[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)
  const [availableShuttles, setAvailableShuttles] = useState<any[]>([])
  const [selectedShuttleId, setSelectedShuttleId] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    // Fetch all routes from backend
    fetch("http://localhost:8081/api/routes", {
      headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined,
    })
      .then((res) => res.json())
      .then((data) => setRoutes(data))
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Failed to load routes",
          description: "Could not fetch routes from the server.",
        })
      })
    // Fetch available shuttles for dropdown
    fetch("http://localhost:8081/api/shuttles/available", {
      headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined,
    })
      .then((res) => res.json())
      .then((data) => setAvailableShuttles(data))
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Failed to load shuttles",
          description: "Could not fetch available shuttles.",
        })
      })
  }, [])

  const filteredRoutes = routes.filter((route) => route.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleAddRoute = async () => {
    // Gather form values
    const name = (document.getElementById("route-name") as HTMLInputElement)?.value || "";
    const color = (document.getElementById("route-color") as HTMLInputElement)?.value || "#3B82F6";
    const baseFare = Number((document.getElementById("base-fare") as HTMLInputElement)?.value) || 0;
    const description = (document.getElementById("route-description") as HTMLTextAreaElement)?.value || "";
    const estimatedDuration = Number((document.getElementById("estimated-duration") as HTMLInputElement)?.value) || 0;
    // For demo, use static stops and operating hours. In production, collect from form.
    const stops = [];
    const operatingHours = [
      {
        dayOfWeek: new Date().getDay(),
        startTime: (document.querySelectorAll('input[type="time"]')[0] as HTMLInputElement)?.value || "07:00:00",
        endTime: (document.querySelectorAll('input[type="time"]')[1] as HTMLInputElement)?.value || "22:00:00"
      }
    ];
    // Find the selected shuttle's shuttleNo
    const selectedShuttle = availableShuttles.find(s => s.id === selectedShuttleId);
    const shuttleName = selectedShuttle ? selectedShuttle.shuttleNo : undefined;
    const requestBody = { name, color, baseFare, description, estimatedDuration, stops, operatingHours, shuttleName };
    console.log("Add Route request body:", requestBody);
    try {
      const jwt = localStorage.getItem("jwt");
      const res = await fetch("http://localhost:8081/api/routes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
        },
        body: JSON.stringify(requestBody)
      });
      if (!res.ok) throw new Error("Failed to create route");
      const newRoute = await res.json();
      setRoutes((prev) => [...prev, newRoute]);
      setIsAddDialogOpen(false);
      toast({
        variant: "success",
        title: "Route Created",
        description: "New route has been successfully created.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to create route",
        description: (err as Error).message,
      });
    }
  }

  const handleEditRoute = async (route: Route) => {
    setEditingRoute(route)
    // For demo, just open the dialog. In production, populate form and allow editing.
    // Example: You can implement a dialog for editing and call this function on save
    // Here is a sample update logic:
    // const updatedRoute = { ...route, name: 'New Name' };
    // await fetch(`http://localhost:8081/api/routes/${route.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedRoute) });
    // setRoutes((prev) => prev.map((r) => r.id === route.id ? updatedRoute : r));
  }

  const handleDeleteRoute = async (routeId: string) => {
    const jwt = localStorage.getItem("jwt");
    try {
      const res = await fetch(`http://localhost:8081/api/routes/${routeId}`, {
        method: 'DELETE',
        headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined,
      })
      if (!res.ok) throw new Error('Failed to delete route')
      setRoutes((prev) => prev.filter((route) => route.id !== routeId))
      toast({
        variant: 'default',
        title: 'Route Deleted',
        description: 'Route has been removed from the system.',
      })
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Failed to delete route',
        description: (err as Error).message,
      })
    }
  }

  const toggleRouteStatus = async (routeId: string, newStatus: boolean) => {
    const route = routes.find((r) => r.id === routeId)
    if (!route) return
    const jwt = localStorage.getItem("jwt");
    try {
      const res = await fetch(`http://localhost:8081/api/routes/${routeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
        },
        body: JSON.stringify({ ...route, isActive: newStatus })
      })
      if (!res.ok) throw new Error('Failed to update status')
      const updatedRoute = await res.json()
      console.log('Updated route from backend:', updatedRoute)
      setRoutes((prev) => prev.map((r) => r.id === routeId ? updatedRoute : r))
      toast({
        variant: 'default',
        title: 'Status Updated',
        description: `${route.name} is now ${updatedRoute.isActive ? 'active' : 'inactive'} (backend: ${updatedRoute.isActive})`,
      })
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Failed to update status',
        description: (err as Error).message,
      })
    }
  }

  const handleManageStops = (routeId: string) => {
    router.push(`/dashboard/admin/routes/${routeId}/stops`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Route Management</h1>
          <p className="text-gray-600">Create and manage shuttle routes across campus</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
              <Plus className="mr-2 h-4 w-4" />
              Add New Route
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Route</DialogTitle>
              <DialogDescription>Add a new shuttle route with stops and schedule information.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="route-name" className="text-right">
                  Route Name
                </Label>
                <Input id="route-name" placeholder="Campus Express" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="route-color" className="text-right">
                  Route Color
                </Label>
                <Input id="route-color" type="color" defaultValue="#3B82F6" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="operating-hours" className="text-right">
                  Operating Hours
                </Label>
                <div className="col-span-3 flex space-x-2">
                  <Input type="time" defaultValue="07:00" />
                  <span className="flex items-center">to</span>
                  <Input type="time" defaultValue="22:00" />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="base-fare" className="text-right">
                  Base Fare
                </Label>
                <Input id="base-fare" type="number" placeholder="2" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="route-description" className="text-right">
                  Description
                </Label>
                <Textarea id="route-description" placeholder="Route description and notes..." className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="estimated-duration" className="text-right">
                  Estimated Duration (min)
                </Label>
                <Input id="estimated-duration" type="number" placeholder="30" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="route-shuttle" className="text-right">
                  Shuttle
                </Label>
                <select
                  id="route-shuttle"
                  className="col-span-3 border rounded px-2 py-1"
                  value={selectedShuttleId}
                  onChange={e => setSelectedShuttleId(e.target.value)}
                >
                  <option value="">Select a shuttle</option>
                  {availableShuttles.map((shuttle) => (
                    <option key={shuttle.id} value={shuttle.id}>
                      {shuttle.shuttleNo} (Capacity: {shuttle.capacity})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRoute} className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
                Create Route
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Route Dialog */}
        <Dialog open={!!editingRoute} onOpenChange={(open) => { if (!open) setEditingRoute(null) }}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Route</DialogTitle>
              <DialogDescription>Edit the details of this route.</DialogDescription>
            </DialogHeader>
            {editingRoute && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-route-name" className="text-right">Route Name</Label>
                  <Input id="edit-route-name" defaultValue={editingRoute.name} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-route-color" className="text-right">Route Color</Label>
                  <Input id="edit-route-color" type="color" defaultValue={editingRoute.color} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-base-fare" className="text-right">Base Fare</Label>
                  <Input id="edit-base-fare" type="number" defaultValue={editingRoute.baseFare} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-route-description" className="text-right">Description</Label>
                  <Textarea id="edit-route-description" defaultValue={editingRoute.description} className="col-span-3" />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingRoute(null)}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (!editingRoute) return;
                  const name = (document.getElementById("edit-route-name") as HTMLInputElement)?.value || editingRoute.name;
                  const color = (document.getElementById("edit-route-color") as HTMLInputElement)?.value || editingRoute.color;
                  const baseFare = Number((document.getElementById("edit-base-fare") as HTMLInputElement)?.value) || editingRoute.baseFare;
                  const description = (document.getElementById("edit-route-description") as HTMLTextAreaElement)?.value || editingRoute.description;
                  try {
                    const jwt = localStorage.getItem("jwt");
                    const res = await fetch(`http://localhost:8081/api/routes/${editingRoute.id}`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
                      },
                      body: JSON.stringify({ ...editingRoute, name, color, baseFare, description })
                    });
                    if (!res.ok) throw new Error('Failed to update route');
                    const updatedRoute = await res.json();
                    setRoutes((prev) => prev.map((r) => r.id === editingRoute.id ? updatedRoute : r));
                    setEditingRoute(null);
                    toast({
                      variant: 'success',
                      title: 'Route Updated',
                      description: 'Route details have been updated.',
                    });
                  } catch (err) {
                    toast({
                      variant: 'destructive',
                      title: 'Failed to update route',
                      description: (err as Error).message,
                    });
                  }
                }}
                className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search routes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Routes Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Routes ({filteredRoutes.length})</CardTitle>
          <CardDescription>Manage your shuttle routes and their configurations</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead>Stops</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Operating Hours</TableHead>
                <TableHead>Base Fare</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoutes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: route.color }} />
                      <div>
                        <div className="font-medium">{route.name}</div>
                        {route.shuttleName && (
                          <div className="text-xs text-gray-500">Shuttle: {route.shuttleName}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{route.stops.length} stops</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{route.estimatedDuration} min</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {(() => {
                        const today = new Date().getDay(); // 0=Sunday, 6=Saturday
                        if (route.operatingHours && Array.isArray(route.operatingHours)) {
                          const todayHours = route.operatingHours.filter(
                            (oh) => oh.dayOfWeek === today
                          );
                          if (todayHours.length > 0) {
                            return todayHours.map((oh, idx) => (
                              <span key={idx}>{oh.startTime} - {oh.endTime}</span>
                            ));
                          }
                        }
                        return <span style={{ color: 'red' }}>No operating hours today</span>;
                      })()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span>{route.baseFare} points</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge variant={route.isActive ? "default" : "secondary"}>
                        {route.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Switch checked={route.isActive} onCheckedChange={(checked: boolean) => toggleRouteStatus(route.id, checked)} />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditRoute(route)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleManageStops(route.id)}>
                        <MapPin className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteRoute(route.id)}>
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

      {/* Route Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Routes</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routes.length}</div>
            <p className="text-xs text-muted-foreground">{routes.filter((r) => r.isActive).length} active routes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(routes.reduce((acc, route) => acc + route.estimatedDuration, 0) / routes.length)} min
            </div>
            <p className="text-xs text-muted-foreground">Across all routes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stops</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routes.reduce((acc, route) => acc + route.stops.length, 0)}</div>
            <p className="text-xs text-muted-foreground">Across all routes</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
