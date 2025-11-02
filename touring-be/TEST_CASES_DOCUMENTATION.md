# Test Cases Documentation

## 📋 Tổng quan

Tài liệu này mô tả chi tiết các test cases trong hệ thống Travyy Backend, bao gồm input/output, luồng xử lý và kịch bản kiểm thử.

## 📊 Thống kê Test Suite

- **Tổng số test suites**: 14
- **Tổng số test cases**: 90
- **Test coverage**: ~77%
- **Thời gian chạy**: ~3.5 giây

---

## 1️⃣ AI Services Tests

### 1.1 LLM Module (`services/ai/libs/__tests__/llm.test.js`)

#### Test Case 1.1.1: Extract JSON từ văn bản
**Mục đích**: Kiểm tra khả năng trích xuất JSON từ các định dạng khác nhau

**Input**:
```javascript
// Fenced JSON
const text = 'Some text\n```json\n{ "a": 1, "b": "x" }\n```\nmore';

// Inline JSON
const text = 'prefix {"foo": "bar"} suffix';

// Invalid text
const text = 'no json here';
```

**Output**:
```javascript
// Fenced JSON → { a: 1, b: 'x' }
// Inline JSON → { foo: 'bar' }
// Invalid → null
```

**Luồng xử lý**:
```
Input text
    ↓
Check for ```json fence
    ↓ (nếu có)
Extract JSON block → Parse → Return object
    ↓ (nếu không)
Regex match first { ... }
    ↓
Try parse → Return object or null
```

#### Test Case 1.1.2: Extract Duration từ văn bản tiếng Việt
**Mục đích**: Trích xuất số ngày từ mô tả bằng tiếng Việt/English

**Input**:
```javascript
'2 tuần'           // 2 weeks
'2-3 ngày'         // range
'3 days'           // English
'no duration'      // none
```

**Output**:
```javascript
14   // 2 weeks = 14 days
3    // range takes max
3    // direct days
null // no match
```

**Luồng**:
```
Input text
    ↓
Match patterns:
  - /(\d+)\s*tuần/i → multiply by 7
  - /(\d+)-(\d+)\s*ngày/i → take max
  - /(\d+)\s*(?:ngày|days?)/i → direct
    ↓
Return number or null
```

#### Test Case 1.1.3: Heuristic Extract Vibes
**Mục đích**: Phát hiện interests và avoids từ văn bản tự nhiên

**Input**:
```javascript
'Tôi muốn đi biển, tránh chỗ đông và không thích đi bộ nhiều'
```

**Output**:
```javascript
{
  vibes: ['beach'],
  avoid: ['crowded', 'walking'],
  keywords: ['biển', 'đông', 'đi bộ'],
  interests: ['beach'],
  pace: null,
  budget: null,
  durationDays: null
}
```

**Luồng**:
```
Input Vietnamese text
    ↓
Map keywords:
  - biển/beach/bãi tắm → beach
  - đông/đông người → crowded
  - đi bộ/walking → walking
    ↓
Extract avoid patterns:
  - tránh/không thích/avoid
    ↓
Merge vibes + avoid + keywords
    ↓
Return enriched preferences
```

#### Test Case 1.1.4: AI Timeout Fallback
**Mục đích**: Kiểm tra fallback về heuristics khi AI timeout

**Input**:
```javascript
const text = 'Tôi muốn biển và ẩm thực';
// AI service timeout = 3000ms
```

**Output**:
```javascript
{
  interests: ['beach', 'food'],
  avoid: [],
  keywords: ['biển', 'ẩm thực'],
  pace: null,
  budget: null,
  durationDays: null
}
```

**Luồng**:
```
parsePrefsSmart(text)
    ↓
Start AI call with 3s timeout
    ↓
Parallel: Start heuristic parsing
    ↓
[Timeout after 3s]
    ↓
