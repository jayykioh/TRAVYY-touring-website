# Auto Refund Flow Diagram

## New Automated Refund Process

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER REQUESTS REFUND                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ POST /api/refunds/pre-trip
                                    │ { bookingId, reason }
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     CREATE REFUND (Status: pending)                     │
│  - Validate booking ownership                                           │
│  - Check booking is paid                                                │
│  - Check tour hasn't started                                            │
│  - Calculate refund amount (cancellation policy)                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Refund created
                                    │ Status: pending
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    ADMIN REVIEWS & APPROVES                             │
│  POST /api/admin/refunds/:id/review                                     │
│  { action: "approve", reviewNote, adjustedAmount }                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
                        ┌───────────┴───────────┐
                        │                       │
                    APPROVE                 REJECT
                        │                       │
                        ▼                       ▼
    ┌───────────────────────────────┐  ┌──────────────────────┐
    │  🤖 AUTO REFUND TRIGGERED     │  │  Refund Rejected     │
    │  Status: approved → processing│  │  Status: rejected    │
    └───────────────────────────────┘  │  END                 │
                        │               └──────────────────────┘
                        │
                        ▼
    ┌───────────────────────────────────────────────────────────────────┐
    │               PROCESS REFUND VIA PAYMENT GATEWAY                  │
    │  refundService.processRefund(booking, amount, note)               │
    │                                                                    │
    │  Check payment provider:                                           │
    │  ├── PayPal: Call PayPal Refund API                               │
    │  │   POST /v2/payments/captures/{captureId}/refund                │
    │  │   - Convert VND → USD                                          │
    │  │   - Get access token                                           │
    │  │   - Create refund                                              │
    │  │                                                                 │
    │  ├── MoMo: Call MoMo Refund API                                   │
    │  │   POST /refund                                                 │
    │  │   - Use original orderId & transId                             │
    │  │                                                                 │
    │  └── Manual: Mark for manual processing                           │
    │      (bank transfer, cash, etc.)                                  │
    └───────────────────────────────────────────────────────────────────┘
                        │
                        │
            ┌───────────┴───────────┐
            │                       │
        SUCCESS                  FAILED
            │                       │
            ▼                       ▼
┌──────────────────────────────┐  ┌─────────────────────────────┐
│  ✅ REFUND COMPLETED         │  │  ❌ AUTO-REFUND FAILED      │
│  Status: completed           │  │  Status: processing         │
│                              │  │  (requires manual action)   │
│  Update Refund:              │  │                             │
│  - refundPayment.txnId       │  │  Update Refund:             │
│  - refundPayment.provider    │  │  - Add error to timeline    │
│  - completedAt = now()       │  │  - processingNote = error   │
│                              │  │                             │
│  Update Booking:             │  │  Admin can manually process │
│  - status = "refunded"       │  │  via old endpoint:          │
│  - refundStatus = "completed"│  │  POST /refunds/:id/process  │
│  - refundedAt = now()        │  │                             │
│                              │  │                             │
│  Add Timeline:               │  └─────────────────────────────┘
│  "✅ Refund automatically    │
│   processed via PayPal.      │
│   Transaction ID: xxx"       │
└──────────────────────────────┘
            │
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         RESPONSE TO ADMIN                               │
│  {                                                                      │
│    success: true,                                                       │
│    message: "Refund approved and automatically processed",              │
│    autoProcessed: true,                                                 │
│    refundResult: { transactionId, provider, ... }                       │
│  }                                                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

## Test Mode vs Production Mode

### Test Mode (REFUND_TEST_MODE=true) ✅ Currently Active

```
Admin Approves
     │
     ▼
🧪 Simulate Refund Success
     │
     ├─ No real API calls
     ├─ Instant completion
     ├─ Test transaction ID: TEST-REF-{timestamp}
     └─ Status → completed
```

### Production Mode (REFUND_TEST_MODE=false)

```
Admin Approves
     │
     ▼
🌐 Real PayPal API Call
     │
     ├─ OAuth authentication
     ├─ POST to PayPal Refunds API
     ├─ Wait for PayPal response
     └─ Real transaction ID from PayPal
```

## Comparison: Old vs New Flow

