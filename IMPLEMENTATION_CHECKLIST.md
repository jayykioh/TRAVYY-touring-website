#!/usr/bin/env node

/**
 * PHASE 1 IMPLEMENTATION CHECKLIST
 * Phần này để track progress của bạn
 * Copy-paste từng section vào editor và đánh dấu khi hoàn thành
 */

# ✅ PHASE 1: LOGISTIC REGRESSION - IMPLEMENTATION CHECKLIST

## PRE-REQUISITES

- [ ] Đã quyết định dùng Phase 1 (không dùng B hoặc C)
- [ ] Đã đọc QUICK_START_GUIDE.md
- [ ] Đã đọc LEARNING_RANKER_SETUP.md
- [ ] Đã hiểu cơ bản về logistic regression
- [ ] Node.js project chạy được (npm run dev)
- [ ] MongoDB kết nối được

---

## STEP 1: INSTALL DEPENDENCIES (5 min)

```bash
# In touring-be directory
npm install node-cron

# Verify
npm list node-cron
```

Checklist:
- [ ] node-cron installed
- [ ] npm list shows node-cron
- [ ] No errors in installation

---

## STEP 2: UPDATE USER MODEL (20 min)

File: `models/Users.js`

Current state before:
```javascript
// models/Users.js (before)
const userSchema = new mongoose.Schema({
  // ... existing fields
  email: String,
  name: String,
  // etc
});
```

Add after location field:
```javascript
// NEW FIELDS FOR LEARNING RANKER:

// User interactions (click/book events for learning)
interactions: [{
  zoneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone',
    required: true
  },
  type: {
    type: String,
    enum: ['click', 'book', 'skip'],
    default: 'click'
  },
  scores: {
    hardVibe: { type: Number, min: 0, max: 1 },
    embed: { type: Number, min: 0, max: 1 },
    proximity: { type: Number, min: 0, max: 1 },
    context: { type: Number, min: -1, max: 1 }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}],

// Per-user learned weights
preferences: {
  vibeWeights: {
    hardVibeWeight: {
      type: Number,
      default: 0.6,
      min: 0,
      max: 1
    },
    embedWeight: {
      type: Number,
      default: 0.4,
      min: 0,
      max: 1
    },
    proximityWeight: {
      type: Number,
      default: 0.1,
      min: 0,
      max: 1
    },
    contextWeight: {
      type: Number,
      default: 0.05,
      min: 0,
      max: 1
    },
    trainedAt: {
      type: Date,
      default: null
    },
    dataPoints: {
      type: Number,
      default: 0  // How many interactions were used
    }
  }
}
```

Checklist:
- [ ] Added interactions[] array
- [ ] Added preferences.vibeWeights object
- [ ] All fields have correct types
- [ ] Migration applied (no old data lost)
- [ ] Model validates correctly

Verification:
```bash
# Test model
node -e "const User = require('./models/Users'); console.log(User.schema.obj.interactions)"
```

---

## STEP 3: CREATE LOG-CLICK ENDPOINT (20 min)

File: `routes/discover.routes.js`

Add this route AFTER the /parse endpoint:

```javascript
/**
 * POST /discover/log-click
 * 
 * Log when user clicks a zone in results
 * Used for training the learning ranker
 * 
 * Request body:
 * {
 *   zoneId: "640e3a5f...",
 *   scores: {
 *     hardVibe: 0.8,
 *     embed: 0.7,
 *     proximity: 0.5,
 *     context: 0.3
 *   }
 * }
 */
router.post("/log-click", optionalAuth, async (req, res) => {
  try {
    // Get user ID from JWT
    const userId = req.user?.sub;
    
    // If not authenticated, skip logging (but don't error)
    if (!userId) {
      console.log('⚠️ [Discover] Skip logging: anonymous user');
      return res.json({ ok: true });
    }

    const { zoneId, scores } = req.body;

    // Validate input
    if (!zoneId || !scores) {
      return res.status(400).json({
        ok: false,
        error: 'MISSING_DATA',
        message: 'zoneId and scores required'
      });
    }

    // Import learning ranker
    const { logInteraction } = require('../services/zones/learning-ranker');

    // Log the interaction
    await logInteraction(userId, zoneId, 'click', scores);

    console.log(`✅ [Discover] Logged click: user=${userId}, zone=${zoneId}`);

    res.json({ ok: true });

  } catch (error) {
    console.error('❌ [Discover] Log error:', error);
    res.status(500).json({
      ok: false,
      error: 'LOG_ERROR',
      message: error.message
    });
  }
});
```