Cancel AI, return heuristic result
```

#### Test Case 1.1.5: AI Safety Block
**Mục đích**: Xử lý khi AI response bị block bởi safety filters

**Input**:
```javascript
'Some sensitive content'
// AI returns: { finishReason: 'SAFETY' }
```

**Output**:
```javascript
{
  interests: [],
  avoid: [],
  keywords: [],
  pace: null,
  budget: null,
  durationDays: null
}
```

**Luồng**:
```
Call AI
    ↓
Response: finishReason = 'SAFETY'
    ↓
Catch error in text()
    ↓
Fallback to heuristics
    ↓
Return safe default prefs
```

---

### 1.2 Embedding Client (`services/ai/libs/__tests__/embedding-client.test.js`)

#### Test Case 1.2.1: Embed Text
**Mục đích**: Chuyển văn bản thành vector embeddings

**Input**:
```javascript
const texts = ['Hồ Gươm Hà Nội', 'Vịnh Hạ Long'];
```

**Output**:
```javascript
{
  embeddings: [
    [0.1, 0.2, ..., 0.9],  // 384 dimensions
    [0.3, 0.4, ..., 0.8]
  ]
}
```

**Luồng**:
```
POST /embed
    ↓
Body: { texts: [...] }
    ↓
Embedding service processes
    ↓
Return vector arrays
```

#### Test Case 1.2.2: Hybrid Search
**Mục đích**: Tìm kiếm zones bằng semantic + keyword matching

**Input**:
```javascript
{
  query: 'biển đẹp miền Trung',
  k: 5,
  alpha: 0.7  // 70% semantic, 30% keyword
}
```

**Output**:
```javascript
{
  results: [
    { id: 'z1', score: 0.92, name: 'Đà Nẵng' },
    { id: 'z2', score: 0.87, name: 'Nha Trang' },
    { id: 'z3', score: 0.81, name: 'Quy Nhơn' }
  ]
}
```

**Luồng**:
```
Query input
    ↓
Generate query embedding
    ↓
Vector similarity search (70%)
    ↓
Keyword BM25 search (30%)
    ↓
Combine scores with alpha
    ↓
Sort and return top K
```

---

### 1.3 Goong Map API (`services/ai/libs/__tests__/goong.test.js`)

#### Test Case 1.3.1: Trip Optimization V2
**Mục đích**: Tối ưu route giữa nhiều điểm

**Input**:
```javascript
const points = [
  [106.0, 10.0],  // [lng, lat]
  [106.1, 10.1],
  [106.2, 10.2]
];
const options = {
  vehicle: 'car',
  roundtrip: false
};
```

**Output**:
```javascript
{
  code: 'Ok',
  trips: [{
    distance: 20000,    // meters
    duration: 1800,     // seconds
    geometry: 'encoded-polyline',
    legs: [
      { distance: 10000, duration: 900 },
      { distance: 10000, duration: 900 }
    ]
  }]
}
```

**Luồng**:
```
Input points (≥2)
    ↓
Validate coordinates
    ↓
Call Goong Trip API v2
    ↓
[If 429 rate limit]
    ↓
Wait 1s and retry (max 3 times)
    ↓
Parse response
    ↓
Return optimized route
```

#### Test Case 1.3.2: Retry on Rate Limit
**Mục đích**: Xử lý 429 rate limit với retry logic

**Input**:
```javascript
// First call returns 429
// Second call returns 200
```

**Output**:
```javascript
// Success after 1 retry
{
  trips: [{ distance: 5000, duration: 600, ... }]
}
```

**Luồng**:
```
Call Goong API
    ↓
Response: 429 Rate Limit
    ↓
Increment retry count (1/3)
    ↓
Wait 1000ms
    ↓
Retry call
    ↓
Response: 200 OK
    ↓
