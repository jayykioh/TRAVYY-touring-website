# 🌍 TRAVYY — AI‑Powered Tourism **Connector** Platform

[![Node](https://img.shields.io/badge/node-18%2B-339933?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/vite-5.x-646CFF?logo=vite)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/express-5.x-black?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/mongodb-6.x-47A248?logo=mongodb)](https://www.mongodb.com/)
[![FastAPI](https://img.shields.io/badge/fastapi-0.115+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![FAISS](https://img.shields.io/badge/FAISS-CPU-FF6B35)](https://github.com/facebookresearch/faiss)
[![Gemini](https://img.shields.io/badge/AI-Gemini%20API-4285F4?logo=google)](https://ai.google.dev/)
[![MapLibre](https://img.shields.io/badge/MapLibre-GL-0E76A8)](https://maplibre.org/)
[![Goong](https://img.shields.io/badge/Goong-Maps-FF5722)](https://goong.io/)

> **Capstone Project – FPT University (FA25 · SWP391)**  
> **Travyy** is an intelligent **tourism connector** that aggregates tour data from multiple travel agencies and elevates user experience with AI‑powered discovery and custom itineraries.

---

## 🎯 Overview

**Travyy is _not_ a tour management system.** It is a **connector platform** that:

- **Aggregates** real tour data from **external travel agencies** (via their APIs)
- **Helps users discover** suitable zones and tours based on their preferences
- **Generates custom itineraries** using **Embeddings + LLM (Google Gemini)**
- **Routes bookings** to the unified Travyy checkout while preserving **agency ownership** of inventory

### 🌟 Key Features
- 🤖 **AI Discovery Engine** — Parse free‑text preferences and map them to zones using embeddings (FAISS) and Gemini
- 🧭 **Custom Itinerary Builder** — Auto‑compose and optimize multi‑day plans with POIs and agency tours
- 🏝️ **Zone Intelligence** — Vibe/theme‑based exploration of destinations and POIs
- 🔗 **Agency Integrations** — Pull live tour data from partner APIs; Travyy acts as **broker/connector**
- 🗺️ **Interactive Maps** — MapLibre GL visualization with POIs, polylines, clustering, and route optimization
- 🔐 **Secure Auth** — JWT + OAuth2 (Google, Facebook) with role-based access
- 👥 **Multi‑role Access** — Traveler · Agency · Admin
- 💳 **Payment Integration** — PayPal SDK for secure bookings
- 📱 **Responsive UI** — Modern React frontend with TailwindCSS and Shadcn/UI

---

## 🧠 AI Features Deep Dive

### 1) Preference Embedding & Zone Matching
- **Input Processing**: Vietnamese/English free text (e.g., "đi biển 3 ngày, thích ẩm thực và thiên nhiên") + vibe tags
- **Pipeline**:
  1. **LLM Parsing** (Gemini): Extract structured preferences (vibes, avoid, budget, pace)
  2. **Embedding Generation**: Text → Vector using Sentence-Transformers (Vietnamese model)
  3. **Semantic Search**: FAISS similarity search against pre-indexed zone vectors
  4. **Hybrid Scoring**: `finalScore = 0.6 * cosine(userEmbedding, zoneEmbedding) + 0.4 * keywordMatch`
- **Fallback Strategies**: LLM → Embedding → Keyword matching → Popularity scoring

### 2) POI Discovery & Filtering
- **APIs Used**: Map4D (primary) → Goong Maps (fallback)
- **Categories**: views, beach, nature, food, culture, shopping, nightlife
- **Filtering**: Zone boundary (polygon/radius), rating, distance, category
- **Data Structure**: Unified POI format with lat/lng, types, photos, ratings

### 3) Route Optimization & Timeline Building
- **Route Calculation**: Goong Trip API (primary) → Map4D Directions (fallback)
- **Timeline Logic**:
  - Zone best-time windows (morning: 07:30-11:30, etc.)
  - Travel time estimation between POIs
  - Category-based stay duration (food: 60min, views: 30min)
  - Time slot assignment (morning/afternoon/evening/night)
- **Output**: Encoded polyline, total distance/duration, itemized timeline

### 4) LLM‑Assisted Itinerary Enhancement (Gemini)
- **Model**: `gemini-2.0-flash-exp`
- **Prompt Engineering**: Structured prompts with zone info, POI list, route data, user preferences
- **Output Format**: JSON with summary and tips array
- **Async Processing**: Route optimization returns immediately; AI insights generated in background
- **Fallback**: Static tips if LLM fails

### 5) AI Implementation Status

#### ✅ Completed Features
- **Semantic Search**: FAISS-based zone matching with Vietnamese embeddings
- **Hybrid Scoring**: Combination of embedding similarity + keyword matching
- **LLM Preference Parsing**: Gemini extracts vibes, budget, pace from free text
- **Async AI Insights**: Background generation of itinerary tips and summaries
- **Fallback Strategies**: Multiple fallback layers for AI service failures

#### 🚧 Partially Implemented
- **Route Optimization**: Basic timeline building, needs AI enhancement
- **POI Recommendations**: Category-based, needs personalization
- **User Profiling**: Basic preferences, needs history analysis
- **Multi-language**: English/Vietnamese, needs more languages

#### ❌ Not Yet Implemented
- **Conversational AI**: Chat interface for interactive planning
- **Real-time Adjustments**: Weather/traffic-based route changes
- **Group Planning AI**: Collaborative decision making
- **Cost Optimization**: Budget-aware itinerary generation
- **Image Processing**: Visual preference analysis
- **Voice Commands**: Speech-based itinerary planning

---

## 🧩 System Architecture

```mermaid
graph TB
    subgraph "Frontend (React + Vite)"
        A[React App] --> B[MapLibre GL]
        A --> C[Shadcn/UI Components]
        A --> D[Axios HTTP Client]
    end

    subgraph "Backend (Node.js + Express)"
        E[Express Server] --> F[JWT Auth]
        E --> G[MongoDB Models]
        E --> H[API Routes]
        E --> I[Payment (PayPal)]
        E --> J[Email Service]
    end

    subgraph "AI Microservice (Python + FastAPI)"
        K[FastAPI Server] --> L[Sentence-Transformers]
        K --> M[FAISS Index]
        K --> N[Gemini LLM]
        L --> O[Hybrid Search]
        M --> P[Vector Storage]
        N --> Q[LLM Processing]
    end

    subgraph "External APIs"
        R[Map4D API] --> S[POI Search]
        T[Goong Maps API] --> U[Route Optimization]
        V[Google OAuth] --> W[Authentication]
        X[Facebook OAuth] --> W
    end

    A --> E
    E --> K
    K --> R
    K --> T
    E --> V
    E --> X
    E --> Y[(MongoDB)]
    K --> Y
```

### Data Flow Architecture
```
User Input → Frontend → Backend API → AI Service → External APIs → Database → Frontend Display
     ↓           ↓         ↓            ↓           ↓            ↓          ↓
Preferences → Parse → Zone Match → POI Search → Route Calc → AI Insights → UI Update
### AI Service API Endpoints
- `POST /embed` - Generate text embeddings
- `POST /search` - Semantic search in FAISS index
- `POST /hybrid-search` - Combined semantic + keyword search
- `POST /upsert` - Add/update vectors in index
- `GET /healthz` - Service health check
- `GET /stats` - Index statistics
- `POST /reset` - Clear FAISS index

### AI Data Flow
```
User Input → Backend → AI Service → FAISS Search → Gemini LLM → Structured Response → Frontend
     ↓           ↓         ↓            ↓            ↓           ↓            ↓
   Parse     Validate   Embed      Similarity   Generate     Format      Display
```

---

## 🛠️ Technology Stack

### Frontend (`touring-fe/`)
```
React 18.3.1 · Vite 5.x · TailwindCSS 4.x · Shadcn/ui (Radix UI)
MapLibre GL 5.x · Goong Maps JS 1.x · React Map4D 1.x
Axios 1.x · React Router 6.x · React Hook Form + Zod
Framer Motion · Lottie React · Three.js · Recharts
PayPal React JS SDK 8.x · DnD Kit · Lodash
```

### Backend (`touring-be/`)
```
Node.js 18+ · Express 5.x · MongoDB 6.x + Mongoose 8.x
JWT 9.x · Passport OAuth2 (Google/Facebook) · Bcrypt 6.x
Compression · CORS · Helmet · Rate Limiter · Multer
Nodemailer · PayPal SDK 1.x · QRCode · Speakeasy (2FA)
Zod (Validation) · DayJS · Axios · Polyline · Node Cache
```

### AI & Embeddings (`ai/`)
```
Python 3.11+ · FastAPI 0.115+ · Uvicorn 0.30+
Sentence-Transformers 3.x · FAISS CPU 1.9+ · NumPy 1.26+
Pydantic 2.x · Python-Dotenv · Vietnamese Embedding v2
Google Generative AI SDK · Gemini 2.0 Flash
```

### DevOps & Quality
```
Git · GitHub · ESLint · Prettier · Jest + Supertest
PowerShell Scripts · Concurrently · Nodemon
```

---

## 📁 Detailed Project Structure

```
capstone-project/
├─ touring-fe/                          # React Frontend
│  ├─ public/                           # Static assets
│  ├─ src/
│  │  ├─ components/                    # Reusable UI components
│  │  │  ├─ ui/                        # Shadcn/UI primitives
│  │  │  ├─ maps/                      # MapLibre, Goong components
│  │  │  ├─ forms/                     # Form components
│  │  │  └─ layout/                    # Layout components
│  │  ├─ pages/                        # Route pages
│  │  │  ├─ auth/                      # Login, Register, OAuth
│  │  │  ├─ discover/                  # Zone discovery
│  │  │  ├─ zones/                     # Zone details, POIs
│  │  │  ├─ itinerary/                 # Itinerary creation/results
│  │  │  ├─ booking/                   # Booking flow
│  │  │  ├─ profile/                   # User profile
│  │  │  └─ admin/                     # Admin dashboard
│  │  ├─ hooks/                        # Custom React hooks
│  │  ├─ utils/                        # Helpers, constants
│  │  ├─ contexts/                     # React contexts (Auth, etc.)
│  │  └─ App.jsx                       # Main app component
│  ├─ package.json
│  ├─ vite.config.js
│  ├─ tailwind.config.js
│  └─ eslint.config.js
│
├─ touring-be/                          # Node.js Backend
│  ├─ config/                           # Database config
│  ├─ controllers/                      # Route handlers
│  │  ├─ auth.controller.js
│  │  ├─ bookingController.js
│  │  ├─ cart.controller.js
│  │  ├─ helpController.js
│  │  ├─ notifyController.js
│  │  ├─ payment.controller.js
│  │  ├─ paypal.controller.js
│  │  ├─ profile.controller.js
│  │  ├─ promotionController.js
│  │  ├─ review.controller.js
│  │  ├─ security.controller.js
│  │  ├─ wishlist.controller.js
│  │  └─ admin/
│  │     ├─ guide.controller.js
│  │     └─ user.controller.js
│  ├─ middlewares/                      # Express middlewares
│  │  ├─ authJwt.js                     # JWT validation
│  │  ├─ passport.js                    # OAuth strategies
│  │  └─ vnAddress.routes.js
│  ├─ models/                           # MongoDB schemas
│  │  ├─ Users.js
│  │  ├─ Zones.js
│  │  ├─ Itinerary.js
│  │  ├─ Bookings.js
│  │  ├─ Carts.js
│  │  ├─ Reviews.js
│  │  ├─ PaymentSession.js
│  │  ├─ Notification.js
│  │  ├─ Promotion.js
│  │  ├─ HelpArticle.js
│  │  ├─ HelpFeedback.js
│  │  ├─ Tickets.js
│  │  ├─ Wishlist.js
│  │  └─ agency/                        # Agency-specific models
│  │     └─ guide/
│  ├─ routes/                           # API route definitions
│  │  ├─ auth.routes.js
│  │  ├─ bookingRoutes.js
│  │  ├─ carts.routes.js
│  │  ├─ discover.routes.js
│  │  ├─ help.routes.js
│  │  ├─ itinerary.routes.js
│  │  ├─ location.routes.js
│  │  ├─ notifyRoutes.js
│  │  ├─ payment.routes.js
│  │  ├─ paypal.routes.js
│  │  ├─ profile.routes.js
│  │  ├─ promotion.routes.js
│  │  ├─ reviewRoutes.js
│  │  ├─ security.routes.js
│  │  ├─ tour.routes.js
│  │  ├─ wishlist.routes.js
│  │  ├─ zone.routes.js
│  │  └─ __tests__/                     # Route tests
│  │     └─ admin/
│  ├─ services/                         # Business logic services
│  │  ├─ ai/                            # AI-related services
│  │  │  ├─ libs/                       # API clients
│  │  │  │  ├─ embedding-client.js      # Python embedding service
│  │  │  │  ├─ map4d.js                 # Map4D API client
│  │  │  │  └─ goong.js                 # Goong API client
│  │  │  └─ itinerary/                  # Itinerary optimization
│  │  │     └─ optimizer.js
│  │  ├─ zones/                         # Zone/POI services
│  │  │  ├─ index.js                    # Zone service
│  │  │  ├─ matcher.js                  # Zone matching logic
│  │  │  └─ poi-finder.js               # POI discovery
│  │  └─ embedding-sync-zones.js        # Zone embedding sync
│  ├─ utils/                            # Utilities
│  │  ├─ emailService.js
│  │  ├─ jwt.js
│  │  ├─ paymentHelpers.js
│  │  └─ gpx.js                         # GPX export utility
│  ├─ server.js                         # Main server file
│  ├─ package.json
│  └─ jest.config.cjs
│
├─ ai/                                  # Python AI Service
│  ├─ app.py                            # FastAPI application
│  ├─ sync_zones_from_mongo.py          # FAISS index builder
│  ├─ requirements.txt
│  ├─ index/                            # FAISS index storage
│  │  ├─ faiss.index                    # Vector index
│  │  └─ meta.json                      # Metadata
│  └─ README.md
│
└─ Documentation/                       # Project docs
  ├─ ADMIN_GUIDE_CLEANUP.md
  ├─ AI_FLOW_DIAGRAMS.md
  ├─ DEBUGGING_GUIDE.md
  ├─ FACEBOOK_OAUTH_SETUP.md
  ├─ GUIDE_MANAGEMENT_CHANGES.md
  ├─ ITINERARY_SYSTEM_SPECIFICATION.md
  ├─ LOGIN_FLOW_DOCUMENTATION.md
  ├─ TRAVEL_AGENCY_UPDATE.md
  ├─ TEST_CASES_DOCUMENTATION.md
```

---

## 🚀 Comprehensive Setup Guide

### Prerequisites
- **Node.js 18+** (LTS recommended)
- **MongoDB 6.0+** (local or Atlas)
- **Python 3.11+** (for AI service)
- **Git** (for cloning)
- **API Keys**: Google Gemini, Goong Maps, Map4D (optional), PayPal (optional)

### 1) Repository Setup
```bash
# Clone the repository
git clone https://github.com/jayykioh/TRAVYY-touring-website.git
cd TRAVYY-touring-website

# Verify branch (should be 'cuocthi' for latest)
git branch
```

### 2) Backend Configuration (`touring-be/`)

#### Install Dependencies
```bash
cd touring-be
npm install
```

#### Environment Variables
Create `.env` file in `touring-be/`:
```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/travyy

# JWT Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_REFRESH_SECRET=your-refresh-token-secret-key

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# AI Service
EMBED_SERVICE_URL=http://localhost:8088
GOOGLE_AI_API_KEY=your-gemini-api-key

# External APIs
MAP4D_API_KEY=your-map4d-api-key
GOONG_API_KEY=your-goong-api-key
GOONG_MAPTILES_KEY=your-goong-maptiles-key

# Email Service (for notifications)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# PayPal (for payments)
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_ENVIRONMENT=sandbox  # or 'production'

# Admin Default (dev only)
ADMIN_EMAIL=admin@travyy.com
ADMIN_PASSWORD=admin123
```

#### Database Setup
```bash
# Start MongoDB locally (if not using Atlas)
mongod --dbpath /path/to/your/db

# Or use MongoDB Compass to connect to your instance
```

#### Start Backend
```bash
npm run dev  # Uses nodemon for hot reload
```

### 3) Frontend Configuration (`touring-fe/`)

#### Install Dependencies
```bash
cd ../touring-fe
npm install
```

#### Environment Variables
Create `.env` file in `touring-fe/`:
```env
# Backend API
VITE_API_URL=http://localhost:5000

# Maps
VITE_GOONG_API_KEY=your-goong-api-key
VITE_GOONG_MAPTILES_KEY=your-goong-maptiles-key
VITE_MAP4D_API_KEY=your-map4d-api-key

# PayPal
VITE_PAYPAL_CLIENT_ID=your-paypal-client-id
```

#### Start Frontend
```bash
npm run dev
```

### 4) AI Service Setup (`ai/`)

#### Install Dependencies
```bash
cd ../ai

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
# source venv/bin/activate

# Install packages
pip install -r requirements.txt
```

#### Environment Variables
Create `.env` file in `ai/`:
```env
# Embedding Model
EMBEDDING_MODEL=AITeamVN/Vietnamese_Embedding_v2

# FAISS Configuration
INDEX_TYPE=FLAT  # or HNSW
INDEX_DIR=./index
DIM=1024

# MongoDB (for zone sync)
MONGODB_URI=mongodb://localhost:27017/travyy

# Server
PORT=8088
```

#### Build FAISS Index
```bash
# Sync zones from MongoDB to FAISS index
python sync_zones_from_mongo.py
```

#### Start AI Service
```bash
python app.py
```

### 5) Verification

#### Check Services
```bash
# Backend API
curl http://localhost:5000/api/health

# AI Service
curl http://localhost:8088/healthz

# Frontend
open http://localhost:5173
```

#### Default Admin Login
- **Email**: admin@travyy.com
- **Password**: admin123

---

## 📚 Complete API Reference

### Authentication Endpoints
```
POST   /api/auth/register          # User registration
POST   /api/auth/login             # User login
GET    /api/auth/google            # Google OAuth init
GET    /api/auth/google/callback   # Google OAuth callback
GET    /api/auth/facebook          # Facebook OAuth init
GET    /api/auth/facebook/callback # Facebook OAuth callback
POST   /api/auth/refresh           # Refresh JWT token
POST   /api/auth/logout            # Logout (clear cookies)
GET    /api/auth/me                # Get current user info
```

### Discovery & Zones
```
POST   /api/discover/parse              # AI parse user preferences
POST   /api/discover/recommend          # Get zone recommendations
GET    /api/zones                      # List all zones
GET    /api/zones/:zoneId              # Get zone details
GET    /api/zones/:zoneId/pois-priority # Get priority POIs by category
GET    /api/zones/:zoneId/pois/:category # Get POIs by category
GET    /api/zones/province/:province    # Get zones by province
GET    /api/poi/:placeId/details       # Get POI details
```

### Itinerary Management
```
POST   /api/itinerary                   # Create/get draft itinerary
GET    /api/itinerary                   # Get user's itineraries
GET    /api/itinerary/:id               # Get specific itinerary
PUT    /api/itinerary/:id               # Update itinerary
DELETE /api/itinerary/:id               # Delete itinerary
POST   /api/itinerary/:id/items         # Add POI to itinerary
DELETE /api/itinerary/:id/items/:poiId  # Remove POI from itinerary
PATCH  /api/itinerary/:id/items/reorder # Reorder POIs
POST   /api/itinerary/:id/optimize-ai   # Optimize with AI
GET    /api/itinerary/:id/export.gpx    # Export as GPX
```

### Bookings & Payments
```
POST   /api/bookings/create             # Create booking
GET    /api/bookings                    # Get user bookings
GET    /api/bookings/:id                # Get booking details
PUT    /api/bookings/:id/cancel         # Cancel booking
POST   /api/payment/create-session      # Create payment session
POST   /api/payment/verify              # Verify payment
GET    /api/payment/history             # Get payment history
```

### Reviews & Ratings
```
POST   /api/reviews/create              # Create review
GET    /api/reviews/zone/:zoneId        # Get zone reviews
GET    /api/reviews/tour/:tourId        # Get tour reviews
PUT    /api/reviews/:id                 # Update review
DELETE /api/reviews/:id                 # Delete review
```

### User Management
```
GET    /api/profile                     # Get user profile
PUT    /api/profile                     # Update profile
GET    /api/wishlist                    # Get wishlist
POST   /api/wishlist/add                # Add to wishlist
DELETE /api/wishlist/:id                # Remove from wishlist
```

### Admin Endpoints
```
GET    /api/admin/users                 # List users
PUT    /api/admin/users/:id/ban         # Ban user
PUT    /api/admin/users/:id/unban       # Unban user
GET    /api/admin/guides                # List guides
PUT    /api/admin/guides/:id/verify     # Verify guide
PUT    /api/admin/guides/:id/reject     # Reject guide
GET    /api/admin/stats                 # System stats
POST   /api/admin/promotions            # Create promotion
GET    /api/admin/bookings              # All bookings
GET    /api/admin/reviews               # All reviews
```

### Help & Support
```
GET    /api/help/articles               # Get help articles
POST   /api/help/feedback               # Submit feedback
```

---

## 🔒 Security Implementation

### Authentication & Authorization
- **JWT Tokens**: Access tokens (15min) + Refresh tokens (7 days, HTTP-only cookies)
- **OAuth2**: Google/Facebook integration via Passport.js
- **Password Security**: Bcrypt hashing with salt rounds
- **Role-Based Access**: Traveler, Agency, Admin roles
- **Session Management**: Secure cookie settings for production

### Data Protection
- **Input Validation**: Zod schemas for all API inputs
- **Rate Limiting**: Express rate limiter (100 req/15min per IP)
- **CORS**: Configured origins for production domains
- **Helmet**: Security headers (CSP, HSTS, etc.)
- **File Uploads**: Multer with type/size restrictions
- **XSS Prevention**: Sanitization and CSP headers

### API Security
- **NoSQL Injection Prevention**: Mongoose built-in protection
- **SQL Injection**: N/A (MongoDB)
- **Sensitive Data**: Encrypted storage for payment info
- **Audit Logging**: Request logging with Morgan

---

## 🗺️ Maps & Location Features

### Map Providers
- **Primary**: MapLibre GL JS (open-source, customizable)
- **Vietnam POI**: Goong Maps API (local coverage)
- **Fallback**: Map4D API (additional POI data)

### Map Features
- **Clustering**: POI clustering for performance
- **Polylines**: Route visualization with encoded polylines
- **Markers**: Custom markers for POIs and waypoints
- **Popups**: Rich POI information on click
- **Geocoding**: Address search and reverse geocoding
- **Routing**: Turn-by-turn directions

### Coordinate Systems
- **Storage**: MongoDB GeoJSON (longitude, latitude)
- **Display**: Standard lat/lng for frontend maps
- **APIs**: Mixed formats (some APIs use lat,lng, others lng,lat)

---

## 💳 Payment Integration

### PayPal Integration
- **SDK**: PayPal JavaScript SDK v8.x
- **Flow**: Create order → Approve → Capture
- **Currencies**: VND, USD support
- **Refunds**: Partial/full refund support

### Payment Flow
```
1. Create Booking → 2. Create PayPal Order → 3. User Approves → 4. Capture Payment → 5. Confirm Booking
```

### Security
- **PCI Compliance**: PayPal handles card data
- **Webhook Verification**: IPN/webhooks for payment confirmation
- **Fraud Prevention**: PayPal risk assessment

---

## 📊 Admin Dashboard

### User Management
- **Search & Filter**: By email, name, role, status
- **Actions**: Ban/unban, view details, reset password
- **Bulk Operations**: CSV export, bulk status changes

### Guide Management
- **Verification**: Approve/reject guide applications
- **Stats**: Guide performance metrics
- **Content**: Manage guide profiles and certifications

### Analytics
- **KPIs**: User registrations, bookings, revenue
- **Charts**: Time-series data with Recharts
- **Reports**: Exportable reports (PDF/CSV)

### Content Management
- **Blogs**: Create/edit blog posts
- **Help Center**: Manage FAQ and articles
- **Promotions**: Create discount codes and campaigns

---

## 🔧 Development & Testing

### Running Tests
```bash
# Backend tests
cd touring-be
npm test

# Frontend tests (if implemented)
cd touring-fe
npm test
```

### Code Quality
```bash
# Lint frontend
cd touring-fe
npm run lint

# Format code
npx prettier --write .
```

### Debugging
- **Backend**: Use `console.log` or Winston logging
- **Frontend**: React DevTools, browser console
- **AI Service**: Python logging, FastAPI docs at `/docs`
- **Database**: MongoDB Compass for queries

### Performance Monitoring
- **Response Times**: Morgan logging
- **Memory Usage**: Node.js `--inspect` flag
- **Database Queries**: MongoDB profiler

### AI Development Notes
- **Model Updates**: Vietnamese embedding model updates require FAISS index rebuild
- **API Limits**: Monitor Gemini API usage and implement rate limiting
- **Fallback Testing**: Always test fallback scenarios when AI service is unavailable
- **Async Handling**: AI insights are generated asynchronously - handle polling properly
- **Error Recovery**: Implement graceful degradation when AI features fail

---

## 🚀 Deployment Guide

### Production Environment Variables
```env
# Backend (.env)
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/travyy_prod
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
FRONTEND_URL=https://yourdomain.com
EMBED_SERVICE_URL=https://ai.yourdomain.com
GOOGLE_AI_API_KEY=your-prod-gemini-key
PAYPAL_ENVIRONMENT=production

# Frontend (.env)
VITE_API_URL=https://api.yourdomain.com
VITE_GOONG_API_KEY=your-prod-goong-key
```

### Build Commands
```bash
# Frontend build
cd touring-fe
npm run build

# Backend (no build needed for Node.js)
cd touring-be
npm ci --production

# AI Service (Docker recommended)
cd ai
docker build -t travyy-ai .
```

### Docker Deployment
```dockerfile
# AI Service Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8088
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8088"]
```

### Nginx Configuration
```nginx
# Frontend
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/touring-fe/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
    }
}

# Backend API
server {
    listen 5000;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
    }
}
```

### SSL/TLS Setup
```bash
# Let's Encrypt
certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

---

## 🐛 Troubleshooting

### Common Issues

#### Backend Won't Start
- **Check Node.js version**: `node --version` (must be 18+)
- **Check MongoDB connection**: Verify `MONGODB_URI`
- **Check port availability**: `netstat -ano | findstr :5000`
- **Check .env file**: Ensure all required variables are set

#### Frontend Build Fails
- **Clear cache**: `rm -rf node_modules/.vite`
- **Check dependencies**: `npm ls --depth=0`
- **Check Node.js version**: Must match backend

#### AI Service Issues
- **Python version**: `python --version` (must be 3.11+)
- **Virtual environment**: Ensure activated
- **FAISS index**: Run `python sync_zones_from_mongo.py`
- **Model download**: Check internet connection for embedding model

#### Map Not Loading
- **API keys**: Verify Goong/Map4D keys
- **CORS**: Check if API allows your domain
- **Console errors**: Check browser dev tools

#### Authentication Problems
- **JWT secrets**: Ensure secrets are set and match
- **OAuth callbacks**: Verify redirect URIs in Google/Facebook consoles
- **Cookies**: Check browser cookie settings

### Logs & Debugging
```bash
# Backend logs
cd touring-be
npm run dev  # Shows console output

# AI service logs
cd ai
python app.py  # Shows FastAPI logs

# MongoDB logs
mongod --logpath /var/log/mongodb.log
```

### Performance Issues
- **Database queries**: Use MongoDB Compass to analyze slow queries
- **Memory leaks**: Use `clinic` or `node --inspect`
- **API response times**: Check Morgan logs
- **Frontend bundle size**: Analyze with `vite-bundle-analyzer`

---

## 📖 Documentation Links

| Document | Description | Path |
|----------|-------------|------|
| Itinerary System Spec | Detailed itinerary flow and API | `ITINERARY_SYSTEM_SPECIFICATION.md` |
| AI Flow Diagrams | AI service architecture and flows | `ai/AI_FLOW_DIAGRAMS.md` |
| Admin Guide | Admin dashboard features | `ADMIN_GUIDE_CLEANUP.md` |
| Login Flow | OAuth2 implementation details | `LOGIN_FLOW_DOCUMENTATION.md` |
| Debugging Guide | Common issues and solutions | `DEBUGGING_GUIDE.md` |
| Facebook OAuth Setup | Social login configuration | `FACEBOOK_OAUTH_SETUP.md` |
| Guide Management | Guide verification process | `GUIDE_MANAGEMENT_CHANGES.md` |
| Travel Agency Integration | Agency API integration | `touring-be/TRAVEL_AGENCY_UPDATE.md` |
| Test Cases | Comprehensive test documentation | `TEST_CASES_DOCUMENTATION.md` |

---

## � Upcoming Features & Known Limitations

### 🔄 In Development

#### AI Features (High Priority)
- **Advanced AI Insights**: Enhanced LLM prompts for more personalized recommendations
- **Real-time AI Chat**: Conversational AI assistant for itinerary planning
- **Dynamic Route Re-optimization**: AI-powered route adjustments based on real-time conditions (traffic, weather)
- **Personalized Recommendations**: Machine learning models for user preference prediction
- **Multi-language Support**: AI translation for international travelers
- **Voice Input Processing**: Speech-to-text for preference input
- **Image Recognition**: Upload photos to influence recommendations
- **Collaborative AI**: AI assistance for group planning decisions
- **Predictive Analytics**: Forecast popular destinations and optimal timing
- **Sentiment Analysis**: Analyze reviews and social media for real-time insights

#### Itinerary Enhancements
- **Multi-day Itineraries**: Support for complex multi-day travel plans
- **Group Itineraries**: Collaborative planning for groups and families
- **Seasonal Optimization**: AI consideration of weather, seasons, and peak times
- **Budget Optimization**: AI-powered cost optimization across activities
- **Transportation Integration**: Public transport, rideshare, and flight integration

#### Agency Integrations
- **Live API Connections**: Real-time integration with major Vietnamese travel agencies
- **Dynamic Pricing**: Real-time price updates and availability checking
- **Unified Booking Flow**: Seamless booking across multiple agency platforms
- **Commission Management**: Automated commission tracking and settlement

#### User Experience
- **Progressive Web App (PWA)**: Offline functionality and mobile app experience
- **Advanced Filtering**: More sophisticated POI and tour filtering options
- **Social Features**: Itinerary sharing, reviews, ratings, and community features
- **Personalization Engine**: User profiles with preferences and history tracking

### ⚠️ Current Limitations

#### AI Service Limitations
- **Async Processing**: AI insights generation is background process - users see "⏳ Generating AI insights..." initially
- **Fallback Dependency**: If AI service is unavailable, falls back to basic keyword matching
- **Model Accuracy**: Vietnamese embedding model may have limitations with complex queries
- **Rate Limiting**: Gemini API has rate limits that may affect performance during peak usage
- **Context Window**: Limited context for very long itineraries in AI analysis
- **Real-time Learning**: AI doesn't learn from user feedback in real-time

#### AI Feature Gaps
- **Conversational AI**: No chat interface for interactive planning assistance
- **Dynamic Re-planning**: Cannot adjust itineraries based on real-time changes (weather, traffic)
- **Personalization Depth**: Limited user history analysis for recommendations
- **Multi-modal Input**: Only text-based preferences, no image or voice input
- **Cultural Context**: Limited understanding of Vietnamese cultural preferences
- **Cost Optimization**: AI doesn't optimize for budget constraints automatically

#### Data & Integration Issues
- **POI Data Quality**: External API data may be incomplete or outdated
- **Zone Coverage**: Limited to major Vietnamese destinations initially
- **Real-time Updates**: POI information not always real-time
- **API Reliability**: External APIs (Map4D, Goong) may have downtime

#### User Experience Gaps
- **Mobile Optimization**: Some features not fully optimized for mobile devices
- **Accessibility**: Limited support for screen readers and accessibility features
- **Offline Mode**: No offline functionality currently available
- **Multi-device Sync**: Limited synchronization across devices

#### Technical Debt
- **Error Handling**: Some edge cases not fully handled
- **Performance**: Large itineraries may cause performance issues
- **Testing Coverage**: Not all features have comprehensive test coverage
- **Documentation**: Some internal APIs lack detailed documentation

### 🎯 Roadmap (Q4 2025 - Q1 2026)

#### Phase 1: AI Enhancement (Dec 2025)
- [ ] Implement real-time AI chat assistant
- [ ] Improve Vietnamese language processing accuracy
- [ ] Add weather and seasonal considerations to AI recommendations
- [ ] Enhance fallback strategies for AI service failures

#### Phase 2: Platform Expansion (Jan 2026)
- [ ] Launch live agency integrations
- [ ] Implement multi-day itinerary support
- [ ] Add group planning features
- [ ] Expand POI database coverage

#### Phase 3: User Experience (Feb 2026)
- [ ] Release PWA version
- [ ] Implement advanced social features
- [ ] Add personalization engine
- [ ] Launch mobile app

#### Phase 4: Enterprise Features (Mar 2026)
- [ ] B2B API for travel agencies
- [ ] Advanced analytics dashboard
- [ ] White-label solutions
- [ ] Multi-market expansion

---

## �👥 Team & Contributing

**DUFDUF Touring Team** — FPT University (SWP391 · Fall 2025)

### Contributors
- **Project Lead**: [Jayykioh](https://github.com/jayykioh)
- **Team Members**: SWP391 Class

### Development Workflow
1. **Fork** the repository
2. **Create** feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m "Add amazing feature"`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** Pull Request

### Code Standards
- **ESLint**: Follow Airbnb config
- **Prettier**: Auto-format code
- **Commits**: Conventional commits (`feat:`, `fix:`, `docs:`)
- **Tests**: Write tests for new features
- **Documentation**: Update docs for API changes

---

## 📄 License

This project is developed for educational purposes at **FPT University**.  
© 2025 **Travyy – Smart Tourism Connector Platform**.

---

## 🙏 Acknowledgments

- **FPT University** for the capstone project opportunity
- **Google AI** for Gemini API access
- **Goong** for Vietnam maps and POI data
- **Map4D** for additional mapping services
- **Open Source Community** for the amazing tools and libraries

---

<div align="center">
  <sub>🚀 Built with ❤️ by FPT Students · Last Updated: November 2, 2025 · Version: 1.0.0</sub>
</div>