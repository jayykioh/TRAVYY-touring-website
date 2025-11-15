# 🎯 Discovery Pipeline - Chi Tiết Từng Bước

## 📋 Tổng Quan Pipeline

```
FE (ViDoi.jsx)
    ↓
    │ POST /api/discover/parse
    │ { vibes: [], freeText: '', avoid: [], userLocation?: {lat, lng}, province?: '' }
    ↓
BE (discover.routes.js)
    ├─ Bước 1: Lấy user location (GPS → Profile Province → None)
    ├─ Bước 2: Match zones (embedding OR keyword)
    ├─ Bước 3: Scoring + ranking
    └─ Bước 4: Return top 10 zones
    ↓
FE (DiscoverResults.jsx)
    ├─ Display zones grouped by province
    └─ User chọn zone → ZoneDetail.jsx
         ├─ Load POIs by category (proximity sort)
         └─ Add POI → Itinerary
```

---

## 🔄 CHI TIẾT TỪNG FILE VÀ TÁC VỤ

### **1. FE - User gửi preferences**
**File**: `touring-fe/src/pages/ViDoi.jsx`

**Tác vụ:**
- User chọn vibes (beach, culture, food, etc.)
- User nhập free text (tuỳ chỉnh)
- Nếu enable checkbox "Dùng vị trí của tôi" → gọi geolocation API
- Gửi POST request tới `/api/discover/parse`

**Data gửi:**
```javascript
{
  vibes: ['beach', 'culture'],           // Selected preferences
  freeText: 'yên tĩnh, không đông đúc',  // User additional input
  avoid: [],                             // Future: things to avoid
  province: null,
  userLocation: {                        // Optional: GPS from browser
    lat: 10.7769,
    lng: 106.7009
  }
}
```

---

### **2. BE Route - Điểm vào chính**
**File**: `touring-be/routes/discover.routes.js`
**Endpoint**: `POST /api/discover/parse`
**Middleware**: `optionalAuth` (có token hoặc không có đều được)

**Tác vụ:**
```
┌─ Step 1: Lấy thông tin user (nếu đã login)
│   └─ Fetch user.location (profileId, provinceName) từ MongoDB
│
├─ Step 2: Parse input + validate
│   ├─ Combine vibes + freeText → combinedText
│   ├─ Validate: combinedText phải ≥ 3 ký tự
│   └─ Build prefs object
│
├─ Step 3: Lấy user location (smart fallback)
│   ├─ GPS (request body) → precise (priority 1)
│   ├─ Profile province center → province (priority 2)
│   └─ None (priority 3)
│
├─ Step 4: Call matcher (embedding OR keyword)
│   └─ getMatchingZones(prefs, options)
│
├─ Step 5: Group zones by province
│   └─ byProvince[provinceName] = [zone1, zone2, ...]
│
└─ Step 6: Return response
    └─ { ok, prefs, strategy, zones, byProvince, fallback }
```

**Code snippet:**
```javascript
// ✅ Lấy user location (nếu có)
const userLocation = getUserLocation(fullUser, req.body);
// Returns: { lat, lng, source, accuracy, provinceName? }
// ✅ Build preferences
const prefs = {
  vibes,           // ['beach', 'culture']
  avoid,           // []
  _rawText: combinedText  // 'beach, culture, yên tĩnh, không đông đúc'
};

// ✅ Call matcher
const result = await getMatchingZones(prefs, {
  province,
  userLocation,    // ← passed to scorer for proximity bonus
  useEmbedding: true
});
```

---

### **3. USER LOCATION SERVICE - Xác định vị trí**
**File**: `touring-be/services/user-location.js`

**Tác vụ**: Đưa ra vị trí user theo độ ưu tiên

**Fallback chain:**
```
Priority 1: GPS (chính xác nhất)
  └─ request.userLocation?.{lat, lng}
     Accuracy: precise
     Use case: FE geolocation API gửi lên
     
Priority 2: Profile Province (trung bình)
  └─ user.location?.{provinceId, provinceName}
     └─ Dùng getProvinceCoordinates() để lấy center của tỉnh
        Accuracy: province (~50-100km radius)
        Use case: User đã nhập tỉnh trong profile
        
Priority 3: None (không có vị trí)
  └─ Không áp dụng proximity scoring
```

**Return:**
```javascript
{
  lat: 10.7769,
  lng: 106.7009,
  source: 'gps' | 'profile',
  accuracy: 'precise' | 'province',
  provinceName?: 'TP. Hồ Chí Minh',
  region?: 'South Vietnam'
}
```

---

### **4. MATCHER - Tìm matching zones**
**File**: `touring-be/services/zones/matcher.js`

**Tác vụ**: Tìm zones phù hợp (embedding OR keyword)

**Hybrid Strategy:**

