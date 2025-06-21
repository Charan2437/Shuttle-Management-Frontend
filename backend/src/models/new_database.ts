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

// =============================================
// ADDITIONAL TABLES FOR ENHANCED FUNCTIONALITY
// =============================================

// Real-time shuttle tracking
export interface Vehicle {
  id: string // UUID
  vehicle_number: string
  model: string
  capacity: number
  current_route_id?: string // UUID reference to routes table
  driver_name?: string
  driver_contact?: string
  gps_device_id?: string
  fuel_type: "diesel" | "electric" | "hybrid"
  last_maintenance_date?: Date
  next_maintenance_due?: Date
  is_active: boolean
  created_at: Date
  updated_at: Date
}

// Live location tracking
export interface VehicleLocation {
  id: string // UUID
  vehicle_id: string // UUID reference to vehicles table
  latitude: number
  longitude: number
  speed?: number // km/h
  heading?: number // degrees
  accuracy?: number // meters
  battery_level?: number // percentage for electric vehicles
  fuel_level?: number // percentage
  engine_status: "running" | "idle" | "off"
  recorded_at: Date
  created_at: Date
}

// Trip instances (actual shuttle runs)
export interface Trip {
  id: string // UUID
  route_id: string // UUID reference to routes table
  vehicle_id: string // UUID reference to vehicles table
  scheduled_start_time: Date
  actual_start_time?: Date
  scheduled_end_time: Date
  actual_end_time?: Date
  current_stop_id?: string // UUID reference to stops table
  next_stop_id?: string // UUID reference to stops table
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | "delayed"
  delay_minutes?: number
  passenger_count: number
  max_capacity: number
  driver_notes?: string
  created_at: Date
  updated_at: Date
}

// Real-time occupancy tracking
export interface TripOccupancy {
  id: string // UUID
  trip_id: string // UUID reference to trips table
  stop_id: string // UUID reference to stops table
  passengers_boarded: number
  passengers_alighted: number
  current_occupancy: number
  recorded_at: Date
  created_at: Date
}

// Enhanced booking with trip reference
export interface BookingTrip {
  id: string // UUID
  booking_id: string // UUID reference to bookings table
  trip_id: string // UUID reference to trips table
  boarded_at?: Date
  alighted_at?: Date
  actual_boarding_stop_id?: string // UUID reference to stops table
  actual_alighting_stop_id?: string // UUID reference to stops table
  rating?: number // 1-5 stars
  feedback?: string
  created_at: Date
}

// Frequent routes for personalization
export interface StudentFrequentRoute {
  id: string // UUID
  student_id: string // UUID reference to students table
  from_stop_id: string // UUID reference to stops table
  to_stop_id: string // UUID reference to stops table
  usage_count: number
  last_used: Date
  average_rating?: number
  total_points_spent: number
  created_at: Date
  updated_at: Date
}

// Payment methods for wallet recharge
export interface PaymentMethod {
  id: string // UUID
  name: string // "UPI", "Credit Card", "Debit Card", etc.
  provider?: string // "Razorpay", "Stripe", etc.
  is_active: boolean
  processing_fee_percentage: number
  minimum_amount: number
  maximum_amount: number
  supported_currencies: string[] // JSON array
  created_at: Date
}

// Wallet recharge transactions
export interface WalletRecharge {
  id: string // UUID
  student_id: string // UUID reference to students table
  payment_method_id: string // UUID reference to payment_methods table
  amount: number
  processing_fee: number
  net_amount: number
  payment_gateway_transaction_id?: string
  payment_status: "pending" | "completed" | "failed" | "refunded"
  payment_reference: string
  gateway_response?: Record<string, any> // JSONB
  processed_at?: Date
  created_at: Date
}

// Service alerts and announcements
export interface ServiceAlert {
  id: string // UUID
  title: string
  message: string
  alert_type: "info" | "warning" | "emergency" | "maintenance"
  severity: "low" | "medium" | "high" | "critical"
  affected_routes?: string[] // JSON array of route IDs
  affected_stops?: string[] // JSON array of stop IDs
  start_time: Date
  end_time?: Date
  is_active: boolean
  created_by: string // UUID reference to users table
  created_at: Date
  updated_at: Date
}

