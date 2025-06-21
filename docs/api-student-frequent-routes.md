# Student Frequent Routes API Documentation

## Endpoint
GET `/api/student/routes/frequent`

---

## Request
- **Headers:**
  - `Authorization: Bearer <JWT>`
- **Query Parameters (optional):**
  - `limit` (number, default: 5) — how many top routes to return
  - `fromDate` (optional) — filter by start date
  - `toDate` (optional) — filter by end date

**Example:**
`/api/student/routes/frequent?limit=5&fromDate=2025-06-01&toDate=2025-06-20`

---

## Expected Response
```
[
  {
    "routeId": "UUID",
    "routeName": "Route A",
    "fromStop": "Library Stop",
    "toStop": "Sports Complex",
    "tripCount": 12,
    "lastUsed": "2025-06-20T10:00:00"
  },
  ...
]
```

---

## Description
- Returns the most frequently booked routes by the authenticated student.
- Each object includes the route, endpoints, number of trips, and last used date.

---

## Pseudocode for Implementation
```typescript
function getFrequentRoutes(req, res) {
  // 1. Authenticate JWT, extract studentId
  const studentId = getStudentIdFromJWT(req);

  // 2. Parse query params
  const { limit = 5, fromDate, toDate } = req.query;

  // 3. Build SQL query
  let query = `
    SELECT b.route_id AS routeId, r.name AS routeName, fs.name AS fromStop, ts.name AS toStop,
           COUNT(*) AS tripCount, MAX(b.scheduled_time) AS lastUsed
    FROM bookings b
    JOIN routes r ON b.route_id = r.id
    JOIN stops fs ON b.from_stop_id = fs.id
    JOIN stops ts ON b.to_stop_id = ts.id
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
  query += `
    GROUP BY b.route_id, r.name, fs.name, ts.name
    ORDER BY tripCount DESC, lastUsed DESC
    LIMIT $${paramIdx}
  `;
  params.push(limit);

  // 4. Execute query and return results
  const routes = db.query(query, params);
  res.status(200).json(routes.rows);
}
```

---

## Notes
- **Time Complexity:** O(n) for n = number of unique routes booked by the student.
- **Space Complexity:** O(n) for n = number of unique routes returned.
- **Security:** Only returns data for the authenticated student.
