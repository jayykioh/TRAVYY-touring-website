# Automatic Refund Processing on Approval

## Overview

Thay vì admin phải nhập transaction ID sau khi hoàn tiền thủ công, hệ thống giờ đây tự động xử lý hoàn tiền qua PayPal sandbox ngay khi admin approve refund request.

## Changes Made

### 1. Updated `refundController.js` - `reviewRefund` function

**File**: `touring-be/controller/refundController.js`

**Previous Flow**:

```
User requests refund → Admin approves → Admin manually enters transaction ID → Refund completed
```

**New Flow**:

```
User requests refund → Admin approves → 🤖 System auto-creates PayPal refund → Booking updated → Refund completed
```

**What Changed**:

- When admin approves a refund (`action: "approve"`), the system now:
  1. Automatically changes status to `"processing"`
  2. Calls `processRefund()` to create PayPal/MoMo refund
  3. Updates booking status to `"refunded"` when successful
  4. Adds timeline entries showing automatic processing
  5. Returns `autoProcessed: true` in response

**Key Features**:

- ✅ **Automatic PayPal Refund**: Uses existing `processRefund()` service
- ✅ **Booking Status Update**: Sets `booking.status = "refunded"` and `booking.refundStatus = "completed"`
- ✅ **Error Handling**: If auto-refund fails, stays in "processing" status for manual intervention
- ✅ **Test Mode Support**: Works with `REFUND_TEST_MODE=true` for testing without real PayPal calls
- ✅ **Timeline Tracking**: All actions logged in refund timeline

### 2. Updated `Bookings.js` Model

**File**: `touring-be/models/Bookings.js`

**Added Fields**:

```javascript
// ===== REFUND INFO =====
refundStatus: {
  type: String,
  enum: ["none", "requested", "processing", "completed", "failed"],
  default: "none"
},
refundedAt: { type: Date }
```

**Purpose**: Track refund status separately from booking status for better visibility.

## How It Works

### 1. Admin Approves Refund

```javascript
POST /api/admin/refunds/:id/review
{
  "action": "approve",
  "reviewNote": "Approved for full refund",
  "adjustedAmount": 1000000 // optional
}
```

### 2. System Response

```json
{
  "success": true,
  "message": "Refund approved and automatically processed via payment gateway",
  "data": {
    /* refund object */
  },
  "refundResult": {
    "success": true,
    "transactionId": "TEST-REF-1234567890",
    "provider": "paypal",
    "message": "Refund simulated successfully (test mode)"
  },
  "autoProcessed": true
}
```

### 3. Database Updates

**Refund Document**:

- `status`: "approved" → "processing" → "completed"
- `refundPayment.transactionId`: Auto-generated from PayPal
- `refundPayment.provider`: "paypal" or "momo"
- `completedAt`: Timestamp when refund completed
- `timeline`: Entries showing automatic processing

**Booking Document**:

- `status`: "paid" → "refunded"
- `refundStatus`: "none" → "completed"
- `refundedAt`: Timestamp when refund completed

## Payment Gateway Integration

### PayPal Refund (Sandbox)

The system uses the existing `refundService.js` which:

1. Gets PayPal access token
2. Calls PayPal Refunds API: `POST /v2/payments/captures/{captureId}/refund`
3. Converts VND to USD using `FX_VND_USD` rate
4. Returns transaction ID and status

### MoMo Refund

If original payment was via MoMo:

1. Uses MoMo Refund API
2. Requires original `orderId` and `transactionId`
3. Returns refund transaction ID

### Test Mode

When `REFUND_TEST_MODE=true` (current setting):

- No real API calls are made
- Simulates successful refund instantly
- Useful for testing without PayPal charges

## Error Handling

### Auto-Refund Fails

If `processRefund()` returns `success: false`:

```json
{
  "success": false,
  "message": "Refund approved but automatic processing failed. Please process manually.",
  "data": {
    /* refund in 'processing' status */
  },
  "error": "Missing PayPal capture ID",
  "autoProcessed": false
}
```

**Result**:

- Refund stays in `"processing"` status
- Admin can manually process using old endpoint: `POST /api/admin/refunds/:id/process`
- Timeline shows: "❌ Automatic refund failed: [error]. Requires manual intervention."

### Manual Processing Required

For cash payments or unknown payment methods:

```json
{
  "success": true,
  "message": "Refund approved and marked for manual processing",
  "refundResult": {
    "success": true,
    "requiresManualProcessing": true,
    "provider": "manual"
  }
}
```

## Testing

### Test Automatic Refund Flow

1. **Create a booking** (use PayPal sandbox)
2. **Request refund**:

   ```javascript
   POST /api/refunds/pre-trip
   {
     "bookingId": "your-booking-id",
     "reason": "Changed plans"
   }
   ```

3. **Admin approves** (triggers auto-refund):

   ```javascript
   POST /api/admin/refunds/:refundId/review
   {
     "action": "approve",
     "reviewNote": "Testing automatic refund"
   }
   ```

4. **Check results**:
   - Response should show `"autoProcessed": true`
   - Refund status should be `"completed"`
   - Booking status should be `"refunded"`
   - Booking `refundStatus` should be `"completed"`

### Test Mode vs Production

**Test Mode** (`REFUND_TEST_MODE=true`):

```javascript
// .env
REFUND_TEST_MODE = true; // ← Currently enabled
```

- Simulates refunds instantly
- No real PayPal API calls
- Returns test transaction IDs

**Production Mode** (`REFUND_TEST_MODE=false`):

```javascript
// .env
REFUND_TEST_MODE = false;
```

- Makes real PayPal API calls
- Uses sandbox credentials for testing
- Uses live credentials in production

## Backwards Compatibility

### Old Manual Process Still Works

Admins can still manually process refunds:

```javascript
POST /api/admin/refunds/:id/process
{
  "refundMethod": "original_payment",
  "transactionId": "manual-txn-123",
  "note": "Manual refund"
}
```

**Use Cases**:

- When auto-refund fails
- For cash refunds
- For bank transfer refunds
- When admin prefers manual control

## Environment Variables

### Required for PayPal Refunds

```bash
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_secret
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com

# Exchange rate (VND to USD)
FX_VND_USD=0.000039

# Test mode (set to false for real refunds)
REFUND_TEST_MODE=true
```

## Security Considerations

1. **Admin Authentication**: Only authenticated admins can approve refunds
2. **Status Validation**: Can only approve refunds in "pending" or "under_review" status
3. **Booking Validation**: Verifies booking exists before processing
4. **Idempotency**: Won't process the same refund twice
5. **Audit Trail**: All actions logged in refund timeline

## Benefits

✅ **Faster Processing**: Refunds processed instantly on approval
✅ **Reduced Errors**: No manual transaction ID entry mistakes
✅ **Better UX**: Users get refunds faster
✅ **Automated Workflow**: Less manual work for admins
✅ **Complete Audit Trail**: All actions logged with timestamps
✅ **Status Tracking**: Clear visibility of refund status
✅ **Error Recovery**: Fallback to manual process if auto-refund fails

## Timeline Example

After auto-approval, refund timeline shows:

```
1. ✅ Approved by admin [2024-01-15 10:30:00]
2. 🤖 Automatically processing refund payment via PayPal [2024-01-15 10:30:01]
3. ✅ Refund automatically processed via paypal. Transaction ID: 1AB23456CD789012E [2024-01-15 10:30:02]
```

## Next Steps

### Recommendations:

1. **Test in Sandbox**: Verify PayPal sandbox refunds work correctly
2. **Monitor Logs**: Check console logs for auto-refund processing
3. **Add Notifications**: Send email/notification to user when refund completes
4. **Add Webhook**: Implement PayPal webhook for refund status updates
5. **Dashboard Stats**: Show auto-refund success rate in admin dashboard

### Future Enhancements:

- [ ] Email notification on refund completion
- [ ] SMS notification for refund status
- [ ] PayPal refund webhook handler
- [ ] Bulk refund processing
- [ ] Refund analytics dashboard
