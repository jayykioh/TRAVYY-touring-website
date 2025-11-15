# 🧪 TRAVYY - QUICK TEST GUIDE

## Quick Start: Test All Fixes in 5 Minutes

### Prerequisites
```bash
# Backend running
cd touring-be
npm run dev  # or node server.js

# Frontend running
cd touring-fe
npm run dev

# Python embedding service (optional)
cd ai
uvicorn app:app --reload --port 8088
```

---

## ✅ Test Case 1: Create Tour Request (No Infinite Load)

**Time:** 30 seconds

1. **Open** `http://localhost:5173/`
2. **Login** as traveller
3. **Navigate** to any itinerary
4. **Click** "Yêu cầu Hướng dẫn viên" button
5. **Expected:** Modal opens immediately with guide list loading
6. **✅ Pass:** If guides load within 2 seconds and no hanging

**Debug Console:**
```
[RequestGuide] Modal opened, checking for active requests...
[RequestGuide] Loading available guides...
```

---

## ✅ Test Case 2: Payment & Guide Notification

**Time:** 2 minutes

### Step A: Create Custom Tour Request
1. **Traveller:** Create itinerary + send tour request to guide
2. **Backend log should show:**
   ```
   [TourRequest] 🔔 Sent notification to guide
   ```

### Step B: Guide Accepts & Sets Price
3. **Guide:** Accept request and propose final price
4. **Backend log:**
   ```
   [TourRequest] 🔔 Sent price offer notification
   ```

### Step C: Traveller Makes Payment
5. **Traveller:** Accept price and go to payment
6. **Complete MoMo payment** (can use test account)
7. **Backend logs on IPN:**
   ```
   [MoMo IPN] 🔔 Emitted paymentSuccessful event to guide
   [MoMo IPN] 🔔 Emitted paymentConfirmed to traveller
   [MoMo IPN] 🔔 Emitted paymentUpdated to request room
   ```

### Step D: Guide Receives Notification
8. **Guide's browser:** Should see toast notification
   ```
   "💰 Khách hàng đã thanh toán! Tour sắp sàng lên lịch."
   ```

**✅ Pass:** If guide gets notification without page refresh

---

## ✅ Test Case 3: Tour Completion Button (Payment Check)

**Time:** 1 minute

### Step A: View Tour Before Payment
1. **Guide:** Open tour details (with custom tour request)
2. **Check button state:**
   - If `paymentStatus` ≠ `'paid'`:
     - ❌ Button disabled (grayed out)
     - ⚠️ Warning message: "Chờ khách hàng thanh toán trước khi hoàn thành tour"

### Step B: After Payment Complete
3. **Refresh page** or wait for socket update
4. **Check button state:**
   - If `paymentStatus === 'paid'`:
     - ✅ Button enabled (blue, clickable)
     - No warning message

### Step C: Complete Tour
5. **Click** "Hoàn thành Tour" button
6. **Modal appears** asking for completion notes
7. **Enter note** and click "Xác nhận hoàn thành"
8. **API Call:** `POST /api/bookings/:bookingId/complete`
9. **Expected:** Redirect to `/guide/tours` with success message

**✅ Pass:** If:
- Button correctly disabled/enabled based on payment status
- Completion flow works after payment
- Tour status changed to 'completed'

---

## ✅ Test Case 4: Guide Review System

**Time:** 1 minute

### Test Review Creation
1. **Traveller:** Complete a custom tour with guide
2. **After tour date passes**, traveller can write guide review
3. **Click** "Viết đánh giá cho hướng dẫn viên"
4. **Form appears** with:
   - Star rating (1-5)
   - Title & content
   - Detailed ratings (service, guide, value)
   - Image upload

### Test API Endpoints
```bash
# Frontend API calls:
POST /api/reviews/guide           # Create review
GET /api/reviews/guide/:guideId   # View guide reviews
GET /api/reviews/my-guide-reviews # User's guide reviews
```

**✅ Pass:** If review form works and submits successfully

---

## 📊 Final Verification

### Backend Logs Check
```bash
# Look for these log patterns in BE console:

# Payment flow
[MoMo IPN] ✅ Payment successful
[MoMo IPN] 🔔 Emitted paymentSuccessful event

# Tour request creation
[TourRequest] CREATED - Request ID

# Tour completion
[TourCompletion] ✅ Booking marked as completed
```

### Frontend Console Check
```bash
# Look for these in browser console:

# No errors related to:
- RequestGuide
- GuideTourDetail
- guideReviews

# Should see socket events:
[Socket] tourRequestUpdated
[Socket] paymentUpdated
[Socket] bookingUpdated
```

### Database Check
```bash
# MongoDB checks:

# 1. PaymentSession collection
db.paymentsessions.findOne({status: 'paid'})
# Should have: orderId, amount, status, paidAt

# 2. Booking collection  
db.bookings.findOne({status: 'completed'})
# Should have: payment.status='completed', completedAt date

# 3. GuideReview collection
db.guidereviews.findOne({status: 'pending'})
# Should have: rating, title, content, guideId
```

---

## 🎯 Success Criteria

| Issue | Status | Test |
|-------|--------|------|
| Payment notification | ✅ | Guide receives toast |
| Tour completion button | ✅ | Disabled until paid |
| Infinite loading | ✅ | Modal opens in <2s |
| Guide reviews | ✅ | Form works & submits |
| UI/UX sync | ✅ | Real-time updates |

---

## 🚨 Troubleshooting

### Modal still loading infinitely?
1. Check browser console for errors
2. Verify `withAuth` function is properly exported
3. Check API endpoint: `GET /api/tour-requests/check-active/:itineraryId`

### Guide not receiving payment notification?
1. Verify socket.io connected: DevTools → Network → WS
2. Check backend socket setup: `/socket/index.js` running
3. Verify `global.io` is set in server.js
4. Check MoMo IPN endpoint is accessible

### Tour completion button not responding?
1. Verify payment status: Check `tour.paymentStatus` in React DevTools
2. Verify booking ID: Check `tour._id` in network request
3. Check API endpoint: Should be `/api/bookings/:bookingId/complete`

### Guide reviews not loading?
1. Verify API endpoint: `GET /api/reviews/guide/:guideId`
2. Check if reviews are in "approved" status
3. Verify guideId is correct (not null)

---

**Test Duration:** ~5 minutes  
**Success Rate:** Should be 100% if all fixes applied correctly  
**Last Tested:** November 15, 2025
