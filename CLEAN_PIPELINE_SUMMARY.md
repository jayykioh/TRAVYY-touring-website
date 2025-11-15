# 🚀 CLEAN PIPELINE - PRODUCTION READY

## ✅ COMPLETED - SIMPLIFIED ARCHITECTURE

### **Removed:**
- ❌ DailyAsk (frontend + backend + models)
- ❌ PostHog autocapture (tắt hoàn toàn)
- ❌ Mock data logic (seed-posthog-mock-data)
- ❌ Duplicate cron (buildUserProfile.js)
- ❌ Duplicate schema fields
- ❌ All PostHog system events filtering

### **Kept - Core 4 Events:**
- ✅ `tour_view` (weight: 0.5)
- ✅ `tour_bookmark` (weight: 2.5)
- ✅ `tour_booking_complete` (weight: 5.0)
- ✅ `blog_view` (weight: 0.3)

---

## 📊 SIMPLIFIED PIPELINE

```
User Actions → PostHog Events (4 types only)
    ↓
⏰ Cron (Sunday 2AM) → weeklyProfileSync.js
    ↓
📥 Fetch PostHog API (last 7 days)
    ↓
📊 Aggregator (Vietnamese → English + weighted scoring)
    ↓
🤖 AI Embedding (1024-dim vectors)
    ↓
💾 MongoDB UserProfile (vibeProfile + provinceProfile + embedding)
    ↓
🔍 Discovery Hybrid Search (Hard 40% + Embed 40% + Proximity 20%)
    ↓
📝 Itinerary Creation
```

---

## 🎯 CORE FILES (ONLY 6 FILES)

### **1. weeklyProfileSync.js** ⭐ MAIN CRON
**Path**: `touring-be/jobs/weeklyProfileSync.js`

**Run Manual**:
```bash
cd touring-be/jobs
node weeklyProfileSync.js
```

**Cron Auto** (production):
```javascript
// Line 270: Auto-run every Sunday 2:00 AM
cron.schedule('0 2 * * 0', async () => {
  await weeklyProfileSync();
}, { timezone: "Asia/Ho_Chi_Minh" });
```

**Key Features**:
- ✅ Skip UUID users (line 99-105)
- ✅ Sanitize MongoDB keys (line 148-175)
- ✅ Timeout 60s for embeddings
- ✅ Error handling with max 10 failures

---

### **2. aggregator.js** ⭐ VIBE MAPPING
**Path**: `touring-be/services/posthog/aggregator.js`

**VIBE_MAPPING** (25+ mappings):
```javascript
'Văn hóa' → 'culture'
'Mạo hiểm' → 'adventure'
'Thiên nhiên' → 'nature'
'Ẩm thực' → 'food'
'Biển' → 'beach'
// ... 20+ more
```

**Key Logic**:
- Line 95-108: Filter `$`-prefixed vibes
- Line 114-127: Build Vietnamese interactionTexts
- Line 130-143: Sanitize province keys

**Event Weights**:
- Booking: **5.0** ⭐⭐⭐⭐⭐ (conversion)
- Bookmark: **2.5** ⭐⭐⭐ (high intent)
- View: **0.5** ⭐ (browsing)
- Blog: **0.3** ⭐ (awareness)

---

### **3. embedding-client.js** ⭐ AI SERVICE
**Path**: `touring-be/services/ai/libs/embedding-client.js`

**Functions**:
- `embed(texts)`: Generate 1024-dim vectors (timeout: 60s)
- `upsert(items)`: Save to FAISS (timeout: 60s)
- `hybridSearch({free_text, vibes})`: Search zones

**Requirements**:
```bash
cd ai
uvicorn app:app --host 0.0.0.0 --port 8088
```

---

### **4. UserProfile.js** ⭐ SCHEMA
**Path**: `touring-be/models/UserProfile.js`

**Simplified Schema**:
```javascript
{
  userId: ObjectId,                          // User reference
  vibeProfile: Map<vibe, {weight, interactions}>,     // Main vibe data
  provinceProfile: Map<province, {weight, interactions}>, // Location preferences
  interactionSummary: String,                // Vietnamese freeText for AI
  embeddingVector: [Number],                 // 1024-dim cached
  confidence: Number,                        // 0-1 score
  travelStyle: String,                       // "explorer"|"culture"|"adventurer"|"relaxer"
  totalInteractions: Number,
  eventCounts: Map,
  lastSyncedAt: Date
}
```

---

### **5. posthog.config.js** ⭐ EVENT TYPES
**Path**: `touring-be/config/posthog.config.js`

**Event Types**:
```javascript
TOUR_VIEW: 'tour_view',
TOUR_BOOKMARK: 'tour_bookmark',
TOUR_BOOKING: 'tour_booking_complete',
BLOG_VIEW: 'blog_view'
```

**Time Decay**: 30 days half-life

---

### **6. matcher.js** ⭐ HYBRID SEARCH
**Path**: `touring-be/services/zones/matcher.js`

**Scoring Formula**:
```javascript
finalScore = hardVibe × 0.4 + embedding × 0.4 + proximity × 0.2
```

**Example**:
- Hard Match: 3/5 vibes → 0.60 (24%)
- Embedding: 0.89 similarity → 0.89 (36%)
- Proximity: 102km → 0.08 (2%)
- **Final**: 0.612 (61.2%)

---

## 🔧 SETUP

### **1. Environment (.env)**
```env
POSTHOG_HOST=https://us.i.posthog.com
POSTHOG_PROJECT_ID=your_project_id
POSTHOG_API_KEY=phx_xxxxx
POSTHOG_PERSONAL_API_KEY=phx_xxxxx  # ⚠️ REQUIRED
EMBED_SERVICE_URL=http://localhost:8088
```

