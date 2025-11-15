# 🔧 PERSONALIZED RECOMMENDATIONS - FIX PLAN

## ❌ Current Issues

### 1. Pipeline Data Not Persisting
- **Problem**: `weeklyProfileSync.js` chạy thành công nhưng UserProfile collection **vẫn rỗng**
- **Root Cause**: Script đang dùng connection riêng không match với UserProfile model
- **Evidence**:
  ```
  Pipeline reports: "synced: 1" 
  MongoDB query: UserProfile.find({}) returns []
  ```

### 2. Mock Data Only (No Real Pipeline)
- **Problem**: UI hoàn toàn mock, không connect thật với PostHog → Aggregation → Embedding → FAISS
- **Issue**: Controller đọc UserProfile nhưng collection rỗng → 404 Not Found

### 3. Embedding Timeout
- **Problem**: 4/5 users timeout sau 30s khi gọi AI embedding service
- **Cause**: AI service quá chậm hoặc không response
- **Impact**: Chỉ 1/5 users được xử lý thành công

---

## ✅ FIXES REQUIRED

### Fix 1: Connection Architecture
**File**: `touring-be/jobs/weeklyProfileSync.js`

**Current (WRONG)**:
```javascript
// Script tạo mongoose.connection riêng
mongoose.connect(MONGODB_URI).then(async () => {
  await weeklyProfileSync();
  await mongoose.connection.close(); // ❌ Đóng connection khác với mainConn
});
```

**Fixed (CORRECT)**:
```javascript
// Sử dụng mainConn shared connection
const { mainConn } = require('../config/db');
const UserProfile = require('../models/UserProfile'); // Uses default mongoose

// UserProfile model phải dùng mainConn
const UserProfileModel = mainConn.model('UserProfile', UserProfile.schema);

// Trong sync function
await UserProfileModel.findOneAndUpdate(
  { userId },
  { vibeWeights, provinceWeights, ... },
  { upsert: true }
);
```

---

### Fix 2: Increase AI Service Timeout
**File**: `touring-be/services/ai/libs/embedding-client.js`

**Current**:
```javascript
async function embed(texts) {
  const res = await fetchWithTimeout(`${EMBED_URL}/embed`, {
    method: 'POST',
    body: JSON.stringify({ texts })
  }); // Default 10s timeout ❌
}
```

**Fixed**:
```javascript
async function embed(texts) {
  const res = await fetchWithTimeout(`${EMBED_URL}/embed`, {
    method: 'POST',
    body: JSON.stringify({ texts })
  }, 60000); // ✅ 60s timeout for large batches
}
```

---

### Fix 3: Verify AI Service Running
**Check**:
```bash
# Terminal 1: AI service
cd ai
.venv\Scripts\activate
uvicorn app:app --reload --port 8088

# Verify endpoint
curl http://localhost:8088/healthz
# Should return: {"ok": true, "model": "...", "vectors": 52}
```

---

### Fix 4: Generate Real Test Data
**Steps**:
1. Ensure PostHog mock data exists:
   ```bash
   cd touring-be
   node seed-posthog-mock-data.js
   # Should create 101 events in PostHogEvent collection
   ```

2. Run pipeline with proper connection:
   ```bash
   node jobs/weeklyProfileSync.js --mock
   # Should save 5 UserProfile documents
   ```

3. Verify data:
   ```javascript
   db.userprofiles.find({}).pretty()
   // Should show 5 profiles with vibeWeights, provinceWeights, etc.
   ```

---

### Fix 5: Controller Uses Real Data (Already Correct)
**File**: `touring-be/controller/recommendations.controller.js`

**Current (GOOD)**:
```javascript
exports.getProfileSummary = async (req, res) => {
  const userId = req.userId;
  const profile = await UserProfile.findOne({ userId }).lean(); // ✅ Reads from MongoDB
  
  if (!profile) {
    return res.status(404).json({ message: 'Profile not found' }); // ✅ Real 404
  }
  
  const topVibes = Object.entries(profile.vibeWeights || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // ✅ Real data from pipeline
    
  res.json({ summary, topVibes, topProvinces }); // ✅ Real response
};
```

