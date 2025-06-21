"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Settings, Users } from "lucide-react"

export default function DashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Auto-redirect to admin dashboard after 3 seconds
    const timer = setTimeout(() => {
      router.push("/dashboard/admin")
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Choose Dashboard</h2>
            <p className="text-gray-600">Select which dashboard you'd like to access</p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full h-12 bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
              <Link href="/dashboard/admin" className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Admin Dashboard
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full h-12">
              <Link href="/dashboard/student" className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Student Portal
              </Link>
            </Button>
          </div>

          <p className="text-xs text-gray-500">Auto-redirecting to Admin Dashboard in 3 seconds...</p>
        </CardContent>
      </Card>
    </div>
  )
}
