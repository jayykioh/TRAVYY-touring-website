# Refund Money System Documentation

## Overview

The refund system allows users to request refunds for their bookings in two scenarios:

1. **Pre-Trip Cancellation**: Cancel booking before the tour starts with refund based on cancellation policy
2. **Post-Trip Issue**: Request refund after tour completion due to service issues

## Features

### User Features

- Request pre-trip cancellation refunds with automatic calculation based on days before departure
- Submit post-trip issue refunds with issue categorization and severity levels
- Track refund request status in real-time
- View refund timeline and history
- Cancel pending refund requests

### Admin Features

- View all refund requests with advanced filtering
- Review and approve/reject refund requests
- Adjust refund amounts manually if needed
- Process approved refunds
- View refund statistics and analytics
- Track refund timeline and audit trail

## Database Models

### Refund Model (`/models/Refund.js`)

**Key Fields:**

- `bookingId`: Reference to the booking
- `userId`: Reference to the user
- `refundType`: "pre_trip_cancellation" or "post_trip_issue"
- `originalAmount`: Total amount paid
- `refundableAmount`: Calculated refund amount
- `refundPercentage`: Percentage of refund (0-100)
- `processingFee`: Processing fee deducted (2% for pre-trip)
- `finalRefundAmount`: Actual amount to be refunded
- `status`: pending, under_review, approved, processing, completed, rejected, cancelled
- `timeline`: Array of status changes with timestamps

**Cancellation Details (Pre-Trip):**

- `tourStartDate`: Tour departure date
- `cancellationDate`: When cancellation was requested
- `daysBeforeTour`: Days between cancellation and tour start
- `cancellationPolicy`: Applied policy description

**Issue Details (Post-Trip):**

- `completionDate`: Tour completion date
- `issueCategory`: service_quality, safety_concern, itinerary_deviation, guide_issue, accommodation_problem, transportation_issue, other
- `description`: User's issue description
- `evidence`: Array of photos/documents
- `severity`: minor (20%), moderate (40%), major (70%), critical (100%)

## Cancellation Policy (Pre-Trip)

| Days Before Tour | Refund Percentage | Processing Fee |
| ---------------- | ----------------- | -------------- |
| 30+ days         | 90%               | 2%             |
| 14-29 days       | 70%               | 2%             |
| 7-13 days        | 50%               | 2%             |
| 3-6 days         | 25%               | 2%             |
| 1-2 days         | 10%               | 2%             |
| < 1 day          | 0%                | 0%             |

**Example:**

- Booking Amount: 10,000,000 VND
- Cancellation: 15 days before tour
- Refund Percentage: 70%
- Refundable Amount: 7,000,000 VND
- Processing Fee (2%): 140,000 VND
- Final Refund: 6,860,000 VND

## Refund Percentage (Post-Trip)

| Issue Severity | Refund Percentage | Processing Fee |
| -------------- | ----------------- | -------------- |
| Critical       | 100%              | 0%             |
| Major          | 70%               | 0%             |
| Moderate       | 40%               | 0%             |
| Minor          | 20%               | 0%             |

**Note:** No processing fee for post-trip refunds as the issue is service-related.

## API Endpoints

### User Endpoints

#### Request Pre-Trip Refund

```
POST /api/refunds/pre-trip
Authorization: Bearer {token}

Body:
{
  "bookingId": "string",
  "requestNote": "string (optional)"
}

Response:
{
  "success": true,
  "message": "Pre-trip cancellation refund request created successfully",
  "data": {RefundObject}
}
```

#### Request Post-Trip Refund

```
POST /api/refunds/post-trip
Authorization: Bearer {token}

Body:
{
  "bookingId": "string",
  "issueCategory": "service_quality|safety_concern|itinerary_deviation|guide_issue|accommodation_problem|transportation_issue|other",
  "description": "string",
  "severity": "minor|moderate|major|critical",
  "evidence": [
    {
      "type": "image",
      "url": "string"
    }
  ],
  "requestNote": "string (optional)"
}

Response:
{
  "success": true,
  "message": "Post-trip issue refund request created successfully",
  "data": {RefundObject}
}
```

#### Get User's Refunds

