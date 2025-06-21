# API Documentation: Admin APIs (Shuttle Management System)

This section documents the main admin-side APIs relevant to shuttle management, analytics, and student management. Each API includes endpoint, method, headers, request/response structure, and purpose.

---

## 1. Get All Students

- **Endpoint:** `GET /api/admin/students`
- **Headers:**
  - `Authorization: Bearer <jwt>`
- **Query Parameters (optional):**
  - `limit` (number, default: 20)
  - `offset` (number, default: 0)
  - `search` (string, filter by name/email)
- **Request Body:** _None_
- **Response Structure:**
  ```json
  [
    {
      "studentId": "UUID",
      "name": "John Doe",
      "email": "john@example.com",
      "walletBalance": 1000,
      "status": "active"
    }
  ]
  ```
- **Purpose:**
  - Lists all students with basic info and wallet balance for admin management.

---

## 2. Get Student Trip Stats

- **Endpoint:** `GET /api/admin/students/:studentId/stats`
- **Headers:**
  - `Authorization: Bearer <jwt>`
- **Request Body:** _None_
- **Response Structure:**
  ```json
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
    "pointsSaved": 30
  }
  ```
- **Purpose:**
  - Returns analytics for a specific student, including trip count, points spent, favorite route, and peak usage time.

---

## 3. Get All Routes

- **Endpoint:** `GET /api/admin/routes`
- **Headers:**
  - `Authorization: Bearer <jwt>`
- **Request Body:** _None_
- **Response Structure:**
  ```json
  [
    {
      "routeId": "UUID",
      "routeName": "Route A",
      "fromStop": "Library Stop",
      "toStop": "Sports Complex",
      "active": true
    }
  ]
  ```
- **Purpose:**
  - Lists all shuttle routes for management and analytics.

---

## 4. Get Route Analytics

- **Endpoint:** `GET /api/admin/analytics/routes`
- **Headers:**
  - `Authorization: Bearer <jwt>`
- **Query Parameters (optional):**
  - `routeId` (string)
  - `fromDate` (ISO date string)
  - `toDate` (ISO date string)
- **Request Body:** _None_
- **Response Structure:**
  ```json
  {
    "routeId": "UUID",
    "routeName": "Route A",
    "totalTrips": 120,
    "uniqueStudents": 45,
    "pointsCollected": 5200,
    "peakTime": "Morning (6AM-12PM)"
  }
  ```
- **Purpose:**
  - Provides analytics for a specific route, including trip count, unique users, and points collected.

---

## 5. Get Admin Analytics Overview

- **Endpoint:** `GET /api/admin/analytics/overview`
- **Headers:**
  - `Authorization: Bearer <jwt>`
- **Request Body:** _None_
- **Response Structure:**
  ```json
  {
    "totalStudents": 1200,
    "totalTrips": 15000,
    "totalPointsCollected": 120000,
    "activeRoutes": 8
  }
  ```
- **Purpose:**
  - Returns a dashboard summary for the admin, including total students, trips, points, and active routes.

---

## 6. Bulk Allocate Points to Students

- **Endpoint:** `POST /api/admin/students/points/bulk-allocate`
- **Headers:**
  - `Authorization: Bearer <jwt>`
- **Request Body:**
  ```json
  {
    "studentIds": ["UUID1", "UUID2"],
    "points": 100,
    "reason": "Monthly bonus"
  }
  ```
- **Response Structure:**
  ```json
  {
    "success": true,
    "allocated": 2
  }
  ```
- **Purpose:**
  - Allocates points to multiple students in bulk for rewards or corrections.

---

## 7. Get All Stops

- **Endpoint:** `GET /api/admin/stops`
- **Headers:**
  - `Authorization: Bearer <jwt>`
- **Request Body:** _None_
- **Response Structure:**
  ```json
  [
    {
      "stopId": "UUID",
      "stopName": "Library Stop",
      "active": true
    }
  ]
  ```
- **Purpose:**
  - Lists all shuttle stops for route management.

---

## 8. Add or Update Route

- **Endpoint:** `POST /api/admin/routes`
- **Headers:**
  - `Authorization: Bearer <jwt>`
- **Request Body:**
  ```json
  {
    "routeId": "UUID" (optional for new),
    "routeName": "Route A",
    "fromStop": "Library Stop",
    "toStop": "Sports Complex",
    "active": true
  }
  ```
- **Response Structure:**
  ```json
  {
    "success": true,
    "routeId": "UUID"
  }
  ```
- **Purpose:**
  - Adds a new route or updates an existing route.

---

**Note:** All endpoints require a valid JWT in the `Authorization` header. For more details, refer to the backend API documentation in the `docs/` folder.

---

**Document generated on 2025-06-21.**
