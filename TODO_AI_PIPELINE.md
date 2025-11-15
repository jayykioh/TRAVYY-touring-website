# 📋 TODO LIST - AI RECOMMENDATION PIPELINE

## ✅ COMPLETED (Phase 0 Foundation - EXTENDED)

### Backend Foundation
- [x] ✅ UserProfile model (vibe weights, vectors, preferences)
- [x] ✅ ZoneInteraction model (track views, clicks, bookmarks)
- [x] ✅ TourInteraction model (track tours with BOOKING weight ×3!) **NEW**
- [x] ✅ BlogInteraction model (track blog reads + scroll) **NEW**
- [x] ✅ DailyAskAnswer model (store daily question answers)
- [x] ✅ DailyQuestion model (question bank)
- [x] ✅ Tracking API routes (`/api/track/*`) - 10 endpoints total
- [x] ✅ Daily Ask API routes (`/api/daily-ask/*`)
- [x] ✅ Profile API routes (`/api/profile/travel`, extended existing routes)
- [x] ✅ Cron job: buildUserProfile (processes tours, blogs, zones, daily asks)
- [x] ✅ Seed script: seedDailyQuestions.js
- [x] ✅ Routes registered in server.js
- [x] ✅ Cron job integrated in server.js

### Frontend Integration (PHASE 1 STARTED!)
- [x] ✅ useBehaviorTracking hook - Complete with tour/blog/zone tracking
- [x] ✅ TourDetailPage integration - Auto-track views, bookmarks, bookings
- [x] ✅ Blogs integration - Auto-track reads + scroll milestones
- [ ] ⏳ DailyAskModal component (next)
- [ ] ⏳ ProfileSettings page (next)

**📁 Files Created/Modified:**
- `models/TourInteraction.js` (NEW)
- `models/BlogInteraction.js` (NEW)
- `routes/track.routes.js` (EXTENDED - 10 endpoints)
- `jobs/buildUserProfile.js` (UPDATED - multi-source)
- `hooks/useBehaviorTracking.js` (EXTENDED)
- `pages/TourDetailPage.jsx` (INTEGRATED)
- `pages/Blogs.jsx` (INTEGRATED)

---

## � PROGRESS UPDATE

**Total Progress: 18/70 tasks completed (25%)**

**Phase 0**: ✅ EXTENDED (15/15 tasks)  
**Phase 1**: � IN PROGRESS (3/12 tasks)  
**Overall**: 25% complete
  ```javascript
  export const useBehaviorTracking = () => {
    const trackZoneView = (zoneId, duration) => { ... }
    const trackZoneClick = (zoneId) => { ... }
    const trackZoneBookmark = (zoneId, bookmarked) => { ... }
    const trackSearch = (query, vibes) => { ... }
  }
  ```

- [ ] Create `hooks/useDailyAsk.js`
  ```javascript
  export const useDailyAsk = () => {
    const { question, loading } = useFetchQuestion();
    const { submitAnswer, isSubmitting } = useSubmitAnswer();
    const { hasAnsweredToday } = useAnswerStatus();
  }
  ```

### C. UI Components
- [ ] Create `components/DailyAskModal.jsx`
  - Modal with question + options
  - Submit/Skip buttons
  - Privacy notice
  - Show only if not answered today

- [ ] Create `pages/ProfileSettings.jsx`
  - Display confidence score with progress bar
  - Show top 5 vibes with weights
  - Travel style selector (manual override)
  - Budget tier selector
  - Opt-in/out toggle
  - Delete all data button (danger zone)

### D. Integrate Tracking into Existing Pages
- [ ] `ZoneDetailPage.jsx`: Add `useEffect(() => trackZoneView(...), [])`
- [ ] `DiscoverPage.jsx`: Track search on submit
- [ ] Zone cards: Add `onClick={() => trackZoneClick(...)}`
- [ ] Bookmark buttons: Add tracking on toggle

---

## 📅 PHASE 2: Embedding & Matching (Week 3)

### E. Profile Embedding Builder
- [ ] Create `jobs/buildProfileEmbedding.js`
  - Get user vibe profile from UserProfile
  - Build query text: "Tôi thích {top vibes} + {daily ask answers}"
  - Call `/embed` endpoint on Python service
  - Calculate short-term vector (7 days, exponential decay)
  - Calculate long-term vector (90 days, slower decay)
  - Save vectors to UserProfile

- [ ] Schedule embedding builder (daily after profile builder)
  ```javascript
  cron.schedule('0 1 * * *', buildProfileEmbedding); // 01:00
  ```

### F. Matcher v2 - Hybrid Scoring
- [ ] Create `services/zones/matcher-v2.js`
  ```javascript
  async function matchZones(userQuery, userProfile, options) {
    // Stage 1: Semantic (40%)
    const embedResults = await embeddingClient.hybridSearch(...)
    
    // Stage 2: Behavioral (40%)
    const behavioralScore = dotProduct(userProfile.vibeProfile, zone.tags)
    
    // Stage 3: Contextual (20%)
    const contextScore = proximityScore + weatherScore + seasonScore
    
    // Combine
    const finalScore = (semantic × 0.4) + (behavioral × 0.4) + (context × 0.2)
    
    // Return with explainability
    return { zone, score, reasons: [...] }
  }
  ```

- [ ] Create `services/context-fetcher.js`
  - Fetch weather from OpenWeather API
  - Determine season from date
  - (Optional) Check events/holidays

### G. Update Discover Route
- [ ] Modify `routes/discover.routes.js`
  - Call matcher-v2 instead of matcher
  - Pass userProfile to matcher
  - Return explainability (reasons array)

---

## 📅 PHASE 3: Itinerary Optimizer (Week 4-5)