```
GET /api/refunds/my-refunds?status={status}&type={type}&page={page}&limit={limit}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [{RefundObject}],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

#### Get Refund Details

```
GET /api/refunds/:id
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {RefundObject}
}
```

#### Cancel Refund Request

```
POST /api/refunds/:id/cancel
Authorization: Bearer {token}

Body:
{
  "reason": "string (optional)"
}

Response:
{
  "success": true,
  "message": "Refund request cancelled successfully",
  "data": {RefundObject}
}
```

### Admin Endpoints

#### Get All Refunds

```
GET /api/admin/refunds?status={status}&type={type}&startDate={date}&endDate={date}&search={search}&page={page}&limit={limit}
Authorization: Bearer {adminToken}

Response:
{
  "success": true,
  "data": [{RefundObject}],
  "pagination": {...},
  "stats": [
    {
      "_id": "pending",
      "count": 10,
      "totalAmount": 50000000
    }
  ]
}
```

#### Get Refund Statistics

```
GET /api/admin/refunds/stats?startDate={date}&endDate={date}
Authorization: Bearer {adminToken}

Response:
{
  "success": true,
  "data": {
    "totalRefunds": 100,
    "totalAmount": 500000000,
    "avgRefundAmount": 5000000,
    "preTripCancellations": 60,
    "postTripIssues": 40,
    "pendingCount": 10,
    "approvedCount": 20,
    "completedCount": 50,
    "rejectedCount": 20
  }
}
```

#### Review Refund

```
POST /api/admin/refunds/:id/review
Authorization: Bearer {adminToken}

Body:
{
  "action": "approve|reject",
  "reviewNote": "string",
  "adjustedAmount": number (optional, for approve only)
}

Response:
{
  "success": true,
  "message": "Refund approved/rejected successfully",
  "data": {RefundObject}
}
```

#### Process Refund Payment

```
POST /api/admin/refunds/:id/process
Authorization: Bearer {adminToken}

Body:
{
  "refundMethod": "original_payment|bank_transfer|wallet|other",
  "transactionId": "string (optional)",
  "bankDetails": {
    "accountName": "string",
    "accountNumber": "string",
    "bankName": "string"
  },
  "note": "string (optional)"
}

