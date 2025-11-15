# ✅ PostHog AI Pipeline - Deployment Checklist

## Pre-Deployment

### 1. PostHog Account Setup
- [ ] Create PostHog account at [https://app.posthog.com/signup](https://app.posthog.com/signup)
- [ ] Create project "Travyy"
- [ ] Copy Project API Key (starts with `phc_...`)
- [ ] Copy Project ID (numeric ID from URL)

### 2. Backend Configuration
- [ ] Update `touring-be/.env`:
  ```env
  POSTHOG_API_KEY=phc_YOUR_KEY_HERE
  POSTHOG_HOST=https://app.posthog.com
  POSTHOG_PROJECT_ID=YOUR_ID_HERE
  ```
- [ ] Verify MongoDB connection string in `.env`
- [ ] Verify embedding service URL: `EMBED_SERVICE_URL=http://localhost:8088`

### 3. Frontend Configuration
- [ ] Update `touring-fe/.env`:
  ```env
  VITE_POSTHOG_KEY=phc_YOUR_KEY_HERE
  VITE_POSTHOG_HOST=https://app.posthog.com
  ```
- [ ] Verify backend API URL: `VITE_API_URL=http://localhost:4000`

### 4. Dependencies Check
- [ ] Backend: Run `cd touring-be && npm install`
- [ ] Frontend: Run `cd touring-fe && npm install`
- [ ] Python: Run `cd ai && pip install -r requirements.txt`

---

## Testing Phase

### 5. Start Services
- [ ] **Terminal 1 - Backend**:
  ```bash
  cd touring-be
  npm start
  ```
  Expected output:
  ```
  ✅ MongoDB connected
  ✅ Refund scheduler started
  ✅ Profile builder cron started
  ✅ Weekly PostHog sync cron started
  🚀 API listening on http://localhost:4000
  ```

- [ ] **Terminal 2 - Frontend**:
  ```bash
  cd touring-fe
  npm run dev
  ```
  Expected output:
  ```
  VITE v5.x.x ready in XXX ms
  ➜ Local: http://localhost:5173/
  ```

- [ ] **Terminal 3 - Embedding Service**:
  ```bash
  cd ai
  python app.py
  ```
  Expected output:
  ```
  ✅ Model loaded
  ✅ FAISS index loaded
  Running on http://localhost:8088
  ```

### 6. Verify PostHog Integration (Frontend)
- [ ] Open [http://localhost:5173](http://localhost:5173) in browser
- [ ] Open browser DevTools (F12) → Console tab
- [ ] Look for log: `✅ PostHog initialized`
- [ ] If error appears, check `VITE_POSTHOG_KEY` in `.env`

### 7. Test Event Tracking
Perform these actions and verify events in PostHog dashboard:

- [ ] **Action 1**: View a tour
  - Go to any tour detail page
  - Wait 10 seconds
  - Check PostHog dashboard for `tour_view` event

- [ ] **Action 2**: Bookmark a tour
  - Click bookmark icon on tour
  - Check PostHog dashboard for `tour_bookmark` event

- [ ] **Action 3**: View a blog
  - Go to any blog post
  - Check PostHog dashboard for `blog_view` event

**PostHog Dashboard**: [https://app.posthog.com/events](https://app.posthog.com/events)

**Note**: Events may take 1-2 minutes to appear in PostHog dashboard.

### 8. Verify Backend PostHog Client
- [ ] Check backend logs for PostHog initialization
- [ ] No errors related to PostHog should appear
- [ ] If errors: Verify `POSTHOG_API_KEY` format (must start with `phc_`)

### 9. Test Manual Sync (Optional - requires 24h of data)
After collecting events for 24 hours:

```bash
cd touring-be
node jobs/weeklyProfileSync.js
```

Expected output:
```
🔄 Starting PostHog weekly sync...
📡 Step 1/6: Fetching events from PostHog...
   Fetching page 1 (100 events/page)...
✅ Fetched 247 events from PostHog

🔄 Step 2/6: Transforming events...
✅ Transformed 247 events

📊 Step 3/6: Aggregating by user...
✅ Aggregated 23 user profiles
   Sample user 507f1f77bcf86cd799439011:
   - vibeWeights: {"beach":12.5,"adventure":8.3}
   - confidence: 0.87
   - travelStyle: adventurer

🧠 Step 4/6: Generating embeddings...
   Processing batch 1/1 (23 users)
✅ Generated 23 embeddings

💾 Step 5/6: Upserting to FAISS...
✅ Upserted 23 vectors to FAISS

💾 Step 6/6: Updating MongoDB...
   Processed 10/23 users...
   Processed 20/23 users...
✅ Updated 20 user profiles in MongoDB

✅ Weekly sync completed successfully
📊 Summary:
   Duration: 12.34s
   Events processed: 247
   Users found: 23
   Success: 20
   Skipped: 2 (confidence < 0.3)
   Failed: 1
   Top vibes: beach (15), adventure (12), mountain (8)
   Travel styles: adventurer: 8, relaxer: 5, explorer: 7
```

**Success criteria**:
- [x] No errors during execution
- [x] Events fetched > 0
- [x] Users found > 0
- [x] Success count > 0

**If errors**:
- Check MongoDB connection
- Check embedding service is running (port 8088)
- Check PostHog API credentials
- Review error messages in output

---

## Production Deployment

### 10. Environment Variables (Production)
Update these for production:

**Backend** (`touring-be/.env`):
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://your-production-db
EMBED_SERVICE_URL=https://your-embedding-service.com
POSTHOG_API_KEY=phc_production_key_here
POSTHOG_HOST=https://app.posthog.com
POSTHOG_PROJECT_ID=production_project_id
```

**Frontend** (`.env.production`):
```env
VITE_API_URL=https://api.travyy.com
VITE_POSTHOG_KEY=phc_production_key_here
VITE_POSTHOG_HOST=https://app.posthog.com
```

### 11. Cron Job Verification
- [ ] Backend server starts successfully
- [ ] Check logs for: `✅ Weekly PostHog sync cron started`
- [ ] Wait until next Sunday 2:00 AM for automatic sync
- [ ] Monitor logs after 2:00 AM for sync execution

### 12. Monitoring Setup
- [ ] Set up log monitoring (e.g., Logtail, Papertrail)
- [ ] Create alerts for sync failures
- [ ] Monitor PostHog event volume (stay under 1M/month)
- [ ] Track UserProfile update counts in MongoDB

### 13. Database Indexes
Ensure these indexes exist in MongoDB:

```javascript
// UserProfile collection
db.userprofiles.createIndex({ userId: 1 }, { unique: true })
db.userprofiles.createIndex({ lastSyncedAt: -1 })
db.userprofiles.createIndex({ confidence: -1 })
db.userprofiles.createIndex({ travelStyle: 1 })
```

Run in MongoDB shell:
```bash
mongosh "mongodb+srv://your-connection-string"
use travelApp
db.userprofiles.getIndexes()
```

---

## Post-Deployment

### 14. First Week Monitoring
- [ ] **Day 1**: Verify events appear in PostHog dashboard
- [ ] **Day 2**: Check event volume (should be < 5k events/day for 1k users)
- [ ] **Day 7**: Wait for first automatic sync (Sunday 2:00 AM)
- [ ] **Day 8**: Verify UserProfile updates in MongoDB

### 15. Performance Metrics
Track these metrics weekly:

| Metric | Target | Command |
|--------|--------|---------|
| PostHog events/day | < 33k | Check PostHog dashboard |
| Sync duration | < 60s | Check backend logs |
| Users synced | > 80% active | Check MongoDB |
| Confidence avg | > 0.5 | Query UserProfile |
| FAISS vectors | Match users | Check `ai/index/meta.json` |

### 16. User Privacy Compliance
- [ ] Add cookie consent banner to frontend
- [ ] Implement opt-out flow:
  ```javascript
  import { resetPostHog } from './utils/posthog';
  // On user opt-out:
  posthog.opt_out_capturing();
  resetPostHog();
  ```
- [ ] Add privacy policy mentioning PostHog
- [ ] Enable IP anonymization in PostHog settings

---

## Troubleshooting Guide

### Issue: Events not appearing in PostHog
**Check**:
- [ ] Browser console shows `✅ PostHog initialized`
- [ ] No ad blockers blocking PostHog
- [ ] `VITE_POSTHOG_KEY` is correct
- [ ] Wait 1-2 minutes for event ingestion

**Fix**:
```bash
# Frontend .env
VITE_POSTHOG_KEY=phc_YOUR_CORRECT_KEY
# Restart frontend
cd touring-fe && npm run dev
```

---

### Issue: Weekly sync fails with "401 Unauthorized"
**Check**:
- [ ] `POSTHOG_API_KEY` in backend `.env` is correct
- [ ] Key starts with `phc_`
- [ ] Project ID matches PostHog dashboard

**Fix**:
```bash
# Backend .env
POSTHOG_API_KEY=phc_YOUR_CORRECT_KEY
POSTHOG_PROJECT_ID=YOUR_PROJECT_ID
# Restart backend
cd touring-be && npm start
```

---

### Issue: No users synced
**Check**:
- [ ] PostHog has events (check dashboard)
- [ ] Events have `userId` property set
- [ ] Users exist in MongoDB
- [ ] Backend logs show errors

**Debug**:
```bash
cd touring-be
node jobs/weeklyProfileSync.js
# Review output for errors
```

---

### Issue: Embedding service unavailable
**Check**:
- [ ] Python service running: `curl http://localhost:8088/health`
- [ ] Port 8088 not blocked by firewall
- [ ] `EMBED_SERVICE_URL` in backend `.env` is correct

**Fix**:
```bash
# Terminal 3
cd ai
python app.py
# Verify output shows "Running on http://localhost:8088"
```

---

### Issue: FAISS index errors
**Check**:
- [ ] `ai/index/faiss.index` file exists
- [ ] File size > 0 bytes
- [ ] Dimensions match (384)

**Fix**:
```bash
cd ai
# Backup old index
mv index/faiss.index index/faiss.index.backup
# Restart Python service (will create new empty index)
python app.py
```

---

## Success Criteria

### ✅ Phase 1: Setup (Day 1)
- [x] All services start without errors
- [x] PostHog shows frontend events
- [x] Browser console shows `✅ PostHog initialized`

### ✅ Phase 2: Data Collection (Days 2-6)
- [x] Events accumulate in PostHog (check daily)
- [x] No backend errors in logs
- [x] Event volume < 33k/day

### ✅ Phase 3: First Sync (Day 7)
- [x] Sunday 2:00 AM sync completes successfully
- [x] UserProfile records updated in MongoDB
- [x] FAISS index contains user vectors
- [x] No errors in backend logs

### ✅ Phase 4: Recommendations (Day 8+)
- [x] Discovery API returns personalized results
- [x] Users see relevant recommendations
- [x] Recommendation quality improves over time

---

## Rollback Plan

If critical issues occur:

### Rollback Step 1: Disable PostHog Tracking (Frontend)
```javascript
// touring-fe/src/main.jsx
// Comment out PostHog initialization
// import { initPostHog } from "./utils/posthog";
// useEffect(() => {
//   initPostHog();
// }, []);
```

### Rollback Step 2: Disable Weekly Sync (Backend)
```javascript
// touring-be/server.js
// Comment out cron registration
// const { startWeeklySyncCron } = require('./jobs/weeklyProfileSync');
// startWeeklySyncCron();
```

### Rollback Step 3: Revert to Old Recommendation Logic
- Re-enable old TourInteraction/BlogInteraction models
- Use old recommendation endpoints
- Remove PostHog dependencies

---

## Next Steps After Successful Deployment

1. **Add Event Tracking to More Pages**:
   - TourDetailPage: Add `trackTourView()` on mount
   - BlogPage: Add `trackBlogView()` on mount
   - Checkout: Add `trackTourBooking()` on success

2. **Implement User Identification**:
   - Add `identifyUser()` call after login
   - Add `resetPostHog()` call on logout

3. **Create Admin Dashboard**:
   - Show sync statistics
   - Display top vibes/provinces
   - Monitor user profiles

4. **A/B Testing**:
   - Use PostHog feature flags
   - Test recommendation algorithms
   - Compare user engagement

5. **Scale PostHog**:
   - Monitor event volume
   - Upgrade to paid plan if > 1M events/month
   - Or self-host PostHog (open source)

---

## Documentation

- **Setup Guide**: `POSTHOG_SETUP_GUIDE.md`
- **Implementation Summary**: `POSTHOG_IMPLEMENTATION_SUMMARY.md`
- **This Checklist**: `POSTHOG_DEPLOYMENT_CHECKLIST.md`

---

**Questions?** Read the setup guide or check PostHog docs: [https://posthog.com/docs](https://posthog.com/docs)

**Ready to deploy!** 🚀
