# TRAVYY - Touring Website

TRAVYY là một nền tảng du lịch toàn diện cho phép người dùng khám phá, đặt tour và quản lý trải nghiệm du lịch của họ.

## 📋 Mục lục
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)
- [Chạy dự án](#-chạy-dự-án)
- [Chạy tests](#-chạy-tests)
- [Coverage Report](#-coverage-report)
- [API Documentation](#-api-documentation)
- [Đóng góp](#-đóng-góp)
- [Giấy phép](#-giấy-phép)

## 🛠️ Công nghệ sử dụng

### Backend (touring-be)
- **Node.js** - Runtime JavaScript
- **Express.js** - Web framework
- **MongoDB** - Database NoSQL
- **Mongoose** - ODM cho MongoDB
- **JWT** - Authentication & Authorization
- **bcryptjs** - Password hashing
- **Zod** - Schema validation
- **Nodemailer** - Email service
- **PayPal SDK** - Payment processing
- **Passport.js** - OAuth authentication (Google, Facebook)
- **Multer** - File upload
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

### Frontend (touring-fe)
- **React** - UI library
- **Vite** - Build tool & dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Data fetching & caching
- **React Hook Form** - Form handling
- **Lucide React** - Icon library

### Testing
- **Jest** - Testing framework
- **Supertest** - HTTP endpoint testing
- **Bcrypt** - Password utilities

## 🏗️ Cấu trúc dự án

```
TRAVYY-touring-website/
├── touring-be/                 # Backend Node.js
│   ├── config/                 # Database configuration
│   ├── controller/             # Business logic controllers
│   │   ├── admin/             # Admin controllers
│   │   └── ...                # Other controllers
│   ├── middlewares/           # Express middlewares
│   ├── models/                # Mongoose models
│   │   ├── agency/           # Agency-related models
│   │   └── ...               # Other models
│   ├── routes/                # API routes
│   │   ├── admin/            # Admin routes
│   │   └── ...               # Other routes
│   ├── utils/                 # Utility functions
│   ├── test/                  # Test files
│   ├── server.js              # Main server file
│   └── package.json
├── touring-fe/                # Frontend React
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utilities
│   │   └── ...
│   ├── index.html
│   └── package.json
└── README.md
```

## 💻 Yêu cầu hệ thống

- **Node.js**: v16.0.0 trở lên
- **MongoDB**: v4.4 trở lên
- **npm**: v7.0.0 trở lên
- **Git**: v2.0 trở lên

## 🚀 Hướng dẫn cài đặt

### 1. Clone repository
```bash
git clone https://github.com/jayykioh/TRAVYY-touring-website.git
cd TRAVYY-touring-website
```

### 2. Cài đặt dependencies cho Backend
```bash
cd touring-be
npm install
```

### 3. Cài đặt dependencies cho Frontend
```bash
cd ../touring-fe
npm install
```

### 4. Cấu hình Environment Variables

Tạo file `.env` trong thư mục `touring-be`:

```env
# Database
MONGO_URI=mongodb://127.0.0.1:27017/travelApp
MONGODB_URI=mongodb://127.0.0.1:27017/travelApp

# JWT
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
ACCESS_TTL=10m
REFRESH_TTL=30d

# Server
PORT=4000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:5173

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET=your_paypal_secret
PAYPAL_MODE=sandbox

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Session
SESSION_SECRET=your_session_secret
```

## ▶️ Chạy dự án

### Development Mode

#### Backend
```bash
cd touring-be
npm run dev
```
Server sẽ chạy tại: http://localhost:4000

#### Frontend
```bash
cd touring-fe
npm run dev
```
Frontend sẽ chạy tại: http://localhost:5173

### Production Mode

#### Backend
```bash
cd touring-be
npm start
```

#### Frontend
```bash
cd touring-fe
npm run build
npm run preview
```

## 🧪 Chạy tests

### Backend Tests

#### Chạy tất cả tests:
```bash
cd touring-be
npm test
```

#### Chạy tests với watch mode (tự động chạy lại khi code thay đổi):
```bash
cd touring-be
npm run test:watch
```

#### Chạy tests với coverage report:
```bash
cd touring-be
npm run test:coverage
```

#### Chạy tests theo từng file:

```bash
cd touring-be

# Unit Tests
npm test -- --testPathPattern=auth.controller.test.js      # Test auth controller
npm test -- --testPathPattern=users.model.test.js          # Test users model
npm test -- --testPathPattern=jwt.utils.test.js            # Test JWT utilities
npm test -- --testPathPattern=wishlist.model.test.js       # Test wishlist model
npm test -- --testPathPattern=cart.controller.test.js      # Test cart controller
npm test -- --testPathPattern=bookingController.test.js    # Test booking controller
npm test -- --testPathPattern=helpController.test.js       # Test help controller
npm test -- --testPathPattern=notifyController.test.js     # Test notification controller
npm test -- --testPathPattern=payment.controller.test.js    # Test payment controller
npm test -- --testPathPattern=paypal.controller.test.js     # Test PayPal controller
npm test -- --testPathPattern=profile.controller.test.js    # Test profile controller
npm test -- --testPathPattern=review.controller.test.js     # Test review controller
npm test -- --testPathPattern=wishlist.controller.test.js   # Test wishlist controller

# Integration Tests
npm test -- --testPathPattern=auth.routes.integration.test.js  # Test auth routes

# Chạy tests với verbose output
npm test -- --testPathPattern=auth.controller.test.js --verbose
```

#### Chạy tests theo pattern:
- **Unit Tests**: Test từng function/class riêng lẻ
  - Controllers: `auth.controller.js`, `bookingController.js`, etc.
  - Models: `Users.js`, `Bookings.js`, etc.
  - Utils: `jwt.js`, `emailService.js`, etc.
- **Integration Tests**: Test tương tác giữa các module
  - API endpoints với supertest
  - Database operations
- **API Tests**: REST API endpoint testing
- **UI Tests**: Frontend component testing (Optional)
- **AI Prompt Tests**: AI-generated code quality testing
- **Coverage**: Mục tiêu >80% code coverage

### Test Files Location
```
touring-be/
├── test/
│   ├── setup.js                    # Test configuration & mocks
│   ├── unit/                       # Unit Tests
│   │   ├── auth.controller.test.js
│   │   ├── users.model.test.js
│   │   └── jwt.utils.test.js
│   ├── integration/                # Integration Tests
│   │   └── auth.routes.integration.test.js
│   ├── api/                        # API Tests
│   │   └── README.md
│   ├── ui/                         # UI Tests (Optional)
│   │   └── README.md
│   └── ai-prompt/                  # AI Prompt Tests
│       └── README.md
└── coverage/                       # Coverage reports (sau khi chạy npm run test:coverage)
    ├── index.html
    └── lcov-report/
```

## 📊 Coverage Report

### Overall Coverage: 49.89%

#### File-by-file Breakdown:

| File | Statements | Branches | Functions | Lines |
|------|------------|----------|-----------|-------|
| `controller/` | 52.10% | 42.52% | 61.24% | 52.75% |
| `controller/admin/` | 0% | 0% | 0% | 0% |
| `models/` | 44.31% | 0% | 0% | 48.05% |
| `models/agency/` | 0% | 0% | 0% | 0% |
| `routes/` | 46.40% | 3.38% | 3.84% | 49.65% |
| `routes/admin/` | 0% | 0% | 0% | 0% |
| `utils/` | 39.02% | 18.75% | 80% | 39.50% |
| **Total** | **49.89%** | **36.29%** | **46.56%** | **51.22%** |

#### Uncovered Lines:

**Lý do chính:**
- **Đã có tiến bộ đáng kể**: Coverage tăng từ 4.15% lên 49.89% với nhiều controllers và models được test
- **34 tests đang fail**: Cần fix các test failures để cải thiện coverage
- **Admin và agency modules**: Vẫn chưa có tests (0% coverage)
- **Một số controllers partial**: PayPal, Review, Notify controllers cần test thêm
- **Model methods**: Một số models chỉ có schema, chưa test methods

**Chi tiết uncovered:**
- **controller/admin/**: 407 statements - tất cả admin controllers chưa test
- **models/agency/**: 24 statements - agency models chưa test
- **routes/admin/**: 77 statements - admin routes chưa test integration
- **paypal.controller.js**: 284 statements - PayPal webhook handling
- **reviewController.js**: 320 statements - getReviews, getReviewStats functions
- **notifyController.js**: 426 statements - email sending và notification creation
- **paymentHelpers.js**: 121 statements - complex payment logic

**Giải pháp cải thiện:**
- Fix 34 failing tests để stabilize coverage hiện tại
- Viết thêm unit tests cho admin controllers và agency models
- Hoàn thiện tests cho PayPal, Review, Notify controllers
- Thêm integration tests cho admin routes
- Test methods của models thay vì chỉ schema

### 📄 Coverage Report Files
- **HTML Report**: `touring-be/coverage/index.html` - Interactive coverage browser
- **LCOV Report**: `touring-be/coverage/lcov-report/index.html` - Detailed line-by-line coverage
- **Summary Report**: `touring-be/COVERAGE_REPORT.md` - Detailed analysis and recommendations
- **Screenshot**: `touring-be/COVERAGE_SCREENSHOT.md` - Text representation of coverage report

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Đặt lại mật khẩu
- `POST /api/auth/change-password` - Đổi mật khẩu

### User Management
- `GET /api/profile` - Lấy thông tin profile
- `PUT /api/profile` - Cập nhật profile

### Tour Management
- `GET /api/tours` - Lấy danh sách tours
- `POST /api/tours` - Tạo tour mới (agency)
- `PUT /api/tours/:id` - Cập nhật tour

### Booking System
- `POST /api/bookings` - Đặt tour
- `GET /api/bookings` - Lấy lịch sử booking

## 👥 Vai trò thành viên

### Backend Team
- **Lead Developer**: Nguyễn Văn A - Architecture & Database Design
- **API Developer**: Trần Thị B - REST API Implementation
- **Security Specialist**: Lê Văn C - Authentication & Authorization
- **Testing Lead**: Phạm Thị D - Test Strategy & QA

### Frontend Team
- **UI/UX Designer**: Hoàng Văn E - Design System & Prototyping
- **Frontend Lead**: Đỗ Thị F - React Architecture & State Management
- **Frontend Developer**: Bùi Văn G - Component Development
- **Integration Specialist**: Vũ Thị H - API Integration & Testing

### DevOps & QA
- **DevOps Engineer**: Ngô Văn I - CI/CD & Deployment
- **QA Engineer**: Đinh Thị K - Manual Testing & Bug Tracking

## 🤝 Đóng góp

1. Fork project
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

### Coding Standards
- Sử dụng ESLint & Prettier
- Viết tests cho mọi feature mới
- Maintain code coverage >80%
- Sử dụng conventional commits

## 📄 Giấy phép

Dự án này sử dụng giấy phép MIT. Xem file `LICENSE` để biết thêm chi tiết.

---

**TRAVYY** - Khám phá thế giới cùng chúng tôi! 🌍✈️</content>
<parameter name="filePath">d:\FPT\Ky5\SWP391\TRAVYY-touring-website\README.md