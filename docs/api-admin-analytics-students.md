# Admin Analytics: Students API Documentation

## Endpoint

**GET** `/api/admin/analytics/students`

### Request
- **Method:** GET
- **Auth:** Admin JWT (Bearer token)
- **Query Params:** (optional)
  - `fromDate` (ISO date string)
  - `toDate` (ISO date string)

#### Example
```
GET /api/admin/analytics/students?fromDate=2025-06-01&toDate=2025-06-20
Authorization: Bearer <admin-jwt>
```

---

### Response
```json
{
  "totalStudents": 1234,
  "activeStudents": 980,
  "newRegistrations": 45,
  "avgTripsPerStudent": 12.4,
  "userSegments": [
    { "label": "Frequent Users", "count": 234, "criteria": "10+ trips/week" },
    { "label": "Regular Users", "count": 456, "criteria": "5-9 trips/week" },
    { "label": "Occasional Users", "count": 678, "criteria": "1-4 trips/week" },
    { "label": "Inactive Users", "count": 174, "criteria": "0 trips/week" }
  ],
  "popularRoutesByStudentType": [
    { "segment": "Frequent Users", "routeName": "Dormitory → Academic", "percentage": 45 },
    { "segment": "Regular Users", "routeName": "Academic → Library", "percentage": 32 }
    // ...
  ]
}
```

---

## Database Structure (relevant tables)
- `students (id, name, email, created_at, ...)`
- `bookings (id, student_id, status, created_at, scheduled_time, ...)`
- `routes (id, name, ...)`
- `booking_trips (id, booking_id, trip_id, boarded_at, ...)`

---

## Backend Pseudocode

```typescript
app.get('/api/admin/analytics/students', async (req, res) => {
  const { fromDate, toDate } = req.query;

  // 1. Total students
  const totalStudents = await db.query(`
    SELECT COUNT(*) FROM students
    WHERE 1=1
      ${fromDate ? "AND created_at >= $1" : ""}
      ${toDate ? "AND created_at <= $2" : ""}
  `, [fromDate, toDate].filter(Boolean));

  // 2. Active students (at least 1 booking in period)
  const activeStudents = await db.query(`
    SELECT COUNT(DISTINCT student_id) FROM bookings
    WHERE status IN ('completed', 'boarded')
      ${fromDate ? "AND created_at >= $1" : ""}
      ${toDate ? "AND created_at <= $2" : ""}
  `, [fromDate, toDate].filter(Boolean));

  // 3. New registrations in period
  const newRegistrations = await db.query(`
    SELECT COUNT(*) FROM students
    WHERE 1=1
      ${fromDate ? "AND created_at >= $1" : ""}
      ${toDate ? "AND created_at <= $2" : ""}
  `, [fromDate, toDate].filter(Boolean));

  // 4. Average trips per student
  const totalTrips = await db.query(`
    SELECT COUNT(*) FROM bookings
    WHERE status IN ('completed', 'boarded')
      ${fromDate ? "AND created_at >= $1" : ""}
      ${toDate ? "AND created_at <= $2" : ""}
  `, [fromDate, toDate].filter(Boolean));
  const avgTripsPerStudent = activeStudents.rows[0].count > 0
    ? totalTrips.rows[0].count / activeStudents.rows[0].count
    : 0;

  // 5. User segments (example: by trips per week)
  // You may need to aggregate bookings per student and group by count ranges

  // 6. Popular routes by student type (segment)
  // Join bookings, students, and routes, group by segment and route

  res.json({
    totalStudents: Number(totalStudents.rows[0].count),
    activeStudents: Number(activeStudents.rows[0].count),
    newRegistrations: Number(newRegistrations.rows[0].count),
    avgTripsPerStudent,
    userSegments: [
      // Fill with actual segment calculations
    ],
    popularRoutesByStudentType: [
      // Fill with actual aggregation
    ]
  });
});
```

---

## Notes
- Adjust SQL and field names as per your schema.
- Add authentication/authorization as needed.
- For large datasets, consider adding indexes on `student_id`, `created_at`, and `status`.
