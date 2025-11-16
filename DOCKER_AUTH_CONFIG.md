# 🔧 Cấu hình CORS và Auth cho Docker Deployment

## ⚠️ VẤN ĐỀ CẦN CHỈNH SỬA

### 1. CORS Configuration trong Backend

**File: `touring-be/server.js`**

Hiện tại CORS đang hardcode localhost:
```javascript
cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
})
```

**CẦN SỬA:**
```javascript
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',')
  : ["http://localhost:5173", "http://localhost:5174"];

cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
})
```

**Thêm vào .env:**
```
# Development
CORS_ORIGINS=http://localhost:5173,http://localhost:5174

# Production
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

---

### 2. Socket.IO CORS Configuration

**File: `touring-be/server.js`**

Socket.IO cũng cần update:
```javascript
const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // Sử dụng biến môi trường
    credentials: true,
    methods: ["GET", "POST"],
  }
});
```

---

### 3. OAuth Callback URLs

**⚠️ QUAN TRỌNG:** Khi deploy production, bạn PHẢI update OAuth callback URLs trên:

#### Google OAuth Console
1. Truy cập: https://console.cloud.google.com/apis/credentials
2. Chọn OAuth 2.0 Client ID
3. Thêm **Authorized redirect URIs**:
   ```
   https://yourdomain.com/api/auth/google/callback
   https://api.yourdomain.com/api/auth/google/callback
   ```

#### Facebook Developer Console  
1. Truy cập: https://developers.facebook.com/apps/
2. Settings → Basic → Add Platform → Website
3. Thêm **Valid OAuth Redirect URIs**:
   ```
   https://yourdomain.com/api/auth/facebook/callback
   https://api.yourdomain.com/api/auth/facebook/callback
   ```

**Update trong .env:**
```
# Production
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
FACEBOOK_CALLBACK_URL=https://yourdomain.com/api/auth/facebook/callback
```

---

### 4. Frontend API URL

**File: `touring-fe/src/*` (nhiều files)**

Hiện tại hardcode:
```javascript
const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
```

**ĐÃ ĐÚNG** - chỉ cần set environment variable khi build:
```
VITE_API_URL=https://api.yourdomain.com
```

---

### 5. PayPal Configuration

**⚠️ LƯU Ý:** Chuyển từ sandbox sang production

**Update .env khi production:**
```
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=your_production_client_id
PAYPAL_CLIENT_SECRET=your_production_client_secret
```

---

## 📋 CHECKLIST TRƯỚC KHI DEPLOY

- [ ] Update CORS_ORIGINS trong .env với domain thật
- [ ] Update OAuth callback URLs trên Google Console
- [ ] Update OAuth callback URLs trên Facebook Console
- [ ] Cập nhật GOOGLE_CALLBACK_URL trong .env
- [ ] Cập nhật FACEBOOK_CALLBACK_URL trong .env
- [ ] Đổi PAYPAL_MODE sang 'live' nếu production
- [ ] Set VITE_API_URL đúng domain backend
- [ ] Kiểm tra MongoDB connection string
- [ ] Tạo JWT secrets mới cho production (openssl rand -base64 32)
- [ ] Setup HTTPS/SSL certificates (Let's Encrypt)
- [ ] Update SMTP settings cho production email
- [ ] Test OAuth flow trên production domain
- [ ] Test CORS với production frontend

---

## 🔐 Security Best Practices

1. **KHÔNG commit file .env** vào Git
2. **Sử dụng secrets management** cho production (AWS Secrets Manager, Azure Key Vault, etc.)
3. **Rotate JWT secrets** định kỳ
4. **Enable HTTPS** bắt buộc cho production
5. **Set secure cookie options** khi production:
   ```javascript
   app.use(session({
     cookie: {
       secure: true, // HTTPS only
       httpOnly: true,
       sameSite: 'strict'
     }
   }));
   ```

---

## 🌐 Reverse Proxy Configuration (Optional)

Nếu dùng Nginx/Traefik làm reverse proxy:

**nginx.conf example:**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://backend:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
