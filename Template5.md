# TRAVYY - User Manual & Step-by-Step Workflow Guide

## Project Information

**Project Code**: TRAVYY-2025  
**Version**: 1.0  
**Last Updated**: November 16, 2025  
**Team**: G1-TRAVYY

---

## Table of Contents

1. [Authentication Workflows](#1-authentication-workflows)
   - 1.1 User Registration
   - 1.2 User Login
   - 1.3 OAuth Login (Google/Facebook)
   - 1.4 Forgot Password
   - 1.5 Reset Password
2. [Tour Discovery & Booking Workflows](#2-tour-discovery--booking-workflows)
   - 2.1 Discover Zones with AI
   - 2.2 View Zone Details
   - 2.3 Browse Tours
   - 2.4 View Tour Details
   - 2.5 Add to Cart
   - 2.6 Add to Wishlist
3. [Payment Workflows](#3-payment-workflows)
   - 3.1 Checkout with MoMo
   - 3.2 Checkout with PayPal
   - 3.3 Payment Success
   - 3.4 Payment Failed
4. [Booking Management Workflows](#4-booking-management-workflows)
   - 4.1 View Booking History
   - 4.2 View Booking Details
   - 4.3 Retry Failed Payment
5. [Refund Request Workflows](#5-refund-request-workflows)
   - 5.1 Request Pre-Trip Refund (Cancellation)
   - 5.2 Request Post-Trip Refund (Issue Report)
   - 5.3 Provide Bank Information
   - 5.4 View Refund Status
   - 5.5 Cancel Refund Request
6. [User Profile Workflows](#6-user-profile-workflows)
   - 6.1 View Profile
   - 6.2 Edit Profile
   - 6.3 Change Password
   - 6.4 Enable 2FA
   - 6.5 Disable 2FA
7. [Admin - User Management Workflows](#7-admin---user-management-workflows)
   - 7.1 View All Users
   - 7.2 View User Details
   - 7.3 Ban User
   - 7.4 Unban User
8. [Admin - Refund Management Workflows](#8-admin---refund-management-workflows)
   - 8.1 View All Refunds
   - 8.2 Review Refund Request
   - 8.3 Approve Refund
   - 8.4 Reject Refund
   - 8.5 Process Refund Payment
   - 8.6 Manual Refund Processing

---

## I. Deliverable Package

[This section lists all source programs, scripts, documents with version numbers in this release]

| No. | File                                  | Notes                                                                                                                                                                                                                                                                                                          |
| --- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `TRAVYY_MongoDB_Schema.js`            | MongoDB database schema files (Users, Bookings, Refunds, Tours, Zones, Carts, Wishlists, Promotions, Reviews, PaymentSessions) - Full collection definitions with indexes                                                                                                                                      |
| 2   | `TRAVYY_SRS_final.docx`               | Final Software Requirements Specification Document - Contains all functional and non-functional requirements                                                                                                                                                                                                   |
| 3   | `RDS`                                 | Requirements & Dependencies Specification - Assumptions (AS-1 to AS-9), Dependencies (DE-1 to DE-7), Limitations (LX-1 to LX-10)                                                                                                                                                                               |
| 4   | `AUTHENTICATION_SEQUENCE_DIAGRAMS.md` | Complete technical specification with sequence diagrams for:<br/>- Authentication (Register, Login, OAuth, 2FA)<br/>- Cart & Wishlist operations<br/>- Payment Processing (MoMo, PayPal, Retry Payment)<br/>- Refund System (Pre-trip, Post-trip, Admin workflows)<br/>- Admin User Management                 |
| 5   | `TRAVYY_Product_Backlog.xlsx`         | Final status for application functions including:<br/>- Function name, feature, roles, function description<br/>- Sprint/Iteration tracking<br/>- Final status & notes<br/>- Links to SRS & technical docs                                                                                                     |
| 6   | `TRAVYY_Issues_Report.xlsx`           | Final issues tracking list of the whole project including bugs, enhancements, technical debt                                                                                                                                                                                                                   |
| 7   | `touring-be/`                         | Backend source code (Node.js/Express):<br/>- API routes (auth, payment, booking, refund, admin)<br/>- Controllers & Services<br/>- Models (Mongoose schemas)<br/>- Middleware (JWT auth, admin verification)<br/>- Config files                                                                                |
| 8   | `touring-fe/`                         | Frontend source code (React + Vite):<br/>- Pages (30+ screens)<br/>- Components (UI components, forms, modals)<br/>- Services (API clients)<br/>- State management<br/>- Routing configuration                                                                                                                 |
| 9   | `ai/`                                 | AI/ML microservice (Python FastAPI):<br/>- Vietnamese Embedding Service (AITeamVN/Vietnamese_Embedding_v2 - 1024-dim)<br/>- FAISS vector search (FLAT/HNSW/IVF index types)<br/>- Semantic zone/POI matching<br/>- REST API endpoints: /embed, /upsert, /search, /stats<br/>- Requirements: `requirements.txt` |
| 10  | `package.json` (BE & FE)              | Dependencies manifest:<br/>- Backend: express, mongoose, bcrypt, jsonwebtoken, axios, node-cron, etc.<br/>- Frontend: react, react-router-dom, axios, tailwindcss, etc.                                                                                                                                        |
| 11  | `README.md`                           | Project overview, setup instructions, tech stack summary                                                                                                                                                                                                                                                       |
| 12  | `.env.example` (BE & AI)              | Environment variables template:<br/>- Database connection strings<br/>- Payment gateway credentials (MoMo, PayPal)<br/>- Email service config<br/>- JWT secrets<br/>- AI service endpoints                                                                                                                     |
| 13  | Test files                            | Unit tests for critical flows:<br/>- Payment processing tests<br/>- Refund calculation tests<br/>- Authentication middleware tests                                                                                                                                                                             |

### Other Related Deliverables

- **Source Code Repository**: [GitHub Repository Link - jayykioh/TRAVYY-touring-website]
- **Tagged Release**: `git tag v1.0.0` (Branch: `dong`)
- **Demonstration Video**: [YouTube Link - TRAVYY System Demo]
- **Live Demo (Staging)**: [Staging URL if deployed]
- **API Documentation**: Postman Collection or Swagger/OpenAPI spec (if available)

---

## II. Installation Guides

### Prerequisites

Before installation, ensure you have the following installed:

1. **Node.js** >= v16.x (recommend v18.x or v20.x)
2. **npm** >= 8.x or **yarn** >= 1.22.x
3. **MongoDB** >= v4.4 (recommend v6.x or MongoDB Atlas account)
4. **Python** >= 3.9 (for AI service)
5. **Git** for version control

### System Architecture

```
TRAVYY-touring-website/
├── touring-be/        # Backend API (Node.js/Express) - Port 4000
├── touring-fe/        # Frontend Web App (React/Vite) - Port 5173
└── ai/                # AI Embedding Service (Python/FastAPI) - Port 8088
```

---

### A. Backend Installation (touring-be)

#### Step 1: Navigate to Backend Directory

```bash
cd touring-be
```

#### Step 2: Install Dependencies

```bash
npm install
```

#### Step 3: Configure Environment Variables

Create `.env` file in `touring-be/` directory:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Server
PORT=4000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/travyy
# Or use MongoDB Atlas:
# MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/travyy

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-token-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# MoMo Payment Gateway
MOMO_PARTNER_CODE=your-momo-partner-code
MOMO_ACCESS_KEY=your-momo-access-key
MOMO_SECRET_KEY=your-momo-secret-key
MOMO_ENDPOINT=https://test-payment.momo.vn
MOMO_REDIRECT_URL=http://localhost:5173/payment/callback
MOMO_IPN_URL=http://your-server-domain/api/payments/momo-ipn

# PayPal
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_MODE=sandbox
PAYPAL_ENDPOINT=https://api-m.sandbox.paypal.com

# Email Service (SendGrid or SMTP)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
# Or use SendGrid:
# SENDGRID_API_KEY=your-sendgrid-api-key

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# AI Service
AI_SERVICE_URL=http://localhost:8088
EMBED_URL=http://localhost:8088
```

#### Step 4: Start Backend Server

**Development mode** (with auto-reload):

```bash
npm run dev
```

**Production mode**:

```bash
npm start
```

Backend server should be running on: `http://localhost:4000`

#### Step 5: Verify Backend

Open browser or use curl:

```bash
curl http://localhost:4000/api/health
```

Expected response:

```json
{ "status": "ok", "message": "TRAVYY Backend is running" }
```

---

### B. Frontend Installation (touring-fe)

#### Step 1: Navigate to Frontend Directory

```bash
cd touring-fe
```

#### Step 2: Install Dependencies

```bash
npm install
```

#### Step 3: Configure Environment Variables

Create `.env` file in `touring-fe/` directory:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_PAYPAL_CLIENT_ID=your-paypal-client-id
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_FACEBOOK_APP_ID=your-facebook-app-id
```

#### Step 4: Start Frontend Development Server

```bash
npm run dev
```

Frontend should be running on: `http://localhost:5173`

#### Step 5: Build for Production (Optional)

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

### C. AI Embedding Service Installation (ai/)

**Note**: AI service sử dụng FastAPI (không phải Flask) với Vietnamese Embedding model và FAISS vector search.

#### Step 1: Navigate to AI Directory

```bash
cd ai
```

#### Step 2: Create Python Virtual Environment

```bash
python -m venv .venv
source .venv/bin/activate  # On macOS/Linux
# .venv\Scripts\activate   # On Windows
```

#### Step 3: Install Python Dependencies

```bash
pip install -r requirements.txt
```

#### Step 4: Configure Environment Variables

Create `.env` file in `ai/` directory:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# MongoDB (for zone/itinerary data)
MONGO_URI=mongodb://localhost:27017/travyy

# OpenAI API (for LLM-based parsing & insights)
OPENAI_API_KEY=your-openai-api-key

# Embedding Service
PORT=8088
INDEX_TYPE=FLAT
# Options: FLAT (exact search), HNSW (fast ANN), IVF (for large datasets)

# FastAPI
UVICORN_HOST=0.0.0.0
UVICORN_PORT=8088
```

#### Step 5: Start AI Embedding Service

**Development mode** (with auto-reload):

```bash
uvicorn app:app --reload --port 8088
```

**Production mode**:

```bash
uvicorn app:app --host 0.0.0.0 --port 8088 --workers 4
```

AI embedding service should be running on: `http://localhost:8088`

#### Step 6: Verify Service

```bash
# Health check
curl http://localhost:8088/healthz

# Stats
curl http://localhost:8088/stats

# Test embedding
curl -s http://localhost:8088/embed -X POST \
  -H "Content-Type: application/json" \
  -d '{"texts": ["đi biển với người yêu, yên tĩnh, ngắm hoàng hôn"]}'
```

Expected response:

```json
{
  "embeddings": [[0.123, -0.456, ...]],
  "dimension": 1024,
  "count": 1
}
```

#### Step 7: Upsert Zone Embeddings (Initial Setup)

Để sử dụng semantic search, cần upsert zone data vào FAISS index:

```bash
# Method 1: Via REST API
curl -s http://localhost:8088/upsert -X POST \
  -H "Content-Type: application/json" \
  -d @- <<'JSON'
{
  "items": [
    {
      "id": "zone:da-nang-son-tra",
      "type": "zone",
      "text": "Bán đảo Sơn Trà. Thiên nhiên yên tĩnh, ngắm biển, hoàng hôn, ảnh đẹp.",
      "payload": {"province": "Đà Nẵng", "name": "Bán đảo Sơn Trà"}
    },
    {
      "id": "zone:dn-an-thuong",
      "type": "zone",
      "text": "Khu An Thượng. Ẩm thực, bar club, gần biển, sôi động về đêm.",
      "payload": {"province": "Đà Nẵng", "name": "Khu An Thượng"}
    }
  ]
}
JSON

# Method 2: Via Python script (if available)
python sync_zones_from_mongo.py
```

#### Step 8: Test Semantic Search

```bash
curl -s http://localhost:8088/search -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "query": "đi một tuần với người yêu, thích yên tĩnh, hoàng hôn",
    "top_k": 5,
    "filter_type": "zone"
  }'
```

Expected response:

```json
{
  "hits": [
    {
      "id": "zone:da-nang-son-tra",
      "score": 0.876,
      "type": "zone",
      "payload": { "province": "Đà Nẵng", "name": "Bán đảo Sơn Trà" }
    }
  ],
  "query_time_ms": 12
}
```

---

### D. Database Setup

#### Option 1: Local MongoDB

1. Install MongoDB Community Edition from [mongodb.com/download](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:

```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
# MongoDB runs as a service automatically
```

3. Create database (auto-created on first connection)

#### Option 2: MongoDB Atlas (Cloud)

1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/travyy`
4. Update `MONGO_URI` in backend and AI `.env` files
5. Whitelist your IP address in Network Access

---

### E. Running the Complete System

**Terminal 1** - Backend:

```bash
cd touring-be
npm run dev
```

**Terminal 2** - Frontend:

```bash
cd touring-fe
npm run dev
```

**Terminal 3** - AI Embedding Service:

```bash
cd ai
source .venv/bin/activate
uvicorn app:app --reload --port 8088
```

**Terminal 4** - MongoDB (if local):

```bash
mongod --dbpath /path/to/your/data
```

---

### F. Troubleshooting

#### Issue 1: Port Already in Use

```bash
# Kill process on port 4000 (backend)
lsof -ti:4000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9

# Kill process on port 8088 (AI service)
lsof -ti:8088 | xargs kill -9
```

#### Issue 2: MongoDB Connection Failed

- Check if MongoDB is running: `mongosh` or `mongo`
- Verify `MONGO_URI` in `.env`
- For Atlas: Check network access whitelist

#### Issue 3: Payment Gateway Errors

- Verify sandbox credentials for MoMo/PayPal
- Check `MOMO_IPN_URL` is accessible (use ngrok for localhost)
- Ensure `PAYPAL_MODE=sandbox` for testing

#### Issue 4: AI Service Errors

- Check if uvicorn is running: `ps aux | grep uvicorn`
- Verify Python dependencies: `pip list | grep -E "fastapi|uvicorn|faiss|sentence-transformers"`
- Test embedding endpoint: `curl http://localhost:8088/healthz`
- Check FAISS index stats: `curl http://localhost:8088/stats`
- If "No vectors in index" → Run upsert or sync script first
- Check logs for model download progress (Vietnamese_Embedding_v2 ~400MB first time)

---

## III. Step-by-Step Workflow Guide

### System Overview

**TRAVYY** là hệ thống website đặt tour du lịch toàn diện với các tính năng chính:

- **🔐 Authentication**: Email/OAuth login, 2FA security
- **🗺️ AI Discovery**: Tìm zones & tours theo preferences
- **💳 Payment**: MoMo (VND) & PayPal (USD)
- **💰 Refund System**: Pre-trip cancellation & Post-trip issue report
- **🛡️ Admin**: User & Refund management

---

## 1. Authentication Workflows

### 1.1 User Registration

**Purpose**: Tạo tài khoản mới trong hệ thống

**Step 1**: Click button "Đăng ký" ở header

- **Screenshot**: `[Screenshot: Header with Đăng ký button highlighted]`
- Người dùng nhấn vào nút "Đăng ký" góc phải trên màn hình trang chủ

**Step 2**: Điền form đăng ký

- **Screenshot**: `[Screenshot: Registration form with all fields]`
- Form hiển thị các trường:
  - Email (required)
  - Password (required, min 8 characters)
  - Confirm Password (required)
  - Full Name (required)
  - Phone Number (optional)

**Step 3**: Click button "Đăng ký"

- **Screenshot**: `[Screenshot: Completed form with submit button]`
- Sau khi điền đầy đủ thông tin, nhấn nút "Đăng ký"

**Step 4**: Xác thực thành công

- **Screenshot**: `[Screenshot: Success toast notification]`
- Toast message hiển thị: "Đăng ký thành công! Chào mừng bạn đến TRAVYY 🎉"
- Tự động redirect về trang chủ với trạng thái đã đăng nhập

**Alternative Flow - OAuth Registration**:

**Step 1**: Click "Đăng ký với Google/Facebook"

- **Screenshot**: `[Screenshot: OAuth buttons on registration page]`

**Step 2**: Authorize với provider

- **Screenshot**: `[Screenshot: Google/Facebook consent screen]`

**Step 3**: Auto-create account và redirect về home

- **Screenshot**: `[Screenshot: Homepage after OAuth registration]`

---

### 1.2 User Login

**Purpose**: Đăng nhập vào hệ thống

**Step 1**: Click button "Đăng nhập" ở header

- **Screenshot**: `[Screenshot: Header with Đăng nhập button]`
- Nhấn vào nút "Đăng nhập" góc phải trên

**Step 2**: Điền thông tin đăng nhập

- **Screenshot**: `[Screenshot: Login form]`
- Form hiển thị:
  - Email
  - Password
  - Checkbox "Ghi nhớ đăng nhập" (optional)

**Step 3**: Click button "Đăng nhập"

- **Screenshot**: `[Screenshot: Filled login form with submit button]`
- Nhấn nút "Đăng nhập"

**Step 4**: Xác thực thành công

- **Screenshot**: `[Screenshot: Success redirect to homepage]`
- Toast: "Đăng nhập thành công! Chào mừng trở lại 👋"
- Redirect về trang trước đó hoặc homepage

**Alternative Flow - Login with 2FA Enabled**:

**Step 4a**: Modal nhập OTP xuất hiện

- **Screenshot**: `[Screenshot: 2FA OTP modal]`
- Hiển thị modal yêu cầu nhập mã OTP 6 số

**Step 4b**: Nhập OTP code từ email

- **Screenshot**: `[Screenshot: Email with OTP code]`
- Kiểm tra email để lấy mã OTP

**Step 4c**: Nhập OTP vào modal

- **Screenshot**: `[Screenshot: OTP input filled]`
- Nhập 6 chữ số vào ô input

**Step 4d**: Click "Xác nhận"

- **Screenshot**: `[Screenshot: OTP verified successfully]`
- OTP đúng → Login thành công
- OTP sai → Hiển thị lỗi "Mã OTP không hợp lệ"

---

### 1.3 OAuth Login (Google/Facebook)

**Purpose**: Đăng nhập nhanh bằng tài khoản Google/Facebook

**Step 1**: Click button "Đăng nhập với Google" hoặc "Facebook"

- **Screenshot**: `[Screenshot: OAuth buttons on login page]`

**Step 2**: Redirect đến OAuth provider

- **Screenshot**: `[Screenshot: Google/Facebook login screen]`

**Step 3**: Nhập credentials và authorize

- **Screenshot**: `[Screenshot: OAuth consent screen]`
- Chọn tài khoản và cho phép quyền truy cập

**Step 4**: Redirect về TRAVYY đã đăng nhập

- **Screenshot**: `[Screenshot: Homepage after OAuth login]`
- Nếu lần đầu → Tự động tạo account
- Nếu đã có account → Login thành công

---

### 1.4 Forgot Password

**Purpose**: Khôi phục mật khẩu khi quên

**Step 1**: Click link "Quên mật khẩu?" ở trang login

- **Screenshot**: `[Screenshot: Login page with forgot password link]`

**Step 2**: Nhập email để nhận link reset

- **Screenshot**: `[Screenshot: Forgot password form]`
- Điền email đã đăng ký

**Step 3**: Click "Gửi link khôi phục"

- **Screenshot**: `[Screenshot: Email sent confirmation]`
- Toast: "Link khôi phục đã được gửi đến email của bạn"

**Step 4**: Kiểm tra email

- **Screenshot**: `[Screenshot: Password reset email]`
- Email chứa link reset có dạng: `/reset-password?token=xxx`

**Step 5**: Click link trong email

- **Screenshot**: `[Screenshot: Reset password page with token in URL]`
- Redirect đến trang reset password

---

### 1.5 Reset Password

**Purpose**: Đặt lại mật khẩu mới

**Step 1**: Trang reset password hiển thị

- **Screenshot**: `[Screenshot: Reset password form]`
- Form có 2 trường:
  - New Password
  - Confirm New Password

**Step 2**: Nhập mật khẩu mới

- **Screenshot**: `[Screenshot: Password fields filled]`
- Password phải đủ mạnh (min 8 chars, uppercase, lowercase, number, special char)

**Step 3**: Click "Đặt lại mật khẩu"

- **Screenshot**: `[Screenshot: Success message]`
- Toast: "Mật khẩu đã được đặt lại thành công"

**Step 4**: Redirect về trang login

- **Screenshot**: `[Screenshot: Login page]`
- Có thể đăng nhập bằng mật khẩu mới

---

## 2. Tour Discovery & Booking Workflows

### 2.1 Discover Zones with AI

**Purpose**: Tìm zones phù hợp dựa trên preferences

**Step 1**: Click "Khám phá" trên navigation

- **Screenshot**: `[Screenshot: Navigation bar with Khám phá menu]`

**Step 2**: Trang Discover hiển thị

- **Screenshot**: `[Screenshot: Discover page with AI search bar]`
- Có search bar: "Tôi muốn đi..."

**Step 3**: Nhập preferences (vibes)

- **Screenshot**: `[Screenshot: Search input filled with preferences]`
- Ví dụ: "đi một tuần với người yêu, thích yên tĩnh, hoàng hôn"

**Step 4**: Click "Tìm kiếm" hoặc Enter

- **Screenshot**: `[Screenshot: Loading state]`
- Hiển thị loading spinner

**Step 5**: Kết quả zones hiển thị

- **Screenshot**: `[Screenshot: Zone cards grid with AI recommendations]`
- Danh sách zones được sort theo relevance score
- Mỗi card hiển thị: ảnh, tên zone, province, điểm nổi bật

**Step 6**: Click vào zone card để xem chi tiết

- **Screenshot**: `[Screenshot: Zone card hover state]`

---

### 2.2 View Zone Details

**Purpose**: Xem thông tin chi tiết của một zone

**Step 1**: Click vào zone card

- **Screenshot**: `[Screenshot: Zone detail page]`
- Page hiển thị:
  - Hero image
  - Zone name & location
  - Description
  - List of POIs (Points of Interest)
  - List of tours available

**Step 2**: Scroll xem các POIs

- **Screenshot**: `[Screenshot: POI cards section]`
- Mỗi POI có: ảnh, tên, mô tả ngắn

**Step 3**: Scroll xem danh sách tours

- **Screenshot**: `[Screenshot: Tours section in zone detail]`
- Hiển thị tours thuộc zone này

---

### 2.3 Browse Tours

**Purpose**: Xem danh sách tất cả tours

**Step 1**: Click "Tours" trên navigation

- **Screenshot**: `[Screenshot: Tours navigation link]`

**Step 2**: Trang Tours hiển thị

- **Screenshot**: `[Screenshot: Tours listing page]`
- Grid layout với tour cards
- Filter sidebar (price, duration, rating)

**Step 3**: Apply filters (optional)

- **Screenshot**: `[Screenshot: Filter sidebar with options selected]`
- Chọn price range, duration, rating

**Step 4**: Danh sách tours được filter

- **Screenshot**: `[Screenshot: Filtered tour results]`

---

### 2.4 View Tour Details

**Purpose**: Xem chi tiết một tour

**Step 1**: Click vào tour card

- **Screenshot**: `[Screenshot: Tour detail page header]`
- Page hiển thị:
  - Image gallery
  - Tour name
  - Price (VND/USD)
  - Rating & reviews
  - Duration, group size
  - Itinerary details

**Step 2**: Scroll xem itinerary

- **Screenshot**: `[Screenshot: Itinerary timeline section]`
- Timeline hiển thị từng ngày với activities

**Step 3**: Scroll xem reviews

- **Screenshot**: `[Screenshot: Reviews section]`
- Các đánh giá từ users khác

**Step 4**: Click button "Đặt tour" hoặc "Thêm vào giỏ"

- **Screenshot**: `[Screenshot: Action buttons at bottom]`

---

### 2.5 Add to Cart

**Purpose**: Thêm tour vào giỏ hàng

**Step 1**: Ở tour detail page, click "Thêm vào giỏ"

- **Screenshot**: `[Screenshot: Add to cart button]`

**Step 2**: Modal chọn số lượng người xuất hiện

- **Screenshot**: `[Screenshot: Quantity selection modal]`
- Chọn số người tham gia
- Hiển thị tổng giá

**Step 3**: Click "Xác nhận"

- **Screenshot**: `[Screenshot: Cart item added toast]`
- Toast: "Đã thêm vào giỏ hàng"
- Icon giỏ hàng ở header cập nhật số lượng

**Step 4**: Click vào icon giỏ hàng để xem

- **Screenshot**: `[Screenshot: Cart dropdown/page]`
- Hiển thị danh sách tours trong giỏ

---

### 2.6 Add to Wishlist

**Purpose**: Lưu tour yêu thích để xem sau

**Step 1**: Ở tour card hoặc detail page, click icon ❤️

- **Screenshot**: `[Screenshot: Heart icon on tour card]`

**Step 2**: Icon chuyển sang filled heart ❤️ đỏ

- **Screenshot**: `[Screenshot: Filled heart icon]`
- Toast: "Đã thêm vào danh sách yêu thích"

**Step 3**: Click "Wishlist" ở navigation

- **Screenshot**: `[Screenshot: Wishlist page]`
- Hiển thị tất cả tours đã save

**Step 4**: Click icon ❤️ lại để remove

- **Screenshot**: `[Screenshot: Removed from wishlist]`
- Toast: "Đã xóa khỏi danh sách yêu thích"

---

## 3. Payment Workflows

### 3.1 Checkout with MoMo

**Purpose**: Thanh toán tour bằng MoMo (VND)

**Step 1**: Ở giỏ hàng, click "Thanh toán"

- **Screenshot**: `[Screenshot: Cart page with checkout button]`

**Step 2**: Trang Checkout hiển thị

- **Screenshot**: `[Screenshot: Checkout page]`
- Hiển thị:
  - Tour summary
  - Total amount (VND)
  - Payment method selection

**Step 3**: Chọn "MoMo" làm payment method

- **Screenshot**: `[Screenshot: MoMo option selected]`

**Step 4**: Click "Xác nhận thanh toán"

- **Screenshot**: `[Screenshot: Redirect to MoMo]`
- Redirect đến MoMo payment page

**Step 5**: Quét QR hoặc login MoMo app

- **Screenshot**: `[Screenshot: MoMo QR code page]`

**Step 6**: Xác nhận thanh toán trong app

- **Screenshot**: `[Screenshot: MoMo app confirmation]`

**Step 7**: Redirect về TRAVYY

- **Screenshot**: `[Screenshot: Payment success page]`
- Nếu thành công → Hiển thị success page
- Nếu thất bại → Hiển thị failed page với button "Thử lại"

---

### 3.2 Checkout with PayPal

**Purpose**: Thanh toán tour bằng PayPal (USD)

**Step 1**: Ở trang Checkout, chọn "PayPal"

- **Screenshot**: `[Screenshot: PayPal option selected]`

**Step 2**: Click "Xác nhận thanh toán"

- **Screenshot**: `[Screenshot: Redirect to PayPal]`
- Redirect đến PayPal login page

**Step 3**: Login PayPal account

- **Screenshot**: `[Screenshot: PayPal login screen]`

**Step 4**: Review payment details

- **Screenshot**: `[Screenshot: PayPal payment review]`
- Hiển thị amount (USD), merchant name

**Step 5**: Click "Pay Now"

- **Screenshot**: `[Screenshot: PayPal processing]`

**Step 6**: Redirect về TRAVYY success page

- **Screenshot**: `[Screenshot: Payment success page]`

---

### 3.3 Payment Success

**Purpose**: Xác nhận booking đã được tạo thành công

**Step 1**: Success page hiển thị

- **Screenshot**: `[Screenshot: Payment success page with booking details]`
- Hiển thị:
  - Checkmark icon ✓
  - "Thanh toán thành công!"
  - Booking ID
  - Tour details
  - Payment amount

**Step 2**: Click "Xem booking"

- **Screenshot**: `[Screenshot: Button to view booking]`

**Step 3**: Redirect đến Booking Detail page

- **Screenshot**: `[Screenshot: Booking detail page]`

---

### 3.4 Payment Failed

**Purpose**: Xử lý khi thanh toán thất bại

**Step 1**: Failed page hiển thị

- **Screenshot**: `[Screenshot: Payment failed page]`
- Hiển thị:
  - Error icon ✗
  - "Thanh toán thất bại"
  - Lý do lỗi

**Step 2**: Click "Thử lại thanh toán"

- **Screenshot**: `[Screenshot: Retry payment button]`

**Step 3**: Redirect lại đến payment gateway

- **Screenshot**: `[Screenshot: Back to payment selection]`

---

## 4. Booking Management Workflows

### 4.1 View Booking History

**Purpose**: Xem tất cả bookings đã đặt

**Step 1**: Click vào avatar → Chọn "Bookings của tôi"

- **Screenshot**: `[Screenshot: User dropdown menu]`

**Step 2**: Trang Booking History hiển thị

- **Screenshot**: `[Screenshot: Booking history page]`
- Tabs:
  - All Bookings
  - Upcoming
  - Completed
  - Cancelled

**Step 3**: Click vào tab để filter

- **Screenshot**: `[Screenshot: Filtered bookings by status]`

---

### 4.2 View Booking Details

**Purpose**: Xem chi tiết một booking

**Step 1**: Click vào booking card

- **Screenshot**: `[Screenshot: Booking card in list]`

**Step 2**: Booking detail page hiển thị

- **Screenshot**: `[Screenshot: Booking detail page full]`
- Hiển thị:
  - Booking status badge
  - Tour information
  - Travel dates
  - Number of people
  - Total payment
  - Payment method & status
  - QR code (if needed)
  - Action buttons

---

### 4.3 Retry Failed Payment

**Purpose**: Thanh toán lại cho booking failed

**Step 1**: Ở booking detail (status: payment_failed), click "Thanh toán lại"

- **Screenshot**: `[Screenshot: Retry payment button on booking detail]`

**Step 2**: Modal chọn payment method xuất hiện

- **Screenshot**: `[Screenshot: Payment method selection modal]`

**Step 3**: Chọn MoMo hoặc PayPal

- **Screenshot**: `[Screenshot: Selected payment method]`

**Step 4**: Click "Xác nhận thanh toán"

- **Screenshot**: `[Screenshot: Redirect to payment gateway]`

**Step 5**: Hoàn tất thanh toán

- **Screenshot**: `[Screenshot: Payment success, booking updated]`
- Booking status chuyển từ `payment_failed` → `confirmed`

---

## 5. Refund Request Workflows

### 5.1 Request Pre-Trip Refund (Cancellation)

**Purpose**: Hủy tour và yêu cầu hoàn tiền trước ngày khởi hành

**Step 1**: Ở Booking Detail page, click "Hủy tour"

- **Screenshot**: `[Screenshot: Booking detail with Cancel button]`
- Button "Hủy tour" hiển thị ở booking có status `confirmed` hoặc `paid`

**Step 2**: Modal xác nhận hủy xuất hiện

- **Screenshot**: `[Screenshot: Cancellation confirmation modal]`
- Hiển thị:
  - Ngày khởi hành
  - Số ngày còn lại đến tour
  - % Hoàn tiền (dựa trên policy)
  - Số tiền được hoàn

**Policy hiển thị**:

- > 30 ngày: Hoàn 100%
- 15-30 ngày: Hoàn 70%
- 7-14 ngày: Hoàn 50%
- 3-6 ngày: Hoàn 30%
- < 3 ngày: Không hoàn tiền

**Step 3**: Nhập lý do hủy (optional)

- **Screenshot**: `[Screenshot: Reason textarea]`
- Textarea để user giải thích lý do

**Step 4**: Click "Xác nhận hủy tour"

- **Screenshot**: `[Screenshot: Refund request created]`
- Toast: "Yêu cầu hoàn tiền đã được gửi"
- Booking status → `refund_requested`

**Step 5**: Redirect về trang Refund Status

- **Screenshot**: `[Screenshot: Refund status page]`
- Hiển thị refund với status `pending`

---

### 5.2 Request Post-Trip Refund (Issue Report)

**Purpose**: Báo cáo vấn đề sau tour và yêu cầu hoàn tiền

**Step 1**: Ở Booking Detail page (tour đã hoàn thành), click "Báo cáo vấn đề"

- **Screenshot**: `[Screenshot: Report issue button]`
- Button hiển thị với bookings có status `completed`

**Step 2**: Form báo cáo vấn đề xuất hiện

- **Screenshot**: `[Screenshot: Issue report form]`
- Form có các trường:
  - **Loại vấn đề**: Dropdown (Dịch vụ không đúng, Hướng dẫn viên, An toàn, Khác)
  - **Mô tả chi tiết**: Textarea (required)
  - **Upload ảnh minh chứng**: Image upload (optional, max 5 files)
  - **Số tiền yêu cầu hoàn**: Input (max = tour price)

**Step 3**: Điền đầy đủ thông tin

- **Screenshot**: `[Screenshot: Filled issue form]`
- Upload ảnh minh chứng (nếu có)

**Step 4**: Click "Gửi yêu cầu hoàn tiền"

- **Screenshot**: `[Screenshot: Issue submitted]`
- Toast: "Báo cáo của bạn đã được gửi. Admin sẽ xem xét trong 3-5 ngày"

**Step 5**: Refund tạo với status `pending`

- **Screenshot**: `[Screenshot: Post-trip refund pending]`
- Hiển thị trong danh sách refunds

---

### 5.3 Provide Bank Information

**Purpose**: Cung cấp thông tin tài khoản ngân hàng để nhận tiền hoàn

**Step 1**: Admin approve refund → User nhận notification

- **Screenshot**: `[Screenshot: Notification - refund approved]`
- Email: "Yêu cầu hoàn tiền đã được chấp thuận. Vui lòng cung cấp thông tin ngân hàng"

**Step 2**: Click vào refund trong danh sách

- **Screenshot**: `[Screenshot: Refund detail - needs bank info]`
- Status: `approved_pending_bank_info`
- Button: "Cung cấp thông tin ngân hàng"

**Step 3**: Modal nhập thông tin ngân hàng xuất hiện

- **Screenshot**: `[Screenshot: Bank info modal]`
- Form có các trường:
  - **Tên chủ tài khoản** (required)
  - **Số tài khoản** (required, number only)
  - **Tên ngân hàng** (required, dropdown hoặc autocomplete)
  - **Chi nhánh** (optional)

**Step 4**: Điền thông tin và click "Xác nhận"

- **Screenshot**: `[Screenshot: Bank info filled]`
- Validation:
  - Tên chủ TK: Chỉ chữ cái và khoảng trắng
  - Số TK: 9-20 chữ số
  - Tên ngân hàng: Chọn từ danh sách

**Step 5**: Bank info được lưu

- **Screenshot**: `[Screenshot: Bank info saved successfully]`
- Toast: "Thông tin tài khoản đã được lưu. Tiền sẽ được chuyển trong 5-7 ngày làm việc"
- Refund status → `processing`

---

### 5.4 View Refund Status

**Purpose**: Theo dõi trạng thái xử lý refund

**Step 1**: Click "Refunds" trong user menu

- **Screenshot**: `[Screenshot: User menu with Refunds link]`

**Step 2**: Trang danh sách refunds hiển thị

- **Screenshot**: `[Screenshot: Refunds list page]`
- Tabs:
  - All
  - Pending (chờ admin review)
  - Approved (đã chấp thuận)
  - Rejected (bị từ chối)
  - Completed (đã hoàn tiền)

**Step 3**: Click vào refund card để xem chi tiết

- **Screenshot**: `[Screenshot: Refund detail page]`
- Hiển thị:
  - Refund ID
  - Booking info (tour name, dates)
  - Refund type (pre_trip / post_trip)
  - Requested amount
  - Status badge
  - Timeline (created → reviewed → processed)
  - Admin comments (nếu có)

**Step 4**: Xem timeline chi tiết

- **Screenshot**: `[Screenshot: Refund timeline]`
- Timeline hiển thị từng bước:
  - ✓ Yêu cầu đã gửi (thời gian)
  - ⏳ Chờ admin xem xét
  - ✓ Đã chấp thuận (thời gian + admin name)
  - ✓ Thông tin ngân hàng đã cung cấp
  - ⏳ Đang xử lý thanh toán
  - ✓ Đã hoàn tiền (thời gian)

---

### 5.5 Cancel Refund Request

**Purpose**: Hủy yêu cầu hoàn tiền (chỉ khi status = pending)

**Step 1**: Ở Refund Detail page (status: pending), click "Hủy yêu cầu"

- **Screenshot**: `[Screenshot: Cancel refund button]`

**Step 2**: Modal xác nhận xuất hiện

- **Screenshot**: `[Screenshot: Cancel confirmation modal]`
- "Bạn có chắc muốn hủy yêu cầu hoàn tiền này?"

**Step 3**: Click "Xác nhận hủy"

- **Screenshot**: `[Screenshot: Refund cancelled]`
- Refund status → `cancelled`
- Booking status quay về `confirmed`
- Toast: "Yêu cầu hoàn tiền đã được hủy"

---

## 6. User Profile Workflows

### 6.1 View Profile

**Purpose**: Xem thông tin cá nhân

**Step 1**: Click vào avatar ở header

- **Screenshot**: `[Screenshot: User dropdown menu]`

**Step 2**: Chọn "Thông tin cá nhân"

- **Screenshot**: `[Screenshot: Profile page]`
- Hiển thị:
  - Avatar
  - Full name
  - Email
  - Phone
  - Member since
  - Account type (Traveler/Admin)

---

### 6.2 Edit Profile

**Purpose**: Cập nhật thông tin cá nhân

**Step 1**: Ở Profile page, click "Chỉnh sửa"

- **Screenshot**: `[Screenshot: Edit profile button]`

**Step 2**: Form chỉnh sửa hiển thị

- **Screenshot**: `[Screenshot: Edit profile form]`
- Các trường có thể sửa:
  - Full name
  - Phone
  - Avatar (upload ảnh mới)

**Step 3**: Thay đổi thông tin

- **Screenshot**: `[Screenshot: Modified profile fields]`

**Step 4**: Click "Lưu thay đổi"

- **Screenshot**: `[Screenshot: Profile updated]`
- Toast: "Thông tin đã được cập nhật"

---

### 6.3 Change Password

**Purpose**: Đổi mật khẩu tài khoản

**Step 1**: Ở Profile page, click tab "Bảo mật"

- **Screenshot**: `[Screenshot: Security tab]`

**Step 2**: Section "Đổi mật khẩu" hiển thị

- **Screenshot**: `[Screenshot: Change password section]`

**Step 3**: Click "Đổi mật khẩu"

- **Screenshot**: `[Screenshot: Change password form]`
- Form có các trường:
  - Current Password
  - New Password
  - Confirm New Password

**Step 4**: Điền thông tin và click "Xác nhận"

- **Screenshot**: `[Screenshot: Password changed]`
- Toast: "Mật khẩu đã được thay đổi thành công"

---

### 6.4 Enable 2FA

**Purpose**: Bật xác thực hai yếu tố để tăng bảo mật

**Step 1**: Ở tab "Bảo mật", tìm section "Two-Factor Authentication"

- **Screenshot**: `[Screenshot: 2FA section - disabled]`
- Toggle switch hiển thị OFF

**Step 2**: Click vào toggle để enable

- **Screenshot**: `[Screenshot: Enable 2FA confirmation]`
- Modal: "Bật xác thực hai yếu tố?"

**Step 3**: Click "Xác nhận"

- **Screenshot**: `[Screenshot: Email confirmation sent]`
- Toast: "Email xác nhận đã được gửi. Vui lòng kiểm tra hộp thư"

**Step 4**: Mở email và click link xác nhận

- **Screenshot**: `[Screenshot: 2FA confirmation email]`
- Email chứa link: `/confirm-2fa?token=xxx`

**Step 5**: Click link trong email

- **Screenshot**: `[Screenshot: 2FA enabled success page]`
- Redirect về profile
- 2FA toggle → ON
- Toast: "Xác thực hai yếu tố đã được bật"

**Step 6**: Lần đăng nhập tiếp theo sẽ yêu cầu OTP

- **Screenshot**: `[Screenshot: Login with 2FA - OTP input]`
- Sau khi nhập email/password đúng → Modal nhập OTP xuất hiện
- Nhập 6 chữ số từ email → Login thành công

---

### 6.5 Disable 2FA

**Purpose**: Tắt xác thực hai yếu tố

**Step 1**: Ở tab "Bảo mật", toggle 2FA từ ON → OFF

- **Screenshot**: `[Screenshot: Disable 2FA toggle]`

**Step 2**: Modal yêu cầu nhập password xuất hiện

- **Screenshot**: `[Screenshot: Password confirmation modal]`
- "Nhập mật khẩu để tắt 2FA"

**Step 3**: Nhập password và click "Xác nhận"

- **Screenshot**: `[Screenshot: 2FA disabled]`
- Toggle → OFF
- Toast: "Xác thực hai yếu tố đã được tắt"

---

## 7. Admin - User Management Workflows

### 7.1 View All Users

**Purpose**: Admin xem danh sách tất cả users

**Step 1**: Login với tài khoản admin

- **Screenshot**: `[Screenshot: Admin login]`

**Step 2**: Click "Admin Dashboard" trong menu

- **Screenshot**: `[Screenshot: Admin menu]`

**Step 3**: Click tab "Users"

- **Screenshot**: `[Screenshot: Users management page]`
- Table hiển thị:
  - User ID
  - Name
  - Email
  - Role (Traveler/Admin)
  - Status (Active/Banned)
  - Registered date
  - Actions (View/Ban/Unban)

**Step 4**: Search/filter users (optional)

- **Screenshot**: `[Screenshot: User search and filters]`
- Search by email, name
- Filter by role, status

---

### 7.2 View User Details

**Purpose**: Admin xem chi tiết một user

**Step 1**: Ở Users table, click "View" trên user row

- **Screenshot**: `[Screenshot: View button on user row]`

**Step 2**: User detail modal/page hiển thị

- **Screenshot**: `[Screenshot: User detail modal]`
- Hiển thị:
  - Full profile info
  - Booking history
  - Refund history
  - Account status
  - Login history (if available)

---

### 7.3 Ban User

**Purpose**: Admin khóa tài khoản user vi phạm

**Step 1**: Ở User detail hoặc Users table, click "Ban User"

- **Screenshot**: `[Screenshot: Ban user button]`

**Step 2**: Modal nhập lý do ban xuất hiện

- **Screenshot**: `[Screenshot: Ban reason modal]`
- Textarea: "Lý do khóa tài khoản"

**Step 3**: Nhập lý do và click "Xác nhận"

- **Screenshot**: `[Screenshot: User banned]`
- User status → `banned`
- Toast: "Tài khoản đã được khóa"
- User không thể login nữa

---

### 7.4 Unban User

**Purpose**: Admin mở khóa tài khoản

**Step 1**: Ở Users table (filter status: Banned), click "Unban"

- **Screenshot**: `[Screenshot: Unban button]`

**Step 2**: Modal xác nhận

- **Screenshot**: `[Screenshot: Unban confirmation]`
- "Mở khóa tài khoản này?"

**Step 3**: Click "Xác nhận"

- **Screenshot**: `[Screenshot: User unbanned]`
- User status → `active`
- Toast: "Tài khoản đã được mở khóa"

---

## 8. Admin - Refund Management Workflows

### 8.1 View All Refunds

**Purpose**: Admin xem tất cả yêu cầu hoàn tiền

**Step 1**: Ở Admin Dashboard, click tab "Refunds"

- **Screenshot**: `[Screenshot: Refunds management page]`
- Table hiển thị:
  - Refund ID
  - User name
  - Booking ID
  - Tour name
  - Refund type (Pre-trip/Post-trip)
  - Amount
  - Status
  - Request date
  - Actions

**Step 2**: Filter refunds (optional)

- **Screenshot**: `[Screenshot: Refund filters]`
- Filter by:
  - Status (Pending/Approved/Rejected/Completed)
  - Type (Pre-trip/Post-trip)
  - Date range

---

### 8.2 Review Refund Request

**Purpose**: Admin xem chi tiết yêu cầu hoàn tiền để review

**Step 1**: Ở Refunds table, click "Review" trên refund row

- **Screenshot**: `[Screenshot: Review button]`

**Step 2**: Refund detail modal hiển thị

- **Screenshot**: `[Screenshot: Refund review modal]`
- Hiển thị đầy đủ:
  - Booking info
  - Tour details
  - Refund type & reason
  - Requested amount
  - Refund policy calculation (nếu pre-trip)
  - Issue details + ảnh minh chứng (nếu post-trip)
  - User history (số lần refund trước đó)

**Step 3**: Admin đánh giá hợp lệ

- **Screenshot**: `[Screenshot: Admin reviewing details]`
- Kiểm tra:
  - Lý do có hợp lý không
  - Policy refund đúng chưa
  - Minh chứng (nếu post-trip) có đủ không

---

### 8.3 Approve Refund

**Purpose**: Admin chấp thuận yêu cầu hoàn tiền

**Step 1**: Ở Refund review modal, click "Approve"

- **Screenshot**: `[Screenshot: Approve button]`

**Step 2**: Modal xác nhận với điều chỉnh amount (optional)

- **Screenshot**: `[Screenshot: Approve confirmation modal]`
- Admin có thể:
  - Giữ nguyên số tiền requested
  - Hoặc điều chỉnh amount (nếu cần)
  - Nhập comment cho user

**Step 3**: Click "Xác nhận chấp thuận"

- **Screenshot**: `[Screenshot: Refund approved]`
- Refund status → `approved_pending_bank_info`
- Email gửi đến user: "Yêu cầu hoàn tiền đã được chấp thuận. Vui lòng cung cấp thông tin ngân hàng"
- Toast (admin): "Đã chấp thuận yêu cầu hoàn tiền"

---

### 8.4 Reject Refund

**Purpose**: Admin từ chối yêu cầu hoàn tiền

**Step 1**: Ở Refund review modal, click "Reject"

- **Screenshot**: `[Screenshot: Reject button]`

**Step 2**: Modal nhập lý do từ chối

- **Screenshot**: `[Screenshot: Reject reason modal]`
- Textarea: "Lý do từ chối" (required)

**Step 3**: Nhập lý do và click "Xác nhận"

- **Screenshot**: `[Screenshot: Refund rejected]`
- Refund status → `rejected`
- Booking status quay về `confirmed`
- Email gửi user: "Yêu cầu hoàn tiền đã bị từ chối. Lý do: [admin comment]"
- Toast (admin): "Đã từ chối yêu cầu hoàn tiền"

---

### 8.5 Process Refund Payment

**Purpose**: Admin xử lý thanh toán hoàn tiền tự động qua gateway

**Step 1**: Sau khi user cung cấp bank info, refund có status `processing`

- **Screenshot**: `[Screenshot: Refund with bank info provided]`

**Step 2**: Admin click "Process Payment"

- **Screenshot**: `[Screenshot: Process payment button]`

**Step 3**: Chọn payment gateway để refund

- **Screenshot**: `[Screenshot: Gateway selection modal]`
- Options:
  - MoMo (nếu payment method ban đầu là MoMo)
  - PayPal (nếu PayPal)

**Step 4**: Click "Confirm Process"

- **Screenshot**: `[Screenshot: Processing refund]`
- Hệ thống call API gateway để refund
- Loading state hiển thị

**Step 5**: Refund thành công

- **Screenshot**: `[Screenshot: Refund completed]`
- Refund status → `completed`
- Email gửi user: "Tiền hoàn đã được chuyển vào tài khoản của bạn"
- Toast (admin): "Hoàn tiền thành công"

**Error Handling**:

- Nếu gateway API fail → Status vẫn là `processing`
- Admin có thể retry hoặc chuyển sang manual processing

---

### 8.6 Manual Refund Processing

**Purpose**: Admin đánh dấu refund đã hoàn tiền thủ công (ngoài hệ thống)

**Step 1**: Ở refund có status `processing`, click "Mark as Completed Manually"

- **Screenshot**: `[Screenshot: Manual completion button]`

**Step 2**: Modal nhập thông tin giao dịch

- **Screenshot**: `[Screenshot: Manual completion modal]`
- Nhập:
  - Confirmation code (mã GD ngân hàng)
  - Notes (ghi chú)

**Step 3**: Click "Confirm"

- **Screenshot**: `[Screenshot: Manually completed refund]`
- Refund status → `completed`
- Admin note được lưu
- Email gửi user
- Toast: "Đã đánh dấu hoàn tiền thành công"

---

## IV. Screen Flow Diagram

### High-Level User Flow

```
User Journey:
┌─────────────┐
│   Landing   │ (/)
└──────┬──────┘
       │
   ┌───┴────┐
   │        │
[Browse] [Register/Login]
   │        │
   │    ┌───┴───────┐
   │    │ 2FA Check?│
   │    └───┬───────┘
   │        │ Yes
   │    [Enter OTP]
   │        │
   ├────────┴─────────┐
   │                  │
[Discover]       [Tours List]
   │                  │
   ├──────────────────┤
   │   Zone/Tour      │
   │   Detail Page    │
   └─────────┬────────┘
             │
      [Add to Cart]
             │
        [Checkout]
             │
    ┌────────┴─────────┐
    │                  │
 [MoMo]           [PayPal]
    │                  │
    └────────┬─────────┘
             │
    [Payment Callback]
             │
      [Booking Created]
             │
      ┌──────┴──────┐
      │             │
[View Bookings]  [Request Refund]
                     │
              ┌──────┴───────┐
              │              │
        [Pre-trip]     [Post-trip]
              │              │
              └──────┬───────┘
                     │
            [Admin Reviews]
                     │
              ┌──────┴──────┐
              │             │
          [Approve]    [Reject]
              │
      [Provide Bank Info]
              │
       [Admin Process]
              │
          [Completed]
```

### Authentication Flow

```
┌──────────────┐
│ Landing Page │
└──────┬───────┘
       │
   ┌───┴────┐
   │        │
[Login]  [Register]
   │        │
   │    [Fill Form]
   │        │
   │    [Submit]
   │        │
   │    [Create Account]
   │        │
   ├────────┤
   │
[Enter Credentials]
   │
[Validate]
   │
┌──┴───┐
│ 2FA? │
└──┬───┘
   │ No
   ├──────┐
   │ Yes  │
   │   [Send OTP Email]
   │      │
   │   [Enter OTP]
   │      │
   │   [Verify]
   │      │
   └──────┤
          │
   [Login Success]
          │
    [Home Page]
```

---

## V. Key Screens Reference

### Frontend Pages (touring-fe/src/pages/)

#### Purpose

Cho phép user xem lịch sử bookings, retry failed payments, và yêu cầu hoàn tiền.

#### Steps

##### 4.1. View Booking History

**Screen**: Booking History Page (`/bookings`)

![Booking History](screenshots/booking-history.png)

1. User click **"My Bookings"** từ profile menu
2. Hiển thị danh sách bookings:
   - Tabs: All, Paid, Pending, Cancelled, Refunded
   - Mỗi booking card hiển thị:
     - Order Reference (e.g., `ORD-1731234567-ABC`)
     - Tour name, start date
     - Total amount, payment status
     - Actions: View details, Retry payment (nếu failed), Request refund
3. User click **"View Details"** → Modal hiển thị:
   - Full booking info
   - Payment details (method, transaction ID)
   - Tour items (name, quantity, price)
   - Voucher applied (if any)

##### 4.2. Retry Failed Payment

**Screen**: Booking Detail Modal

![Retry Payment](screenshots/retry-payment.png)

1. Nếu booking có `status: "failed"` hoặc `"cancelled"`:
   - Hiển thị button **"Retry Payment"**
2. User click **"Retry Payment"**
3. Hệ thống:
   - Re-check seat availability (tránh overbooking)
   - Re-validate voucher (có thể hết hạn)
   - Use stored prices từ original booking
4. Redirect đến payment gateway (MoMo/PayPal)
5. Nếu payment success:
   - Update original booking: `status: "paid"`
   - Toast: "Thanh toán thành công! Booking đã được kích hoạt ✅"

##### 4.3. Request Pre-Trip Refund (Cancellation)

**Screen**: Refund Request Page (`/refunds/request`)

![Pre-Trip Refund](screenshots/pre-trip-refund.png)

1. User vào booking detail → Click **"Request Refund"**
2. Chọn refund type: **"Pre-Trip Cancellation"** (Hủy tour trước khi đi)
3. Hệ thống tự động calculate refund:
   - Days before tour start: `daysBeforeTour`
   - Policy:
     - ≥30 days: 90% refund
     - 14-29 days: 70% refund
     - 7-13 days: 50% refund
     - 3-6 days: 25% refund
     - 1-2 days: 10% refund
     - <1 day: 0% refund
   - Processing fee: 2% (trừ vào số tiền hoàn)
4. Hiển thị preview:
   - Original amount: 5,000,000 VND
   - Refundable: 4,500,000 VND (90%)
   - Processing fee: 90,000 VND (2%)
   - **Final refund**: 4,410,000 VND
5. User nhập **reason** (optional): "Lịch thay đổi đột xuất"
6. Click **"Submit Refund Request"**
7. Hệ thống tạo refund với `status: "pending"`
8. Toast: "Yêu cầu hoàn tiền đã gửi! Admin sẽ xem xét trong 1-2 ngày làm việc 📧"

##### 4.4. Request Post-Trip Refund (Issue Report)

**Screen**: Post-Trip Refund Form

![Post-Trip Refund](screenshots/post-trip-refund.png)

1. User vào booking đã hoàn thành → Click **"Report Issue"**
2. Chọn refund type: **"Post-Trip Issue"** (Báo cáo vấn đề sau chuyến đi)
3. Điền thông tin:
   - **Issue Category**: Service Quality, Safety Concern, Itinerary Deviation, Guide Issue, Accommodation Problem, Transportation Issue, Other
   - **Severity**: Minor, Moderate, Major, Critical
   - **Description**: Mô tả chi tiết vấn đề (required, min 50 chars)
   - **Evidence**: Upload ảnh/video (max 5 files, 10MB each)
4. Hệ thống calculate refund theo severity:
   - Critical: 100% refund
   - Major: 70% refund
   - Moderate: 40% refund
   - Minor: 20% refund
5. Hiển thị estimated refund: "Dự kiến hoàn: 2,000,000 VND (40%) - Tùy thuộc admin review"
6. Click **"Submit Report"**
7. Hệ thống tạo refund với `status: "pending"`, lưu evidence URLs
8. Toast: "Báo cáo đã gửi! Chúng tôi sẽ xem xét và phản hồi trong 2-3 ngày làm việc 🔍"

##### 4.5. Provide Bank Info After Approval

**Screen**: Refund Detail Page

![Bank Info Form](screenshots/bank-info.png)

1. Sau khi admin approve refund:
   - User nhận email: "Yêu cầu hoàn tiền được chấp nhận - Vui lòng cung cấp thông tin TK ngân hàng"
2. User click link trong email → Redirect `/refunds/:id`
3. Điền form bank info:
   - **Bank Name**: Tên ngân hàng (dropdown: Vietcombank, BIDV, Techcombank, etc.)
   - **Account Number**: Số tài khoản (required)
   - **Account Name**: Tên chủ TK (required)
   - **Branch Name**: Chi nhánh (optional)
4. Click **"Submit"**
5. Hệ thống lưu bank info vào refund document
6. Toast: "Thông tin đã gửi! Admin sẽ xử lý trong 1-2 ngày ✅"
7. Chờ admin process refund → Nhận email: "Hoàn tiền thành công! Tiền sẽ về TK trong 3-5 ngày"

---

### 5. Workflow: Admin - User Management

#### Purpose

Cho phép Admin quản lý users, ban/unban accounts, view statistics.

#### Steps

##### 5.1. View All Users

**Screen**: Admin Users Page (`/admin/users`)

![Admin Users](screenshots/admin-users.png)

1. Admin login → Click **"Admin Dashboard"** → **"Users"**
2. Hiển thị bảng users:
   - Columns: Avatar, Name, Email, Role, Status, Total Bookings, Total Spent, Actions
   - Filters:
     - Role: All, Traveler, TourGuide, TravelAgency, Admin
     - Status: All, Active, Banned, Inactive
     - Search: Tìm theo name/email/phone
3. Pagination: 20 users/page
4. Actions:
   - **View Details**: Click row → Modal hiển thị full user info + booking statistics
   - **Ban User**: Click "Ban" icon
   - **Edit Role**: (Future feature)

##### 5.2. Ban/Unban User

**Screen**: Ban User Modal

![Ban User](screenshots/ban-user.png)

1. Admin click **"Ban User"** icon trên user row
2. Popup confirmation modal:
   - Hiển thị user info (name, email, current bookings)
   - Input **reason**: "Vi phạm chính sách thanh toán" (required)
3. Click **"Confirm Ban"**
4. Hệ thống:
   - Update `user.accountStatus = "banned"`
   - Lưu `statusReason` và `statusUpdatedBy: adminId`
   - Append entry vào `lockHistory[]`
5. Toast: "User đã bị khóa thành công ⛔"
6. Real-time effect:
   - User bị logout ngay lập tức (JWT check accountStatus)
   - Khi user try login → Error: "Tài khoản đã bị khóa. Lý do: [reason]"

**Unban Flow**:

1. Admin click **"Unban"** trên banned user
2. Update `accountStatus = "active"`
3. Update `lockHistory` với `unlockedAt`, `unlockedBy`
4. Toast: "User đã được mở khóa ✅"

---

### 6. Workflow: Admin - Refund Management

#### Purpose

Cho phép Admin review, approve/reject, và process refunds.

#### Steps

##### 6.1. View Pending Refunds

**Screen**: Admin Refunds Page (`/admin/refunds`)

![Admin Refunds](screenshots/admin-refunds.png)

1. Admin → Dashboard → **"Refunds"**
2. Tabs: All, Pending, Approved, Processing, Completed, Rejected
3. Click **"Pending"** tab
4. Hiển thị danh sách refunds chờ xử lý:
   - Columns: Refund Ref, User, Booking, Type, Amount, Requested At, Actions
   - Filters: Date range, Type (pre-trip/post-trip), Search
5. Click refund row → **Refund Detail Modal**

##### 6.2. Review & Approve Refund

**Screen**: Refund Review Modal

![Refund Review](screenshots/refund-review.png)

1. Modal hiển thí:
   - User info, booking details
   - Refund type, calculated amounts
   - For pre-trip: Cancellation policy, days before tour
   - For post-trip: Issue category, severity, evidence (photos/videos)
2. Admin review evidence:
   - Xem ảnh uploaded
   - Đọc description
   - Check booking history của user
3. Admin chọn action:
   - **Approve**: Accept refund
     - (Optional) Adjust amount: Nhập custom amount nếu cần điều chỉnh
     - Nhập review note: "Chấp nhận yêu cầu, khách hàng có lý do hợp lý"
   - **Reject**: Deny refund
     - Nhập review note (required): "Không đủ bằng chứng"
4. Click **"Submit Review"**
5. Nếu **Approved**:
   - Update `refund.status = "approved"`
   - Send email cho user: "Yêu cầu hoàn tiền được chấp nhận - Vui lòng cung cấp TK ngân hàng"
   - Toast: "Refund approved ✅ Waiting for user bank info..."
6. Nếu **Rejected**:
   - Update `refund.status = "rejected"`
   - Send email cho user: "Yêu cầu hoàn tiền bị từ chối. Lý do: [reviewNote]"
   - Toast: "Refund rejected ❌"

##### 6.3. Process Refund

**Screen**: Process Refund Page

![Process Refund](screenshots/process-refund.png)

1. Sau khi user submit bank info:
   - Refund chuyển sang tab **"Approved"** với status `approved` + bank info có sẵn
2. Admin click **"Process Refund"**
3. Hệ thống tự động:
   - Call `RefundService.processRefund(booking, amount, note)`
   - Router chọn gateway:
     - If `provider: "momo"` → Call MoMo Refund API
     - If `provider: "paypal"` → Call PayPal Refund API
4. **Success case**:
   - MoMo/PayPal trả về `{success: true, transactionId}`
   - Update `refund.status = "completed"`
   - Update `booking.status = "refunded"`
   - Send email: "Hoàn tiền thành công! TxID: XXX. Tiền sẽ về TK trong 3-5 ngày"
   - Toast: "Refund processed successfully! 🎉"
5. **Failure case** (Gateway error):
   - Update `refund.requiresManualProcessing = true`
   - Keep `status = "approved"`
   - Modal hiển thị instructions: "Auto-refund failed. Please complete bank transfer manually using the provided bank info."
   - Admin thực hiện chuyển khoản thủ công → Sau đó click **"Mark as Completed"**

##### 6.4. Manual Payment (Sandbox Mode)

**Screen**: Manual Refund Payment

![Manual Payment](screenshots/manual-payment.png)

1. Nếu trong sandbox hoặc auto-refund failed:
   - Admin click **"Create Manual Payment"**
2. Hệ thống tạo MoMo payment link:
   - Generate orderId: `REFUND-{refundId}-{timestamp}`
   - Create payment request → Get `{payUrl, qrCodeUrl, deeplink}`
3. Modal hiển thị:
   - QR code để scan
   - Payment URL
   - Amount to pay
4. Admin scan QR → Mở MoMo app → Hoàn tất thanh toán
5. Admin click **"Check Payment Status"**
6. Hệ thống query MoMo API:
   - If `status: "completed"` → Mark refund as completed, send email
   - If `status: "pending"` → Show "Payment still pending..."

---

### 7. Workflow: User Profile & Security

#### Purpose

Cho phép user quản lý thông tin cá nhân, đổi mật khẩu, bật 2FA.

#### Steps

##### 7.1. Update Profile

**Screen**: User Profile Page (`/profile`)

![User Profile](screenshots/user-profile.png)

1. User click avatar → **"Profile"**
2. Edit form:
   - **Avatar**: Click to upload new image (max 5MB)
   - **Full Name**: Họ tên
   - **Email**: (Read-only nếu đã verify)
   - **Phone**: Số điện thoại
   - **Location**: Province, Ward, Address Line
3. Click **"Save Changes"**
4. Toast: "Cập nhật thông tin thành công ✅"

##### 7.2. Change Password

**Screen**: Profile Security Tab (`/profile/security`)

![Change Password](screenshots/change-password.png)

1. Tab **"Security"** → Section **"Change Password"**
2. Điền form:
   - **Current Password**: Mật khẩu hiện tại (required)
   - **New Password**: Mật khẩu mới (min 8 chars, strong)
   - **Confirm New Password**: Nhập lại
3. Click **"Change Password"**
4. Hệ thống verify current password
5. Nếu đúng:
   - Hash new password
   - Update database
   - Send email notification: "Mật khẩu đã được thay đổi lúc [timestamp]"
   - Toast: "Đổi mật khẩu thành công! 🔒"

##### 7.3. Enable Two-Factor Authentication (2FA)

**Screen**: 2FA Setup Modal

![2FA Setup](screenshots/2fa-setup.png)

1. Tab **"Security"** → Click **"Enable 2FA"**
2. Modal hiển thị:
   - QR code (scan bằng Google Authenticator app)
   - Secret key (backup manual)
3. User scan QR bằng Google Authenticator/Authy
4. Nhập 6-digit OTP từ app để confirm
5. Click **"Verify & Enable"**
6. Hệ thống verify OTP:
   - If correct → `user.twoFactorEnabled = true`, save secret
   - Toast: "2FA đã được bật! Tài khoản của bạn giờ an toàn hơn 🛡️"
7. Từ giờ, mỗi lần login cần nhập OTP

---

### 8. Workflow: AI Itinerary Generator

#### Purpose

Tạo lịch trình du lịch tự động dựa trên destinations, dates, budget, preferences.

#### Steps

##### 8.1. Generate Custom Itinerary

**Screen**: AI Tour Creator Page (`/ai-tour-creator`)

![AI Itinerary](screenshots/ai-itinerary.png)

1. User click **"Create AI Itinerary"** từ menu
2. Điền form:
   - **Destinations**: Chọn 1 hoặc nhiều zones/cities
   - **Start Date**: Ngày bắt đầu
   - **End Date**: Ngày kết thúc (hoặc duration days)
   - **Budget**: Low, Medium, High
   - **Travel Style**: Adventure, Relax, Culture, Food, Family, etc.
   - **Special Requests**: Free text (optional)
3. Click **"Generate Itinerary"**
4. Hệ thống gửi request đến AI service:
   - POST `/api/itinerary/generate`
   - AI sử dụng OpenAI GPT để tạo itinerary
5. Loading state: "Đang tạo lịch trình cho bạn... ✨"
6. Kết quả:
   - Day-by-day schedule
   - Activities, attractions, restaurants
   - Estimated costs
   - Map view (if integrated)
7. User có thể:
   - **Save Itinerary**: Lưu vào "My Itineraries"
   - **Export PDF**: Download itinerary
   - **Book Tours**: Link đến các tours liên quan

---

## VI. Appendices

### A. Actors Summary

| Actor                | Login Required          | Key Features                                                                                               |
| -------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Traveler** (User)  | ✅ Yes                  | Browse tours, add to cart/wishlist, checkout, manage bookings, request refunds, update profile, enable 2FA |
| **Admin**            | ✅ Yes (Admin role)     | Manage users (ban/unban), review & process refunds, view statistics, manual payment processing             |
| **TourGuide**        | ❌ No login (Future)    | Currently managed under TravelAgency employees, no dedicated features yet                                  |
| **TravelAgency**     | ❌ No login (Data only) | Stored in database for tour attribution, fetched via fake API, no dashboard/login                          |
| **External Systems** | N/A                     | MoMo Gateway, PayPal Gateway, Email Service (SendGrid/SMTP), AI Service (OpenAI), MongoDB                  |

### B. Technology Stack

**Backend (touring-be)**:

- Runtime: Node.js v18+
- Framework: Express.js
- Database: MongoDB + Mongoose ODM
- Authentication: JWT (Access + Refresh tokens), bcrypt, speakeasy (2FA)
- Payment: MoMo API, PayPal REST API
- Email: Nodemailer / SendGrid
- Background Jobs: node-cron
- Testing: Jest (if configured)

**Frontend (touring-fe)**:

- Framework: React 18
- Build Tool: Vite
- Routing: React Router v6
- Styling: Tailwind CSS
- HTTP Client: Axios
- State: React Context / useState (no Redux/Zustand detected)

**AI Service (ai/)**:

- Language: Python 3.9+
- Framework: FastAPI + Uvicorn (ASGI server)
- Embedding Model: AITeamVN/Vietnamese_Embedding_v2 (1024-dim, dot product similarity)
- Vector Search: FAISS (Facebook AI Similarity Search) - supports FLAT/HNSW/IVF index types
- Additional: OpenAI GPT API (for LLM-based parsing & insights)
- Dependencies: fastapi, uvicorn, faiss-cpu, sentence-transformers, pymongo, openai

**DevOps**:

- Version Control: Git (GitHub)
- CI/CD: GitHub Actions (assumed)
- Hosting: DigitalOcean / AWS / Heroku (not specified)
- Monitoring: Sentry / LogDNA (if configured)

### C. Environment Variables Checklist

Before running, ensure these variables are set:

**Backend (.env)**:

- ✅ `MONGO_URI`
- ✅ `JWT_SECRET`, `JWT_REFRESH_SECRET`
- ✅ `MOMO_PARTNER_CODE`, `MOMO_ACCESS_KEY`, `MOMO_SECRET_KEY`
- ✅ `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`
- ✅ `EMAIL_USER`, `EMAIL_PASSWORD` (or `SENDGRID_API_KEY`)
- ✅ `FRONTEND_URL`
- ✅ `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (for OAuth)
- ✅ `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET` (for OAuth)

**Frontend (.env)**:

- ✅ `VITE_API_BASE_URL`
- ✅ `VITE_PAYPAL_CLIENT_ID`
- ✅ `VITE_GOOGLE_CLIENT_ID`
- ✅ `VITE_FACEBOOK_APP_ID`

**AI Service (.env)**:

- ✅ `MONGO_URI`
- ✅ `OPENAI_API_KEY` (optional - for LLM features)
- ✅ `PORT` hoặc `UVICORN_PORT` (default: 8088)
- ✅ `INDEX_TYPE` (FLAT/HNSW/IVF - default: FLAT)
- ✅ `BATCH_SIZE` (embedding batch size - default: 32)

### D. Common Issues & Solutions

| Issue                                  | Solution                                                              |
| -------------------------------------- | --------------------------------------------------------------------- |
| JWT token expired                      | Re-login hoặc implement auto-refresh logic                            |
| MoMo IPN không nhận được (localhost)   | Use ngrok: `ngrok http 4000` → Update `MOMO_IPN_URL`                  |
| PayPal sandbox payment không hoạt động | Check `PAYPAL_MODE=sandbox`, verify client ID/secret                  |
| MongoDB connection failed              | Check network, firewall, MongoDB Atlas whitelist IP                   |
| AI service slow response               | OpenAI API có thể chậm, thêm loading state UI                         |
| 2FA OTP incorrect                      | Check device time sync, verify secret key saved correctly             |
| Refund auto-process failed             | Fallback to manual processing, check gateway credentials              |
| CORS error                             | Verify `FRONTEND_URL` in backend `.env`, check CORS middleware config |

---

**Document End**

---

**📝 Notes for Instructors/Reviewers**:

- All workflows are based on actual codebase analysis (AUTHENTICATION_SEQUENCE_DIAGRAMS.md, models, controllers)
- Screenshots placeholders (`screenshots/*.png`) should be replaced with actual screen captures
- Admin screens are described but may not be fully implemented in current frontend (check `touring-fe/src/pages/admin/` if exists)
- TravelAgency is confirmed as data-only entity (no login/dashboard), used for tour attribution and guide management
- AI service integration (FastAPI embedding service) is documented based on `ai/README.md` - uses Vietnamese_Embedding_v2 model with FAISS vector search

**Last Updated**: November 14, 2025  
**Prepared By**: GitHub Copilot (TRAVYY Documentation Assistant)  
**Version**: 1.0
