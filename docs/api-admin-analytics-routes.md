# Admin Analytics: Routes API Documentation

## Endpoint

**GET** `/api/admin/analytics/routes`

### Request
- **Method:** GET
- **Auth:** Admin JWT (Bearer token)
- **Query Params:** (optional)
  - `fromDate` (ISO date string)
  - `toDate` (ISO date string)

#### Example
```
GET /api/admin/analytics/routes?fromDate=2025-06-01&toDate=2025-06-20
Authorization: Bearer <admin-jwt>
```

---

### Response
```json
{
  "routes": [
    {
      "routeId": "route-uuid",
      "routeName": "Main Campus Loop",
      "bookings": 450,
      "efficiency": 92,
      "revenue": 1800,
      "onTime": 92,
      "delayed": 6,
      "cancelled": 2
    }
    // ...more routes
  ],
  "topRoutes": [
    {
      "routeId": "route-uuid",
      "routeName": "Main Campus Loop",
      "bookings": 450
    }
    // ...top N routes by bookings
  ]
}
```
- `routes`: Array of route analytics.
- `routeId`: Unique route identifier.
- `routeName`: Name of the route.
- `bookings`: Total bookings for the route in the period.
- `efficiency`: Percentage of trips completed on time.
- `revenue`: Total revenue/points for the route.
- `onTime`, `delayed`, `cancelled`: Percentages of trip statuses for the route.
- `topRoutes`: (Optional) Top N routes by bookings.

---

## Database Structure (relevant tables)
- `routes (id, name, ... )`
- `trips (id, route_id, scheduled_start_time, status, ... )`
- `bookings (id, route_id, status, points_deducted, created_at, ... )`

---

## Backend Pseudocode

```typescript
app.get('/api/admin/analytics/routes', async (req, res) => {
  const { fromDate, toDate } = req.query;

  // 1. Aggregate route analytics
  const routes = await db.query(`
    SELECT
      r.id AS routeId,
      r.name AS routeName,
      COUNT(b.id) AS bookings,
      COALESCE(SUM(b.points_deducted), 0) AS revenue,
      ROUND(100.0 * SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) / NULLIF(COUNT(t.id), 0), 2) AS efficiency,
      ROUND(100.0 * SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) / NULLIF(COUNT(t.id), 0), 2) AS onTime,
      ROUND(100.0 * SUM(CASE WHEN t.status = 'delayed' THEN 1 ELSE 0 END) / NULLIF(COUNT(t.id), 0), 2) AS delayed,
      ROUND(100.0 * SUM(CASE WHEN t.status = 'cancelled' THEN 1 ELSE 0 END) / NULLIF(COUNT(t.id), 0), 2) AS cancelled
    FROM routes r
    LEFT JOIN trips t ON t.route_id = r.id
      ${fromDate ? "AND t.scheduled_start_time >= $1" : ""}
      ${toDate ? "AND t.scheduled_start_time <= $2" : ""}
    LEFT JOIN bookings b ON b.route_id = r.id
      ${fromDate ? "AND b.created_at >= $1" : ""}
      ${toDate ? "AND b.created_at <= $2" : ""}
    GROUP BY r.id, r.name
    ORDER BY bookings DESC
  `, [fromDate, toDate].filter(Boolean));

  // 2. Top routes by bookings
  const topRoutes = routes.rows.slice(0, 5).map(r => ({
    routeId: r.routeid,
    routeName: r.routename,
    bookings: Number(r.bookings)
  }));

  res.json({
    routes: routes.rows.map(r => ({
      routeId: r.routeid,
      routeName: r.routename,
      bookings: Number(r.bookings),
      efficiency: Number(r.efficiency),
      revenue: Number(r.revenue),
      onTime: Number(r.ontime),
      delayed: Number(r.delayed),
      cancelled: Number(r.cancelled)
    })),
    topRoutes
  });
});
```

---

## Notes
- Adjust SQL and field names as per your schema.
- Add authentication/authorization as needed.
- For large datasets, consider adding indexes on `route_id`, `scheduled_start_time`, and `created_at`.
