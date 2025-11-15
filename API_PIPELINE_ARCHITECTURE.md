# API Pipeline Architecture - Final

## Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                             │
│                      touring-fe/src/pages/                          │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │  POST /api/discover/    │
                    │       parse             │
                    │  {vibes, freeText,      │
                    │   userLocation}         │
                    └────────────┬─────────────┘
                                 │
        ┌────────────────────────▼─────────────────────────┐
        │  BACKEND - Zone Discovery (Node.js/Express)      │
        │  touring-be/routes/discover.routes.js            │
        │                                                   │
        │  • Verify JWT token (verifyToken)               │
        │  • Fetch user profile (location fallback)        │
        │  • Call matcher service                          │
        └─────────┬──────────────────────────┬─────────────┘
                  │                          │
        ┌─────────▼─────────┐      ┌────────▼──────────┐
        │ HYBRID SEARCH     │      │ EMBEDDING SERVICE │
        │ (matcher.js)      │      │ (Python/FAISS)    │
        │                   │      │                   │
        │ Call Python API:  │      │ Port: 8088        │
        │ /hybrid-search    │      │                   │
        │ {vibes, text}     │      │ • Semantic search │
        │                   │      │ • Vector matching │
        │ Returns: 20 hits  │      │ • 49 clean zones  │
        └─────────┬─────────┘      └────────┬──────────┘
                  │                          │
        ┌─────────▼──────────────────────────────────────┐
        │ RE-RANKING (scorer.js)                         │
        │                                                │
        │ For each zone:                                │
        │  1. hardVibeScore = % vibes matching zone.tags │
        │  2. embedScore = semantic relevance (0-1)      │
        │  3. proximityBonus = distance-based            │
        │                                                │
        │ finalScore = (hardVibe × 0.6) +               │
        │             (embed × 0.4) +                   │
        │             contextScore                      │
        │                                                │
        │ Proximity Bonuses:                            │
        │  • <50km: +0.25                               │
        │  • <100km: +0.15                              │
        │  • <200km: +0.08                              │
        └─────────┬──────────────────────────────────────┘
                  │
        ┌─────────▼──────────────────────────────────────┐
        │ Sort by finalScore, return top 10 zones        │
        │ Group by province                              │
        └─────────┬──────────────────────────────────────┘
                  │
        ┌─────────▼──────────────────────────────────────┐
        │ Response to Frontend                           │
        │ {                                              │
        │   zones: [...10 zones with scores],            │
        │   byProvince: {da-nang: [...], hue: [...]}    │
        │ }                                              │
        └─────────┬──────────────────────────────────────┘
                  │
        ┌─────────▼──────────────────────────────────────┐
        │ GET /api/zones/:zoneId                        │
        │ • Get zone details                             │
        │ • Fetch POIs in zone                          │
        │ • Get best activities                          │
        └─────────┬──────────────────────────────────────┘
                  │
        ┌─────────▼──────────────────────────────────────┐
        │ GET /api/zones/:zoneId/tours                  │
        │ • Get available tours in zone                  │
        │ • Include pricing, ratings                     │
        └─────────┬──────────────────────────────────────┘
                  │
        ┌─────────▼──────────────────────────────────────┐
        │ POST /api/itinerary                           │
        │ • Create or get draft itinerary               │
        │ • Associate with zone                          │
        └─────────┬──────────────────────────────────────┘
                  │
        ┌─────────▼──────────────────────────────────────┐
        │ POST /api/itinerary/:id/items                 │
        │ • Add POI/tour to itinerary                    │
        │ • Build travel list                            │
        └─────────┬──────────────────────────────────────┘
                  │
        ┌─────────▼──────────────────────────────────────┐
        │ POST /api/itinerary/:id/optimize-ai           │
        │                                                │
        │ • Call Goong Trip V2 (route optimization)     │
        │ • Build timeline with duration & time slots   │
        │ • Trigger AI insights (background)            │
        │                                                │
        │ AI Flow:                                       │
        │  1. buildItineraryPrompt() - create prompt    │
        │  2. callLLMAndParse() - call Gemini API       │
        │  3. generateSmartFallback() - if LLM fails    │
        │  4. Save to itinerary.aiInsights              │
        └─────────┬──────────────────────────────────────┘
                  │
        ┌─────────▼──────────────────────────────────────┐
        │ GET /api/itinerary/:id/export.gpx             │
        │ • Export route as GPX file                     │
        │ • Use for GPS navigation                       │
        └─────────┬──────────────────────────────────────┘
                  │
        ┌─────────▼──────────────────────────────────────┐
        │ POST /api/itinerary/:id/request-tour-guide    │
        │ • Create tour guide request                    │
        │ • Notify available guides                      │
        └────────────────────────────────────────────────┘
