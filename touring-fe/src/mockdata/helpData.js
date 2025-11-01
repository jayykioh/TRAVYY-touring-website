// ✅ src/mockdata/helpData.js

export const helpCategories = [
  {
    slug: "booking-payment",
    name: "Đặt tour & Thanh toán",
    icon: "💳",
    description: "Hướng dẫn đặt tour, thanh toán và hoàn tiền.",
    articleCount: 3,
  },
  {
    slug: "account-profile",
    name: "Tài khoản & Hồ sơ",
    icon: "👤",
    description: "Cập nhật thông tin cá nhân và bảo mật tài khoản.",
    articleCount: 2,
  },
  {
    slug: "promotions",
    name: "Khuyến mãi & Ưu đãi",
    icon: "🎟️",
    description: "Hướng dẫn nhập mã giảm giá và nhận ưu đãi đặc biệt.",
    articleCount: 2,
  },
];

// 🌟 Featured articles
export const helpFeaturedArticles = [
  {
    _id: "a1",
    slug: "how-to-cancel-booking",
    title: "Làm sao để hủy hoặc thay đổi tour đã đặt?",
    excerpt: "Bạn có thể hủy hoặc thay đổi tour trực tiếp trong trang 'Đặt chỗ của tôi'.",
    category: "Đặt tour & Thanh toán",
    views: 3421,
    helpfulnessRate: 94,
    icon: "📅",
  },
  {
    _id: "a2",
    slug: "travyy-account-guide",
    title: "Hướng dẫn tạo tài khoản Travyy",
    excerpt: "Đăng ký tài khoản Travyy giúp bạn quản lý tour, ưu đãi và thanh toán dễ dàng hơn.",
    category: "Tài khoản & Hồ sơ",
    views: 1578,
    helpfulnessRate: 88,
    icon: "🧭",
  },
];

// 📚 Articles grouped by category
export const helpArticlesByCategory = {
  "booking-payment": [
    {
      _id: "a1",
      slug: "cancel-booking",
      title: "Cách hủy tour đã đặt",
      excerpt: "Nếu bạn cần hủy tour, hãy truy cập phần 'Đặt chỗ của tôi' và chọn 'Hủy'.",
      icon: "🛑",
      views: 500,
      helpfulnessRate: 90,
      updatedAt: "2025-10-01",
    },
    {
      _id: "a2",
      slug: "payment-methods",
      title: "Các phương thức thanh toán được hỗ trợ",
      excerpt: "Travyy hỗ trợ thanh toán qua MoMo, PayPal và thẻ Visa/MasterCard.",
      icon: "💳",
      views: 720,
      helpfulnessRate: 93,
      updatedAt: "2025-10-02",
    },
  ],
  "account-profile": [
    {
      _id: "b1",
      slug: "change-password",
      title: "Cách đổi mật khẩu tài khoản",
      excerpt: "Vào mục 'Hồ sơ cá nhân' và chọn 'Đổi mật khẩu' để bảo mật hơn.",
      icon: "🔒",
      views: 890,
      helpfulnessRate: 87,
      updatedAt: "2025-10-03",
    },
  ],
  promotions: [
    {
      _id: "c1",
      slug: "use-promo-code",
      title: "Cách nhập mã khuyến mãi",
      excerpt: "Khi thanh toán tour, nhập mã giảm giá của bạn tại bước thanh toán để áp dụng ưu đãi.",
      icon: "🎫",
      views: 1100,
      helpfulnessRate: 91,
      updatedAt: "2025-10-04",
    },
    {
      _id: "c2",
      slug: "find-promotions",
      title: "Tìm khuyến mãi mới nhất ở đâu?",
      excerpt: "Bạn có thể xem danh sách các ưu đãi tại mục 'Khuyến mãi' trong trang chủ Travyy.",
      icon: "🔥",
      views: 950,
      helpfulnessRate: 89,
      updatedAt: "2025-10-05",
    },
  ],
};