// Route optimization suggestions
export interface RouteOptimization {
  id: string // UUID
  from_stop_id: string // UUID reference to stops table
  to_stop_id: string // UUID reference to stops table
  suggested_routes: Record<string, any> // JSONB with route options
  factors_considered: string[] // JSON array: ["time", "cost", "transfers", "occupancy"]
  peak_hour_adjustment: number
  base_calculation_time: Date
  is_active: boolean
  created_at: Date
}

// System performance metrics
export interface SystemMetric {
  id: string // UUID
  metric_name: string
  metric_value: number
  metric_unit: string
  category: "performance" | "usage" | "financial" | "operational"
  recorded_at: Date
  metadata?: Record<string, any> // JSONB
  created_at: Date
}

// User preferences
export interface UserPreference {
  id: string // UUID
  user_id: string // UUID reference to users table
  preference_key: string
  preference_value: string
  data_type: "string" | "number" | "boolean" | "json"
  category: "notification" | "booking" | "display" | "privacy"
  created_at: Date
  updated_at: Date
}

// Booking ratings and feedback
export interface BookingFeedback {
  id: string // UUID
  booking_id: string // UUID reference to bookings table
  student_id: string // UUID reference to students table
  trip_id?: string // UUID reference to trips table
  overall_rating: number // 1-5 stars
  punctuality_rating?: number // 1-5 stars
  cleanliness_rating?: number // 1-5 stars
  driver_rating?: number // 1-5 stars
  comfort_rating?: number // 1-5 stars
  feedback_text?: string
  improvement_suggestions?: string
  would_recommend: boolean
  created_at: Date
}

// Emergency contacts and safety
export interface EmergencyContact {
  id: string // UUID
  student_id: string // UUID reference to students table
  contact_name: string
  relationship: string
  phone_number: string
  email?: string
  is_primary: boolean
  is_active: boolean
  created_at: Date
  updated_at: Date
}

// Route schedule templates
export interface RouteScheduleTemplate {
  id: string // UUID
  route_id: string // UUID reference to routes table
  template_name: string
  day_type: "weekday" | "weekend" | "holiday"
  season: "regular" | "summer" | "winter" | "exam"
  frequency_minutes: number
  first_departure: string // HH:MM:SS
  last_departure: string // HH:MM:SS
  is_active: boolean
  created_at: Date
  updated_at: Date
}

// Dynamic pricing rules
export interface PricingRule {
  id: string // UUID
  rule_name: string
  route_id?: string // UUID reference to routes table (null for global)
  time_start: string // HH:MM:SS
  time_end: string // HH:MM:SS
  days_of_week: number[] // JSON array [0,1,2,3,4,5,6]
  multiplier: number
  fixed_adjustment: number
  condition_type: "peak_hour" | "low_demand" | "special_event" | "weather"
  is_active: boolean
  valid_from: Date
  valid_until?: Date
  created_at: Date
}

// =============================================
// UPDATED EXTENDED TYPES WITH NEW RELATIONSHIPS
// =============================================

export interface VehicleWithRelations extends Vehicle {
  current_route?: Route
  current_location?: VehicleLocation
  trips?: Trip[]
}

export interface TripWithRelations extends Trip {
  route: Route
  vehicle: Vehicle
  bookings?: BookingTrip[]
  occupancy_data?: TripOccupancy[]
}

export interface StudentWithExtendedRelations extends StudentWithRelations {
  frequent_routes?: StudentFrequentRoute[]
  emergency_contacts?: EmergencyContact[]
  preferences?: UserPreference[]
  recharge_history?: WalletRecharge[]
  feedback_given?: BookingFeedback[]
}

export interface BookingWithExtendedRelations extends BookingWithRelations {
  trip_details?: BookingTrip
  feedback?: BookingFeedback
  optimization_used?: RouteOptimization
}
