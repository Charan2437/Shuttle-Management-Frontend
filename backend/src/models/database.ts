/**
 * Database Schema Types
 *
 * This file contains TypeScript interfaces that map to the database schema.
 * These types are used for type-checking and documentation purposes.
 */

// =============================================
// CORE USER TYPES
// =============================================

export interface User {
  id: string // UUID
  email: string
  password_hash: string
  name: string
  role: "student" | "admin" | "super_admin"
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface Student {
  id: string // UUID
  user_id: string // UUID reference to users table
  student_id: string
  wallet_balance: number
  profile_image_url?: string
  phone_number?: string
  emergency_contact?: string
  enrollment_date?: Date
  graduation_date?: Date
  created_at: Date
  updated_at: Date
}

export interface Admin {
  id: string // UUID
  user_id: string // UUID reference to users table
  employee_id?: string
  department?: string
  last_login?: Date
  created_at: Date
  updated_at: Date
}

// =============================================
// LOOKUP TYPES
// =============================================

export interface PermissionType {
  id: string // UUID
  name: string
  description?: string
  category?: string
  is_active: boolean
  created_at: Date
}

export interface AdminPermission {
  id: string // UUID
  admin_id: string // UUID reference to admins table
  permission_type_id: string // UUID reference to permission_types table
  granted_at: Date
  granted_by?: string // UUID reference to users table
  expires_at?: Date
  is_active: boolean
}

export interface FacilityType {
  id: string // UUID
  name: string
  description?: string
  icon?: string
  category?: string
  is_active: boolean
  created_at: Date
}

export interface TransactionType {
  id: string // UUID
  name: string
  description?: string
  is_active: boolean
  created_at: Date
}

export interface BookingStatusType {
  id: string // UUID
  name: string
  description?: string
  color?: string // hex color for UI
  is_active: boolean
  created_at: Date
}

// =============================================
// LOCATION AND ROUTE TYPES
// =============================================

export interface Stop {
  id: string // UUID
  name: string
  description?: string
  latitude: number
  longitude: number
  address?: string
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface StopFacility {
  id: string // UUID
  stop_id: string // UUID reference to stops table
  facility_type_id: string // UUID reference to facility_types table
  condition: "excellent" | "good" | "fair" | "poor" | "out_of_order"
  last_maintained?: Date
  notes?: string
  created_at: Date
}

export interface Route {
  id: string // UUID
  name: string
  description?: string
  color: string // hex color code
  estimated_duration: number // in minutes
  base_fare: number // in points/cents
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface RouteOperatingHour {
  id: string // UUID
  route_id: string // UUID reference to routes table
  day_of_week: number // 0=Sunday, 6=Saturday
  start_time: string // HH:MM:SS format
  end_time: string // HH:MM:SS format
  is_active: boolean
  created_at: Date
}

export interface RouteStop {
  id: string // UUID
  route_id: string // UUID reference to routes table
  stop_id: string // UUID reference to stops table
  stop_order: number
  estimated_travel_time?: number // time to reach this stop from previous stop in minutes
  distance_from_previous?: number // distance in kilometers
  created_at: Date
}

export interface PeakHour {
  id: string // UUID
  route_id: string // UUID reference to routes table
  name: string // e.g., "Morning Rush", "Evening Rush"
  start_time: string // HH:MM:SS format
  end_time: string // HH:MM:SS format
  multiplier: number // e.g., 1.5 for 50% increase
  is_active: boolean
  created_at: Date
}

export interface PeakHourDay {
  id: string // UUID
  peak_hour_id: string // UUID reference to peak_hours table
  day_of_week: number // 0=Sunday, 6=Saturday
  created_at: Date
}

// =============================================
// BOOKING AND TRANSACTION TYPES
// =============================================

export interface Booking {
  id: string // UUID
  student_id: string // UUID reference to students table
  route_id: string // UUID reference to routes table
  from_stop_id: string // UUID reference to stops table
  to_stop_id: string // UUID reference to stops table
  scheduled_time: Date
  status_id: string // UUID reference to booking_status_types table
  points_deducted: number
  booking_reference: string
  notes?: string
  cancelled_at?: Date
  cancelled_by?: string // UUID reference to users table
  cancellation_reason?: string
  created_at: Date
  updated_at: Date
}

export interface TransferBooking {
  id: string // UUID
  main_booking_id: string // UUID reference to bookings table
  from_route_id: string // UUID reference to routes table
  to_route_id: string // UUID reference to routes table
  transfer_stop_id: string // UUID reference to stops table
  estimated_wait_time?: number // in minutes
  transfer_order: number // for multiple transfers
  created_at: Date
}

export interface WalletTransaction {
  id: string // UUID
  student_id: string // UUID reference to students table
  transaction_type_id: string // UUID reference to transaction_types table
  amount: number // in points/cents
  booking_id?: string // UUID reference to bookings table
  description: string
  reference_id?: string // external reference (payment gateway, etc.)
  processed_by?: string // UUID reference to users table
  created_at: Date
}

// =============================================
// SYSTEM TYPES
// =============================================

export interface SystemSetting {
  id: string // UUID
  setting_key: string
  setting_value: string
  data_type: "string" | "integer" | "boolean" | "json"
  description?: string
  category?: string
  is_public: boolean // whether setting can be read by non-admins
  created_at: Date
  updated_at: Date
}

export interface AuditLog {
  id: string // UUID
  table_name: string
  record_id: string // UUID of the affected record
  action: "INSERT" | "UPDATE" | "DELETE"
  old_values?: Record<string, any> // JSONB
  new_values?: Record<string, any> // JSONB
  changed_by?: string // UUID reference to users table
  ip_address?: string // INET
  user_agent?: string
  created_at: Date
}

export interface Notification {
  id: string // UUID
  user_id: string // UUID reference to users table
  title: string
  message: string
  type: "info" | "warning" | "error" | "success"
  is_read: boolean
  read_at?: Date
  expires_at?: Date
  created_at: Date
}

// =============================================
// EXTENDED TYPES WITH RELATIONSHIPS
// =============================================

export interface UserWithRelations extends User {
  student?: Student
  admin?: Admin
  notifications?: Notification[]
}

export interface StudentWithRelations extends Student {
  user: User
  bookings?: Booking[]
  wallet_transactions?: WalletTransaction[]
}

export interface AdminWithRelations extends Admin {
  user: User
  permissions?: AdminPermission[]
}

export interface RouteWithRelations extends Route {
  operating_hours?: RouteOperatingHour[]
  stops?: (RouteStop & { stop: Stop })[]
  peak_hours?: PeakHour[]
}

export interface BookingWithRelations extends Booking {
  student: StudentWithRelations
  route: Route
  from_stop: Stop
  to_stop: Stop
  status: BookingStatusType
  transfers?: TransferBooking[]
  wallet_transaction?: WalletTransaction
}
