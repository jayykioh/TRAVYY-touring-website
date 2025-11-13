# Refund System - Quick Start Guide

## 🚀 Quick Integration (5 Steps)

### Step 1: Verify Backend Files ✅

All backend files are already created. Just verify they're in place:

```bash
cd touring-be

# Check models
ls models/Refund.js

# Check controllers
ls controller/refundController.js

# Check routes
ls routes/refund.routes.js
ls routes/admin/refund.routes.js
```

### Step 2: Add Routes to Your App 🔌

#### Frontend - Main App Router

Edit `touring-fe/src/App.jsx` (or your main router file):

```jsx
// Add import
import RefundRequest from "./pages/RefundRequest";

// Add route (inside your Routes or router configuration)
<Route path="/refund-request/:bookingId" element={<RefundRequest />} />;
```

#### Frontend - Admin Router

Edit your admin routes configuration:

```jsx
// Add import
import RefundManagement from "./admin/pages/RefundManagement";

// Add route (inside admin Routes)
<Route path="/admin/refunds" element={<RefundManagement />} />;
```

### Step 3: Add Refund Button to Booking History 🔘

Edit `touring-fe/src/pages/BookingHistory.jsx`:

```jsx
{
  booking.status === "paid" && (
    <Link
      to={`/refund-request/${booking._id}`}
      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
    >
      Request Refund
    </Link>
  );
}
```

### Step 4: Add Admin Sidebar Link 📊

Edit your admin sidebar component:

```jsx
<Link
  to="/admin/refunds"
  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100"
>
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    />
  </svg>
  Refund Management
</Link>
```

### Step 5: Test It! 🧪

#### Test User Flow:

1. Go to your booking history page
2. Click "Request Refund" on a paid booking
3. Select refund type (Pre-Trip or Post-Trip)
4. Fill in the form
5. Submit and check the refund was created

#### Test Admin Flow:

1. Go to `/admin/refunds`
2. View the submitted refund request
3. Click "Review" and approve it
4. Click "Process" to complete the refund

---

## 🎯 Testing Endpoints with Postman

### 1. Request Pre-Trip Refund

```http
POST http://localhost:4000/api/refunds/pre-trip
Authorization: Bearer YOUR_USER_TOKEN
Content-Type: application/json

{
  "bookingId": "PASTE_BOOKING_ID_HERE",
  "requestNote": "Need to cancel due to emergency"
}
```

Expected Response:

```json
{
  "success": true,
  "message": "Pre-trip cancellation refund request created successfully",
  "data": {
    "_id": "...",
    "refundReference": "REF-...",
    "refundType": "pre_trip_cancellation",
    "finalRefundAmount": 6860000,
    "status": "pending"
  }
}
```

### 2. Request Post-Trip Refund

```http
POST http://localhost:4000/api/refunds/post-trip
Authorization: Bearer YOUR_USER_TOKEN
Content-Type: application/json

{
  "bookingId": "PASTE_BOOKING_ID_HERE",
  "issueCategory": "service_quality",
  "severity": "major",
  "description": "Hotel was not as described, poor service quality",
  "evidence": [
    {
      "type": "image",
      "url": "https://example.com/photo.jpg"
    }
  ]
}
```

### 3. Get My Refunds

```http
GET http://localhost:4000/api/refunds/my-refunds?status=pending&page=1&limit=10
Authorization: Bearer YOUR_USER_TOKEN
```

### 4. Admin - Get All Refunds

```http
GET http://localhost:4000/api/admin/refunds?status=pending
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### 5. Admin - Review Refund

```http
POST http://localhost:4000/api/admin/refunds/REFUND_ID/review
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "action": "approve",
  "reviewNote": "Cancellation approved according to policy",
  "adjustedAmount": 7000000
}
```

### 6. Admin - Process Refund

```http
POST http://localhost:4000/api/admin/refunds/REFUND_ID/process
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "refundMethod": "original_payment",
  "transactionId": "TXN-123456",
  "note": "Refund processed via PayPal"
}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Refund routes not found" (404)

**Solution**: Make sure you added the routes to `server.js`:

```javascript
const refundRoutes = require("./routes/refund.routes");
app.use("/api/refunds", refundRoutes);
```

### Issue 2: "Cannot request refund"

**Solution**: Check booking status must be "paid":

```javascript
// In your code
if (booking.status !== "paid") {
  // Show error
}
```

### Issue 3: "Admin routes not working"

**Solution**: Verify admin routes are included in admin index:

```javascript
// In routes/admin/index.js
const refundRoutes = require("./refund.routes");
router.use("/refunds", refundRoutes);
```

### Issue 4: "Calculation not working"

**Solution**: Ensure tour date is in correct format:

```javascript
// Tour date should be Date object or ISO string
const tourDate = new Date(booking.items[0].date);
```

### Issue 5: "Auth errors"

**Solution**: Make sure token is being sent:

```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

---

## 📝 Sample Data for Testing

### Create a Test Booking (if needed)

```javascript
// Sample booking data
{
  "userId": "USER_ID",
  "items": [{
    "tourId": "TOUR_ID",
    "date": "2025-12-15", // Future date for pre-trip
    "name": "Test Tour",
    "adults": 2,
    "children": 1,
    "unitPriceAdult": 5000000,
    "unitPriceChild": 2500000
  }],
  "totalAmount": 12500000,
  "status": "paid",
  "payment": {
    "provider": "paypal",
    "orderId": "TEST-ORDER-123",
    "status": "completed"
  }
}
```

---

## ✅ Checklist Before Going Live

- [ ] All routes added to frontend router
- [ ] Refund button added to booking history
- [ ] Admin sidebar link added
- [ ] Tested pre-trip refund flow
- [ ] Tested post-trip refund flow
- [ ] Tested admin review process
- [ ] Tested admin process refund
- [ ] Verified email notifications work
- [ ] Tested payment gateway integration
- [ ] Added refund policy to terms & conditions
- [ ] Trained customer support on refund process
- [ ] Set up monitoring for refund requests
- [ ] Created admin documentation

---

## 🎓 Quick Reference

### Refund Percentages

| Days Before | Refund |
| ----------- | ------ |
| 30+         | 90%    |
| 14-29       | 70%    |
| 7-13        | 50%    |
| 3-6         | 25%    |
| 1-2         | 10%    |
| < 1         | 0%     |

### Post-Trip Severity

| Severity | Refund |
| -------- | ------ |
| Critical | 100%   |
| Major    | 70%    |
| Moderate | 40%    |
| Minor    | 20%    |

### Status Flow

```
pending → under_review → approved → processing → completed
                      ↓
                   rejected
```

---

## 📞 Need Help?

1. **Check Logs**: `touring-be/logs/` or console output
2. **Review Docs**: See `REFUND_SYSTEM.md` for detailed info
3. **Test Endpoints**: Use Postman collection above
4. **Check Database**: Verify Refund collection in MongoDB

---

**Ready to go!** 🚀

Start with Step 1 and you'll have the refund system working in minutes!
