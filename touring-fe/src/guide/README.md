# 🧭 TRAVYY Tour Guide System

Hệ thống quản lý tour dành cho hướng dẫn viên - Giống như ứng dụng shipper trong Grab/ShopeeFood.

## 📁 Cấu trúc Thư mục

```
src/guide/
├── components/
│   ├── common/              # Components dùng chung
│   │   ├── Button.jsx       # Nút bấm với nhiều variants
│   │   ├── Card.jsx         # Card container
│   │   ├── Badge.jsx        # Badge/Tag
│   │   ├── Modal.jsx        # Modal/Dialog
│   │   └── LoadingSpinner.jsx
│   │
│   ├── layout/              # Layout components
│   │   ├── Sidebar.jsx      # Sidebar navigation (Desktop)
│   │   ├── Header.jsx       # Header với notification bell
│   │   ├── BottomNav.jsx    # Bottom navigation (Mobile)
│   │   └── MainLayout.jsx   # Layout wrapper chính
│   │
│   ├── home/                # Components trang Home
│   │   ├── WelcomeBanner.jsx
│   │   ├── NewTourPopup.jsx # Popup thông báo tour mới
│   │   ├── UpcomingTourList.jsx
│   │   └── TourCard.jsx
│   │
│   ├── notifications/       # Components thông báo
│   │   └── NotificationBell.jsx
│   │
│   └── [other components folders]
│
├── pages/                   # Các trang chính
│   ├── HomePage.jsx         # 🏠 Trang chủ
│   ├── RequestsPage.jsx     # 📬 Yêu cầu tour mới
│   ├── MyToursPage.jsx      # 📆 Quản lý tours
│   ├── NotificationsPage.jsx # 🔔 Thông báo
│   ├── EarningsPage.jsx     # 💰 Thu nhập
│   └── ProfilePage.jsx      # 👤 Profile
│
├── data/                    # API functions
│   └── guideAPI.js          # Centralized API calls for guide functionality
│
└── guide.routes.jsx         # Route configuration
```

## 🎯 Các Tính năng Chính

### 1. 🏠 Home Page

- **Welcome Banner**: Chào mừng hướng dẫn viên với thống kê nhanh
- **Quick Stats**: Hiển thị số liệu nhanh (Requests, Ongoing, Upcoming, Earnings)
- **Ongoing Tour Alert**: Cảnh báo tour đang diễn ra
- **New Tour Popup**: Popup hiển thị yêu cầu tour mới (tự động sau 2s)
- **Upcoming Tours**: Danh sách tour sắp tới

### 2. 📬 Requests Page

- **Filter Tabs**: Lọc theo All / Today / This Week
- **Request Cards**: Hiển thị thông tin tour request
- **Quick Actions**: Accept / Decline ngay trên card
- **Detail Modal**: Xem chi tiết tour request
- **Customer Info**: Thông tin khách hàng

### 3. 📆 My Tours Page

- **Tab Navigation**: Ongoing / Upcoming / Completed / Canceled
- **Tour Cards**: Hiển thị tour với trạng thái
- **Progress Bar**: Hiển thị tiến độ tour đang diễn ra
- **Empty States**: Thông báo khi không có tour

### 4. 🔔 Notifications Page

- **Notification List**: Danh sách tất cả thông báo
- **Priority Badges**: Phân loại theo mức độ ưu tiên
- **Unread Indicator**: Đánh dấu thông báo chưa đọc
- **Notification Bell**: Icon bell với badge số lượng (trong Header)

### 5. 💰 Earnings Page

- **Summary Cards**: Tổng quan thu nhập (Week/Month/Total/Pending)
- **Weekly Chart**: Biểu đồ cột thu nhập theo ngày trong tuần
- **Recent Payments**: Danh sách giao dịch gần đây
- **Payment Status**: Paid / Pending với badge

### 6. 👤 Profile Page

