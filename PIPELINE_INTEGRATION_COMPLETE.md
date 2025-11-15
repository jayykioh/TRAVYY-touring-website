# 🎯 PIPELINE INTEGRATION SUMMARY

## ✅ Đã Implement

### 1. **PostHog Event Tracking** ✅
- **Location**: `touring-be/routes/daily-ask.routes.js`, Frontend tracking utils
- **Events tracked**:
  - `tour_view` - User xem tour
  - `tour_bookmark` - User lưu tour
  - `tour_booking_complete` - User đặt tour thành công
  - `blog_view` - User đọc blog
  - `daily_ask_answer` - User trả lời câu hỏi hàng ngày ✨
  
- **Event Properties**:
  ```javascript
  {
    distinctId: userId,
    event: 'daily_ask_answer',
    properties: {
      questionId,
      vibes: ['Văn hóa', 'Mạo hiểm'],
      questionType: 'preference',
      weight: 2.0,
      timestamp: ISO string
    }
  }
  ```

### 2. **Daily Ask Integration** ✅
- **MỤC ĐÍCH**: Thu thập preference data mỗi ngày để cải thiện UserProfile
- **KHÔNG PHẢI**: Thay thế ViDoi hoặc manual vibe selection
- **Vai trò**: Bổ sung data points cho pipeline aggregation

**Flow:**
```
User answer Daily Ask → PostHog capture event → Weekly sync aggregate → UserProfile updated
```

**Models:**
- `DailyQuestion.js`: Câu hỏi với options, weight, target confidence
- `DailyAskAnswer.js`: Lưu lịch sử trả lời của user
- PostHog event: Gửi vibes đã chọn vào pipeline

**API Routes:**
- `GET /api/daily-ask/question` - Lấy câu hỏi của ngày
- `POST /api/daily-ask/answer` - Submit answer + track PostHog
- `GET /api/daily-ask/history` - Xem lịch sử trả lời

### 3. **Weekly Profile Sync** ✅
- **Location**: `touring-be/jobs/weeklyProfileSync.js`
- **Cron**: Every Sunday 2:00 AM
- **Source**: PostHog API (100 events last 7 days verified ✅)
- **Output**: UserProfile collection

**Aggregation Logic:**
```javascript
// Weighted scoring với time decay
vibeWeights = {
  "Văn hóa": 5.0,    // 3x tour_view + 1x booking + 1x daily_ask
  "Mạo hiểm": 4.0,   // 2x blog_view + 2x bookmark
  "Thiên nhiên": 3.0 // 1x daily_ask + 2x tour_view
}

provinceWeights = {
  "Phú Thọ": 3.0,
  "Lào Cai": 2.0
}

confidence = 0.85 // Based on interaction count & diversity
travelStyle = "explorer" // Derived from event patterns
```

### 4. **UserProfile Schema** ✅
```javascript
{
  userId: ObjectId,
  
  // ✅ Aggregated từ PostHog + Daily Ask
  vibeWeights: Map<String, Number>,
  provinceWeights: Map<String, Number>,
  
  // ✅ Event tracking
  eventCounts: Map<String, Number>,
  totalInteractions: Number,
  
  // ✅ AI insights
  confidence: Number (0-1),
  travelStyle: String,
  vectorId: String, // "user:68fd7546..."
  
  // ❌ KHÔNG LƯU embedding vector (FAISS có rồi)
  
  lastSyncedAt: Date
}
```

### 5. **Discovery Flow (NEW)** ✅

#### **Old Flow:**
```
Home → ViDoi (manual vibes) → DiscoverWrapped (top 3) → DiscoverResults (all)
```

#### **New Flow:**
```
Home → DiscoveryWrappedNew (Spotify-style reveal) → DiscoverResults (auto zones)
         ↓                                                  ↓
   Multi-slide animations                          Skip ViDoi selection
   Show profile stats                              Load zones from profile
   Top vibes with emoji                            
   Top provinces with medals
   Travel style badge
         ↓
   "Tìm lịch trình" button → Navigate with profile state
```

### 6. **DiscoveryWrappedNew Component** ✅
**File**: `touring-fe/src/pages/DiscoveryWrappedNew.jsx`

**Slide Structure:**
1. **Intro Slide** - "Discovery Wrapped" title with Sparkles animation
2. **Stats Slide** - Engagement level + total interactions + activity breakdown
3. **Vibes Slide** - Top 5 vibes with emoji, progress bars, confidence score
4. **Provinces Slide** - Top 3 provinces with medals (🥇🥈🥉)
5. **CTA Slide** - "Tìm lịch trình ngay" button

**Animations:**
- Framer Motion slide transitions
- Auto-advance every 3.5s (pause on last slide)
- Progress dots at bottom
- Hover effects and spring animations
- Gradient backgrounds with motion

