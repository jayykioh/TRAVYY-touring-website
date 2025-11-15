# 🚀 NEXT STEPS IMPLEMENTATION GUIDE

## ✅ Completed

### 1. **Routes Added**
- ✅ Frontend: `/recommendations/wrapped` → `DiscoveryWrappedNew`
- ✅ Backend: `/api/recommendations` (already exists)
- ✅ Backend: `/api/discover/parse` (reused from old pipeline)
- ✅ Backend: `/api/daily-ask` (already exists)

### 2. **DiscoveryWrappedNew Component** ✅
- Location: `touring-fe/src/pages/DiscoveryWrappedNew.jsx`
- Features:
  - 5-slide Spotify Wrapped-style reveal
  - Auto-advance animations
  - Profile stats display
  - CTA button navigates to DiscoverResults

### 3. **DiscoverResults Updated** ✅
- Added `autoSearchFromProfile()` function
- Handles `fromWrapped` state from DiscoveryWrappedNew
- Auto-calls `/api/discover/parse` with profile vibes
- Skips manual ViDoi selection
- Reuses existing zone matching logic

---

## 🔄 Complete User Flow

### **New AI-Powered Flow:**
```
1. User navigates to /recommendations/wrapped
   ↓
2. DiscoveryWrappedNew loads profile from /api/recommendations/profile
   ↓
3. 5 slides reveal:
   - Intro (Discovery Wrapped)
   - Stats (Engagement + Interactions)
   - Vibes (Top 5 with progress bars)
   - Provinces (Top 3 with medals)
   - CTA ("Tìm lịch trình ngay")
   ↓
4. User clicks CTA → navigate('/discover/results', { fromWrapped: true, vibes, profile })
   ↓
5. DiscoverResults detects fromWrapped=true
   ↓
6. Auto-calls POST /api/discover/parse with { vibes, freeText: '' }
   ↓
7. Backend matcher.js runs:
   - Embedding search (if freeText)
   - Hybrid vibe matching
   - Distance scoring
   - Returns sorted zones
   ↓
8. DiscoverResults displays zones (grouped by province)
   ↓
9. User selects zone → /zone/:zoneId (existing flow)
   ↓
10. User adds POIs → Itinerary (existing flow)
```

### **Old Manual Flow (Still Works):**
```
1. User navigates to /vi-doi
   ↓
2. ViDoi page - Manual vibe selection + free text
   ↓
3. Submit → POST /api/discover/parse
   ↓
4. DiscoverResults displays zones
   ↓
5. Rest of flow same as above
```

---

## 📊 API Endpoints Used

### **Profile Endpoints** (NEW)
```javascript
// Get user's AI profile
GET /api/recommendations/profile
Headers: { Authorization: "Bearer <token>" }
Response: {
  summary: {
    totalInteractions: 20,
    travelStyle: "explorer",
    engagementLevel: "Explorer",
    confidence: 85,
    lastUpdated: "2025-11-15T..."
  },
  topVibes: [
    { vibe: "Văn hóa", score: 5.0 },
    { vibe: "Mạo hiểm", score: 4.0 }
  ],
  topProvinces: [
    { province: "Phú Thọ", score: 3.0 }
  ],
  eventBreakdown: {
    "tour_view": 12,
    "daily_ask_answer": 3
  }
}
```

### **Discovery Endpoint** (REUSED)
```javascript
// Search zones by vibes (works for both manual and AI flow)
POST /api/discover/parse
Headers: { Authorization: "Bearer <token>" }
Body: {
  vibes: ["Văn hóa", "Mạo hiểm", "Thiên nhiên"],
  freeText: "",
  userLocation: null
}
Response: {
  ok: true,
  zones: [
    {
      id: "da-nang-son-tra",
      name: "Bán đảo Sơn Trà",
      province: "Đà Nẵng",
      vibes: ["Thiên nhiên", "Nhiếp ảnh"],
      finalScore: 0.856,
      matchReasons: [...]
    }
  ],
  byProvince: {
    "Đà Nẵng": [...]
  }
}
```