Checklist:
- [ ] Route added after /parse
- [ ] Uses optionalAuth middleware
- [ ] Gets userId from req.user.sub
- [ ] Validates zoneId and scores
- [ ] Calls logInteraction() correctly
- [ ] Returns proper response
- [ ] Error handling in place

Test it:
```bash
# With auth token
curl -X POST http://localhost:3001/api/discover/log-click \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "zoneId": "640e3a5f...",
    "scores": {
      "hardVibe": 0.8,
      "embed": 0.7,
      "proximity": 0.5,
      "context": 0.3
    }
  }'

# Response should be: {"ok": true}
```

---

## STEP 4: UPDATE MATCHER (25 min)

File: `services/zones/matcher.js`

### Step 4.1: Add import at top
```javascript
// Add this line near other imports:
const { getPersonalizedScore } = require('./learning-ranker');
const User = require('../../models/Users');  // Add if not exists
```

### Step 4.2: Update getMatchingZones function

Find this section in getMatchingZones:
```javascript
// OLD CODE (around line 60-80):
const scored = candidates.map(zone => {
  const scoreResult = scoreZone(zone, prefs || {}, userLocation);
  
  const finalScore = (scoreResult.hardVibeScore * 0.6) + ((zone.embedScore || 0) * 0.4);
  
  return {
    ...zone,
    // ...
  };
});
```

Replace with:
```javascript
// NEW CODE: Personalized scoring
const scored = candidates.map(zone => {
  const scoreResult = scoreZone(zone, prefs || {}, userLocation);
  
  // Get user weights if authenticated and trained
  let userWeights = null;
  if (options.userId && allUsers[options.userId]) {
    userWeights = allUsers[options.userId].preferences?.vibeWeights;
  }
  
  // Use personalized score or fallback to global
  const finalScore = getPersonalizedScore(userWeights, {
    hardVibe: scoreResult.hardVibeScore,
    embed: zone.embedScore || 0,
    proximity: scoreResult.proximityScore,
    context: scoreResult.contextScore
  });

  return {
    ...zone,
    // Main scores
    hardVibeScore: scoreResult.hardVibeScore,
    embedScore: zone.embedScore || 0,
    finalScore,
    
    // Context breakdown
    contextScore: scoreResult.contextScore,
    proximityScore: scoreResult.proximityScore,
    distanceKm: scoreResult.distanceKm,
    
    // For logging later
    scoreBreakdown: {
      hardVibe: scoreResult.hardVibeScore,
      embed: zone.embedScore || 0,
      proximity: scoreResult.proximityScore,
      context: scoreResult.contextScore
    },
    
    // Explanation
    reasons: scoreResult.reasons,
    details: scoreResult.details || null
  };
});
```

Wait, we need to simplify - user weights should be fetched at function start:

```javascript
// BETTER APPROACH: Fetch user once at start of function
async function getMatchingZones(prefs, options = {}) {
  // ... existing code ...
  
  // Fetch user for personalization (if authenticated)
  let userWeights = null;
  if (options.userId) {
    try {
      const user = await User.findById(options.userId)
        .select('preferences.vibeWeights')
        .lean();
      userWeights = user?.preferences?.vibeWeights;
      if (userWeights) {
        console.log(`🎯 [Matcher] Using learned weights for user:`, {
          hard: userWeights.hardVibeWeight?.toFixed(2),
          embed: userWeights.embedWeight?.toFixed(2),
          prox: userWeights.proximityWeight?.toFixed(2),
          ctx: userWeights.contextWeight?.toFixed(2)
        });
      }
    } catch (err) {
      console.warn('⚠️ [Matcher] Could not fetch user weights:', err.message);
    }
  }
  
  // ... existing scoring code, but use personalizedScore ...
  const scored = candidates.map(zone => {
    const scoreResult = scoreZone(zone, prefs || {}, userLocation);
    
    // Use personalized weights if available
    const finalScore = getPersonalizedScore(userWeights, {
      hardVibe: scoreResult.hardVibeScore,
      embed: zone.embedScore || 0,
      proximity: scoreResult.proximityScore,
      context: scoreResult.contextScore
    });
    
    return {
      // ... return object with finalScore, etc
    };
  });
}
```