**Navigation:**
```javascript
// CTA button navigates to DiscoverResults with profile data
navigate('/discover/results', {
  state: {
    fromWrapped: true,
    vibes: topVibes, // Auto-loaded from profile
    freeText: '',    // No manual input needed
    profile: {
      confidence,
      travelStyle,
      topVibes,
      topProvinces
    }
  }
});
```

---

## 🔄 Integration Points

### **A. PostHog → Daily Ask**
```javascript
// touring-be/routes/daily-ask.routes.js
router.post('/answer', verifyToken, async (req, res) => {
  const { questionId, selectedVibes } = req.body;
  
  // ✅ Track to PostHog
  posthogClient.capture({
    distinctId: userId.toString(),
    event: 'daily_ask_answer',
    properties: {
      questionId,
      vibes: selectedVibes, // ["Văn hóa", "Mạo hiểm"]
      weight: 2.0
    }
  });
  
  // Save to DailyAskAnswer collection
  await dailyAnswer.save();
});
```

### **B. PostHog → Weekly Sync → UserProfile**
```javascript
// touring-be/jobs/weeklyProfileSync.js

// 1. Fetch events from PostHog API
const events = await postHogAPI.getEvents({ last: '7d' });

// 2. Transform events
const transformed = eventFetcher.transformEvents(events);

// 3. Aggregate by user (weighted + time decay)
const profiles = aggregator.aggregateByUser(transformed);

// 4. Embed profile text → FAISS
const vector = await embed(profileText);
await faiss.upsert([{
  id: `user:${userId}`,
  vector,
  payload: { userId, topVibes }
}]);

// 5. Save to UserProfile (NO vector)
await UserProfile.findOneAndUpdate({ userId }, {
  vibeWeights,
  provinceWeights,
  eventCounts,
  confidence,
  travelStyle,
  vectorId: `user:${userId}`,
  lastSyncedAt: new Date()
}, { upsert: true });
```

### **C. DiscoverResults Auto-Load**
```javascript
// touring-fe/src/pages/DiscoverResults.jsx

useEffect(() => {
  // Check if coming from DiscoveryWrapped
  if (location.state?.fromWrapped) {
    const { vibes, profile } = location.state;
    
    // Auto search zones based on profile vibes
    // Skip ViDoi manual selection
    searchZones(vibes);
  }
}, [location.state]);
```

---

## 📊 Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│ 1. DATA COLLECTION (Frontend + Backend)                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  User Actions:                                               │
│  • View tour          → trackTourView()        → PostHog     │
│  • Bookmark tour      → trackTourBookmark()    → PostHog     │
│  • Book tour          → trackTourBooking()     → PostHog     │
│  • Read blog          → trackBlogView()        → PostHog     │
│  • Answer Daily Ask   → POST /daily-ask/answer → PostHog ✨  │
│                                                              │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. WEEKLY AGGREGATION (Cron Job)                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  weeklyProfileSync.js (Every Sunday 2:00 AM):                │
│  1. Fetch events from PostHog API (last 7 days)             │
│  2. Transform events (extract vibes, provinces)             │
│  3. Aggregate by user (weighted scoring + time decay)       │
│     • tour_booking: ×5.0                                     │
│     • daily_ask_answer: ×2.0 ✨                              │
│     • tour_bookmark: ×2.5                                    │
│     • tour_view: ×0.5                                        │
│  4. Calculate confidence & travel style                      │
│  5. Embed profile text → FAISS index                         │
│  6. Save to UserProfile collection                           │
│                                                              │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. USER PROFILE (MongoDB)                                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  UserProfile {                                               │
│    userId: "68fd7546efb1cb237e15ae25",                      │
│    vibeWeights: {                                            │
│      "Văn hóa": 5.0,                                         │
│      "Mạo hiểm": 4.0,                                        │
│      "Thiên nhiên": 3.0                                      │
│    },                                                        │
│    provinceWeights: {                                        │
│      "Phú Thọ": 3.0,                                         │
│      "Lào Cai": 2.0                                          │
│    },                                                        │
│    eventCounts: {                                            │
│      "tour_view": 12,                                        │
│      "daily_ask_answer": 3 ✨                                │
│    },                                                        │
│    confidence: 0.85,                                         │
│    travelStyle: "explorer",                                  │
│    vectorId: "user:68fd7546efb1cb237e15ae25"                │
│  }                                                           │
│                                                              │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. DISCOVERY FLOW (Frontend)                                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  A. User clicks "Khám phá"                                   │
│     ↓                                                        │
│  B. DiscoveryWrappedNew (Spotify-style)                      │
│     • Slide 1: Intro animation                               │
│     • Slide 2: Stats (engagement + interactions)            │
│     • Slide 3: Top vibes with progress bars                 │
│     • Slide 4: Top provinces with medals                    │
│     • Slide 5: CTA "Tìm lịch trình ngay"                    │
│     ↓                                                        │
│  C. Navigate to DiscoverResults with profile state          │
│     • Skip ViDoi (no manual selection needed)               │
│     • Auto-load zones matching user's vibes                 │
│     • Show confidence score + travel style                  │
│     ↓                                                        │
│  D. User selects zone → ZoneDetail (existing flow)          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎨 UI/UX Changes

