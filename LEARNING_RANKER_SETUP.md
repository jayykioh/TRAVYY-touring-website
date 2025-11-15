/**
 * SETUP: Integrate Learning Ranker into existing pipeline
 * 
 * This script shows exact changes needed to enable Phase 1:
 * Per-user logistic regression ranking
 */

// ============================================
// 1. UPDATE User Model (models/Users.js)
// ============================================

/*
Add these fields to user schema:

interactions: [{
  zoneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone'
  },
  type: {
    type: String,
    enum: ['click', 'book', 'skip'],
    default: 'click'
  },
  scores: {
    hardVibe: Number,
    embed: Number,
    proximity: Number,
    context: Number,
    final: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}],

preferences: {
  vibeWeights: {
    hardVibeWeight: {
      type: Number,
      default: 0.6
    },
    embedWeight: {
      type: Number,
      default: 0.4
    },
    proximityWeight: {
      type: Number,
      default: 0.1
    },
    contextWeight: {
      type: Number,
      default: 0.05
    },
    trainedAt: Date,
    dataPoints: Number // How many interactions were used to train
  }
}
*/

// ============================================
// 2. UPDATE Discover Routes
// ============================================

/*
// routes/discover.routes.js

Add import:
const { logInteraction } = require("../services/zones/learning-ranker");

In /parse endpoint, after getMatchingZones, add:
  // Attach userId to results for logging
  const userId = req.user?.sub;
  const resultsWithLogging = result.zones.map(zone => ({
    ...zone,
    __userId: userId,
    __scoreBreakdown: {
      hardVibe: zone.hardVibeScore,
      embed: zone.embedScore,
      proximity: zone.proximityScore,
      context: zone.contextScore
    }
  }));

Add new route for logging clicks:
router.post("/log-click", optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.json({ ok: true }); // Skip if not authenticated
    }

    const { zoneId, scores } = req.body;
    
    await logInteraction(userId, zoneId, 'click', scores);
    
    res.json({ ok: true });
  } catch (error) {
    console.error('❌ [Discover] Log click error:', error);
    res.json({ ok: false, error: error.message });
  }
});
*/

// ============================================
// 3. UPDATE Matcher (services/zones/matcher.js)
// ============================================

/*
Add import:
const { getPersonalizedScore } = require('./learning-ranker');

In getMatchingZones function, after scoring:

// OLD:
const finalScore = (scoreResult.hardVibeScore * 0.6) + ((zone.embedScore || 0) * 0.4);

// NEW:
let user = null;
if (options.userId) {
  try {
    user = await User.findById(options.userId).select('preferences').lean();
  } catch (err) {
    console.warn('❌ Could not fetch user for personalization');
  }
}

const userWeights = user?.preferences?.vibeWeights;
const finalScore = getPersonalizedScore(userWeights, {
  hardVibe: scoreResult.hardVibeScore,
  embed: zone.embedScore || 0,
  proximity: scoreResult.proximityScore,
  context: scoreResult.contextScore
});

Also include scoreBreakdown in returned object:
return {
  ...zone,
  hardVibeScore: scoreResult.hardVibeScore,
  embedScore: zone.embedScore || 0,
  finalScore,
  contextScore: scoreResult.contextScore,
  proximityScore: scoreResult.proximityScore,
  scoreBreakdown: {
    hardVibe: scoreResult.hardVibeScore,
    embed: zone.embedScore || 0,
    proximity: scoreResult.proximityScore,
    context: scoreResult.contextScore
  },
  reasons: scoreResult.reasons,
  details: scoreResult.details || null
};
*/

// ============================================
// 4. ADD CRON JOB (server.js)
// ============================================

/*
At top of server.js:
const cron = require('node-cron');
const { batchTrainAllUsers } = require('./services/zones/learning-ranker');

After app.listen():
// Train all users daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  try {
    console.log('🚀 [Cron] Starting nightly model training...');
    const result = await batchTrainAllUsers();
    console.log(`✅ [Cron] Training complete: ${result.trained}/${result.total}`);
  } catch (error) {
    console.error('❌ [Cron] Training failed:', error);
  }
});

console.log('✅ Cron jobs scheduled');
*/

// ============================================
// 5. UPDATE Frontend (ViDoi.jsx)
// ============================================

/*
After user clicks a zone result, log the interaction:

async function handleZoneClick(zone, scores) {
  try {
    // Log interaction for learning
    await fetch('/api/discover/log-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        zoneId: zone._id,
        scores: {
          hardVibe: scores.hardVibeScore,
          embed: scores.embedScore,
          proximity: scores.proximityScore,
          context: scores.contextScore
        }
      })
    });
    
    // Navigate to zone detail
    navigate(`/zone/${zone.id}`);
  } catch (error) {
    console.error('❌ Failed to log interaction:', error);
    navigate(`/zone/${zone.id}`); // Still navigate even if logging fails
  }
}
*/

// ============================================
// 6. INSTALL DEPENDENCIES
// ============================================

/*
npm install node-cron

Already installed:
- mongoose (for MongoDB)
- express (for routes)
*/

// ============================================
// 7. TESTING
// ============================================

/*
After implementing, test:

1. Log some interactions:
   curl -X POST http://localhost:3001/api/discover/log-click \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <token>" \
     -d '{
       "zoneId": "640e...",
       "scores": {
         "hardVibe": 0.8,
         "embed": 0.7,
         "proximity": 0.5,
         "context": 0.3
       }
     }'

2. Check user.interactions in MongoDB:
   db.users.findOne({_id: ObjectId("...")}).interactions

3. Manually train a user (for testing):
   node -e "require('./services/zones/learning-ranker').trainUserModel('userId')"

4. Check learned weights:
   db.users.findOne({_id: ObjectId("...")}).preferences.vibeWeights

5. Verify weights apply in ranking:
   - Call /discover/parse with same user
   - Check if zone ranking changed
*/

// ============================================
// 8. MONITORING
// ============================================

/*
After 1 week, analyze:

1. How many users have 5+ interactions?
   db.users.countDocuments({"interactions.4": {$exists: true}})

2. Weight distribution (are they learning?):
   db.users.aggregate([
     {$match: {"preferences.vibeWeights.trainedAt": {$exists: true}}},
     {$group: {
       _id: null,
       avgHardVibe: {$avg: "$preferences.vibeWeights.hardVibeWeight"},
       avgEmbed: {$avg: "$preferences.vibeWeights.embedWeight"},
       avgProx: {$avg: "$preferences.vibeWeights.proximityWeight"}
     }}
   ])

3. Are weights converging or diverging?
   Compare week 1 vs week 2 averages

4. CTR improvement:
   Track clicks per zone before/after personalization
*/

module.exports = {
  notes: "See comments above for exact implementation steps"
};