#### **Strategy A: Embedding (Vector Search)**
```
IF embedding service available:
  ├─ Call Python FastAPI: hybridSearch()
  │   ├─ free_text: prefs._rawText
  │   ├─ vibes: prefs.vibes
  │   ├─ avoid: prefs.avoid
  │   ├─ top_k: 20
  │   ├─ filter_type: 'zone'
  │   ├─ filter_province: province (optional)
  │   └─ boost_vibes: 1.3
  │
  ├─ Get zone IDs from embedding hits: [z1, z2, z3, ...]
  │
  └─ Query MongoDB: Zone.find({ id: {$in: [...]}, isActive: true })
     └─ ✅ Get FULL zone data (not just metadata)
        - name, description, tags, rating, center, etc.
        - embedScore từ Python
        - Combine để có full object
```

#### **Strategy B: Keyword Fallback**
```
IF embedding unavailable OR no hits:
  ├─ Query MongoDB: Zone.find({ isActive: true, province?: ... })
  │
  ├─ Filter by avoid keywords (simple text matching)
  │   └─ zone.text.includes(avoid_keyword)
  │
  └─ candidates = filtered zones
```

**Code:**
```javascript
async function getMatchingZones(prefs, options = {}) {
  let candidates = [];
  let strategy = 'hybrid';

  // Try embedding first
  if (useEmbedding) {
    const embedResult = await hybridSearch({
      free_text: prefs._rawText,
      vibes: prefs.vibes,
      avoid: prefs.avoid,
      top_k: 20,
      filter_type: 'zone'
    });
    
    if (embedResult.hits?.length > 0) {
      // Map embedding hits to MongoDB zones
      const zoneIds = embedResult.hits.map(hit => hit.id);
      const zones = await Zone.find({ id: {$in: zoneIds}, isActive: true }).lean();
      
      candidates = embedResult.hits.map(hit => {
        const zone = zones.find(z => z.id === hit.id);
        return { ...zone, embedScore: hit.score };
      }).filter(Boolean);
      
      strategy = 'embedding';
    }
  }
  
  // Fallback: keyword matching
  if (candidates.length === 0) {
    candidates = await Zone.find({ isActive: true }).lean();
    strategy = 'keyword';
  }
  
  // Continue to scorer...
}
```

---

### **5. SCORER - Rule-based scoring**
**File**: `touring-be/services/zones/scorer.js`

**Tác vụ**: Tính score cho mỗi zone dựa trên rules (không phụ thuộc embedding)

**Scoring logic:**

```
scoreZone(zone, prefs, userLocation) {
  score = 0
  reasons = []
  
  // 1️⃣ VIBE MATCHING (Strong boost)
  ├─ Kiểm tra: zone.tags, zone.vibes, zone.description có chứa user's vibes không?
  ├─ +0.15 per vibe match (capped at 0.6)
  └─ Example: vibes=['beach'] + zone.tags=['beach'] → +0.15
  
  // 2️⃣ AVOID PENALTY (Strong penalty)
  ├─ Kiểm tra: zone.tags, zone.description có chứa avoid keywords không?
  ├─ -0.2 per avoid match (max -0.8)
  └─ Example: avoid=['crowded'] + zone.desc='crowded area' → -0.2
  
  // 3️⃣ RATING BONUS (Small boost)
  ├─ IF zone.rating ≥ 4.0:
  ├─ +(rating - 3.0) * 0.05 (max +0.1)
  └─ Example: zone.rating=4.5 → +0.075
  
  // 4️⃣ PROXIMITY BONUS (Location-aware)
  ├─ IF userLocation provided:
  │   ├─ Calculate distance using Haversine formula
  │   ├─ IF distance < 50km: +0.15
  │   ├─ IF distance < 100km: +0.10
  │   ├─ IF distance < 200km: +0.05
  │   └─ IF distance > 200km: +0 (no bonus)
  │
  └─ Example: user in Hồ Chí Minh (10.77, 106.70) + zone in Cần Thơ (10.03, 105.79)
      └─ distance ~165km → +0.05
  
  // Clamp final score to [0, 1]
  return {
    score: clamp(score, 0, 1),
    reasons: [...],
    details: { matchedVibes, matchedAvoids, ... }
  }
}
```

**Example calculation:**
```
Zone: "Phú Quốc" (beach island)
User prefs: { vibes: ['beach', 'peaceful'], avoid: [] }
User location: TP.HCM (precise GPS)
Zone data: { tags: ['beach', 'island'], rating: 4.5, center: { lat: 10.19, lng: 103.98 } }

Calculation:
  - Vibe matching 'beach': +0.15
  - Vibe matching 'peaceful': +0.15 (if zone.desc contains it)
  - Rating 4.5: +0.075 (since 4.5 - 3.0 = 1.5 * 0.05)
  - Distance: ~280km → +0 (too far)
  ───────────────────
  Total ruleScore = 0.375
```