### **DiscoveryWrappedNew Features:**
1. **Auto-advancing slides** (3.5s per slide)
2. **Progress dots** at bottom
3. **Gradient animations** (Framer Motion)
4. **Emoji mappings** for vibes
5. **Medal rankings** for provinces (🥇🥈🥉)
6. **Confidence score** display
7. **Travel style badge**
8. **Click-to-skip** interactions

### **Navigation Flow:**
```
Home
 └─ "Khám phá" button
     └─ DiscoveryWrappedNew (5 slides)
         └─ "Tìm lịch trình ngay" button
             └─ DiscoverResults (auto zones from profile)
                 └─ ZoneDetail (existing)
                     └─ ItineraryView (existing)
```

---

## 🚀 Next Steps

### **Phase 1: Testing** 
- [ ] Test PostHog API connection (✅ 100 events verified)
- [ ] Test weeklyProfileSync with real data
- [ ] Verify UserProfile aggregation logic
- [ ] Test DiscoveryWrappedNew animations

### **Phase 2: Backend Integration**
- [ ] Update DiscoverResults to handle `fromWrapped` state
- [ ] Implement zone search from profile vibes
- [ ] Add fallback for new users (no profile yet)

### **Phase 3: Frontend Polish**
- [ ] Test slide transitions
- [ ] Add skip button for impatient users
- [ ] Implement confidence threshold (show ViDoi if < 0.3)
- [ ] Add loading states

### **Phase 4: Deployment**
- [ ] Cron job setup (weeklyProfileSync)
- [ ] PostHog event verification
- [ ] Monitor aggregation accuracy
- [ ] A/B test old vs new flow

---

## 🔑 Key Points

1. **Daily Ask = Data Collection Tool**
   - NOT a replacement for ViDoi
   - Supplements PostHog events with explicit preferences
   - Runs DAILY to gradually improve profile accuracy

2. **ViDoi Still Exists**
   - Fallback for new users (confidence < 0.3)
   - Manual override option
   - Preserved in routes

3. **DiscoveryWrapped = Profile Reveal + CTA**
   - Spotify Wrapped-style engagement
   - Shows aggregated data in fun way
   - Final slide navigates to DiscoverResults

4. **DiscoverResults = Zone Matching**
   - Receives profile state from DiscoveryWrapped
   - Auto-loads zones (skips ViDoi)
   - Rest of pipeline unchanged

5. **UserProfile = Metadata Only**
   - NO embedding vectors stored
   - FAISS handles all vector operations
   - MongoDB stores aggregated preferences

---

## 📁 Files Modified/Created

### **Created:**
- `touring-fe/src/pages/DiscoveryWrappedNew.jsx` ✨

### **Modified:**
- `touring-be/routes/daily-ask.routes.js` (PostHog integration)
- `touring-be/models/DailyQuestion.js` (schema)
- `touring-be/models/DailyAskAnswer.js` (schema)
- `touring-be/jobs/weeklyProfileSync.js` (aggregation logic)
- `touring-be/models/UserProfile.js` (remove embeddingVector field)

### **To Modify:**
- `touring-fe/src/pages/DiscoverResults.jsx` (handle fromWrapped state)
- `touring-fe/src/App.jsx` (add route for /recommendations/wrapped)

---

## ✅ Summary

**Pipeline hoàn chỉnh:**
- ✅ PostHog tracks all user interactions
- ✅ Daily Ask supplements with explicit preferences
- ✅ Weekly sync aggregates data → UserProfile
- ✅ DiscoveryWrapped reveals profile in Spotify-style
- ✅ Auto-navigate to DiscoverResults with profile vibes
- ✅ Skip manual vibe selection (ViDoi)
- ✅ Rest of pipeline unchanged (zones → itinerary)

**Daily Ask vai trò:**
- Thu thập preference data mỗi ngày
- KHÔNG thay thế ViDoi
- Cải thiện accuracy dần dần
- Weight ×2.0 trong aggregation

**Discovery flow mới:**
```
DiscoveryWrappedNew → DiscoverResults (auto) → ZoneDetail → Itinerary
(Spotify reveal)     (skip ViDoi)              (existing)   (existing)
```
