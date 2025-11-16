# 🔄 TRAVYY DISCOVERY PIPELINE - COMPLETE FLOW ANALYSIS

## 📚 MỤC LỤC

1. [Pipeline Tổng Quan](#pipeline-tổng-quan)
2. [Pipeline Cũ (Manual Vibes + Free Text)](#pipeline-cũ-manual-vibes--free-text)
3. [Pipeline Mới (AI Personalization)](#pipeline-mới-ai-personalization)
4. [So sánh 2 Pipelines](#so-sánh-2-pipelines)
5. [Chi tiết Functions](#chi-tiết-functions)

---

## 🎯 PIPELINE TỔNG QUAN

TRAVYY có **2 pipelines song song** để gợi ý zones:

```
┌─────────────────────────────────────────────────────────────┐
│ PIPELINE CŨ (Manual Discovery)                               │
│ User chọn vibes → Nhập text → Hybrid Search → Top zones    │
│ ✅ Nhanh, đơn giản, không cần history                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PIPELINE MỚI (AI Personalization)                           │
│ Track behavior → Weekly sync → Build profile → Auto match  │
│ ✅ Thông minh, học từ hành vi, không cần user input        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔵 PIPELINE CŨ: MANUAL VIBES + FREE TEXT

### 📍 Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│ 1. USER INPUT (Frontend - ViDoi.jsx)                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  User chọn vibes từ 16 options:                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ ✅ photo (📸 Chụp ảnh)                             │    │
│  │ ✅ nature (🌿 Thiên nhiên)                         │    │
│  │ ✅ beach (🏖️ Biển)                                │    │
│  │ ✅ food (🍜 Ẩm thực)                              │    │
│  │ ... (max 3 vibes)                                  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                               │
│  User nhập free text (optional):                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ "đi biển 3 ngày gần Đà Nẵng, thích ảnh đẹp"      │    │
│  └────────────────────────────────────────────────────┘    │
│                                                               │
│  User bật GPS (optional):                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ [✓] Sử dụng vị trí của tôi                        │    │
│  │ → Lat: 16.0544, Lng: 108.2022                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                               │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼ (POST /api/discover/parse)
┌──────────────────────────────────────────────────────────────┐
│ 2. BACKEND ENTRY (discover.routes.js)                       │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  router.post("/parse", verifyToken, async (req, res) => {   │
│                                                               │
│    // 📦 Input validation                                    │
│    const vibes = req.body.vibes;  // ['beach', 'photo']     │
│    const freeText = req.body.freeText;  // "đi biển..."     │
│    const userLocation = req.body.userLocation;  // GPS       │
│                                                               │
│    // 📍 Get user location (priority order):                 │
│    // 1) GPS from request                                    │
│    // 2) User profile location (home city)                   │
│    // 3) null (no location)                                  │
│                                                               │
│    // ✅ Call matcher                                        │
│    const result = await getMatchingZones(                   │
│      { vibes, freeText },                                    │
│      { userLocation, useEmbedding: true }                    │
│    );                                                         │
│                                                               │
│    // 📊 Return zones                                        │
│    res.json({                                                │
│      ok: true,                                               │
│      zones: result.zones,  // Top 10-15 zones               │
│      byProvince: {...}     // Grouped by province            │
│    });                                                        │
│  });                                                          │
│                                                               │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. ZONE MATCHER (zones/matcher.js)                          │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  async function getMatchingZones(prefs, options) {          │
│                                                               │
│    // 🎯 STRATEGY 1: Embedding Search (AI)                  │
│    if (useEmbedding && embedServiceAvailable) {             │
│                                                               │
│      // Call Python AI service                               │
│      const embedResult = await hybridSearch({               │
│        free_text: prefs.freeText,                           │
│        vibes: prefs.vibes,                                   │
│        top_k: 20,                                            │
│        filter_type: 'zone',                                  │
│        boost_vibes: 1.3                                      │
│      });                                                      │
│                                                               │
│      // Get full zone data from MongoDB                      │
│      const zones = await Zone.find({                        │
│        id: { $in: embedResult.hits.map(h => h.id) }        │
│      }).lean();                                              │
│                                                               │
│      candidates = embedResult.hits.map(hit => ({            │
│        ...zones.find(z => z.id === hit.id),                │
│        embedScore: hit.score,  // Cosine similarity         │
│        vibeMatches: hit.vibe_matches                        │
│      }));                                                     │
│    }                                                          │
│                                                               │
│    // 🎯 STRATEGY 2: Keyword Fallback (MongoDB)             │
│    if (candidates.length === 0) {                           │
│      candidates = await Zone.find({ isActive: true });     │
│    }                                                          │
│                                                               │
│    // 🎯 STRATEGY 3: Multi-factor Re-ranking                │
│    const scored = candidates.map(zone => {                  │
│                                                               │
│      // Get scoring components                               │
│      const scoreResult = scoreZone(                         │
│        zone,                                                 │
│        prefs,                                                │
│        userLocation                                          │
│      );                                                       │
│                                                               │
│      // Calculate final score with weighted formula         │
│      let finalScore;                                         │
│      if (userLocation) {                                     │
│        finalScore =                                          │
│          (scoreResult.hardVibeScore × 0.4) +                │
│          (zone.embedScore × 0.4) +                          │
│          (scoreResult.proximityScore × 0.2);                │
│      } else {                                                │
│        finalScore =                                          │
│          (scoreResult.hardVibeScore × 0.5) +                │
│          (zone.embedScore × 0.5);                           │
│      }                                                        │
│                                                               │
│      return { ...zone, finalScore, ...scoreResult };       │
│    });                                                        │
│                                                               │
│    // Sort and return top 10                                │
│    return {                                                   │
│      strategy: 'embedding' | 'keyword',                     │
│      zones: scored.sort(...).slice(0, 10)                   │
│    };                                                         │
│  }                                                            │
│                                                               │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. HYBRID SEARCH (Python AI Service)                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  POST http://localhost:8088/hybrid-search                    │
│                                                               │
│  Request:                                                     │
│  {                                                            │
│    "free_text": "đi biển 3 ngày gần Đà Nẵng ảnh đẹp",     │
│    "vibes": ["beach", "photo"],                             │
│    "top_k": 20,                                              │
│    "filter_type": "zone",                                    │
│    "boost_vibes": 1.3                                        │
│  }                                                            │
│                                                               │
│  Processing:                                                  │
│  1. Generate query vector from free_text                     │
│     text_vector = model.encode("đi biển...")               │
│                                                               │
│  2. Generate vibes vector                                    │
│     vibes_vector = model.encode("beach photo")              │
│                                                               │
│  3. Combine vectors (weighted)                               │
│     query_vector = 0.7 * text_vector                        │
│                  + 0.3 * vibes_vector * boost_vibes         │
│                                                               │
│  4. FAISS search in zone index                               │
│     distances, indices = faiss_index.search(                │
│       query_vector, top_k=20                                 │
│     )                                                         │
│                                                               │
│  5. Filter by type and return                                │
│                                                               │
│  Response:                                                    │
│  {                                                            │
│    "hits": [                                                 │
│      {                                                        │
│        "id": "dn-my-khe",                                   │
│        "score": 0.85,  // Cosine similarity (0-1)           │
│        "vibe_matches": ["beach", "photo"]                   │
│      },                                                       │
│      ...                                                      │
│    ]                                                          │
│  }                                                            │
│                                                               │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. ZONE SCORING (zones/scorer.js)                           │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  function scoreZone(zone, prefs, userLocation) {            │
│                                                               │
│    // 1️⃣ HARD VIBE SCORE (Match percentage)                │
│    // Đo % vibes user chọn có match với zone.tags           │
│                                                               │
│    const zoneTags = zone.tags;  // ['beach', 'photo', ...]  │
│    const userVibes = prefs.vibes;  // ['beach', 'photo']    │
│                                                               │
│    let matchedCount = 0;                                     │
│    for (const vibe of userVibes) {                          │
│      if (zoneTags.includes(vibe)) matchedCount++;           │
│    }                                                          │
│                                                               │
│    const hardVibeScore = matchedCount / userVibes.length;   │
│    // Example: 2/2 = 1.0 (100% match)                       │
│                                                               │
│    // 2️⃣ CONTEXT SCORE (Avoid penalties)                   │
│    let contextScore = 0;                                     │
│                                                               │
│    // Check avoid keywords in freeText                       │
│    const freeText = prefs.freeText.toLowerCase();           │
│    const zoneAvoids = zone.avoidKeywords || [];             │
│                                                               │
│    for (const avoid of zoneAvoids) {                        │
│      if (freeText.includes(avoid)) {                        │
│        contextScore -= 0.15;  // -15% penalty               │
│      }                                                        │
│    }                                                          │
│                                                               │
│    // 3️⃣ PROXIMITY SCORE (Distance bonus)                  │
│    let proximityScore = 0;                                   │
│    let distanceKm = null;                                    │
│                                                               │
│    if (userLocation && zone.center) {                       │
│      distanceKm = calculateDistance(                        │
│        userLocation.lat, userLocation.lng,                  │
│        zone.center.lat, zone.center.lng                     │
│      );                                                       │
│                                                               │
│      // Decay function                                       │
│      if (distanceKm < 5) proximityScore = 1.0;             │
│      else if (distanceKm < 20) proximityScore = 0.8;       │
│      else if (distanceKm < 50) proximityScore = 0.6;       │
│      else if (distanceKm < 100) proximityScore = 0.4;      │
│      else proximityScore = 0.2;                             │
│    }                                                          │
│                                                               │
│    return {                                                   │
│      hardVibeScore,      // 0-1                             │
│      contextScore,       // -0.3 to 0                       │
│      proximityScore,     // 0-1                             │
│      distanceKm,         // km                              │
│      reasons: [...]      // Explanations                    │
│    };                                                         │
│  }                                                            │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 📝 Chi tiết Functions (Pipeline Cũ)

#### **1. Frontend: ViDoi.jsx → handleSubmit()**

```javascript
// File: touring-fe/src/pages/ViDoi.jsx

async function handleSubmit(e) {
  // 📦 Collect input
  const body = {
    vibes: selected,        // ['beach', 'photo']
    freeText: freeText.trim(),  // "đi biển 3 ngày"
    userLocation: origin    // { lat: 16.0544, lng: 108.2022 } or null
  };

  // 🌐 Call API
  const data = await withAuth("/api/discover/parse", {
    method: "POST",
    body: JSON.stringify(body)
  });

  // 💾 Save to sessionStorage
  window.sessionStorage.setItem("discover_result", JSON.stringify(data));

  // 📊 Navigate to results
  navigate("/discover-wrapped", { state: { data } });
}
```

**Input Example:**
```javascript
{
  vibes: ['beach', 'photo'],
  freeText: 'đi biển 3 ngày gần Đà Nẵng, thích ảnh đẹp',
  userLocation: { lat: 16.0544, lng: 108.2022 }
}
```

---

#### **2. Backend: discover.routes.js → POST /parse**

```javascript
// File: touring-be/routes/discover.routes.js

router.post("/parse", verifyToken, async (req, res) => {
  // ✅ 1. Validate input
  const vibes = Array.isArray(req.body.vibes) ? req.body.vibes : [];
  const freeText = (req.body.freeText || '').trim();
  
  if (vibes.length === 0 && freeText.length === 0) {
    return res.status(400).json({ error: 'EMPTY_INPUT' });
  }

  // ✅ 2. Get user location (GPS → Profile → None)
  let userLocation = null;
  if (req.user?.sub) {
    const user = await User.findOne({ _id: req.user.sub }).lean();
    userLocation = getUserLocation(user, { userLocation: req.body.userLocation });
  }

  // ✅ 3. Call matcher
  const result = await getMatchingZones(
    { vibes, freeText },
    { userLocation, useEmbedding: true }
  );

  // ✅ 4. Return zones
  res.json({
    ok: true,
    zones: result.zones,
    byProvince: {...}
  });
});
```

**Logic Flow:**
```
Input → Validate → Get Location → Match Zones → Return Results
```

---

#### **3. Matcher: zones/matcher.js → getMatchingZones()**

```javascript
// File: touring-be/services/zones/matcher.js

async function getMatchingZones(prefs, options) {
  const { userLocation, useEmbedding } = options;
  
  let candidates = [];
  let strategy = 'hybrid';

  // ✅ STRATEGY 1: Embedding Search (AI)
  if (useEmbedding) {
    try {
      const available = await isAvailable();
      
      if (available) {
        // Call Python AI service
        const embedResult = await hybridSearch({
          free_text: prefs.freeText,
          vibes: prefs.vibes,
          top_k: 20,
          filter_type: 'zone',
          boost_vibes: 1.3
        });

        // Map to full MongoDB data
        const zoneIds = embedResult.hits.map(h => h.id);
        const zones = await Zone.find({ 
          id: { $in: zoneIds }, 
          isActive: true 
        }).lean();

        candidates = embedResult.hits.map(hit => {
          const zone = zones.find(z => z.id === hit.id);
          return {
            ...zone,
            embedScore: hit.score,
            vibeMatches: hit.vibe_matches
          };
        }).filter(Boolean);

        strategy = 'embedding';
      }
    } catch (error) {
      console.warn('Embedding error, fallback to keyword');
    }
  }

  // ✅ STRATEGY 2: Keyword Fallback
  if (candidates.length === 0) {
    candidates = await Zone.find({ isActive: true }).lean();
    strategy = 'keyword';
  }

  // ✅ STRATEGY 3: Multi-factor Re-ranking
  const scored = candidates.map(zone => {
    const scoreResult = scoreZone(zone, prefs, userLocation);

    // Calculate final score
    let finalScore;
    if (userLocation) {
      finalScore = 
        (scoreResult.hardVibeScore × 0.4) +
        (zone.embedScore × 0.4) +
        (scoreResult.proximityScore × 0.2);
    } else {
      finalScore = 
        (scoreResult.hardVibeScore × 0.5) +
        (zone.embedScore × 0.5);
    }

    return { ...zone, finalScore, ...scoreResult };
  });

  // Sort by finalScore
  scored.sort((a, b) => b.finalScore - a.finalScore);

  return {
    strategy,
    zones: scored.slice(0, 10)
  };
}
```

**Strategies:**

1. **Embedding Search** (Preferred):
   - Convert text + vibes → vector
   - FAISS similarity search
   - Fast & semantic understanding

2. **Keyword Fallback** (When AI fails):
   - MongoDB text search
   - Filter by vibes
   - Slower but reliable

3. **Re-ranking** (Always):
   - Multi-factor scoring
   - Combine AI + Rules + Location

---

#### **4. Scorer: zones/scorer.js → scoreZone()**

```javascript
// File: touring-be/services/zones/scorer.js

function scoreZone(zone, prefs, userLocation) {
  // 1️⃣ HARD VIBE SCORE (Match percentage)
  const zoneTags = zone.tags || [];
  const userVibes = prefs.vibes || [];
  
  let matchedCount = 0;
  for (const vibe of userVibes) {
    if (zoneTags.includes(vibe.toLowerCase())) {
      matchedCount++;
    }
  }
  
  const hardVibeScore = userVibes.length > 0 
    ? matchedCount / userVibes.length 
    : 0;

  // 2️⃣ CONTEXT SCORE (Avoid penalties)
  let contextScore = 0;
  const freeText = (prefs.freeText || '').toLowerCase();
  const zoneAvoids = (zone.avoidKeywords || []).map(a => a.toLowerCase());
  
  for (const avoid of zoneAvoids) {
    if (freeText.includes(avoid)) {
      contextScore -= 0.15;  // -15% penalty per match
    }
  }

  // 3️⃣ PROXIMITY SCORE (Distance bonus)
  let proximityScore = 0;
  let distanceKm = null;
  
  if (userLocation?.lat && zone.center?.lat) {
    distanceKm = calculateDistance(
      userLocation.lat, userLocation.lng,
      zone.center.lat, zone.center.lng
    );

    // Decay function
    if (distanceKm < 5) proximityScore = 1.0;
    else if (distanceKm < 20) proximityScore = 0.8;
    else if (distanceKm < 50) proximityScore = 0.6;
    else if (distanceKm < 100) proximityScore = 0.4;
    else proximityScore = 0.2;
  }

  return {
    hardVibeScore,
    contextScore,
    proximityScore,
    distanceKm,
    reasons: [
      `🔥 HardVibe: ${matchedCount}/${userVibes.length}`,
      contextScore < 0 ? `❌ Avoid match: ${contextScore}` : null,
      proximityScore > 0 ? `📍 Distance: ${distanceKm}km` : null
    ].filter(Boolean)
  };
}
```

**Scoring Components:**

| Component | Weight | Description |
|-----------|--------|-------------|
| **Hard Vibe** | 40-50% | % vibes matched với zone.tags |
| **Embed Score** | 40-50% | AI semantic similarity (FAISS) |
| **Proximity** | 0-20% | Distance từ user location |
| **Context** | Penalty | -15% per avoid keyword match |

---

#### **5. Python AI: hybrid-search endpoint**

```python
# File: ai/app.py

@app.post("/hybrid-search")
def hybrid_search(request: HybridSearchRequest):
    # 1. Generate text vector
    text_vector = model.encode(request.free_text)
    
    # 2. Generate vibes vector (if provided)
    if request.vibes:
        vibes_text = ' '.join(request.vibes)
        vibes_vector = model.encode(vibes_text)
        
        # 3. Combine vectors (weighted)
        query_vector = (0.7 * text_vector + 
                       0.3 * vibes_vector * request.boost_vibes)
    else:
        query_vector = text_vector
    
    # 4. FAISS search
    distances, indices = faiss_index.search(
        query_vector.reshape(1, -1), 
        k=request.top_k
    )
    
    # 5. Filter by type
    hits = []
    for idx, distance in zip(indices[0], distances[0]):
        item = index_metadata[idx]
        if item['type'] == request.filter_type:
            hits.append({
                'id': item['id'],
                'score': float(1 - distance),  # Convert distance to similarity
                'vibe_matches': item.get('vibes', [])
            })
    
    return {
        'strategy': 'embedding',
        'hits': hits
    }
```

**AI Processing:**
```
free_text → encode() → text_vector
vibes → encode() → vibes_vector
combined = 0.7×text + 0.3×vibes×boost
FAISS search → top K similar zones
```

---

### 📊 Ví dụ Cụ thể (Pipeline Cũ)

**Input:**
```javascript
{
  vibes: ['beach', 'photo'],
  freeText: 'đi biển 3 ngày gần Đà Nẵng, thích ảnh đẹp',
  userLocation: { lat: 16.0544, lng: 108.2022 }
}
```

**Step 1: Hybrid Search (AI)**
```javascript
// Python generates vectors
text_vector = encode("đi biển 3 ngày gần Đà Nẵng thích ảnh đẹp")
vibes_vector = encode("beach photo")
query_vector = 0.7 * text_vector + 0.3 * vibes_vector * 1.3

// FAISS search returns
{
  hits: [
    { id: 'dn-my-khe', score: 0.85, vibe_matches: ['beach', 'photo'] },
    { id: 'dn-son-tra', score: 0.78, vibe_matches: ['beach', 'nature'] },
    { id: 'dn-ngu-hanh', score: 0.72, vibe_matches: ['beach', 'culture'] }
  ]
}
```

**Step 2: Score Each Zone**

**Zone: Mỹ Khê Beach**
```javascript
// 1. Hard Vibe Score
zoneTags = ['beach', 'photo', 'water', 'sunset']
userVibes = ['beach', 'photo']
matched = 2/2 = 1.0 (100%)

// 2. Embed Score (from FAISS)
embedScore = 0.85

// 3. Proximity Score
distance = 2.5 km (< 5km)
proximityScore = 1.0

// 4. Context Score
avoidKeywords = ['crowded']
freeText.includes('crowded') = false
contextScore = 0

// 5. Final Score
finalScore = (1.0 × 0.4) + (0.85 × 0.4) + (1.0 × 0.2)
           = 0.4 + 0.34 + 0.2
           = 0.94 (94%)
```

**Zone: Sơn Trà Peninsula**
```javascript
// 1. Hard Vibe Score
zoneTags = ['beach', 'nature', 'temple', 'view']
userVibes = ['beach', 'photo']
matched = 1/2 = 0.5 (50%)  // Only 'beach' matches

// 2. Embed Score
embedScore = 0.78

// 3. Proximity Score
distance = 8 km (< 20km)
proximityScore = 0.8

// 4. Final Score
finalScore = (0.5 × 0.4) + (0.78 × 0.4) + (0.8 × 0.2)
           = 0.2 + 0.312 + 0.16
           = 0.672 (67.2%)
```

**Result: Mỹ Khê wins (94% > 67.2%)**

---

## 🟢 PIPELINE MỚI: AI PERSONALIZATION

**Pipeline mới** đã được giải thích chi tiết trong file `AI_PIPELINE_EXPLAINED.md`.

Tóm tắt nhanh:

```
1. TRACKING (Real-time)
   → User xem/đặt tour
   → PostHog track events với weights

2. LEARNING (Weekly - Sunday 2AM)
   → Fetch events từ PostHog
   → Aggregate theo user
   → Build weighted text: "beach beach beach food food"
   → Generate embedding vector (1024-dim)
   → Upsert to FAISS + MongoDB

3. MATCHING (Real-time)
   → User vào Discovery
   → Tự động load UserProfile
   → Match user vector với zone vectors
   → Return personalized recommendations
```

**Xem `AI_PIPELINE_EXPLAINED.md` để hiểu chi tiết!**

---

## ⚖️ SO SÁNH 2 PIPELINES

| Aspect | Pipeline Cũ (Manual) | Pipeline Mới (AI Personalization) |
|--------|---------------------|-----------------------------------|
| **Input** | User chọn vibes + nhập text | Tự động từ behavior history |
| **Effort** | User phải input mỗi lần | Không cần input, tự động học |
| **Accuracy** | Phụ thuộc user input | Học từ hành vi thực tế → chính xác hơn |
| **Cold Start** | ✅ Hoạt động ngay (không cần history) | ❌ Cần ít nhất 1 tuần để có profile |
| **Latency** | ~300-500ms (real-time search) | ~200-300ms (cached profile) |
| **Maintenance** | ✅ Đơn giản, ổn định | ⚠️ Cần weekly sync, phức tạp hơn |
| **Use Case** | Discovery lần đầu, explore mới | Returning users, personalized recommendations |

---

## 🔄 KẾT HỢP 2 PIPELINES

Trong thực tế, TRAVYY **sử dụng cả 2 pipelines**:

```javascript
// Hybrid approach
async function getRecommendations(userId) {
  // 1. Check if user has profile (AI Pipeline)
  const userProfile = await UserProfile.findOne({ userId });
  
  if (userProfile && userProfile.confidence > 0.7) {
    // ✅ Use AI personalization (high confidence)
    return getPersonalizedZones(userProfile);
  } else {
    // ⚠️ Use manual discovery (low confidence or new user)
    return getManualDiscoveryZones(userId);
  }
}
```

**Strategy:**
- **New users** (< 1 week) → Pipeline Cũ (Manual)
- **Active users** (≥ 1 week, có profile) → Pipeline Mới (AI)
- **Explore mode** (user muốn thử mới) → Pipeline Cũ (Manual)

---

## 📚 CHI TIẾT FUNCTIONS (Summary)

### Pipeline Cũ

| Function | File | Purpose |
|----------|------|---------|
| `handleSubmit()` | `touring-fe/src/pages/ViDoi.jsx` | Collect input, call API |
| `POST /parse` | `touring-be/routes/discover.routes.js` | Entry point, validate, route |
| `getMatchingZones()` | `touring-be/services/zones/matcher.js` | 3-strategy matching (Embed + Keyword + Re-rank) |
| `hybridSearch()` | `touring-be/services/ai/libs/embedding-client.js` | Call Python AI service |
| `scoreZone()` | `touring-be/services/zones/scorer.js` | Multi-factor scoring (HardVibe + Proximity + Context) |
| `POST /hybrid-search` | `ai/app.py` | Python AI vector search |

### Pipeline Mới

| Function | File | Purpose |
|----------|------|---------|
| `trackEvent()` | `touring-fe/src/utils/posthog.js` | Track user behavior to PostHog |
| `weeklyProfileSync()` | `touring-be/jobs/weeklyProfileSync.js` | Weekly batch processing |
| `fetchEvents()` | `touring-be/services/posthog/event-fetcher.js` | Fetch from PostHog API |
| `aggregateByUser()` | `touring-be/services/posthog/aggregator.js` | Weighted aggregation |
| `buildWeightedText()` | `touring-be/services/posthog/aggregator.js` | Build text for embedding |
| `POST /embed` | `ai/app.py` | Generate embedding vector |
| `POST /upsert` | `ai/app.py` | Update FAISS index |

---

## 🎓 KEY TAKEAWAYS

### Pipeline Cũ (Manual Discovery)

**Ưu điểm:**
- ✅ Nhanh, đơn giản, dễ maintain
- ✅ Hoạt động ngay không cần history
- ✅ User có control đầy đủ
- ✅ Phù hợp new users & explore mode

**Nhược điểm:**
- ❌ Phụ thuộc user input (có thể sai)
- ❌ Không học từ hành vi thực tế
- ❌ Phải nhập lại mỗi lần

### Pipeline Mới (AI Personalization)

**Ưu điểm:**
- ✅ Học từ hành vi thực tế → chính xác
- ✅ Không cần user input
- ✅ Càng dùng càng thông minh
- ✅ Personalized cho từng user

**Nhược điểm:**
- ❌ Cần 1 tuần để build profile (cold start)
- ❌ Phức tạp, khó maintain
- ❌ Cần PostHog + FAISS + Weekly sync
- ❌ Privacy concerns (track behavior)

---

**Created:** November 16, 2025  
**Version:** 2.0 (Complete with both pipelines)  
**Author:** AI Pipeline Documentation Team