**No changes needed** - controller already correct!

---

## 🚀 IMPLEMENTATION STEPS

### Step 1: Fix weeklyProfileSync Connection (CRITICAL)

**Option A: Use mainConn throughout**
```javascript
// weeklyProfileSync.js
const { mainConn } = require('../config/db');

// Define UserProfile on mainConn
const UserProfileSchema = require('../models/UserProfile').schema;
const UserProfileModel = mainConn.model('UserProfile', UserProfileSchema);

// In sync function
await UserProfileModel.findOneAndUpdate(...);
```

**Option B: Ensure UserProfile model uses mainConn**
```javascript
// models/UserProfile.js
const { mainConn } = require('../config/db');
module.exports = mainConn.model('UserProfile', UserProfileSchema);
```

**Recommendation**: **Option B** - Modify UserProfile model to use mainConn explicitly.

---

### Step 2: Increase Embedding Timeout
```javascript
// services/ai/libs/embedding-client.js
async function embed(texts) {
  return await fetchWithTimeout(`${EMBED_URL}/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts })
  }, 60000); // ✅ 60s
}

async function upsert(items) {
  return await fetchWithTimeout(`${EMBED_URL}/upsert`, {
    method: 'POST',
    body: JSON.stringify({ items })
  }, 90000); // ✅ 90s for FAISS upsert
}
```

---

### Step 3: Test End-to-End

#### 3.1 Verify AI Service
```bash
curl http://localhost:8088/healthz
curl http://localhost:8088/stats
```

#### 3.2 Run Pipeline
```bash
cd touring-be
node jobs/weeklyProfileSync.js --mock
```

**Expected Output**:
```
✅ Found 100 mock events
✅ Aggregated profiles for 5 users
✅ User 507f1f77bcf86cd799439011: Embedded (1024 dims)
✅ User 68fd7546efb1cb237e15ae25: Embedded (1024 dims)
✅ User 507f1f77bcf86cd799439012: Embedded (1024 dims)
✅ User 507f1f77bcf86cd799439013: Embedded (1024 dims)
✅ User 507f1f77bcf86cd799439014: Embedded (1024 dims)
✅ FAISS index updated: 5 vectors
👤 Users synced: 5
```

#### 3.3 Verify MongoDB
```bash
mongosh travelApp
db.userprofiles.countDocuments()  # Should return 5
db.userprofiles.findOne()         # Should show vibeWeights, provinceWeights
```

#### 3.4 Test API
```bash
# Get profile summary (replace with real user ID from UserProfile)
curl http://localhost:4000/api/recommendations/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 200 OK with topVibes, topProvinces, engagement level
```

#### 3.5 Test UI
1. Login to frontend: http://localhost:5173
2. Navigate to: `/recommendations/profile`
3. **Should see**: Discovery Wrapped with real data from UserProfile
4. **Should NOT see**: "Profile not found" error

---

## 📊 Verification Checklist

- [ ] UserProfile model uses `mainConn`
- [ ] weeklyProfileSync script uses correct connection
- [ ] AI service running on port 8088
- [ ] Embedding timeout increased to 60s
- [ ] Mock PostHog data seeded (101 events)
- [ ] Pipeline runs successfully (5/5 users synced)
- [ ] UserProfile collection has 5 documents
- [ ] FAISS index has 5 vectors
- [ ] API `/api/recommendations/profile` returns 200 OK
- [ ] UI `/recommendations/profile` displays real data
- [ ] UI `/recommendations/tours` shows personalized tours
- [ ] UI `/recommendations/itinerary` suggests itineraries

---

## 🎯 Expected Final State

### MongoDB Collection: `userprofiles`
```javascript
{
  _id: ObjectId("..."),
  userId: ObjectId("507f1f77bcf86cd799439011"),
  vibeWeights: Map {
    "Văn hóa" => 5.0,
    "Mạo hiểm" => 4.0,
    "Thiên nhiên" => 3.0,
    "Thư giãn" => 3.0,
    "Ẩm thực" => 3.0
  },
  provinceWeights: Map {
    "Phú Thọ" => 3.0,
    "Lào Cai" => 2.0,
    "Lâm Đồng" => 1.0
  },
  eventCounts: Map {
    "tour_view" => 12,
    "blog_view" => 5,
    "tour_bookmark" => 2,
    "tour_booking_complete" => 1
  },
  confidence: 0.85,
  travelStyle: "explorer",
  totalInteractions: 20,
  vectorId: "user:507f1f77bcf86cd799439011",
  lastSyncedAt: ISODate("2025-11-14T16:45:00.000Z"),
  createdAt: ISODate("2025-11-14T16:45:00.000Z"),
  updatedAt: ISODate("2025-11-14T16:45:00.000Z")
}
```

### FAISS Index Stats
```json
{
  "vectors": 5,
  "dimension": 1024,
  "index_type": "FLAT",
  "metadata": {
    "user:507f1f77bcf86cd799439011": {
      "type": "user_profile",
      "userId": "507f1f77bcf86cd799439011",
      "topVibes": ["Văn hóa", "Mạo hiểm", "Thiên nhiên"]
    },
    ...
  }
}
```

### API Response: GET /api/recommendations/profile
```json
{
  "summary": {
    "totalInteractions": 20,
    "travelStyle": "explorer",
    "engagementLevel": "Explorer",
    "confidence": 85,
    "lastUpdated": "2025-11-14T16:45:00.000Z"
  },
  "topVibes": [
    { "vibe": "Văn hóa", "score": 5.0 },
    { "vibe": "Mạo hiểm", "score": 4.0 },
    { "vibe": "Thiên nhiên", "score": 3.0 },
    { "vibe": "Thư giãn", "score": 3.0 },
    { "vibe": "Ẩm thực", "score": 3.0 }
  ],
  "topProvinces": [
    { "province": "Phú Thọ", "score": 3.0 },
    { "province": "Lào Cai", "score": 2.0 },
    { "province": "Lâm Đồng", "score": 1.0 }
  ],
  "eventBreakdown": {
    "tour_view": 12,
    "blog_view": 5,
    "tour_bookmark": 2,
    "tour_booking_complete": 1
  }
}
```

---

## 🔄 Pipeline Flow (Correct Implementation)

```
1. PostHogEvent Collection (MongoDB)
   ↓ weeklyProfileSync.js --mock