Return data
```

#### Test Case 1.3.3: Search Nearby POIs
**Mục đích**: Tìm POI xung quanh tọa độ

**Input**:
```javascript
{
  lat: 10.5,
  lng: 106.5,
  radius: 1000,  // meters
  vibes: ['food'],
  limit: 5
}
```

**Output**:
```javascript
[
  {
    place_id: 'p1',
    name: 'Nhà hàng Sài Gòn',
    lat: 10.501,
    lng: 106.502,
    types: ['restaurant'],
    rating: 4.5
  },
  // ... more POIs
]
```

**Luồng**:
```
Map vibes → search query
  food → 'nhà hàng, quán ăn'
    ↓
Call Goong Autocomplete API
    ↓
Get place_ids
    ↓
Batch fetch place details
    ↓
Filter by radius
    ↓
Return enriched POIs
```

---

## 2️⃣ Zone Services Tests

### 2.1 Zone Matcher (`services/zones/__tests__/matcher.test.js`)

#### Test Case 2.1.1: Embedding Path
**Mục đích**: Match zones qua embedding service

**Input**:
```javascript
{
  interests: ['beach', 'cultural'],
  avoid: ['crowded'],
  keywords: ['biển', 'văn hóa'],
  durationDays: 3
}
```

**Mock Embedding Response**:
```javascript
{
  results: [
    { id: 'z1', score: 0.95 },
    { id: 'z2', score: 0.88 }
  ]
}
```

**Output**:
```javascript
[
  {
    id: 'z1',
    name: 'Đà Nẵng',
    score: 0.95,
    reasons: ['beach match', 'high rating']
  },
  {
    id: 'z2',
    name: 'Hội An',
    score: 0.88,
    reasons: ['cultural heritage', 'not crowded']
  }
]
```

**Luồng**:
```
Input preferences
    ↓
Check embedding service available
    ↓ (Yes)
Hybrid search with interests + keywords
    ↓
Get zone IDs from embedding
    ↓
Fetch full zone data from MongoDB
    ↓
Apply scorer.scoreZone()
    ↓
Sort by score + filter avoids
    ↓
Return top matches
```

#### Test Case 2.1.2: Keyword Fallback
**Mục đích**: Fallback về keyword matching khi embedding down

**Input**:
```javascript
{
  interests: ['food'],
  keywords: ['ẩm thực', 'hải sản']
}
// Embedding service: unavailable
```

**Output**:
```javascript
[
  {
    id: 'z3',
    name: 'Nha Trang',
    matchScore: 0.82,
    keywordMatches: ['hải sản', 'ẩm thực'],
    reasons: ['food match', 'seafood specialty']
  }
]
```

**Luồng**:
```
Check embedding service
    ↓ (Unavailable)
Fallback to keyword path
    ↓
Load all active zones from DB
    ↓
For each zone:
  - Extract keywords from name + description
  - Calculate semantic match score
  - Keyword exact/partial matches
    ↓
Filter by threshold (>0.3)
    ↓
Sort by matchScore
    ↓
Return matches
```

---

### 2.2 POI Finder (`services/zones/__tests__/poi-finder.test.js`)

#### Test Case 2.2.1: Find POIs by Category
**Mục đích**: Tìm POIs theo category với deduplication

**Input**:
```javascript
{
  zoneId: 'zone1',
  categoryKey: 'food',
  limit: 3
}
```

**Output**:
```javascript
[
  {
    place_id: 'p1',
    name: 'Food Place',
    category: 'food',
    categoryLabel: 'Ẩm thực & Cafe',
    matchScore: 0.974,
    distanceKm: 0.16,
    reasons: ['very close', 'food in name', 'high rating']
  },
  // Max 3 POIs, no duplicates
]
```

**Luồng**:
```
Input: zoneId + category + limit
    ↓
Load zone from DB
    ↓
Get category config (queries, vibes)
    ↓
For each query in category.queries:
  - Call map4d.searchPOIsByText()
  - Deduplicate by place_id
    ↓
Merge results from all queries
    ↓
Filter by zone polygon (if exists)
    ↓
Score each POI (distance, rating, types)
    ↓
Sort by matchScore descending
    ↓
