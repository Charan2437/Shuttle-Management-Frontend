"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface RouteTiming {
  dayOfWeek: number
  startTime: string
  endTime: string
}

export default function RouteTimingPage({ params }: { params: { routeId: string } }) {
  const { toast } = useToast()
  const [timings, setTimings] = useState<RouteTiming[]>([])
  const [routeName, setRouteName] = useState("")

  useEffect(() => {
    fetch(`http://localhost:8081/api/routes/${params.routeId}`)
      .then((res) => res.json())
      .then((data) => {
        setTimings(data.operatingHours || [])
        setRouteName(data.name || "")
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Failed to load timings",
          description: "Could not fetch timings for this route."
        })
      })
  }, [params.routeId])

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <Clock className="inline-block mr-2" />
            Timings for Route: {routeName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Day</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-500">No timings found</TableCell>
                </TableRow>
              ) : (
                timings.map((timing, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{days[timing.dayOfWeek]}</TableCell>
                    <TableCell>{timing.startTime}</TableCell>
                    <TableCell>{timing.endTime}</TableCell>
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
