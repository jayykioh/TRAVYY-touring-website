# 🌍 TRAVYY — AI‑Powered Tourism **Connector** Platform

[![Node](https://img.shields.io/badge/node-18%2B-339933?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/vite-5.x-646CFF?logo=vite)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/express-4.x-black?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/mongodb-6.x-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Gemini](https://img.shields.io/badge/AI-Gemini%20API-4285F4?logo=google)](https://ai.google.dev/)
[![MapLibre](https://img.shields.io/badge/MapLibre-GL-0E76A8)](https://maplibre.org/)

> **Capstone Project – FPT University (FA25 · SWP391)**  
> **Travyy** is an intelligent **tourism connector** that aggregates tour data from multiple travel agencies and elevates user experience with AI‑powered discovery and custom itineraries.

---

## 🎯 Overview

**Travyy is _not_ a tour management system.** It is a **connector platform** that:

- **Aggregates** real tour data from **external travel agencies** (via their APIs)
- **Helps users discover** suitable zones and tours based on their preferences
- **Generates custom itineraries** using **Embeddings + LLM (Google Gemini)**
- **Routes bookings** to the unified Travyy checkout while preserving **agency ownership** of inventory

### 🌟 Highlights
- 🤖 **AI Discovery Engine** — Parse free‑text preferences and map them to zones using embeddings (FAISS) and Gemini
- 🧭 **Custom Itinerary Builder** — Auto‑compose and optimize multi‑day plans
- 🏝️ **Zone Intelligence** — Vibe/theme‑based exploration of destinations and POIs
- 🔗 **Agency Integrations** — Pull live tour data from partner APIs; Travyy acts as **broker/connector**
- 🗺️ **Interactive Maps** — MapLibre GL visualization with POIs, polylines, clustering
- 🔐 **Secure Auth** — JWT + OAuth2 (Google, Facebook)
- 👥 **Multi‑role Access** — Traveler · Agency · Admin

---

## 🧠 AI Features

### 1) Preference Embedding & Zone Matching
- **Input**: Vietnamese/English free text (e.g., “đi biển 3 ngày, thích ẩm thực và thiên nhiên”).
- **Pipeline**: Text → Embedding (Sentence‑Transformers) → **FAISS** similarity search → Top zones.
- **Scoring**: `finalScore = 0.6 * cosine(userEmbedding, zoneEmbedding) + 0.4 * keywordMatch`.

### 2) LLM‑Assisted Itinerary Optimization (Gemini)
- Gemini parses intent (vibes, duration, constraints) → selects POIs → **orders by travel time, opening hours, proximity**.
- Works with external tours: users can **mix agency tours + POIs** into a single itinerary.

---

## 🧩 Architecture

```text
Frontend (React + Vite + Tailwind + Shadcn/UI + MapLibre)
   ↓
Backend (Node.js + Express + Mongoose + JWT + Passport OAuth2)
   ↓
AI Microservice (Flask + FAISS + Sentence‑Transformers + Gemini)
   ↓
External Agency APIs (Tours / Availability / Pricing)
```

**Data Layer**: MongoDB (Users, Zones, Reviews, Bookings, Itineraries)  
**Vector Store**: FAISS (`ai/index/faiss.index`)  
**Maps**: MapLibre GL; Goong Maps API for VN POI/search where applicable

---

## 🛠️ Tech Stack

### Frontend (`touring-fe/`)
```
React 18 · Vite 5 · TailwindCSS · Shadcn/ui · React Router 6
MapLibre GL · Lucide React · Sonner · Axios · React Hook Form · Zod
```

### Backend (`touring-be/`)
```
Node.js 18+ · Express · MongoDB + Mongoose · JWT · Passport (Google/Facebook)
Nodemailer · Multer · CORS · Rate Limiter
```

### AI & APIs (`ai/`)
```
Python 3.11+ · Flask · Google Gemini API · FAISS · Sentence‑Transformers
Goong Maps API (VN POI/search)
```

### DevOps & Tools
```
Git · GitHub · ESLint · Prettier · PowerShell scripts
```

---

## 📁 Project Structure

```text
capstone-project/
├─ touring-fe/                 # Frontend (React + Vite)
│  ├─ src/
│  │  ├─ admin/                # Admin portal (pages/components)
│  │  ├─ auth/                 # Auth context & hooks
│  │  ├─ components/           # Shared UI
│  │  ├─ pages/                # Home, Tours, Profile, ...
│  │  └─ utils/                # Helpers
│  └─ public/
│
├─ touring-be/                 # Backend (Express)
│  ├─ routes/                  # API endpoints
│  │  ├─ auth.routes.js
│  │  ├─ zone.routes.js
│  │  ├─ itinerary.routes.js
│  │  ├─ bookingRoutes.js
│  │  ├─ payment.routes.js
│  │  └─ admin/
│  ├─ services/                # Business logic
│  │  ├─ ai/                   # Gemini, embeddings
│  │  ├─ zones/                # Zone matching & scoring
│  │  └─ itinerary/            # Optimizer
│  ├─ models/                  # MongoDB schemas
│  ├─ controller/              # Controllers
│  └─ middlewares/             # JWT, OAuth, validators
│
├─ ai/                         # AI Service (Flask)
│  ├─ app.py                   # API server
│  ├─ sync_zones_from_mongo.py # Build FAISS index
│  ├─ requirements.txt
│  └─ index/
│     ├─ faiss.index
│     └─ meta.json
│
└─ Documentation/              # Architecture & guides
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

#### 1) Clone Repository
```bash
git clone https://github.com/jayykioh/DUFDUF-Touring-.git
cd DUFDUF-Touring-
```

#### 2) Backend Setup
```bash
cd touring-be
npm install

# Create .env
cp .env.example .env
# Fill: MongoDB URI, JWT secrets, OAuth creds, Gemini key, Email creds

npm run dev
```

**Backend .env**
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

#### 3) Frontend Setup
```bash
cd touring-fe
npm install

cp .env.example .env
npm run dev
```

**Frontend .env**
```env
VITE_API_URL=http://localhost:5000
VITE_GOONG_API_KEY=your-goong-api-key
VITE_GOONG_MAPTILES_KEY=your-goong-maptiles-key
```

#### 4) AI Service (Recommended)
```bash
cd ai
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env   # add MongoDB URI if needed
python sync_zones_from_mongo.py
python app.py
```

### Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **AI Service**: http://localhost:8000
- **Admin Portal**: http://localhost:5173/admin

### Default Admin (Dev only)
```
Email: admin@travyy.com
Password: admin123
```

---

## 📚 API Overview

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/google
GET    /api/auth/google/callback
GET    /api/auth/facebook
GET    /api/auth/facebook/callback
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me
```

### Discovery & Zones
```
POST   /api/discover/parse          # AI parse preferences
POST   /api/discover/recommend      # Zone recommendations
GET    /api/zones                   # List zones
GET    /api/zones/:zoneId           # Zone details
GET    /api/zones/:zoneId/search    # Search POIs in zone
GET    /api/zones/:zoneId/pois-priority
GET    /api/poi/:placeId/details
```

### Itinerary
```
POST   /api/itinerary/create
GET    /api/itinerary
GET    /api/itinerary/:id
PUT    /api/itinerary/:id
DELETE /api/itinerary/:id
POST   /api/itinerary/:id/optimize  # AI optimization
```

### Bookings & Payments
```
POST   /api/bookings/create
GET    /api/bookings
GET    /api/bookings/:id
PUT    /api/bookings/:id/cancel
POST   /api/payment/create-session
POST   /api/payment/verify
GET    /api/payment/history
```

### Reviews
```
POST   /api/reviews/create
GET    /api/reviews/zone/:zoneId
GET    /api/reviews/tour/:tourId
PUT    /api/reviews/:id
DELETE /api/reviews/:id
```

### Admin
```
GET    /api/admin/users
PUT    /api/admin/users/:id/ban
PUT    /api/admin/users/:id/unban
GET    /api/admin/guides
PUT    /api/admin/guides/:id/verify
PUT    /api/admin/guides/:id/reject
GET    /api/admin/stats
POST   /api/admin/promotions
```

---

## 🔒 Security

### AuthN/Z
- JWT Access (short‑lived) + Refresh (HTTP‑only cookie)
- OAuth2 (Google, Facebook) via Passport
- Role‑based access (Traveler/Agency/Admin)

### Data Protection
- CORS, Rate Limiting, Input Validation
- Mongoose schema validation (NoSQL injection prevention)
- XSS/CSP hardening
- File uploads: type/size limits via Multer

---

## 📊 Admin Dashboard

- **User Management**: search, paginate, lock/unlock, verify email
- **Guide Management**: verify/reject, stats, CSV export
- **Analytics**: users/guides/tours, revenue, booking trends
- **Content**: blogs, help center, promotions
- **Zones**: categories, embeddings sync tools

**Key pages** (frontend):
```
/admin/dashboard
/admin/users
/admin/guides
/admin/tours
/admin/bookings
/admin/zones
/admin/promotions
/admin/blogs
/admin/help
```

---

## 🌐 Deployment

### Backend (Production)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/travyy
JWT_SECRET=your-strong-prod-secret
JWT_REFRESH_SECRET=your-strong-refresh-secret
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

### Frontend (Production)
```env
VITE_API_URL=https://api.yourdomain.com
VITE_GOONG_API_KEY=your-goong-api-key
VITE_GOONG_MAPTILES_KEY=your-goong-maptiles-key
```

### Cookie Settings
```js
res.cookie("refresh_token", refreshToken, {
  httpOnly: true,
  secure: true,      // HTTPS only
  sameSite: "none", // Cross-origin
  maxAge: 7 * 24 * 60 * 60 * 1000
});
```

### Build & Run
```bash
# Backend
cd touring-be && npm ci && npm start

# Frontend
cd touring-fe && npm ci && npm run build && npm run preview

# AI Service
cd ai && pip install -r requirements.txt \
  && python sync_zones_from_mongo.py \
  && gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

### Deployment Checklist
- [ ] Environment variables set
- [ ] CORS configured (prod domains)
- [ ] HTTPS (SSL/TLS)
- [ ] MongoDB Atlas/managed DB
- [ ] SMTP configured
- [ ] OAuth redirect URIs
- [ ] Rate limiting enabled
- [ ] Logging/monitoring
- [ ] Backups

---

## 📖 Documentation

| Topic | Path |
|------|------|
| Login/OAuth Flow | `LOGIN_FLOW_DOCUMENTATION.md` |
| Admin Portal | `ADMIN_GUIDE_CLEANUP.md` |
| Itinerary System | `ITINERARY_SYSTEM_SPECIFICATION.md` |
| Agency Integrations | `touring-be/TRAVEL_AGENCY_UPDATE.md` |
| Facebook OAuth Setup | `touring-be/FACEBOOK_OAUTH_SETUP.md` |
| Debugging | `DEBUGGING_GUIDE.md` |
| AI Diagrams | `ai/AI_FLOW_DIAGRAMS.md` |

---

## 👥 Team

**DUFDUF Touring Team** — FPT University (SWP391 · Fall 2025)  
- 📦 Repo: `https://github.com/jayykioh/DUFDUF-Touring-`  
- 🌿 Branch: `cuocthi`

---

## 🧾 License

This project is developed for educational purposes at **FPT University**.  
© 2025 **Travyy – Smart Tourism Connector Platform**.

---

## 🤝 Contributing

1. Fork the repository  
2. Create a feature branch: `git checkout -b feature/amazing-feature`  
3. Commit: `git commit -m "Add amazing feature"`  
4. Push: `git push origin feature/amazing-feature`  
5. Open a Pull Request

---

<div align="center">
  <sub>Last Updated: November 2, 2025 · Version: 1.0.0</sub>
</div>

