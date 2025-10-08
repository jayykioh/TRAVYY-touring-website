# 🐛 Bug Fix: 401 Unauthorized on /api/bookings/my

## Ngày: 8 tháng 10, 2025

### 🔴 Vấn đề
- Endpoint `GET /api/bookings/my` liên tục trả về **401 Unauthorized**
- Token được gửi đúng trong Authorization header
- Các endpoint khác (`/api/cart`, `/api/auth/me`) hoạt động bình thường

### 🔍 Root Cause
**File:** `touring-be/controller/bookingController.js`

**Code lỗi:**
```javascript
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.userId; // ❌ SAI: req.userId không tồn tại
    
    if (!userId) {
      return res.status(401).json({ error: "UNAUTHORIZED" }); // Luôn trả về 401
    }
    // ...
  }
}
```

**Nguyên nhân:**
- `authJwt` middleware set `req.user` (chứa decoded JWT payload)
- JWT payload có structure: `{ sub: "userId", role: "Traveler", iat: ..., exp: ... }`
- Controller sai khi đọc `req.userId` thay vì `req.user.sub`

### ✅ Giải pháp

**Code đúng:**
```javascript
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user?.sub; // ✅ ĐÚNG: req.user.sub
    
    if (!userId) {
      console.error("getUserBookings: Missing userId from token");
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    console.log("📚 Fetching bookings for userId:", userId);

    const bookings = await Booking.find({ userId })
      .populate("items.tourId", "title imageItems")
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✅ Found ${bookings.length} bookings for user ${userId}`);
    // ...
  }
}
```

### 📚 JWT Token Structure

**authJwt middleware** (`touring-be/middlewares/authJwt.js`):
```javascript
module.exports = (req, res, next) => {
  const h = req.headers.authorization || "";
  const t = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!t) return res.status(401).json({ message: "Missing token" });
  try {
    req.user = jwt.verify(t, process.env.JWT_ACCESS_SECRET); // ✅ Set req.user
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
};
```

**JWT Payload Structure:**
```javascript
{
  sub: "68db71da4203ce46cab9c769",  // User ID
  role: "Traveler",                  // User role
  iat: 1759930132,                   // Issued at
  exp: 1759930732                    // Expiry
}
```

### 🔍 Các controllers khác sử dụng đúng

**paypal.controller.js:**
```javascript
const userId = req.user.sub; // ✅ ĐÚNG
```

**cart.controller.js:**
```javascript
const userId = req.user.sub; // ✅ ĐÚNG
```

**wishlistController.js:**
```javascript
const userId = toObjectId(req.user.sub); // ✅ ĐÚNG
```

**profile.controller.js:**
```javascript
const uid = req.user?.sub || req.user?._id || req.user?.id; // ✅ ĐÚNG với fallback
```

### 📝 Changes Made

**File:** `touring-be/controller/bookingController.js`

**Before:**
```javascript
const userId = req.userId; // ❌ SAI
```

**After:**
```javascript
const userId = req.user?.sub; // ✅ ĐÚNG
```

**Added logging:**
```javascript
console.log("📚 Fetching bookings for userId:", userId);
console.log(`✅ Found ${bookings.length} bookings for user ${userId}`);
```

### ✅ Expected Behavior

**Request:**
```http
GET /api/bookings/my HTTP/1.1
Host: localhost:4000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Server Log:**
```
Auth header at GET /api/bookings/my => Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
📚 Fetching bookings for userId: 68db71da4203ce46cab9c769
✅ Found 2 bookings for user 68db71da4203ce46cab9c769
GET /api/bookings/my 200 125.341 ms
```

**Response:**
```json
{
  "success": true,
  "bookings": [
    {
      "_id": "...",
      "userId": "68db71da4203ce46cab9c769",
      "items": [...],
      "totalUSD": 125,
      "status": "paid",
      ...
    }
  ],
  "count": 2
}
```

### 🧪 Testing

**Test steps:**
1. ✅ Restart backend server
2. ✅ Login to get fresh token
3. ✅ Navigate to `/booking-history` page
4. ✅ Check browser console - should not show 401 errors
5. ✅ Check server logs - should show:
   - "📚 Fetching bookings for userId: ..."
   - "✅ Found X bookings for user ..."
6. ✅ Verify bookings display on page

### 🔐 Security Note

Luôn sử dụng `req.user.sub` để lấy userId từ JWT token sau khi qua `authJwt` middleware:

```javascript
// ✅ ĐÚNG
const userId = req.user.sub;
const userId = req.user?.sub; // với optional chaining

// ❌ SAI
const userId = req.userId;
const userId = req.user.userId;
const userId = req.user.id; // (trừ khi có logic đặc biệt)
```

### 📊 Summary

| Before | After | Status |
|--------|-------|--------|
| `req.userId` → undefined | `req.user.sub` → "68db71da4203ce46cab9c769" | ✅ Fixed |
| 401 Unauthorized | 200 OK | ✅ Fixed |
| No bookings loaded | Bookings displayed | ✅ Fixed |

---

**Fixed by:** GitHub Copilot  
**Date:** 8 tháng 10, 2025  
**Status:** ✅ **RESOLVED**
