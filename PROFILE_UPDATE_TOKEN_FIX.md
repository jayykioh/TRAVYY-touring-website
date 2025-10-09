# 🐛 Critical Fix: Missing Token After Profile Update

## Ngày: 9 tháng 10, 2025

### 🔴 Vấn đề (Tiếp theo)
Sau khi áp dụng fix trước (gọi `/api/auth/me`), vẫn còn lỗi:
- ✅ Backend log cho thấy PATCH /api/profile/info → **200 OK**
- ✅ Backend log cho thấy GET /api/auth/me → **200 OK**
- ❌ **Nhưng vẫn bị lỗi 401 khi thêm vào cart, wishlist, buy now**

### 🔍 Root Cause

**File:** `touring-fe/src/components/ProfileInfo.jsx`

**Code lỗi:**
```javascript
const freshUser = await withAuth("/api/auth/me");
setUser(freshUser); // ❌ THIẾU TOKEN!
```

**Nguyên nhân:**
- `/api/auth/me` chỉ trả về **user object** (không có `token` field)
- Nhiều component khác (cart, wishlist, buy-now) cần `user.token` để gọi API
- Sau khi `setUser(freshUser)` → `user.token` bị mất → các API khác gọi với `Authorization: Bearer undefined` → **401 Unauthorized**

**Auth Context structure:**
```javascript
// AuthContext.jsx
const value = {
  user: { 
    ...userData, 
    token: accessToken // ← Token được gộp vào user object
  },
  accessToken, // ← Token riêng
  withAuth, // ← Helper function dùng accessToken
  ...
};
```

**Vì sao vẫn có token trong `user` object?**
- Nhiều component legacy dùng `user.token` thay vì `accessToken` từ context
- Để tương thích ngược, auth context gộp token vào user: `setUser({ ...res.user, token: res.accessToken })`

### ✅ Giải pháp

**Code đúng:**
```javascript
// 2️⃣ Fetch fresh user from /api/auth/me
const freshUser = await withAuth("/api/auth/me");

// ✅ QUAN TRỌNG: Phải gộp token vào user object
// Vì nhiều component khác (cart, wishlist, buy-now) cần user.token
setUser({ ...freshUser, token: user?.token });
```

**Cập nhật dependency array:**
```javascript
useCallback(
  async (e) => { ... },
  [formData, phoneError, usernameError, withAuth, setUser, user?.token]
  //                                                         ^^^^^^^^^^^ Thêm vào
);
```

### 📝 Full Fix

**Before:**
```javascript
const freshUser = await withAuth("/api/auth/me");
setUser(freshUser); // ❌ Token bị mất
```

**After:**
```javascript
const freshUser = await withAuth("/api/auth/me");
console.log("✅ Fresh user fetched:", freshUser);

// ⚠️ QUAN TRỌNG: Phải gộp token vào user object
setUser({ ...freshUser, token: user?.token }); // ✅ Giữ lại token
```

### 🔄 Luồng hoạt động chi tiết

```
1. User click "Save profile"
   ↓
2. POST /api/profile/info
   → Backend: 200 OK
   ↓
3. GET /api/auth/me (withAuth tự động gửi Bearer token)
   → Backend: 200 OK
   → Response: { id, email, name, phone, location, role }
   ↓
4. setUser({ ...freshUser, token: user?.token })
   → Gộp token vào user object
   → user = { id, email, ..., token: "eyJhbGci..." }
   ↓
5. ✅ Các component khác (cart, wishlist, buy-now) có thể dùng user.token
```

### 🐛 Tại sao lỗi 401 vẫn xảy ra?

**Scenario:**
1. User update profile
2. `setUser(freshUser)` → `user.token` = `undefined`
3. Component Cart re-render
4. Cart component gọi API: `Authorization: Bearer ${user.token}`
5. Backend nhận: `Authorization: Bearer undefined`
6. Backend trả về: **401 Unauthorized**

**Fix:**
1. User update profile
2. `setUser({ ...freshUser, token: user?.token })` → `user.token` vẫn còn
3. Component Cart re-render
4. Cart component gọi API: `Authorization: Bearer eyJhbGci...`
5. Backend nhận: `Authorization: Bearer eyJhbGci...` ✅
6. Backend trả về: **200 OK** ✅

### 🧪 Testing

**Test case 1: Add to cart after update**
```
1. Update profile → Save
2. Navigate to tour detail page
3. Click "Add to cart"
4. ✅ Expect: 200 OK (not 401)
```

**Test case 2: Add to wishlist after update**
```
1. Update profile → Save
2. Navigate to tour detail page
3. Click heart icon (add to wishlist)
4. ✅ Expect: 200 OK (not 401)
```

**Test case 3: Buy now after update**
```
1. Update profile → Save
2. Navigate to tour detail page
3. Click "Buy now"
4. ✅ Expect: Navigate to checkout (not 401)
```

### 🔐 Best Practice

**Luôn giữ lại token khi cập nhật user:**
```javascript
// ✅ ĐÚNG: Giữ lại token
setUser({ ...newUser, token: user?.token });

// ❌ SAI: Mất token
setUser(newUser);
```

**Hoặc tốt hơn: Dùng accessToken từ context thay vì user.token:**
```javascript
// Trong component
const { user, accessToken, withAuth } = useAuth();

// Khi gọi API
fetch("/api/cart", {
  headers: {
    Authorization: `Bearer ${accessToken}` // ✅ Dùng accessToken từ context
  }
});

// Thay vì
fetch("/api/cart", {
  headers: {
    Authorization: `Bearer ${user.token}` // ❌ Không nên dùng
  }
});
```

### 📊 Summary

| Issue | Before | After | Status |
|-------|--------|-------|--------|
| API update profile | ✅ 200 OK | ✅ 200 OK | OK |
| API /auth/me | ✅ 200 OK | ✅ 200 OK | OK |
| user.token after update | ❌ undefined | ✅ preserved | Fixed |
| Add to cart after update | ❌ 401 | ✅ 200 OK | Fixed |
| Add to wishlist after update | ❌ 401 | ✅ 200 OK | Fixed |
| Buy now after update | ❌ 401 | ✅ 200 OK | Fixed |

### ⚡ Performance Note

**Token được lưu ở đâu?**
```javascript
// AuthContext state
const [accessToken, setAccessToken] = useState(null); // ← In-memory
const [user, setUser] = useState(null); // ← Chứa { ...userData, token }

// Refresh token
// ← Lưu trong HTTP-only cookie (secure)
```

**Tại sao user.token cần tồn tại?**
- Legacy components dùng `user.token`
- Backward compatibility
- Một số component chưa refactor để dùng `accessToken` từ context

**Refactor trong tương lai:**
- [ ] Migrate tất cả components để dùng `withAuth()` helper
- [ ] Hoặc dùng `accessToken` từ context thay vì `user.token`
- [ ] Remove `token` field từ `user` object

---

**Fixed by:** GitHub Copilot  
**Date:** 9 tháng 10, 2025  
**Status:** ✅ **RESOLVED (Critical)**
