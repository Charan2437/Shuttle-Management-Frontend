"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MapPin, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Stop {
  id: string
  name: string
  description?: string
  latitude: number
  longitude: number
  address?: string
  stopOrder: number
  estimatedTravelTime?: number
  distanceFromPrevious?: number
}

export default function RouteStopsPage({ params }: { params: { routeId: string } }) {
  const { toast } = useToast()
  const [stops, setStops] = useState<Stop[]>([])
  const [routeName, setRouteName] = useState("")

  useEffect(() => {
    fetch(`http://localhost:8081/api/routes/${params.routeId}`)
      .then((res) => res.json())
      .then((data) => {
        setStops(data.stops || [])
        setRouteName(data.name || "")
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Failed to load stops",
          description: "Could not fetch stops for this route."
        })
      })
  }, [params.routeId])

  // Placeholder for add/delete stop logic
  const handleAddStop = () => {
    toast({ title: "Add Stop", description: "Add stop functionality coming soon." })
  }
  const handleDeleteStop = (stopId: string) => {
    toast({ title: "Delete Stop", description: `Delete stop ${stopId} coming soon.` })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <MapPin className="inline-block mr-2" />
            Stops for Route: {routeName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="mb-4" onClick={handleAddStop}>
            <Plus className="mr-2 h-4 w-4" /> Add Stop
          </Button>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Travel Time</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stops.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">No stops found for this route.</TableCell>
                </TableRow>
              ) : (
                stops.sort((a, b) => a.stopOrder - b.stopOrder).map((stop) => (
                  <TableRow key={stop.id}>
                    <TableCell>{stop.stopOrder}</TableCell>
                    <TableCell>{stop.name}</TableCell>
                    <TableCell>{stop.description}</TableCell>
                    <TableCell>{stop.address}</TableCell>
                    <TableCell>{stop.estimatedTravelTime ?? "-"} min</TableCell>
                    <TableCell>{stop.distanceFromPrevious ?? "-"} km</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteStop(stop.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
