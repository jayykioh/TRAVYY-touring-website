# 🌍 TRAVYY - Smart Tourism Platform

[![Tests](https://img.shields.io/badge/tests-90%20passing-brightgreen)](./touring-be/TEST_CASES_DOCUMENTATION.md)
[![Coverage](https://img.shields.io/badge/coverage-77.21%25-yellow)](./touring-be/COVERAGE_SUMMARY.md)
[![Jest](https://img.shields.io/badge/jest-29.x-C21325?logo=jest)](https://jestjs.io/)
[![Node](https://img.shields.io/badge/node-18%2B-339933?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/vite-5.x-646CFF?logo=vite)](https://vitejs.dev/)

> **Capstone Project - FPT University (FA25 - SWP391)**  
> An intelligent tourism platform that helps travelers discover and plan perfect trips using AI-powered recommendations.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [AI Features](#-ai-features)
- [Testing](#-testing)
- [API Documentation](#-api-documentation)
- [Security](#-security-features)
- [Admin Dashboard](#-admin-dashboard-features)
- [Deployment](#-deployment)
- [Documentation](#-documentation)
- [Team](#-team)

---

## 🎯 Overview

**TRAVYY** is a comprehensive tourism platform that combines modern web technologies with AI-powered recommendations to deliver personalized travel experiences. The platform features intelligent zone matching, itinerary optimization, and comprehensive tour management.

### 🌟 Highlights

- 🤖 **AI-Powered Recommendations** - Smart zone matching using Google Gemini AI
- 🗺️ **Interactive Maps** - Real-time POI discovery with MapLibre GL
- 📱 **Responsive Design** - Seamless experience across all devices
- 👥 **Multi-Role System** - Admin, Guide, and Traveler portals
- 🔐 **Secure Authentication** - JWT + OAuth2 (Google, Facebook)
- 📊 **Admin Dashboard** - Comprehensive management tools
- ⭐ **Review System** - Multi-image upload with rating system
- 💳 **Payment Integration** - PayPal integration for bookings

---

## ✨ Key Features

### For Travelers 🧳
- 🔍 **Smart Discovery** - AI-powered destination recommendations based on preferences
- 🗺️ **Interactive Planning** - Drag-and-drop itinerary builder with real-time maps
- ⭐ **Reviews & Ratings** - Share experiences with photos (max 5 images, 5MB each)
- 📱 **Real-time Booking** - Instant tour reservations with guides
- 🌐 **Multi-language Support** - Vietnamese and English interfaces
- 🛒 **Shopping Cart** - Add multiple tours and book together
- ❤️ **Wishlist** - Save favorite tours for later
- 📧 **Notifications** - Email and in-app notifications

### For Tour Guides 🎯
- 📋 **Tour Management** - Create and manage tour packages
- 📅 **Booking Calendar** - Track reservations and availability
- 💬 **Client Communication** - Direct messaging with travelers
- 📊 **Performance Analytics** - View ratings and feedback
- ✅ **Verification System** - Professional guide certification
- 💰 **Revenue Tracking** - Monitor earnings and bookings

### For Administrators 👨‍💼
- 👥 **User Management** - Manage travelers, guides, and permissions
- 🗺️ **Zone Management** - POI categorization and zone configuration
- 📊 **Analytics Dashboard** - Platform statistics and insights
- 🔒 **Security Controls** - Account status management (ban/unlock)
- 📤 **Data Export** - CSV export for reporting
- 🎫 **Promotion Management** - Create and manage discount codes
- 📝 **Content Management** - Manage blogs and help articles

---

## 🛠️ Tech Stack

### Frontend ([`touring-fe`](touring-fe/))
```
React 18.x          - UI library
Vite 5.x            - Build tool & dev server
TailwindCSS         - Utility-first CSS
Shadcn/ui           - Component library
React Router 6.x    - Client-side routing
MapLibre GL         - Interactive maps
Lucide React        - Icon library
Sonner              - Toast notifications
Axios               - HTTP client
React Hook Form     - Form handling
Zod                 - Schema validation
```

### Backend ([`touring-be`](touring-be/))
```
Node.js 18+         - Runtime environment
Express.js          - Web framework
MongoDB + Mongoose  - Database & ODM
JWT                 - Authentication
Passport.js         - OAuth2 strategies (Google, Facebook)
Nodemailer          - Email service
Multer              - File upload handling
Jest 29.x           - Testing framework
Supertest           - HTTP testing
```

### AI & APIs ([`ai`](ai/))
```
Python 3.11+        - AI service runtime
Flask               - Python web framework
Google Gemini AI    - LLM for preference parsing
FAISS               - Vector similarity search
Sentence Transformers - Text embeddings
Goong Maps API      - Vietnamese POI data
```

### DevOps & Tools
```
Git                 - Version control
GitHub              - Code repository
PowerShell          - Automation scripts
ESLint              - Code linting
Prettier            - Code formatting
```

---

## 📁 Project Structure

```
capstone-project/
├── 📂 touring-fe/              # Frontend (React + Vite)
│   ├── src/
│   │   ├── admin/              # Admin portal
│   │   │   ├── pages/          # Admin pages (Users, Guides, Tours, etc.)
│   │   │   └── components/     # Admin-specific components
│   │   ├── auth/               # Authentication context
│   │   ├── components/         # Shared components
│   │   │   ├── ui/             # Shadcn/ui components
│   │   │   └── layout/         # Layout components
│   │   ├── pages/              # Public pages
│   │   │   ├── Home.jsx
│   │   │   ├── Tours.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── ...
│   │   └── utils/              # Helper functions
│   └── public/                 # Static assets
│
├── 📂 touring-be/              # Backend (Node.js + Express)
│   ├── routes/                 # API endpoints
│   │   ├── auth.routes.js      # Authentication & OAuth
│   │   ├── zone.routes.js      # POI & zones
│   │   ├── itinerary.routes.js # Trip planning
│   │   ├── bookingRoutes.js    # Booking management
│   │   ├── payment.routes.js   # Payment processing
│   │   └── admin/              # Admin-only routes
│   ├── services/               # Business logic
│   │   ├── ai/                 # AI services (Gemini, embeddings)
│   │   ├── zones/              # Zone matching & scoring
│   │   └── itinerary/          # Itinerary optimization
│   ├── models/                 # MongoDB schemas
│   │   ├── Users.js
│   │   ├── Zones.js
│   │   ├── Bookings.js
│   │   ├── Reviews.js
│   │   └── ...
│   ├── controller/             # Route controllers
│   ├── middlewares/            # Express middleware
│   │   ├── authJwt.js          # JWT verification
│   │   └── passport.js         # OAuth strategies
│   └── routes/__tests__/       # Test suites (90 tests)
│
├── 📂 ai/                      # AI Service (Python + Flask)
│   ├── app.py                  # Flask API server
│   ├── sync_zones_from_mongo.py # Zone embedding sync
│   ├── requirements.txt        # Python dependencies
│   └── index/                  # FAISS vector store
│       ├── faiss.index
│       └── meta.json
│
└── 📄 Documentation            # Project documentation
    ├── LOGIN_FLOW_DOCUMENTATION.md
    ├── ADMIN_GUIDE_CLEANUP.md
    ├── ITINERARY_SYSTEM_SPECIFICATION.md
    ├── TEST_CASES_DOCUMENTATION.md
    └── README_TESTING.md
```

---

## 🚀 Getting Started

### Prerequisites
```bash
Node.js 18+
MongoDB 5.0+
Python 3.11+ (for AI service)
Git
```

### Installation

#### 1️⃣ Clone Repository
```bash
git clone https://github.com/jayykioh/DUFDUF-Touring-.git
cd DUFDUF-Touring-
```

#### 2️⃣ Backend Setup
```bash
cd touring-be
npm install

# Create .env file
cp .env.example .env
# Edit .env with your configuration:
# - MongoDB URI
# - JWT secrets
# - Google/Facebook OAuth credentials
# - Gemini API key
# - Email service credentials

# Run backend
npm run dev
```

**Backend Environment Variables:**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/travyy
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your-gemini-api-key
EMBED_SERVICE_URL=http://localhost:8000
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

#### 3️⃣ Frontend Setup
```bash
cd touring-fe
npm install

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Run frontend
npm run dev
```

**Frontend Environment Variables:**
```env
VITE_API_URL=http://localhost:5000
VITE_GOONG_API_KEY=your-goong-api-key
VITE_GOONG_MAPTILES_KEY=your-goong-maptiles-key
```

#### 4️⃣ AI Service Setup (Optional but Recommended)
```bash
cd ai
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit with MongoDB URI

# Sync zones and start service
python sync_zones_from_mongo.py
python app.py
```

### Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **AI Service**: http://localhost:8000
- **Admin Portal**: http://localhost:5173/admin

### Default Admin Account
```
Email: admin@travyy.com
Password: admin123
```

---

## 🤖 AI Features

### 1. Smart Preference Parsing 🧠
**File**: `touring-be/services/ai/libs/llm.js`

Converts natural language preferences into structured data using Google Gemini AI:

```javascript
// Input
"Tôi muốn đi biển Đà Nẵng 3 ngày, thích ăn uống và khám phá văn hóa"

// Output
{
  interests: ["beach", "food", "culture"],
  vibes: ["relaxed", "cultural"],
  durationDays: 3,
  keywords: ["đà nẵng", "biển", "ăn uống"]
}
```

**Features**:
- Natural language understanding
- Vietnamese and English support
- Fallback to keyword extraction
- JSON schema validation

### 2. Hybrid Zone Matching 🎯
**File**: `touring-be/services/zones/matcher.js`

Combines vector similarity search with keyword matching for optimal recommendations:

```javascript
// Embedding-based semantic search (60% weight)
embedScore = cosineSimilarity(userPreferences, zoneEmbedding)

// Keyword-based matching (40% weight)
keywordScore = matchKeywords(userPrefs.keywords, zone.tags)

// Final ranking
finalScore = 0.6 * embedScore + 0.4 * keywordScore
```

**Technology**:
- FAISS vector database for fast similarity search
- Sentence transformers for embeddings
- Custom scoring algorithm (see `touring-be/services/zones/scorer.js`)

### 3. POI Discovery 📍
**File**: `touring-be/routes/zone.routes.js`

Real-time Point of Interest search and categorization:

**Endpoints**:
```
GET /zones/:zoneId/search?q=cafe          # Search POIs in zone
GET /zones/:zoneId/pois-priority          # Get priority POIs
GET /poi/:placeId/details                 # Get detailed POI info
```

**Features**:
- Real-time search via Goong Maps API
- Vietnamese POI database
- Category filtering
- Distance calculation

### 4. Itinerary Optimization 🗓️
**File**: `touring-be/services/itinerary/optimizer.js`

Optimizes multi-day trips considering multiple factors:

**Optimization Criteria**:
- ⏱️ Travel time between POIs
- 🕐 Opening hours
- ⭐ User preferences
- 💰 Budget constraints
- 📍 Geographic proximity

---

## 🧪 Testing

### Test Suite Overview
- ✅ **90 Test Cases** - Comprehensive coverage across all modules
- 📊 **77.21% Code Coverage** - Statement coverage
- ⚡ **Fast Execution** - ~3.3 seconds for full suite
- 🔄 **Deterministic** - All tests offline-capable with mocks

### Running Tests

```bash
cd touring-be

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- llm.test.js

# Watch mode (auto-rerun on changes)
npm test -- --watch

# Verbose output
npm test -- --verbose
```

### Test Coverage by Module

| Module | Tests | Coverage | Status |
|--------|-------|----------|--------|
| 🤖 AI Services (LLM) | 13 | 85%+ | ✅ Pass |
| 🎯 Zone Matcher | 15 | 90%+ | ✅ Pass |
| 📊 Zone Scorer | 12 | 95%+ | ✅ Pass |
| 🔑 Auth (Login) | 14 | 80%+ | ✅ Pass |
| 🔐 Auth (Register) | 12 | 80%+ | ✅ Pass |
| 🔄 Auth (Refresh) | 8 | 75%+ | ✅ Pass |
| 📝 Reviews | 10 | 70%+ | ✅ Pass |
| 🎫 Promotions | 6 | 65%+ | ✅ Pass |

### Coverage Reports

```bash
# Generate and open HTML coverage report
npm test -- --coverage
npm run coverage:open

# Or manually
ii .\coverage-summary.html
```

**View Reports**:
- 🌐 **Pretty Overview**: `touring-be/coverage-summary.html`
- 📊 **Detailed Report**: `touring-be/coverage/lcov-report/index.html`
- 📄 **LCOV Data**: `touring-be/coverage/lcov.info`

### Mock Strategies

| Service | Mock Strategy | Implementation |
|---------|--------------|----------------|
| Google Gemini AI | `jest.mock('@google/generative-ai')` | `jest.setup.js` |
| Embedding Service | `global.fetch` stub | `jest.setup.js` |
| Goong Maps API | `jest.mock('axios')` | Individual tests |
| MongoDB | Inline mocks with `.lean()` | Individual tests |

### Test Documentation

- 📖 [`TEST_CASES_DOCUMENTATION.md`](touring-be/TEST_CASES_DOCUMENTATION.md) - All 90 test cases with input/output
- 🧪 [`README_TESTING.md`](touring-be/README_TESTING.md) - Testing guide and best practices
- 📊 [`HOW_TO_VIEW_COVERAGE.md`](touring-be/HOW_TO_VIEW_COVERAGE.md) - Coverage viewing guide
- 🔍 [`FAILED_TESTS.md`](touring-be/FAILED_TESTS.md) - Analysis of known test issues

---

## 📚 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register           # User registration
POST   /api/auth/login              # Email/password login
GET    /api/auth/google             # Google OAuth (redirect)
GET    /api/auth/google/callback    # Google OAuth callback
GET    /api/auth/facebook           # Facebook OAuth (redirect)
GET    /api/auth/facebook/callback  # Facebook OAuth callback
POST   /api/auth/refresh            # Refresh access token
POST   /api/auth/logout             # User logout
GET    /api/auth/me                 # Get current user
```

### Discovery & Zones

```
POST   /api/discover/parse          # Parse user preferences (AI)
POST   /api/discover/recommend      # Get zone recommendations
GET    /api/zones                   # List all zones
GET    /api/zones/:zoneId           # Get zone details
GET    /api/zones/:zoneId/search    # Search POIs in zone
GET    /api/zones/:zoneId/pois-priority  # Get priority POIs
GET    /api/poi/:placeId/details    # Get POI details
```

### Itinerary Management

```
POST   /api/itinerary/create        # Create new itinerary
GET    /api/itinerary               # List user itineraries
GET    /api/itinerary/:id           # Get itinerary details
PUT    /api/itinerary/:id           # Update itinerary
DELETE /api/itinerary/:id           # Delete itinerary
POST   /api/itinerary/:id/optimize  # Optimize itinerary
```

### Bookings & Payments

```
POST   /api/bookings/create         # Create booking
GET    /api/bookings                # List user bookings
GET    /api/bookings/:id            # Get booking details
PUT    /api/bookings/:id/cancel     # Cancel booking
POST   /api/payment/create-session  # Create payment session
POST   /api/payment/verify          # Verify payment
GET    /api/payment/history         # Payment history
```

### Reviews

```
POST   /api/reviews/create          # Create review (with images)
GET    /api/reviews/zone/:zoneId    # Get zone reviews
GET    /api/reviews/tour/:tourId    # Get tour reviews
PUT    /api/reviews/:id             # Update review
DELETE /api/reviews/:id             # Delete review
```

### Admin Endpoints

```
GET    /api/admin/users             # List all users
PUT    /api/admin/users/:id/ban     # Ban user account
PUT    /api/admin/users/:id/unban   # Unban user account
GET    /api/admin/guides            # List all guides
PUT    /api/admin/guides/:id/verify # Verify guide
PUT    /api/admin/guides/:id/reject # Reject guide
GET    /api/admin/stats             # Platform statistics
POST   /api/admin/promotions        # Create promotion
```

---

## 🔒 Security Features

### Authentication & Authorization
- ✅ **JWT-based Access Tokens** - 15-minute expiry
- ✅ **Refresh Tokens** - 7 days, HTTP-only cookie
- ✅ **OAuth2 Integration** - Google & Facebook login
- ✅ **Password Hashing** - bcrypt with salt rounds
- ✅ **Role-based Access Control** - Admin, Guide, Traveler roles
- ✅ **Protected Routes** - Middleware-based route protection
- ✅ **Real-time Ban Enforcement** - Immediate account blocking

**Implementation**: `touring-be/middlewares/authJwt.js`

### Data Protection
- ✅ **CORS Configuration** - Cross-origin request security
- ✅ **Rate Limiting** - Prevent abuse
- ✅ **Input Validation** - Sanitize user inputs
- ✅ **NoSQL Injection Prevention** - Mongoose schema validation
- ✅ **XSS Protection** - Content security policy
- ✅ **File Upload Security** - Type and size validation

### Account Security
- ✅ **Email Verification** - Confirm user email
- ✅ **Password Reset** - Secure reset flow
- ✅ **Account Status** - Active/Banned/Locked states
- ✅ **Session Management** - Secure cookie handling

---

## 📊 Admin Dashboard Features

### User Management
**Page**: `touring-fe/src/admin/pages/UserManagement.jsx`

**Features**:
- 👥 View all users with pagination
- 🔍 Search by name, email, location
- 🔒 Lock/Unlock user accounts with reason
- 📧 Email verification status
- 📊 User statistics dashboard
- 📤 Export users to CSV
- 🎭 Filter by role (Admin/Guide/Traveler)

### Guide Management
**Page**: `touring-fe/src/admin/pages/GuideManagement.jsx`

**All-in-one Guide Management** includes:
- ✅ Verify guide applications
- ❌ Reject with custom reasons
- 📊 Guide statistics (total, verified, pending, avg rating)
- 🔍 Search and filter capabilities
- 📤 Export guide data to CSV
- 📱 Responsive grid layout
- 🔄 Real-time updates

### Analytics Dashboard
**Page**: `touring-fe/src/admin/pages/Dashboard.jsx`

**Metrics**:
- 📈 Total users, guides, tours
- 💰 Revenue statistics
- 📊 Booking trends
- ⭐ Average ratings
- 📅 Daily/weekly/monthly reports

### Content Management
- 📝 **Blog Management** - Create and publish articles
- ❓ **Help Articles** - Manage FAQ and guides
- 🎫 **Promotions** - Create discount codes
- 🗺️ **Zone Configuration** - Manage POI categories

### Route Structure

```
/admin/dashboard          # Analytics overview
/admin/users              # User management
/admin/guides             # All-in-one guide management
/admin/tours              # Tour package management
/admin/bookings           # Booking management
/admin/zones              # Zone configuration
/admin/promotions         # Promotion management
/admin/blogs              # Blog management
/admin/help               # Help article management
```

---

## 🎨 UI Components

### Shared Components

| Component | Description | Features |
|-----------|-------------|----------|
| `GoongMapLibre.jsx` | Interactive map | POI markers, polylines, popups, clustering |
| `ProfileReviews.jsx` | Review system | Star rating, multi-image upload, pagination |
| `WhyChooseUs.jsx` | Feature showcase | Stats counter, testimonials, animations |
| `TourCard.jsx` | Tour display | Image, price, rating, quick actions |
| `Navbar.jsx` | Main navigation | Responsive, role-based menu |

### Admin Components

| Component | Location |
|-----------|----------|
| `AdminLayout.jsx` | Admin portal wrapper |
| `AdminSidebar.jsx` | Navigation sidebar |
| `AdminFooter.jsx` | Footer with links |
| `GuideCard.jsx` | Guide profile display |
| `GuideFilters.jsx` | Search and filter controls |
| `UserCard.jsx` | User profile card |
| `StatsCard.jsx` | Dashboard statistics |

### UI Library (Shadcn/ui)
- ✨ Button, Input, Select, Checkbox
- 📋 Table, Card, Dialog, Sheet
- 🔔 Toast, Alert, Badge
- 📅 Calendar, DatePicker
- 🎨 Fully customizable with Tailwind CSS

---

## 🌐 Deployment

### Environment Setup

#### Backend (Production)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/travyy
JWT_SECRET=your-strong-production-secret-key
JWT_REFRESH_SECRET=your-strong-refresh-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FRONTEND_URL=https://yourdomain.com
GEMINI_API_KEY=your-gemini-api-key
EMBED_SERVICE_URL=https://ai.yourdomain.com
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=your-app-password
```

#### Frontend (Production)
```env
VITE_API_URL=https://api.yourdomain.com
VITE_GOONG_API_KEY=your-goong-api-key
VITE_GOONG_MAPTILES_KEY=your-goong-maptiles-key
```

### Cookie Settings (Production)
```javascript
res.cookie("refresh_token", refreshToken, {
  httpOnly: true,
  secure: true,      // HTTPS only
  sameSite: "none",  // Cross-origin support
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
});
```

### Build Commands

```bash
# Backend
cd touring-be
npm install --production
npm start

# Frontend
cd touring-fe
npm install
npm run build
npm run preview  # Test production build

# AI Service
cd ai
pip install -r requirements.txt
python sync_zones_from_mongo.py
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

### Deployment Checklist
- [ ] Set all environment variables
- [ ] Configure CORS for production domain
- [ ] Enable HTTPS (SSL/TLS)
- [ ] Set up MongoDB Atlas or production database
- [ ] Configure email service (SMTP)
- [ ] Set up OAuth redirect URIs
- [ ] Enable rate limiting
- [ ] Set up logging and monitoring
- [ ] Configure backup strategy
- [ ] Test all API endpoints
- [ ] Test OAuth flows
- [ ] Verify file upload limits

---

## 📖 Documentation

### Core Documentation

| File | Description |
|------|-------------|
| [`LOGIN_FLOW_DOCUMENTATION.md`](LOGIN_FLOW_DOCUMENTATION.md) | Complete authentication flow with diagrams |
| [`ADMIN_GUIDE_CLEANUP.md`](ADMIN_GUIDE_CLEANUP.md) | Admin portal structure and features |
| [`ITINERARY_SYSTEM_SPECIFICATION.md`](ITINERARY_SYSTEM_SPECIFICATION.md) | Trip planning system architecture |
| [`GUIDE_MANAGEMENT_CHANGES.md`](GUIDE_MANAGEMENT_CHANGES.md) | Guide verification workflow |
| [`AI_FLOW_DIAGRAMS.md`](ai/AI_FLOW_DIAGRAMS.md) | AI service architecture |

### Testing Documentation

| File | Description |
|------|-------------|
| [`TEST_CASES_DOCUMENTATION.md`](touring-be/TEST_CASES_DOCUMENTATION.md) | All 90 test cases with I/O |
| [`README_TESTING.md`](touring-be/README_TESTING.md) | Testing guide and best practices |
| [`HOW_TO_VIEW_COVERAGE.md`](touring-be/HOW_TO_VIEW_COVERAGE.md) | Coverage viewing guide |
| [`COVERAGE_SUMMARY.md`](touring-be/COVERAGE_SUMMARY.md) | Test coverage summary |

### Feature Documentation

| File | Description |
|------|-------------|
| [`README_AI_FEATURES.md`](touring-be/README_AI_FEATURES.md) | AI integration details |
| [`FACEBOOK_OAUTH_SETUP.md`](touring-be/FACEBOOK_OAUTH_SETUP.md) | Facebook OAuth configuration |
| [`TRAVEL_AGENCY_UPDATE.md`](touring-be/TRAVEL_AGENCY_UPDATE.md) | Agency features |
| [`DEBUGGING_GUIDE.md`](DEBUGGING_GUIDE.md) | Common issues and solutions |

---

## 👥 Team

**DUFDUF Touring Team**  
FPT University - Software Engineering (SWP391)  
Semester: Fall 2025

### Project Info
- 🏫 **University**: FPT University
- 📚 **Course**: SWP391 - Software Engineering Project
- 📅 **Semester**: Fall 2025
- 🎯 **Project Type**: Capstone Project

### Repository
- 📦 **Repo**: [DUFDUF-Touring-](https://github.com/jayykioh/DUFDUF-Touring-)
- 👤 **Owner**: [@jayykioh](https://github.com/jayykioh)
- 🌿 **Branch**: cuocthi

---

## 📝 License

This project is developed as a capstone project for educational purposes at FPT University.

---

## 🤝 Contributing

This is an academic project. For questions or collaboration:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🔗 Quick Links

- 📖 [Full Test Documentation](touring-be/TEST_CASES_DOCUMENTATION.md)
- 🎯 [AI Features Guide](touring-be/README_AI_FEATURES.md)
- 🔐 [Login Flow Documentation](LOGIN_FLOW_DOCUMENTATION.md)
- 📊 [Coverage Report](touring-be/COVERAGE_SUMMARY.md)
- 🧪 [Testing Guide](touring-be/README_TESTING.md)
- 🐛 [Debugging Guide](DEBUGGING_GUIDE.md)

---

## 📞 Support & Issues

### Common Issues

**1. MongoDB Connection Failed**
```bash
# Check MongoDB is running
mongod --version

# Check connection string in .env
MONGODB_URI=mongodb://localhost:27017/travyy
```

**2. OAuth Not Working**
- Verify redirect URIs match exactly
- Check client ID and secret
- Ensure cookies are enabled
- See [LOGIN_FLOW_DOCUMENTATION.md](LOGIN_FLOW_DOCUMENTATION.md)

**3. AI Service Timeout**
```bash
# Restart AI service
cd ai
python app.py

# Check if FAISS index exists
ls index/faiss.index
```

**4. Tests Failing**
```bash
# Clear Jest cache
npm test -- --clearCache

# Run with verbose output
npm test -- --verbose
```

For more troubleshooting, see [`DEBUGGING_GUIDE.md`](DEBUGGING_GUIDE.md)

---

## 🎯 Project Status

- ✅ **Core Features**: Complete
- ✅ **Testing**: 90 tests passing, 77.21% coverage
- ✅ **Documentation**: Comprehensive
- ✅ **Security**: JWT + OAuth2 implemented
- ✅ **AI Integration**: Gemini + FAISS working
- ✅ **Admin Portal**: Full management system
- 🔄 **Optimization**: Ongoing improvements

---

## 🏆 Achievements

- ✅ 90+ comprehensive test cases
- ✅ 77.21% code coverage
- ✅ AI-powered recommendations
- ✅ Multi-role authentication
- ✅ Real-time map integration
- ✅ Comprehensive admin dashboard
- ✅ Payment integration
- ✅ Review system with multi-image upload

---

<div align="center">

### Made with ❤️ by DUFDUF Touring Team

**© 2025 TRAVYY - Smart Tourism Platform**

[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?logo=github)](https://github.com/jayykioh/DUFDUF-Touring-)
[![FPT University](https://img.shields.io/badge/FPT-University-FF6C37)](https://www.fpt.edu.vn/)

**Last Updated**: November 2, 2025 | **Version**: 1.0.0

</div>
