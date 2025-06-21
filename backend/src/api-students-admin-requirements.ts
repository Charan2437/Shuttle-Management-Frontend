// Student Management API Documentation
// Generated on 2025-06-19

/**
 * 1. Get All Students
 *   - Method: GET
 *   - Endpoint: /api/admin/students
 *   - Request: None
 *   - Response: Array<StudentWithUserInfo>
 *   - Pseudocode:
 *     fetch all Student records (join with User for name/email)
 *     return as a list
 *   - Time: O(N), Space: O(N)
 *
 * 2. Create a Student
 *   - Method: POST
 *   - Endpoint: /api/admin/students
 *   - Request: {
 *       name, email, password, studentId, walletBalance, profileImageUrl, phoneNumber, emergencyContact, enrollmentDate, graduationDate
 *     }
 *   - Response: Created student object
 *   - Pseudocode:
 *     validate input
 *     create User record (with name, email, password, role=student)
 *     create Student record (with userId and other fields)
 *     return the created student (with joined user info)
 *   - Time: O(1), Space: O(1)
 *
 * 3. Update a Student
 *   - Method: PUT
 *   - Endpoint: /api/admin/students/{studentId}
 *   - Request: (fields to update, same as create except password is optional)
 *   - Response: Updated student object
 *   - Pseudocode:
 *     validate input
 *     find Student by studentId
 *     update Student record
 *     update User record if name/email changed
 *     return updated student (with joined user info)
 *   - Time: O(1), Space: O(1)
 *
 * 4. Delete a Student
 *   - Method: DELETE
 *   - Endpoint: /api/admin/students/{studentId}
 *   - Request: None
 *   - Response: { success: true }
 *   - Pseudocode:
 *     find Student by studentId
 *     delete Student record
 *     optionally delete User record
 *     return success
 *   - Time: O(1), Space: O(1)
 *
 * 5. Get Student Details
 *   - Method: GET
 *   - Endpoint: /api/admin/students/{studentId}
 *   - Request: None
 *   - Response: Student object
 *   - Pseudocode:
 *     find Student by studentId
 *     join with User for name/email
 *     return student details
 *   - Time: O(1), Space: O(1)
 */

// Extend this documentation for wallet management, booking history, etc. as needed.
