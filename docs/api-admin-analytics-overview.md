# Admin Analytics Overview API Documentation

## Endpoint

**GET** `/api/admin/analytics/overview`

### Request
- **Method:** GET
- **Auth:** Admin JWT (Bearer token)
- **Query Params:** (optional)
  - `fromDate` (ISO date string)
  - `toDate` (ISO date string)

#### Example
```
GET /api/admin/analytics/overview?fromDate=2025-06-01&toDate=2025-06-20
Authorization: Bearer <admin-jwt>
```

---

### Response
```json
{
  "totalActiveStudents": 1234,
  "averageBookingsPerDay": 87.5,
  "hourlyBookingPattern": [
    { "hour": 6, "count": 12 },
    { "hour": 7, "count": 18 },
    ...
    { "hour": 23, "count": 2 }
  ],
  "peakHour": { "hour": 8, "count": 45 }
}
```
- `totalActiveStudents`: Number of students with at least one booking in the period (or all time if no filter).
- `averageBookingsPerDay`: Average number of bookings per day in the period.
- `hourlyBookingPattern`: Array of objects, each with `hour` (0-23) and `count` (number of bookings started in that hour).
- `peakHour`: The hour with the highest number of bookings.

---

## Database Structure (relevant tables)
- `students (id, name, email, is_active, created_at, ...)`
- `bookings (id, student_id, status, created_at, scheduled_time, ...)`
- `booking_trips (id, booking_id, trip_id, boarded_at, ...)`
- `trips (id, route_id, scheduled_start_time, ...)`

---

## Backend Pseudocode

```typescript
// Express route handler
app.get('/api/admin/analytics/overview', async (req, res) => {
  const { fromDate, toDate } = req.query;

  // 1. Total active students
  const totalActiveStudents = await db.query(`
    SELECT COUNT(DISTINCT student_id) AS count
    FROM bookings
    WHERE status IN ('completed', 'boarded')
      ${fromDate ? "AND created_at >= $1" : ""}
      ${toDate ? "AND created_at <= $2" : ""}
  `, [fromDate, toDate].filter(Boolean));

  // 2. Average bookings per day
  const bookingsResult = await db.query(`
    SELECT COUNT(*) AS total, MIN(DATE(created_at)) AS min_date, MAX(DATE(created_at)) AS max_date
    FROM bookings
    WHERE status IN ('completed', 'boarded')
      ${fromDate ? "AND created_at >= $1" : ""}
      ${toDate ? "AND created_at <= $2" : ""}
  `, [fromDate, toDate].filter(Boolean));
  const totalBookings = bookingsResult.rows[0].total;
  const minDate = bookingsResult.rows[0].min_date;
  const maxDate = bookingsResult.rows[0].max_date;
  const days = (new Date(maxDate) - new Date(minDate)) / (1000 * 60 * 60 * 24) + 1;
  const averageBookingsPerDay = days > 0 ? totalBookings / days : totalBookings;

  // 3. Hourly booking pattern
  const hourlyPattern = await db.query(`
    SELECT EXTRACT(HOUR FROM scheduled_time) AS hour, COUNT(*) AS count
    FROM bookings
    WHERE status IN ('completed', 'boarded')
      ${fromDate ? "AND created_at >= $1" : ""}
      ${toDate ? "AND created_at <= $2" : ""}
    GROUP BY hour
    ORDER BY hour
  `, [fromDate, toDate].filter(Boolean));

  // 4. Peak hour
  const peakHour = hourlyPattern.rows.reduce((max, row) => row.count > max.count ? row : max, { hour: null, count: 0 });

  res.json({
    totalActiveStudents: Number(totalActiveStudents.rows[0].count),
    averageBookingsPerDay,
    hourlyBookingPattern: hourlyPattern.rows.map(r => ({ hour: Number(r.hour), count: Number(r.count) })),
    peakHour: { hour: Number(peakHour.hour), count: Number(peakHour.count) }
  });
});
```

---

## Notes
- All queries can be adjusted for your SQL dialect and ORM.
- Add authentication/authorization as needed.
- For large datasets, consider adding indexes on `created_at` and `scheduled_time` in `bookings`.