2. Event Fetcher (fetch 101 events)
   ↓ transformEvent()
3. Aggregator (group by user, apply weights)
   ↓ aggregateByUser()
4. Embedding Service (Vietnamese_Embedding_v2)
   ↓ POST /embed
5. FAISS Index (vector similarity)
   ↓ POST /upsert
6. UserProfile Collection (MongoDB - mainConn)
   ↓ findOneAndUpdate({ userId }, { vibeWeights, ... })
7. API Controller (recommendations.controller.js)
   ↓ UserProfile.findOne({ userId })
8. Frontend UI (DiscoveryWrapped.jsx)
   ↓ withAuth('/api/recommendations/profile')
9. User sees Discovery Wrapped with REAL DATA
```

---

## 🎬 NEXT ACTIONS

1. **Fix UserProfile model** to use mainConn (1 file change)
2. **Increase embedding timeout** to 60s (1 file change)
3. **Run pipeline** with --mock flag
4. **Verify data** in MongoDB userprofiles collection
5. **Test API** with real JWT token
6. **Test UI** at /recommendations/profile

**Estimated time**: 15-20 minutes to implement + test
**Priority**: CRITICAL - Without this, recommendations feature is 100% mock

---

## 📝 Files to Modify

1. `touring-be/models/UserProfile.js` - Add mainConn
2. `touring-be/services/ai/libs/embedding-client.js` - Increase timeout
3. `touring-be/jobs/weeklyProfileSync.js` - Already fixed connection logic

**Total changes**: 2 files, ~10 lines of code
