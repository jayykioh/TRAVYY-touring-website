// src/mockdata/helpData.js
// ✅ Mockdata for Help Center & FAQ (Klook-like style, Vietnamese, production-like)
export const helpCategories = [
  {
    _id: "c-booking",
    slug: "booking-payment",
    name: "Đặt tour & Thanh toán",
    description: "Cách đặt tour, phương thức thanh toán, hoàn/hủy, hóa đơn.",
    icon: "💳",
    articleCount: 3
  },
  {
    _id: "c-account",
    slug: "account-security",
    name: "Tài khoản & Bảo mật",
    description: "Tạo tài khoản, xác minh email, bảo mật, đăng nhập an toàn.",
    icon: "👤",
    articleCount: 2
  },
  {
    _id: "c-tips",
    slug: "travel-tips",
    name: "Mẹo du lịch & Hành lý",
    description: "Chuẩn bị hành lý, tiết kiệm chi phí, lưu ý khi đi theo nhóm.",
    icon: "🧳",
    articleCount: 3
  },
  {
    _id: "c-weather",
    slug: "weather-best-time",
    name: "Thời tiết & Thời điểm đi",
    description: "Nên đi khi nào? Cách xử lý thời tiết xấu khi đang đi tour.",
    icon: "🌤️",
    articleCount: 2
  },
  {
    _id: "c-shopping",
    slug: "shopping-souvenir",
    name: "Mua sắm & Quà lưu niệm",
    description: "Mua gì ở mỗi vùng, mặc cả, bảo hành – mẹo mua sắm thông minh.",
    icon: "🛍️",
    articleCount: 2
  }
];

