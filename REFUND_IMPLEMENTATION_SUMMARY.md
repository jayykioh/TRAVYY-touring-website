# Refund System Implementation Summary

## ✅ What Was Implemented

I've created a complete refund money system for your TRAVYY touring website with two refund scenarios:

### 1. Pre-Trip Cancellation Refund (Hủy tour trước khi đi)

- Automatic calculation based on days before tour departure
- Tiered refund percentages (90% for 30+ days, down to 0% for last day)
- 2% processing fee deducted from refund
- Real-time preview of refund amount

### 2. Post-Trip Issue Refund (Vấn đề sau khi đi tour)

- Report issues after tour completion
- Categorized issues (service quality, safety, guide, accommodation, etc.)
- Severity-based refunds (20% minor → 100% critical)
- Evidence upload support (photos/documents)
- No processing fee

## 📁 Files Created

### Backend (Node.js/Express)

```
touring-be/
├── models/
│   └── Refund.js                          ← Database model
├── controller/
│   └── refundController.js                ← Business logic
└── routes/
    ├── refund.routes.js                   ← User endpoints
    └── admin/
        └── refund.routes.js               ← Admin endpoints
```

### Frontend (React)

```
touring-fe/
├── src/
│   ├── pages/
│   │   └── RefundRequest.jsx              ← User refund request page
│   ├── components/
│   │   └── UserRefundList.jsx             ← User refund history
│   └── admin/
│       └── pages/
│           └── RefundManagement.jsx       ← Admin management page
```

### Documentation

```
REFUND_SYSTEM.md                           ← Complete English docs
REFUND_SYSTEM_VI.md                        ← Vietnamese user guide
```

## 🔧 Configuration Required

### 1. Update App Router

Add these routes to your app:

```jsx
// In your main App.jsx or router configuration

// User routes
import RefundRequest from "./pages/RefundRequest";
import UserRefundList from "./components/UserRefundList";

<Route path="/refund-request/:bookingId" element={<RefundRequest />} />;

// Admin routes (in admin section)
import RefundManagement from "./admin/pages/RefundManagement";

<Route path="/admin/refunds" element={<RefundManagement />} />;
```

### 2. Add Refund Button to Booking History

In your `BookingHistory.jsx`, add a refund button for each booking:

```jsx
{
  booking.status === "paid" && (
    <Link
      to={`/refund-request/${booking._id}`}
      className="text-red-600 hover:underline"
    >
      Request Refund
    </Link>
  );
}
```

### 3. Add to Admin Sidebar

In your admin sidebar navigation:

```jsx
<Link to="/admin/refunds">
  <svg>...</svg>
  Refund Management
</Link>
```

## 📊 Database Schema

The Refund model includes:

- Reference to booking and user
- Refund type (pre_trip/post_trip)
- Amount calculations (original, refundable, processing fee, final)
- Cancellation details (for pre-trip)
- Issue details (for post-trip)
- Status workflow (pending → approved → processing → completed)
- Timeline tracking with audit trail
- Payment information

## 🎯 Key Features

### User Features

✅ Request pre-trip cancellation with auto-calculated refund
✅ Report post-trip issues with evidence
✅ Real-time refund preview
✅ Track refund status
✅ View refund timeline
✅ Cancel pending requests

### Admin Features

✅ View all refund requests
✅ Filter by status, type, date
✅ Review and approve/reject requests
✅ Adjust refund amounts manually
✅ Process approved refunds
✅ View statistics dashboard
✅ Track complete audit trail

## 🔄 Refund Workflow

### Pre-Trip Cancellation

```
User Request → Auto Calculate → Admin Review → Admin Process → Complete
```

### Post-Trip Issue

```
User Report → Admin Investigate → Admin Review → Admin Process → Complete
```

## 📈 Cancellation Policy

