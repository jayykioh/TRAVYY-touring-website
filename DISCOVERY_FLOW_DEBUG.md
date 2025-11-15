# 🔄 DISCOVERY WRAPPED → ITINERARY FLOW

## ✅ FIXES APPLIED

### **Fix #1: MongoDB Connection** (RESOLVED ✅)
- **Before**: Cron job used hardcoded `LOCAL_MONGO_URI` (127.0.0.1:27017)
- **After**: Now uses `MONGO_URI` from `.env` (MongoDB Atlas)
- **Result**: ✅ 4 users synced successfully to Atlas (2025-11-15 08:40:39)

### **Fix #2: Frontend Route** (RESOLVED ✅)
- **Before**: Navigate to `/vi-doi` (vibe selection page)
- **After**: Navigate to `/intinerary-creator` (direct itinerary creation)
- **Result**: ✅ Empty profile users can now create itinerary directly

---

## 📊 COMPLETE WORKFLOW - POSTHOG → ATLAS → FRONTEND

```
┌─────────────────────────────────────────────────────────────────┐
│                  USER INTERACTIONS (Frontend)                   │
│  - View tours → tour_view                                       │
│  - Bookmark tours → tour_bookmark                               │
│  - Complete booking → tour_booking_complete                     │
│  - Read blogs → blog_view, blog_read_complete                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              POSTHOG ANALYTICS (us.posthog.com)                 │
│  Project ID: 249196                                             │
│  API Key: phc_N7jl9t4aTB8zhYhRzh0wWUxRxTcTnRu8O7hTwAj39ds      │
│  Current Events: 1302 events, 36 users                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│            CRON JOB: weeklyProfileSync.js                       │
│  Runs: Every 7 days (or manual: node jobs/weeklyProfileSync.js)│
│  Connection: MongoDB Atlas (from .env MONGO_URI)                │
│  Database: adnparr.txryiq9.mongodb.net/travelApp                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
              ┌───────────────────────────┐
              │  Process Each User:       │
              │  1. Fetch events (7 days) │
              │  2. Aggregate vibes       │
              │  3. Calculate confidence  │
              │  4. Determine travelStyle │
              └───────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│          MONGODB ATLAS: UserProfiles Collection                 │
│  Connection: mongodb+srv://hoangnguyennick_db_user@adnparr...   │
│  Database: travelApp                                            │
│  Collection: userprofiles                                       │
│                                                                 │
│  Synced Users (4):                                              │
│  - 68fd7546: culture, confidence=1.00, 723 interactions         │
│  - 68ff2dda: adventurer, confidence=1.00, 328 interactions      │
│  - 6918327f: culture, confidence=0.58, 15 interactions          │
│  - 68fd75a5: culture, confidence=0.32, 13 interactions          │
│                                                                 │
│  Skipped Users (32):                                            │
│  - Test users (test_user, test_user_1, etc.)                    │
│  - UUID users (019a8684-d822-795c-90c1-..., etc.)               │
│  - Invalid ObjectId formats                                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│            BACKEND API: recommendations.controller.js            │
│  Route: GET /api/recommendations/profile                        │
│  Connection: Same Atlas DB (from config/db.js)                  │
│  Model: UserProfile                                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────┐
                    │  Profile Found? │
                    └─────────────────┘
                    ↙              ↘
              YES                    NO
                ↓                      ↓
┌────────────────────────┐   ┌────────────────────────┐
│ Return Profile Data:   │   │ Return Empty Profile:  │
│ {                      │   │ {                      │
│   summary: {           │   │   summary: {           │
│     totalInteractions, │   │     totalInteractions:0│
│     confidence,        │   │     confidence: 0,     │
│     travelStyle        │   │     travelStyle: null  │
│   },                   │   │   },                   │
│   topVibes: [...],     │   │   topVibes: [],        │
│   topProvinces: [...], │   │   topProvinces: [],    │
│   raw: {...}           │   │   isNewUser: true      │
│ }                      │   │ }                      │
└────────────────────────┘   └────────────────────────┘
                ↓                      ↓
┌────────────────────────┐   ┌────────────────────────┐
│ FRONTEND:              │   │ FRONTEND:              │
│ /recommendations/      │   │ /recommendations/      │
│ wrapped                │   │ wrapped                │
│                        │   │                        │
│ Show 5 Slides:         │   │ Show 2 Slides:         │
│ 1. IntroSlide          │   │ 1. IntroSlide          │
│ 2. StatsSlide          │   │ 2. EmptyProfileSlide   │
│ 3. VibesSlide          │   │    with CTA button     │
│ 4. ProvincesSlide      │   │                        │
│ 5. CTASlide            │   │                        │
└────────────────────────┘   └────────────────────────┘
                ↓                      ↓
┌────────────────────────┐   ┌────────────────────────┐
│ User clicks:           │   │ User clicks:           │
│ "Tìm lịch trình ngay" │   │ "Chọn sở thích ngay"  │
└────────────────────────┘   └────────────────────────┘
                ↓                      ↓
                ↓              ┌────────────────────────┐
                ↓              │ Navigate:              │
                ↓              │ /intinerary-creator    │
                ↓              │ (Direct itinerary)     │
                ↓              └────────────────────────┘
                ↓                      ↓
                └──────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│       Navigate to: /discover-results                            │
│       State: { vibes, freeText, profile, fromWrapped: true }    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│       DiscoverResults Component                                 │
│       POST /api/zones/hybrid-search                             │
│       Body: { vibes, freeText, userLocation }                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│       Backend: Hybrid Search Algorithm                          │
│       1. Hard Match (40%): Exact vibe matching                  │
│       2. Embedding Search (40%): AI semantic similarity         │
│       3. Proximity (20%): Geographic distance                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│       Return Ranked Zones:                                      │
│       [                                                         │
│         { name, province, vibes, score: 0.85 },                 │
│         { name, province, vibes, score: 0.78 },                 │
│         ...                                                     │
│       ]                                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│       User Selects Zones → Add to Itinerary                     │
│       Navigate to: /intinerary-creator with selected zones      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗃️ DATABASE STRUCTURE

### **Collection: userprofiles**
```javascript
{
  _id: ObjectId("68fd7546efb1cb237e15ae25"),
  userId: "68fd7546efb1cb237e15ae25",
  summary: {
    totalInteractions: 723,
    confidence: 1.00,
    travelStyle: "culture"  // culture | adventurer | relaxer | explorer
  },
  vibeProfile: [
    { vibe: "nature", weight: 15.5, interactions: 50 },
    { vibe: "relaxation", weight: 12.0, interactions: 40 },
    { vibe: "culture", weight: 10.5, interactions: 35 }
  ],
  topVibes: [
    { vibe: "nature", score: 15.5 },
    { vibe: "relaxation", score: 12.0 },
    { vibe: "culture", score: 10.5 }
  ],
  topProvinces: [
    { province: "Lâm Đồng", interactions: 25 },
    { province: "Ninh Bình", interactions: 20 }
  ],
  raw: {
    interactionSummary: "xem tour Hạ Long, lưu tour Sapa, tham quan phố cổ...",
    interactionTexts: ["nature", "relaxation", "culture", "đi xích lô phố cổ", ...]
  },
  lastSyncedAt: ISODate("2025-11-15T08:40:39.169Z"),
  createdAt: ISODate("2025-11-15T03:48:47.000Z"),
  updatedAt: ISODate("2025-11-15T08:40:39.169Z")
}
```

---

## 🔧 CONFIGURATION FILES

### **touring-be/.env**
```env
# MongoDB Atlas Connection
MONGO_URI=mongodb+srv://hoangnguyennick_db_user:myPass1234@adnparr.txryiq9.mongodb.net/travelApp?retryWrites=true&w=majority

