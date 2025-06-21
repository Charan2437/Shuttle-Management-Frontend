# API Documentation: Student Trip History & Analytics

This document describes the APIs used in the Student Trip History and related student features of the Shuttle Management System. Each API is detailed with its endpoint, method, request headers/body, response structure, and the purpose of the API.

---

## 1. Get Student Trip History

- **Endpoint:** `GET /api/student/bookings/history`
- **Headers:**
  - `Authorization: Bearer <jwt>`
- **Query Parameters (optional):**
  - `limit` (number, default: 20)
  - `offset` (number, default: 0)
  - `fromDate` (ISO date string)
  - `toDate` (ISO date string)
  - `status` (e.g., `confirmed`, `cancelled`)
- **Request Body:** _None_
- **Response Structure:**
  ```json
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
          "fromStop": "...",
          "toStop": "...",
          "transferStop": "...",
          "estimated_wait_time": 5,
          "transfer_order": 1
        }
      ]
    }
  ]
  ```
- **Purpose:**
  - Fetches the complete trip history for the authenticated student, including transfer details and booking metadata.

---

## 2. Get Student Frequent Routes

- **Endpoint:** `GET /api/student/routes/frequent`
- **Headers:**
  - `Authorization: Bearer <jwt>`
- **Query Parameters (optional):**
  - `limit` (number, default: 5)
  - `fromDate` (ISO date string)
  - `toDate` (ISO date string)
- **Request Body:** _None_
- **Response Structure:**
  ```json
  [
    {
      "routeId": "UUID",
      "routeName": "Route A",
      "fromStop": "Library Stop",
      "toStop": "Sports Complex",
      "tripCount": 12,
      "lastUsed": "2025-06-20T10:00:00"
    }
  ]
  ```
- **Purpose:**
  - Returns the most frequently booked routes by the authenticated student, including usage statistics and last used date.

---

## 3. Confirm Booking

- **Endpoint:** `POST /api/student/bookings/confirm`
- **Headers:**
  - `Authorization: Bearer <jwt>`
- **Request Body:**
  ```json
  {
    "studentId": "UUID",
    "legs": [
      {
        "routeId": "UUID",
        "cost": 44.32
      }
    ],
    "totalCost": 44.32
  }
  ```
- **Response Structure:**
  - **Success:**
    ```json
    {
      "success": true,
      "bookingId": "UUID",
      "bookingReference": "ABC123456",
      "message": "Booking confirmed"
    }
    ```
  - **Failure:**
    ```json
    {
      "success": false,
      "message": "Insufficient balance"
    }
    ```
- **Purpose:**
  - Confirms a new booking for the student, deducts points, and returns booking details.

---

## 4. Get Student Travel Analytics

- **Endpoint:** `GET /api/student/analytics/travel`
- **Headers:**
  - `Authorization: Bearer <jwt>`
- **Query Parameters (optional):**
  - `fromDate` (ISO date string)
  - `toDate` (ISO date string)
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
    "usagePattern": [
      { "period": "Morning (6AM-12PM)", "percentage": 45, "trips": 8 },
      { "period": "Evening (6PM-12AM)", "percentage": 20, "trips": 4 }
    ],
    "pointsSaved": 30
  }
  ```
- **Purpose:**
  - Returns analytics for the authenticated student’s travel history, including total trips, points spent, favorite route, peak usage time, usage pattern, and points saved.

---

## 5. Get Student Monthly Analytics

- **Endpoint:** `GET /api/student/analytics/monthly`
- **Headers:**
  - `Authorization: Bearer <jwt>`
- **Request Body:** _None_
- **Response Structure:**
  ```json
  {
    "totalTrips": number,
    "totalPointsSpent": number,
    "pointsSaved": number
  }
  ```
- **Purpose:**
  - Provides a monthly summary of the student's shuttle usage, including total trips, points spent, and points saved.

---

## 6. Get Student Wallet Balance

- **Endpoint:** `GET /api/student/wallet`
- **Headers:**
  - `Authorization: Bearer <jwt>`
- **Request Body:** _None_
- **Response Structure:**
  ```json
  {
    "studentId": "UUID",
    "walletBalance": 1000,
    "lastTransaction": "2025-06-18T17:43:31.481+00:00"
  }
  ```
- **Purpose:**
  - Returns the current wallet balance and last transaction date for the authenticated student.

---

## 7. Get Student Wallet Transaction History

- **Endpoint:** `GET /api/student/wallet/transactions?limit=20&offset=0`
- **Headers:**
  - `Authorization: Bearer <jwt>`
- **Request Body:** _None_
- **Response Structure:**
  ```json
  [
    {
      "id": "UUID",
      "type": "credit" | "debit",
      "amount": 500,
      "createdAt": "2025-06-18T17:43:31.481+00:00"
    }
  ]
  ```
- **Purpose:**
  - Returns a paginated list of wallet transactions for the authenticated student.

---

## 8. Recharge Wallet

- **Endpoint:** `POST /api/student/wallet/recharge`
- **Headers:**
  - `Authorization: Bearer <jwt>`
- **Request Body:**
  ```json
  {
    "amount": 500,
    "razorpayPaymentId": "pay_XXXXXXXXXXXX"
  }
  ```
- **Response Structure:**
  - **Success:**
    ```json
    {
      "success": true,
      "transactionId": "UUID"
    }
    ```
  - **Failure:**
    ```json
    {
      "success": false,
      "error": "Reason for failure"
    }
    ```
- **Purpose:**
  - Recharges the student's wallet with the specified amount after successful payment.

---

