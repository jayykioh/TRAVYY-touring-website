# Bank Information Requirement for Refunds

## Overview

Khi refund request được admin approve, user bắt buộc phải cung cấp thông tin tài khoản ngân hàng để nhận tiền hoàn.

## Workflow

### 1. **User Request Refund**

```
User submits refund → Status: pending
```

### 2. **Admin Reviews & Approves**

```
Admin approves → Status: approved
```

### 3. **User Provides Bank Info** ⭐ NEW

```
User sees alert: "Cần cung cấp thông tin ngân hàng"
User clicks button → Opens BankInfoModal
User fills in:
  - Bank Name (dropdown with Vietnamese banks)
  - Account Number (9-14 digits)
  - Account Name (uppercase)
  - Branch Name (optional)
User submits → bankInfo saved to refund
```

### 4. **Admin Processes Refund**

```
Admin sees bank info in Process Modal
Admin transfers money → Status: processing
System auto-refunds or manual → Status: completed
```

## API Endpoints

### POST /api/refunds/:id/bank-info

**Authorization:** Bearer Token (User)  
**Purpose:** Submit bank account information for approved refund

**Request Body:**

```json
{
  "bankName": "Vietcombank - Ngân hàng Ngoại thương Việt Nam",
  "accountNumber": "1234567890123",
  "accountName": "NGUYEN VAN A",
  "branchName": "Chi nhánh Hà Nội" // optional
}
```

**Response:**

```json
{
  "success": true,
  "message": "Bank information submitted successfully",
  "data": {
    "_id": "...",
    "status": "approved",
    "bankInfo": {
      "bankName": "Vietcombank - Ngân hàng Ngoại thương Việt Nam",
      "accountNumber": "1234567890123",
      "accountName": "NGUYEN VAN A",
      "branchName": "Chi nhánh Hà Nội",
      "providedAt": "2025-11-12T14:30:00.000Z"
    }
  }
}
```

**Validation:**

- Only works for refunds with `status === "approved"`
- Account number must be 9-14 digits
- Bank name, account number, account name are required
- Branch name is optional

## Database Schema

### Refund Model Addition

```javascript
bankInfo: {
  bankName: { type: String },        // Tên ngân hàng
  accountNumber: { type: String },   // Số tài khoản
  accountName: { type: String },     // Tên chủ tài khoản
  branchName: { type: String },      // Chi nhánh (optional)
  providedAt: { type: Date },        // Thời điểm cung cấp
}
```

## Frontend Components

### 1. BankInfoModal.jsx

**Location:** `touring-fe/src/components/BankInfoModal.jsx`

**Features:**

- Dropdown với 20+ ngân hàng Việt Nam phổ biến
- Validation số tài khoản (9-14 chữ số)
- Tên chủ TK tự động uppercase
- Security warning về bảo mật thông tin

**Props:**

```jsx
<BankInfoModal
  isOpen={boolean}
  onClose={function}
  refundId={string}
  onSuccess={function}
/>
```

### 2. RefundCard.jsx - Updated

**New Props:** `onProvideBankInfo`

**New Feature:** Orange alert box khi `status === 'approved'` và chưa có `bankInfo`

```jsx
{
  needsBankInfo && (
    <div className="bg-orange-100 ...">
      <button onClick={() => onProvideBankInfo(refund._id)}>
        📝 Cung Cấp Thông Tin Ngân Hàng
      </button>
    </div>
  );
}
```

### 3. UserRefundList.jsx - Updated

**New State:**

- `showBankInfoModal`
- `bankInfoRefundId`

**New Functions:**

- `handleProvideBankInfo()` - Opens modal
- `handleBankInfoSuccess()` - Reload after submit

### 4. RefundManagement.jsx (Admin) - Updated

**Process Modal Enhancement:**

- Display bank info (green box) if provided
- Warning (yellow box) if not yet provided
- Admin can see full bank details when processing

## User Experience

### Before Approval

User sees normal refund card with status badges.

### After Approval (No Bank Info)

```
╔════════════════════════════════════════╗
║ ⚠️ Cần cung cấp thông tin ngân hàng    ║
║                                        ║
║ Yêu cầu hoàn tiền đã được chấp nhận!  ║
║ Vui lòng cung cấp thông tin tài khoản ║
║ ngân hàng để nhận tiền.                ║
║                                        ║
║ [📝 Cung Cấp Thông Tin Ngân Hàng]     ║
╚════════════════════════════════════════╝
```

### After Providing Bank Info

Alert disappears, waiting for admin to process.

## Admin Experience

### When Processing Refund

```
╔═══════════════════════════════════════╗
║ ✅ Thông Tin Tài Khoản Nhận Tiền      ║
║                                       ║
║ Ngân hàng: Vietcombank               ║
║ Số tài khoản: 1234567890123          ║
║ Tên chủ TK: NGUYEN VAN A             ║
║ Chi nhánh: Chi nhánh Hà Nội          ║
║                                       ║
║ Cung cấp lúc: 12/11/2025 14:30       ║
╚═══════════════════════════════════════╝
```

If no bank info:

```
╔═══════════════════════════════════════╗
║ ⚠️ Chưa có thông tin tài khoản        ║
║                                       ║
║ Khách hàng chưa cung cấp thông tin   ║
║ ngân hàng. Bạn có thể xử lý thủ công ║
║ hoặc đợi khách hàng cập nhật.        ║
╚═══════════════════════════════════════╝
```

## Security Notes

### For Users

- ⚠️ Chỉ cung cấp thông tin tài khoản thật của bạn
- ⚠️ Không chia sẻ mã PIN hoặc mật khẩu ngân hàng
- ✅ Kiểm tra kỹ thông tin trước khi gửi

### For Admins

- Bank info is sensitive data
- Only visible to admin users
- Verify account name matches booking user
- Keep transaction records for audit

## Testing

### Test Case 1: Happy Path

1. User requests refund → pending
2. Admin approves → approved
3. User clicks "Cung Cấp Thông Tin Ngân Hàng"
4. User fills form and submits
5. Backend saves bankInfo
6. Admin sees bank info in Process Modal
7. Admin processes refund → completed

### Test Case 2: Validation

1. Try submitting with missing fields → Error
2. Try invalid account number (non-numeric) → Error
3. Try account number < 9 digits → Error
4. Try submitting for non-approved refund → 400 error

### Test Case 3: Security

1. User A tries to submit bank info for User B's refund → 403
2. Bank info only visible to admins

## Benefits

✅ **Clear Process:** User knows exactly what to do after approval  
✅ **Accurate Info:** User provides their own bank details  
✅ **Admin Convenience:** All info ready when processing  
✅ **Audit Trail:** Timeline records when bank info was provided  
✅ **Security:** Sensitive data handled properly

## Next Steps (Optional Enhancements)

1. **Email Notification:** Send email when refund approved, asking for bank info
2. **Edit Bank Info:** Allow user to update bank info if wrong
3. **Bank Verification:** Integration with bank API to verify account exists
4. **Multiple Accounts:** Allow user to save multiple bank accounts for future
5. **Reminder:** Auto-remind user after 24h if bank info not provided