```

---

## Database Models

```
┌─────────────────────────────────────────────────────────┐
│                    MONGODB SCHEMA                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Zone {                                                 │
│    _id: ObjectId                                        │
│    id: String (slug: "dn-ngu-hanh-son")                │
│    name: String ("Ngũ Hành Sơn")                       │
│    province: String ("da-nang")                         │
│    desc: String (long description)                      │
│    tags: [String] (["temple", "photo", "culture"])    │
│    vibeKeywords: [String] (["chua", "dong", "phat"])  │
│    center: { lat, lng } (16.0036, 108.2631)           │
│    rating: Number                                       │
│    bestTime: String ("morning", "evening")             │
│    whyChoose: [String]                                 │
│    funActivities: [String]                             │
│    mustSee: [String]                                   │
│    tips: [String]                                      │
│  }                                                      │
│                                                          │
│  Itinerary {                                            │
│    _id: ObjectId                                        │
│    userId: ObjectId                                     │
│    zoneId: String                                       │
│    zoneName: String                                     │
│    name: String                                         │
│    items: [{                                            │
│      poiId: String                                      │
│      name: String                                       │
│      address: String                                    │
│      location: { lat, lng }                            │
│      itemType: String ("poi" | "tour")                │
│      duration: Number                                   │
│      startTime: String                                  │
│      endTime: String                                    │
│      timeSlot: String ("morning", "afternoon")         │
│      travelFromPrevious: { distance, duration, mode }  │
│    }]                                                   │
│    routePolyline: String (encoded geometry)            │
│    totalDistance: Number                                │
│    totalDuration: Number                                │
│    isOptimized: Boolean                                │
│    aiInsights: {                                        │
│      summary: String                                    │
│      tips: [String]                                     │
│    }                                                    │
│    aiProcessing: Boolean                               │
│    tourGuideRequest: {                                  │
│      status: String ("none", "pending", "accepted")    │
│      guideId: ObjectId                                  │
│      requestedAt: Date                                  │
│      respondedAt: Date                                  │
│    }                                                    │
│    preferences: {                                       │
│      bestTime: String                                   │
│      vibes: [String]                                    │
│      pace: String ("light", "moderate", "intense")     │
│    }                                                    │
│  }                                                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Embedding Service Architecture

