# 🌍 TRAVYY — AI-Powered Tourism Platform

[![Node](https://img.shields.io/badge/node-18%2B-339933?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.3-61DAFB?logo=react)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/mongodb-6.x-47A248?logo=mongodb)](https://www.mongodb.com/)
[![FastAPI](https://img.shields.io/badge/fastapi-0.115+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/docker-ready-2496ED?logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> **FPT University Capstone Project (FA25 · SWP391)**  
> An intelligent tourism platform connecting travelers with agencies through AI-powered discovery, personalized recommendations, and smart itinerary planning.

---

## 🎯 What is TRAVYY?

**TRAVYY is a tourism connector platform** that bridges travelers and travel agencies through intelligent technology:

- 🤖 **AI-Powered Discovery** — Natural language search with Vietnamese embedding models + FAISS vector search
- 📊 **Personalized Recommendations** — PostHog behavioral tracking with weekly ML-powered profile building
- 🧭 **Smart Itinerary Planning** — Auto-generated multi-day plans with POI recommendations + route optimization
- 🏝️ **Zone Intelligence** — 1000+ curated destinations with vibe-based exploration (beach, culture, food)
- 🔗 **Agency Integration** — Connect multiple travel agencies with unified booking experience
- 🗺️ **Interactive Maps** — MapLibre GL + Goong Maps for visualization and route planning

---

## ✨ Key Features

### 🔍 Discovery Engine
- **Manual Discovery** — Select vibes (beach, food, culture) + free text → Instant zone recommendations
- **AI Personalization** — System learns from interactions (views, bookings, saves) → Auto-suggest perfect zones
- **Hybrid Search** — Semantic similarity (FAISS) + keyword matching + location proximity scoring

### 🧳 Custom Itinerary Builder
1. **Choose Zone** — Browse 1000+ destinations with photos, vibes, descriptions
2. **Discover POIs** — Auto-fetch nearby points of interest (restaurants, views, beaches, temples)
3. **Auto-Optimize** — System arranges POIs by time slots (morning/afternoon/evening/night)
4. **Route Planning** — Calculate distances, travel times, generate map routes
5. **AI Insights** — Gemini LLM generates personalized tips and summaries

### 👥 Multi-Role System
- **Travelers** — Browse, book, save wishlists, create itineraries, manage bookings
- **Agencies** — Add tours, manage inventory, receive bookings, view analytics
- **Admins** — User management, content moderation, system analytics

### 🔐 Security & Auth
- JWT access + refresh tokens with HTTP-only cookies
- OAuth2 integration (Google, Facebook)
- Role-based access control (RBAC)
- 2FA support with TOTP (Speakeasy)

### 💳 Payment & Booking
- PayPal SDK integration (sandbox + live mode)
- Secure checkout with cart management
- Promotion codes and discounts
- Automated refund processing

---

## 🏗️ Architecture

### System Overview
```
┌─────────────────────────────────────────────────────────────┐
│                     TRAVYY Platform                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  📱 Frontend (React + Vite)                                  │
│     ├─ MapLibre GL + Goong Maps                             │
│     ├─ TailwindCSS + Shadcn/UI                              │
│     └─ PostHog Analytics                                     │
│                          │                                    │
│                          ▼                                    │
│  🔧 Backend (Node.js + Express)                             │
│     ├─ JWT + OAuth2 Authentication                          │
│     ├─ MongoDB (Mongoose ODM)                               │
│     ├─ Socket.IO (Real-time)                                │
│     ├─ PayPal SDK                                           │
│     └─ Weekly Profile Sync Cron                             │
│                          │                                    │
│                          ▼                                    │
│  🤖 AI Service (Python + FastAPI)                           │
│     ├─ FAISS Vector Search                                  │
│     ├─ Vietnamese Embedding v2                              │
│     └─ Gemini 2.0 Flash LLM                                 │
│                          │                                    │
│                          ▼                                    │
│  🗺️ External APIs                                           │
│     ├─ Goong Maps (Routing + Geocoding)                    │
│     ├─ Map4D (POI Search)                                   │
│     └─ PostHog (Event Tracking)                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### AI Pipeline Flow

#### **Pipeline 1: Manual Discovery (Real-time)**
```
User Input (vibes + freeText)
    ↓
LLM Parser (Gemini) — Extract structured preferences
    ↓
Embedding Generator — Text → 1024-dim vector
    ↓
FAISS Search — Cosine similarity matching
    ↓
Multi-factor Scoring — hardVibe (40%) + embed (40%) + proximity (20%)
    ↓
Top 10 Zones
```

#### **Pipeline 2: AI Personalization (Weekly Batch)**
```
PostHog Events (tour_view, booking, bookmark)
    ↓
Weekly Cron (Sunday 2:00 AM) — Fetch 7 days of events
    ↓
Aggregator — Weighted vibes (booking ×5.0, view ×0.5) + time decay
    ↓
Build Weighted Text — "beach beach beach food food mountain..."
    ↓
Generate Embedding — 1024-dim user profile vector
    ↓
Upsert FAISS + MongoDB — Cache for instant recommendations
    ↓
Discovery Wrapped UI — Show user's travel personality
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18.3 + Vite 5.x
- **Styling:** TailwindCSS 4.x + Shadcn/UI (Radix UI)
- **Maps:** MapLibre GL 5.x + Goong Maps JS 1.x
- **State:** React Context + React Query
- **Forms:** React Hook Form + Zod validation
- **Animation:** Framer Motion + Lottie
- **Payment:** PayPal React JS SDK 8.x

### Backend
- **Runtime:** Node.js 18+ with Express 5.x
- **Database:** MongoDB 6.x with Mongoose 8.x
- **Auth:** JWT 9.x + Passport OAuth2 + Bcrypt 6.x
- **Real-time:** Socket.IO 4.x
- **Email:** Nodemailer + SendGrid
- **Payments:** PayPal REST SDK
- **Cron:** node-cron (weekly profile sync)
- **Analytics:** PostHog SDK

### AI Service
- **Framework:** FastAPI 0.115+ with Uvicorn
- **Embeddings:** Sentence-Transformers 3.x (Vietnamese_Embedding_v2)
- **Vector Search:** FAISS CPU 1.9+
- **LLM:** Google Generative AI SDK (Gemini 2.0 Flash)
- **Validation:** Pydantic 2.x

### DevOps
- **Containerization:** Docker + Docker Compose
- **Web Server:** Nginx (production)
- **Process Manager:** PM2 (recommended)
- **Monitoring:** PostHog + health endpoints

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- Python 3.11+ and pip
- MongoDB 6.x (local or Atlas)
- Docker & Docker Compose (recommended)

### Option 1: Docker Compose (Recommended)

1. **Clone and configure:**
```bash
git clone https://github.com/jayykioh/TRAVYY-touring-website.git
cd TRAVYY-touring-website
cp .env.example .env
```

2. **Edit `.env` file** with your credentials:
```env
# MongoDB
MONGODB_URI=mongodb://mongodb:27017/travelApp

# JWT Secrets (generate new ones!)
ACCESS_TOKEN_SECRET=your_access_secret_here
REFRESH_TOKEN_SECRET=your_refresh_secret_here

# OAuth2
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# PostHog Analytics
POSTHOG_API_KEY=your_posthog_key
POSTHOG_PERSONAL_API_KEY=your_personal_key

# Maps
GOONG_API_KEY=your_goong_key
MAP4D_API_KEY=your_map4d_key

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client
PAYPAL_CLIENT_SECRET=your_paypal_secret
PAYPAL_MODE=sandbox

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

3. **Start services:**
```bash
docker-compose up -d
```

4. **Access the app:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- AI Service: http://localhost:8088

### Option 2: Manual Setup

#### Backend
```bash
cd touring-be
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

#### Frontend
```bash
cd touring-fe
npm install
cp .env.example .env
# Edit .env with backend URL
npm run dev
```

#### AI Service
```bash
cd ai
python -m venv .venv
.venv\Scripts\Activate.ps1  # Windows
# or: source .venv/bin/activate  # Linux/Mac

pip install -r requirements.txt
cp .env.example .env
# Edit .env with Gemini API key
python app.py
```

---

## 📚 Documentation

### Essential Guides
- **[Quick Start Guide](QUICK_START.md)** — Get started in 5 minutes
- **[Docker Deployment](DOCKER_DEPLOYMENT.md)** — Complete containerization guide
- **[Production Checklist](PRODUCTION_CHECKLIST.md)** — Pre-launch validation (100+ items)
- **[Discovery Pipeline](DISCOVERY_PIPELINE_COMPLETE.md)** — How AI discovery works
- **[Docker Auth Config](DOCKER_AUTH_CONFIG.md)** — CORS and OAuth2 setup

### API Documentation
- Backend API: `http://localhost:4000/api-docs` (when running)
- AI Service: `http://localhost:8088/docs` (FastAPI auto-docs)

---

## 📁 Project Structure

```
travyy/
├── touring-fe/                 # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ui/            # Shadcn/UI primitives
│   │   │   └── maps/          # Map components
│   │   ├── pages/             # Route pages
│   │   │   ├── ViDoi.jsx      # Discovery vibe selection
│   │   │   ├── DiscoverResults.jsx      # Zone search results
│   │   │   ├── DiscoveryWrappedNew.jsx  # AI personality reveal
│   │   │   ├── ZoneDetail.jsx           # Zone + POIs
│   │   │   └── ItineraryResults.jsx     # Custom itinerary
│   │   ├── hooks/             # Custom React hooks
│   │   └── utils/             # Helpers + constants
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── touring-be/                 # Node.js Backend
│   ├── config/                # Configuration
│   │   ├── db.js
│   │   └── posthog.config.js
│   ├── controller/            # Route handlers
│   │   ├── recommendations.controller.js
│   │   └── ...
│   ├── models/                # Mongoose schemas
│   │   ├── User.js
│   │   ├── UserProfile.js     # AI profiles
│   │   ├── Zone.js
│   │   └── ...
│   ├── routes/                # Express routes
│   │   ├── discover.routes.js
│   │   ├── recommendations.routes.js
│   │   └── ...
│   ├── services/              # Business logic
│   │   ├── zones/
│   │   │   ├── matcher.js     # Zone matching
│   │   │   └── scorer.js      # Scoring algorithm
│   │   ├── ai/
│   │   │   └── libs/
│   │   │       ├── llm.js     # Gemini wrapper
│   │   │       └── embedding-client.js
│   │   ├── posthog/
│   │   │   ├── event-fetcher.js
│   │   │   └── aggregator.js
│   │   └── itinerary/
│   ├── jobs/
│   │   └── weeklyProfileSync.js  # Weekly ML cron
│   ├── Dockerfile
│   ├── server.js
│   └── package.json
│
├── ai/                        # Python AI Service
│   ├── app.py                # FastAPI server
│   ├── embedding_logger.py   # Logging
│   ├── index/                # FAISS storage
│   │   ├── faiss.index
│   │   └── meta.json
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .venv/
│
├── docker-compose.yml         # Multi-service orchestration
├── .env.example              # Environment template
├── validate-deployment.ps1   # Pre-deployment checks
└── README.md                 # This file
```

---

## 🔧 Configuration

### Environment Variables

#### Backend (`.env`)
```env
# Server
PORT=4000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/travelApp

# JWT
ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRY=30m
REFRESH_TOKEN_EXPIRY=7d

# OAuth2
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback

FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_CALLBACK_URL=http://localhost:4000/api/auth/facebook/callback

# AI Service
AI_SERVICE_URL=http://localhost:8088

# Maps & Geocoding
GOONG_API_KEY=your_goong_key
MAP4D_API_KEY=your_map4d_key

# Gemini LLM
GEMINI_API_KEY=your_gemini_key

# PostHog
POSTHOG_API_KEY=your_project_key
POSTHOG_PERSONAL_API_KEY=your_personal_key
POSTHOG_HOST=https://us.i.posthog.com
POSTHOG_PROJECT_ID=your_project_id

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client
PAYPAL_CLIENT_SECRET=your_paypal_secret
PAYPAL_MODE=sandbox

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:5174

# Frontend
FRONTEND_URL=http://localhost:5173
```

#### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:4000
VITE_AI_API_URL=http://localhost:8088
VITE_GOONG_API_KEY=your_goong_key
VITE_MAP4D_API_KEY=your_map4d_key
VITE_PAYPAL_CLIENT_ID=your_paypal_client
VITE_POSTHOG_KEY=your_posthog_key
```

#### AI Service (`.env`)
```env
PORT=8088
EMBEDDING_MODEL=AITeamVN/Vietnamese_Embedding_v2
INDEX_TYPE=FLAT
INDEX_DIR=./index
```

---

## 🧪 Testing

### Backend Tests
```bash
cd touring-be
npm test
```

### API Health Checks
```bash
# Backend
curl http://localhost:4000/api/health

# AI Service
curl http://localhost:8088/healthz
```

### Validation Script
```powershell
# Windows PowerShell
./validate-deployment.ps1
```

---

## 📊 Monitoring & Analytics

### PostHog Integration
TRAVYY uses PostHog for user analytics and AI personalization:

**Tracked Events:**
- `tour_view` — User views a tour
- `tour_booking_complete` — User completes booking
- `tour_bookmark` — User saves tour to wishlist
- `blog_view` — User reads blog
- `zone_view` — User explores zone

**Weekly Profile Sync:**
- Runs every Sunday at 2:00 AM
- Fetches 7 days of events from PostHog
- Aggregates by user with weighted scoring
- Generates 1024-dim embedding vectors
- Updates FAISS index + MongoDB UserProfile
- Powers "Discovery Wrapped" feature

### Health Monitoring
```bash
# Check all services
./validate-deployment.ps1

# Individual checks
curl http://localhost:4000/api/health
curl http://localhost:8088/healthz
```

---

## 🚀 Deployment

### Production Deployment Workflow

1. **Pre-deployment Validation**
```bash
./validate-deployment.ps1
```

2. **Environment Setup**
- Generate new JWT secrets
- Update OAuth callback URLs to production domain
- Change PayPal mode to `live`
- Set `NODE_ENV=production`
- Configure CORS_ORIGINS with production URLs

3. **Build Docker Images**
```bash
docker-compose build --no-cache
```

4. **Deploy**
```bash
docker-compose up -d
```

5. **Setup SSL (Let's Encrypt)**
```bash
sudo certbot --nginx -d yourdomain.com
```

### Deployment Guides
- **Quick Start:** [QUICK_START.md](QUICK_START.md)
- **Docker Setup:** [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)
- **Production Checklist:** [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md)
- **Auth Config:** [DOCKER_AUTH_CONFIG.md](DOCKER_AUTH_CONFIG.md)

---

## 🤝 Contributing

This is a capstone project for FPT University. Contributions welcome from team members and reviewers.

### Development Workflow
1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes with clear commits
3. Test thoroughly
4. Create pull request
5. Code review
6. Merge after approval

---

## 📝 License

Educational project for FPT University Capstone (SWP391).

---

## 👥 Team

**FPT University — FA25 · SWP391**

- **Project:** Tourism Platform with AI
- **Duration:** Fall 2025 Semester
- **Repository:** [github.com/jayykioh/TRAVYY-touring-website](https://github.com/jayykioh/TRAVYY-touring-website)

---

## 📞 Support

### Documentation
- [Quick Start Guide](QUICK_START.md)
- [Docker Deployment](DOCKER_DEPLOYMENT.md)
- [Production Checklist](PRODUCTION_CHECKLIST.md)
- [Discovery Pipeline](DISCOVERY_PIPELINE_COMPLETE.md)

### API Docs
- Backend: http://localhost:4000/api-docs
- AI Service: http://localhost:8088/docs

---

## 🎓 Acknowledgments

- **FPT University** for guidance
- **Google Gemini AI** for LLM
- **Facebook FAISS** for vector search
- **PostHog** for analytics
- **Goong Maps** for Vietnam map services

---

## 📈 Project Status

✅ **Production Ready**

- ✅ Core features complete
- ✅ AI discovery with FAISS + Gemini
- ✅ Personalization with PostHog
- ✅ Itinerary builder with route optimization
- ✅ JWT + OAuth2 authentication
- ✅ PayPal payment integration
- ✅ Docker containerization
- ✅ Comprehensive documentation

### Future Enhancements
- Real-time chat support
- Mobile app (React Native)
- Multi-language i18n
- Advanced analytics dashboard
- Agency self-service portal
- AI price optimization

---

**Built with ❤️ by FPT University Students**

