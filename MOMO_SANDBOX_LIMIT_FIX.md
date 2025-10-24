# 🔧 MoMo Test Account Limit Fix

## ⚠️ VẤN ĐỀ

**MoMo Test Environment** có giới hạn:
- **Tài khoản test: Tối đa 10,000,000 VNĐ** (10 triệu) mỗi giao dịch
- **Sandbox quick test: Khuyến nghị 50,000 VNĐ** cho testing nhanh
- Nếu `amount > 10,000,000` → Giao dịch bị từ chối bởi MoMo

## ✅ GIẢI PHÁP ĐÃ ÁP DỤNG

### **Code Update: `touring-be/controller/payment.controller.js`**

Đã thêm logic tự động cap amount dựa trên môi trường:

```javascript
// ⚠️ MOMO TEST LIMIT: 10 triệu VNĐ max
const MOMO_TEST_LIMIT = process.env.MOMO_SANDBOX_MODE === 'true' 
  ? (Number(process.env.MOMO_MAX_AMOUNT) || 10000000)  // Default 10 triệu
  : Infinity;

const cappedAmount = Math.min(finalTotalVND, MOMO_TEST_LIMIT);
```

### **Cách sử dụng:**

#### **1. Development - Full Test (Đơn lớn đến 10 triệu):**
```bash
# touring-be/.env
MOMO_SANDBOX_MODE=true
MOMO_MAX_AMOUNT=10000000
```
- ✅ Có thể test đơn hàng lớn (đến 10 triệu)
- ✅ Giống môi trường thực tế hơn
- ⚠️ Cần tài khoản test MoMo có đủ số dư

#### **2. Development - Quick Test (Đơn nhỏ 50k):**
```bash
# touring-be/.env
MOMO_SANDBOX_MODE=true
MOMO_MAX_AMOUNT=50000
```
- ✅ Test nhanh với số tiền nhỏ
- ✅ Không cần lo về số dư test wallet
- ✅ Đủ để verify flow thanh toán

#### **3. Production (Real MoMo):**
```bash
# touring-be/.env
MOMO_SANDBOX_MODE=false
# MOMO_MAX_AMOUNT không cần set
```
- ✅ Không giới hạn amount
- ✅ Charge đúng số tiền thực tế khách hàng
- ✅ Sử dụng production credentials

---

## 📝 ENV VARIABLES CHO MOMO

Thêm vào file `touring-be/.env`:

```bash
# ========== MOMO PAYMENT ==========

# Sandbox Mode (true = test environment, false = production)
MOMO_SANDBOX_MODE=true

# Max Amount for Test Environment
# - 10000000 (10 triệu): Test đơn hàng lớn như thực tế
# - 50000 (50k): Quick test với số tiền nhỏ
# - Không set: Default = 10,000,000 VNĐ
MOMO_MAX_AMOUNT=10000000

# MoMo Credentials (Sandbox)
MOMO_PARTNER_CODE=MOMO
MOMO_ACCESS_KEY=F8BBA842ECF85
MOMO_SECRET_KEY=K951B6PE1waDMi640xX08PD3vg6EkVlz
MOMO_CREATE_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create

# Optional: Custom redirect & IPN URLs
# MOMO_REDIRECT_URL=http://localhost:5173/payment/callback
# MOMO_IPN_URL=http://localhost:4000/api/payments/momo/ipn
```

---

## 🧪 TEST SCENARIOS

### **Scenario 1: Đơn nhỏ (< 10 triệu)**
```
Tour price: 500,000 VNĐ
MOMO_SANDBOX_MODE=true
MOMO_MAX_AMOUNT=10000000

Expected: ✅ Thanh toán thành công với 500,000 VNĐ
Console: "💰 MoMo Price calculation: { finalTotal: 500000, cappedForTest: 500000 }"
```

### **Scenario 2: Đơn lớn (> 10 triệu) - Tự động cap**
```
Tour price: 15,000,000 VNĐ
MOMO_SANDBOX_MODE=true
MOMO_MAX_AMOUNT=10000000

Expected: ⚠️ Amount capped về 10,000,000 VNĐ
Console: 
  "⚠️ MoMo Test Limit: Amount capped from 15,000,000 to 10,000,000 VNĐ"
  "   Reason: MoMo test wallet limit is 10,000,000 VNĐ"
Result: ✅ Thanh toán thành công với 10,000,000 VNĐ
```

### **Scenario 3: Quick Test với 50k**
```
Tour price: 15,000,000 VNĐ
MOMO_SANDBOX_MODE=true
MOMO_MAX_AMOUNT=50000

Expected: Amount capped về 50,000 VNĐ
Result: ✅ Test nhanh không cần lo số dư
```

### **Scenario 4: Production - Không giới hạn**
```
Tour price: 50,000,000 VNĐ
MOMO_SANDBOX_MODE=false

Expected: ✅ Charge đúng 50,000,000 VNĐ (real money)
```