export const helpArticles = [
  // ===== Booking & Payment (3) =====
  {
    _id: "a-book-1",
    slug: "cach-dat-tour-tren-travyy",
    title: "Cách đặt tour & thanh toán trên Travyy",
    icon: "🧭",
    excerpt: "Hướng dẫn từng bước để đặt tour, chọn phương thức thanh toán và nhận email xác nhận.",
    content: `
## 1. Tìm và chọn tour
- Sử dụng ô tìm kiếm hoặc chọn theo **điểm đến / chủ đề**.
- Kiểm tra *lịch khởi hành, giá, bao gồm/không bao gồm, chính sách hủy*.

## 2. Đăng nhập & điền thông tin
- Đăng nhập tài khoản Travyy (hoặc tạo mới).
- Điền thông tin hành khách, ghi chú dị ứng, yêu cầu đặc biệt (nếu có).

## 3. Chọn phương thức thanh toán
- **Thẻ nội địa/NAPAS**, **Thẻ quốc tế (Visa/Mastercard)**, **Ví MoMo**, **PayPal**.
- Mã giảm giá (nếu có) sẽ áp dụng ở bước này.

## 4. Xác nhận & nhận email
- Sau khi thanh toán thành công, bạn sẽ nhận **email xác nhận** kèm mã đặt chỗ.
- Có thể xem lại tại **Hồ sơ → Đơn hàng của tôi**.

> 💡 *Mẹo:* Lưu tour vào **Yêu thích** để theo dõi giá và khởi hành gần nhất.
`,
    category: "booking-payment",
    views: 5320,
    helpfulCount: 96,
    notHelpfulCount: 6,
    helpfulnessRate: 94,
    updatedAt: "2025-10-25T09:00:00Z",
    relatedArticles: [
      { _id: "a-book-2", slug: "chinh-sach-hoan-huy-tour", title: "Chính sách hoàn/hủy tour", icon: "💰", excerpt: "Điều kiện và phí khi hủy tour, thời gian hoàn tiền." },
      { _id: "a-book-3", slug: "khac-phuc-thanh-toan-that-bai", title: "Khắc phục thanh toán thất bại", icon: "🧩", excerpt: "Các lỗi thanh toán phổ biến và cách xử lý." }
    ]
  },
  {
    _id: "a-book-2",
    slug: "chinh-sach-hoan-huy-tour",
    title: "Chính sách hoàn/hủy tour",
    icon: "💰",
    excerpt: "Khi nào được hoàn tiền? Phí hủy là bao nhiêu? Thời gian xử lý hoàn trong bao lâu?",
    content: `
### Trường hợp được hoàn tiền
- Hủy **≥ 7 ngày** trước giờ khởi hành: hoàn **100%**.
- Hủy **3–6 ngày**: hoàn **70%**.
- Hủy **24–72h**: hoàn **50%**.
- Hủy **< 24h** hoặc không tham gia: **không hoàn**.

### Thời gian hoàn tiền
- Cổng thanh toán nội địa: **1–3 ngày làm việc**.
- Thẻ quốc tế/PayPal: **3–7 ngày làm việc** (tùy ngân hàng).

> ℹ️ Một số tour dịp cao điểm/ưu đãi đặc biệt có điều kiện riêng – xem mục *Điều khoản* trong trang tour.
`,
    category: "booking-payment",
    views: 2840,
    helpfulCount: 61,
    notHelpfulCount: 4,
    helpfulnessRate: 94,
    updatedAt: "2025-10-28T14:00:00Z",
    relatedArticles: [
      { _id: "a-book-1", slug: "cach-dat-tour-tren-travyy", title: "Cách đặt tour & thanh toán", icon: "🧭", excerpt: "Từng bước đặt tour và thanh toán an toàn." }
    ]
  },
  {
    _id: "a-book-3",
    slug: "khac-phuc-thanh-toan-that-bai",
    title: "Thanh toán thất bại – cách khắc phục",
    icon: "🧩",
    excerpt: "Lỗi OTP, hết hạn phiên thanh toán, bị từ chối bởi ngân hàng – cách xử lý nhanh.",
    content: `
### Lỗi phổ biến & cách xử lý
1. **OTP không nhận được** → Kiểm tra sóng/4G, thử lại, hoặc chọn kênh thanh toán khác.
2. **Thẻ bị từ chối** → Liên hệ ngân hàng để mở khóa giao dịch online/quốc tế.
3. **Phiên thanh toán hết hạn** → Tạo phiên mới và thanh toán lại trong 15 phút.
4. **Vượt hạn mức ví** → Chia nhỏ giao dịch hoặc đổi phương thức khác.

> 🧠 *Gợi ý:* Bật *3D Secure* cho thẻ quốc tế để tăng tỉ lệ thanh toán thành công.
`,
    category: "booking-payment",
    views: 1770,
    helpfulCount: 38,
    notHelpfulCount: 3,
    helpfulnessRate: 93,
    updatedAt: "2025-10-27T11:20:00Z"
  },

  // ===== Account & Security (2) =====
  {
    _id: "a-acc-1",
    slug: "tao-tai-khoan-xac-minh-email",
    title: "Tạo tài khoản & xác minh email",
    icon: "📧",
    excerpt: "Cách tạo tài khoản mới, xác minh email, lợi ích khi đăng nhập Travyy.",
    content: `
### Tạo tài khoản
- Dùng email/số điện thoại hợp lệ → Đặt mật khẩu **≥ 8 ký tự**.
- Xác minh email qua liên kết trong hộp thư (*kiểm tra mục Spam/Quảng cáo*).

### Quyền lợi khi có tài khoản
- Lưu **Yêu thích**, nhận **mã giảm giá**, theo dõi **đơn hàng**.
- Đồng bộ thiết bị & quản lý thông tin hành khách nhanh chóng.
`,
    category: "account-security",
    views: 920,
    helpfulCount: 18,
    notHelpfulCount: 1,
    helpfulnessRate: 95,
    updatedAt: "2025-10-20T10:30:00Z"
  },
  {
    _id: "a-acc-2",
    slug: "bao-mat-dang-nhap-an-toan",
    title: "Bảo mật tài khoản & đăng nhập an toàn",
    icon: "🔐",
    excerpt: "Đặt mật khẩu mạnh, bật xác thực 2 lớp (2FA), quản lý thiết bị đăng nhập.",
    content: `
### Gợi ý bảo mật
- Dùng mật khẩu mạnh: *chữ hoa + chữ thường + số + ký tự đặc biệt*.
- Bật **2FA** bằng ứng dụng Authenticator.
- Thường xuyên **đăng xuất** trên thiết bị công cộng.
- Không chia sẻ mã OTP cho bất kỳ ai.

> ⚠️ Nếu nghi ngờ bị truy cập trái phép: đổi mật khẩu ngay và liên hệ hỗ trợ.
`,
    category: "account-security",
    views: 1310,
    helpfulCount: 26,
    notHelpfulCount: 2,
    helpfulnessRate: 93,
    updatedAt: "2025-10-22T16:45:00Z"
  },

  // ===== Travel Tips (3) =====
  {
    _id: "a-tip-1",
    slug: "hanh-ly-cho-chuyen-di-mien-nui-bien",
    title: "Chuẩn bị hành lý cho miền núi & biển",
    icon: "🎒",
    excerpt: "Danh sách gợi ý thông minh cho 2 kiểu hành trình phổ biến ở Việt Nam.",
    content: `
### Miền núi (Sa Pa, Hà Giang)
- Áo giữ ấm, áo mưa mỏng, giày trekking chống trượt.
- Thuốc cảm, băng cá nhân, miếng dán giữ nhiệt.
- Túi chống ẩm cho thiết bị, pin dự phòng.

### Biển (Phú Quốc, Nha Trang)
- Kem chống nắng, nón, kính mát, đồ bơi khô nhanh.
- Áo chống nắng, dép đi biển, túi chống nước điện thoại.
- Thuốc say sóng nếu đi cano/ tàu.
`,
    category: "travel-tips",
    views: 1680,
    helpfulCount: 34,
    notHelpfulCount: 2,
    helpfulnessRate: 94,
    updatedAt: "2025-10-18T08:20:00Z"
  },
  {
    _id: "a-tip-2",
    slug: "meo-tiet-kiem-chi-phi-khi-du-lich",
    title: "Mẹo tiết kiệm chi phí khi du lịch",
    icon: "🪙",
    excerpt: "Săn ưu đãi sớm, đi ngày thường, dùng combo, chia sẻ chi phí theo nhóm.",
    content: `
- Đặt sớm **> 14 ngày** để có giá tốt.
- Ưu tiên đi **giữa tuần** thay vì cuối tuần.
- Chọn **combo tour + khách sạn** hoặc **voucher**.
- Đi nhóm 4–6 người để **chia sẻ chi phí** phương tiện.
`,
    category: "travel-tips",
    views: 950,
    helpfulCount: 22,
    notHelpfulCount: 1,
    helpfulnessRate: 96,
    updatedAt: "2025-10-17T09:55:00Z"
  },
  {
    _id: "a-tip-3",
    slug: "luu-y-khi-di-du-lich-nhom",
    title: "Lưu ý khi đi du lịch theo nhóm",
    icon: "🧑‍🤝‍🧑",
    excerpt: "Phân công trưởng nhóm, thống nhất ngân sách, chia nhiệm vụ, backup liên lạc.",
    content: `
- Chọn **trưởng nhóm** để quyết định nhanh.
- Thống nhất **ngân sách** và quỹ chung.
- Phân công: *điểm danh, y tế, tài chính, hậu cần*.
- Tạo **nhóm chat** + chia sẻ vị trí phòng trường hợp lạc nhau.
`,
    category: "travel-tips",
    views: 740,
    helpfulCount: 16,
    notHelpfulCount: 1,
    helpfulnessRate: 94,
    updatedAt: "2025-10-12T12:05:00Z"
  },

  // ===== Weather & Best Time (2) =====
  {
    _id: "a-wea-1",
    slug: "thoi-diem-dep-nhat-theo-vung",
    title: "Thời điểm đẹp nhất để đi từng vùng",
    icon: "🗓️",
    excerpt: "Miền Bắc (thu/đông), Miền Trung (khô), Miền Nam (khô) – gợi ý theo mùa.",
    content: `
- **Miền Bắc:** Thu (9–11) trời trong, đông (12–2) có săn mây, lạnh.
- **Miền Trung:** Mùa khô (2–8) đẹp, tránh mưa bão (9–11) tùy năm.
- **Miền Nam:** Mùa khô (12–4) lý tưởng, mưa nhiều (5–11) nhưng vẫn đi được.
`,
    category: "weather-best-time",
    views: 2110,
    helpfulCount: 41,
    notHelpfulCount: 3,
    helpfulnessRate: 93,
    updatedAt: "2025-10-10T07:40:00Z"
  },
  {
    _id: "a-wea-2",
    slug: "doi-pho-voi-thoi-tiet-xau",
    title: "Đối phó với thời tiết xấu khi đi tour",
    icon: "⛑️",
    excerpt: "Phương án dự phòng, liên hệ điều phối, bảo hiểm du lịch, hoàn/hủy linh hoạt.",
    content: `
- Kiểm tra **dự báo thời tiết** trước 48h.
- Hỏi điều phối về **phương án thay thế** (đổi lịch trình/đổi ngày).
- Mua **bảo hiểm du lịch** để hạn chế rủi ro.
- Mang áo mưa mỏng, bao chống nước cho điện thoại, túi nilon cho đồ ướt.
`,
    category: "weather-best-time",
    views: 670,
    helpfulCount: 12,
    notHelpfulCount: 1,
    helpfulnessRate: 92,
    updatedAt: "2025-10-09T15:30:00Z"
  },

  // ===== Shopping & Souvenir (2) =====
  {
    _id: "a-shop-1",
    slug: "qua-luu-niem-dac-trung-vung-mien",
    title: "Gợi ý quà lưu niệm đặc trưng từng vùng",
    icon: "🎁",
    excerpt: "Miền Bắc: ô mai, cốm; Miền Trung: mè xửng, lụa; Miền Nam: kẹo dừa, trái cây sấy.",
    content: `
- **Hà Nội:** Ô mai, cốm, gốm Bát Tràng.
- **Huế/Hội An:** Mè xửng, lụa, đèn lồng.
- **Sài Gòn/miền Tây:** Kẹo dừa, mứt trái cây, cà phê đặc sản.
`,
    category: "shopping-souvenir",
    views: 820,
    helpfulCount: 17,
    notHelpfulCount: 1,
    helpfulnessRate: 94,
    updatedAt: "2025-10-05T10:10:00Z"
  },
  {
    _id: "a-shop-2",
    slug: "kinh-nghiem-mua-sam-thong-minh",
    title: "Kinh nghiệm mua sắm thông minh khi du lịch",
    icon: "🧮",
    excerpt: "So sánh giá, hỏi rõ bảo hành, test trước khi mua, lưu ý hóa đơn VAT.",
    content: `
- **So sánh giá** 2–3 cửa hàng trước khi quyết.
- **Mặc cả lịch sự** ở chợ/trạm dừng.
- Hỏi rõ **bảo hành/đổi trả** với đồ điện tử, thủ công.
- Yêu cầu **hóa đơn VAT** nếu cần mang đi công tác/quyết toán.
`,
    category: "shopping-souvenir",
    views: 560,
    helpfulCount: 11,
    notHelpfulCount: 1,
    helpfulnessRate: 91,
    updatedAt: "2025-10-03T09:25:00Z"
  }
];

