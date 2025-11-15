# 🎯 FINAL PIPELINE ARCHITECTURE

## 🧠 CORE PHILOSOPHY

```
┌─────────────────────────────────────────────────────────────┐
│  PRINCIPLE: Learn from User, Recommend Better               │
│                                                              │
│  1. COLLECT user behavior (clicks, views, bookings)        │
│  2. BUILD user profile (preferences, patterns)             │
│  3. MATCH with quality zones (embedding + behavior score)   │
│  4. OPTIMIZE itinerary (for user + companions)             │
│  5. SHARE & ITERATE (learn from feedback)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 REDESIGNED DATA FLOW

```
┌──────────────────────────────────────────────────────────────┐
│  1. USER BEHAVIOR COLLECTION (Passive + Active)             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Passive:                                                    │
│  ├─ Zone view (timestamp, duration)                        │
│  ├─ Tour click (which tours clicked)                       │
│  ├─ Search history (vibes, avoid keywords)                 │
│  └─ Booking history (actual trips)                         │
│                                                              │
│  Active:                                                     │
│  ├─ Profile location (home city)                           │
│  ├─ Preferred vibes (favorite activities)                  │
│  ├─ Budget range (budget/mid/luxury)                       │
│  └─ Travel style (solo/couple/family/group)                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  2. USER PROFILE BUILDER (ML-based)                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  UserProfile {                                               │
│    userId: string                                            │
│    vibeWeights: {                                           │
│      beach: 0.8,      // ← From views + bookings           │
│      mountain: 0.3,   // ← Low interaction                 │
│      culture: 0.6     // ← Medium interest                 │
│    }                                                         │
│    avoidPatterns: ["crowded", "expensive"]                  │
│    budgetTier: "mid"                                         │
│    homeLocation: { lat, lng, provinceName }                 │
│    travelCompanions: ["userId1", "userId2"]  // ← Group    │
│    pastItineraries: [itineraryId1, ...]                    │
│    lastActive: timestamp                                     │
│  }                                                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  3. SMART ZONE MATCHING (3-stage scoring)                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Stage 1: Semantic Embedding (40%)                          │
│  ├─ Query vector vs Zone vectors                           │
│  └─ FAISS search → Top 50 candidates                       │
│                                                              │
│  Stage 2: Behavioral Score (40%)                            │
│  ├─ User vibe weights × zone vibes                         │
│  ├─ Past behavior patterns                                  │
│  └─ Similar users' preferences                              │
│                                                              │
│  Stage 3: Contextual Score (20%)                            │
│  ├─ Proximity to user location                             │
│  ├─ Season/weather suitability                             │
│  ├─ Budget alignment                                        │
│  └─ Availability (not recently visited)                     │
│                                                              │
│  Final Score = Σ(weighted components)                       │
│  → Top 10-15 zones with >0.6 quality threshold             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  4. ITINERARY OPTIMIZER (Graph-based)                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Input: Selected zones + user constraints                   │
│  ├─ Days: 2-5 days                                         │
│  ├─ Pace: slow/normal/fast                                 │
│  ├─ Budget: total budget                                   │
│  └─ Group: solo/couple/family/group                        │
│                                                              │
│  Algorithm:                                                  │
│  1. Build zone graph (distance, time, compatibility)       │
│  2. Apply constraints (travel time, opening hours)         │
│  3. Optimize route (minimize travel, maximize quality)     │
│  4. Balance days (activities per day)                      │
│  5. Add buffer time (meals, rest, photos)                  │
│                                                              │
│  Output: Optimized Itinerary                                │
│  ├─ Day-by-day schedule                                    │
│  ├─ Travel time between zones                              │
│  ├─ Estimated costs                                        │
│  ├─ Booking recommendations                                 │
│  └─ Alternative options                                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  5. COLLABORATIVE PLANNING (Real-time sync)                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  SharedItinerary {                                           │
│    id: string                                                │
│    creatorId: userId                                         │
│    participants: [userId1, userId2, ...]                   │
│    zones: [zoneId1, zoneId2, ...]                          │
│    schedule: [{day, zones, activities}]                    │
│    votes: {zoneId: [userId1, userId2]}  // Democracy       │
│    comments: [{userId, text, timestamp}]                    │
│    budget: {total, perPerson, breakdown}                    │
│    tourGuideRequest: {                                      │
│      sent: boolean,                                         │
│      guideId: string,                                       │
│      status: "pending/accepted/completed"                   │
│    }                                                         │
│  }                                                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  6. FEEDBACK LOOP (Continuous learning)                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  After Trip:                                                 │
│  ├─ Rate zones (1-5 stars)                                 │
│  ├─ Tag experiences (loved/okay/avoid)                     │
│  ├─ Share photos (auto-tag locations)                      │
│  └─ Write reviews                                          │
│                                                              │
│  Update Profile:                                             │
│  ├─ Adjust vibe weights                                    │
│  ├─ Learn avoid patterns                                   │
│  └─ Refine recommendations                                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🗄️ DATABASE SCHEMA (Redesigned)

