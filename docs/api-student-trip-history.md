# Student Trip History API Documentation

## Endpoint
GET `/api/student/bookings/history`

---

## Request
- **Headers:**
  - `Authorization: Bearer <JWT>`
- **Query Parameters (optional):**
  - `limit` (number, default: 20)
  - `offset` (number, default: 0)
  - `fromDate` (optional, filter trips from this date)
  - `toDate` (optional, filter trips up to this date)
  - `status` (optional, e.g., `confirmed`, `cancelled`)

**Example:**
`/api/student/bookings/history?limit=20&offset=0&fromDate=2025-06-01&toDate=2025-06-20`

---

## Expected Response
```
[
  {
    "bookingId": "UUID",
    "routeName": "Route A",
    "fromStop": "Library Stop",
    "toStop": "Sports Complex",
    "scheduledTime": "2025-06-20T10:00:00",
    "status": "confirmed",
    "pointsDeducted": 44,
    "bookingReference": "ABC123456",
    "createdAt": "2025-06-18T09:00:00",
    "transfers": [
      {
        "fromRouteName": "Route A",
        "toRouteName": "Route B",
        "transferStop": "Central Stop",
        "estimatedWaitTime": 5,
        "transferOrder": 1
      }
      // ...more transfers if any
    ]
  },
  ...
]
```

---

## Pseudocode for Implementation
```typescript
function getStudentTripHistory(req, res) {
  // 1. Authenticate JWT, extract studentId
  const studentId = getStudentIdFromJWT(req);

  // 2. Parse query params (limit, offset, fromDate, toDate, status)
  const { limit = 20, offset = 0, fromDate, toDate, status } = req.query;

  // 3. Build SQL query for main bookings
  let query = `
    SELECT b.id AS bookingId, r.name AS routeName, fs.name AS fromStop, ts.name AS toStop,
           b.scheduled_time AS scheduledTime, bst.name AS status, b.points_deducted AS pointsDeducted,
           b.booking_reference AS bookingReference, b.created_at AS createdAt
    FROM bookings b
    JOIN routes r ON b.route_id = r.id
    JOIN stops fs ON b.from_stop_id = fs.id
    JOIN stops ts ON b.to_stop_id = ts.id
    JOIN booking_status_types bst ON b.status_id = bst.id
    WHERE b.student_id = $1
  `;
  const params = [studentId];
  let paramIdx = 2;

  if (fromDate) {
    query += ` AND b.scheduled_time >= $${paramIdx++}`;
    params.push(fromDate);
  }
  if (toDate) {
    query += ` AND b.scheduled_time <= $${paramIdx++}`;
    params.push(toDate);
  }
  if (status) {
    query += ` AND bst.name = $${paramIdx++}`;
    params.push(status);
  }
  query += ` ORDER BY b.scheduled_time DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
  params.push(limit, offset);

  // 4. Execute query and fetch main bookings
  const bookings = db.query(query, params);
  for (const booking of bookings.rows) {
    // 5. Fetch transfer journeys for each booking
    const transfers = db.query(
      `SELECT fr.name AS fromRouteName, tr.name AS toRouteName, s.name AS transferStop, tb.estimated_wait_time, tb.transfer_order
       FROM transfer_bookings tb
       JOIN routes fr ON tb.from_route_id = fr.id
       JOIN routes tr ON tb.to_route_id = tr.id
       JOIN stops s ON tb.transfer_stop_id = s.id
       WHERE tb.main_booking_id = $1
       ORDER BY tb.transfer_order ASC`,
      [booking.bookingId]
    );
    booking.transfers = transfers.rows;
  }
  res.status(200).json(bookings.rows);
}
```

---

## Notes
- **Time Complexity:** O(n + m) where n = number of trips returned, m = number of transfers (per trip, usually small).
- **Space Complexity:** O(n + m).
- **Security:** Only return trips for the authenticated student.