| Days Before Tour | Refund % |
| ---------------- | -------- |
| 30+ days         | 90%      |
| 14-29 days       | 70%      |
| 7-13 days        | 50%      |
| 3-6 days         | 25%      |
| 1-2 days         | 10%      |
| < 1 day          | 0%       |

Processing fee: 2% (for pre-trip only)

## 🧪 Testing Checklist

### User Testing

- [ ] Request pre-trip refund 30 days before
- [ ] Request pre-trip refund 1 day before
- [ ] Request post-trip refund with evidence
- [ ] View refund history
- [ ] Cancel pending refund

### Admin Testing

- [ ] View all refunds
- [ ] Filter by status/type
- [ ] Approve refund request
- [ ] Reject refund request
- [ ] Adjust refund amount
- [ ] Process approved refund
- [ ] View statistics

## 🚀 Next Steps

1. **Update your routing** (see Configuration section above)
2. **Test the endpoints** using Postman or similar
3. **Integrate with payment gateway** for actual refund processing
4. **Add email notifications** for status changes
5. **Create admin dashboard widgets** for refund stats

## 📞 API Endpoints

### User Endpoints

```
POST   /api/refunds/pre-trip              ← Request pre-trip cancellation
POST   /api/refunds/post-trip             ← Request post-trip issue refund
GET    /api/refunds/my-refunds            ← Get user's refunds
GET    /api/refunds/:id                   ← Get refund details
POST   /api/refunds/:id/cancel            ← Cancel pending request
```

### Admin Endpoints

```
GET    /api/admin/refunds                 ← Get all refunds (with filters)
GET    /api/admin/refunds/stats           ← Get refund statistics
POST   /api/admin/refunds/:id/review      ← Approve/reject refund
POST   /api/admin/refunds/:id/process     ← Process approved refund
```

## 💡 Usage Example

### Request Pre-Trip Refund

```javascript
const response = await fetch(`${API_URL}/api/refunds/pre-trip`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    bookingId: "507f1f77bcf86cd799439011",
    requestNote: "Emergency, cannot travel",
  }),
});
```

### Request Post-Trip Refund

```javascript
const response = await fetch(`${API_URL}/api/refunds/post-trip`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    bookingId: "507f1f77bcf86cd799439011",
    issueCategory: "service_quality",
    severity: "major",
    description: "Hotel not as described, poor food quality",
    evidence: [{ type: "image", url: "https://..." }],
  }),
});
```

## 🔐 Security Features

- ✅ JWT authentication required
- ✅ User can only refund their own bookings
- ✅ Admin role required for management
- ✅ Status transition validation
- ✅ Amount validation (cannot exceed original)
- ✅ Complete audit trail
- ✅ Timeline tracking

## 📖 Documentation

- **REFUND_SYSTEM.md**: Complete English documentation
- **REFUND_SYSTEM_VI.md**: Vietnamese user guide

## 🎨 UI Components

All components use your existing design system:

- Tailwind CSS classes
- Your brand colors (#007980)
- Consistent with your admin panel design
- Responsive layouts
- Loading states
- Error handling
- Toast notifications

## ⚠️ Important Notes

1. **Payment Integration**: Currently simulates refund processing. You'll need to integrate with your actual payment gateway (PayPal, MoMo, etc.)

2. **Email Notifications**: Not implemented yet. Add email service for status updates.

3. **File Upload**: Evidence upload functionality needs to be connected to your file storage service (e.g., AWS S3, Cloudinary).

4. **Booking Status**: System automatically updates booking status to "refunded" after completion.

5. **Duplicate Prevention**: System prevents multiple refund requests for the same booking.

## 🤝 Support

If you need help:

1. Check the detailed documentation in `REFUND_SYSTEM.md`
2. Review the Vietnamese guide in `REFUND_SYSTEM_VI.md`
3. Test endpoints with Postman
4. Check backend logs for errors

---

**Status**: ✅ Ready to integrate
**Last Updated**: November 11, 2025
