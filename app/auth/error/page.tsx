"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react"
import { Suspense } from "react"

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const getErrorMessage = (errorType: string | null) => {
    switch (errorType) {
      case "Configuration":
        return "There is a problem with the server configuration. Please contact support."
      case "AccessDenied":
        return "You do not have permission to sign in. Please check your credentials."
      case "Verification":
        return "The verification token has expired or has already been used."
      case "CredentialsSignin":
        return "Invalid email or password. Please check your credentials and try again."
      case "EmailSignin":
        return "Unable to send email. Please try again later."
      case "OAuthSignin":
        return "Error occurred during OAuth sign in."
      case "OAuthCallback":
        return "Error occurred during OAuth callback."
      case "OAuthCreateAccount":
        return "Could not create OAuth account."
      case "EmailCreateAccount":
        return "Could not create email account."
      case "Callback":
        return "Error occurred during callback."
      case "OAuthAccountNotLinked":
        return "OAuth account is not linked to any existing account."
      case "SessionRequired":
        return "You must be signed in to access this page."
      default:
        return "An unexpected error occurred during authentication. Please try again."
    }
  }

  const errorMessage = getErrorMessage(error)

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900">Authentication Error</CardTitle>
              <CardDescription className="mt-2">{errorMessage}</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
                <p className="font-medium text-gray-900 mb-1">Error Code:</p>
                <p className="text-gray-700 font-mono">{error}</p>
              </div>
            )}

            <div className="text-center space-y-3">
              <Button asChild className="w-full bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
                <Link href="/auth/login" className="inline-flex items-center">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link href="/" className="inline-flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-xs text-gray-500">
                If this problem persists, please contact{" "}
                <a href="mailto:support@university.edu" className="text-[#1e3a5f] hover:underline">
                  support@university.edu
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  )
}
