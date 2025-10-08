# User Flow - Booking History Feature

## 🛣️ Luồng người dùng sau khi thanh toán

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  1️⃣  USER CHỌN TOUR VÀ THANH TOÁN                              │
│     ├─ Checkout Form                                           │
│     ├─ Nhấn "Thanh toán với PayPal"                           │
│     └─ Redirect đến PayPal                                     │
│                                                                 │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  2️⃣  PAYPAL PAYMENT                                             │
│     ├─ User đăng nhập PayPal                                   │
│     ├─ Xác nhận thanh toán                                     │
│     └─ PayPal redirect về: /payment-callback?token={orderID}  │
│                                                                 │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  3️⃣  PAYMENT CALLBACK PAGE                                      │
│     ├─ Hiển thị loading spinner                                │
│     ├─ Gọi POST /api/paypal/capture                            │
│     │  └─ Backend: Capture payment + Reduce seats + Save booking│
│     └─ Hiển thị SUCCESS UI:                                    │
│        ┌──────────────────────────────────────────┐            │
│        │  ✅ Thanh toán thành công!                │            │
│        │  Mã đặt chỗ: ABC123                      │            │
│        │                                          │            │
│        │  ┌────────────────────────────────────┐ │            │
│        │  │ 🎫 Xem vé của tôi                  │ │ ◄── NEW!   │
│        │  └────────────────────────────────────┘ │            │
│        │                                          │            │
│        │  ┌────────────────────────────────────┐ │            │
│        │  │ 🏠 Về trang chủ                    │ │ ◄── NEW!   │
│        │  └────────────────────────────────────┘ │            │
│        └──────────────────────────────────────────┘            │
│                                                                 │
└─────────────────┬──────────────┬────────────────────────────────┘
                  │              │
         Click    │              │    Click
    "Xem vé của tôi"             │  "Về trang chủ"
                  │              │
                  ▼              ▼
    ┌─────────────────┐    ┌─────────────┐
    │                 │    │             │
    │  BOOKING        │    │  HOMEPAGE   │
    │  HISTORY        │    │             │
    │  PAGE           │    │             │
    │                 │    └─────────────┘
    └─────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  4️⃣  BOOKING HISTORY PAGE (NEW!)                                │
│                                                                 │
│  📝 Lịch sử đặt tour                                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🎨 BOOKING #ABC123                    [✅ Đã thanh toán] │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ [IMG] Ha Long Bay Tour                                   │  │
│  │       📅 2025-10-15                                       │  │
│  │       👥 2 người lớn, 1 trẻ em                            │  │
│  │       💵 $50/người lớn, $25/trẻ em                        │  │
│  │                                                           │  │
│  │ 💳 PayPal - Order ID: 123456789                          │  │
│  │                                                           │  │
│  │ Tổng cộng: $125.00                                       │  │
│  │ 📆 8 tháng 10, 2025 - 10:30                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🎨 BOOKING #XYZ789                    [⏳ Chờ thanh toán]│  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ ...                                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Các thay đổi chính

### ✨ Payment Callback Page
**TRƯỚC:**
- Hiển thị "Thanh toán thành công"
- Tự động redirect sau 3 giây
- User không có control

**SAU:**
- Hiển thị "Thanh toán thành công" với UI đẹp hơn
- 2 nút cho user tự chọn:
  - **"Xem vé của tôi"** → đến trang lịch sử booking
  - **"Về trang chủ"** → quay về homepage
- User có quyền kiểm soát navigation

---

### ✨ Booking History Page
**TRƯỚC:**
- UI đơn giản, thiếu thông tin
- Không hiển thị items array
- Không có styling đẹp

**SAU:**
- UI card-based với gradient header
- Hiển thị đầy đủ thông tin:
  - Mã đặt chỗ
  - Status badge (màu theo trạng thái)
  - Chi tiết từng tour trong booking
  - Hình ảnh tour
  - Ngày đi, số người
  - Giá vé chi tiết
  - Phương thức thanh toán
  - Tổng tiền
  - Thời gian đặt
- Loading state & error handling
- Empty state với CTA
- Responsive design

---

## 🔌 Backend API

### Endpoint mới: `GET /api/bookings/my`

**Request:**
```http
GET /api/bookings/my HTTP/1.1
Host: localhost:4000
Authorization: Bearer {user_token}
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "bookings": [
    {
      "_id": "67054f8a...",
      "userId": "66f2a1b3...",
      "items": [
        {
          "tourId": {
            "_id": "66e9c4d5...",
            "title": "Ha Long Bay Tour",
            "imageItems": [...]
          },
          "date": "2025-10-15",
          "name": "Ha Long Bay Tour",
          "image": "https://...",
          "adults": 2,
          "children": 1,
          "unitPriceAdult": 50,
          "unitPriceChild": 25
        }
      ],
      "currency": "USD",
      "totalUSD": 125,
      "payment": {
        "provider": "paypal",
        "orderID": "8VH123456...",
        "status": "completed",
        "raw": {...}
      },
      "status": "paid",
      "bookingCode": "ABC123",
      "createdAt": "2025-10-08T03:30:00.000Z",
      "updatedAt": "2025-10-08T03:30:00.000Z"
    }
  ],
  "count": 1
}
```

---

## 📱 Responsive Design

### Desktop (>768px)
- Card layout với full width trong container
- 2 columns cho thông tin tour
- Icons và text alignment tốt

### Mobile (<768px)
- Stack layout
- Full width cards
- Touch-friendly buttons
- Responsive images

---

## 🎨 Design System

### Colors
- **Primary**: Purple-600 (#9333EA)
- **Success**: Green-500 (#10B981)
- **Warning**: Yellow-500 (#F59E0B)
- **Error**: Red-500 (#EF4444)
- **Gradient**: Purple-600 to Blue-500

### Components
- **Buttons**: Rounded-lg với hover effects
- **Cards**: White background với shadow-sm
- **Headers**: Gradient với white text
- **Badges**: Rounded-full với status colors
- **Icons**: Lucide-react (w-4 h-4)

---

## 🚀 Next Steps (Optional)

1. **QR Code Generation**
   - Generate unique QR code cho mỗi booking
   - Scan QR để check-in

2. **Booking Code Generation**
   - Auto-generate unique booking code (e.g., "HLB20251008-001")
   - Use format: {Tour Code}{Date}-{Sequential}

3. **Email Confirmation**
   - Send email với booking details
   - Include QR code attachment

4. **PDF Export**
   - Export booking thành PDF
   - Include all details + QR code

5. **Filters & Search**
   - Filter by status
   - Filter by date range
   - Search by tour name

6. **Pagination**
   - Load more bookings
   - Infinite scroll

7. **Booking Details Page**
   - Click vào booking → xem chi tiết đầy đủ
   - Include tour description, itinerary, etc.

8. **Cancel Booking**
   - Allow user cancel booking
   - Refund logic

---

## ✅ Testing Scenarios

### Happy Path
1. ✅ User thanh toán thành công
2. ✅ Redirect về payment callback
3. ✅ Hiển thị success UI với 2 nút
4. ✅ Click "Xem vé của tôi"
5. ✅ Load booking history page
6. ✅ Hiển thị booking vừa tạo

### Edge Cases
- [ ] User chưa có booking nào → hiển thị empty state
- [ ] API lỗi → hiển thị error message
- [ ] Token expired → redirect login
- [ ] Network error → retry button
- [ ] Multiple bookings → sort by date
- [ ] Booking với nhiều tours → hiển thị tất cả items

---

**Created by**: GitHub Copilot
**Date**: 8 tháng 10, 2025
**Version**: 1.0