Return top N (limit)
```

#### Test Case 2.2.2: Load Priority POIs
**Mục đích**: Load multiple categories song song

**Input**:
```javascript
{
  zoneId: 'zone1',
  limit: 5  // per category
}
```

**Output**:
```javascript
{
  food: [POI, POI, POI, POI, POI],
  sights: [POI, POI, POI, POI, POI],
  activities: [POI, POI, POI],
  // ... more categories
}
```

**Luồng**:
```
Get priority categories (5-7 categories)
    ↓
Promise.all([
  findPOIsByCategory('food'),
  findPOIsByCategory('sights'),
  findPOIsByCategory('activities'),
  ...
])
    ↓
Limit concurrency to 3 parallel
    ↓
Catch errors per category (continue on fail)
    ↓
Group results by category key
    ↓
Return poisByCategory object
```

---

## 3️⃣ Itinerary Services Tests

### 3.1 Optimizer (`services/itinerary/__tests__/optimizer.test.js`)

#### Test Case 3.1.1: Build Itinerary Prompt
**Mục đích**: Tạo prompt cho LLM với đầy đủ context

**Input**:
```javascript
const items = [
  { name: 'Hồ Gươm', category: 'landmark', location: {...} },
  { name: 'Phố cổ', category: 'cultural', location: {...} }
];
const preferences = {
  pace: 'moderate',
  bestTime: 'morning',
  budget: 'medium'
};
const trip = {
  distance: 5000,
  duration: 1200,
  legs: [...]
};
```

**Output**:
```javascript
`You are a travel planner AI...

Items:
1. Hồ Gươm (landmark) at (21.02, 105.85)
2. Phố cổ (cultural) at (21.03, 105.84)

Trip Info:
- Distance: 5.0 km
- Duration: 20 minutes
- Pace: moderate

Preferences:
- Best time: morning
- Budget: medium

Generate JSON with:
{
  "summary": "...",
  "tips": ["...", "..."],
  "bestTimeOfDay": "morning",
  ...
}
`
```

**Luồng**:
```
Input: items + prefs + trip
    ↓
Build structured prompt:
  - System instruction
  - Items list with coords
  - Trip metrics
  - User preferences
  - JSON schema requirement
    ↓
Return complete prompt string
```

#### Test Case 3.1.2: Call LLM and Parse
**Mục đích**: Gọi Gemini LLM và parse JSON response

**Input**:
```javascript
const prompt = "Generate itinerary insights...";
```

**Mock LLM Response**:
```json
{
  "summary": "Tham quan trung tâm Hà Nội trong 1 ngày",
  "tips": [
    "Khởi hành lúc 7h sáng để tránh nắng",
    "Mang theo nước uống"
  ],
  "bestTimeOfDay": "morning",
  "estimatedCost": "200000"
}
```

**Output**:
```javascript
{
  summary: 'Tham quan trung tâm Hà Nội trong 1 ngày',
  tips: ['Khởi hành lúc 7h sáng để tránh nắng', 'Mang theo nước uống'],
  bestTimeOfDay: 'morning',
  estimatedCost: '200000'
}
```

**Luồng**:
```
Check GEMINI_API_KEY exists
    ↓ (Yes)
Call model.generateContent(prompt)
    ↓
Wait for response (timeout 10s)
    ↓
Extract text from candidates[0].parts[0]
    ↓
extractJsonFromText()
    ↓
Return parsed object or null
```

#### Test Case 3.1.3: Generate AI Insights Async
**Mục đích**: Background process lưu AI insights vào DB

**Input**:
```javascript
const itineraryId = 'it123';
const tripData = { distance: 10000, duration: 1800, ... };
const items = [...];
```

**Output**:
```javascript
// Itinerary document updated:
{
  _id: 'it123',
  aiInsights: {
    summary: '...',
    tips: [...],
    bestTimeOfDay: 'afternoon',
    generatedAt: '2025-11-01T10:30:00Z'
  },
  aiProcessing: false
}
```

**Luồng**:
```
Start background task (unref timer)
    ↓
