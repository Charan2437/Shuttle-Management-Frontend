# Student Travel Analytics API Documentation

## Endpoint
GET `/api/student/analytics/travel`

---

## Request
- **Headers:**
  - `Authorization: Bearer <JWT>`
- **Query Parameters (optional):**
  - `fromDate` (optional) — filter analytics from this date
  - `toDate` (optional) — filter analytics up to this date

**Example:**
`/api/student/analytics/travel?fromDate=2025-06-01&toDate=2025-06-20`

---

## Expected Response
```
{
  "totalTrips": 18,
  "totalPointsSpent": 520,
  "avgRating": 4.6,
  "favoriteRoute": {
    "routeId": "UUID",
    "routeName": "Route A",
    "fromStop": "Library Stop",
    "toStop": "Sports Complex",
    "tripCount": 7
  },
  "peakTime": "Morning (6AM-12PM)",
  "usagePattern": [
    { "period": "Morning (6AM-12PM)", "percentage": 45, "trips": 8 },
    { "period": "Afternoon (12PM-6PM)", "percentage": 35, "trips": 6 },
    { "period": "Evening (6PM-12AM)", "percentage": 20, "trips": 4 }
  ],
  "pointsSaved": 30
}
```

---

## Description
- Returns analytics for the authenticated student’s travel history.
- Includes total trips, points spent, average rating, favorite route, peak usage time, usage pattern breakdown, and points saved (e.g., via smart routing or offers).

---

## Pseudocode for Implementation
```typescript
function getTravelAnalytics(req, res) {
  // 1. Authenticate JWT, extract studentId
  const studentId = getStudentIdFromJWT(req);

  // 2. Parse query params
  const { fromDate, toDate } = req.query;

  // 3. Build base query for bookings
  let baseQuery = `
    SELECT b.*, r.name AS routeName, fs.name AS fromStop, ts.name AS toStop
    FROM bookings b
    JOIN routes r ON b.route_id = r.id
    JOIN stops fs ON b.from_stop_id = fs.id
    JOIN stops ts ON b.to_stop_id = ts.id
    WHERE b.student_id = $1
  `;
  const params = [studentId];
  let paramIdx = 2;

  if (fromDate) {
    baseQuery += ` AND b.scheduled_time >= $${paramIdx++}`;
    params.push(fromDate);
  }
  if (toDate) {
    baseQuery += ` AND b.scheduled_time <= $${paramIdx++}`;
    params.push(toDate);
  }

  // 4. Execute query and process analytics
  const bookings = db.query(baseQuery, params);

  // 5. Calculate analytics
  const totalTrips = bookings.rows.length;
  const totalPointsSpent = bookings.rows.reduce((sum, b) => sum + b.points_deducted, 0);
  const avgRating = bookings.rows.reduce((sum, b) => sum + (b.rating || 0), 0) / (bookings.rows.filter(b => b.rating).length || 1);

  // Favorite route
  const routeCounts = {};
  for (const b of bookings.rows) {
    const key = `${b.route_id}|${b.from_stop_id}|${b.to_stop_id}`;
    routeCounts[key] = (routeCounts[key] || 0) + 1;
  }
  let favoriteRouteKey = Object.keys(routeCounts).sort((a, b) => routeCounts[b] - routeCounts[a])[0];
  let favoriteRoute = null;
  if (favoriteRouteKey) {
    const [routeId, fromStopId, toStopId] = favoriteRouteKey.split('|');
    const sample = bookings.rows.find(b => b.route_id === routeId && b.from_stop_id === fromStopId && b.to_stop_id === toStopId);
    favoriteRoute = {
      routeId,
      routeName: sample.routeName,
      fromStop: sample.fromStop,
      toStop: sample.toStop,
      tripCount: routeCounts[favoriteRouteKey]
    };
  }

  // Peak time and usage pattern
  const periods = [
    { name: 'Morning (6AM-12PM)', start: 6, end: 12 },
    { name: 'Afternoon (12PM-6PM)', start: 12, end: 18 },
    { name: 'Evening (6PM-12AM)', start: 18, end: 24 }
  ];
  const usagePattern = periods.map(period => {
    const trips = bookings.rows.filter(b => {
      const hour = new Date(b.scheduled_time).getHours();
      return hour >= period.start && hour < period.end;
    });
    return {
      period: period.name,
      percentage: Math.round((trips.length / totalTrips) * 100),
      trips: trips.length
    };
  });
  const peakTime = usagePattern.sort((a, b) => b.trips - a.trips)[0]?.period || null;

  // Points saved (example: via offers, smart routing, etc.)
  const pointsSaved = 0; // Implement logic as needed

  // 6. Return analytics
  res.status(200).json({
    totalTrips,
    totalPointsSpent,
    avgRating: Math.round(avgRating * 10) / 10,
    favoriteRoute,
    peakTime,
    usagePattern,
    pointsSaved
  });
}
```

---

## Notes
- **Time Complexity:** O(n) for n = number of bookings in the period.
- **Space Complexity:** O(n) for n = number of bookings in the period.
- **Security:** Only returns analytics for the authenticated student.