Checklist:
- [ ] Import getPersonalizedScore added
- [ ] Import User model added
- [ ] User weights fetched if userId provided
- [ ] getPersonalizedScore called with correct params
- [ ] scoreBreakdown included in return (needed for logging)
- [ ] No syntax errors (check for typos)
- [ ] Console logs show weights being applied

Test it:
```bash
# Call /parse endpoint with auth
# Check logs - should see:
# "🎯 [Matcher] Using learned weights for user"
```

---

## STEP 5: ADD CRON JOB (15 min)

File: `server.js` (or wherever you start the Express app)

Add these imports at the top:
```javascript
const cron = require('node-cron');
const { batchTrainAllUsers } = require('./services/zones/learning-ranker');
```

Find this section (after app.listen):
```javascript
// CURRENT CODE:
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

Add the cron schedule:
```javascript
// AFTER app.listen():

// ===== SCHEDULE DAILY TRAINING =====
// Train all users daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  try {
    console.log('\n🚀 [Cron] Starting nightly model training...');
    console.log(`⏰ Time: ${new Date().toLocaleString()}`);
    
    const result = await batchTrainAllUsers();
    
    if (result) {
      console.log(`✅ [Cron] Training complete: ${result.trained}/${result.total} users`);
    }
  } catch (error) {
    console.error('❌ [Cron] Training failed:', error.message);
  }
});

console.log('✅ Cron jobs scheduled (daily training at 2 AM)');
```

Checklist:
- [ ] node-cron imported
- [ ] batchTrainAllUsers imported
- [ ] Cron schedule added after app.listen
- [ ] Logs will show at 2 AM daily
- [ ] No syntax errors

Test it (manual):
```bash
# Instead of waiting until 2 AM, test immediately:
node -e "
  const { batchTrainAllUsers } = require('./services/zones/learning-ranker');
  batchTrainAllUsers();
"

# Should output:
# 🚀 [LearningRanker] Starting batch training...
```

---

## STEP 6: UPDATE FRONTEND (20 min, OPTIONAL)

File: `src/pages/discover/Results.jsx` (or wherever zones are displayed)

Find the click handler:
```javascript
// CURRENT CODE:
function handleZoneClick(zone) {
  navigate(`/zone/${zone.id}`);
}
```

Replace with:
```javascript
// NEW CODE: Log click before navigating
async function handleZoneClick(zone) {
  try {
    // Log the interaction for learning (fire and forget)
    const scores = {
      hardVibe: zone.scoreBreakdown?.hardVibe || 0,
      embed: zone.scoreBreakdown?.embed || 0,
      proximity: zone.scoreBreakdown?.proximity || 0,
      context: zone.scoreBreakdown?.context || 0
    };

    console.log('📊 Logging click:', { zoneId: zone._id, scores });

    // Send to backend (don't wait for response)
    fetch('/api/discover/log-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        zoneId: zone._id,
        scores
      })
    }).catch(err => console.error('⚠️ Failed to log:', err));

    // Navigate immediately (don't wait for logging)
    navigate(`/zone/${zone.id}`);

  } catch (error) {
    console.error('❌ Click error:', error);
    navigate(`/zone/${zone.id}`); // Still navigate even if logging fails
  }
}
```

Checklist:
- [ ] handleZoneClick updated
- [ ] Logs zone click with scores
- [ ] Uses scoreBreakdown from zone object
- [ ] Fire-and-forget (no wait)
- [ ] Falls back to navigation if logging fails
- [ ] No TypeScript errors (if using TS)

---

## STEP 7: VERIFICATION (30 min)

### 7.1: Unit Test learning-ranker
```bash
node -e "
const { getPersonalizedScore } = require('./services/zones/learning-ranker');