# PostHog Analytics
POSTHOG_API_KEY=phc_N7jl9t4aTB8zhYhRzh0wWUxRxTcTnRu8O7hTwAj39ds
POSTHOG_HOST=https://us.posthog.com
POSTHOG_PROJECT_ID=249196
POSTHOG_PERSONAL_API_KEY=phx_NsG4FOhgmPfJdWzO8oYboZvRBhvhKaw0NbZTTEW7pxCj40Y
```

### **touring-be/config/db.js**
```javascript
const MAIN_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/travelApp";
const mainConn = mongoose.createConnection(MAIN_URI);
```

### **touring-be/jobs/weeklyProfileSync.js**
```javascript
// Uses MONGO_URI from .env (Atlas connection)
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/travelApp';
const mainConn = mongoose.createConnection(MONGO_URI);
```

---

## 📝 SYNC STATISTICS (Latest Run: 2025-11-15 08:40:39)

```
✅ Duration: 95.74s
📊 Events processed: 1302 events
👤 Total users: 36 users
✅ Synced successfully: 4 users
⚠️  Skipped (invalid): 32 users
❌ Failed: 0 users

Synced Users:
- 68fd7546: culture, confidence=1.00, 723 interactions
- 68ff2dda: adventurer, confidence=1.00, 328 interactions  
- 6918327f: culture, confidence=0.58, 15 interactions
- 68fd75a5: culture, confidence=0.32, 13 interactions