### 1. UserProfile Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,  // Link to Users
  
  // Behavioral data (ML-powered)
  vibeProfile: {
    beach: { weight: 0.8, interactions: 45, lastUpdated: Date },
    mountain: { weight: 0.3, interactions: 5, lastUpdated: Date },
    culture: { weight: 0.6, interactions: 23, lastUpdated: Date }
    // ... all vibes
  },
  
  // Explicit preferences
  explicitVibes: ["beach", "sunset", "photo"],
  avoidKeywords: ["crowded", "expensive", "touristy"],
  budgetTier: "mid",  // low/mid/high
  travelStyle: "couple",  // solo/couple/family/group
  
  // Location data
  homeLocation: {
    provinceId: "48",
    provinceName: "Đà Nẵng",
    lat: 16.0544,
    lng: 108.2022
  },
  
  // History
  viewHistory: [
    { zoneId: "dn-my-khe", timestamp: Date, duration: 45 },
    { zoneId: "dn-ba-na", timestamp: Date, duration: 120 }
  ],
  searchHistory: [
    { query: "sunset beach", vibes: ["sunset", "beach"], timestamp: Date },
    { query: "culture food", vibes: ["culture", "food"], timestamp: Date }
  ],
  bookingHistory: [
    { itineraryId: "itin_123", zones: ["dn-my-khe"], rating: 5, timestamp: Date }
  ],
  
  // Collaborative
  companions: [userId1, userId2],  // Frequent travel buddies
  sharedItineraries: [itineraryId1, itineraryId2],
  
  // Metadata
  createdAt: Date,
  updatedAt: Date,
  lastActive: Date
}
```

### 2. Itinerary Collection (Enhanced)

```javascript
{
  _id: ObjectId,
  
  // Ownership
  creatorId: ObjectId,
  participants: [
    { userId: ObjectId, role: "creator/member", joinedAt: Date }
  ],
  
  // Content
  title: "3-Day Da Nang Beach Trip",
  zones: [
    { 
      zoneId: "dn-my-khe",
      day: 1,
      order: 1,
      timeSlot: "morning",
      duration: 120,  // minutes
      notes: "Watch sunrise"
    },
    // ... more zones
  ],
  
  // Schedule (optimized)
  schedule: [
    {
      day: 1,
      date: Date,
      activities: [
        {
          time: "08:00",
          zoneId: "dn-my-khe",
          activity: "Beach walk & breakfast",
          duration: 120,
          travelTime: 0  // First activity
        },
        {
          time: "11:00",
          zoneId: "dn-an-thuong",
          activity: "Lunch & shopping",
          duration: 90,
          travelTime: 15  // 15 min from previous
        }
      ]
    }
  ],
  
  // Optimization metadata
  optimizationScore: 0.85,  // How well optimized
  totalDistance: 45.5,  // km
  totalTravelTime: 120,  // minutes
  totalCost: {
    estimated: 5000000,  // VND
    perPerson: 2500000,
    breakdown: {
      transport: 1000000,
      food: 2000000,
      activities: 2000000
    }
  },
  
  // Collaborative features
  votes: {
    "dn-my-khe": [userId1, userId2],
    "dn-ba-na": [userId1]
  },
  comments: [
    {
      userId: ObjectId,
      text: "Should we go to Ba Na earlier?",
      timestamp: Date,
      replies: [...]
    }
  ],
  
  // Tour guide integration
  tourGuideRequest: {
    requested: true,
    guideId: ObjectId,
    status: "accepted",
    requestedAt: Date,
    acceptedAt: Date
  },
  
  // Status
  status: "draft/confirmed/completed",
  visibility: "private/shared/public",
  
  // Metadata
  createdAt: Date,
  updatedAt: Date,
  completedAt: Date
}
```

### 3. ZoneInteraction Collection (NEW - for ML)

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  zoneId: String,
  
  // Interaction type
  type: "view/click/bookmark/book/review",
  
  // Context
  duration: 45,  // seconds (for views)
  source: "search/recommendation/direct",
  searchQuery: "sunset beach",
  
  // Metadata
  timestamp: Date,
  deviceType: "mobile/desktop",
  location: { lat, lng }  // Where user was when interacting
}
```

---

## 🧮 SCORING ALGORITHM (Redesigned)

### Formula:

```javascript
finalScore = 
  (semanticScore × 0.40) +      // Embedding match
  (behavioralScore × 0.40) +     // User history
  (contextualScore × 0.20)       // Context (location, budget, etc.)

// Quality threshold: Only return zones with score > 0.6
```

### Implementation:

```javascript
function calculateFinalScore(zone, userProfile, query, context) {
  // 1. Semantic score (embedding)
  const semanticScore = zone.embedScore || 0;  // From FAISS
  
  // 2. Behavioral score (user history)
  const behavioralScore = calculateBehavioralScore(zone, userProfile);
  
  // 3. Contextual score (situation)
  const contextualScore = calculateContextualScore(zone, context);
  
  // Weighted sum
  const final = 
    semanticScore * 0.40 +
    behavioralScore * 0.40 +
    contextualScore * 0.20;
  
  return {
    finalScore: final,
    components: {
      semantic: semanticScore,
      behavioral: behavioralScore,
      contextual: contextualScore
    },
    confidence: calculateConfidence(userProfile)  // How sure we are
  };
}

function calculateBehavioralScore(zone, userProfile) {
  let score = 0;
  
  // Vibe alignment (based on learned weights)
  for (const vibe of zone.vibes || []) {
    const weight = userProfile.vibeProfile[vibe]?.weight || 0;
    score += weight * 0.15;  // Max 0.6 if 4 vibes match perfectly
  }
  
  // Avoid patterns (strong penalty)
  for (const avoid of userProfile.avoidKeywords || []) {
    if (zoneContains(zone, avoid)) {
      score -= 0.3;
    }
  }
  
  // Similar users liked this
  const similarUsersScore = getSimilarUsersScore(zone, userProfile);
  score += similarUsersScore * 0.2;
  
  // Past experience (if revisit)
  if (userVisited(zone, userProfile)) {
    const rating = getUserRating(zone, userProfile);
    if (rating >= 4) score += 0.1;  // Bonus for loved places
    else score -= 0.2;  // Penalty for disliked
  }
  
  return Math.max(0, Math.min(1, score));
}

function calculateContextualScore(zone, context) {
  let score = 0.5;  // Neutral start
  
  // Proximity bonus
  if (context.userLocation && zone.center) {
    const distance = calculateDistance(context.userLocation, zone.center);
    if (distance < 50) score += 0.15;
    else if (distance < 100) score += 0.10;
    else if (distance < 200) score += 0.05;
  }
  
  // Budget alignment
  if (zone.budgetTier === context.budgetTier) {
    score += 0.1;
  }
  
  // Season/weather (if applicable)
  if (zone.bestSeason && zone.bestSeason === getCurrentSeason()) {
    score += 0.05;
  }
  
  // Recent visit penalty (avoid repetition)
  if (context.recentlyVisited?.includes(zone.id)) {
    score -= 0.2;
  }
  
  return Math.max(0, Math.min(1, score));
}
```

---

## 🚀 API ENDPOINTS (Redesigned)

### Discovery APIs:

```javascript
// 1. Personalized zone discovery
POST /api/discover/personalized
Authorization: Bearer <token>  // Required for personalization
Body: {
  query: "sunset beach",
  vibes: ["sunset", "beach"],
  avoid: ["crowded"],
  days: 3,
  budget: "mid"
}
Response: {
  zones: [
    {
      id: "dn-my-khe",
      name: "Bãi biển Mỹ Khê",
      scores: {
        final: 0.87,
        semantic: 0.85,
        behavioral: 0.92,  // High - user loves beaches
        contextual: 0.83
      },
      confidence: 0.95,  // High confidence (lots of data)
      reasons: [
        "You've loved similar beaches before",
        "Close to your home (15km)",
        "Perfect for sunset photography (your favorite)",
        "92% of similar users rated 5 stars"
      ]
    }
  ],
  userProfile: {
    topVibes: ["beach", "sunset", "photo"],
    avoidPatterns: ["crowded", "touristy"]
  }
}

// 2. Track zone interaction (passive learning)
POST /api/discover/track
Authorization: Bearer <token>
Body: {
  zoneId: "dn-my-khe",
  type: "view",
  duration: 45,
  source: "search"
}
Response: { ok: true }
```

### Itinerary APIs:

```javascript
// 1. Generate optimized itinerary
POST /api/itinerary/generate
Authorization: Bearer <token>
Body: {
  zones: ["dn-my-khe", "dn-ba-na", "dn-hoi-an"],
  days: 3,
  pace: "normal",
  budget: 5000000,
  groupSize: 2
}
Response: {
  itinerary: {
    id: "itin_123",
    optimizationScore: 0.85,
    schedule: [...],
    totalCost: {...},
    alternatives: [...]  // If user wants to swap
  }
}

// 2. Share itinerary with companions
POST /api/itinerary/:id/share
Authorization: Bearer <token>
Body: {
  userIds: ["user1", "user2"],
  message: "Let's plan our trip together!"
}
Response: { ok: true, sharedWith: 2 }

// 3. Send to tour guide
POST /api/itinerary/:id/request-guide
Authorization: Bearer <token>
Body: {
  preferredGuide: "guide_id" // optional
}
Response: {
  ok: true,
  request: {
    id: "req_123",
    status: "pending",
    estimatedResponse: "24h"
  }
}
```

---

## 📈 QUALITY IMPROVEMENTS

### Before (Current):

```javascript
Query: "photo, mountain, shopping"
Results:
1. Đồi cát (score: 0.50) - Only has "photo" ❌
2. Bà Nà (score: 0.50) - Only has "photo" ❌
3. Ngũ Hành Sơn (score: 0.49) - Only has "photo" ❌

Problem: Low relevance, no behavioral context
```

### After (Redesigned):

```javascript
Query: "photo, mountain, shopping"
User History: Loves mountains (0.8), neutral on shopping (0.3)

Results:
1. Bà Nà Hills (score: 0.82) ✅
   - Semantic: 0.75 (has mountain, photo)
   - Behavioral: 0.92 (user loves mountains!)
   - Contextual: 0.78 (within budget, good weather)
   - Reason: "Perfect for mountain photography - you've loved similar places!"

2. Chợ Đông Ba (score: 0.68) ✅
   - Semantic: 0.55 (has shopping, photo)
   - Behavioral: 0.65 (neutral on shopping)
   - Contextual: 0.85 (very close, cheap)
   - Reason: "Great for food photography - matches your budget"

3. Ngũ Hành Sơn (score: 0.65) ✅
   - Semantic: 0.60 (has mountain vibes in text)
   - Behavioral: 0.75 (mountain + culture combo)
   - Contextual: 0.60 (medium distance)
   - Reason: "Mountain temple with photo spots"
```

---

## 🎯 IMPLEMENTATION PRIORITY

### Phase 1: Foundation (Week 1-2)
- [ ] UserProfile schema & APIs
- [ ] ZoneInteraction tracking
- [ ] Behavioral score calculation
- [ ] Update matching algorithm

### Phase 2: Optimization (Week 3-4)
- [ ] Itinerary optimizer algorithm
- [ ] Graph-based route planning
- [ ] Cost estimation
- [ ] Alternative suggestions

### Phase 3: Collaboration (Week 5-6)
- [ ] SharedItinerary schema
- [ ] Real-time sync (WebSocket)
- [ ] Voting & comments
- [ ] Tour guide integration

### Phase 4: Learning (Week 7-8)
- [ ] Feedback collection
- [ ] Profile auto-update
- [ ] Similar users matching
- [ ] Quality metrics dashboard

---

## 🧹 CLEANUP CHECKLIST

### Remove (Dư thừa):
- ❌ LLM skip logic (too complex, không cần thiết)
- ❌ Multiple text formats (chỉ giữ 1 format)
- ❌ Province filtering (dùng proximity instead)
- ❌ Magic numbers scattered (move to config)
- ❌ Multiple scoring formulas (chỉ giữ 1 formula tốt)

### Keep (Core):
- ✅ Embedding service (semantic matching)
- ✅ FAISS index (fast search)
- ✅ MongoDB (user data)
- ✅ Rule-based scoring (behavioral + contextual)

### Add (Missing):
- ✅ UserProfile collection
- ✅ ZoneInteraction tracking
- ✅ Behavioral scoring
- ✅ Itinerary optimizer
- ✅ Collaborative features

---

**Version:** 3.0 (Personalized Intelligence)  
**Focus:** Quality > Quantity, Learning > Guessing  
**Status:** Ready for implementation ✅
