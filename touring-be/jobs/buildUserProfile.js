const cron = require('node-cron');
const UserProfile = require('../models/UserProfile');
const TourInteraction = require('../models/TourInteraction');
const BlogInteraction = require('../models/BlogInteraction');
const DailyAskAnswer = require('../models/DailyAskAnswer');

/**
 * Build user profile from interaction history
 * Simplified: Tours + Blogs + Daily Ask only (no zones)
 * Runs nightly at 00:00
 */
async function buildUserProfile() {
  console.log('🔄 [Cron] Building user profiles...');

  try {
    // Get all users with interactions in last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Get distinct users from all interaction types
    const tourUserIds = await TourInteraction.distinct('userId', {
      timestamp: { $gte: ninetyDaysAgo }
    });
    const blogUserIds = await BlogInteraction.distinct('userId', {
      timestamp: { $gte: ninetyDaysAgo }
    });
    const dailyAskUserIds = await DailyAskAnswer.distinct('userId', {
      answeredAt: { $gte: ninetyDaysAgo }
    });

    // Merge all user IDs
    const activeUserIds = [...new Set([...tourUserIds, ...blogUserIds, ...dailyAskUserIds])];

    console.log(`📊 [Cron] Found ${activeUserIds.length} active users (last 90 days)`);

    for (const userId of activeUserIds) {
      try {
        await buildProfileForUser(userId);
      } catch (error) {
        console.error(`❌ [Cron] Error building profile for user ${userId}:`, error.message);
      }
    }

    console.log('✅ [Cron] Profile build completed');

  } catch (error) {
    console.error('❌ [Cron] Profile build failed:', error);
  }
}

/**
 * Build profile for single user
 * Uses simplified tracking data: tours (metadata.vibes/provinces), blogs (relatedVibes/Provinces), daily ask
 */
