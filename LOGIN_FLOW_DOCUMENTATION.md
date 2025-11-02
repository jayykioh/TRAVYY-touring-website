# 🔐 Login Flow Documentation - TRAVYY Touring Website

## Tổng quan hệ thống sau khi cập nhật

Hệ thống đã được nâng cấp để hỗ trợ **khóa tài khoản người dùng** với các tính năng:

- Admin có thể khóa/mở khóa tài khoản user
- Lưu lịch sử khóa (lock history) với lý do
- User bị khóa sẽ thấy thông báo ban ngay khi đăng nhập
- Hỗ trợ cả đăng nhập thông thường và Google OAuth

---

## 1. 🎯 Normal Login Flow (Email/Username + Password)

### 1.1. Frontend Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ User nhập credentials → POST /api/auth/login                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ AuthContext.login() gọi backend                                 │
│ - File: touring-fe/src/auth/AuthContext.jsx                     │
│ - Method: login(username, password)                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Backend xử lý đăng nhập                                         │
│ - File: touring-be/controller/auth.controller.js                │
│ - Method: exports.login                                         │
│                                                                  │
│ ✅ Check 1: User tồn tại?                                       │
│ ✅ Check 2: Password đúng?                                      │
│ ✅ Check 3: accountStatus === "banned"? → REJECT 403           │
│    └─ Response: { message: statusReason || "..." }             │
│                                                                  │
│ ✅ Success:                                                     │
│    - Tạo accessToken (JWT, expires 24h)                        │
│    - Tạo refreshToken (JWT, expires 7d)                        │
│    - Set cookie: refresh_token (HttpOnly, Secure)              │
│    - Return: { accessToken, user: {...} }                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Frontend nhận response                                          │
│                                                                  │
│ ❌ Error 403 (banned):                                          │
│    - Hiển thị toast error với lý do khóa                       │
│    - User không được phép vào app                              │
│                                                                  │
│ ✅ Success 200:                                                 │
│    - setAccessToken(res.accessToken)                           │
│    - setUser({ ...res.user, token: res.accessToken })         │
│    - Navigate to "/" (MainHome)                                │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2. Backend Implementation

**File:** `touring-be/controller/auth.controller.js`

```javascript
exports.login = async (req, res) => {
  // ... validate input ...

  const user = await User.findOne({ $or: [{ email }, { username }] });
  if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Sai password" });

  // ✅ CHECK BANNED STATUS
  if (user.accountStatus === "banned") {
    return res.status(403).json({
      message: user.statusReason || "Tài khoản của bạn đã bị khóa.",
      accountStatus: "banned",
      statusReason: user.statusReason,
    });
  }

  // Generate tokens...
  const accessToken = signAccess({ sub: user._id, role: user.role });
  const refreshToken = signRefresh({ sub: user._id, role: user.role });

  // Set refresh token cookie
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return res.json({ accessToken, user: { ...user.toObject() } });
};
```

---

## 2. 🔄 Google OAuth Login Flow

