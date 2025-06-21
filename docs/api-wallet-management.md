# Admin Wallet Management API Documentation

This document describes the REST API endpoints required for the admin Wallet Management page.

---

## 1. Get All Student Wallets

**Endpoint:** `GET /api/admin/wallets`

**Response:**
```json
[
  {
    "studentId": "UUID",
    "name": "John Doe",
    "email": "john.doe@university.edu",
    "walletBalance": 15000,
    "totalAllocated": 20000,
    "totalSpent": 5000,
    "lastTransaction": "2025-06-18T17:43:31.481+00:00"
  }
]
```

**Pseudocode:**
```
SELECT s.id as studentId, u.name, u.email, s.wallet_balance as walletBalance,
  COALESCE(SUM(CASE WHEN wt.amount > 0 THEN wt.amount ELSE 0 END), 0) as totalAllocated,
  COALESCE(SUM(CASE WHEN wt.amount < 0 THEN -wt.amount ELSE 0 END), 0) as totalSpent,
  MAX(wt.created_at) as lastTransaction
FROM students s
JOIN users u ON s.user_id = u.id
LEFT JOIN wallet_transactions wt ON wt.student_id = s.id
GROUP BY s.id, u.name, u.email, s.wallet_balance
```
**Time Complexity:** O(N+M)  
**Space Complexity:** O(N)

---

## 2. Get All Wallet Transactions

**Endpoint:** `GET /api/admin/wallets/transactions`

**Response:**
```json
[
  {
    "id": "UUID",
    "studentId": "UUID",
    "studentName": "John Doe",
    "type": "credit|debit|refund",
    "amount": 1000,
    "description": "Monthly allocation",
    "reference": "ALLOC_2024_01",
    "bookingId": "UUID",
    "processedBy": "UUID",
    "processedByName": "Admin User",
    "status": "completed|pending|failed",
    "createdAt": "2025-06-18T17:43:31.481+00:00"
  }
]
```

**Pseudocode:**
```
SELECT wt.*, u.name as studentName, a.user_id as processedBy, au.name as processedByName
FROM wallet_transactions wt
JOIN students s ON wt.student_id = s.id
JOIN users u ON s.user_id = u.id
LEFT JOIN users au ON wt.processed_by = au.id
LEFT JOIN admins a ON a.user_id = wt.processed_by
ORDER BY wt.created_at DESC
```
**Time Complexity:** O(M)  
**Space Complexity:** O(M)

---

## 3. Allocate/Deduct Points to a Student

**Endpoint:** `POST /api/admin/wallets/allocate`

**Request Body:**
```json
{
  "studentId": "UUID",
  "amount": 1000,
  "type": "credit|debit|refund",
  "description": "Monthly allocation",
  "reference": "ALLOC_2024_01",
  "processedBy": "UUID"
}
```

**Response:**
```json
{
  "success": true,
  "walletBalance": 16000
}
```

**Pseudocode:**
```
BEGIN TRANSACTION
INSERT INTO wallet_transactions (student_id, transaction_type_id, amount, description, reference_id, processed_by, created_at)
VALUES ({studentId}, (SELECT id FROM transaction_types WHERE name = {type}), {amount}, {description}, {reference}, {processedBy}, NOW())
UPDATE students SET wallet_balance = wallet_balance + {amount} WHERE id = {studentId}
COMMIT
RETURN new wallet_balance
```
**Time Complexity:** O(1)  
**Space Complexity:** O(1)

---

## 4. Bulk Allocate Points to All/Filtered Students

**Endpoint:** `POST /api/admin/wallets/bulk-allocate`

**Request Body:**
```json
{
  "studentIds": ["UUID1", "UUID2", "..."],
  "amount": 1000,
  "type": "credit|debit|refund",
  "description": "Monthly allocation",
  "reference": "ALLOC_2024_01",
  "processedBy": "UUID"
}
```

**Response:**
```json
{
  "success": true,
  "updated": 25
}
```