async function buildProfileForUser(userId) {
  // Get interactions from last 90 days
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const tourInteractions = await TourInteraction.find({
    userId,
    timestamp: { $gte: ninetyDaysAgo }
  }).lean();

  const blogInteractions = await BlogInteraction.find({
    userId,
    timestamp: { $gte: ninetyDaysAgo }
  }).lean();

  // Get daily ask answers
  const dailyAsks = await DailyAskAnswer.find({
    userId,
    answeredAt: { $gte: ninetyDaysAgo }
  }).lean();

  // Calculate vibe weights and province preferences
  const vibeWeights = {};
  const provinceWeights = {};
  
  const actionWeights = {
    booking: 3,   // Booking = strongest signal (highest weight)
    bookmark: 1.5,
    click: 1,
    view: 0.5
  };

  // Process tour interactions (extract vibes + provinces from metadata)
  for (const interaction of tourInteractions) {
    const weight = actionWeights[interaction.action] || 0;
    
    // Extract vibes from tour metadata
    if (interaction.metadata?.vibes && Array.isArray(interaction.metadata.vibes)) {
      for (const vibe of interaction.metadata.vibes) {
        if (!vibeWeights[vibe]) {
          vibeWeights[vibe] = { weight: 0, interactions: 0 };
        }
        vibeWeights[vibe].weight += weight;
        vibeWeights[vibe].interactions += 1;
        vibeWeights[vibe].lastUpdated = interaction.timestamp;
      }
    }

    // Extract provinces from tour metadata
    if (interaction.metadata?.provinces && Array.isArray(interaction.metadata.provinces)) {
      for (const province of interaction.metadata.provinces) {
        if (!provinceWeights[province]) {
          provinceWeights[province] = { weight: 0, interactions: 0 };
        }
        provinceWeights[province].weight += weight;
        provinceWeights[province].interactions += 1;
        provinceWeights[province].lastUpdated = interaction.timestamp;
      }
    }

    if (interaction.action === 'booking') {
      console.log(`[Profile] User ${userId} booked tour ${interaction.tourId} - high confidence signal (×3.0)`);
    }
  }

  // Process blog interactions (extract vibes + provinces from blog data)
  for (const interaction of blogInteractions) {
    const weight = 0.8; // Blog reading = medium signal
    
    if (interaction.relatedVibes && interaction.relatedVibes.length > 0) {
      for (const vibe of interaction.relatedVibes) {
        if (!vibeWeights[vibe]) {
          vibeWeights[vibe] = { weight: 0, interactions: 0 };
        }
        vibeWeights[vibe].weight += weight;
        vibeWeights[vibe].interactions += 1;
        vibeWeights[vibe].lastUpdated = interaction.timestamp;
      }
    }

    if (interaction.relatedProvinces && interaction.relatedProvinces.length > 0) {
      for (const province of interaction.relatedProvinces) {
        if (!provinceWeights[province]) {
          provinceWeights[province] = { weight: 0, interactions: 0 };
        }
        provinceWeights[province].weight += weight;
        provinceWeights[province].interactions += 1;
        provinceWeights[province].lastUpdated = interaction.timestamp;
      }
    }
  }

  // Process daily asks (weight = 2.0, second highest)
  for (const ask of dailyAsks) {
    if (ask.selectedVibes && ask.selectedVibes.length > 0) {
      for (const vibe of ask.selectedVibes) {
        if (!vibeWeights[vibe]) {
          vibeWeights[vibe] = { weight: 0, interactions: 0 };
        }
        vibeWeights[vibe].weight += 2; // Daily ask weight = 2
        vibeWeights[vibe].interactions += 1;
        vibeWeights[vibe].lastUpdated = ask.answeredAt;
      }
    }
  }

  // Normalize weights to 0-1
  const maxWeight = Math.max(...Object.values(vibeWeights).map(v => v.weight), 1);
  for (const vibe in vibeWeights) {
    vibeWeights[vibe].weight = vibeWeights[vibe].weight / maxWeight;
  }

  // Normalize province weights
  const maxProvinceWeight = Math.max(...Object.values(provinceWeights).map(v => v.weight), 1);
  for (const province in provinceWeights) {
    provinceWeights[province].weight = provinceWeights[province].weight / maxProvinceWeight;
  }

  // Detect travel style from vibe weights
  const travelStyle = detectTravelStyle(vibeWeights);

  // Calculate confidence (0-1 scale based on interaction count)
  const totalInteractions = tourInteractions.length + blogInteractions.length + dailyAsks.length;
  const confidence = Math.min(totalInteractions / 20, 1); // 20+ interactions = full confidence

  // Get top vibes (for itinerary creation)
  const topVibes = Object.entries(vibeWeights)
    .sort((a, b) => b[1].weight - a[1].weight)
    .slice(0, 5)
    .map(([vibe]) => vibe);

  // Get top provinces (for itinerary creation)
  const topProvinces = Object.entries(provinceWeights)
    .sort((a, b) => b[1].weight - a[1].weight)
    .slice(0, 5)
    .map(([province]) => province);

  // Update profile
  const vibeProfile = new Map();
  for (const [vibe, data] of Object.entries(vibeWeights)) {
    vibeProfile.set(vibe, data);
  }

  const provinceProfile = new Map();
  for (const [province, data] of Object.entries(provinceWeights)) {
    provinceProfile.set(province, data);
  }

  await UserProfile.findOneAndUpdate(
    { userId },
    {
      $set: {
        vibeProfile,
        provinceProfile,
        preferredVibes: topVibes,
        preferredRegions: topProvinces,
        travelStyle,
        confidence,
        totalInteractions,
        lastSyncedAt: new Date()
      }
    },
    { upsert: true }
  );

  console.log(`✅ [Profile] User ${userId}: confidence=${confidence.toFixed(2)}, style=${travelStyle}, interactions=${totalInteractions}, top vibes=[${topVibes.join(', ')}], top provinces=[${topProvinces.join(', ')}]`);
}

/**
 * Detect travel style from vibe weights
 */
function detectTravelStyle(vibeWeights) {
  const adventureScore = (vibeWeights.adventure?.weight || 0) + (vibeWeights.hiking?.weight || 0);
  const relaxScore = (vibeWeights.beach?.weight || 0) + (vibeWeights.relaxation?.weight || 0);
  const cultureScore = (vibeWeights.culture?.weight || 0) + (vibeWeights.history?.weight || 0);
  const foodScore = (vibeWeights.food?.weight || 0) + (vibeWeights.local?.weight || 0);

  const max = Math.max(adventureScore, relaxScore, cultureScore, foodScore);

  if (max === 0) return 'explorer';
  if (max === adventureScore) return 'adventurer';
  if (max === relaxScore) return 'relaxer';
  if (max === cultureScore) return 'culture';
  if (max === foodScore) return 'foodie';

  return 'explorer';
}

/**
 * Start cron job
 */
function startProfileBuilderCron() {
  // Run every day at 00:00
  cron.schedule('0 0 * * *', buildUserProfile);
  console.log('✅ [Cron] Profile builder scheduled (daily at 00:00)');
}

module.exports = {
  buildUserProfile,
  buildProfileForUser,
  startProfileBuilderCron
};