### **Daily Ask Endpoints** (EXISTING)
```javascript
// Get today's question
GET /api/daily-ask/question
Response: {
  alreadyAnswered: false,
  questionId: "q1",
  questionText: "Bạn thích loại hình du lịch nào?",
  vibes: ["Văn hóa", "Mạo hiểm", "Thư giãn"],
  questionType: "vibes"
}

// Submit answer
POST /api/daily-ask/answer
Body: {
  questionId: "q1",
  selectedVibes: ["Văn hóa", "Mạo hiểm"]
}
Response: {
  success: true,
  message: "Answer saved!",
  weight: 2.0
}
```

---

## 🎯 Integration Points

### **A. Home Page → DiscoveryWrapped**
**Where to add:**
- `touring-fe/src/pages/MainHome.jsx` or `LandingPage.jsx`
- Navigation bar
- Hero section CTA

**Example Button:**
```jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/context';

function HeroCTA() {
  const navigate = useNavigate();
  const { isAuth } = useAuth();
  
  const handleDiscover = () => {
    if (!isAuth) {
      navigate('/login', { state: { from: '/recommendations/wrapped' } });
    } else {
      navigate('/recommendations/wrapped');
    }
  };
  
  return (
    <button
      onClick={handleDiscover}
      className="bg-[#02A0AA] text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-[#028a94] transition-colors"
    >
      🎯 Khám phá dành riêng cho bạn
    </button>
  );
}
```

### **B. Navigation Menu**
**Where to add:**
- `touring-fe/src/layout/MainLayout.jsx` or header component

**Example Menu Item:**
```jsx
<nav>
  {isAuth && (
    <Link
      to="/recommendations/wrapped"
      className="flex items-center gap-2 text-slate-700 hover:text-[#02A0AA] transition-colors"
    >
      <Sparkles className="w-4 h-4" />
      <span>Khám phá AI</span>
    </Link>
  )}
</nav>
```

### **C. Profile Page → DiscoveryWrapped**
**Where to add:**
- `touring-fe/src/pages/UserProfile.jsx` or profile dashboard

**Example Widget:**
```jsx
function ProfileWidget() {
  const navigate = useNavigate();
  
  return (
    <div className="bg-linear-to-r from-[#02A0AA]/10 to-cyan-100/50 rounded-2xl p-6 border border-[#02A0AA]/20">
      <h3 className="text-xl font-bold text-slate-900 mb-2">
        Hành trình của bạn
      </h3>
      <p className="text-slate-600 mb-4">
        Xem tổng kết hoạt động và gợi ý cá nhân hóa
      </p>
      <button
        onClick={() => navigate('/recommendations/wrapped')}
        className="bg-[#02A0AA] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#028a94] transition-colors"
      >
        Xem Discovery Wrapped
      </button>
    </div>
  );
}
```

---

## 🧪 Testing Checklist

### **Phase 1: Profile Data**
- [ ] Login as user
- [ ] Check `/api/recommendations/profile` returns data
- [ ] Verify topVibes array has items
- [ ] Verify confidence > 0
- [ ] Check eventBreakdown has counts

**If profile empty:**
- Run `node jobs/weeklyProfileSync.js --mock` to generate test data
- Or wait for cron job (Sunday 2:00 AM)
- Or manually answer Daily Ask questions

### **Phase 2: DiscoveryWrapped**
- [ ] Navigate to `/recommendations/wrapped`
- [ ] Verify 5 slides appear
- [ ] Check auto-advance works (3.5s each)
- [ ] Verify stats display correctly
- [ ] Check vibes show with emoji
- [ ] Verify provinces show with medals
- [ ] Click "Tìm lịch trình ngay" button
- [ ] Should navigate to `/discover/results`

### **Phase 3: Auto Zone Search**
- [ ] After clicking CTA, verify loading appears
- [ ] Check console logs: `[DiscoverResults] Auto-searching with: ...`
- [ ] Verify POST `/api/discover/parse` is called
- [ ] Check response has zones array
- [ ] Verify zones display in grid
- [ ] Check province filter works
- [ ] Select a zone → Should navigate to `/zone/:zoneId`

### **Phase 4: Fallback Flows**
- [ ] Test with new user (no profile) → Should show error message
- [ ] Test manual ViDoi flow → Should still work
- [ ] Test navigation back from ZoneDetail → Should preserve results

---

## 🐛 Troubleshooting