### H. Auto-Generate Logic Refactor
- [ ] Create `services/itinerary/auto-generator-v2.js`
  ```javascript
  // Step 1: Validate input
  validateItineraryInput(itinerary)
  
  // Step 2: Suggest optimal days
  const suggestedDays = suggestDays(pois, distances)
  
  // Step 3: Cluster POIs by geography
  const clusters = clusterPOIsByProximity(pois, suggestedDays)
  
  // Step 4: Optimize each day's route
  const optimizedDays = clusters.map(cluster => 
    optimizeDayRoute(cluster, startPoint)
  )
  
  // Step 5: Build timeline with breaks
  const timeline = buildTimeline(optimizedDays, preferences)
  
  // Step 6: Estimate costs
  const budget = estimateBudget(timeline, numPeople)
  
  // Step 7: Validate constraints
  validateItinerary(timeline, budget, maxBudget)
  ```

### I. New API Endpoints
- [ ] `POST /api/itinerary/:id/optimize`
  - Input: `{ numPeople, flexible, maxBudget }`
  - Output: Preview (not saved yet)
  - Status: 200 OK with preview data

- [ ] `PATCH /api/itinerary/:id/confirm-optimize`
  - Save optimized itinerary
  - Trigger LLM insights (background job)
  - Status: 200 OK with saved itinerary

### J. Frontend - Auto Itinerary Modal
- [ ] Create `components/AutoItineraryModal.jsx`
  - Tab 1: Auto optimize (call API)
  - Tab 2: Manual (current flow)
  - Show preview with:
    - Map with optimized routes
    - Day-by-day timeline
    - Budget breakdown
  - Confirm/Edit buttons

---

## 📅 PHASE 4: Feedback & LLM (Week 6)

### K. Post-Trip Feedback
- [ ] `POST /api/itinerary/:id/complete`
  - Input: `{ rating, visitedPOIs[], feedback }`
  - Update profile weights (×3 for visited POIs)
  - Trigger profile update immediately
  - Return updated profile

- [ ] `components/ItineraryFeedbackModal.jsx`
  - Show after trip end date
  - Rating stars
  - Checklist of visited POIs
  - Freeform feedback text

### L. LLM Insights Generator
- [ ] `services/itinerary/llm-insights.js`
  ```javascript
  async function generateInsights(itinerary) {
    // Build context
    const context = {
      destinations: itinerary.items.map(i => i.name),
      vibes: extractVibes(itinerary),
      duration: itinerary.days,
      budget: itinerary.estimatedBudget
    }
    
    // Call Gemini API
    const prompt = buildPrompt(context)
    const insights = await gemini.generate(prompt)
    
    // Parse and save
    return insights
  }
  ```

- [ ] Setup background job queue (BullMQ or simple queue)

---

## 📅 PHASE 5: Optimization (Week 6+)

### M. Caching
- [ ] Setup Redis
- [ ] Cache profile vectors (TTL: 1 hour)
- [ ] Cache FAISS results (TTL: 30 mins)
- [ ] Cache weather data (TTL: 1 hour)
- [ ] Cache Map4D responses (TTL: 24 hours)

### N. Circuit Breaker
- [ ] Wrap embedding service calls
- [ ] Wrap Map4D calls
- [ ] Wrap Gemini calls
- [ ] Fallback strategies

### O. Monitoring
- [ ] Setup winston logging
- [ ] Log all API calls with timestamps
- [ ] (Optional) Prometheus + Grafana
- [ ] Alert on high error rates

---

## 🎯 IMMEDIATE NEXT STEPS (Priority Order)

### Today
1. ✅ Run seed script: `node scripts/seedDailyQuestions.js`
2. ✅ Verify server starts with cron job
3. [ ] Test tracking API with curl/Postman
4. [ ] Test daily-ask API

### This Week
5. [ ] Create `useBehaviorTracking` hook (30 mins)
6. [ ] Integrate tracking into DiscoverPage (15 mins)
7. [ ] Create DailyAskModal (1-2 hours)
8. [ ] Test full tracking flow end-to-end

### Next Week
9. [ ] Build profile embedding job
10. [ ] Implement matcher-v2 with hybrid scoring

---

## 📝 NOTES

- **Cold Start**: New users see default/popular zones until 5-10 interactions
- **Confidence Threshold**: Need 20 interactions for full personalization
- **Privacy**: Always show opt-out, allow data deletion
- **Performance**: Use caching + circuit breakers for external services
- **Testing**: Seed test users with fake interactions for development

---

## 📊 PROGRESS SUMMARY

**Total Progress: 11/70 tasks completed (15%)**

**Phase 0**: ✅ DONE (11/11 tasks)  
**Phase 1**: ⏳ TODO (0/12 tasks)  
**Phase 2**: ⏳ TODO (0/15 tasks)  
**Phase 3**: ⏳ TODO (0/12 tasks)  
**Phase 4**: ⏳ TODO (0/8 tasks)  
**Phase 5**: ⏳ TODO (0/12 tasks)

**Estimated Time Remaining**: 5-6 weeks

---

## 🚀 Quick Commands

```bash
# Backend
cd touring-be

# Seed questions (once)
node scripts/seedDailyQuestions.js

# Start server
npm start

# Check logs
tail -f logs/*.log

# Frontend (later)
cd ../touring-fe
npm run dev
```

---

## 📚 Documentation

- `AI_RECOMMENDATION_SETUP.md` - Setup guide & testing
- `IMPLEMENTATION_CHECKLIST.md` - Original design checklist
- `FINAL_PIPELINE_ARCHITECTURE.md` - System architecture

---

**Last Updated**: Now  
**Next Review**: After Phase 1 completion  
**Status**: ✅ Phase 0 Complete, Ready for Frontend Integration

