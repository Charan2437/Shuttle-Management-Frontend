declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      studentId?: string
      walletBalance?: number
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
    studentId?: string
    walletBalance?: number
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    studentId?: string
    walletBalance?: number
  }
}