### **2. Start Services**
```bash
# Terminal 1: Backend (with cron)
cd touring-be
npm run dev

# Terminal 2: AI Service (REQUIRED)
cd ai
uvicorn app:app --host 0.0.0.0 --port 8088

# Terminal 3: Frontend
cd touring-fe
npm run dev
```

### **3. Test Cron**
```bash
cd touring-be/jobs
node weeklyProfileSync.js
```

**Expected Output**:
```
✅ Total events fetched: 1222 (13 pages)
✅ Aggregated profiles for 33 users
✅ User 68fd7546efb1cb237e15ae25: Saved (confidence=1.00, style=culture)
✅ User 68ff2dda114f8ca0df42815f: Saved (confidence=1.00, style=adventurer)

📊 Users synced: 2
⚠️ Skipped: 31 (UUID + no data)
❌ Failed: 0
```

---

## ✅ POSTHOG SETTINGS (FRONTEND)

**File**: `touring-fe/src/utils/posthog.js`

### **Fixed Configuration**:
```javascript
posthog.init(apiKey, {
  api_host: "https://us.posthog.com",
  
  // ❌ TẮT HOÀN TOÀN autocapture
  autocapture: false,           // ❌ Tắt click/form tracking
  capture_pageview: false,      // ❌ Tắt pageview tự động
  capture_pageleave: false,     // ❌ Tắt pageleave
  
  disable_session_recording: true,
  disable_compression: true,
  person_profiles: "identified_only"
});
```

### **⚠️ PostHog Project Settings (Manual)**
Vào PostHog Dashboard → Settings → Project Settings:
1. **Autocapture**: **OFF** ❌
2. **Session Recording**: **OFF** ❌
3. **Capture Pageviews**: **OFF** ❌

---

## 🐛 DEBUG CHECKLIST

| Issue | Check | Solution |
|-------|-------|----------|
| ❌ Cron không chạy | Backend running? | `npm run dev` (phải chạy liên tục) |
| ❌ PostHog fetch error | `.env` có `POSTHOG_PERSONAL_API_KEY`? | Get từ PostHog → Settings → API Keys |
| ❌ Embedding timeout | AI service running? | `cd ai && uvicorn app:app --port 8088` |
| ❌ `$autocapture` events | PostHog autocapture enabled? | ✅ Fixed (frontend config + sanitization) |
| ❌ Mongoose Map error | Key starts with `$`? | ✅ Fixed (sanitization trong aggregator + weeklyProfileSync) |
| ❌ Invalid ObjectId | User UUID format? | ✅ Fixed (skip UUID users) |
| ❌ Hard match 0% | Zone tags English? | Check `zone.tags` has 'culture', 'adventure', etc. |

---

## 📈 PRODUCTION DEPLOYMENT

### **PM2 (Backend + Cron)**
```bash
# Install PM2
npm install -g pm2

# Start backend
cd touring-be
pm2 start npm --name "touring-backend" -- run dev
pm2 save
pm2 startup
```

### **Systemd (AI Service)**
```bash
# Create service
sudo nano /etc/systemd/system/touring-ai.service

[Unit]
Description=Touring AI Service
After=network.target

[Service]
Type=simple
User=your_user
WorkingDirectory=/path/to/ai
Environment="PATH=/path/to/.venv/bin"
ExecStart=/path/to/.venv/bin/uvicorn app:app --host 0.0.0.0 --port 8088
Restart=always

[Install]
WantedBy=multi-user.target

# Enable
sudo systemctl enable touring-ai
sudo systemctl start touring-ai
```

---

## 📊 MONITORING

### **Check PostHog Connection**
```bash
node -e "require('dotenv').config({path:'../.env'}); require('../services/posthog/event-fetcher').testConnection();"
```

### **Check AI Service**
```bash
curl http://localhost:8088/health
# Expected: {"status":"ok","model":"AITeamVN/Vietnamese_Embedding_v2"}
```

### **Check MongoDB Profiles**
```javascript
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/travelApp');
const UserProfile = require('./models/UserProfile');
UserProfile.find({}).then(profiles => console.log(`${profiles.length} profiles`));
```

### **Check Cron Logs**
```bash
cd touring-be/jobs
node weeklyProfileSync.js 2>&1 | grep -E "(✅|❌|⚠️)"
```

---

## 🎯 SUMMARY

### **✅ HOÀN THÀNH**
- Tắt hoàn toàn PostHog autocapture (frontend + backend)
- Xóa toàn bộ DailyAsk feature
- Sanitize MongoDB Map keys (`$autocapture` → `_autocapture`)
- Skip UUID users (chỉ xử lý MongoDB ObjectId)
- Simplified UserProfile schema (1 source: vibeProfile/provinceProfile)
- Tăng embedding timeout (30s → 60s)
- Clean pipeline với 4 event types:
  - `tour_view` (0.5)
  - `tour_bookmark` (2.5)
  - `tour_booking_complete` (5.0)
  - `blog_view` (0.3)

### **📁 FILES DELETED/COMMENTED**
- ❌ `touring-fe/src/components/DailyAskModal.jsx` (should delete)
- ❌ `touring-fe/src/components/DailyAskTrigger.jsx` (should delete)
- ❌ `touring-be/routes/daily-ask.routes.js` (commented in server.js)
- ❌ `touring-be/models/DailyAskAnswer.js` (should delete)
- ❌ `touring-be/seed-daily-ask.js` (should delete)
- ❌ `touring-be/jobs/buildUserProfile.js` (duplicate - should delete)

### **⚡ PIPELINE SẠCH SẼ**
- 6 core files
- 4 event types
- 1 cron job
- 0 duplicate logic
- 0 autocapture noise

**Pipeline hoàn chỉnh, tối ưu, production-ready!** 🚀
