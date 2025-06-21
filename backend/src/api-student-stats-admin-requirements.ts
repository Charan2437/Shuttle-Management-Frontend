// Student Stats API Documentation
// Generated on 2025-06-19

/**
 * 1. Get Student Stats
 *   - Method: GET
 *   - Endpoint: /api/admin/students/{studentId}/stats
 *   - Request: None
 *   - Response:
 *     {
 *       studentId: string,
 *       totalRides: number,
 *       totalSpent: number
 *     }
 *   - Pseudocode:
 *     // Get total rides
 *     totalRides = count of Booking records where student_id = {studentId}
 *
 *     // Get total spent
 *     totalSpent = sum of WalletTransaction.amount where student_id = {studentId} and amount < 0
 *     // (or use transaction_type_id for debits if available)
 *
 *     return { studentId, totalRides, totalSpent }
 *   - Time: O(M + N), Space: O(1)
 *     (M = number of bookings for student, N = number of transactions for student)
 *
 * 2. (Optional) Get Stats for All Students
 *   - Method: GET
 *   - Endpoint: /api/admin/students/stats
 *   - Request: None
 *   - Response: Array<{ studentId, totalRides, totalSpent }>
 *   - Pseudocode:
 *     for each student:
 *       totalRides = count of Booking records for student
 *       totalSpent = sum of WalletTransaction.amount for student (debits)
 *     return array of stats
 *   - Time: O(S + M + N), Space: O(S)
 *     (S = number of students)
 */

// Your Booking and WalletTransaction tables are sufficient for these APIs.
