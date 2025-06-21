# Student Wallet Management API Documentation

This document describes the REST API endpoints required for the student Wallet Management page.

---

## 1. Get Student Wallet Balance

**Endpoint:** `GET /api/student/wallet`

**Auth:** JWT (student)

**Request:** None (JWT identifies student)

**Response:**
```json
{
  "studentId": "UUID",
  "walletBalance": 15000,
  "totalAllocated": 20000,
  "totalSpent": 5000,
  "lastTransaction": "2025-06-18T17:43:31.481+00:00"
}
```

**Pseudocode:**
```
studentId = getStudentIdFromJWT()
SELECT wallet_balance, 
       COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) as totalAllocated,
       COALESCE(SUM(CASE WHEN amount < 0 THEN -amount ELSE 0 END), 0) as totalSpent,
       MAX(created_at) as lastTransaction
  FROM wallet_transactions
 WHERE student_id = studentId
JOIN students ON students.id = studentId
```
- **Time Complexity:** O(M) (M = #transactions for student)
- **Space Complexity:** O(1)

---

## 2. Get Student Wallet Transaction History

**Endpoint:** `GET /api/student/wallet/transactions?limit=20&offset=0`

**Auth:** JWT (student)

**Request:** Query params for pagination

**Response:**
```json
[
  {
    "id": "UUID",
    "type": "credit|debit|refund",
    "amount": 1000,
    "description": "Monthly allocation",
    "reference": "ALLOC_2024_01",
    "bookingId": "UUID",
    "status": "completed|pending|failed",
    "createdAt": "2025-06-18T17:43:31.481+00:00"
  }
]
```

**Pseudocode:**
```
studentId = getStudentIdFromJWT()
SELECT id, 
       CASE WHEN amount > 0 THEN 'credit' ELSE 'debit' END as type,
       amount, description, reference, booking_id, status, created_at
  FROM wallet_transactions
 WHERE student_id = studentId
 ORDER BY created_at DESC
 LIMIT :limit OFFSET :offset
```
- **Time Complexity:** O(P) (P = page size)
- **Space Complexity:** O(P)

---

## 3. Get Student Wallet Analytics (optional, for charts)

**Endpoint:** `GET /api/student/wallet/analytics`

**Auth:** JWT (student)

**Request:** None

**Response:**
```json
{
  "monthlyCredits": [
    { "month": "2025-01", "amount": 2000 },
    { "month": "2025-02", "amount": 1500 }
  ],
  "monthlyDebits": [
    { "month": "2025-01", "amount": 500 },
    { "month": "2025-02", "amount": 700 }
  ]
}
```

**Pseudocode:**
```
studentId = getStudentIdFromJWT()
SELECT to_char(created_at, 'YYYY-MM') as month,
       SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as credits,
       SUM(CASE WHEN amount < 0 THEN -amount ELSE 0 END) as debits
  FROM wallet_transactions
 WHERE student_id = studentId
 GROUP BY month
 ORDER BY month DESC
```
- **Time Complexity:** O(M)
- **Space Complexity:** O(K) (K = #months with transactions)

---

## 4. Recharge Wallet

**Endpoint:** `POST /api/student/wallet/recharge`

**Request Body:**
```json
{
  "amount": 500, // integer, amount in points/cents (must be > 0)
  "razorpayPaymentId": "pay_XXXXXXXXXXXX" // string, Razorpay payment ID
}
```

**Response (Success):**
```json
{
  "success": true,
  "walletBalance": 1750, // updated balance
  "transactionId": "UUID"
}
```

**Response (Failure):**
```json
{
  "success": false,
  "error": "Reason for failure"
}
```

**Pseudocode:**
```typescript
// 1. Authenticate user (JWT), get studentId from token
const studentId = getStudentIdFromJWT(request);

// 2. Validate request body
if (!amount || amount <= 0) return 400 Bad Request;
if (!razorpayPaymentId) return 400 Bad Request;

// 3. (Optional) Verify payment with Razorpay API using razorpayPaymentId

// 4. Start DB transaction
try {
  // 5. Insert wallet transaction record
  const transaction = await db.wallet_transactions.create({
    student_id: studentId,
    amount: amount,
    type: "credit",
    description: "Wallet recharge via Razorpay",
    reference: razorpayPaymentId,
    status: "completed",
    created_at: now(),
  });

  // 6. Update student's wallet balance
  await db.students.update({
    where: { id: studentId },
    data: { wallet_balance: { increment: amount } }
  });

  // 7. Commit transaction
  return {
    success: true,
    walletBalance: newBalance,
    transactionId: transaction.id
  };
} catch (err) {
  // 8. Rollback transaction
  return { success: false, error: "Recharge failed. Please try again." };
}
```

**Note:**
- The amount check is now only `amount > 0` (no upper limit enforced by API).
- Payment verification with Razorpay is recommended for production.
