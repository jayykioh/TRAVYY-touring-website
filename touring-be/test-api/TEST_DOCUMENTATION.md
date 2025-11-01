# 📋 Tài Liệu Test API - Hệ Thống Travyy Tourism

## 📊 Tổng Quan

Bộ test này được thiết kế để kiểm tra toàn diện các API bên ngoài và tính năng quan trọng của hệ thống kết nối Travel Agency - User.

### 🎯 Mục Tiêu Test

1. **Tích hợp API bên ngoài**

   - MoMo Sandbox Payment
   - PayPal Payment
   - Google OAuth 2.0
   - Facebook OAuth

2. **Tính năng nghiệp vụ quan trọng**

   - Quản lý Tour
   - Hệ thống Booking
   - Giỏ hàng (Cart)
   - Khuyến mãi/Voucher
   - Quản lý ghế
   - Thông báo

3. **Bảo mật**
   - Authentication
   - Authorization
   - JWT Token Management

---

## 📁 Cấu Trúc File Test

```
touring-be/test-api/
├── auth.api.test.js          # Test đăng ký, đăng nhập, bảo mật tài khoản
├── momo.api.test.js          # Test tích hợp MoMo Sandbox
├── paypal.api.test.js        # Test tích hợp PayPal
├── oauth.api.test.js         # Test Google & Facebook OAuth
├── features.api.test.js      # Test các tính năng nghiệp vụ
├── cart.api.test.js          # Test giỏ hàng (đã có)
├── payment.api.test.js       # Test thanh toán (đã có)
├── profile.api.test.js       # Test profile (đã có)
├── review.api.test.js        # Test đánh giá (đã có)
├── tour.api.test.js          # Test tour (đã có)
├── wishlist.api.test.js      # Test wishlist (đã có)
└── TEST_DOCUMENTATION.md     # File này
```

---

## 🧪 Chi Tiết Test Cases

### 1. MoMo Sandbox Integration (`momo.api.test.js`)

#### **Test Cases:**

| Test ID    | Mô tả                         | Kiểm tra                                         |
| ---------- | ----------------------------- | ------------------------------------------------ |
| TC-MOMO-01 | Tạo thanh toán từ giỏ hàng    | Endpoint `/api/payments/momo` với mode "cart"    |
| TC-MOMO-02 | Tạo thanh toán mua ngay       | Endpoint `/api/payments/momo` với mode "buy-now" |
| TC-MOMO-03 | Xác thực giới hạn số tiền     | Kiểm tra giới hạn 10M VND của sandbox            |
| TC-MOMO-04 | Xử lý IPN callback            | Test signature validation và cập nhật trạng thái |
| TC-MOMO-05 | Polling trạng thái thanh toán | Endpoint `/api/payments/momo/session/:orderId`   |
| TC-MOMO-06 | Giữ chỗ và giải phóng ghế     | Kiểm tra logic hold/release seats                |
| TC-MOMO-07 | Áp dụng voucher               | Tính toán discount trong payment                 |
| TC-MOMO-08 | Xử lý lỗi                     | Missing auth, invalid tour ID, etc.              |

#### **Điểm Quan Trọng:**

- MoMo Sandbox có giới hạn 10,000,000 VND/giao dịch
- Signature phải được tính chính xác theo thứ tự fields
- IPN callback phải idempotent (không xử lý trùng)
- Ghế phải được hold trong 1 phút và tự động release nếu timeout

---

### 2. PayPal Integration (`paypal.api.test.js`)

#### **Test Cases:**

| Test ID      | Mô tả                  | Kiểm tra                           |
| ------------ | ---------------------- | ---------------------------------- |
| TC-PAYPAL-01 | Lấy config PayPal      | Client ID và currency              |
| TC-PAYPAL-02 | Tạo order từ cart      | Create PayPal order với cart items |
| TC-PAYPAL-03 | Tạo order buy-now      | Create PayPal order cho 1 tour     |
| TC-PAYPAL-04 | Chuyển đổi VND-USD     | FX rate accuracy                   |
| TC-PAYPAL-05 | Breakdown amount       | Items + discount validation        |
| TC-PAYPAL-06 | Capture order          | Xử lý capture sau approval         |
| TC-PAYPAL-07 | Lưu passenger details  | Lưu số người lớn/trẻ em            |
| TC-PAYPAL-08 | Xử lý lỗi              | Empty cart, invalid mode, etc.     |
| TC-PAYPAL-09 | Validation credentials | Missing PayPal credentials         |
| TC-PAYPAL-10 | Hold seats             | Giữ chỗ khi tạo order              |

