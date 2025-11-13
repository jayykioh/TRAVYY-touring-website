# 🤖 AI RECOMMENDATION PIPELINE - SETUP GUIDE

## 📦 Phase 0 Foundation - COMPLETED ✅

### What We Just Built:

#### 1. Database Models (4 new schemas)
- ✅ `UserProfile.js` - Stores user behavioral profile
  - `vibeProfile`: Map of vibe weights (0-1)
  - `profileVector_short/long`: 384-dim embeddings (7-day, 90-day windows)
  - `confidence`: 0-1 score (min 20 interactions for high confidence)
  - `travelStyle`: detected style (adventurer, relaxer, culture, foodie, explorer)

- ✅ `ZoneInteraction.js` - Tracks all user actions
  - `action`: view, click, bookmark, booking, dismiss
  - `durationSec`: engagement time
  - `sessionId`: group interactions

- ✅ `DailyAskAnswer.js` - Stores daily question answers
  - Links user answers to questions
  - Tracks vibes selected

- ✅ `DailyQuestion.js` - Question templates
  - 7 questions covering vibes, budget, duration, region, etc.
  - Weighted importance (2-3x for key questions)

#### 2. API Routes (3 new route files)
- ✅ `track.routes.js` - Behavior tracking endpoints
  - `POST /api/track/zone-view` - Track views
  - `POST /api/track/zone-click` - Track clicks (weight: 1x)
  - `POST /api/track/zone-bookmark` - Track bookmarks (weight: 1.5x)
  - `POST /api/track/search` - Track search queries

- ✅ `daily-ask.routes.js` - Daily question system
  - `GET /api/daily-ask/question` - Fetch today's question
  - `POST /api/daily-ask/answer` - Submit answer (weight: 2x)
  - `GET /api/daily-ask/history` - View past answers

- ✅ `profile.routes.js` - User profile management (extended)
  - `GET /api/profile/travel` - Get AI-built profile
  - `PATCH /api/profile/travel` - Update preferences
  - `DELETE /api/profile/data` - GDPR compliance (delete all data)

#### 3. Background Jobs
- ✅ `buildUserProfile.js` - Nightly cron job
  - Runs at 00:00 daily
  - Aggregates interactions from last 30 days
  - Calculates vibe weights with action multipliers:
    - Booking: ×3
    - Bookmark: ×1.5
    - Click: ×1
    - View: ×0.5
    - Daily Ask: ×2
  - Detects travel style from top vibes
  - Computes confidence score

#### 4. Seed Data
- ✅ `seedDailyQuestions.js` - Initial question bank
  - 7 questions covering key preferences
  - Ready to customize

---

## 🚀 QUICK START

### 1. Run Seed Script (Once)
```bash
cd touring-be
node scripts/seedDailyQuestions.js
```

Expected output:
```
✅ MongoDB connected
🌱 [Seed] Seeding daily questions...
✅ [Seed] Seeded 7 daily questions
✅ Done
```

### 2. Verify Server Integration
Server already configured! When you start the server:
```bash
npm start
```

You should see:
```
✅ Cron Profile builder scheduled (daily at 00:00)
🚀 API listening on http://localhost:4000
```

### 3. Test Tracking API
```bash
# Track zone view
curl -X POST http://localhost:4000/api/track/zone-view \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"zoneId": "zone_123", "durationSec": 30}'

# Track zone click
curl -X POST http://localhost:4000/api/track/zone-click \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"zoneId": "zone_123"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Zone view tracked",
  "interaction": { ... }
}
```

### 4. Test Daily Ask API
```bash
# Get today's question
curl http://localhost:4000/api/daily-ask/question \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Submit answer
curl -X POST http://localhost:4000/api/daily-ask/answer \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "678...",
    "answer": ["Biển", "Núi"],
    "vibesSelected": ["beach", "mountain"]
  }'
```