export const featuredArticles = helpArticles.slice(0, 4);

// ===== 20 FAQs =====
export const faqs = [
  // Booking & Payment
  { id: 1, question: "Có thể đổi ngày tour sau khi đặt không?", answer: "Có, nếu đổi trước **≥ 3 ngày** so với giờ khởi hành và còn chỗ trống. Vui lòng liên hệ hỗ trợ để kiểm tra phí đổi (nếu có).", category: "booking-payment", location: "Hà Nội", isLocal: true },
  { id: 2, question: "Thanh toán qua MoMo thất bại thì sao?", answer: "Hãy kiểm tra hạn mức ví, 4G ổn định và thử lại sau 3–5 phút. Nếu vẫn lỗi, chọn **thẻ nội địa/PayPal**.", category: "booking-payment", location: "TP.HCM", isLocal: false },
  { id: 3, question: "Sau khi hủy tour, bao lâu nhận được tiền hoàn?", answer: "Nội địa **1–3 ngày làm việc**, quốc tế/PayPal **3–7 ngày** tùy ngân hàng/cổng thanh toán.", category: "booking-payment", location: "Đà Nẵng", isLocal: true },
  { id: 4, question: "Có xuất hóa đơn VAT cho tour không?", answer: "Có. Bạn nhập thông tin doanh nghiệp ở bước thanh toán hoặc gửi email **support@travyy.com** trong 7 ngày sau khi đi.", category: "booking-payment", location: "Hà Nội", isLocal: true },

  // Account & Security
  { id: 5, question: "Không nhận được email xác minh tài khoản?", answer: "Kiểm tra mục **Spam/Quảng cáo**. Nếu vẫn không có, vào **Hồ sơ → Bảo mật**, bấm **Gửi lại email xác minh**.", category: "account-security", location: "Hồ Chí Minh", isLocal: false },
  { id: 6, question: "Đổi mật khẩu ở đâu?", answer: "Vào **Hồ sơ → Bảo mật**, chọn **Đổi mật khẩu**. Mật khẩu mới nên ≥ 8 ký tự và bật **2FA**.", category: "account-security", location: "Hà Nội", isLocal: true },
  { id: 7, question: "Có thể đăng nhập bằng Google/Facebook không?", answer: "Có. Bạn có thể liên kết tài khoản Google/Facebook để đăng nhập nhanh và an toàn hơn.", category: "account-security", location: "Đà Nẵng", isLocal: true },
  { id: 8, question: "Bị đăng nhập bất thường thì làm gì?", answer: "Đổi mật khẩu ngay, đăng xuất tất cả thiết bị trong **Hồ sơ → Bảo mật**, bật 2FA và liên hệ hỗ trợ.", category: "account-security", location: "Hà Nội", isLocal: true },

  // Travel Tips
  { id: 9, question: "Đi miền núi mùa lạnh cần mang gì?", answer: "Áo giữ nhiệt, áo khoác gió, giày chống trượt, thuốc cảm, miếng dán giữ nhiệt, túi chống ẩm.", category: "travel-tips", location: "Sa Pa", isLocal: true },
  { id: 10, question: "Đi biển 3 ngày 2 đêm cần chuẩn bị gì?", answer: "Kem chống nắng, đồ bơi, áo khoác mỏng, dép đi biển, túi chống nước, thuốc say sóng (nếu đi cano).", category: "travel-tips", location: "Phú Quốc", isLocal: false },
  { id: 11, question: "Ghé nhiều điểm trong ngày có mệt không?", answer: "Nên chọn tour có **thời gian nghỉ giữa các điểm** và mang theo snack/nước để giữ năng lượng.", category: "travel-tips", location: "Nha Trang", isLocal: true },
  { id: 12, question: "Đi nhóm 6 người nên lưu ý gì?", answer: "Chia nhóm 2–3 người/xe, thống nhất quỹ chung, phân công nhiệm vụ và chia sẻ vị trí để tránh lạc nhau.", category: "travel-tips", location: "Đà Lạt", isLocal: true },

  // Weather & Best Time
  { id: 13, question: "Miền Trung mùa nào ít mưa bão?", answer: "Thường là **tháng 2–8**. Từ 9–11 có bão/mưa lớn tuỳ năm – nên theo dõi dự báo sát ngày.", category: "weather-best-time", location: "Huế", isLocal: true },
  { id: 14, question: "Săn mây ở miền Bắc nên đi thời điểm nào?", answer: "Đầu đông **(10–12)** hoặc cuối đông **(1–2)**, tuỳ điều kiện gió mùa. Hỏi điều phối trước khi đi.", category: "weather-best-time", location: "Y Tý", isLocal: false },
  { id: 15, question: "Mưa lớn đột xuất thì tour xử lý ra sao?", answer: "Điều phối sẽ đề xuất **đổi lịch trình, đổi ngày** hoặc **hoàn tiền** theo chính sách an toàn.", category: "weather-best-time", location: "Quảng Bình", isLocal: true },
  { id: 16, question: "Trời quá nắng khi đi biển nên làm gì?", answer: "Mang áo chống nắng, đội nón rộng vành, bôi kem chống nắng 2–3h/lần, uống nhiều nước.", category: "weather-best-time", location: "Nha Trang", isLocal: true },

  // Shopping & Souvenir
  { id: 17, question: "Mua gì làm quà ở Hội An?", answer: "Đèn lồng, lụa tơ tằm, bánh đậu xanh, đồ gốm. Nhớ kiểm tra **chất liệu** trước khi mua.", category: "shopping-souvenir", location: "Hội An", isLocal: true },
  { id: 18, question: "Có nên mặc cả ở chợ địa phương?", answer: "Có thể **mặc cả lịch sự** 5–15%. Tránh mặc cả quá mức; so sánh giá 2–3 nơi trước khi quyết.", category: "shopping-souvenir", location: "Hồ Chí Minh", isLocal: false },
  { id: 19, question: "Mua đồ điện tử ở điểm du lịch có an toàn không?", answer: "Chỉ nên mua ở cửa hàng uy tín, có **bảo hành** rõ ràng. Tránh mua hàng xách tay không nguồn gốc.", category: "shopping-souvenir", location: "Hà Nội", isLocal: true },
  { id: 20, question: "Có xuất hóa đơn VAT khi mua quà tặng không?", answer: "Nhiều cửa hàng có hỗ trợ. Hãy yêu cầu **hóa đơn VAT** ngay tại thời điểm thanh toán.", category: "shopping-souvenir", location: "Đà Nẵng", isLocal: true }
];