Skipped Users:
- test_user* (test accounts)
- 019a8684-* (UUID format, không phải ObjectId)
- 69045125f26db599eadfc830 (no interactions)
```

---

## ✅ TESTING CHECKLIST

- [x] Backend connects to Atlas (not Local)
- [x] Cron job syncs to Atlas successfully
- [x] 4 real users synced with correct data structure
- [x] Frontend route fixed: empty profile → /intinerary-creator
- [x] API returns empty profile for new users (no 404)
- [ ] **TODO**: Test frontend flow end-to-end
- [ ] **TODO**: Verify /discover-results shows zones correctly
- [ ] **TODO**: Test itinerary creation from zones

---

## 🎯 NEXT STEPS

1. **Test Frontend Flow**:
   - Login as user `68fd7546` (has profile data)
   - Navigate to `/recommendations/wrapped`
   - Verify 5 slides display correctly
   - Click "Tìm lịch trình ngay" → Check `/discover-results` works

2. **Test Empty Profile Flow**:
   - Login as new user (no profile)
   - Navigate to `/recommendations/wrapped`  
   - Verify EmptyProfileSlide displays
   - Click button → Should route to `/intinerary-creator`

3. **Monitor Cron Job**:
   - Run weekly or manually: `node jobs/weeklyProfileSync.js`
   - Check MongoDB Atlas dashboard for new profiles
   - Verify sync logs show Atlas connection

---

## 🐛 KNOWN ISSUES (RESOLVED)

### ~~Issue #1: MongoDB Connection Mismatch~~ ✅ FIXED
- **Status**: RESOLVED
- **Fix**: Updated `weeklyProfileSync.js` to use `MONGO_URI` from `.env`
- **Commit**: Line 268-275 in weeklyProfileSync.js

### ~~Issue #2: Frontend Route Typo~~ ✅ FIXED
- **Status**: RESOLVED  
- **Fix**: Changed `/vi-doi` → `/intinerary-creator` in DiscoveryWrappedNew.jsx
- **Commit**: Line 85 in DiscoveryWrappedNew.jsx

### ~~Issue #3: 32 Test Users Skipped~~ ℹ️ EXPECTED BEHAVIOR
- **Status**: NOT A BUG
- **Reason**: PostHog tracks test events with UUID/string userIds
- **Solution**: Filter out invalid ObjectId formats (already implemented)

---

## 📚 RELATED DOCUMENTATION

- `AI_RECOMMENDATION_SETUP.md` - AI pipeline architecture
- `POSTHOG_SETUP_GUIDE.md` - PostHog integration guide
- `FINAL_PIPELINE_ARCHITECTURE.md` - Complete system design
- `TESTING_GUIDE.md` - End-to-end testing procedures
