"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FormField } from "@/components/ui/form-field"
import { LoadingButton } from "@/components/ui/loading-button"

import { registerSchema, type RegisterFormData } from "@/lib/validations/auth"
import { Eye, EyeOff, Bus, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  // Replace mock registration with real API call
  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch("http://localhost:8081/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
          role: "student",
          studentId: data.studentId,
        }),
      })
      if (!res.ok) {
        if (res.status === 409) {
          setError("An account with this email already exists.")
        } else {
          setError("Registration failed. Please try again.")
        }
        return
      }
      setSuccess(true)
      setTimeout(() => {
        router.push("/auth/login?message=Registration successful. Please sign in.")
      }, 2000)
    } catch (error) {
      setError("Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Registration Successful!</h2>
              <p className="text-gray-600 mt-2">Your account has been created. Redirecting to login page...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <Link
            href="/auth/login"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Login
          </Link>

          <div className="flex justify-center">
            <div className="bg-primary/10 p-3 rounded-full">
              <Bus className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-600 mt-2">Join the university shuttle management system</p>
          </div>
        </div>

        {/* Registration Form */}
        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center">Student Registration</CardTitle>
            <CardDescription className="text-center">Create your account with university credentials</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name Field */}
              <FormField label="Full Name" required error={errors.name?.message}>
                <Input {...register("name")} placeholder="Enter your full name" className="h-11" autoComplete="name" />
              </FormField>

              {/* Email Field */}
              <FormField label="University Email" required error={errors.email?.message}>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="your.name@university.edu"
                  className="h-11"
                  autoComplete="email"
                />
              </FormField>

              {/* Student ID Field */}
              <FormField label="Student ID" required error={errors.studentId?.message}>
                <Input
                  {...register("studentId")}
                  placeholder="STU001"
                  className="h-11"
                  style={{ textTransform: "uppercase" }}
                />
              </FormField>

              {/* Password Field */}
              <FormField label="Password" required error={errors.password?.message}>
                <div className="relative">
                  <Input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    className="h-11 pr-10"
                    autoComplete="new-password"
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

              {/* Confirm Password Field */}
              <FormField label="Confirm Password" required error={errors.confirmPassword?.message}>
                <div className="relative">
                  <Input
                    {...register("confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="h-11 pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormField>

              {/* Password Requirements */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
                <p className="font-medium text-gray-900 mb-2">Password Requirements:</p>
                <ul className="text-gray-700 space-y-1 text-xs">
                  <li>• At least 8 characters long</li>
                  <li>• One uppercase and one lowercase letter</li>
                  <li>• At least one number</li>
                  <li>• At least one special character (@$!%*?&)</li>
                </ul>
              </div>

              {/* Submit Button */}
              <LoadingButton
                type="submit"
                loading={isLoading}
                loadingText="Creating Account..."
                className="w-full h-11 bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white font-medium"
              >
                Create Account
              </LoadingButton>
            </form>

            {/* Login Link */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/auth/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
                  Sign In
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
