/**
 * ORM Utility Functions
 *
 * This file contains utility functions for working with the database schema.
 * These functions provide a simple ORM-like interface for common operations.
 */

import { Pool, type QueryResult } from "pg"
import type {
  User,
  Student,
  Admin,
  Route,
  Stop,
  Booking,
  WalletTransaction,
  SystemSetting,
  UserWithRelations,
  StudentWithRelations,
  RouteWithRelations,
  BookingWithRelations,
} from "./database"

// Database connection pool
let pool: Pool

/**
 * Initialize the database connection pool
 * @param connectionString PostgreSQL connection string
 */
export function initializeDatabase(connectionString: string): void {
  pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  })
}

/**
 * Execute a SQL query with parameters
 * @param text SQL query text
 * @param params Query parameters
 * @returns Query result
 */
export async function query<T>(text: string, params: any[] = []): Promise<QueryResult<T>> {
  if (!pool) {
    throw new Error("Database not initialized. Call initializeDatabase first.")
  }
  return pool.query(text, params)
}

// =============================================
// USER OPERATIONS
// =============================================

/**
 * Find a user by ID
 * @param id User ID
 * @returns User object or null if not found
 */
export async function findUserById(id: string): Promise<User | null> {
  const result = await query<User>("SELECT * FROM users WHERE id = $1", [id])
  return result.rows[0] || null
}

/**
 * Find a user by email
 * @param email User email
 * @returns User object or null if not found
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await query<User>("SELECT * FROM users WHERE email = $1", [email])
  return result.rows[0] || null
}

/**
 * Find a user with related entities (student or admin)
 * @param id User ID
 * @returns User with relations or null if not found
 */
export async function findUserWithRelations(id: string): Promise<UserWithRelations | null> {
  const user = await findUserById(id)
  if (!user) return null

  const userWithRelations: UserWithRelations = { ...user }

  if (user.role === "student") {
    const result = await query<Student>("SELECT * FROM students WHERE user_id = $1", [id])
    userWithRelations.student = result.rows[0] || undefined
  } else if (user.role === "admin" || user.role === "super_admin") {
    const result = await query<Admin>("SELECT * FROM admins WHERE user_id = $1", [id])
    userWithRelations.admin = result.rows[0] || undefined
  }

  return userWithRelations
}

/**
 * Create a new user
 * @param user User data
 * @returns Created user
 */
export async function createUser(user: Omit<User, "id" | "created_at" | "updated_at">): Promise<User> {
  const { email, password_hash, name, role, is_active } = user

  const result = await query<User>(
    "INSERT INTO users (email, password_hash, name, role, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [email, password_hash, name, role, is_active],
  )

  return result.rows[0]
}

/**
 * Update a user
 * @param id User ID
 * @param user User data to update
 * @returns Updated user
 */
export async function updateUser(id: string, user: Partial<User>): Promise<User | null> {
  const currentUser = await findUserById(id)
  if (!currentUser) return null

  const updates: string[] = []
  const values: any[] = []
  let paramIndex = 1

  // Build dynamic update query
  for (const [key, value] of Object.entries(user)) {
    if (key !== "id" && key !== "created_at") {
      updates.push(`${key} = $${paramIndex}`)
      values.push(value)
      paramIndex++
    }
  }

  if (updates.length === 0) return currentUser

  updates.push(`updated_at = CURRENT_TIMESTAMP`)
  values.push(id)

  const result = await query<User>(
    `UPDATE users SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
    values,
  )

  return result.rows[0]
}

// =============================================
// STUDENT OPERATIONS
// =============================================

/**
 * Find a student by ID
 * @param id Student ID
 * @returns Student object or null if not found
 */
export async function findStudentById(id: string): Promise<Student | null> {
  const result = await query<Student>("SELECT * FROM students WHERE id = $1", [id])
  return result.rows[0] || null
}

/**
 * Find a student by user ID
 * @param userId User ID
 * @returns Student object or null if not found
 */
export async function findStudentByUserId(userId: string): Promise<Student | null> {
  const result = await query<Student>("SELECT * FROM students WHERE user_id = $1", [userId])
  return result.rows[0] || null
}

/**
 * Find a student by student ID (not UUID)
 * @param studentId Student ID (e.g., "S12345")
 * @returns Student object or null if not found
 */
export async function findStudentByStudentId(studentId: string): Promise<Student | null> {
  const result = await query<Student>("SELECT * FROM students WHERE student_id = $1", [studentId])
  return result.rows[0] || null
}

/**
 * Find a student with related entities (user, bookings, transactions)
 * @param id Student ID
 * @returns Student with relations or null if not found
 */
export async function findStudentWithRelations(id: string): Promise<StudentWithRelations | null> {
  const student = await findStudentById(id)
  if (!student) return null

  const userResult = await query<User>("SELECT * FROM users WHERE id = $1", [student.user_id])
  if (userResult.rows.length === 0) return null

  const studentWithRelations: StudentWithRelations = {
    ...student,
    user: userResult.rows[0],
  }

  return studentWithRelations
}

/**
 * Create a new student
 * @param student Student data
 * @returns Created student
 */
export async function createStudent(student: Omit<Student, "id" | "created_at" | "updated_at">): Promise<Student> {
  const {
    user_id,
    student_id,
    wallet_balance,
    profile_image_url,
    phone_number,
    emergency_contact,
    enrollment_date,
    graduation_date,
  } = student

  const result = await query<Student>(
    `INSERT INTO students 
     (user_id, student_id, wallet_balance, profile_image_url, phone_number, emergency_contact, enrollment_date, graduation_date) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [
      user_id,
      student_id,
      wallet_balance,
      profile_image_url,
      phone_number,
      emergency_contact,
      enrollment_date,
      graduation_date,
    ],
  )

  return result.rows[0]
}