#### **Điểm Quan Trọng:**

- PayPal yêu cầu USD với 2 chữ số thập phân
- Breakdown phải match: `amount.value = item_total - discount`
- Payment session phải được persist trước khi trả orderID
- Capture phải idempotent và atomic

---

### 3. OAuth Integration (`oauth.api.test.js`)

#### **Test Cases:**

| Test ID     | Mô tả                 | Kiểm tra                                |
| ----------- | --------------------- | --------------------------------------- |
| TC-OAUTH-01 | Google OAuth config   | Redirect endpoint `/api/auth/google`    |
| TC-OAUTH-02 | Facebook OAuth config | Redirect endpoint `/api/auth/facebook`  |
| TC-OAUTH-03 | Callback handling     | Google & Facebook callbacks             |
| TC-OAUTH-04 | User creation         | Tạo user mới với OAuth ID               |
| TC-OAUTH-05 | Account linking       | Link OAuth với existing email           |
| TC-OAUTH-06 | Password management   | Prevent password change cho OAuth users |
| TC-OAUTH-07 | Environment variables | Check required OAuth configs            |
| TC-OAUTH-08 | Security              | Không expose sensitive data             |
| TC-OAUTH-09 | Multiple providers    | Link cả Google và Facebook              |
| TC-OAUTH-10 | Session management    | JWT token generation                    |
| TC-OAUTH-11 | Error scenarios       | Invalid/expired codes                   |
| TC-OAUTH-12 | Welcome email         | Email cho new OAuth users               |

#### **Điểm Quan Trọng:**

- OAuth users không nên có password
- Email từ OAuth phải unique hoặc link với existing user
- Welcome email chỉ gửi cho truly new users
- Handle gracefully khi OAuth credentials missing

---

### 4. Critical Features (`features.api.test.js`)

#### **Tour Management (TC-TOUR-01)**

- ✅ Tạo tour mới
- ✅ Lấy chi tiết tour
- ✅ Cập nhật availability
- ✅ List tours

#### **Booking Management (TC-BOOKING-01)**

- ✅ Tạo booking
- ✅ Lấy danh sách bookings
- ✅ Cập nhật status (pending → paid)
- ✅ Hủy booking

#### **Promotion System (TC-PROMO-01)**

- ✅ Tạo promotion
- ✅ Validate promotion code
- ✅ Tính discount (percentage & fixed)
- ✅ Check expired promotions
- ✅ Validate minimum order value
- ✅ Track usage count
- ✅ Reject at usage limit

#### **Shopping Cart (TC-CART-01)**

- ✅ Add to cart
- ✅ Get cart items
- ✅ Update quantity
- ✅ Remove items
- ✅ Calculate total

#### **Seat Management (TC-SEAT-01)**

- ✅ Check availability
- ✅ Reject insufficient seats
- ✅ Update count after booking
- ✅ Handle concurrent bookings

#### **Notification System (TC-NOTIF-01)**

- ✅ Booking confirmation
- ✅ Payment success

#### **Security (TC-SECURITY-01)**

- ✅ Authentication required
- ✅ JWT validation
- ✅ Role-based access control

---

## 🚀 Chạy Tests

### Chạy tất cả tests:

```bash
npm test
```

### Chạy test cụ thể:

```bash
# Test MoMo
npm test -- momo.api.test.js

# Test PayPal
npm test -- paypal.api.test.js

# Test OAuth
npm test -- oauth.api.test.js

# Test Features
npm test -- features.api.test.js
```

### Chạy với coverage:

```bash
npm run test:coverage
```

### Watch mode:

```bash
npm run test:watch
```

---

## ⚙️ Cấu Hình Test Environment

### Required Environment Variables:

