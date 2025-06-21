import CredentialsProvider from "next-auth/providers/credentials"
import { mockStudents } from "@/lib/data/static-data"

// Get the correct URL based on environment
const getBaseUrl = () => {

  if (typeof window !== "undefined") {
    return window.location.origin
  }



  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }

  // Fallback for development
  return "http://localhost:3000"
}

export const authOptions: any = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        userType: { label: "User Type", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password || !credentials?.userType) {
            console.log("Missing credentials")
            return null
          }

          console.log("Auth attempt:", {
            email: credentials.email,
            userType: credentials.userType,
          })

          // For demo purposes, we'll use static authentication
          if (credentials.userType === "student") {
            const student = mockStudents.find((s) => s.email === credentials.email)
            if (student && credentials.password === "student123") {
              console.log("Student login successful")
              return {
                id: student.id,
                email: student.email,
                name: student.name,
                role: student.role,
                studentId: student.studentId,
                walletBalance: student.walletBalance,
              }
            }
          } else if (credentials.userType === "admin") {
            // Mock admin authentication
            if (credentials.email === "admin@university.edu" && credentials.password === "admin123") {
              console.log("Admin login successful")
              return {
                id: "admin-1",
                email: credentials.email,
                name: "System Administrator",
                role: "admin",
              }
            }
          }

          console.log("Auth failed: Invalid credentials")
          return null
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = user.role
        if (user.studentId) token.studentId = user.studentId
        if (user.walletBalance) token.walletBalance = user.walletBalance
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        if (token.studentId) session.user.studentId = token.studentId as string
        if (token.walletBalance) session.user.walletBalance = token.walletBalance as number
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET || "development-secret-key-change-in-production",

  url: undefined,
}