### 5. Check User Profile
```bash
# Get travel profile
curl http://localhost:4000/api/profile/travel \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected response (after interactions):
```json
{
  "success": true,
  "profile": {
    "confidence": 0.45,
    "topVibes": [
      { "vibe": "beach", "weight": 0.85 },
      { "vibe": "food", "weight": 0.72 }
    ],
    "travelStyle": "relaxer",
    "totalInteractions": 9,
    "optInPersonalization": true
  }
}
```

---

## 🔧 INTEGRATION CHECKLIST

### Backend ✅
- [x] Models created
- [x] Routes registered in server.js
- [x] Cron job scheduled
- [x] Seed script ready

### Frontend (Next Steps)
- [ ] Create `hooks/useBehaviorTracking.js`
- [ ] Create `components/DailyAskModal.jsx`
- [ ] Integrate tracking into existing pages
- [ ] Create Profile Settings page

---

## 📊 HOW IT WORKS

### 1. Data Collection (Implicit + Explicit)
```
User browses zones → Track view (0.5x weight)
User clicks zone → Track click (1x weight)
User bookmarks → Track bookmark (1.5x weight)
User books tour → Track booking (3x weight)
Daily popup → Track answer (2x weight)
```

### 2. Profile Building (Daily at 00:00)
```javascript
For each user with recent interactions:
  1. Fetch interactions (last 30 days)
  2. Extract vibes from zones
  3. Calculate weighted vibe scores
  4. Normalize to 0-1 range
  5. Detect travel style
  6. Calculate confidence = min(totalInteractions / 20, 1)
  7. Save to UserProfile
```

### 3. Recommendation Scoring (When user searches)
```javascript
For each zone:
  semanticScore = embeddings.similarity(userQuery, zoneVector)  // 40%
  behavioralScore = dotProduct(userVibeProfile, zoneVibes)      // 40%
  contextScore = proximity + weather + season                    // 20%
  
  finalScore = (semantic × 0.4) + (behavioral × 0.4) + (context × 0.2)
```

---

## 🎯 CONFIDENCE LEVELS

| Interactions | Confidence | Quality |
|--------------|------------|---------|
| 0-5          | 0.0-0.25   | ⚠️ Low (use defaults) |
| 6-10         | 0.26-0.50  | 🟡 Medium (blend with popular) |
| 11-20        | 0.51-1.00  | ✅ High (full personalization) |

---

## 🔐 PRIVACY & GDPR

Users can:
- ✅ Opt out of personalization: `PATCH /api/profile/travel { optInPersonalization: false }`
- ✅ View their data: `GET /api/profile/travel`
- ✅ Delete all data: `DELETE /api/profile/data`

When user deletes:
- All `ZoneInteraction` records → Deleted
- All `DailyAskAnswer` records → Deleted
- `UserProfile` → Reset to defaults

---

## 🐛 TROUBLESHOOTING

### Issue: Cron not running
**Solution**: Check logs for "✅ Cron Profile builder scheduled"

### Issue: Tracking not working
**Solution**: Verify JWT token is valid and user is authenticated

### Issue: No questions returned
**Solution**: Run seed script first: `node scripts/seedDailyQuestions.js`

### Issue: Profile confidence still 0
**Solution**: Need minimum 1-2 interactions. Test with tracking API.

---

## 📈 MONITORING

Check profile build logs:
```bash
# Grep for profile updates
grep "Profile updated" logs/*.log
```

Check user confidence distribution:
```javascript
// In mongo shell
db.userprofiles.aggregate([
  { $bucket: { 
    groupBy: "$confidence",
    boundaries: [0, 0.25, 0.5, 0.75, 1],
    default: "Other"
  }}
])
```

---

## 🎉 NEXT STEPS

After Phase 0 is stable:

1. **Phase 1: Embedding Integration** (Week 3)
   - Build profile embeddings from vibe history
   - Integrate into matcher-v2

2. **Phase 2: Auto-Itinerary** (Week 4-5)
   - POI clustering
   - Route optimization
   - Budget estimation

3. **Phase 3: LLM Insights** (Week 6)
   - Gemini integration
   - Post-trip feedback

---

## 📞 SUPPORT

Questions? Check:
- `TODO_AI_PIPELINE.md` - Full task list
- `IMPLEMENTATION_CHECKLIST.md` - Original design doc
- Conversation history with GitHub Copilot

---

**Last Updated**: Now  
**Version**: Phase 0 Foundation  
**Status**: ✅ Ready for Testing
