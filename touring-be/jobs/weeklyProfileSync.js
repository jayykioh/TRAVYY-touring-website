const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const cron = require('node-cron');
const eventFetcher = require('../services/posthog/event-fetcher');
const aggregator = require('../services/posthog/aggregator');
const { embed } = require('../services/ai/libs/embedding-client');
const { upsert } = require('../services/ai/libs/embedding-client');
const UserProfile = require('../models/UserProfile');

/**
 * Weekly sync job: PostHog → MongoDB → Embedding → FAISS
 * Run every Sunday at 2:00 AM to process last 7 days of events
 * 
 * Usage:
 * - Production: Auto-run by cron (Sunday 2:00 AM)
 * - Manual test: node jobs/weeklyProfileSync.js
 */
async function weeklyProfileSync() {
  console.log('\n🔄 ============================================');
  console.log('   WEEKLY PROFILE SYNC STARTED');
  console.log('   ' + new Date().toISOString());
  console.log('   MODE: POSTHOG API');
  console.log('============================================\n');
  
  const startTime = Date.now();
  
  try {
    // Step 1: Fetch events from PostHog (last 7 days)
    console.log('📥 Step 1/6: Fetching events from PostHog...');
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    
    const rawEvents = await eventFetcher.fetchEvents(sevenDaysAgo, now);
    
    if (rawEvents.length === 0) {
      console.log('⚠️ No events to process. Exiting.');
      return {
        success: true,
        message: 'No events to process',
        stats: { events: 0, users: 0 }
      };
    }
    
    // Step 2: Transform events
    console.log('\n🔄 Step 2/6: Transforming events...');
    const events = rawEvents.map(e => eventFetcher.transformEvent(e));
    console.log(`✅ Transformed ${events.length} events`);
    
    // Step 3: Aggregate events by user
    console.log('\n📊 Step 3/6: Aggregating by user...');
    const userProfiles = aggregator.aggregateByUser(events);
    
    // Print summary stats
    const stats = aggregator.getSummaryStats(userProfiles);
    console.log('\n📈 Aggregation Summary:');
    console.log(`   Users: ${stats.totalUsers}`);
    console.log(`   Total events: ${stats.totalEvents}`);
    console.log(`   Avg events/user: ${stats.avgEventsPerUser}`);
    console.log(`   Avg confidence: ${stats.avgConfidence}`);
    console.log(`   Top vibes:`, stats.topVibes.slice(0, 5).map(v => v.vibe).join(', '));
    
    console.log(`\n🚀 Step 4/6: Processing ${userProfiles.size} user profiles...`);
    
    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;
    const errors = [];
    
    // Step 4-6: Process each user (embed + upsert + save)
    for (const [userId, profile] of userProfiles) {
      try {
        // Skip non-MongoDB ObjectId userIds (UUID format, test users)
        // MongoDB ObjectId: 24 hex chars (e.g., 68fd7546efb1cb237e15ae25)
        // PostHog UUID: 36 chars with dashes (e.g., 019a8144-d337-7abd-b52a-c4d6c57d1f11)
        if (!/^[a-f0-9]{24}$/i.test(userId)) {
          console.log(`   ⚠️ User ${userId}: Invalid ObjectId format, skipping`);
          skippedCount++;
          continue;
        }
        
        // Build weighted text for embedding
        const weightedText = aggregator.buildWeightedText(profile);
        
        // Skip if truly no data (no vibes AND no interactions)
        if (!weightedText || weightedText.trim().length === 0) {
          console.log(`   ⚠️ User ${userId}: No data to process, skipping`);
          skippedCount++;
          continue;
        }
        
        // Step 4: Get embedding vector
        const { embeddings } = await embed([weightedText]);
        const userVector = embeddings[0];
        
        if (!userVector || userVector.length !== 1024) {
          throw new Error(`Invalid embedding vector (length: ${userVector?.length || 0}, expected: 1024)`);
        }
        
        // Step 5: Upsert to FAISS
        await upsert([{
          id: userId,
          type: 'user',
          text: weightedText,
          vector: userVector,
          metadata: {
            vibes: Object.keys(profile.vibeWeights).slice(0, 5),
            provinces: Object.keys(profile.provinceWeights).slice(0, 3),
            totalWeight: profile.totalWeight.toFixed(2),
            updatedAt: new Date().toISOString()
          }
        }]);
        
        // Step 6: Update MongoDB UserProfile
        const confidence = aggregator.calculateConfidence(profile);
        const travelStyle = aggregator.detectTravelStyle(profile);
        
        // Build interactionSummary (freeText for hybrid search)
        const interactionSummary = (profile.interactionTexts || [])
          .slice(0, 10) // Top 10 interactions
          .join(', ');
        
        // Convert to Map for MongoDB (vibeProfile with full metadata)
        // Sanitize keys: Remove MongoDB special characters ($, ., leading/trailing spaces)
        const vibeProfile = new Map();
        for (const [vibe, weight] of Object.entries(profile.vibeWeights)) {
          // Sanitize key: replace $, . with _, trim spaces
          const cleanVibe = vibe.replace(/[$.]/g, '_').trim();
          if (cleanVibe) { // Skip empty keys
            vibeProfile.set(cleanVibe, {
              weight,
              interactions: profile.eventCounts[vibe] || 0,
              lastUpdated: new Date()
            });
          }
        }
        
        // Convert to Map for MongoDB (provinceProfile with full metadata)
        const provinceProfile = new Map();
        for (const [province, weight] of Object.entries(profile.provinceWeights)) {
          // Sanitize key: replace $, . with _, trim spaces
          const cleanProvince = province.replace(/[$.]/g, '_').trim();
          if (cleanProvince) { // Skip empty keys
            provinceProfile.set(cleanProvince, {
              weight,
              interactions: profile.eventCounts[province] || 0,
              lastUpdated: new Date()
            });
          }
        }
        
        // Use override model if available (for manual runs with local connection)
        const UserProfileModel = global.__UserProfileOverride || UserProfile;
        
        // Sanitize eventCounts keys (remove $, .)
        const cleanEventCounts = {};
        for (const [key, count] of Object.entries(profile.eventCounts)) {
          const cleanKey = key.replace(/[$.]/g, '_').trim();
          if (cleanKey && !cleanKey.startsWith('_')) {
            cleanEventCounts[cleanKey] = count;
          }
        }
        
        await UserProfileModel.findOneAndUpdate(
          { userId },
          {
            userId,
            vibeProfile,
            provinceProfile,
            totalInteractions: profile.totalEvents,
            confidence,
            travelStyle,
            interactionSummary, // FreeText for AI semantic matching
            lastSyncedAt: new Date(),
            embeddingVector: userVector, // Cache embedding vector
            eventCounts: cleanEventCounts // Use sanitized event counts
          },
          { upsert: true, new: true }
        );
        
        console.log(`   ✅ User ${userId}: Saved to MongoDB (confidence=${confidence.toFixed(2)}, style=${travelStyle})`);
        
        successCount++;
        
        if (successCount % 10 === 0) {
          console.log(`   📈 Progress: ${successCount}/${userProfiles.size} users synced...`);
        }
        
      } catch (error) {
        failCount++;
        const errorMsg = `User ${userId}: ${error.message}`;
        console.error(`   ❌ ${errorMsg}`);
        errors.push(errorMsg);
        
        // Stop if too many errors
        if (failCount > 10) {
          console.error('\n❌ Too many errors (>10), stopping sync');
          break;
        }
      }
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n✅ ============================================');
    console.log('   WEEKLY PROFILE SYNC COMPLETE');
    console.log('============================================');
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`📊 Events processed: ${events.length}`);
    console.log(`👤 Users synced: ${successCount}`);
    console.log(`⚠️  Skipped: ${skippedCount}`);
    console.log(`❌ Failed: ${failCount}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(err => console.log(`   - ${err}`));
    }
    
    return {
      success: true,
      stats: {
        duration,
        events: events.length,
        users: userProfiles.size,
        synced: successCount,
        skipped: skippedCount,
        failed: failCount
      },
      errors
    };
    
  } catch (error) {
    console.error('\n❌ ============================================');
    console.error('   WEEKLY SYNC FATAL ERROR');
    console.error('============================================');
    console.error(error);
    
    throw error;
  }
}

/**
 * Start cron job (every Sunday at 2:00 AM)
 */
function startWeeklySyncCron() {
  // Cron format: minute hour day month weekday
  // 0 2 * * 0 = Every Sunday at 2:00 AM
  cron.schedule('0 2 * * 0', async () => {
    console.log('\n⏰ Cron triggered: Weekly profile sync');
    try {
      await weeklyProfileSync(false);
    } catch (error) {
      console.error('❌ Cron job failed:', error);
    }
  }, { timezone: "Asia/Ho_Chi_Minh" });
  
  console.log('⏰ Weekly profile sync cron started (Every Sunday 2:00 AM)');
  console.log('   Data source: PostHog API');
}

// Export functions
module.exports = {
  weeklyProfileSync,
  startWeeklySyncCron
};

// CLI execution (manual run)
if (require.main === module) {
  const mongoose = require('mongoose');
  const path = require('path');
  
  // Load .env from touring-be root directory
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
  
  // Use MONGO_URI from .env (should be Atlas in production)
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/travelApp';
  console.log(`🔗 Connecting to: ${MONGO_URI.includes('mongodb+srv') ? 'MongoDB Atlas' : 'Local MongoDB'}`);
  
  const mainConn = mongoose.createConnection(MONGO_URI);
  
  // Override UserProfile to use this local connection
  const UserProfileModel = mainConn.model('UserProfile', require('../models/UserProfile').schema);
  
  // Replace the imported models with local connection versions
  Object.defineProperty(global, '__UserProfileOverride', {
    value: UserProfileModel,
    writable: false
  });
  
  // Wait for mainConn to be ready
  const waitForConnection = () => new Promise((resolve, reject) => {
    if (mainConn.readyState === 1) {
      resolve();
    } else {
      mainConn.once('open', resolve);
      mainConn.once('error', reject);
    }
  });
  
  waitForConnection()
    .then(async () => {
      console.log('✅ MongoDB connected');
      console.log('🚀 Running weeklyProfileSync manually...');
      console.log('   Mode: POSTHOG API\n');
      
      try {
        const result = await weeklyProfileSync(false);
        console.log('\n📊 Final result:', JSON.stringify(result, null, 2));
      } catch (error) {
        console.error('❌ Sync failed:', error);
        process.exit(1);
      }
      
      await mainConn.close();
      console.log('\n✅ MongoDB disconnected');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ MongoDB connection error:', error);
      process.exit(1);
    });
}