### **Issue: Profile returns 404**
**Cause**: User has no UserProfile record in MongoDB
**Solution**:
1. Check PostHog events exist: `node test-posthog-api.js`
2. Run profile sync: `node jobs/weeklyProfileSync.js`
3. Or use mock data: `node jobs/weeklyProfileSync.js --mock`

### **Issue: Auto-search returns no zones**
**Cause**: Vibes don't match any zones in database
**Solution**:
1. Check zone data has vibes: `db.zones.findOne({ vibes: { $exists: true } })`
2. Verify vibes in profile match zone vibes
3. Lower matching threshold in `matcher.js`

### **Issue: Slides don't auto-advance**
**Cause**: React hooks dependency issue
**Solution**:
1. Check console for React warnings
2. Verify `currentSlide` state updates
3. Check setTimeout cleanup in useEffect

### **Issue: Loading state stuck**
**Cause**: API call failed or timeout
**Solution**:
1. Check Network tab in DevTools
2. Verify backend is running: `npm run dev`
3. Check CORS headers
4. Verify JWT token valid

---

## 📋 TODO: Final Integration

### **Step 1: Add Navigation (Home Page)**
```jsx
// touring-fe/src/pages/MainHome.jsx

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/context';

// Add in Hero section or CTA area
function Hero() {
  const navigate = useNavigate();
  const { isAuth } = useAuth();
  
  return (
    <section className="hero">
      {/* ... existing hero content ... */}
      
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/tours')}
          className="btn-secondary"
        >
          Xem tất cả tour
        </button>
        
        {/* ✅ NEW: AI Discovery CTA */}
        {isAuth && (
          <button
            onClick={() => navigate('/recommendations/wrapped')}
            className="bg-linear-to-r from-[#02A0AA] to-cyan-500 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
          >
            🎯 Khám phá cá nhân hóa
          </button>
        )}
      </div>
    </section>
  );
}
```

### **Step 2: Test Full Flow**
```bash
# Terminal 1: Backend
cd touring-be
npm run dev

# Terminal 2: AI Service
cd ai
.venv\Scripts\activate
uvicorn app:app --reload --port 8088

# Terminal 3: Frontend
cd touring-fe
npm run dev

# Open browser: http://localhost:5173
# 1. Login
# 2. Navigate to /recommendations/wrapped
# 3. Watch slides
# 4. Click "Tìm lịch trình ngay"
# 5. Verify zones load
# 6. Click zone → Check POIs load
```

### **Step 3: Add Fallback for New Users**
```jsx
// DiscoveryWrappedNew.jsx

if (error || (profile && profile.summary.confidence < 30)) {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <motion.div className="text-center max-w-md">
        <h2 className="text-white text-2xl font-bold mb-4">
          Chưa đủ dữ liệu
        </h2>
        <p className="text-slate-400 mb-6">
          Chúng tôi cần thêm thông tin về sở thích của bạn. 
          Hãy trả lời một số câu hỏi để bắt đầu!
        </p>
        <button
          onClick={() => navigate('/daily-ask')}
          className="bg-[#02A0AA] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#028a94] transition-colors mb-3"
        >
          Trả lời câu hỏi
        </button>
        <button
          onClick={() => navigate('/vi-doi')}
          className="block w-full bg-white/10 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/20 transition-colors"
        >
          Hoặc chọn sở thích thủ công
        </button>
      </motion.div>
    </div>
  );
}
```

---

## 🎉 Summary

**✅ What's Done:**
1. DiscoveryWrappedNew component (Spotify-style slides)
2. Route `/recommendations/wrapped` added
3. DiscoverResults updated to handle auto-search
4. Reuses existing `/api/discover/parse` endpoint
5. Pipeline cũ vẫn hoạt động (ViDoi flow)

**🔄 What's Reused:**
- `/api/discover/parse` - Zone matching
- Zone matcher logic (hybrid vibe + embedding)
- ZoneDetail component
- ItineraryView component
- All existing routes and flows

**📝 What's Left:**
1. Add navigation button to Home/Landing page
2. Test end-to-end flow
3. Add fallback for new users (confidence < 30%)
4. Polish animations timing
5. Add skip button for slides

**🚀 Ready to test!**
