export interface User {
  id: string
  email: string
  name: string
  role: "student" | "admin" | "super_admin"
  createdAt: Date
}

export interface Student extends User {
  studentId: string
  walletBalance: number
  profileImage?: string
}

export interface Admin extends User {
  permissions: string[]
}

export interface Stop {
  id: string
  name: string
  coordinates: {
    lat: number
    lng: number
  }
  facilities: string[]
  isActive: boolean
  description?: string
}

export interface Route {
  id: string
  name: string
  stops: Stop[]
  estimatedDuration: number // in minutes
  operatingHours: {
    start: string
    end: string
  }
  peakHours: Array<{
    start: string
    end: string
  }>
  fareStructure: {
    basePrice: number
    peakMultiplier: number
  }
  isActive: boolean
  color: string // For UI display
  // --- Admin Route Management additions ---
  baseFare?: number
  description?: string
  shuttleName?: string
}

export interface Booking {
  id: string
  studentId: string
  fromStopId: string
  toStopId: string
  routeId: string
  scheduledTime: Date
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled"
  pointsDeducted: number
  transferRequired: boolean
  transferDetails?: TransferInfo[]
  createdAt: Date
}

export interface TransferInfo {
  fromRouteId: string
  toRouteId: string
  transferStopId: string
  waitTime: number // in minutes
}

export interface WalletTransaction {
  id: string
  studentId: string
  type: "debit" | "credit" | "refund"
  amount: number
  bookingId?: string
  description: string
  createdAt: Date
}

export interface RouteOptimization {
  routeId: string
  fromStopId: string
  toStopId: string
  estimatedTime: number
  totalCost: number
  transfers: TransferInfo[]
  confidence: number // 0-1 score
}
