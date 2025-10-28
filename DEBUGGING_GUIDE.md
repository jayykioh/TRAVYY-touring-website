# 🐛 Hướng dẫn Debug

## ✅ Đã sửa: Tour vẫn hiện dù đã ẩn

### Vấn đề

Model Tour **thiếu field `isHidden`**

### Đã sửa

```javascript
// touring-be/models/agency/Tours.js
isHidden: { type: Boolean, default: false }
```

### Cách test

1. **Test qua Admin UI:**

   - Vào `/admin/tours`
   - Click nút "Ẩn" trên bất kỳ tour nào
   - Kiểm tra tour đó biến mất ở frontend user

2. **Test qua MongoDB:**

   ```javascript
   // Ẩn tour
   db.tours.updateOne(
     { _id: ObjectId("tour_id_here") },
     { $set: { isHidden: true } }
   );

   // Hiện lại
   db.tours.updateOne(
     { _id: ObjectId("tour_id_here") },
     { $set: { isHidden: false } }
   );
   ```

3. **Kiểm tra API response:**
   ```bash
   curl http://localhost:4000/api/tours | jq '.[0] | {title, isHidden}'
   ```

---

## ⚠️ PayPal không thanh toán được

### Checklist Debug PayPal

#### 1. Kiểm tra Backend Logs

```bash
cd touring-be
npm run dev
```

Tìm dòng:

```
[Boot] PayPal env present: { hasClient: true, hasSecret: true, mode: 'sandbox' }
```

Nếu `hasClient` hoặc `hasSecret` là `false` → Kiểm tra file `.env`

#### 2. Kiểm tra .env

```bash
cat touring-be/.env | grep PAYPAL
```

Cần có:

```
PAYPAL_CLIENT_ID=AWIS9s...
PAYPAL_SECRET=EPmsvi...
PAYPAL_MODE=sandbox
```

#### 3. Test PayPal API trực tiếp

```bash
# Test get access token
curl -X POST https://api-m.sandbox.paypal.com/v1/oauth2/token \
  -u "YOUR_CLIENT_ID:YOUR_SECRET" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials"
```

#### 4. Kiểm tra Frontend Console

Mở DevTools (F12) → Console → Tìm:

```
📦 Sending payment request: {...}
✅ Order created, redirecting to PayPal: EC-...
```

Hoặc lỗi:

```
🚫 PayPal create-order failed {...}
❌ PayPal payment error: ...
```

#### 5. Test create-order endpoint

```bash
curl -X POST http://localhost:4000/api/paypal/create-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "mode": "cart"
  }'
```

Response mong đợi:

```json
{
  "orderID": "EC-1234567890",
  "approveUrl": "https://www.sandbox.paypal.com/checkoutnow?token=EC-..."
}
```

#### 6. Common Errors

**Error: MISSING_PAYPAL_CREDENTIALS**

- Kiểm tra `.env` có đầy đủ credentials không
- Restart backend sau khi update `.env`

**Error: PAYPAL_OAUTH_FAILED**

- Client ID hoặc Secret sai
- Đăng nhập https://developer.paypal.com/dashboard/
- Lấy lại credentials từ app sandbox

**Error: INSTRUMENT_DECLINED**

- Dùng test account PayPal sandbox
- https://developer.paypal.com/dashboard/accounts/sandbox

**Error: AMOUNT_MISMATCH**

- Kiểm tra conversion rate VND → USD
- PayPal cần amount >= 0.01 USD

#### 7. PayPal Sandbox Test Accounts

Tạo test account tại: https://developer.paypal.com/dashboard/accounts/sandbox

**Personal Account (Buyer):**

- Email: sb-buyer@personal.example.com
- Password: 12345678

**Business Account (Seller):**

- Email: sb-seller@business.example.com
- Password: 12345678

#### 8. Debug Steps

1. **Mở 2 terminals:**

   ```bash
   # Terminal 1: Backend
   cd touring-be && npm run dev

   # Terminal 2: Frontend
   cd touring-fe && npm run dev
   ```

2. **Mở DevTools (F12) → Network tab**

3. **Thử thanh toán PayPal**

4. **Kiểm tra requests:**

   - `POST /api/paypal/create-order` → Status 200?
   - Response có `orderID`?

5. **Nếu redirect về PayPal:**

   - URL có dạng: `https://www.sandbox.paypal.com/checkoutnow?token=EC-...`
   - Login bằng sandbox account
   - Hoàn tất payment
   - Redirect về: `http://localhost:5173/payment/callback?token=EC-...`

6. **Kiểm tra callback:**
   - `POST /api/paypal/capture` → Status 200?
   - Booking được tạo?

#### 9. Logs quan trọng

**Backend logs cần có:**

```
✅ Connected to agency DB
✅ Connected to main DB
✅ MongoDB connected
🚀 API listening on http://localhost:4000
[Boot] PayPal env present: { hasClient: true, hasSecret: true, mode: 'sandbox' }
```

**Frontend console cần có:**

```
📦 Sending payment request: {mode: "cart", ...}
✅ Order created, redirecting to PayPal: EC-12345
```

---

## 🔧 Quick Fixes

### Fix 1: Restart backend sau khi sửa .env

```bash
cd touring-be
# Kill process
lsof -ti:4000 | xargs kill -9
# Restart
npm run dev
```

### Fix 2: Clear browser cache

- Hard refresh: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)
- Clear cookies cho localhost

### Fix 3: Kiểm tra JWT token

```javascript
// Frontend console
localStorage.getItem("token");
// Hoặc
sessionStorage.getItem("token");
```

### Fix 4: Test với Postman/Thunder Client

Import collection từ file hoặc tạo request:

```
POST http://localhost:4000/api/paypal/create-order
Headers:
  Content-Type: application/json
  Authorization: Bearer YOUR_JWT_TOKEN
Body:
{
  "mode": "cart"
}
```

---

## 📞 Support

Nếu vẫn lỗi, gửi:

1. Backend logs (đoạn có error)
2. Frontend console logs
3. Network tab screenshot (request failed)
4. File `.env` (che credentials)
