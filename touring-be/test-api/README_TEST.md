# 🧪 Test Suite - Travyy Tourism Backend

## Giới Thiệu

Bộ test toàn diện cho hệ thống backend Travyy Tourism, bao gồm:

- ✅ API bên ngoài (MoMo, PayPal, Google OAuth, Facebook OAuth)
- ✅ Các tính năng nghiệp vụ quan trọng
- ✅ Bảo mật và authentication
- ✅ Thanh toán và booking flow

## 📊 Test Coverage

```
Total Test Suites: 11
Total Test Cases: 100+
```

### Modules Tested:

- **Authentication** (auth.api.test.js) - 10+ test cases
- **MoMo Payment** (momo.api.test.js) - 15+ test cases
- **PayPal Payment** (paypal.api.test.js) - 20+ test cases
- **OAuth** (oauth.api.test.js) - 12+ test cases
- **Critical Features** (features.api.test.js) - 40+ test cases
- **Cart** (cart.api.test.js) - Existing
- **Profile** (profile.api.test.js) - Existing
- **Review** (review.api.test.js) - Existing
- **Tour** (tour.api.test.js) - Existing
- **Wishlist** (wishlist.api.test.js) - Existing

## 🚀 Quick Start

### 1. Cài Đặt Dependencies

```bash
cd touring-be
npm install
```

### 2. Cấu Hình Environment Variables

Copy `.env.example` to `.env` và điền thông tin:

```env
# Test Database
MONGO_URI=mongodb://localhost:27017/travyy_test

# MoMo Sandbox
MOMO_PARTNER_CODE=MOMO
MOMO_ACCESS_KEY=F8BBA842ECF85
MOMO_SECRET_KEY=K951B6PE1waDMi640xX08PD3vg6EkVlz

# PayPal Sandbox
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_SECRET=your_sandbox_secret

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
FACEBOOK_APP_ID=your_facebook_app_id
```

### 3. Chạy Tests

```bash
# Chạy tất cả tests
npm test

# Chạy test cụ thể
npm test -- momo.api.test.js
npm test -- paypal.api.test.js
npm test -- oauth.api.test.js
npm test -- features.api.test.js

# Chạy với coverage
npm run test:coverage

# Watch mode (tự động chạy lại khi code thay đổi)
npm run test:watch
```

## 📁 Cấu Trúc Test Files

```
test-api/
├── auth.api.test.js              # Authentication & Security
├── momo.api.test.js              # MoMo Sandbox Integration
├── paypal.api.test.js            # PayPal Payment Integration
├── oauth.api.test.js             # Google & Facebook OAuth
├── features.api.test.js          # Critical Business Features
│   ├── Tour Management
│   ├── Booking System
│   ├── Promotion/Voucher
│   ├── Shopping Cart
│   ├── Seat Management
│   └── Notifications
├── cart.api.test.js              # Shopping Cart Tests
├── payment.api.test.js           # Payment Integration Tests
├── profile.api.test.js           # User Profile Tests
├── review.api.test.js            # Review System Tests
├── tour.api.test.js              # Tour Management Tests
├── wishlist.api.test.js          # Wishlist Tests
├── TEST_DOCUMENTATION.md         # Chi tiết test documentation
└── README_TEST.md                # File này
```

## 🎯 Test Categories

### 1. External API Integration Tests

#### MoMo Sandbox (`momo.api.test.js`)

```bash
npm test -- momo.api.test.js
```

- ✅ Payment creation (cart & buy-now)
- ✅ IPN callback handling
- ✅ Amount validation (10M VND limit)
- ✅ Signature verification
- ✅ Session status polling
- ✅ Seat hold/release logic
- ✅ Discount application

**Key Points:**

- Sandbox có giới hạn 10,000,000 VND
- IPN signature phải chính xác
- Seats hold 1 phút, auto-release nếu timeout

#### PayPal (`paypal.api.test.js`)

```bash
npm test -- paypal.api.test.js
```

- ✅ Order creation
- ✅ VND to USD conversion
- ✅ Amount breakdown validation
- ✅ Capture flow
- ✅ Session persistence
- ✅ Passenger details tracking

**Key Points:**

- PayPal yêu cầu USD (2 decimals)
- Breakdown: `amount = item_total - discount`
- Capture phải idempotent

#### OAuth (`oauth.api.test.js`)

```bash
npm test -- oauth.api.test.js
```

- ✅ Google OAuth flow
- ✅ Facebook OAuth flow
- ✅ User creation & linking
- ✅ Password management for OAuth users
- ✅ Welcome email tracking
- ✅ Security validations

**Key Points:**

- OAuth users không có password
- Account linking với existing email
- Welcome email chỉ cho new users

### 2. Business Features Tests

#### Critical Features (`features.api.test.js`)

```bash
npm test -- features.api.test.js
```

**Tour Management:**

- Create, read, update tour
- Availability tracking
- Tour listing

**Booking System:**

- Create booking
- Status updates (pending → paid → cancelled)
- Booking history