```env
# Database
MONGO_URI=mongodb://localhost:27017/travyy_test

# JWT
JWT_SECRET=your_jwt_secret
JWT_ACCESS_EXP=15m
JWT_REFRESH_EXP=30d

# MoMo Sandbox
MOMO_PARTNER_CODE=MOMO
MOMO_ACCESS_KEY=F8BBA842ECF85
MOMO_SECRET_KEY=K951B6PE1waDMi640xX08PD3vg6EkVlz
MOMO_CREATE_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_SANDBOX_MODE=true
MOMO_MAX_AMOUNT=10000000

# PayPal Sandbox
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_SECRET=your_sandbox_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback

# Facebook OAuth
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=http://localhost:4000/api/auth/facebook/callback

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

---

## 📊 Test Coverage Goals

| Module           | Target Coverage | Current Status |
| ---------------- | --------------- | -------------- |
| Auth             | 80%+            | ✅             |
| Payment (MoMo)   | 85%+            | ✅             |
| Payment (PayPal) | 85%+            | ✅             |
| OAuth            | 75%+            | ✅             |
| Booking          | 80%+            | ✅             |
| Tour             | 75%+            | ✅             |
| Cart             | 80%+            | ✅             |
| Promotion        | 85%+            | ✅             |

---

## 🐛 Debugging Tests

### Enable verbose logging:

```bash
DEBUG=* npm test
```

### Run single test:

```bash
npm test -- --testNamePattern="should create MoMo payment"
```

### Skip tests:

```javascript
describe.skip("Test suite to skip", () => {
  // Tests
});

it.skip("Test to skip", () => {
  // Test
});
```

---

## 📝 Best Practices

### 1. **Test Isolation**

- Mỗi test phải độc lập
- Cleanup data sau mỗi test suite
- Sử dụng unique identifiers (timestamps, etc.)

### 2. **Async/Await**

```javascript
it("should do something", async () => {
  const result = await someAsyncFunction();
  expect(result).toBeTruthy();
});
```

### 3. **Error Handling**

```javascript
it("should handle errors gracefully", async () => {
  const response = await request(app).post("/api/endpoint").send(invalidData);

  expect([400, 500]).toContain(response.statusCode);
  expect(response.body).toHaveProperty("error");
});
```

### 4. **Mock External APIs (Optional)**

```javascript
// Mock MoMo API calls for faster tests
jest.mock("node-fetch", () => jest.fn());
```

---

## 🔍 Common Issues & Solutions

### Issue 1: Tests timeout

**Solution:** Increase timeout

```javascript
jest.setTimeout(30000); // 30 seconds
```

### Issue 2: Database connection

**Solution:** Ensure MongoDB is running

```bash
mongod --dbpath /path/to/test/db
```

### Issue 3: OAuth tests fail

**Solution:** OAuth tests require real credentials or should be mocked

```javascript
if (!process.env.GOOGLE_CLIENT_ID) {
  console.warn("Skipping OAuth tests - credentials not configured");
  return;
}
```

### Issue 4: Payment tests fail in sandbox

**Solution:**

- Check sandbox credentials are valid
- MoMo: Use test amount < 10M VND
- PayPal: Cannot fully test without approval flow

---

## 📈 Continuous Integration

### GitHub Actions Example:

```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: "18"
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

---

## 🎓 Test Writing Guidelines

### Naming Convention:

```javascript
describe("[MODULE] Feature Group", () => {
  describe("[TC-XXX-YY] Specific Feature", () => {
    it("should describe expected behavior", async () => {
      // Test implementation
    });
  });
});
```

### Assertion Examples:

```javascript
// Status codes
expect([200, 201]).toContain(response.statusCode);

// Response structure
expect(response.body).toHaveProperty("payUrl");
expect(response.body.items).toHaveLength(3);

// Values
expect(amount).toBeGreaterThan(0);
expect(status).toBe("pending");
expect(Array.isArray(items)).toBe(true);
```

---

## 📞 Support

Nếu có vấn đề với tests:

1. Check logs: `console.log()` trong tests
2. Review test documentation này
3. Check environment variables
4. Verify database state
5. Contact dev team

---

## 🔄 Updates

**Version 1.0** - November 2025

- ✅ Initial test suite
- ✅ MoMo integration tests
- ✅ PayPal integration tests
- ✅ OAuth integration tests
- ✅ Critical features tests

**Planned:**

- [ ] Performance tests
- [ ] Load testing
- [ ] E2E tests with Cypress
- [ ] API documentation generation from tests

---

## ✅ Checklist Trước Khi Deploy

- [ ] Tất cả tests pass
- [ ] Coverage >= 80%
- [ ] No console.errors in tests
- [ ] Environment variables documented
- [ ] Test data cleanup working
- [ ] CI/CD pipeline configured
- [ ] OAuth credentials secured
- [ ] Payment sandbox keys valid

---

**Happy Testing! 🎉**