---

### **6. FINAL SCORING - Combine embedding + rules**
**File**: `touring-be/services/zones/matcher.js` (line 114)

**Tác vụ**: Merge embedScore + ruleScore → finalScore

```
finalScore = embedScore * 0.6 + ruleScore * 0.4

Where:
  - embedScore: from Python embedding (if available, else 0)
  - ruleScore: from scorer.js
  
Weights:
  ├─ 60% embedding → semantic relevance (what zone is about)
  ├─ 40% rules → contextual match (vibes, proximity, rating)
  └─ Note: Phase 3 will replace with behavioral scoring

Example:
  embedScore = 0.92 (very semantically relevant)
  ruleScore = 0.375 (good vibe match + rating)
  
  finalScore = 0.92 * 0.6 + 0.375 * 0.4
             = 0.552 + 0.15
             = 0.702 ✅ HIGH SCORE
```

**Code:**
```javascript
const scored = candidates.map(zone => {
  const ruleResult = scoreZone(zone, prefs, userLocation);
  
  return {
    ...zone,
    embedScore: zone.embedScore || 0,
    ruleScore: ruleResult.score,
    proximityScore: ruleResult.proximityScore,
    distanceKm: ruleResult.distanceKm,
    finalScore: (zone.embedScore || 0) * 0.6 + ruleResult.score * 0.4
  };
});

// Sort by finalScore descending
scored.sort((a, b) => b.finalScore - a.finalScore);

// Return top 10
return {
  strategy: 'embedding' | 'keyword',
  zones: scored.slice(0, 10),
  reason: '...'
};
```

---

### **7. FE - Display Results**
**File**: `touring-fe/src/pages/DiscoverResults.jsx`

**Tác vụ:**
- Nhận zones từ BE
- Group zones by province
- Display trong card list
- User chọn zone → navigate tới ZoneDetail

**Data structure:**
```javascript
{
  zones: [
    {
      id: 'z1',
      name: 'Phú Quốc',
      province: 'Kiên Giang',
      description: '...',
      tags: ['beach', 'island'],
      rating: 4.5,
      embedScore: 0.92,
      ruleScore: 0.375,
      finalScore: 0.702,
      ruleReasons: ['2 vibe matches: beach, peaceful', 'rating 4.5 (+7%)']
    }
  ],
  byProvince: {
    'Kiên Giang': [zone1, ...],
    'Quảng Nam': [zone2, ...]
  },
  strategy: 'embedding',
  fallback: false
}
```

---

### **8. Zone Detail + POIs**
**File**: `touring-be/routes/zone.routes.js`
**Endpoint**: `GET /api/zones/:zoneId/pois-priority`

**Tác vụ:** Load POIs by category with proximity sorting

```
FE ZoneDetail.jsx
  ├─ Get user location (via geolocation)
  └─ Query: GET /api/zones/z1/pois-priority?userLat=10.77&userLng=106.70
         │
         └─ BE (poi-finder.js)
            ├─ Load priority categories: [views, beach, nature, food, ...]
            ├─ For each category:
            │   ├─ Search POIs in zone
            │   ├─ Filter inside zone boundary
            │   └─ Sort by proximity (if userLocation provided)
            │       └─ Distance score bonus (closer = higher)
            │
            └─ Return: { views: [...], beach: [...], ... }
```

---

## 📊 Data Flow Summary