Build prompt from trip + items + prefs
    ↓
Call LLM (with timeout)
    ↓
[Success]
    ↓
Parse JSON insights
    ↓
Update itinerary.aiInsights
    ↓
Set aiProcessing = false
    ↓
Save to DB
    ↓
[Or fallback if LLM fails]
```

---

## 4️⃣ Route Integration Tests

### 4.1 Discover Routes (`routes/__tests__/discover.routes.test.js`)

#### Test Case 4.1.1: POST /api/discover/parse (Happy Path)
**Mục đích**: Parse preferences và match zones

**HTTP Request**:
```http
POST /api/discover/parse
Content-Type: application/json

{
  "text": "Tôi muốn đi biển 3 ngày, thích ẩm thực và văn hóa"
}
```

**HTTP Response** (200 OK):
```json
{
  "success": true,
  "parsed": {
    "interests": ["beach", "food", "cultural"],
    "durationDays": 3,
    "pace": null,
    "budget": null
  },
  "zones": [
    {
      "id": "z1",
      "name": "Đà Nẵng",
      "province": "Đà Nẵng",
      "score": 0.92
    }
  ],
  "grouped": {
    "Đà Nẵng": [
      { "id": "z1", "name": "Đà Nẵng", ... }
    ]
  }
}
```

**Luồng**:
```
HTTP POST /parse
    ↓
Validate: text.length >= 3
    ↓
Call parsePreferences(text)
    ↓
Call getMatchingZones(prefs)
    ↓
Group zones by province
    ↓
Return JSON response
```

#### Test Case 4.1.2: POST /parse - Validation Error
**Mục đích**: Kiểm tra validation

**HTTP Request**:
```http
POST /api/discover/parse
{
  "text": "ab"  // too short
}
```

**HTTP Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "Text too short, min 3 characters"
}
```

#### Test Case 4.1.3: POST /parse - No Match
**Mục đích**: Xử lý khi không tìm thấy zone nào

**HTTP Request**:
```http
POST /api/discover/parse
{
  "text": "Tôi muốn đi sao Hỏa"
}
```

**HTTP Response** (200 OK):
```json
{
  "success": true,
  "parsed": { ... },
  "zones": [],
  "noMatch": true,
  "message": "No matching zones found"
}
```

---

### 4.2 Itinerary Routes (`routes/__tests__/itinerary.routes.test.js`)

#### Test Case 4.2.1: POST /api/itinerary/:id/optimize-ai
**Mục đích**: Tối ưu route với Goong + AI insights

**HTTP Request**:
```http
POST /api/itinerary/it123/optimize-ai
Authorization: Bearer <token>
```

**HTTP Response** (200 OK):
```json
{
  "success": true,
  "itinerary": {
    "_id": "it123",
    "isOptimized": true,
    "aiProcessing": true,
    "routePolyline": "encoded-polyline-string",
    "trip": {
      "distance": 15000,
      "duration": 2400,
      "legs": [...]
    },
    "items": [...]
  }
}
```

**Luồng**:
```
HTTP POST /optimize-ai
    ↓
Authenticate user (authJWT)
    ↓
Load itinerary from DB
    ↓
Validate: items.length >= 2
    ↓
Extract coordinates
    ↓
Call tripV2(points)
    ↓
Decode polyline
    ↓
Update itinerary:
  - Set isOptimized = true
  - Set aiProcessing = true
  - Save trip data
    ↓
Start background: generateAIInsightsAsync()
    ↓
Return updated itinerary
```

#### Test Case 4.2.2: POST /optimize-ai - Insufficient Points
**Mục đích**: Validate số lượng POIs

**HTTP Request**:
```http
POST /api/itinerary/it-few/optimize-ai
```