- **Profile Header**: Ảnh đại diện, rating, tổng tours
- **Edit Mode**: Chỉnh sửa thông tin cá nhân
- **Languages**: Ngôn ngữ hướng dẫn viên biết
- **Specialties**: Chuyên môn
- **Notification Settings**: Cấu hình thông báo

## 🎨 UI/UX Features

### Design System

- **Màu chủ đạo**: Emerald (xanh lá) cho hành động chính
- **Secondary colors**: Orange (cảnh báo), Red (từ chối), Green (chấp nhận)
- **Typography**: Tailwind default với custom font weights
- **Spacing**: Consistent padding và margins
- **Border radius**: Rounded-lg/xl cho modern look

### Responsive Design

- **Desktop**: Sidebar navigation bên trái
- **Mobile**: Bottom navigation bar
- **Breakpoints**: Tailwind default (md, lg)
- **Touch-friendly**: Button sizes phù hợp cho mobile

### Interactive Elements

- **Hover effects**: Tất cả card và button
- **Loading states**: Button với loading spinner
- **Empty states**: Illustrations cho empty pages
- **Animations**: Fade in, slide up, pulse
- **Badges with numbers**: Notification counts

## 🚀 Cách Sử dụng

### 1. Truy cập hệ thống Guide

```
http://localhost:5173/guide
```

### 2. Navigation

- Desktop: Sử dụng Sidebar bên trái
- Mobile: Sử dụng Bottom Navigation

### 3. Workflow điển hình

**Bước 1: Nhận yêu cầu tour mới**

- Popup tự động hiển thị khi có request mới
- Xem chi tiết tour
- Accept hoặc Decline

**Bước 2: Quản lý tour được chấp nhận**

- Vào "My Tours" tab "Upcoming"
- Xem chi tiết pickup point, special requests
- Theo dõi thời gian

**Bước 3: Thực hiện tour**

- Tour tự động chuyển sang "Ongoing"
- Progress bar hiển thị tiến độ
- Hoàn thành tour

**Bước 4: Kiểm tra thu nhập**

- Vào "Earnings" page
- Xem payment pending/paid
- Track weekly/monthly earnings

## 🔔 Notification System

### Loại thông báo:

1. **New Request** 📬 - Tour mới được gửi
2. **Payment Success** 💰 - Thanh toán thành công
3. **Tour Reminder** ⏰ - Nhắc nhở tour sắp diễn ra
4. **Cancellation** ❌ - Tour bị hủy
5. **Review** ⭐ - Đánh giá mới
6. **Schedule Change** 📅 - Thay đổi lịch trình

### Priority Levels:

- **High**: New requests, cancellations
- **Medium**: Reminders, schedule changes
- **Low**: Reviews

## 📱 Mobile Optimization

### Bottom Navigation (< 768px)

- 5 tabs chính: Home, Requests, Tours, Earnings, Profile
- Badge hiển thị số lượng requests mới
- Active state rõ ràng
- Touch-friendly size

### Responsive Grid

- Desktop: 3-4 columns
- Tablet: 2 columns
- Mobile: 1 column

## 🎯 Next Steps (Tích hợp với Backend)

1. **API Integration**

   - Replace mock data với real API calls
   - WebSocket cho realtime notifications
   - Authentication & Authorization

2. **Additional Features**

   - Chat với khách hàng
   - GPS tracking trong tour
   - Upload hình ảnh tour
   - Rating & Review system
   - Advanced analytics

3. **Performance**
   - Lazy loading components
   - Infinite scroll cho lists
   - Image optimization
   - Cache strategies

## 🛠️ Technologies Used

- **React** 18+ với Hooks
- **React Router** v6 - Navigation
- **Tailwind CSS** - Styling
- **Lottie** - Animations (optional)
- **Date-fns** / **Moment.js** - Date formatting

## 📝 Notes

- Tất cả data hiện tại là MOCK data
- Responsive design đã được implement
- Components có thể tái sử dụng
- Ready for backend integration
- Follow best practices và clean code

---

**Developed for TRAVYY Tour Guide System** 🧭✨
