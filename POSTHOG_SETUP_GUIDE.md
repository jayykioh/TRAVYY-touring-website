# 📊 PostHog AI Recommendation Pipeline - Setup Guide

## Overview

This system implements a **Facebook/TikTok-style recommendation pipeline** using PostHog for event tracking and weekly batch processing for AI-powered personalization.

### Architecture

```
User Actions (Frontend)
    ↓
PostHog Cloud (1M events/month free)
    ↓
Weekly Sync Job (Every Sunday 2:00 AM)
    ↓
1. Fetch events (7-day window)
2. Aggregate by user (weighted scoring + time decay)
3. Generate embedding vectors (384-dim)
4. Upsert to FAISS (similarity search)
5. Update MongoDB (vibeWeights, confidence, travelStyle)
    ↓
Recommendation API (uses FAISS vectors)
```

### Benefits over Direct MongoDB Tracking

1. **Zero DB Load**: PostHog handles 1M events/month free
2. **Built-in Analytics**: PostHog dashboard replaces custom analytics
3. **Better Privacy**: GDPR-compliant with built-in opt-out
4. **Simplified Frontend**: Just `posthog.capture()` instead of API calls
5. **Batch Processing**: Weekly updates vs real-time (acceptable 7-day freshness)

---

## 🚀 Quick Start

### Step 1: Sign Up for PostHog