**HTTP Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "Need at least 2 locations with valid coordinates"
}
```

#### Test Case 4.2.3: POST /api/itinerary/:id/items
**Mục đích**: Thêm POI vào itinerary

**HTTP Request**:
```http
POST /api/itinerary/it123/items
{
  "poi": {
    "place_id": "p456",
    "name": "Bảo tàng Hồ Chí Minh",
    "geometry": {
      "location": { "lat": 21.03, "lng": 105.84 }
    },
    "types": ["museum"],
    "rating": 4.5
  }
}
```

**HTTP Response** (200 OK):
```json
{
  "success": true,
  "itinerary": {
    "_id": "it123",
    "items": [
      {
        "poiId": "p456",
        "name": "Bảo tàng Hồ Chí Minh",
        "location": { "lat": 21.03, "lng": 105.84 },
        "types": ["museum"],
        "rating": 4.5,
        "itemType": "poi"
      }
    ],
    "isOptimized": false
  }
}
```

**Luồng**:
```
POST /items
    ↓
Validate POI has ID
    ↓
Check duplicate (poiId exists in items?)
    ↓ (No)
Extract location + metadata
    ↓
Determine itemType (poi or tour)
    ↓
Push to itinerary.items[]
    ↓
Set isOptimized = false
    ↓
Update isCustomTour flag if needed
    ↓
Save to DB
    ↓
Return updated itinerary
```

---

## 5️⃣ Utility Tests

### 5.1 GPX Export (`utils/__tests__/gpx.test.js`)

#### Test Case 5.1.1: Build GPX
**Mục đích**: Tạo file GPX từ itinerary

**Input**:
```javascript
const itinerary = {
  name: 'Hà Nội 1 ngày',
  items: [
    {
      name: 'Hồ Gươm',
      location: { lat: 21.028511, lng: 105.852142 },
      notes: 'Hồ nước ngọt trung tâm Hà Nội'
    },
    {
      name: 'Văn Miếu',
      location: { lat: 21.027763, lng: 105.835342 }
    }
  ]
};
const routePoints = [
  [21.028511, 105.852142],
  [21.027763, 105.835342]
];
```

**Output** (GPX XML):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Travyy">
  <metadata>
    <name>Hà Nội 1 ngày</name>
    <desc>Itinerary exported from Travyy</desc>
    <time>2025-11-01T10:00:00Z</time>
  </metadata>
  
  <wpt lat="21.028511" lon="105.852142">
    <name>Hồ Gươm</name>
    <desc>Hồ nước ngọt trung tâm Hà Nội</desc>
  </wpt>
  
  <wpt lat="21.027763" lon="105.835342">
    <name>Văn Miếu</name>
  </wpt>
  
  <trk>
    <name>Route</name>
    <trkseg>
      <trkpt lat="21.028511" lon="105.852142"/>
      <trkpt lat="21.027763" lon="105.835342"/>
    </trkseg>
  </trk>
</gpx>
```

**Luồng**:
```
Input: itinerary + routePoints
    ↓
Build XML header
    ↓
Add metadata (name, desc, timestamp)
    ↓
For each item → add <wpt>
    ↓
Add <trk> with route points
    ↓
Close XML tags
    ↓
Return GPX string
```

#### Test Case 5.1.2: Safe Filename
**Mục đích**: Chuyển tiếng Việt thành ASCII safe

**Input**:
```javascript
'Đà Nẵng - Hội An 3 ngày'
```

**Output**:
```javascript
{
  ascii: 'Da-Nang-Hoi-An-3-ngay',
  utf8Star: "UTF-8''%C4%90%C3%A0%20N%E1%BA%B5ng..."
}
```

**Luồng**:
```
Input: Vietnamese filename
    ↓
Strip diacritics (Đ→D, ă→a, ơ→o)
    ↓
Replace spaces with hyphens
    ↓
Remove special chars
    ↓
Generate RFC 5987 UTF-8* encoding
    ↓
Return { ascii, utf8Star }
```

---

## 6️⃣ Mock Strategies

### 6.1 AI Service Mocks