// Test with default weights
const score1 = getPersonalizedScore(null, {
  hardVibe: 0.8,
  embed: 0.6,
  proximity: 0.5,
  context: 0.3
});
console.log('Default weights score:', score1);  // Should be ~0.68

// Test with custom weights
const score2 = getPersonalizedScore({
  hardVibeWeight: 0.9,
  embedWeight: 0.1,
  proximityWeight: 0,
  contextWeight: 0
}, {
  hardVibe: 0.8,
  embed: 0.6,
  proximity: 0.5,
  context: 0.3
});
console.log('Custom weights score:', score2);  // Should be ~0.72
"
```

Expected output:
```
Default weights score: 0.68
Custom weights score: 0.72
```

Checklist:
- [ ] getPersonalizedScore returns correct values
- [ ] Formula is correct: w1*h + w2*e + w3*p + w4*c

### 7.2: Test logInteraction
```bash
# In MongoDB shell:
use your_database

# Check if interactions field exists
db.users.findOne({}).interactions

# Should return (empty initially):
# undefined or []
```

Checklist:
- [ ] User schema updated in MongoDB
- [ ] Can access user.interactions

### 7.3: Test log-click endpoint
```bash
# Get a valid user ID from your DB
# Get a valid zone ID from your DB

curl -X POST http://localhost:3001/api/discover/log-click \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "zoneId": "VALID_ZONE_ID",
    "scores": {
      "hardVibe": 0.8,
      "embed": 0.7,
      "proximity": 0.5,
      "context": 0.3
    }
  }'

# Expected response: {"ok": true}
```

Checklist:
- [ ] Endpoint returns 200 OK
- [ ] Response is {"ok": true}
- [ ] No errors in console logs

### 7.4: Verify in MongoDB
```bash
# After calling log-click, check:
db.users.findOne({_id: ObjectId("YOUR_USER_ID")}).interactions

# Should show:
[
  {
    zoneId: ObjectId("..."),
    type: "click",
    scores: {hardVibe: 0.8, ...},
    timestamp: ISODate("...")
  }
]
```

Checklist:
- [ ] Interaction logged in MongoDB
- [ ] All fields present
- [ ] Timestamp is correct

### 7.5: Manual Training Test
```bash
# Manually trigger training (for testing before 2 AM):
node -e "
const { trainUserModel } = require('./services/zones/learning-ranker');
const userId = 'YOUR_USER_ID'; // Get from MongoDB

trainUserModel(userId).then(result => {
  console.log('Training result:', result);
});
"
```

Expected output:
```
✅ [LearningRanker] Model trained for USER_ID
   New weights: hard=0.65, embed=0.35, prox=0.10, ctx=0.05
```

Checklist:
- [ ] Training runs without errors
- [ ] Weights are returned
- [ ] Weights are normalized (sum ~= 1.0)

### 7.6: Verify Weights in MongoDB
```bash
# Check if weights updated:
db.users.findOne({_id: ObjectId("YOUR_USER_ID")}).preferences.vibeWeights

# Should show:
{
  hardVibeWeight: 0.65,
  embedWeight: 0.35,
  proximityWeight: 0.10,
  contextWeight: 0.05,
  trainedAt: ISODate("..."),
  dataPoints: 5
}
```

Checklist:
- [ ] vibeWeights object exists
- [ ] All 4 weights present
- [ ] trainedAt is set
- [ ] dataPoints matches interaction count

---

## STEP 8: DEPLOYMENT (10 min)

Checklist before deploying:
- [ ] All code changes committed
- [ ] No TypeScript/syntax errors: `npm run build`
- [ ] No console errors on startup: `npm run dev`
- [ ] Cron schedule set correctly (will run at 2 AM)
- [ ] Environmental variables set (if needed)

Deploy to production:
```bash
# 1. Push to main branch
git add .
git commit -m "feat: Add learning ranker Phase 1"
git push origin main

# 2. Deploy (whatever your process is)
# e.g., docker push, vercel deploy, heroku deploy, etc.