### 2.1. OAuth Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User click "Login with Google"                              │
│    → Redirect to Google OAuth consent screen                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Google redirects back to:                                    │
│    GET /api/auth/google/callback?code=...                       │
│                                                                  │
│ Backend xử lý:                                                  │
│ - File: touring-be/controller/auth.controller.js                │
│ - Method: exports.googleCallback                                │
│                                                                  │
│ ✅ Lấy Google access token từ code                             │
│ ✅ Lấy user info từ Google                                     │
│ ✅ Tìm hoặc tạo user trong DB                                  │
│ ✅ CHECK accountStatus === "banned"? → Set cookie & redirect   │
│ ✅ Generate accessToken + refreshToken                         │
│ ✅ Set refresh_token cookie                                    │
│ ✅ Redirect to frontend: /oauth-callback                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Frontend OAuthCallback page                                  │
│    File: touring-fe/src/pages/OAuthCallback.jsx                 │
│                                                                  │
│ Gọi: POST /api/auth/refresh                                     │
│ (để lấy accessToken từ refresh_token cookie)                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Backend /api/auth/refresh                                    │
│    File: touring-be/routes/auth.routes.js                       │
│                                                                  │
│ ✅ Verify refresh_token từ cookie                              │
│ ✅ Decode userId từ token                                      │
│ ✅ Query User từ DB                                            │
│ ✅ Check accountStatus                                         │
│                                                                  │
│ Response:                                                        │
│ {                                                                │
│   "accessToken": "eyJhbGc...",                                  │
│   "accountStatus": "banned" | "active",  ← ✨ MỚI             │
│   "statusReason": "khoá" | ""            ← ✨ MỚI             │
│ }                                                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. OAuthCallback xử lý response                                 │
│                                                                  │
│ Parse refresh response:                                          │
│ const body = await r.json();                                    │
│                                                                  │
│ if (accountStatus === "banned" || "locked" || "lock") {        │
│   sessionStorage.setItem("bannedInfo",                         │
│     JSON.stringify({ message: statusReason })                  │
│   );                                                             │
│ }                                                                │
│                                                                  │
│ Navigate to "/" (MainHome)                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. App.jsx routing logic                                        │
│    File: touring-fe/src/App.jsx                                 │
│                                                                  │
│ const { isAuth, bannedInfo, booting } = useAuth();             │
│                                                                  │
│ Route:                                                           │
│ <Route path="/"                                                 │
│   element={(isAuth || bannedInfo) ? <MainHome /> : <Landing />}│
│ />                                                               │
│                                                                  │
│ ✅ Nếu bannedInfo tồn tại → Render MainHome                    │
│    (để MainHome hiển thị ban UI)                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. MainHome renders                                             │
│    File: touring-fe/src/pages/MainHome.jsx                      │
│                                                                  │
│ const { bannedInfo, booting } = useAuth();                      │
│                                                                  │
│ if (booting) return <LoadingSpinner />;  ← ✨ ĐỢI AUTH INIT   │
│                                                                  │
│ if (bannedInfo) {                                               │
│   return <BanScreen reason={bannedInfo.message} />;  ← ✨ BAN  │
│ }                                                                │
│                                                                  │
│ return <NormalHomePage />;                                      │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2. Key Implementation Details

**OAuthCallback.jsx** - Detect banned status immediately:

```jsx
// File: touring-fe/src/pages/OAuthCallback.jsx

const r = await fetch(`${API_BASE}/api/auth/refresh`, {
  method: "POST",
  credentials: "include",
});

const body = await r.json();

// Normalize status: banned/locked/lock → all treated as banned
if (body?.accountStatus) {
  const status = String(body.accountStatus || "").toLowerCase();
  const isLocked =
    status === "banned" || status === "locked" || status === "lock";

  if (isLocked) {
    sessionStorage.setItem(
      "bannedInfo",
      JSON.stringify({ message: body.statusReason || "Tài khoản bị khóa" })
    );
  } else {
    sessionStorage.removeItem("bannedInfo");
  }
}

nav("/", { replace: true });
```

**auth.routes.js** - Refresh endpoint returns accountStatus:

```javascript
// File: touring-be/routes/auth.routes.js

router.post("/refresh", async (req, res) => {
  const token = req.cookies.refresh_token;
  if (!token) return res.status(401).json({ message: "No refresh token" });

  const payload = verifyRefresh(token);
  const user = await User.findById(payload.sub);

  const newAccess = signAccess({ sub: user._id, role: user.role });

  // ✅ Include accountStatus in response
  return res.json({
    accessToken: newAccess,
    accountStatus: user.accountStatus || "active",
    statusReason: user.statusReason || "",
  });
});
```

---

## 3. 🔒 AuthContext Boot Flow

Khi app khởi động (mount), `AuthContext` tự động gọi refresh để restore session:

```
┌─────────────────────────────────────────────────────────────────┐
│ App Mount → AuthContext useEffect                               │
│ File: touring-fe/src/auth/AuthContext.jsx                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 1. Read bannedInfo from sessionStorage (initial state)          │
│    const [bannedInfo, setBannedInfo] = useState(() => {        │
│      const raw = sessionStorage.getItem("bannedInfo");          │
│      return raw ? JSON.parse(raw) : null;                       │
│    });                                                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Call POST /api/auth/refresh                                  │
│    const r = await api(`${API_BASE}/api/auth/refresh`, ...);   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Check accountStatus in response                              │
│                                                                  │
│ if (r?.accountStatus) {                                         │
│   const status = String(r.accountStatus).toLowerCase();         │
│   const isLocked = ["banned", "locked", "lock"].includes(status);│
│                                                                  │
│   if (isLocked) {                                               │
│     setBannedInfo({ message: r.statusReason || "Tài khoản..." });│
│     sessionStorage.setItem("bannedInfo", ...);                  │
│     setUser(null);           ← User = null khi banned           │
│     setBooting(false);                                          │
│     return;                  ← Skip /me call                    │
│   } else {                                                       │
│     setBannedInfo(null);     ← Clear stale ban info             │
│     sessionStorage.removeItem("bannedInfo");                    │
│   }                                                              │
│ }                                                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. If not banned → Call GET /api/auth/me                       │
│    (to get full user profile)                                   │
│                                                                  │
│ ✅ Success: setUser(me); setBannedInfo(null)                   │
│ ❌ Error 403: setBannedInfo(error.body); setUser(null)         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Finally: setBooting(false)                                   │
│    → App renders with correct auth state                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. 🛡️ Middleware Protection

**authJwt.js** - Verify token và check banned status real-time:

```javascript
// File: touring-be/middlewares/authJwt.js