/**
 * Update student wallet balance
 * @param id Student ID
 * @param amount Amount to add (positive) or subtract (negative)
 * @returns Updated student
 */
export async function updateStudentWalletBalance(id: string, amount: number): Promise<Student | null> {
  const result = await query<Student>(
    "UPDATE students SET wallet_balance = wallet_balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
    [amount, id],
  )

  return result.rows[0] || null
}

// =============================================
// ROUTE OPERATIONS
// =============================================

/**
 * Find a route by ID
 * @param id Route ID
 * @returns Route object or null if not found
 */
export async function findRouteById(id: string): Promise<Route | null> {
  const result = await query<Route>("SELECT * FROM routes WHERE id = $1", [id])
  return result.rows[0] || null
}

/**
 * Find all active routes
 * @returns Array of routes
 */
export async function findAllActiveRoutes(): Promise<Route[]> {
  const result = await query<Route>("SELECT * FROM routes WHERE is_active = true ORDER BY name")
  return result.rows
}

/**
 * Find a route with related entities (stops, operating hours)
 * @param id Route ID
 * @returns Route with relations or null if not found
 */
export async function findRouteWithRelations(id: string): Promise<RouteWithRelations | null> {
  const route = await findRouteById(id)
  if (!route) return null

  const routeWithRelations: RouteWithRelations = { ...route }

  // Get operating hours
  const operatingHoursResult = await query(
    "SELECT * FROM route_operating_hours WHERE route_id = $1 ORDER BY day_of_week, start_time",
    [id],
  )
  routeWithRelations.operating_hours = operatingHoursResult.rows

  // Get stops with stop details
  const stopsResult = await query(
    `SELECT rs.*, s.* 
     FROM route_stops rs
     JOIN stops s ON rs.stop_id = s.id
     WHERE rs.route_id = $1
     ORDER BY rs.stop_order`,
    [id],
  )

  routeWithRelations.stops = stopsResult.rows.map((row) => {
    const { id, route_id, stop_id, stop_order, estimated_travel_time, distance_from_previous, created_at } = row
    const stop = {
      id: row.stop_id,
      name: row.name,
      description: row.description,
      latitude: row.latitude,
      longitude: row.longitude,
      address: row.address,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }

    return {
      id,
      route_id,
      stop_id,
      stop_order,
      estimated_travel_time,
      distance_from_previous,
      created_at,
      stop,
    }
  })

  return routeWithRelations
}

// =============================================
// BOOKING OPERATIONS
// =============================================

/**
 * Find a booking by ID
 * @param id Booking ID
 * @returns Booking object or null if not found
 */
export async function findBookingById(id: string): Promise<Booking | null> {
  const result = await query<Booking>("SELECT * FROM bookings WHERE id = $1", [id])
  return result.rows[0] || null
}

/**
 * Find bookings by student ID
 * @param studentId Student ID
 * @param limit Maximum number of bookings to return
 * @param offset Offset for pagination
 * @returns Array of bookings
 */
