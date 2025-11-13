# Hệ Thống Hoàn Tiền - Hướng Dẫn Sử Dụng

## Tổng Quan

Hệ thống hoàn tiền cho phép người dùng yêu cầu hoàn tiền trong 2 trường hợp:

1. **Hủy Tour Trước Khi Đi**: Hoàn tiền dựa trên số ngày trước khi tour khởi hành
2. **Vấn Đề Sau Khi Đi Tour**: Hoàn tiền sau khi hoàn thành tour do có vấn đề về dịch vụ

## Chính Sách Hoàn Tiền

### Hủy Tour Trước Khi Đi

| Thời Gian Hủy  | Phần Trăm Hoàn | Phí Xử Lý |
| -------------- | -------------- | --------- |
| 30+ ngày trước | 90%            | 2%        |
| 14-29 ngày     | 70%            | 2%        |
| 7-13 ngày      | 50%            | 2%        |
| 3-6 ngày       | 25%            | 2%        |
| 1-2 ngày       | 10%            | 2%        |
| < 1 ngày       | 0%             | 0%        |

**Ví dụ:**

- Tổng tiền đã thanh toán: 10,000,000 VND
- Hủy tour: 15 ngày trước ngày khởi hành
- Phần trăm hoàn: 70%
- Số tiền được hoàn: 7,000,000 VND
- Phí xử lý (2%): 140,000 VND
- **Số tiền cuối cùng: 6,860,000 VND**

### Vấn Đề Sau Khi Đi Tour

| Mức Độ Nghiêm Trọng | Phần Trăm Hoàn | Phí Xử Lý |
| ------------------- | -------------- | --------- |
| Nghiêm trọng        | 100%           | 0%        |
| Lớn                 | 70%            | 0%        |
| Trung bình          | 40%            | 0%        |
| Nhỏ                 | 20%            | 0%        |

**Lưu ý:** Không tính phí xử lý cho trường hợp có vấn đề về dịch vụ.

## Hướng Dẫn Yêu Cầu Hoàn Tiền

### Bước 1: Truy cập Lịch Sử Booking

1. Đăng nhập vào tài khoản
2. Vào trang "Booking History"
3. Tìm booking cần hoàn tiền

### Bước 2: Chọn Loại Hoàn Tiền

#### Hủy Tour Trước Khi Đi

- Chọn nếu tour chưa khởi hành
- Hệ thống tự động tính số tiền hoàn dựa trên ngày hủy
- Kiểm tra preview số tiền được hoàn
- Thêm ghi chú (không bắt buộc)
- Gửi yêu cầu

#### Vấn Đề Sau Khi Đi Tour

- Chọn nếu tour đã hoàn thành
- Chọn loại vấn đề:
  - Chất lượng dịch vụ
  - Vấn đề an toàn
  - Thay đổi lịch trình
  - Vấn đề hướng dẫn viên
  - Vấn đề chỗ ở
  - Vấn đề phương tiện
  - Khác
- Chọn mức độ nghiêm trọng (Nhỏ/Trung bình/Lớn/Nghiêm trọng)
- Mô tả chi tiết vấn đề
- Đính kèm ảnh/tài liệu chứng minh (nếu có)
- Gửi yêu cầu

### Bước 3: Theo Dõi Trạng Thái

Trạng thái hoàn tiền:

- **Pending**: Đang chờ xét duyệt
- **Under Review**: Đang được xem xét
- **Approved**: Đã được chấp nhận
- **Processing**: Đang xử lý thanh toán
- **Completed**: Đã hoàn tiền thành công
- **Rejected**: Bị từ chối
- **Cancelled**: Đã hủy yêu cầu

### Bước 4: Nhận Tiền Hoàn

- Sau khi được duyệt, admin sẽ xử lý hoàn tiền
- Tiền sẽ được hoàn qua:
  - Phương thức thanh toán ban đầu
  - Chuyển khoản ngân hàng
  - Ví điện tử
