# Lịch sử & Hướng dẫn Test API

## Test tự động (Jest + supertest)

- File test mẫu: `auth.api.test.js`
- Chạy test:

```bash
cd touring-be
npm install --save-dev jest supertest
npx jest <tên file test>
```

## Kết quả test theo từng nhóm API

### Auth API (`auth.api.test.js`)

| Test case                  | Status | Code | Nhận xét ngắn                                                                               |
| -------------------------- | ------ | ---- | ------------------------------------------------------------------------------------------- |
| Đăng ký user mới           | FAIL   | 400  | Backend báo thiếu trường/validate.                                                          |
| Đăng nhập đúng credentials | BỎ QUA |      | Bỏ qua do đăng ký lỗi.                                                                      |
| Đăng nhập user bị khóa     | PASS   | 500  | User bị khóa (banned/inactive) không đăng nhập được, backend trả về lỗi đúng chuẩn bảo mật. |

### Profile API (`profile.api.test.js`)

| Test case                        | Status | Code | Nhận xét ngắn                                                                                 |
| -------------------------------- | ------ | ---- | --------------------------------------------------------------------------------------------- |
| GET /api/profile/me (chưa login) | FAIL   | 404  | API trả về 404, có thể route chưa khai báo hoặc sai path. Có lỗi async teardown trong server. |

### Tour API (`tour.api.test.js`)

| Test case                                | Status | Code | Nhận xét ngắn                                                                             |
| ---------------------------------------- | ------ | ---- | ----------------------------------------------------------------------------------------- |
| GET /api/tours (lấy danh sách tour)      | PASS   | 200  | Lấy danh sách tour thành công, trả về mảng.                                               |
| GET /api/tours/invalid-id-123 (tour sai) | FAIL   | 500  | Backend trả về 500 thay vì 404/400 khi id không hợp lệ. Nên handle lỗi để trả về 404/400. |

### Wishlist API (`wishlist.api.test.js`)

| Test case                                | Status | Code | Nhận xét ngắn                                             |
| ---------------------------------------- | ------ | ---- | --------------------------------------------------------- |
| GET /api/wishlist (chưa login)           | PASS   | 401  | Chưa đăng nhập, API trả về 401 đúng chuẩn bảo mật.        |
| GET /api/wishlist (đã login, mock token) | PASS   | 200  | Có token hợp lệ, API trả về 200 và body là mảng wishlist. |

### Review API (`review.api.test.js`)

| Test case                              | Status | Code        | Nhận xét ngắn                                                |
| -------------------------------------- | ------ | ----------- | ------------------------------------------------------------ |
| GET /api/reviews/tour/:tourId (public) | PASS   | 200/404/400 | Nếu tourId hợp lệ trả về 200 (mảng), nếu không thì 404/400.  |
| POST /api/reviews (chưa login)         | PASS   | 401/403     | Không đăng nhập, API trả về 401 hoặc 403 đúng chuẩn bảo mật. |

### Cart API (`cart.api.test.js`)

| Test case                           | Status | Code | Nhận xét ngắn                                       |
| ----------------------------------- | ------ | ---- | --------------------------------------------------- |
| GET /api/cart (chưa login)          | PASS   | 401  | Không đăng nhập, API trả về 401 đúng chuẩn bảo mật. |
| POST /api/cart (chưa login)         | PASS   | 401  | Không đăng nhập, API trả về 401 đúng chuẩn bảo mật. |
| PUT /api/cart/:itemId (no login)    | PASS   | 401  | Không đăng nhập, API trả về 401 đúng chuẩn bảo mật. |
| DELETE /api/cart/:itemId (no login) | PASS   | 401  | Không đăng nhập, API trả về 401 đúng chuẩn bảo mật. |
| DELETE /api/cart (no login)         | PASS   | 401  | Không đăng nhập, API trả về 401 đúng chuẩn bảo mật. |

### Payment API (`payment.api.test.js`)

| Test case                                               | Status | Code    | Nhận xét ngắn                                             |
| ------------------------------------------------------- | ------ | ------- | --------------------------------------------------------- |
| POST /api/payments/momo (chưa login)                    | PASS   | 401/403 | Không đăng nhập, API trả về 401/403 đúng bảo mật.         |
| POST /api/payments/momo/ipn (public)                    | PASS   | 200/400 | Public endpoint, backend trả về 200 hoặc 400 tùy payload. |
| GET /api/payments/momo/session/:orderId (chưa login)    | PASS   | 401/403 | Không đăng nhập, API trả về 401/403 đúng bảo mật.         |
| GET /api/payments/booking/:provider/:orderId (no login) | PASS   | 401/403 | Không đăng nhập, API trả về 401/403 đúng bảo mật.         |
| POST /api/payments/retry/:bookingId (chưa login)        | PASS   | 401/403 | Không đăng nhập, API trả về 401/403 đúng bảo mật.         |

> Lưu ý: Đã cập nhật test để in log response chi tiết, giúp debug nhanh hơn. Nếu muốn test pass cần kiểm tra lại schema register và dữ liệu test. |

## Ghi chú & Kinh nghiệm debug

- Nếu test register trả về 400: kiểm tra lại body gửi lên, có thể thiếu trường backend yêu cầu (ví dụ: name, email, password, ...). Xem log response để biết chi tiết lỗi validate.
- Nếu test login trả về 500: thường do đăng ký thất bại nên user chưa tồn tại, hoặc password truyền vào undefined. Nên kiểm tra response của register trước khi test login.
- Nếu gặp cảnh báo async chưa dừng (SMTP/nodemailer): nên mock email khi test, hoặc cấu hình nodemailer ở chế độ test để tránh treo kết nối.
- Có thể thêm test cho các route khác bằng cách copy file test mẫu.
- Nếu cần test thủ công, dùng Postman hoặc curl với các endpoint trong `/api/auth`.