1. Go to [https://app.posthog.com/signup](https://app.posthog.com/signup)
2. Create a free account (1M events/month, no credit card required)
3. Create a new project named "Travyy"
4. Copy your **Project API Key** (starts with `phc_...`)
5. Copy your **Project ID** (numeric ID from URL)

### Step 2: Configure Backend (.env)

Add to `touring-be/.env`:

```env
# PostHog Configuration (required for AI recommendations)
POSTHOG_API_KEY=phc_YOUR_API_KEY_HERE
POSTHOG_HOST=https://app.posthog.com
POSTHOG_PROJECT_ID=YOUR_PROJECT_ID_HERE
```

### Step 3: Configure Frontend (.env)

Add to `touring-fe/.env`:

```env
# PostHog Analytics (required for AI recommendations)
VITE_POSTHOG_KEY=phc_YOUR_API_KEY_HERE
VITE_POSTHOG_HOST=https://app.posthog.com
```

**Note**: Use the **same API key** for both backend and frontend.

### Step 4: Install Dependencies

Already done! Both packages are installed:
- Backend: `posthog-node` (v4.x)
- Frontend: `posthog-js` (latest)

### Step 5: Start the System

```bash
# Terminal 1: Start backend
cd touring-be
npm start

# Terminal 2: Start frontend
cd touring-fe
npm run dev

# Terminal 3: Start embedding service (Python)
cd ai
python app.py
```

### Step 6: Verify PostHog Connection

1. **Frontend**: Open [http://localhost:5173](http://localhost:5173)
2. **Check Console**: Should see `✅ PostHog initialized`
3. **PostHog Dashboard**: Go to [https://app.posthog.com/events](https://app.posthog.com/events)
4. **Wait 1-2 minutes**: Events should appear in PostHog dashboard

### Step 7: Test Event Tracking (Optional)

Perform these actions in the frontend:
- View a tour → `tour_view` event
- Bookmark a tour → `tour_bookmark` event
- View a blog → `blog_view` event
- Answer daily ask → `daily_ask_answer` event

Check PostHog dashboard to verify events appear.

### Step 8: Run First Sync (Manual Test)

After 24 hours of data collection:

```bash
cd touring-be
node jobs/weeklyProfileSync.js
```

Expected output:
```
🔄 Starting PostHog weekly sync...
📡 Step 1/6: Fetching events from PostHog...
✅ Fetched 247 events from PostHog
🔄 Step 2/6: Transforming events...
✅ Transformed 247 events
📊 Step 3/6: Aggregating by user...
✅ Aggregated 23 user profiles
...
✅ Weekly sync completed successfully
   Duration: 12.34s
   Events: 247
   Users: 23 (success: 20, skipped: 2, failed: 1)
```

---

## 📋 Event Types & Weights

The pipeline tracks 13 event types with different engagement weights:

| Event Type | Weight | Description |
|------------|--------|-------------|
| `tour_booking_complete` | ×5.0 | Strongest signal (actual purchase) |
| `itinerary_optimize` | ×3.0 | High engagement |
| `tour_bookmark` | ×2.5 | Intent to purchase |
| `blog_like` | ×2.0 | Active engagement |
| `daily_ask_answer` | ×2.0 | Profile signal |
| `zone_click` | ×0.8 | Moderate interest |
| `tour_view` | ×0.5 | Weak signal (browsing) |
| `blog_view` | ×0.5 | Weak signal |
| `zone_skip` | ×-0.5 | Negative signal |

### Time Decay

Events decay with a **30-day half-life**:
- 1 day old: 98% weight
- 7 days old: 86% weight
- 14 days old: 74% weight
- 30 days old: 50% weight

### Engagement Boosts

- **Duration Boost**: Tours with longer durations get up to 3× boost
- **Price Boost**: Higher-priced tours get up to 2× boost

---

## 🔧 Pipeline Configuration

### Cron Schedule

The weekly sync job runs **every Sunday at 2:00 AM**:

```javascript
// In server.js (auto-registered on startup)
const { startWeeklySyncCron } = require('./jobs/weeklyProfileSync');
startWeeklySyncCron(); // Runs at '0 2 * * 0' (Sunday 2 AM)
```

### Manual Run (for testing)

```bash
cd touring-be
node jobs/weeklyProfileSync.js
```

This connects to MongoDB, runs the full 6-step pipeline, then exits.

### Sync Window

- **Lookback**: 7 days
- **Max Events**: 10,000 per sync
- **Pagination**: 100 events per API call
- **Rate Limit**: 100ms delay between API calls

---

## 📊 Data Flow

### Step 1: Fetch Events from PostHog

```javascript
// service: event-fetcher.js
const events = await fetchEvents(startDate, endDate);
// Returns: [{ event, userId, timestamp, properties }]
```

### Step 2: Transform Events

```javascript
// Extract vibes and provinces from properties
{
  eventType: 'tour_view',
  userId: '507f1f77bcf86cd799439011',
  vibes: ['beach', 'adventure'],
  provinces: ['Khánh Hòa'],
  tourPrice: 1500000,
  tourDuration: 3
}
```

### Step 3: Aggregate by User

```javascript
// service: aggregator.js
{
  userId: '507f1f77bcf86cd799439011',
  vibeWeights: Map { 'beach' => 12.5, 'adventure' => 8.3 },
  provinceWeights: Map { 'Khánh Hòa' => 5.2 },
  totalWeight: 26.0,
  confidence: 0.87, // min(totalWeight / 20, 1.0)
  travelStyle: 'adventurer',
  eventCounts: Map { 'tour_view' => 15, 'tour_booking_complete' => 2 }
}
```

### Step 4: Build Weighted Text

```javascript
// Repeat vibes by weight (top 10 vibes + top 3 provinces)
"beach beach beach beach adventure adventure adventure mountain food food Khánh Hòa Khánh Hòa"
```

### Step 5: Generate Embedding

```javascript
// Call Python embedding service
POST http://localhost:8088/embed
Body: { text: "beach beach beach..." }
Response: { embedding: [0.234, -0.567, ...] } // 384 dims
```

### Step 6: Upsert to FAISS

```javascript
// Update FAISS index with new vector
POST http://localhost:8088/upsert
Body: {
  id: '507f1f77bcf86cd799439011',
  vector: [0.234, -0.567, ...],
  metadata: { userId, confidence, travelStyle }
}
```

### Step 7: Update MongoDB

```javascript
// Update UserProfile model
await UserProfile.findOneAndUpdate(
  { userId },
  {
    vibeWeights: profile.vibeWeights,
    provinceWeights: profile.provinceWeights,
    confidence: profile.confidence,
    travelStyle: profile.travelStyle,
    eventCounts: profile.eventCounts,
    embeddingVector: embedding,
    lastSyncedAt: new Date()
  },
  { upsert: true }
);
```

---

## 🎯 Travel Style Detection

The pipeline automatically detects user travel style based on vibe patterns:

| Travel Style | Vibe Keywords | Behavior |
|--------------|---------------|----------|
| **Adventurer** | adventure, trekking, camping | High-energy activities |
| **Relaxer** | beach, resort, spa, luxury | Comfort-focused |
| **Culture** | culture, historical, museum, temple | Heritage sites |
| **Foodie** | food, culinary, dining, street-food | Culinary experiences |
| **Explorer** | (default) | Mixed interests |

---

## 🐛 Troubleshooting

### Issue: PostHog events not appearing

**Solution**:
1. Check browser console for `✅ PostHog initialized`
2. Verify `VITE_POSTHOG_KEY` in frontend `.env`
3. Check PostHog dashboard → Settings → Project API Key
4. Ensure ad blockers are disabled (they may block PostHog)

### Issue: Weekly sync fails with "401 Unauthorized"

**Solution**:
1. Verify `POSTHOG_API_KEY` in backend `.env`
2. Check PostHog dashboard → Settings → Project API Key
3. Ensure key starts with `phc_`
4. Regenerate key if needed

### Issue: No users synced

**Solution**:
1. Ensure PostHog has events (check dashboard)
2. Verify events have `userId` property set
3. Run manual sync: `node jobs/weeklyProfileSync.js`
4. Check logs for errors

### Issue: Embedding service unavailable

**Solution**:
1. Start Python service: `cd ai && python app.py`
2. Verify port 8088: `curl http://localhost:8088/health`
3. Check `EMBED_SERVICE_URL` in backend `.env`

### Issue: FAISS upsert fails

**Solution**:
1. Ensure FAISS index exists: `ai/index/faiss.index`
2. Check FAISS dimensions match (384)
3. Restart Python service
4. Clear and rebuild index if corrupted

---

## 📈 Monitoring

### PostHog Dashboard

1. **Live Events**: [https://app.posthog.com/events](https://app.posthog.com/events)
2. **User Activity**: [https://app.posthog.com/persons](https://app.posthog.com/persons)
3. **Event Types**: [https://app.posthog.com/data-management/events](https://app.posthog.com/data-management/events)

### Backend Logs

```bash
# Watch sync job logs
tail -f touring-be/logs/sync.log

# Manual sync with verbose logging
cd touring-be
node jobs/weeklyProfileSync.js
```

### Database Check

```javascript
// MongoDB shell
use travelApp
db.userprofiles.find({ lastSyncedAt: { $exists: true } }).count()
db.userprofiles.find().sort({ lastSyncedAt: -1 }).limit(5).pretty()
```

---

## 🔒 Privacy & GDPR

PostHog is GDPR-compliant out of the box:

1. **Opt-out**: Users can disable tracking via PostHog settings
2. **Data Deletion**: Request via PostHog dashboard → Settings → Data Management
3. **IP Anonymization**: Enable in PostHog project settings
4. **Cookie Consent**: Implement banner using `posthog.opt_out_capturing()`

---

## 📚 References

- **PostHog Docs**: [https://posthog.com/docs](https://posthog.com/docs)
- **PostHog API**: [https://posthog.com/docs/api](https://posthog.com/docs/api)
- **Event Schema**: See `touring-be/config/posthog.config.js`
- **Aggregation Logic**: See `touring-be/services/posthog/aggregator.js`
- **Weekly Sync Job**: See `touring-be/jobs/weeklyProfileSync.js`

---

## 🎉 Next Steps

1. ✅ Configure PostHog credentials
2. ✅ Start all services (backend, frontend, embedding)
3. ✅ Verify events appear in PostHog dashboard
4. ⏳ Wait 24 hours for data collection
5. ⏳ Run manual sync: `node jobs/weeklyProfileSync.js`
6. ⏳ Check MongoDB for updated UserProfiles
7. ⏳ Test recommendations with updated user profiles

---

## 💡 Tips

- **Testing**: Use PostHog's "Test Mode" to send test events without affecting production
- **Debugging**: Add `?ph_debug=1` to URL to enable PostHog debug logs
- **Performance**: PostHog free tier supports 1M events/month (enough for ~10k users)
- **Scaling**: If you exceed 1M events/month, upgrade to PostHog paid plan or self-host

---

**Questions?** Check the [PostHog Community Forum](https://posthog.com/questions) or contact the team.