#### Google Generative AI (Gemini)
```javascript
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: async (prompt) => ({
        response: {
          text: () => JSON.stringify({
            interests: ['beach', 'food'],
            avoid: [],
            pace: 'moderate',
            budget: 'medium',
            durationDays: 3
          })
        }
      })
    })
  }))
}));
```

**Behavior**:
- Returns valid JSON với preferences
- Timeout test: return Promise that never resolves
- Safety block: return `{ finishReason: 'SAFETY' }`

#### Embedding Service (Fetch)
```javascript
global.fetch = jest.fn((url) => {
  if (url.includes('/embed')) {
    return Promise.resolve({
      ok: true,
      json: async () => ({
        embeddings: [[0.1, 0.2, ..., 0.9]]  // 384-dim
      })
    });
  }
  if (url.includes('/search')) {
    return Promise.resolve({
      ok: true,
      json: async () => ({
        results: [
          { id: 'z1', score: 0.95 },
          { id: 'z2', score: 0.88 }
        ]
      })
    });
  }
});
```

### 6.2 Database Mocks

#### Mongoose Models
```javascript
jest.mock('../../models/Zones', () => {
  const mockZone = {
    id: 'zone1',
    name: 'Test Zone',
    center: { lat: 10.0, lng: 106.0 },
    radiusM: 5000,
    polygon: [],
    isActive: true
  };
  
  return {
    findOne: jest.fn(() => ({
      lean: () => Promise.resolve(mockZone)
    })),
    find: jest.fn(() => ({
      lean: () => Promise.resolve([mockZone])
    }))
  };
});
```

**Key Pattern**: Always chain `.lean()` before Promise

### 6.3 HTTP Client Mocks

#### Axios (Goong API)
```javascript
jest.mock('axios');
const axios = require('axios');

axios.get.mockImplementation(async (url) => {
  if (url.includes('/trip')) {
    return {
      status: 200,
      data: {
        code: 'Ok',
        trips: [{
          distance: 10000,
          duration: 1200,
          geometry: 'encoded-polyline',
          legs: []
        }]
      }
    };
  }
  
  if (url.includes('/place/autocomplete')) {
    return {
      status: 200,
      data: {
        predictions: [
          {
            place_id: 'p1',
            structured_formatting: {
              main_text: 'Test Place'
            }
          }
        ]
      }
    };
  }
});
```

---

## 7️⃣ Test Execution Flow

### 7.1 Sequential Test Run
```bash
npm test -- --runInBand
```

**Flow**:
```
Jest starts
    ↓
Load jest.config.cjs
    ↓
Setup global mocks (jest.setup.js)
    ↓
For each test suite (14 suites):
  - Reset modules
  - Clear all mocks
  - Run beforeEach hooks
  - Execute test cases
  - Run afterEach hooks
    ↓
Collect coverage data
    ↓
Generate reports:
  - coverage/lcov.info
  - coverage/coverage-final.json
  - coverage/lcov-report/index.html
    ↓
Display summary
```

### 7.2 Coverage Collection
```bash
npm test -- --coverage
```

**Flow**:
```
Jest with coverage enabled
    ↓
Instrument code with istanbul
    ↓
Track:
  - Statements executed
  - Branches taken
  - Functions called
  - Lines covered
    ↓
Generate metrics per file
    ↓
Aggregate to totals:
  - 77.05% statements
  - 59.81% branches
  - 84.02% functions
  - 77.66% lines
    ↓
Export HTML report
```

---

## 8️⃣ Edge Cases & Error Handling

### 8.1 Network Failures

#### Test: Embedding Service Down
```javascript
global.fetch.mockRejectedValue(new Error('Network error'));

// Expected: Fallback to keyword matching
const zones = await getMatchingZones(prefs);
expect(zones).toBeDefined();
expect(zones.length).toBeGreaterThan(0);
```

#### Test: Goong API Timeout
```javascript
axios.get.mockImplementation(() => 
  new Promise((resolve) => setTimeout(resolve, 10000))
);

// Expected: Request timeout after 5s
await expect(tripV2(points)).rejects.toThrow('timeout');
```

