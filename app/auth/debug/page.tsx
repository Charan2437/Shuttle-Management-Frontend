"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function AuthDebugPage() {
  const { data: session, status } = useSession()
  const [urlInfo, setUrlInfo] = useState<Record<string, string>>({})

  useEffect(() => {
    // Get current URL information
    const currentUrl = window.location.href
    const origin = window.location.origin
    const hostname = window.location.hostname

    setUrlInfo({
      "Current URL": currentUrl,
      Origin: origin,
      Hostname: hostname,
      "Is v0 Preview": hostname.includes("v0.dev") ? "Yes" : "No",
      "Session Status": status,
    })
  }, [status])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Debug</CardTitle>
            <CardDescription>Troubleshooting information for v0 preview authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">URL Information</h3>
              <div className="space-y-2">
                {Object.entries(urlInfo).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                    <span className="font-medium">{key}:</span>
                    <span className="text-sm font-mono">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {urlInfo.Hostname?.includes("v0.dev") && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className="bg-blue-100 text-blue-800">v0 Preview Detected</Badge>
                </div>
                <p className="text-sm text-blue-700">
                  You're running in v0 preview mode. NextAuth will automatically use the current domain for
                  authentication. No need to set NEXTAUTH_URL manually.
                </p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-medium mb-3">Session Information</h3>
              <div className="bg-gray-100 p-4 rounded-md">
                <pre className="whitespace-pre-wrap text-sm">
                  {status === "loading" && "Loading session..."}
                  {status === "unauthenticated" && "Not authenticated"}
                  {status === "authenticated" && JSON.stringify(session, null, 2)}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Test Credentials</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Admin:</strong> admin@university.edu / admin123
                  </div>
                  <div>
                    <strong>Student:</strong> john.doe@university.edu / student123
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button asChild className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
                <Link href="/auth/login">Go to Login</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