export async function findBookingsByStudentId(studentId: string, limit = 10, offset = 0): Promise<Booking[]> {
  const result = await query<Booking>(
    "SELECT * FROM bookings WHERE student_id = $1 ORDER BY scheduled_time DESC LIMIT $2 OFFSET $3",
    [studentId, limit, offset],
  )

  return result.rows
}

/**
 * Find a booking with related entities
 * @param id Booking ID
 * @returns Booking with relations or null if not found
 */
export async function findBookingWithRelations(id: string): Promise<BookingWithRelations | null> {
  const booking = await findBookingById(id)
  if (!booking) return null

  // Get student with user
  const studentResult = await query<Student>("SELECT * FROM students WHERE id = $1", [booking.student_id])
  if (studentResult.rows.length === 0) return null

  const userResult = await query<User>("SELECT * FROM users WHERE id = $1", [studentResult.rows[0].user_id])
  if (userResult.rows.length === 0) return null

  // Get route
  const routeResult = await query<Route>("SELECT * FROM routes WHERE id = $1", [booking.route_id])
  if (routeResult.rows.length === 0) return null

  // Get stops
  const fromStopResult = await query<Stop>("SELECT * FROM stops WHERE id = $1", [booking.from_stop_id])
  const toStopResult = await query<Stop>("SELECT * FROM stops WHERE id = $1", [booking.to_stop_id])
  if (fromStopResult.rows.length === 0 || toStopResult.rows.length === 0) return null

  // Get status
  const statusResult = await query("SELECT * FROM booking_status_types WHERE id = $1", [booking.status_id])
  if (statusResult.rows.length === 0) return null

  const bookingWithRelations: BookingWithRelations = {
    ...booking,
    student: {
      ...studentResult.rows[0],
      user: userResult.rows[0],
    },
    route: routeResult.rows[0],
    from_stop: fromStopResult.rows[0],
    to_stop: toStopResult.rows[0],
    status: statusResult.rows[0],
  }

  // Get transfers if any
  const transfersResult = await query(
    "SELECT * FROM transfer_bookings WHERE main_booking_id = $1 ORDER BY transfer_order",
    [id],
  )

  if (transfersResult.rows.length > 0) {
    bookingWithRelations.transfers = transfersResult.rows
  }

  return bookingWithRelations
}

/**
 * Create a new booking
 * @param booking Booking data
 * @returns Created booking
 */
export async function createBooking(booking: Omit<Booking, "id" | "created_at" | "updated_at">): Promise<Booking> {
  const {
    student_id,
    route_id,
    from_stop_id,
    to_stop_id,
    scheduled_time,
    status_id,
    points_deducted,
    booking_reference,
    notes,
  } = booking

  const result = await query<Booking>(
    `INSERT INTO bookings 
     (student_id, route_id, from_stop_id, to_stop_id, scheduled_time, status_id, points_deducted, booking_reference, notes) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [
      student_id,
      route_id,
      from_stop_id,
      to_stop_id,
      scheduled_time,
      status_id,
      points_deducted,
      booking_reference,
      notes,
    ],
  )

  return result.rows[0]
}

/**
 * Update booking status
 * @param id Booking ID
 * @param statusId New status ID
 * @returns Updated booking
 */
export async function updateBookingStatus(id: string, statusId: string): Promise<Booking | null> {
  const result = await query<Booking>(
    "UPDATE bookings SET status_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
    [statusId, id],
  )

  return result.rows[0] || null
}

/**
 * Cancel a booking
 * @param id Booking ID
 * @param cancelledBy User ID of the canceller
 * @param reason Cancellation reason
 * @param statusId Status ID for cancelled bookings
 * @returns Updated booking
 */
export async function cancelBooking(
  id: string,
  cancelledBy: string,
  reason: string,
  statusId: string,
): Promise<Booking | null> {
  const result = await query<Booking>(
    `UPDATE bookings 
     SET status_id = $1, cancelled_at = CURRENT_TIMESTAMP, cancelled_by = $2, cancellation_reason = $3, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $4 RETURNING *`,
    [statusId, cancelledBy, reason, id],
  )

  return result.rows[0] || null
}

// =============================================
// TRANSACTION OPERATIONS
// =============================================

/**
 * Create a wallet transaction
 * @param transaction Transaction data
 * @returns Created transaction
 */
export async function createWalletTransaction(
  transaction: Omit<WalletTransaction, "id" | "created_at">,
): Promise<WalletTransaction> {
  const { student_id, transaction_type_id, amount, booking_id, description, reference_id, processed_by } = transaction

  const result = await query<WalletTransaction>(
    `INSERT INTO wallet_transactions 
     (student_id, transaction_type_id, amount, booking_id, description, reference_id, processed_by) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [student_id, transaction_type_id, amount, booking_id, description, reference_id, processed_by],
  )

  return result.rows[0]
}

