# Booking Management API Documentation

This document describes the REST API endpoints required for the admin Booking Management page.

---

## 1. Get All Bookings

**Endpoint:** `GET /api/admin/bookings`

**Query Parameters (optional):**
- `status`: Filter by booking status
- `studentId`: Filter by student
- `routeId`: Filter by route
- `fromDate`, `toDate`: Filter by date range
- `search`: Search by booking reference or student
- `page`, `pageSize`: Pagination

**Response:**
```json
[
  {
    "id": "UUID",
    "studentId": "UUID",
    "routeId": "UUID",
    "fromStopId": "UUID",
    "toStopId": "UUID",
    "scheduledTime": "ISODate",
    "status": "string",
    "pointsDeducted": 25,
    "bookingReference": "string",
    "notes": "string",
    "createdAt": "ISODate",
    "student": { "name": "string", "studentId": "string" },
    "route": { "name": "string", "color": "string" },
    "fromStop": { "name": "string" },
    "toStop": { "name": "string" }
  }
]
```

**Pseudocode:**
```
SELECT b.*, s.student_id, s.name, r.name as route_name, r.color, fs.name as from_stop, ts.name as to_stop, bst.name as status
FROM bookings b
JOIN students s ON b.student_id = s.id
JOIN routes r ON b.route_id = r.id
JOIN stops fs ON b.from_stop_id = fs.id
JOIN stops ts ON b.to_stop_id = ts.id
JOIN booking_status_types bst ON b.status_id = bst.id
WHERE (apply filters if present)
ORDER BY b.scheduled_time DESC
LIMIT {pageSize} OFFSET {page}
```
**Time Complexity:** O(P) for pagination, O(1) per row.  
**Space Complexity:** O(P) for result set.

---

## 2. Update Booking Status

**Endpoint:** `PUT /api/admin/bookings/{bookingId}/status`

**Request Body:**
```json
{
  "status": "confirmed|completed|cancelled|pending",
  "cancelledBy": "UUID (optional, if cancelled)",
  "cancellationReason": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "booking": { ...updated booking object... }
}
```

**Pseudocode:**
```
UPDATE bookings
SET status_id = (SELECT id FROM booking_status_types WHERE name = {status}),
    cancelled_at = (if status == 'cancelled' then NOW() else NULL),
    cancelled_by = {cancelledBy},
    cancellation_reason = {cancellationReason}
WHERE id = {bookingId}
RETURN updated booking
```
**Time Complexity:** O(1)  
**Space Complexity:** O(1)

---

## 3. Get Booking Details

**Endpoint:** `GET /api/admin/bookings/{bookingId}`

**Response:**
```json
{
  "id": "UUID",
  "student": { ... },
  "route": { ... },
  "fromStop": { ... },
  "toStop": { ... },
  "scheduledTime": "ISODate",
  "status": "string",
  "pointsDeducted": 25,
  "bookingReference": "string",
  "notes": "string",
  "createdAt": "ISODate",
  "transferBookings": [ ... ]
}
```

**Pseudocode:**
```
SELECT b.*, s.*, r.*, fs.*, ts.*, bst.name as status
FROM bookings b
JOIN students s ON b.student_id = s.id
JOIN routes r ON b.route_id = r.id
JOIN stops fs ON b.from_stop_id = fs.id
JOIN stops ts ON b.to_stop_id = ts.id
JOIN booking_status_types bst ON b.status_id = bst.id
WHERE b.id = {bookingId}

SELECT * FROM transfer_bookings WHERE main_booking_id = {bookingId}
```
**Time Complexity:** O(1)  
**Space Complexity:** O(1)

---

## 4. Delete Booking

**Endpoint:** `DELETE /api/admin/bookings/{bookingId}`

**Response:**
```json
{ "success": true }
```

**Pseudocode:**
```
DELETE FROM bookings WHERE id = {bookingId}
```
**Time Complexity:** O(1)  
**Space Complexity:** O(1)

---

## 5. Export Bookings (Report)

**Endpoint:** `GET /api/admin/bookings/export?format=csv|xlsx&...filters`

**Response:** File download (CSV/XLSX)

**Pseudocode:**
```
-- Same as Get All Bookings, but format result as CSV/XLSX and return as file
```
**Time Complexity:** O(N) for all filtered bookings  
**Space Complexity:** O(N)

---

For analytics or bulk status update APIs, extend as needed.
