# 💰 Hệ Thống Xử Lý Refund Tự Động

## Tổng Quan

Hệ thống refund tích hợp với payment gateways để **tự động hoàn tiền** cho khách hàng qua cùng phương thức thanh toán ban đầu.

## 🔄 Luồng Hoạt Động

### 1. **User Request Refund**

- User gửi yêu cầu refund (pre-trip hoặc post-trip)
- Hệ thống tính toán số tiền hoàn dựa trên policy
- Status: `pending`

### 2. **Admin Review**

- Admin xem xét yêu cầu
- Có thể điều chỉnh số tiền hoàn (`adjustedAmount`)
- Approve → Status: `approved`
- Reject → Status: `rejected`

### 3. **Admin Process** ⭐ TỰ ĐỘNG HOÀN TIỀN

- Admin click "Process Refund"
- Hệ thống tự động:
  1. Kiểm tra payment method gốc (MoMo/PayPal/Manual)
  2. Gọi API refund của payment gateway
  3. Chuyển tiền về tài khoản user

**3 Trường hợp:**

#### a) **MoMo Refund** (Tự động)

```javascript
// Gọi MoMo Refund API
POST https://test-payment.momo.vn/v2/gateway/api/refund
{
  orderId: "ORDER123",
  transId: "TRANS123",  // từ payment gốc
  amount: 3738798,
  description: "Hoàn tiền đặt tour"
}

// ✅ Kết quả: Tiền tự động về ví MoMo của khách
```

#### b) **PayPal Refund** (Tự động)

```javascript
// Gọi PayPal Refund API
POST https://api-m.paypal.com/v2/payments/captures/{capture-id}/refund
{
  amount: {
    value: "145.92",  // Converted từ VND
    currency_code: "USD"
  }
}

// ✅ Kết quả: Tiền tự động về PayPal account của khách
```

#### c) **Manual Refund** (Chuyển khoản)

```javascript
// Nếu không phải MoMo/PayPal
// → requiresManualProcessing: true
// Admin phải chuyển khoản thủ công

Thông tin cần:
- Bank Details (từ user profile hoặc nhập khi request)
- Account Number
- Account Holder Name
```

### 4. **Completion**

- Nếu auto-refund thành công → Status: `completed`
- Booking status → `refunded`
- User nhận notification

---

## 📁 File Structure

```
touring-be/
├── services/
│   └── refundService.js          # ⭐ REFUND LOGIC
├── controller/
│   └── refundController.js       # Process refund endpoint
└── models/
    └── Refund.js                 # Refund schema
```

---

## 🔧 Environment Variables Required

```env
# MoMo Configuration
MOMO_PARTNER_CODE=MOMO
MOMO_ACCESS_KEY=your_access_key
MOMO_SECRET_KEY=your_secret_key
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api

# PayPal Configuration
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com

# Exchange Rate
FX_VND_USD=0.000039
```

---

## 📊 Refund Data Flow

```javascript
// Booking Payment Data (saved when user pays)
{
  payment: {
    provider: "momo",           // hoặc "paypal"
    orderId: "ORDER123",
    transactionId: "TRANS123",  // ⭐ CẦN THIẾT ĐỂ REFUND
    status: "completed",
    paidAt: "2025-11-12T10:00:00Z"
  }
}

// Refund Process
processRefund(booking, refundAmount) {
  if (booking.payment.provider === "momo") {
    → processMoMoRefund({
        orderId: booking.payment.orderId,
        transId: booking.payment.transactionId,
        amount: refundAmount
      })
  }

  if (booking.payment.provider === "paypal") {
    → processPayPalRefund({
        captureId: booking.payment.transactionId,
        amount: convertToUSD(refundAmount)
      })
  }
}

// Refund Result
{
  success: true,
  transactionId: "REF-TRANS123",  // Refund transaction ID
  refundId: "REFUND-1699999999",
  provider: "momo",
  message: "Refund completed"
}
```

---

## ✅ Testing Checklist

### MoMo Refund Test

- [ ] Create booking với MoMo
- [ ] Request refund
- [ ] Admin approve
- [ ] Admin process → Check MoMo API được gọi
- [ ] Verify tiền về ví MoMo test

### PayPal Refund Test

- [ ] Create booking với PayPal
- [ ] Request refund
- [ ] Admin approve
- [ ] Admin process → Check PayPal API được gọi
- [ ] Verify tiền về PayPal sandbox account

### Manual Refund Test

- [ ] Create booking với payment method khác
- [ ] Request refund
- [ ] Admin process → Should return `requiresManualProcessing: true`
- [ ] Admin manually transfer money

---

## 🚨 Error Handling

### Nếu Auto-Refund Fails:

```javascript
// Refund vẫn ở status "processing"
{
  status: "processing",
  processingNote: "Auto-refund failed: Missing transactionId",
  requiresManualProcessing: true
}

// Admin cần:
1. Check lỗi trong timeline
2. Xử lý manual (chuyển khoản)
3. Nhập Transaction ID
4. Manually update status → "completed"
```

---

## 📝 API Endpoints

### Process Refund

```http
POST /api/admin/refunds/:id/process
Authorization: Bearer {admin_token}

Request:
{
  "refundMethod": "original_payment",
  "transactionId": "MANUAL-TRANS-123",  // Optional, for manual refunds
  "bankDetails": {                       // Optional
    "bankName": "Vietcombank",
    "accountNumber": "1234567890",
    "accountHolder": "NGUYEN VAN A"
  },
  "note": "Processing refund via MoMo"
}

Response (Success):
{
  "success": true,
  "message": "Refund processed successfully via payment gateway",
  "data": { /* refund object */ },
  "refundResult": {
    "success": true,
    "transactionId": "REF-123456",
    "provider": "momo"
  }
}

Response (Manual Required):
{
  "success": false,
  "message": "Automatic refund failed. Please process manually.",
  "requiresManualProcessing": true,
  "error": "Missing payment transaction ID"
}
```

---

## 💡 Best Practices

1. **Always save payment transactionId** when user pays
2. **Test refunds in sandbox** before production
3. **Monitor refund failures** và xử lý manual kịp thời
4. **Send notifications** to users when refund completes
5. **Keep audit trail** trong timeline

---

## 🔐 Security

- MoMo/PayPal credentials stored in environment variables
- Signature verification for MoMo requests
- OAuth for PayPal API access
- Admin authentication required for processing

---

## 📞 Support

Nếu gặp vấn đề:

1. Check logs: `console.log` trong `refundService.js`
2. Verify payment data có đầy đủ không
3. Test API trực tiếp với Postman
4. Contact payment gateway support nếu API fails