```
┌──────────────────────────────────────────────────────────────┐
│                      FE: ViDoi.jsx                           │
│              User selects vibes + location                   │
└─────────────┬────────────────────────────────────────────────┘
              │
              │ POST /api/discover/parse
              │ { vibes, freeText, userLocation }
              │
┌─────────────▼────────────────────────────────────────────────┐
│               BE: discover.routes.js                          │
│   1. getUserLocation() → { lat, lng, accuracy }              │
│   2. Build prefs from input                                  │
│   3. Call getMatchingZones()                                 │
└─────────────┬────────────────────────────────────────────────┘
              │
      ┌───────┴───────┐
      │               │
    ┌─▼──────┐  ┌───▼──────┐
    │ EMBEDDING     │  KEYWORD
    │ (Python)      │  (MongoDB)
    └─┬──────┘  └───┬──────┘
      │         │
      └────┬────┘
           │
    ┌──────▼──────────┐
    │ candidates:     │
    │ [zone1, zone2]  │
    └────────┬────────┘
             │
    ┌────────▼────────────┐
    │ SCORER (per zone):   │
    │ - Vibe match        │
    │ - Avoid penalty     │
    │ - Rating bonus      │
    │ - Proximity bonus   │
    │ = ruleScore         │
    └────────┬────────────┘
             │
    ┌────────▼──────────────────┐
    │ FINAL SCORE:              │
    │ embedScore*0.6 +          │
    │ ruleScore*0.4             │
    │ = finalScore              │
    └────────┬──────────────────┘
             │
    ┌────────▼──────────────┐
    │ SORT by finalScore    │
    │ (highest first)       │
    │ Take top 10           │
    └────────┬──────────────┘
             │
┌────────────▼─────────────────────────────────────────────────┐
│               FE: DiscoverResults.jsx                         │
│         Display zones grouped by province                    │
└────────────┬──────────────────────────────────────────────────┘
             │
             │ User selects zone
             │
┌────────────▼─────────────────────────────────────────────────┐
│               FE: ZoneDetail.jsx                              │
│   Load POIs by category (with proximity sort)                │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎨 Key Scoring Weights

| Factor | Weight | Score Range | Purpose |
|--------|--------|-------------|---------|
| Vibe match | Per match +0.15 (max 0.6) | 0 ~ 0.6 | Hard match to user preferences |
| Avoid match | Per match -0.2 (max -0.8) | -0.8 ~ 0 | Strong penalty for negatives |
| Rating bonus | (rating - 3.0) * 0.05 | 0 ~ 0.1 | Trust popular zones |
| Proximity | Distance-based | 0 ~ 0.15 | Prefer nearby zones |
| **Final Score** | **embed*0.6 + rule*0.4** | 0 ~ 1 | Combined semantic + contextual |

---

## 🔌 External Services Called

| Service | File | Purpose |
|---------|------|---------|
| **Python Embedding API** | `embedding-client.js` | Vector search zones (hybrid semantic matching) |
| **MongoDB (Zones)** | `models/Zones.js` | Full zone data, MongoDB queries |
| **Mongolia (Users)** | `models/Users.js` | User profile location (if login) |
| **Geolocation (Browser)** | `ViDoi.jsx` | GPS location (FE) |
| **Vietnam Provinces** | `utils/vietnam-provinces.js` | Province coordinates lookup |
| **Map4D / Goong** | `poi-finder.js` | POI search by category (later stage) |

---

## ✅ Response Example

```json
{
  "ok": true,
  "prefs": {
    "vibes": ["beach", "peaceful"],
    "avoid": [],
    "_rawText": "beach, peaceful, yên tĩnh"
  },
  "strategy": "embedding",
  "reason": "Found 10 zones using embedding",
  "zones": [
    {
      "id": "z1",
      "name": "Phú Quốc",
      "province": "Kiên Giang",
      "description": "Beautiful island with clear waters...",
      "rating": 4.5,
      "center": { "lat": 10.19, "lng": 103.98 },
      "tags": ["beach", "island", "peace"],
      "embedScore": 0.92,
      "ruleScore": 0.375,
      "proximityScore": 0.05,
      "distanceKm": 165.2,
      "finalScore": 0.702,
      "ruleReasons": [
        "2 vibe matches (+30%): beach, peaceful",
        "rating 4.5 (+7%)",
        "nearby (165km) (+5%)"
      ]
    },
    { ... more zones ... }
  ],
  "byProvince": {
    "Kiên Giang": [{ zone objects }],
    "Quảng Nam": [{ zone objects }]
  },
  "fallback": false
}
```

---

## 🐛 Debug Tips

**Turn on console logs:**
```bash
# BE: Look for patterns like:
🎯 [Matcher] Input: {...}
🔍 [Matcher] Checking embedding service...
📦 [Matcher] Embedding result: X hits
📊 [Matcher] Re-ranking X candidates...
🏆 [Matcher] Top 3: [...]

# Check final scores in DiscoverResults:
[DiscoverResults] Received data: {
  zonesCount: 10,
  finalScore: 0.702
}
```

**Common issues:**
1. **No zones found**: Embedding service down OR zone data stale → fallback to keyword
2. **Low proximity score**: Zone distance > 200km OR no user location
3. **Embedding vs keyword difference**: Semantic relevance varies significantly
4. **Avoid filter**: Check avoid keywords are in zone.desc or tags

---

## 🎯 Workflow Summary

```
1. User picks vibes (UI: buttons)
2. User optionally enables geolocation
3. User types optional free text
4. Submit → /api/discover/parse

↓

5. Backend gets user profile location (if login)
6. Smart location fallback: GPS → Profile → None
7. Call embedding service (Python FAISS)
8. Get matching zone IDs from vector search
9. Load full zone data from MongoDB
10. Apply rule-based scorer (vibes, avoid, proximity, rating)
11. Merge embedScore (60%) + ruleScore (40%)
12. Sort by finalScore, return top 10

↓

13. FE displays zones grouped by province
14. User clicks zone → ZoneDetail
15. Load POIs by category (with proximity sorting)
16. User adds POIs to itinerary
```

