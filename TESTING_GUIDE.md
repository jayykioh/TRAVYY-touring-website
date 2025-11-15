# 🧪 Testing Guide - PostHog Pipeline

## Quick Test Checklist

### ✅ Prerequisites
- [ ] Backend running on port 4000
- [ ] Frontend running on port 5173
- [ ] Python embedding service running on port 8088
- [ ] PostHog credentials configured in `.env` files

---

## Test 1: Backend Integration Test (10 minutes)

### Run the test suite:

```bash
cd touring-be
node tests/posthog-pipeline.test.js
```

### Expected Output:

```
============================================================
  🧪 PostHog Pipeline Integration Tests
============================================================

============================================================
  Test 1: Environment Variables
============================================================

✅ POSTHOG_API_KEY: phc_N7jl9t4aTB8zhYhR...
✅ POSTHOG_HOST: https://app.posthog...
✅ MONGO_URI: mongodb://127.0.0.1:2...
✅ EMBED_SERVICE_URL: http://localhost:8088...

============================================================
  Test 2: MongoDB Connection
============================================================

✅ MongoDB connected
ℹ️ Database: travelApp

============================================================
  Test 3: Embedding Service Health
============================================================

✅ Embedding service available
ℹ️ Model: bkai-foundation-models/vietnamese-bi-encoder
ℹ️ Vectors: 123
ℹ️ Dimensions: 384

============================================================
  Test 4: PostHog Client
============================================================

✅ PostHog client working
ℹ️ Test event sent successfully

============================================================
  Test 5: Event Fetcher (PostHog API)
============================================================

✅ PostHog API connection successful
ℹ️ Fetching events from 2025-11-13T... to 2025-11-14T...
✅ Fetched 0 events from PostHog
⚠️ No events found. Use the app to generate some events first.

============================================================
  Test 6: Event Aggregation
============================================================

✅ Aggregated 1 user profiles
ℹ️ User: test_user_123
ℹ️   Vibe weights: {"beach":15.2,"adventure":7.8,"resort":5.1}
ℹ️   Province weights: {"Khánh Hòa":18.3,"Hà Nội":2.5}
ℹ️   Total weight: 26.0
ℹ️   Confidence: 0.87
ℹ️   Travel style: relaxer
ℹ️   Weighted text: "beach beach beach beach beach adventure..."

============================================================
  Test 7: Embedding Generation
============================================================

ℹ️ Test text: "beach beach beach adventure mountain food..."
✅ Generated embedding vector
ℹ️ Dimensions: 384
ℹ️ Sample values: [0.234, -0.567, 0.123, -0.890, 0.456...]

============================================================
  Test 8: FAISS Upsert
============================================================

✅ Upserted vector to FAISS
ℹ️ User ID: test_user_1731571234567
ℹ️ Result: {"success":true}

============================================================
  Test 9: UserProfile Model
============================================================

✅ UserProfile upserted to MongoDB
ℹ️ Retrieved profile for user 507f1f77bcf86cd799439011
ℹ️   Vibes: 3 vibes tracked
ℹ️   Provinces: 2 provinces tracked
ℹ️   Confidence: 0.87
ℹ️   Travel style: adventurer
ℹ️ Test profile cleaned up

============================================================
  Test 10: End-to-End Pipeline Simulation
============================================================

ℹ️ Running mini pipeline simulation...
✅ Step 1: Created 3 mock events
✅ Step 2: Aggregated user profile
ℹ️   Confidence: 0.65
✅ Step 3: Built weighted text (15 words)
✅ Step 4: Generated embedding vector (384 dims)
✅ Step 5: Upserted to FAISS
✅ Step 6: Saved to MongoDB
🎉 End-to-end pipeline simulation PASSED!

============================================================
  ✅ All Tests Passed!
============================================================

🎉 PostHog pipeline is ready for production
📋 Next steps:
   1. Use the app to generate real events
   2. Wait 24 hours for data collection
   3. Run manual sync: node jobs/weeklyProfileSync.js
   4. Check PostHog dashboard: https://app.posthog.com/events
```