# 3. Verify on production:
# - Check logs for "✅ Cron jobs scheduled"
# - Test /discover/log-click endpoint
# - Check MongoDB for interactions field
```

Checklist:
- [ ] Code deployed
- [ ] Server started without errors
- [ ] Can call /discover/parse
- [ ] Can call /discover/log-click
- [ ] MongoDB connected
- [ ] Cron scheduled

---

## STEP 9: MONITORING (ONGOING)

### Daily (automated in logs)
```
Look for:
✅ [LearningRanker] Batch training start at 2 AM
✅ [LearningRanker] Training complete: X/Y users
```

### Weekly
```
1. Count interactions logged:
   db.users.aggregate([
     {$project: {count: {$size: "$interactions"}}},
     {$group: {_id: null, total: {$sum: "$count"}}}
   ])
   
   Expected: >= 50 interactions after 1 week

2. Count trained users:
   db.users.countDocuments({"preferences.vibeWeights.trainedAt": {$exists: true}})
   
   Expected: >= 10% of active users after 1 week

3. Check weight variance:
   db.users.aggregate([
     {$match: {"preferences.vibeWeights.trainedAt": {$exists: true}}},
     {$group: {
       _id: null,
       avgHard: {$avg: "$preferences.vibeWeights.hardVibeWeight"},
       avgEmbed: {$avg: "$preferences.vibeWeights.embedWeight"}
     }}
   ])
   
   Expected: Should be different from default (0.6/0.4)
```

### Week 4: Measure Impact
```
Calculate CTR improvement:

1. Baseline (Week 1):
   - Zone A: 10 clicks / 100 shown = 10% CTR
   - Zone B: 5 clicks / 100 shown = 5% CTR
   - Avg: 7.5% CTR

2. After training (Week 4):
   - Zone A: 12 clicks / 100 shown = 12% CTR
   - Zone B: 8 clicks / 100 shown = 8% CTR
   - Avg: 10% CTR

3. Improvement:
   (10% - 7.5%) / 7.5% = 33% improvement! ✅
   
   Or simpler: CTR went from 7.5% to 10% (+2.5% points, +33%)
   Expected: +10-25% (absolute) or +15-25% (relative)
```

Checklist:
- [ ] Logging automated interactions daily
- [ ] Training running nightly without errors
- [ ] Weights updating in DB
- [ ] CTR trend going up (not down)
- [ ] No data corruption

---

## STEP 10: DECISION POINT (Week 4)

After 1 month, evaluate:

```
IF CTR improved +10-25%:
  ✅ SUCCESS - Keep running Phase 1
     Next: Plan Phase 2 (Collaborative Filtering) for cold-start
     Timeline: 4-6 weeks from now

IF CTR improved 0-10%:
  ⚠️ MARGINAL - Debug and iterate
     - Check: Are weights converging?
     - Check: Is interaction quality good?
     - Check: Is model overfitting?
     Try: Adjust learning rate, increase training data

IF CTR degraded (negative):
  ❌ PROBLEM - Rollback immediately
     - Revert matcher.js to use 0.6/0.4 weights
     - Debug: Why is personalization hurting?
     - Investigate: Data quality, label definition, model bugs
```

---

## ROLLBACK PLAN (if needed)

If things go wrong, quickly revert:

```javascript
// In services/zones/matcher.js, revert to:
const finalScore = (scoreResult.hardVibeScore * 0.6) + ((zone.embedScore || 0) * 0.4);

// Don't call getPersonalizedScore()
```

This takes 2 minutes and immediately reverts to old behavior.

---

## SUCCESS! 🎉

If you completed all steps:

✅ Phase 1 learning ranker is live
✅ Users' clicks are being logged
✅ Models training nightly
✅ Personalized ranking is active
✅ Ready to measure impact in 4 weeks

Next phase decision comes after Week 4 results.

---

## Need Help?

Stuck somewhere?

1. Check the logs: `npm run dev` and look for error messages
2. Read LEARNING_RANKER_SETUP.md section by section
3. Check MongoDB directly: can you see interactions?
4. Test endpoints manually with curl
5. Check learning-ranker.js for debugging tips

Good luck! 🚀