/**
 * Find wallet transactions by student ID
 * @param studentId Student ID
 * @param limit Maximum number of transactions to return
 * @param offset Offset for pagination
 * @returns Array of transactions
 */
export async function findWalletTransactionsByStudentId(
  studentId: string,
  limit = 10,
  offset = 0,
): Promise<WalletTransaction[]> {
  const result = await query<WalletTransaction>(
    "SELECT * FROM wallet_transactions WHERE student_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
    [studentId, limit, offset],
  )

  return result.rows
}

// =============================================
// SYSTEM OPERATIONS
// =============================================

/**
 * Get a system setting by key
 * @param key Setting key
 * @returns Setting object or null if not found
 */
export async function getSystemSetting(key: string): Promise<SystemSetting | null> {
  const result = await query<SystemSetting>("SELECT * FROM system_settings WHERE setting_key = $1", [key])
  return result.rows[0] || null
}

/**
 * Get all system settings by category
 * @param category Setting category
 * @param isPublic Whether to return only public settings
 * @returns Array of settings
 */
export async function getSystemSettingsByCategory(category: string, isPublic = false): Promise<SystemSetting[]> {
  const query = isPublic
    ? "SELECT * FROM system_settings WHERE category = $1 AND is_public = true ORDER BY setting_key"
    : "SELECT * FROM system_settings WHERE category = $1 ORDER BY setting_key"

  const result = await query<SystemSetting>(query, [category])
  return result.rows
}

/**
 * Update a system setting
 * @param key Setting key
 * @param value New setting value
 * @returns Updated setting
 */
export async function updateSystemSetting(key: string, value: string): Promise<SystemSetting | null> {
  const result = await query<SystemSetting>(
    "UPDATE system_settings SET setting_value = $1, updated_at = CURRENT_TIMESTAMP WHERE setting_key = $2 RETURNING *",
    [value, key],
  )

  return result.rows[0] || null
}

// =============================================
// TRANSACTION HELPERS
// =============================================

/**
 * Execute a function within a transaction
 * @param callback Function to execute within the transaction
 * @returns Result of the callback function
 */
export async function withTransaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const client = await pool.connect()

  try {
    await client.query("BEGIN")
    const result = await callback(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

/**
 * Process a booking with wallet transaction in a single transaction
 * @param booking Booking data
 * @param transaction Transaction data
 * @returns Created booking and transaction
 */
export async function processBookingWithTransaction(
  booking: Omit<Booking, "id" | "created_at" | "updated_at">,
  transaction: Omit<WalletTransaction, "id" | "created_at">,
): Promise<{ booking: Booking; transaction: WalletTransaction }> {
  return withTransaction(async (client) => {
    // Create booking
    const bookingResult = await client.query(
      `INSERT INTO bookings 
       (student_id, route_id, from_stop_id, to_stop_id, scheduled_time, status_id, points_deducted, booking_reference, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        booking.student_id,
        booking.route_id,
        booking.from_stop_id,
        booking.to_stop_id,
        booking.scheduled_time,
        booking.status_id,
        booking.points_deducted,
        booking.booking_reference,
        booking.notes,
      ],
    )

    const createdBooking = bookingResult.rows[0]

    // Update wallet balance
    await client.query(
      "UPDATE students SET wallet_balance = wallet_balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [booking.points_deducted, booking.student_id],
    )

    // Create transaction
    const transactionResult = await client.query(
      `INSERT INTO wallet_transactions 
       (student_id, transaction_type_id, amount, booking_id, description, reference_id, processed_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        transaction.student_id,
        transaction.transaction_type_id,
        transaction.amount,
        createdBooking.id,
        transaction.description,
        transaction.reference_id,
        transaction.processed_by,
      ],
    )

    const createdTransaction = transactionResult.rows[0]

    return {
      booking: createdBooking,
      transaction: createdTransaction,
    }
  })
}