// 📝 Article details (for HelpArticleView.jsx)
export const helpArticlesBySlug = {
  "cancel-booking": {
    _id: "a1",
    slug: "cancel-booking",
    title: "Cách hủy tour đã đặt",
    icon: "🛑",
    views: 500,
    helpfulCount: 30,
    notHelpfulCount: 3,
    helpfulnessRate: 91,
    updatedAt: "2025-10-01",
    content: `
## Cách hủy tour

1. Truy cập mục **Đặt chỗ của tôi**.
2. Chọn tour bạn muốn hủy.
3. Nhấn **Hủy tour** và xác nhận.

> 💡 Lưu ý: Tiền sẽ được hoàn theo chính sách hoàn hủy trong 3–5 ngày làm việc.
`,
    relatedArticles: [
      {
        slug: "payment-methods",
        title: "Các phương thức thanh toán được hỗ trợ",
        excerpt: "Travyy hỗ trợ MoMo, PayPal và thẻ quốc tế.",
        icon: "💳",
      },
    ],
  },
  "payment-methods": {
    _id: "a2",
    slug: "payment-methods",
    title: "Các phương thức thanh toán được hỗ trợ",
    icon: "💳",
    views: 720,
    helpfulCount: 20,
    notHelpfulCount: 1,
    helpfulnessRate: 95,
    updatedAt: "2025-10-02",
    content: `
Travyy hỗ trợ các hình thức thanh toán:

- 💳 **Thẻ quốc tế**: Visa, MasterCard.
- 📱 **MoMo**: Thanh toán nhanh qua QR.
- 💵 **PayPal**: Dành cho khách quốc tế.

> ⚠️ Luôn đảm bảo kiểm tra hóa đơn trước khi xác nhận thanh toán.
`,
    relatedArticles: [
      {
        slug: "cancel-booking",
        title: "Cách hủy tour đã đặt",
        excerpt: "Cách hủy tour và hoàn tiền nhanh.",
        icon: "🛑",
      },
    ],
  },
  "change-password": {
    _id: "b1",
    slug: "change-password",
    title: "Cách đổi mật khẩu tài khoản",
    icon: "🔒",
    views: 890,
    helpfulCount: 15,
    notHelpfulCount: 2,
    helpfulnessRate: 88,
    updatedAt: "2025-10-03",
    content: `
## Đổi mật khẩu Travyy

1. Vào **Hồ sơ cá nhân** → **Bảo mật**.
2. Chọn **Đổi mật khẩu**.
3. Nhập mật khẩu cũ và mật khẩu mới.
4. Nhấn **Lưu thay đổi**.

> 🧠 Gợi ý: Sử dụng mật khẩu mạnh gồm chữ hoa, số và ký tự đặc biệt.
`,
  },
  "use-promo-code": {
    _id: "c1",
    slug: "use-promo-code",
    title: "Cách nhập mã khuyến mãi",
    icon: "🎫",
    views: 1100,
    helpfulCount: 25,
    notHelpfulCount: 2,
    helpfulnessRate: 92,
    updatedAt: "2025-10-04",
    content: `
## Nhập mã khuyến mãi

Ở bước **Thanh toán**, nhập mã vào ô **Mã giảm giá** rồi nhấn **Áp dụng**.

> 🎁 Mỗi mã có thể chỉ áp dụng một lần.
`,
  },
  "find-promotions": {
    _id: "c2",
    slug: "find-promotions",
    title: "Tìm khuyến mãi mới nhất ở đâu?",
    icon: "🔥",
    views: 950,
    helpfulCount: 19,
    notHelpfulCount: 3,
    helpfulnessRate: 86,
    updatedAt: "2025-10-05",
    content: `
## Xem ưu đãi

Vào **Trang chủ → Khuyến mãi** để xem các ưu đãi đang hoạt động.

> 🏷️ Ưu đãi thay đổi mỗi tuần, nhớ kiểm tra thường xuyên!
`,
  },
};