### 8.2 Invalid Data

#### Test: Malformed JSON from AI
```javascript
mockLLM.response.text = () => 'This is not valid JSON';

// Expected: Parse error caught, return heuristics
const prefs = await parsePrefsSmart(text);
expect(prefs.interests).toBeDefined();
```

#### Test: Missing Coordinates
```javascript
const items = [
  { name: 'Place 1', location: null },
  { name: 'Place 2', location: { lat: 10, lng: 106 } }
];

// Expected: Filter out items without coords
await expect(optimizeRoute(items)).rejects.toThrow('at least 2');
```

### 8.3 Concurrency Issues

#### Test: Race Condition in Background AI
```javascript
// Start multiple optimize requests
Promise.all([
  optimizeRoute(itinerary1),
  optimizeRoute(itinerary2),
  optimizeRoute(itinerary3)
]);

// Expected: Each gets unique AI insights
// No collision in aiProcessing flag
```

---

## 9️⃣ Performance Benchmarks

### Test Execution Times

| Test Suite | Tests | Time |
|------------|-------|------|
| llm.test.js | 19 | ~150ms |
| embedding-client.test.js | 8 | ~80ms |
| goong.test.js | 9 | ~1.6s |
| poi-finder.test.js | 8 | ~50ms |
| optimizer.test.js | 6 | ~100ms |
| discover.routes.test.js | 6 | ~180ms |
| itinerary.routes.test.js | 12 | ~600ms |
| **Total** | **90** | **~3.5s** |

### Coverage by Module

| Module | Statements | Branches | Functions | Lines |
|--------|-----------|----------|-----------|-------|
| routes/ | 76.12% | 52.10% | 79.48% | 77.44% |
| services/ai/libs/ | 68.37% | 57.26% | 73.58% | 68.55% |
| services/zones/ | 91.74% | 70.04% | 94.54% | 92.36% |
| services/itinerary/ | 74.48% | 63.46% | 92.30% | 75.00% |
| utils/ | 93.33% | 43.75% | 88.88% | 93.33% |

---

## 🔟 Best Practices Demonstrated

### 10.1 Test Isolation
- ✅ Each test resets modules với `jest.resetModules()`
- ✅ Mock cleared trong `beforeEach()`
- ✅ No shared state giữa tests
- ✅ Database mocks isolated per test

### 10.2 Deterministic Testing
- ✅ No real API calls (all mocked)
- ✅ Fixed timestamps in mocks
- ✅ Predictable random values
- ✅ No dependency on external services

### 10.3 Meaningful Assertions
- ✅ Test behavior, not implementation
- ✅ Check output shape and values
- ✅ Verify side effects (DB saves, API calls)
- ✅ Edge cases covered

### 10.4 Documentation
- ✅ Clear test descriptions
- ✅ Comments explaining complex setups
- ✅ Input/output examples in tests
- ✅ Mock table documented

---

## 📝 Running Specific Tests

### Run single file
```bash
npm test -- llm.test.js
```

### Run by pattern
```bash
npm test -- --testPathPattern=routes
```

### Run with watch mode
```bash
npm test -- --watch
```

### Run with detailed output
```bash
npm test -- --verbose
```

---

## 🐛 Debugging Failed Tests

### Check test output
```bash
npm test -- --no-coverage
```

### Use Jest debug mode
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Check mock calls
```javascript
console.log(mockFunction.mock.calls);
console.log(mockFunction.mock.results);
```

---

## 📚 References

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest API Testing](https://github.com/visionmedia/supertest)
- [README_TESTS.md](./README_TESTS.md) - Mock table và setup
- [PROMPTS.md](./PROMPTS.md) - AI prompts used
- [Coverage Report](./coverage/lcov-report/index.html) - HTML coverage

---

**Last Updated**: November 1, 2025  
**Test Coverage**: 77.05% statements  
**Total Test Cases**: 90  
**Status**: ✅ All passing