**Promotion System:**

- Create promotions
- Validate codes
- Calculate discounts (percentage & fixed)
- Track usage
- Check expiry & limits

**Shopping Cart:**

- Add/remove items
- Update quantities
- Calculate totals

**Seat Management:**

- Check availability
- Update after booking
- Handle concurrent bookings

**Notifications:**

- Booking confirmation
- Payment success

**Security:**

- Authentication
- JWT validation
- Role-based access control

## 📊 Test Results Example

```
PASS  test-api/auth.api.test.js
  Auth API
    ✓ should register a new user (234ms)
    ✓ should login with correct credentials (123ms)
    ✓ should not login if user is banned/inactive (145ms)

PASS  test-api/momo.api.test.js
  MoMo Payment Integration Tests
    [TC-MOMO-01] Create MoMo Payment - Cart Mode
      ✓ should create MoMo payment session from cart (456ms)
    [TC-MOMO-02] Create MoMo Payment - Buy Now Mode
      ✓ should create MoMo payment session for buy-now (389ms)
    ...

PASS  test-api/paypal.api.test.js
  PayPal Payment Integration Tests
    [TC-PAYPAL-01] PayPal Config Endpoint
      ✓ should return PayPal client configuration (98ms)
    ...

Test Suites: 11 passed, 11 total
Tests:       102 passed, 102 total
Snapshots:   0 total
Time:        45.678 s
```

## 🐛 Debugging

### Enable Verbose Logging

```bash
DEBUG=* npm test
```

### Run Single Test

```bash
npm test -- --testNamePattern="should create MoMo payment"
```

### Increase Timeout

```javascript
// In test file
jest.setTimeout(30000); // 30 seconds
```

### Check Database State

```javascript
// Add in test
const session = await PaymentSession.findOne({ orderId });
console.log("Session:", JSON.stringify(session, null, 2));
```

## ✅ Pre-Deployment Checklist

- [ ] All tests passing (`npm test`)
- [ ] Coverage >= 80% (`npm run test:coverage`)
- [ ] No failing tests in CI/CD
- [ ] Environment variables configured
- [ ] Test data cleanup working
- [ ] External API credentials valid
- [ ] Database migrations applied

## 🔍 Common Issues

### Issue: Tests timeout

**Solution:**

```javascript
jest.setTimeout(30000);
```

### Issue: MoMo signature mismatch

**Solution:**

- Check field order in signature calculation
- Ensure secretKey is correct
- Verify all required fields are present

### Issue: PayPal order creation fails

**Solution:**

- Check credentials (clientId, secret)
- Verify amount format (2 decimals)
- Check breakdown matches total

### Issue: OAuth tests fail

**Solution:**

- Check if OAuth credentials are configured
- Mock external OAuth calls if needed
- Skip OAuth tests in CI if credentials not available

### Issue: Database connection errors

**Solution:**

```bash
# Start MongoDB
mongod --dbpath /path/to/test/db

# Or use MongoDB Atlas test cluster
MONGO_URI=mongodb+srv://test:password@cluster.mongodb.net/test
```

## 📈 Coverage Report

Run coverage:

```bash
npm run test:coverage
```

View coverage report:

```bash
open coverage/lcov-report/index.html
```

## 🎓 Writing New Tests

### Template:

```javascript
describe("[MODULE] Feature Group", () => {
  let authToken;
  let testData;

  beforeAll(async () => {
    // Setup: create test users, data, etc.
  });

  afterAll(async () => {
    // Cleanup: delete test data
  });

  describe("[TC-XXX-01] Specific Feature", () => {
    it("should do something expected", async () => {
      const response = await request(app)
        .post("/api/endpoint")
        .set("Authorization", `Bearer ${authToken}`)
        .send(testData)
        .expect("Content-Type", /json/);

      expect([200, 201]).toContain(response.statusCode);
      expect(response.body).toHaveProperty("expectedField");
    });
  });
});
```

### Best Practices:

1. **Isolation:** Mỗi test độc lập
2. **Cleanup:** Xóa test data sau khi chạy
3. **Unique IDs:** Dùng timestamps để tránh conflict
4. **Clear naming:** Test name mô tả rõ ràng
5. **Error cases:** Test cả success và failure scenarios

## 📞 Support

Nếu gặp vấn đề:

1. Đọc `TEST_DOCUMENTATION.md`
2. Check logs và error messages
3. Verify environment variables
4. Contact dev team

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

### GitLab CI

```yaml
test:
  stage: test
  script:
    - npm install
    - npm test
  coverage: '/Coverage: \d+\.\d+/'
```

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MoMo API Docs](https://developers.momo.vn/)
- [PayPal API Docs](https://developer.paypal.com/)
- [Google OAuth Docs](https://developers.google.com/identity/protocols/oauth2)
- [Facebook OAuth Docs](https://developers.facebook.com/docs/facebook-login)

---

**Last Updated:** November 2025  
**Version:** 1.0  
**Maintainer:** Dev Team