```
┌──────────────────────────────────────────────────────────┐
│         PYTHON EMBEDDING SERVICE (Port 8088)             │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Model: Vietnamese_Embedding_v2 (1024-dim)             │
│  Index Type: FAISS IndexFlatIP                          │
│  Total Vectors: 49 (clean)                              │
│  Metadata Items: 49                                     │
│                                                          │
│  Endpoints:                                             │
│  ┌─────────────────────────────────────────────────┐  │
│  │ GET /healthz                                    │  │
│  │ Returns: {status, vectors, metadata, model}    │  │
│  └─────────────────────────────────────────────────┘  │
│                                                          │
│  ┌─────────────────────────────────────────────────┐  │
│  │ POST /embed                                     │  │
│  │ Input: {texts: [String]}                       │  │
│  │ Output: {embeddings: float[1024], count}       │  │
│  └─────────────────────────────────────────────────┘  │
│                                                          │
│  ┌─────────────────────────────────────────────────┐  │
│  │ POST /hybrid-search                             │  │
│  │ Input: {                                         │  │
│  │   free_text: String                             │  │
│  │   vibes: [String]                               │  │
│  │   top_k: Number                                 │  │
│  │   filter_type: String                           │  │
│  │   filter_province: String                       │  │
│  │   boost_vibes: Number                           │  │
│  │ }                                                │  │
│  │ Output: {hits: [...], strategy: String}        │  │
│  │   Each hit: {id, score, payload, vibe_matches} │  │
│  └─────────────────────────────────────────────────┘  │
│                                                          │
│  ┌─────────────────────────────────────────────────┐  │
│  │ POST /upsert (✅ FIXED)                          │  │
│  │ Input: {items: [{id, type, text, payload}]}    │  │
│  │                                                  │  │
│  │ Process:                                         │  │
│  │  1. Remove old entries from metadata            │  │
│  │  2. Add new items to metadata                   │  │
│  │  3. ✅ Rebuild FAISS index completely           │  │
│  │  4. Save to disk                                │  │
│  │                                                  │  │
│  │ Output: {ok, added, removed, total}             │  │
│  │ Now: total = metadata count = 49 ✅             │  │
│  └─────────────────────────────────────────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

```
┌────────────────────────────────────────────────────────┐
│                   FRONTEND LOGIN                         │
│  POST /api/auth/login {email, password}                │
└────────────────────┬─────────────────────────────────┘
                     │
        ┌────────────▼─────────────────┐
        │ Backend Auth (auth.routes.js) │
        │                               │
        │ • Validate credentials        │
        │ • Generate JWT tokens         │
        │ • Set refresh token cookie    │
        └────────────┬──────────────────┘
                     │
        ┌────────────▼─────────────────────┐
        │ Response Headers:                │
        │                                  │
        │ Authorization: Bearer <token>    │
        │ Set-Cookie: refresh_token=...   │
        │   (HttpOnly, SameSite=Strict)   │
        └────────────┬──────────────────┬─┘
                     │                  │
      ┌──────────────▼─┐       ┌────────▼──────────┐
      │ Access Token   │       │ Refresh Token     │
      │ TTL: 30 min    │       │ (Cookie)          │
      │ Stored: Memory │       │ TTL: 7 days       │
      │ Sent: Header   │       │ Auto-refresh      │
      └────────────────┘       └───────────────────┘
                     │
        ┌────────────▼──────────────────────┐
        │ Protected Requests:                │
        │ GET /api/discover/parse            │
        │   + Authorization: Bearer <token>  │
        │   + credentials: "include"         │
        │                                    │
        │ Middleware: verifyToken            │
        │  1. Check Authorization header     │
        │  2. Fallback: refresh_token cookie │
        │  3. Return 401 if invalid          │
        └────────────────────────────────────┘
```

---

## Proximity Scoring

```
User Location: (15.984445, 108.253488)

Zone 1: Khu An Thượng
  Center: (16.0543, 108.2444)
  Distance: 7.8 km
  Proximity Bonus: +0.25 ✅ (<50km)
  
Zone 2: Phố đi bộ Huế
  Center: (16.2545, 107.5433)
  Distance: 88.2 km
  Proximity Bonus: +0.15 ✅ (<100km)
  
Zone 3: Far Beach
  Center: (12.2398, 109.1882)
  Distance: 450 km
  Proximity Bonus: 0 ❌ (>200km)
```

---

## Scoring Formula

```
For each zone:

1. HARD VIBE MATCHING (0-1)
   hardVibeScore = (matching_vibes / total_user_vibes)
   Example: user wants ["sunset", "nightlife", "food"]
           zone has ["nightlife", "food"]
           → hardVibeScore = 2/3 = 0.67

2. EMBEDDING SIMILARITY (0-1)
   embedScore = cosine_similarity(userVector, zoneVector)
   Via Python semantic search
   Example: 0.89

3. PROXIMITY BONUS (0-0.25)
   Based on distance from user location
   <50km: +0.25
   <100km: +0.15
   <200km: +0.08
   >200km: 0