**Pseudocode:**
```
BEGIN TRANSACTION
FOR EACH studentId IN studentIds:
  INSERT INTO wallet_transactions (student_id, transaction_type_id, amount, description, reference_id, processed_by, created_at)
  VALUES (studentId, (SELECT id FROM transaction_types WHERE name = {type}), {amount}, {description}, {reference}, {processedBy}, NOW())
  UPDATE students SET wallet_balance = wallet_balance + {amount} WHERE id = studentId
COMMIT
RETURN count of updated students
```
**Time Complexity:** O(K)  
**Space Complexity:** O(1)

---

## 5. Get Wallet Analytics (Optional)

**Endpoint:** `GET /api/admin/wallets/analytics`

**Response:**
```json
{
  "totalBalance": 43000,
  "totalStudents": 3,
  "averageBalance": 14333,
  "monthlyAllocated": 15000,
  "monthlySpent": 12000,
  "lowBalanceCount": 1
}
```

**Pseudocode:**
```
SELECT SUM(wallet_balance) as totalBalance, COUNT(*) as totalStudents, AVG(wallet_balance) as averageBalance
FROM students

SELECT SUM(amount) as monthlyAllocated
FROM wallet_transactions
WHERE amount > 0 AND created_at >= first_of_month

SELECT SUM(-amount) as monthlySpent
FROM wallet_transactions
WHERE amount < 0 AND created_at >= first_of_month

SELECT COUNT(*) as lowBalanceCount
FROM students
WHERE wallet_balance < 1000
```
**Time Complexity:** O(N+M)  
**Space Complexity:** O(1)

---

## Student Wallet Analytics API - Implementation Logic

**Endpoint:** `GET /api/student/wallet/analytics`

**Pseudocode:**
```typescript
// 1. Authenticate user (JWT), get studentId from token
const studentId = getStudentIdFromJWT(request);

// 2. Monthly Credits & Debits
const monthlyCredits = db.wallet_transactions
  .filter(t => t.student_id === studentId && t.amount > 0)
  .groupBy(month(t.created_at))
  .map(g => ({ month: g.key, amount: sum(g.items.map(t => t.amount)) }));

const monthlyDebits = db.wallet_transactions
  .filter(t => t.student_id === studentId && t.amount < 0)
  .groupBy(month(t.created_at))
  .map(g => ({ month: g.key, amount: sum(g.items.map(t => -t.amount)) }));

// 3. Total Trips
const totalTrips = db.bookings.filter(b => b.student_id === studentId).length;

// 4. Average Cost per Trip
const totalSpent = db.wallet_transactions
  .filter(t => t.student_id === studentId && t.amount < 0)
  .reduce((sum, t) => sum + Math.abs(t.amount), 0);
const avgCostPerTrip = totalTrips > 0 ? Math.round(totalSpent / totalTrips) : 0;

// 5. Most Used Route
const routeCounts = {};
db.bookings.filter(b => b.student_id === studentId).forEach(b => {
  routeCounts[b.route_id] = (routeCounts[b.route_id] || 0) + 1;
});
const mostUsedRouteId = Object.entries(routeCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
const mostUsedRoute = mostUsedRouteId
  ? db.routes.find(r => r.id === mostUsedRouteId)?.name
  : null;

// 6. Peak Usage Time (hour with most bookings)
const hourCounts = {};
db.bookings.filter(b => b.student_id === studentId).forEach(b => {
  const hour = new Date(b.scheduled_time).getHours();
  hourCounts[hour] = (hourCounts[hour] || 0) + 1;
});
const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
const peakUsageTime = peakHour !== undefined
  ? `${peakHour}:00 - ${Number(peakHour) + 1}:00`
  : null;

// 7. Points Saved (example: sum of discounts, if tracked; else 0)
const pointsSaved = 0; // If you have a way to calculate discounts, use it here

// 8. Return analytics object
return {
  monthlyCredits,
  monthlyDebits,
  totalTrips,
  avgCostPerTrip,
  mostUsedRoute,
  peakUsageTime,
  pointsSaved
};
```

**How Peak Usage Time is Calculated:**
- For each booking by the student, extract the hour from the `scheduled_time` (e.g., 8 for 8:30 AM).
- Count the number of bookings for each hour of the day (0-23).
- The hour with the highest count is the "peak hour".
- The result is formatted as a range, e.g., `8:00 - 9:00` if 8 AM is the peak.

This gives you the time window when the student most frequently uses the shuttle service.

---