---

## � TẠI SAO MOMO GIỚI HẠN 10 TRIỆU?

### **MoMo Test Wallet Limits:**

| Account Type | Max Per Transaction | Purpose |
|-------------|---------------------|---------|
| **Test Wallet** | 10,000,000 VNĐ | Development & Testing |
| **Sandbox API** | 50,000 VNĐ | Quick API testing |
| **Production** | Không giới hạn | Real transactions |

### **Giải thích:**

1. **Test Wallet (10 triệu):**
   - Tài khoản MoMo test của developer
   - Có số dư ảo tối đa 10 triệu
   - Dùng để test flow như thực tế
   - **Không thể nạp thêm tiền**

2. **Sandbox API (50k):**
   - Môi trường test nhanh không cần tài khoản
   - Chỉ verify API integration
   - Không thực sự charge tiền

3. **Production:**
   - Tài khoản MoMo thật của khách hàng
   - Không giới hạn (tùy số dư khách)

---

## 💡 GIẢI PHÁP CHO CÁC TRƯỜNG HỢP

### **Case 1: Đơn hàng > 10 triệu trong development**

**Option A: Tự động cap (Recommended)**
```bash
MOMO_SANDBOX_MODE=true
MOMO_MAX_AMOUNT=10000000
```
- ✅ Backend tự động giới hạn ở 10 triệu
- ✅ Test được flow thanh toán
- ✅ Khách thấy warning: "Đơn hàng test giới hạn 10 triệu"

**Option B: Split payment simulation**
```javascript
// Nếu cần test đơn 50 triệu → chia 5 lần x 10 triệu
// (Chỉ development, không áp dụng production)
```

**Option C: Mock mode**
```bash
MOMO_MOCK_MODE=true
# Không call MoMo API thật, chỉ simulate response
```

### **Case 2: Quick development testing**
```bash
MOMO_MAX_AMOUNT=50000
# Test nhanh với 50k, không cần lo số dư
```

### **Case 3: Production deployment**
```bash
MOMO_SANDBOX_MODE=false
# Không giới hạn, charge thật tiền khách hàng
```

---

## 🚀 DEPLOYMENT CHECKLIST

### **Khi deploy Production:**

- [ ] Set `MOMO_SANDBOX_MODE=false` trong .env production
- [ ] Update MoMo credentials với **production keys** (không phải sandbox)
- [ ] Update `MOMO_CREATE_ENDPOINT` sang production URL
- [ ] Test với real MoMo account trước khi go live
- [ ] Set up monitoring cho failed transactions

### **Production URLs:**
```bash
# Production MoMo endpoint (thay vì test-payment)
MOMO_CREATE_ENDPOINT=https://payment.momo.vn/v2/gateway/api/create

# Production credentials (lấy từ MoMo Business Portal)
MOMO_PARTNER_CODE=<your_production_code>
MOMO_ACCESS_KEY=<your_production_key>
MOMO_SECRET_KEY=<your_production_secret>
```

---

## 📊 CONSOLE LOGS

### **Khi đơn < 10 triệu:**
```
💰 MoMo Price calculation: {
  originalTotal: 5000000,
  discountAmount: 500000,
  finalTotal: 4500000,
  cappedForTest: 4500000,      // ⬅️ Không bị cap
  testLimit: 10000000
}
```

### **Khi đơn > 10 triệu (auto cap):**
```
⚠️ MoMo Test Limit: Amount capped from 15,000,000 to 10,000,000 VNĐ
   Reason: MoMo test wallet limit is 10,000,000 VNĐ

💰 MoMo Price calculation: {
  originalTotal: 15000000,
  discountAmount: 0,
  finalTotal: 15000000,
  cappedForTest: 10000000,     // ⬅️ Đã cap!
  testLimit: 10000000
}
```

---

## ⚡ QUICK FIX - RESTART BACKEND

```bash
cd touring-be

# Option 1: Test với 10 triệu (giống thực tế)
echo "MOMO_SANDBOX_MODE=true" >> .env
echo "MOMO_MAX_AMOUNT=10000000" >> .env

# Option 2: Test nhanh với 50k
echo "MOMO_SANDBOX_MODE=true" >> .env
echo "MOMO_MAX_AMOUNT=50000" >> .env

# Restart
npm run dev
```

Giờ:
- ✅ Đơn < 10 triệu: Thanh toán bình thường
- ✅ Đơn > 10 triệu: Tự động cap về 10 triệu (hoặc 50k nếu quick test)
- ✅ Console log rõ ràng lý do cap
- ✅ Production: Không giới hạn

---

## 🚀 PRODUCTION DEPLOYMENT CHECKLIST

Khi deploy lên production với **MoMo thật**:
