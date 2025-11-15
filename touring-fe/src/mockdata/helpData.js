// ✅ src/mockdata/helpData.js - Dữ liệu đầy đủ cho Help Center

export const helpCategories = [
  {
    _id: "cat_1",
    slug: "booking-payment",
    name: "Đặt chỗ & Thanh toán",
    description: "Hướng dẫn đặt tour, thanh toán và xử lý giao dịch",
    articleCount: 8,
    priority: 1,
    icon: "💳"
  },
  {
    _id: "cat_2",
    slug: "account-login",
    name: "Tài khoản & Đăng nhập",
    description: "Quản lý tài khoản, đăng nhập và bảo mật",
    articleCount: 6,
    priority: 2,
    icon: "👤"
  },
  {
    _id: "cat_3",
    slug: "itinerary-usage",
    name: "Sử dụng Itinerary",
    description: "Tạo và quản lý hành trình du lịch của bạn",
    articleCount: 7,
    priority: 3,
    icon: "📅"
  },
  {
    _id: "cat_4",
    slug: "checkout-invoice",
    name: "Checkout & Hóa đơn",
    description: "Xem lại đơn hàng, xuất hóa đơn và mã giảm giá",
    articleCount: 5,
    priority: 4,
    icon: "📋"
  },
  {
    _id: "cat_5",
    slug: "cancellation-refund",
    name: "Hủy & Hoàn tiền",
    description: "Chính sách hủy đơn và quy trình hoàn tiền",
    articleCount: 4,
    priority: 5,
    icon: "⏮️"
  },
  {
    _id: "cat_6",
    slug: "troubleshooting",
    name: "Xử lý sự cố",
    description: "Giải quyết các lỗi và vấn đề thường gặp",
    articleCount: 9,
    priority: 6,
    icon: "🔧"
  },
  {
    _id: "cat_7",
    slug: "privacy-security",
    name: "Quyền riêng tư & Bảo mật",
    description: "Chính sách dữ liệu và bảo mật thông tin",
    articleCount: 4,
    priority: 7,
    icon: "🔒"
  },
  {
    _id: "cat_8",
    slug: "support-contact",
    name: "Liên hệ hỗ trợ",
    description: "Các kênh hỗ trợ và thời gian phản hồi",
    articleCount: 3,
    priority: 8,
    icon: "💬"
  }
];

export const helpArticles = [
  // ===== BOOKING & PAYMENT (Priority 1) =====
  {
    _id: "art_001",
    slug: "how-to-book-tour",
    categorySlug: "booking-payment",
    title: "Làm thế nào để đặt tour?",
    excerpt: "Hướng dẫn chi tiết quy trình đặt tour từ tìm kiếm đến xác nhận",
    content: `
# Quy trình đặt tour trên Travyy

## Bước 1: Tìm kiếm tour
- Truy cập trang chủ và nhập điểm đến
- Chọn ngày bắt đầu và số người tham gia
- Nhấn "Tìm kiếm" để xem danh sách tour

## Bước 2: Chọn tour phù hợp
- Xem chi tiết tour: giá, lịch trình, đánh giá
- So sánh nhiều tour bằng cách thêm vào "Wishlist"
- Nhấn "Đặt ngay" khi đã quyết định

## Bước 3: Điền thông tin
- Nhập thông tin người đặt (họ tên, email, số điện thoại)
- Thêm yêu cầu đặc biệt nếu có
- Kiểm tra kỹ thông tin trước khi tiếp tục

## Bước 4: Thanh toán
- Chọn phương thức thanh toán
- Nhập thông tin thanh toán
- Xác nhận và hoàn tất đặt tour

## Bước 5: Nhận xác nhận
- Email xác nhận sẽ được gửi trong vòng 5 phút
- Kiểm tra hộp thư spam nếu không thấy email
- Voucher tour có thể tải về từ mục "Đơn hàng của tôi"
    `,
    tags: ["booking", "tour", "quy trình", "đặt chỗ"],
    views: 15234,
    helpfulCount: 1342,
    totalFeedback: 1456,
    lastUpdated: "2025-11-10",
    featured: true
  },
  {
    _id: "art_002",
    slug: "payment-methods",
    categorySlug: "booking-payment",
    title: "Các phương thức thanh toán nào được hỗ trợ?",
    excerpt: "PayPal, thẻ tín dụng, ví điện tử và các phương thức thanh toán khác",
    content: `
# Phương thức thanh toán trên Travyy

## 💳 Thẻ tín dụng/ghi nợ
- Visa, Mastercard, JCB, American Express
- Bảo mật với chuẩn PCI DSS Level 1
- Hỗ trợ thanh toán 3D Secure

## 🅿️ PayPal
- Thanh toán nhanh chóng và an toàn
- Không cần nhập thông tin thẻ
- Hỗ trợ thanh toán quốc tế

## 📱 Ví điện tử
- MoMo, ZaloPay, VNPay (cho khách VN)
- Alipay, WeChat Pay (cho khách Trung Quốc)

## 🏦 Chuyển khoản ngân hàng
- Áp dụng cho đơn từ 10 triệu VNĐ trở lên
- Thời gian xử lý: 1-2 ngày làm việc
- Liên hệ support để nhận thông tin tài khoản

## ⚠️ Lưu ý quan trọng
- Tất cả giao dịch đều được mã hóa SSL
- Travyy không lưu trữ thông tin thẻ của bạn
- Phí chuyển đổi ngoại tệ có thể phát sinh
    `,
    tags: ["thanh toán", "payment", "paypal", "thẻ"],
    views: 12891,
    helpfulCount: 1123,
    totalFeedback: 1201,
    lastUpdated: "2025-11-12"
  },
  {
    _id: "art_003",
    slug: "payment-failed",
    categorySlug: "booking-payment",
    title: "Thanh toán thất bại - Làm gì tiếp theo?",
    excerpt: "Xử lý các lỗi thanh toán và cách khắc phục",
    content: `
# Xử lý lỗi thanh toán

## Nguyên nhân thường gặp

### 1. Thông tin thẻ không chính xác
- Kiểm tra lại số thẻ, CVV, ngày hết hạn
- Đảm bảo nhập đúng tên chủ thẻ

### 2. Không đủ số dư
- Kiểm tra số dư tài khoản
- Liên hệ ngân hàng để xác nhận hạn mức

### 3. Thẻ bị khóa hoặc hạn chế
- Ngân hàng có thể chặn giao dịch quốc tế
- Gọi hotline ngân hàng để mở khóa

### 4. Lỗi 3D Secure
- Nhập đúng mã OTP từ ngân hàng
- Đảm bảo số điện thoại đăng ký với ngân hàng còn hoạt động

## Cách khắc phục

1. **Thử lại sau 5 phút**: Hệ thống có thể tạm thời bận
2. **Đổi phương thức thanh toán**: Thử PayPal hoặc thẻ khác
3. **Xóa cache trình duyệt**: Đôi khi session cũ gây lỗi
4. **Liên hệ ngân hàng**: Xác nhận thẻ có hoạt động bình thường
5. **Liên hệ support**: Nếu vẫn lỗi, chat với chúng tôi

## Tiền có bị trừ không?

- Nếu thanh toán thất bại, tiền **KHÔNG** bị trừ
- Nếu thấy tiền bị giữ tạm thời (pre-authorization), sẽ tự động hoàn trong 3-7 ngày
- Kiểm tra email xác nhận để chắc chắn
    `,
    tags: ["lỗi", "thanh toán", "payment failed", "troubleshooting"],
    views: 8934,
    helpfulCount: 756,
    totalFeedback: 891,
    lastUpdated: "2025-11-11",
    featured: true
  },
  {
    _id: "art_004",
    slug: "booking-confirmation",
    categorySlug: "booking-payment",
    title: "Khi nào tôi nhận được xác nhận đặt chỗ?",
    excerpt: "Thời gian và cách nhận email xác nhận booking",
    content: `
# Xác nhận đặt chỗ

## ⏱️ Thời gian nhận xác nhận

- **Đặt chỗ tức thì**: 5-10 phút sau khi thanh toán thành công
- **Đặt chỗ xác nhận**: 24-48 giờ (với một số tour đặc biệt)

## 📧 Email xác nhận chứa gì?

1. Mã đặt chỗ (Booking ID)
2. Chi tiết tour: tên, ngày, giờ
3. Thông tin khách hàng
4. Voucher điện tử (có mã QR)
5. Thông tin liên hệ tour operator
6. Chính sách hủy và đổi

## ❓ Không nhận được email?

### Kiểm tra ngay:
- Hộp thư spam/junk
- Tab "Promotions" (Gmail)
- Email đăng ký có đúng không

### Nếu vẫn không thấy:
1. Đăng nhập vào tài khoản Travyy
2. Vào mục "Đơn hàng của tôi"
3. Tải voucher trực tiếp

### Vẫn không được?
- Chat với support (góc dưới phải)
- Email: support@travyy.com
- Hotline: 1900-851-775
    `,
    tags: ["xác nhận", "email", "booking confirmation"],
    views: 7621,
    helpfulCount: 689,
    totalFeedback: 734,
    lastUpdated: "2025-11-09"
  },

  // ===== ACCOUNT & LOGIN (Priority 2) =====
  {
    _id: "art_005",
    slug: "create-account",
    categorySlug: "account-login",
    title: "Cách tạo tài khoản Travyy",
    excerpt: "Đăng ký tài khoản mới bằng email hoặc mạng xã hội",
    content: `
# Tạo tài khoản Travyy

## Đăng ký bằng Email

1. Nhấn "Đăng ký" ở góc trên phải
2. Nhập email, mật khẩu (tối thiểu 8 ký tự)
3. Xác nhận email qua link được gửi đến hộp thư
4. Hoàn tất! Đăng nhập và bắt đầu khám phá

## Đăng ký nhanh bằng mạng xã hội

### 🔵 Facebook
- Nhấn "Tiếp tục với Facebook"
- Cho phép Travyy truy cập thông tin cơ bản
- Tự động tạo tài khoản

### 🔴 Google
- Nhấn "Tiếp tục với Google"
- Chọn tài khoản Google
- Xác nhận và hoàn tất

## ⚠️ Lưu ý
- Mỗi email chỉ đăng ký được 1 tài khoản
- Nếu đã đăng ký bằng email, không thể liên kết Facebook/Google cùng email đó
- Bảo mật tài khoản với mật khẩu mạnh
    `,
    tags: ["đăng ký", "tài khoản", "register", "account"],
    views: 11234,
    helpfulCount: 987,
    totalFeedback: 1043,
    lastUpdated: "2025-11-08",
    featured: true
  },
  {
    _id: "art_006",
    slug: "reset-password",
    categorySlug: "account-login",
    title: "Quên mật khẩu - Cách reset",
    excerpt: "Hướng dẫn khôi phục mật khẩu và xử lý lỗi đăng nhập",
    content: `
# Reset mật khẩu

## Bước 1: Yêu cầu reset
1. Trang đăng nhập → "Quên mật khẩu?"
2. Nhập email đăng ký
3. Nhấn "Gửi link reset"

## Bước 2: Kiểm tra email
- Email reset gửi đến trong 2-5 phút
- Link có hiệu lực trong 30 phút
- Kiểm tra spam nếu không thấy

## Bước 3: Đặt mật khẩu mới
- Nhấn link trong email
- Nhập mật khẩu mới (tối thiểu 8 ký tự)
- Xác nhận và đăng nhập

## ⚠️ Vẫn không được?

### Link hết hạn
- Yêu cầu gửi lại link mới
- Hoàn tất trong 30 phút

### Không nhận được email
- Kiểm tra email có đúng không
- Thử gửi lại sau 5 phút
- Liên hệ support nếu cần

### Đăng ký bằng Facebook/Google
- Không thể reset mật khẩu
- Đăng nhập trực tiếp bằng mạng xã hội đó
    `,
    tags: ["mật khẩu", "reset password", "quên mật khẩu"],
    views: 9876,
    helpfulCount: 823,
    totalFeedback: 901,
    lastUpdated: "2025-11-10"
  },
  {
    _id: "art_007",
    slug: "oauth-login-issues",
    categorySlug: "account-login",
    title: "Không đăng nhập được bằng Facebook/Google",
    excerpt: "Khắc phục lỗi OAuth và liên kết tài khoản mạng xã hội",
    content: `
# Xử lý lỗi đăng nhập OAuth

## Lỗi thường gặp

### "Email này đã được sử dụng"
**Nguyên nhân**: Bạn đã đăng ký bằng email trước đó

**Giải pháp**:
- Đăng nhập bằng email và mật khẩu
- Hoặc reset mật khẩu nếu quên

### "Không thể kết nối với Facebook/Google"
**Nguyên nhân**: 
- Popup bị chặn
- Quyền truy cập bị từ chối
- Lỗi tạm thời

**Giải pháp**:
1. Cho phép popup trên trình duyệt
2. Thử lại sau vài phút
3. Xóa cache và cookie
4. Thử trình duyệt khác

### "Tài khoản đã bị khóa"
**Nguyên nhân**: Vi phạm điều khoản hoặc hoạt động đáng ngờ

**Giải pháp**: Liên hệ support để được hỗ trợ

## Cách liên kết tài khoản mạng xã hội

1. Đăng nhập vào Travyy
2. Vào "Cài đặt tài khoản"
3. Chọn "Liên kết tài khoản"
4. Nhấn "Kết nối Facebook" hoặc "Kết nối Google"
5. Cho phép truy cập

**Lưu ý**: Email của tài khoản Travyy và mạng xã hội phải khác nhau
    `,
    tags: ["oauth", "facebook", "google", "đăng nhập", "login"],
    views: 6543,
    helpfulCount: 521,
    totalFeedback: 612,
    lastUpdated: "2025-11-07"
  },

  // ===== ITINERARY USAGE (Priority 3) =====
  {
    _id: "art_008",
    slug: "create-itinerary",
    categorySlug: "itinerary-usage",
    title: "Cách tạo hành trình du lịch (Itinerary)",
    excerpt: "Hướng dẫn tạo, chỉnh sửa và quản lý itinerary",
    content: `
# Tạo hành trình du lịch

## Bước 1: Bắt đầu
1. Vào trang "Lên kế hoạch"
2. Nhấn "Tạo hành trình mới"
3. Đặt tên cho chuyến đi
4. Chọn điểm đến và ngày tháng

## Bước 2: Thêm địa điểm (POI)
- Tìm kiếm địa điểm trên bản đồ
- Hoặc chọn từ danh sách gợi ý
- Kéo thả để thêm vào ngày cụ thể
- Thay đổi thứ tự bằng drag & drop

## Bước 3: Thêm Tour
- Browse tour từ danh sách
- Nhấn "Thêm vào hành trình"
- Tour tự động xuất hiện trong Floating Cart

## Bước 4: Tùy chỉnh
- Thêm ghi chú cho mỗi điểm
- Đánh dấu ưu tiên
- Thêm ảnh riêng
- Ước tính thời gian và chi phí

## Bước 5: Lưu và chia sẻ
- Nhấn "Lưu hành trình"
- Tạo link chia sẻ công khai
- Hoặc gửi qua email cho bạn bè
    `,
    tags: ["itinerary", "hành trình", "lên kế hoạch"],
    views: 14567,
    helpfulCount: 1289,
    totalFeedback: 1367,
    lastUpdated: "2025-11-13",
    featured: true
  },
  {
    _id: "art_009",
    slug: "poi-vs-tour",
    categorySlug: "itinerary-usage",
    title: "Khác biệt giữa POI và Tour",
    excerpt: "POI là địa điểm, Tour là trải nghiệm có hướng dẫn",
    content: `
# POI vs Tour

## 🏛️ POI (Point of Interest)
- Địa điểm du lịch, nhà hàng, khách sạn
- Tự tham quan, không có hướng dẫn viên
- Miễn phí hoặc mua vé tại chỗ
- Linh hoạt về thời gian

**Ví dụ**: Tháp Eiffel, bảo tàng Louvre, phố cổ Hà Nội

## 🎫 Tour
- Trải nghiệm có hướng dẫn viên
- Bao gồm vận chuyển, vé vào cửa
- Đặt trước và thanh toán online
- Thời gian cố định

**Ví dụ**: Tour ngày Vịnh Hạ Long, tour ẩm thực phố cổ

## Khi nào dùng POI?
- Muốn tự do khám phá
- Có kinh nghiệm du lịch
- Tiết kiệm chi phí

## Khi nào đặt Tour?
- Muốn được hướng dẫn chi tiết
- Tiết kiệm thời gian tìm hiểu
- Địa điểm khó tiếp cận
- Đi nhóm đông người
    `,
    tags: ["poi", "tour", "khác biệt"],
    views: 8234,
    helpfulCount: 712,
    totalFeedback: 789,
    lastUpdated: "2025-11-06"
  },
  {
    _id: "art_010",
    slug: "floating-cart-guide",
    categorySlug: "itinerary-usage",
    title: "Cách sử dụng Floating Cart",
    icon: "🛒",
    excerpt: "Quản lý tour và POI đã chọn với Floating Cart",
    content: `
# Hướng dẫn Floating Cart

## Floating Cart là gì?
- Giỏ hàng nổi xuất hiện bên phải màn hình
- Chứa tất cả tour và POI bạn đã thêm
- Luôn truy cập được khi duyệt trang

## Các chức năng chính

### 1. Xem tổng quan
- Số lượng item
- Tổng chi phí dự kiến
- Thời gian cho mỗi ngày

### 2. Sắp xếp lại
- Kéo thả để thay đổi thứ tự
- Di chuyển giữa các ngày
- Xóa item không cần

### 3. Chỉnh sửa nhanh
- Thay đổi số lượng khách
- Thêm ghi chú
- Đánh dấu ưu tiên

### 4. Thanh toán
- Review tổng quan
- Nhấn "Thanh toán" khi sẵn sàng
- Chuyển sang trang checkout

## Tips sử dụng hiệu quả
- Thêm POI miễn phí để ước tính thời gian
- Review giỏ hàng trước khi thanh toán
- Lưu hành trình để đặt sau
    `,
    tags: ["floating cart", "giỏ hàng", "cart"],
    views: 5678,
    helpfulCount: 487,
    totalFeedback: 534,
    lastUpdated: "2025-11-12"
  },

  // ===== CHECKOUT & INVOICE (Priority 4) =====
  {
    _id: "art_011",
    slug: "apply-promo-code",
    categorySlug: "checkout-invoice",
    title: "Cách áp dụng mã giảm giá",
    icon: "🎟️",
    excerpt: "Nhập mã khuyến mãi và kiểm tra điều kiện áp dụng",
    content: `
# Sử dụng mã giảm giá

## Cách nhập mã

1. Tại trang Checkout
2. Tìm ô "Mã giảm giá"
3. Nhập mã và nhấn "Áp dụng"
4. Giảm giá sẽ hiển thị ngay

## Điều kiện áp dụng

### Mã có thể không hoạt động nếu:
- Đã hết hạn
- Chỉ áp dụng cho tour cụ thể
- Đơn hàng chưa đủ giá trị tối thiểu
- Đã dùng mã cho tài khoản này rồi
- Không áp dụng đồng thời với khuyến mãi khác

## Các loại mã

### 💰 Giảm theo %
- Ví dụ: SALE20 (giảm 20%)
- Có thể có giới hạn tối đa

### 💵 Giảm cố định
- Ví dụ: SAVE50K (giảm 50,000đ)
- Áp dụng trực tiếp

### 🎁 Khuyến mãi đặc biệt
- Free tour mini
- Upgrade dịch vụ
- Tặng voucher lần sau

## Kiểm tra mã hợp lệ
- Vào "Khuyến mãi" trên menu
- Xem danh sách mã đang có
- Đọc điều kiện chi tiết
    `,
    tags: ["mã giảm giá", "promo code", "khuyến mãi"],
    views: 13456,
    helpfulCount: 1178,
    totalFeedback: 1256,
    lastUpdated: "2025-11-11"
  },

  // ===== CANCELLATION & REFUND (Priority 5) =====
  {
    _id: "art_012",
    slug: "cancellation-policy",
    categorySlug: "cancellation-refund",
    title: "Chính sách hủy đơn",
    icon: "📋",
    excerpt: "Điều kiện hủy, thời hạn và phí xử lý cho từng loại tour",
    content: `
# Chính sách hủy đơn

## ⏰ Thời hạn hủy theo loại tour

### 🟢 Linh hoạt (Flexible)
- Hủy trước 24h: Hoàn 100%
- Hủy trong 24h: Hoàn 50%
- Không đến: Mất 100%

### 🟡 Tiêu chuẩn (Standard)
- Hủy trước 72h: Hoàn 90%
- Hủy 24-72h: Hoàn 50%
- Hủy trong 24h: Mất 100%

### 🔴 Nghiêm ngặt (Strict)
- Hủy trước 7 ngày: Hoàn 80%
- Hủy 3-7 ngày: Hoàn 30%
- Hủy dưới 3 ngày: Mất 100%

## 💳 Phí xử lý
- Phí giao dịch: 2-3% (không hoàn)
- Phí chuyển đổi ngoại tệ: theo tỷ giá ngân hàng

## 📝 Cách yêu cầu hủy

1. Đăng nhập tài khoản
2. Vào "Đơn hàng của tôi"
3. Chọn đơn cần hủy
4. Nhấn "Yêu cầu hủy"
 5. Điền lý do hủy và gửi yêu cầu. Hệ thống sẽ gửi email xác nhận trong vòng 24-72 giờ.
 6. Nếu hủy thành công, khoản hoàn tiền sẽ được xử lý theo quy định (xem phần Quy trình hoàn tiền bên dưới).

## ✅ Quy trình hoàn tiền

- Thời gian xử lý: thường 3-7 ngày làm việc (tùy ngân hàng/đơn vị thanh toán).
- Hình thức hoàn: hoàn về thẻ/ví đã sử dụng để thanh toán.
- Lưu ý: Các khoản phí giao dịch theo chính sách (2-3%) có thể không được hoàn.

## ⚠️ Trường hợp đặc biệt

- Nếu nhà cung cấp/hướng dẫn viên hủy tour, khách sẽ được hoàn 100% và nhận thông báo ưu đãi bù đắp khi có.
- Nếu muốn thay đổi ngày/chuyến, vui lòng liên hệ support để kiểm tra khả năng thay đổi và chi phí phát sinh.

## 📝 Liên hệ hỗ trợ

- Email: support@travyy.com
- Hotline: 1900-851-775
    `,
    tags: ["hủy", "hoàn tiền", "cancellation"],
    views: 4321,
    helpfulCount: 412,
    totalFeedback: 445,
    lastUpdated: "2025-11-14"
  }
];

// Featured articles helper
export const helpFeaturedArticles = helpArticles.filter((a) => a.featured);

// Simple search helper used by the HelpCenter component
export function searchArticles(query) {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase();
  return helpArticles.filter((a) => {
    const inTitle = a.title && a.title.toLowerCase().includes(q);
    const inExcerpt = a.excerpt && a.excerpt.toLowerCase().includes(q);
    const inTags = Array.isArray(a.tags) && a.tags.some((t) => t.toLowerCase().includes(q));
    const inContent = a.content && a.content.toLowerCase().includes(q);
    return inTitle || inExcerpt || inTags || inContent;
  }).slice(0, 50);
}

// Return all articles for a given category slug
export function getArticlesByCategory(categorySlug) {
  if (!categorySlug) return [];
  return helpArticles.filter((a) => a.categorySlug === categorySlug);
}

// Map of articles by slug for quick lookup in article view
export const helpArticlesBySlug = helpArticles.reduce((acc, art) => {
  acc[art.slug] = art;
  return acc;
}, {});

// Convenience helper: get single article by slug
export function getArticleBySlug(slug) {
  if (!slug) return null;
  return helpArticlesBySlug[slug] || null;
}

// Convenience helper: return categories sorted by priority
export function getCategories() {
  return [...helpCategories].sort((a, b) => (a.priority || 0) - (b.priority || 0));
}

// Convenience helper: featured articles
export function getFeaturedArticles() {
  return helpArticles.filter((a) => a.featured);
}