Response:
{
  "success": true,
  "message": "Refund processed successfully",
  "data": {RefundObject}
}
```

## Frontend Components

### User Components

#### `/pages/RefundRequest.jsx`

- Refund request form page
- Automatic refund preview calculation
- Support for both pre-trip and post-trip refunds
- Form validation and error handling

#### `/components/UserRefundList.jsx`

- Display user's refund requests
- Filter by status
- View refund timeline
- Cancel pending requests

### Admin Components

#### `/admin/pages/RefundManagement.jsx`

- Comprehensive admin dashboard for refund management
- Statistics cards (total refunds, pending, completed, total amount)
- Advanced filtering (status, type, date range, search)
- Review and approve/reject functionality
- Process refund payments
- View detailed refund information

## Workflow

### Pre-Trip Cancellation Workflow

1. **User Request**

   - User navigates to booking history
   - Clicks "Request Refund" on a paid booking
   - System auto-detects it's pre-trip (tour date > current date)
   - User sees refund preview with calculated amount
   - User submits refund request

2. **Automatic Calculation**

   - System calculates days before tour
   - Applies cancellation policy
   - Calculates refundable amount
   - Deducts 2% processing fee
   - Creates refund record with status "pending"

3. **Admin Review**

   - Admin views refund in dashboard
   - Reviews cancellation details
   - Can approve or reject
   - Can adjust refund amount if needed
   - Adds review note

4. **Processing**

   - If approved, admin processes refund
   - Selects refund method
   - Enters transaction ID
   - System updates booking status to "refunded"
   - User receives notification

5. **Completion**
   - Refund status changes to "completed"
   - Timeline updated
   - User can view completed refund

### Post-Trip Issue Workflow

1. **User Report**

   - User completed tour
   - Reports issue through refund system
   - Selects issue category and severity
   - Provides detailed description
   - Can upload evidence (photos, documents)
   - Submits refund request

2. **Initial Review**

   - System calculates initial refund based on severity
   - Creates refund record with status "pending"
   - Admin receives notification

3. **Admin Investigation**

   - Admin reviews issue details
   - Examines evidence
   - May contact user for more information
   - Can adjust severity and refund amount
   - Approves or rejects with detailed note

4. **Processing & Completion**
   - Same as pre-trip workflow
   - No processing fee applied
   - User receives refund

## Integration Points

### With Booking System

- Refund requires booking to be in "paid" status
- After refund completion, booking status changes to "refunded"
- Prevents multiple refund requests for same booking

### With Payment Gateway

- Refund can be processed through original payment method
- Supports PayPal, MoMo, and bank transfer refunds
- Transaction ID tracking for audit trail

### With Notification System

- Users receive notifications on status changes
- Admins notified of new refund requests
- Email notifications for important updates

## Security & Validation

### User Validation

- Must be authenticated
- Can only request refund for own bookings
- Booking must be in "paid" status
- No duplicate refund requests

### Admin Validation

- Must have admin role
- All actions logged in timeline
- Cannot process unreviewed refunds
- Amount adjustments tracked

### Data Validation

- Refund amount cannot exceed original amount
- Date validations for tour dates
- Required fields enforced
- Status transitions validated

## Best Practices

### For Users

1. Request refund as early as possible for better refund percentage
2. Provide detailed description for post-trip issues
3. Upload evidence to support your claim
4. Check refund preview before submitting
5. Track refund status regularly

### For Admins

1. Review refund requests promptly (within 2-3 business days)
2. Provide clear review notes
3. Investigate post-trip issues thoroughly
4. Adjust amounts only when justified
5. Process approved refunds quickly
6. Keep transaction records

## Future Enhancements

1. **Automatic Approval** for certain conditions (e.g., emergency situations)
2. **Partial Refunds** for specific tour components
3. **Refund to Wallet** for faster processing
4. **Email Notifications** at each status change
5. **SMS Notifications** for critical updates
6. **Refund Analytics Dashboard** with charts and trends
7. **Customer Satisfaction Survey** after refund completion
8. **Refund Appeal Process** for rejected requests
9. **Batch Refund Processing** for admins
10. **Payment Gateway Integration** for automatic refunds

## Testing

### Test Cases

#### Pre-Trip Cancellation

- [ ] Request refund 35 days before tour (expect 90% refund)
- [ ] Request refund 20 days before tour (expect 70% refund)
- [ ] Request refund 10 days before tour (expect 50% refund)
- [ ] Request refund 5 days before tour (expect 25% refund)
- [ ] Request refund 1 day before tour (expect 10% refund)
- [ ] Request refund on tour day (expect 0% refund)
- [ ] Try to request refund after tour started (expect error)

#### Post-Trip Issue

- [ ] Submit refund with critical severity (expect 100% refund)
- [ ] Submit refund with major severity (expect 70% refund)
- [ ] Submit refund with moderate severity (expect 40% refund)
- [ ] Submit refund with minor severity (expect 20% refund)
- [ ] Submit without description (expect validation error)
- [ ] Upload evidence files

#### Admin Operations

- [ ] Approve refund request
- [ ] Reject refund request with note
- [ ] Adjust refund amount
- [ ] Process approved refund
- [ ] View refund statistics
- [ ] Filter refunds by status/type

#### Edge Cases

- [ ] Duplicate refund request (expect error)
- [ ] Refund non-paid booking (expect error)
- [ ] Refund already refunded booking (expect error)
- [ ] Cancel pending refund
- [ ] Process refund without review (expect error)

## Support

For questions or issues:

- Technical issues: Check logs in `/touring-be/controller/refundController.js`
- Frontend issues: Check browser console
- Database issues: Verify Refund model in MongoDB

## Files Created/Modified

### Backend

- ✅ `/models/Refund.js` - Refund database model
- ✅ `/controller/refundController.js` - Refund business logic
- ✅ `/routes/refund.routes.js` - User refund routes
- ✅ `/routes/admin/refund.routes.js` - Admin refund routes
- ✅ `/routes/admin/index.js` - Updated to include refund routes
- ✅ `/server.js` - Updated to mount refund routes

### Frontend

- ✅ `/pages/RefundRequest.jsx` - User refund request page
- ✅ `/components/UserRefundList.jsx` - User refund list component
- ✅ `/admin/pages/RefundManagement.jsx` - Admin refund management page

### Documentation

- ✅ `REFUND_SYSTEM.md` - This documentation file
