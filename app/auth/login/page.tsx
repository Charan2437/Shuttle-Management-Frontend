"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FormField } from "@/components/ui/form-field"
import { LoadingButton } from "@/components/ui/loading-button"

import { loginSchema, type LoginFormData } from "@/lib/validations/auth"
import { Eye, EyeOff, Bus, AlertCircle, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const errorParam = searchParams.get("error")
  const message = searchParams.get("message")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userType: "student",
    },
  })

  const userType = watch("userType")

  React.useEffect(() => {
    if (errorParam) {
      setError("Authentication failed. Please check your credentials.")
    }
  }, [errorParam])

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      setError(null)

      const res = await fetch("http://localhost:8081/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      })

      if (!res.ok) {
        if (res.status === 401) {
          setError("Invalid email or password.")
        } else {
          setError("Login failed. Please try again.")
        }
        return
      }

      const result = await res.json()

      // Store JWT and user info in localStorage
      localStorage.setItem("jwt", result.token)
      localStorage.setItem("user", JSON.stringify(result.user))
      if (result.user.studentId) {
        localStorage.setItem("studentId", result.user.studentId)
      }
      // Store the entire response for future extensibility
      localStorage.setItem("auth_response", JSON.stringify(result))

      // Redirect based on user type
      if (result.user.role === "student") {
        router.push("/dashboard/student")
      } else if (result.user.role === "admin") {
        router.push("/dashboard/admin")
      } else {
        router.push(callbackUrl)
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>

          <div className="flex justify-center">
            <div className="bg-primary/10 p-3 rounded-full">
              <Bus className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-600 mt-2">Sign in to your shuttle management account</p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">Enter your university credentials to continue</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {message && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* User Type Selection */}
              <FormField label="I am a" required error={errors.userType?.message}>
                <Select value={userType} onValueChange={(value: "student" | "admin") => setValue("userType", value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              {/* Email Field */}
              <FormField label="University Email" required error={errors.email?.message}>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder={userType === "student" ? "your.name@university.edu" : "admin@university.edu"}
                  className="h-11"
                  autoComplete="email"
                />
              </FormField>

              {/* Password Field */}
              <FormField label="Password" required error={errors.password?.message}>
                <div className="relative">
                  <Input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="h-11 pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormField>

              {/* Submit Button */}
              <LoadingButton
                type="submit"
                loading={isLoading}
                loadingText="Signing in..."
                className="w-full h-11 bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white font-medium"
              >
                Sign In
              </LoadingButton>
            </form>

            {/* Register Link */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/auth/register"
                  className="font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>© 2024 University Shuttle Management System</p>
          <p className="mt-1">Secure • Reliable • Efficient</p>
        </div>
      </div>
    </div>
  )
}