exports.verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.sub;
    req.userRole = decoded.role;

    // ✅ Check user status in DB (even if token is valid)
    const user = await User.findById(req.userId).select(
      "accountStatus statusReason"
    );

    if (user && user.accountStatus === "banned") {
      return res.status(403).json({
        message: user.statusReason || "Tài khoản đã bị khóa",
        accountStatus: "banned",
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
```

**Impact:** Ngay cả khi user đang có accessToken hợp lệ, nếu admin khóa account → các API call tiếp theo sẽ bị reject 403.

---

## 5. 📊 Account Status Values

Backend hỗ trợ nhiều giá trị status, frontend normalize về 3 loại:

| Backend Value | Frontend Interpretation | Display     |
| ------------- | ----------------------- | ----------- |
| `"banned"`    | Banned                  | Show ban UI |
| `"locked"`    | Banned                  | Show ban UI |
| `"lock"`      | Banned                  | Show ban UI |
| `"active"`    | Active                  | Normal flow |
| `undefined`   | Active (default)        | Normal flow |

**Normalization logic:**

```javascript
const status = String(accountStatus || "").toLowerCase();
const isLocked = ["banned", "locked", "lock"].includes(status);
```

---

## 6. 🎨 UI Flow Summary

### Login Success (Active Account)

```
Login → AuthContext boot → Refresh API → accountStatus: "active"
  → setUser(userData)
  → setBannedInfo(null)
  → App routes to "/"
  → Render MainHome with normal content
```

### Login Fail (Banned Account)

```
Login → AuthContext boot → Refresh API → accountStatus: "banned"
  → setUser(null)
  → setBannedInfo({ message: "khoá" })
  → sessionStorage.setItem("bannedInfo", ...)
  → App routes to "/" (vì bannedInfo exists)
  → MainHome checks bannedInfo
  → Render BAN SCREEN with reason
```

### Ban Screen UI

```jsx
// File: touring-fe/src/pages/MainHome.jsx

if (booting) {
  return <LoadingSpinner />; // Wait for auth init
}

if (bannedInfo) {
  const reason =
    bannedInfo.reason || bannedInfo.message || "Tài khoản bị khóa.";
  return (
    <div className="ban-screen">
      <h2>Tài khoản bị khóa</h2>
      <p>Bạn không thể truy cập vì tài khoản của bạn đã bị khóa.</p>
      <div className="reason">
        <strong>Lý do:</strong> {reason}
      </div>
      <p>Liên hệ hỗ trợ nếu bạn nghĩ đây là nhầm lẫn.</p>
    </div>
  );
}

return <NormalHomeContent />;
```

---

## 7. 🔧 Admin Lock/Unlock Flow

### Admin locks a user:

```
Admin UI → PUT /api/admin/users/:id/status
  Body: { status: "banned", reason: "Vi phạm chính sách" }

Backend:
  1. Update user.accountStatus = "banned"
  2. Update user.statusReason = "Vi phạm chính sách"
  3. Append to user.lockHistory:
     {
       reason: "Vi phạm chính sách",
       lockedAt: new Date(),
       lockedBy: adminId
     }
  4. Save user

User side:
  - Next API call with existing accessToken → middleware rejects 403
  - Next refresh → returns accountStatus: "banned"
  - UI shows ban screen immediately
```

### Admin unlocks a user:

```
Admin UI → PUT /api/admin/users/:id/status
  Body: { status: "active" }

Backend:
  1. Update user.accountStatus = "active"
  2. Update user.statusReason = ""
  3. Update latest lockHistory entry:
     {
       ...existingEntry,
       unlockedAt: new Date(),
       unlockedBy: adminId
     }
  4. Save user

User side:
  - Next refresh → returns accountStatus: "active"
  - bannedInfo cleared
  - Normal login flow resumes
```

---

## 8. 📝 Key Files Summary

### Backend

- **auth.controller.js** - Login logic, ban check
- **auth.routes.js** - /refresh endpoint with accountStatus
- **authJwt.js** - Middleware to block banned users real-time
- **admin.user.controller.js** - Admin lock/unlock logic
- **Users.js** - Model with lockHistory schema

### Frontend

- **AuthContext.jsx** - Central auth state, boot flow, ban detection
- **OAuthCallback.jsx** - OAuth redirect handler, set bannedInfo
- **MainHome.jsx** - Check booting & bannedInfo, render ban UI
- **App.jsx** - Routing logic: render MainHome if isAuth OR bannedInfo
- **CustomerAccountsPage.jsx** - Admin UI to lock/unlock users

---

## 9. ✅ Testing Checklist

### Normal Login

- [ ] Login với active account → thành công
- [ ] Login với banned account → thấy error toast với lý do
- [ ] Không thể bypass bằng cách giữ old token

### OAuth Login

- [ ] Google login với active account → vào MainHome bình thường
- [ ] Google login với banned account → thấy ban screen với lý do
- [ ] Hard reload sau OAuth → vẫn thấy ban screen (persistent)

### Admin Actions

- [ ] Admin lock account → user hiện tại bị kick out ngay lập tức
- [ ] Admin unlock account → user login lại được
- [ ] Lock history được ghi lại đầy đủ

### UI/UX

- [ ] Không thấy flash của normal content trước khi show ban UI
- [ ] Loading spinner xuất hiện khi booting
- [ ] Ban message hiển thị đúng lý do từ admin

---

## 10. 🚀 Deployment Notes

### Environment Variables

```env
# Backend
NODE_ENV=production
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FRONTEND_URL=https://yourdomain.com

# Frontend
VITE_API_URL=https://api.yourdomain.com
```

### Cookie Settings (Production)

```javascript
res.cookie("refresh_token", token, {
  httpOnly: true,
  secure: true, // HTTPS only
  sameSite: "none", // Cross-origin
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

---

**📅 Document Version:** 1.0  
**Last Updated:** October 28, 2025  
**Author:** GitHub Copilot