### ❌ OLD FLOW (Manual)

```
1. User requests refund
2. Admin approves (status: approved)
3. ⏸️  ADMIN STOPS HERE
4. Admin manually logs into PayPal
5. Admin manually creates refund
6. Admin copies transaction ID
7. Admin opens system
8. Admin pastes transaction ID
9. POST /api/admin/refunds/:id/process
   { transactionId: "manual-id-123" }
10. Status → completed

⏱️  Time: 5-10 minutes
👤 Manual steps: 6
❌ Error prone: YES (copy/paste errors)
```

### ✅ NEW FLOW (Automated)

```
1. User requests refund
2. Admin approves (status: approved)
3. 🤖 System auto-creates PayPal refund
4. System auto-updates booking
5. Status → completed

⏱️  Time: 2-5 seconds
👤 Manual steps: 1
✅ Error prone: NO
```

## Benefits Summary

| Feature           | Old Flow          | New Flow             |
| ----------------- | ----------------- | -------------------- |
| Admin Actions     | 6+ manual steps   | 1 click              |
| Processing Time   | 5-10 minutes      | 2-5 seconds          |
| Error Risk        | High (copy/paste) | Low (automated)      |
| Tracking          | Manual notes      | Automatic timeline   |
| Booking Update    | Manual            | Automatic            |
| User Notification | Manual            | Ready for automation |
| Audit Trail       | Incomplete        | Complete             |

## Security & Validation

### ✅ Security Checks

- [x] Admin authentication required
- [x] Refund status validation (only pending/under_review can be approved)
- [x] Booking ownership validation
- [x] Amount validation (can't exceed original payment)
- [x] Duplicate refund prevention
- [x] Payment provider validation

### ✅ Error Handling

- [x] PayPal API errors → fallback to manual process
- [x] Missing capture ID → error with clear message
- [x] Network timeouts → retry mechanism in refundService
- [x] Invalid amounts → validation before processing
- [x] Expired sessions → clear error message

## Monitoring & Logs

### Console Logs

```javascript
🚀 [Auto-Refund] Starting automatic refund processing for {refundId}
🔄 [Auto-Refund] Processing refund {refundId} for booking {bookingId}
📊 [Auto-Refund] Result: { success, transactionId, provider }
✅ [Auto-Refund] Completed successfully for {refundId}
```

### Timeline Entries

```javascript
refund.timeline = [
  {
    status: "approved",
    note: "Approved by admin",
    performedBy: adminId,
    timestamp: Date,
  },
  {
    status: "processing",
    note: "🤖 Automatically processing refund payment via PayPal",
    performedBy: adminId,
    timestamp: Date,
  },
  {
    status: "completed",
    note: "✅ Refund automatically processed via paypal. Transaction ID: xxx",
    performedBy: adminId,
    timestamp: Date,
  },
];
```

## API Response Examples

### Success Response

```json
{
  "success": true,
  "message": "Refund approved and automatically processed via payment gateway",
  "data": {
    "_id": "65abc123...",
    "status": "completed",
    "refundPayment": {
      "transactionId": "1AB23456CD789012E",
      "provider": "paypal",
      "processedAt": "2024-01-15T10:30:02.000Z"
    },
    "completedAt": "2024-01-15T10:30:02.000Z"
  },
  "refundResult": {
    "success": true,
    "transactionId": "1AB23456CD789012E",
    "provider": "paypal",
    "message": "PayPal refund completed"
  },
  "autoProcessed": true
}
```

### Failure Response

```json
{
  "success": false,
  "message": "Refund approved but automatic processing failed. Please process manually.",
  "data": {
    "_id": "65abc123...",
    "status": "processing",
    "processingNote": "Auto-refund failed: Missing PayPal capture ID"
  },
  "error": "Missing PayPal capture ID",
  "autoProcessed": false
}
```

### Manual Processing Required

```json
{
  "success": true,
  "message": "Refund approved and marked for manual processing",
  "data": {
    "_id": "65abc123...",
    "status": "completed"
  },
  "refundResult": {
    "success": true,
    "requiresManualProcessing": true,
    "provider": "manual"
  },
  "autoProcessed": true
}
```
