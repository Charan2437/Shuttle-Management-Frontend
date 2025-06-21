# Confirm Booking API Documentation

## Endpoint
POST `/api/student/bookings/confirm`

---

## Request Body
```
{
  "studentId": "UUID",
  "legs": [
    {
      "routeId": "UUID",
      "shuttleId": "UUID",
      "fromStopId": "UUID",
      "toStopId": "UUID",
      "scheduledTime": "2025-06-24T08:00:00",
      "cost": 44.32
    }
    // ...more legs for transfers
  ],
  "totalCost": 44.32
}
```
- `studentId`: The student's UUID.
- `legs`: Array of journey segments (for direct or transfer routes).
- `totalCost`: Total points to deduct from wallet.

---

## Expected Response
**Success (200):**
```
{
  "success": true,
  "bookingId": "UUID",
  "bookingReference": "ABC123456",
  "message": "Booking confirmed"
}
```

**Failure (e.g., insufficient balance, seat unavailable):**
```
{
  "success": false,
  "message": "Insufficient balance"
}
```

---

## Pseudocode for Implementation
```typescript
function confirmBooking(req, res) {
  // 1. Parse and validate input
  const { studentId, legs, totalCost } = req.body;
  if (!studentId || !legs?.length || !totalCost) return res.status(400).json({ success: false, message: "Invalid input" });

  // 2. Start DB transaction

  // 3. Check wallet balance
  const wallet = db.query("SELECT wallet_balance FROM students WHERE id = $1 FOR UPDATE", [studentId]);
  if (wallet.wallet_balance < totalCost) {
    // Rollback
    return res.status(400).json({ success: false, message: "Insufficient balance" });
  }

  // 4. For each leg, check shuttle capacity (optional: check for double booking)
  for (const leg of legs) {
    const occupied = db.query("SELECT COUNT(*) FROM bookings WHERE shuttle_id = $1 AND scheduled_time = $2 AND status_id = (SELECT id FROM booking_status_types WHERE name = 'confirmed')", [leg.shuttleId, leg.scheduledTime]);
    const capacity = db.query("SELECT capacity FROM shuttles WHERE id = $1", [leg.shuttleId]);
    if (occupied >= capacity) {
      // Rollback
      return res.status(400).json({ success: false, message: "No seats available" });
    }
  }

  // 5. Deduct points from wallet
  db.query("UPDATE students SET wallet_balance = wallet_balance - $1 WHERE id = $2", [totalCost, studentId]);

  // 6. Create main booking record
  const bookingId = db.insert("bookings", { ... });

  // 7. If transfer, create transfer_bookings records

  // 8. Create wallet transaction record

  // 9. Commit transaction

  // 10. Return booking confirmation
  res.status(200).json({ success: true, bookingId, bookingReference: "...", message: "Booking confirmed" });
}
```

---

## Time & Space Complexity
- **Time Complexity:** O(n) where n = number of legs (transfers), as each leg is checked and inserted.
- **Space Complexity:** O(1) for DB operations (no large in-memory structures).