4. FINAL SCORE
   finalScore = (hardVibeScore × 0.6) + 
                (embedScore × 0.4) + 
                proximityBonus

   Example:
   = (0.67 × 0.6) + (0.89 × 0.4) + 0.25
   = 0.402 + 0.356 + 0.25
   = 1.008 (capped at 1.0)
   → Ranked #1
```

---

## Auto-Sync Process

```
START SERVER (npm run dev)
          │
          ▼
  Load environment
          │
          ▼
  Import routes & services
          │
          ▼
  checkServices() {
    ├─ Connect MongoDB
    ├─ Check Embedding Service (port 8088)
    │
    └─ If embedding available:
       └─ Call syncZones(true) {
            ├─ Find 49 active zones in MongoDB
            ├─ Build semantic text for each:
            │   name + desc + tags + vibes + tips
            │
            ├─ POST /upsert to embedding service {
            │    items: [
            │      {
            │        id: "dn-ngu-hanh-son",
            │        type: "zone",
            │        text: "Ngũ Hành Sơn - ...",
            │        payload: {
            │          name, province, tags,
            │          vibes, center, bestTime
            │        }
            │      },
            │      ...48 more zones...
            │    ]
            │  }
            │
            ├─ Python service:
            │  1. Remove old entries from metadata
            │  2. Embed 49 new texts → 1024-dim vectors
            │  3. ✅ Rebuild FAISS index (49 vectors)
            │  4. Save faiss.index + meta.json
            │
            └─ Response: { added: 49, removed: 0, total: 49 }
  }
          │
          ▼
  Register routes (1 time only)
          │
          ▼
  app.listen(4000)
          │
          ▼
  ✅ Backend ready
  ✅ Embedding service synced
  ✅ 49 clean vectors
```

---

## Files Architecture

```
touring-be/
├── server.js ✅ FIXED
│   ├─ Connect MongoDB
│   ├─ Load all routes ONCE
│   ├─ Check services
│   ├─ Auto-sync zones
│   └─ Listen on port 4000
│
├── routes/
│   ├── discover.routes.js
│   │   └─ POST /api/discover/parse
│   │      (requires: verifyToken, GPS/Profile location)
│   │
│   ├── zone.routes.js
│   │   ├─ GET /api/zones/:id (zone details)
│   │   ├─ GET /api/zones/:id/tours
│   │   └─ GET /api/zones/:id/pois
│   │
│   └── itinerary.routes.js
│       ├─ POST /api/itinerary (create/draft)
│       ├─ POST /api/itinerary/:id/items (add POI)
│       ├─ POST /api/itinerary/:id/optimize-ai
│       │  (Goong route + AI insights)
│       └─ GET /api/itinerary/:id/export.gpx
│
├── services/
│   ├── embedding-sync-zones.js ✅ FIXED
│   │   └─ syncZones(isAutomatic)
│   │
│   ├── zones/
│   │   ├─ matcher.js (orchestrate matching)
│   │   └─ scorer.js (ranking + proximity)
│   │
│   ├── itinerary/
│   │   └─ optimizer.js (Goong + Gemini AI)
│   │
│   └── ai/libs/
│       └─ embedding-client.js (Python API client)
│
└── middlewares/
    └── authJwt.js (verifyToken, optionalAuth)

ai/
├── app.py ✅ FIXED
│   ├─ /healthz (health check)
│   ├─ /hybrid-search (semantic search)
│   ├─ /embed (embedding generation)
│   └─ /upsert (FAISS index rebuild)
│
└── index/
    ├─ faiss.index (49 vectors)
    └─ meta.json (49 metadata items)

touring-fe/
└── src/pages/
    └── ViDoi.jsx (zone discovery UI)
        ├─ Select vibes
        ├─ Get GPS location
        ├─ POST /api/discover/parse
        └─ Display ranked zones
```

---

## Summary

✅ **49 Clean Vectors** synchronized with MongoDB zones  
✅ **Auto-sync** on server startup  
✅ **Consistent Architecture** with clear data flow  
✅ **Semantic Search** + Hard Vibe + Proximity scoring  
✅ **Production Ready** - No more vector corruption