- Thời gian: 3-7 ngày làm việc

## Lưu Ý Quan Trọng

### Điều Kiện Hoàn Tiền

✅ Booking đã thanh toán (status = "paid")
✅ Chưa được hoàn tiền trước đó
✅ Không có yêu cầu hoàn tiền đang chờ xử lý
❌ Không hoàn tiền cho booking chưa thanh toán
❌ Không hoàn tiền lần 2 cho cùng 1 booking

### Thời Hạn Yêu Cầu

- **Hủy tour**: Phải yêu cầu trước khi tour khởi hành
- **Vấn đề sau tour**: Yêu cầu trong vòng 7 ngày sau khi tour kết thúc

### Mẹo Để Được Hoàn Nhiều Tiền

1. **Hủy sớm**: Càng hủy sớm càng được hoàn nhiều
2. **Mô tả chi tiết**: Cung cấp thông tin đầy đủ về vấn đề
3. **Đính kèm chứng cứ**: Ảnh, video, tin nhắn liên quan
4. **Trung thực**: Mô tả đúng mức độ nghiêm trọng

## API Endpoints (Cho Developer)

### User APIs

```
POST   /api/refunds/pre-trip          - Yêu cầu hoàn tiền hủy tour
POST   /api/refunds/post-trip         - Yêu cầu hoàn tiền sau tour
GET    /api/refunds/my-refunds        - Xem danh sách hoàn tiền
GET    /api/refunds/:id               - Chi tiết hoàn tiền
POST   /api/refunds/:id/cancel        - Hủy yêu cầu hoàn tiền
```

### Admin APIs

```
GET    /api/admin/refunds             - Danh sách tất cả hoàn tiền
GET    /api/admin/refunds/stats       - Thống kê hoàn tiền
POST   /api/admin/refunds/:id/review  - Duyệt/Từ chối hoàn tiền
POST   /api/admin/refunds/:id/process - Xử lý hoàn tiền
```

## Files Đã Tạo

### Backend

- ✅ `models/Refund.js` - Model database
- ✅ `controller/refundController.js` - Logic xử lý
- ✅ `routes/refund.routes.js` - Routes user
- ✅ `routes/admin/refund.routes.js` - Routes admin

### Frontend

- ✅ `pages/RefundRequest.jsx` - Trang yêu cầu hoàn tiền
- ✅ `components/UserRefundList.jsx` - Danh sách hoàn tiền user
- ✅ `admin/pages/RefundManagement.jsx` - Quản lý hoàn tiền admin

## Câu Hỏi Thường Gặp

**Q: Mất bao lâu để được hoàn tiền?**
A: 3-7 ngày làm việc sau khi admin duyệt và xử lý.

**Q: Tôi có thể hủy yêu cầu hoàn tiền không?**
A: Có, nếu yêu cầu đang ở trạng thái "Pending".

**Q: Nếu bị từ chối thì sao?**
A: Bạn sẽ nhận được email với lý do từ chối. Có thể gửi yêu cầu mới với thông tin bổ sung.

**Q: Hoàn tiền qua đâu?**
A: Mặc định hoàn qua phương thức thanh toán ban đầu. Có thể yêu cầu chuyển khoản ngân hàng.

**Q: Có mất phí không?**
A: Phí xử lý 2% cho trường hợp hủy tour. Không phí cho trường hợp có vấn đề dịch vụ.

**Q: Tôi đã đi tour rồi nhưng có vấn đề, có được hoàn tiền không?**
A: Có, sử dụng chức năng "Post-Trip Issue" và mô tả chi tiết vấn đề.

## Liên Hệ Hỗ Trợ

Nếu có thắc mắc hoặc cần hỗ trợ:

- Email: support@travyy.com
- Hotline: 1900-xxxx
- Live chat: Trên website

---

_Cập nhật lần cuối: November 11, 2025_