### If Tests Fail:

| Error | Solution |
|-------|----------|
| `POSTHOG_API_KEY: MISSING` | Add to `touring-be/.env` |
| `MongoDB connection failed` | Start MongoDB service |
| `Embedding service unavailable` | Run `cd ai && python app.py` |
| `PostHog API 401 Unauthorized` | Check API key is correct |

---

## Test 2: Frontend Event Tracking (5 minutes)

### Method A: Using Test Page (Recommended)

1. **Open test page**: [http://localhost:5173/test-posthog.html](http://localhost:5173/test-posthog.html)

2. **Check status**: Should show "✅ PostHog ready!"

3. **Click test buttons**:
   - 🏖️ Track Tour View
   - ✅ Track Booking
   - 📰 Track Blog View
   - ⭐ Track Bookmark
   - ❓ Track Daily Ask

4. **Watch event log**: Should show green success messages

5. **Verify in PostHog**:
   - Go to [https://app.posthog.com/events](https://app.posthog.com/events)
   - Wait 1-2 minutes
   - Look for events: `tour_view`, `tour_booking_complete`, etc.

### Method B: Using Main App

1. **Open app**: [http://localhost:5173](http://localhost:5173)

2. **Check browser console** (F12):
   ```
   ✅ PostHog initialized
   📊 Tracked: tour_view {tourId: "123", ...}
   ```

3. **Perform actions**:
   - Browse tours (triggers `tour_view`)
   - Bookmark a tour (triggers `tour_bookmark`)
   - View a blog (triggers `blog_view`)

4. **Verify in PostHog dashboard**

---

## Test 3: Weekly Sync Job (Manual Run)

### After collecting 24 hours of events:

```bash
cd touring-be
node jobs/weeklyProfileSync.js
```

### Expected Output:

```
🔄 Starting PostHog weekly sync...
📡 Step 1/6: Fetching events from PostHog...
   Fetching page 1 (100 events/page)...
   Fetching page 2 (100 events/page)...
✅ Fetched 247 events from PostHog

🔄 Step 2/6: Transforming events...
✅ Transformed 247 events

📊 Step 3/6: Aggregating by user...
✅ Aggregated 23 user profiles

   📊 Summary stats:
      Total users: 23
      Total events: 247
      Avg confidence: 0.72
      Top vibes: beach (45), adventure (32), mountain (28)

   👤 Sample user 507f1f77bcf86cd799439011:
      - vibeWeights: {"beach":12.5,"adventure":8.3,"mountain":5.2}
      - provinceWeights: {"Khánh Hòa":15.0,"Đà Nẵng":8.5}
      - confidence: 0.87
      - travelStyle: adventurer
      - totalWeight: 26.0

🧠 Step 4/6: Generating embeddings...
   Processing batch 1/1 (23 users)
   Generated 23 embeddings

💾 Step 5/6: Upserting to FAISS...
   Processed 10/23 users...
   Processed 20/23 users...
✅ Upserted 23 vectors to FAISS

💾 Step 6/6: Updating MongoDB...
   Processed 10/23 users...
   Processed 20/23 users...
✅ Updated 20 user profiles in MongoDB

✅ Weekly sync completed successfully

📊 Final Summary:
   Duration: 12.34s
   Events processed: 247
   Users found: 23
   Success: 20
   Skipped: 2 (confidence < 0.3)
   Failed: 1
   
   Top vibes:
      beach: 45 events
      adventure: 32 events
      mountain: 28 events
      food: 22 events
      culture: 18 events
   
   Travel style distribution:
      adventurer: 8 users
      relaxer: 5 users
      explorer: 7 users
      culture: 2 users
      foodie: 1 user

🎉 Sync job completed!
```

### Verify Results:

**Check MongoDB:**
```bash
mongosh "mongodb://127.0.0.1:27017/travelApp"
```

```javascript
// Count synced profiles
db.userprofiles.countDocuments({ lastSyncedAt: { $exists: true } })

// View sample profile
db.userprofiles.findOne({ lastSyncedAt: { $exists: true } })

// View top vibes
db.userprofiles.find().forEach(p => {
  if (p.vibeWeights) {
    print("User:", p.userId);
    print("Vibes:", JSON.stringify(Object.fromEntries(p.vibeWeights)));
  }
})
```

**Check FAISS Index:**
```bash
cd ai
python -c "
import faiss
import json

# Load index
index = faiss.read_index('index/faiss.index')
print(f'Total vectors: {index.ntotal}')
print(f'Dimensions: {index.d}')

# Load metadata
with open('index/meta.json', 'r') as f:
    meta = json.load(f)
    print(f'Metadata entries: {len(meta)}')
    print(f'Sample entry: {list(meta.items())[0]}')
"
```

---

## Test 4: API Error Scenarios

### Test 1: PostHog API Down

**Simulate**: Stop internet or use wrong API key

**Expected**: 
```
❌ Error fetching events: Request failed with status 401
⚠️ Continuing with 0 events...
```

**Result**: Job should continue but skip users

---

### Test 2: Embedding Service Down

**Simulate**: Stop Python service

**Expected**:
```
❌ Error generating embedding for user 507f...: Connection refused
⚠️ Skipping user (1/10 errors)
```

**Result**: Job should skip failed users, continue with others

---

### Test 3: MongoDB Connection Lost

**Simulate**: Stop MongoDB during sync

**Expected**:
```
❌ Fatal error: MongoDB connection lost
🔄 Retrying in 5 seconds...
```

**Result**: Job should fail and exit

---

## Troubleshooting

### Issue: "No events found"

**Causes:**
- PostHog hasn't received events yet
- Wrong date range
- Events filtered by user properties

**Fix:**
1. Open test page: `http://localhost:5173/test-posthog.html`
2. Click test buttons
3. Wait 2 minutes
4. Check PostHog dashboard
5. Run sync again

---

### Issue: "Embedding service unavailable"

**Causes:**
- Python service not running
- Wrong port (should be 8088)
- EMBED_SERVICE_URL wrong in .env

**Fix:**
```bash
# Terminal 1: Check if port is in use
netstat -ano | findstr :8088

# Terminal 2: Start service
cd ai
python app.py

# Should see:
# Running on http://localhost:8088
```

---

### Issue: "FAISS upsert failed"

**Causes:**
- Index file corrupted
- Wrong dimensions (must be 384)
- Permission issues

**Fix:**
```bash
cd ai
# Backup old index
move index\faiss.index index\faiss.index.backup
# Restart Python service (creates new index)
python app.py
```

---

## Success Criteria

### ✅ Backend Test: All 10 tests pass
### ✅ Frontend Test: Events appear in PostHog dashboard
### ✅ Sync Job: Successfully processes users and updates MongoDB
### ✅ API Errors: Job handles errors gracefully

---

## Next Steps After Testing

1. **Add Real Event Tracking**: Update TourDetailPage, BlogPage, etc.
2. **Monitor PostHog**: Check event volume daily
3. **Schedule Cron**: Let Sunday 2AM sync run automatically
4. **Test Recommendations**: Use updated user profiles for discovery

---

## Quick Commands Reference

```bash
# Run backend tests
cd touring-be && node tests/posthog-pipeline.test.js

# Run manual sync
cd touring-be && node jobs/weeklyProfileSync.js

# Check MongoDB profiles
mongosh "mongodb://127.0.0.1:27017/travelApp"
> db.userprofiles.countDocuments({ lastSyncedAt: { $exists: true } })

# Check FAISS vectors
cd ai && python -c "import faiss; idx = faiss.read_index('index/faiss.index'); print(f'Vectors: {idx.ntotal}')"

# Open test page
start http://localhost:5173/test-posthog.html

# Check PostHog events
start https://app.posthog.com/events
```

---

**Ready to test!** Start with the backend integration test, then frontend, then manual sync. 🚀
