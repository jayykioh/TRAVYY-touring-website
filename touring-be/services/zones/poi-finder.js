// services/zones/poi-finder.js
const Zone = require('../../models/Zones');
const { searchNearbyPOIs } = require('../ai/libs/goong'); // ✅ path chuẩn
const { scorePOI } = require('./poi-scorer');

// 🧪 TESTING MODE
const TESTING_MODE = process.env.TESTING_MODE === 'true';
const TEST_LIMIT = 10;

/**
 * Find POIs for zone using Goong API only (kept inside zone radius)
 */
async function findPOIsForZone(zoneId, options = {}) {
  let { vibes = [], limit = 20, includeAdjacent = false } = options;

  // ✅ Enforce testing limit (optional)
  if (TESTING_MODE) {
    limit = Math.min(limit, TEST_LIMIT);
    console.log(`   🧪 TESTING MODE: Limiting to ${limit} POIs`);
  }

  console.log(`\n🔍 Finding POIs for zone: ${zoneId}`);
  console.log(`   Vibes: [${vibes.join(', ')}]`);
  console.log(`   Limit: ${limit}`);

  // Load zone
  const zone = await Zone.findOne({ id: zoneId, isActive: true }).lean();
  if (!zone) {
    throw new Error(`Zone not found: ${zoneId}`);
  }

  if (!zone.center?.lat || !zone.center?.lng) {
    throw new Error(`Zone center missing lat/lng for ${zoneId}`);
  }

  console.log(`   Zone: ${zone.name} (${zone.province})`);
  console.log(`   Center: ${zone.center.lat}, ${zone.center.lng}`);

  const coreRadius = zone.radiusM || zone.radiusMeters || (zone.radiusKm ? zone.radiusKm * 1000 : 2000);
  console.log(`   Radius: ${coreRadius}m`);

  // ✅ Search nearby with hard radius filter (inside libs/goong.js)
  const corePOIs = await searchNearbyPOIs(
    zone.center.lat,
    zone.center.lng,
    coreRadius,
    {
      vibes,
      limit: limit * 1.5,   // request slightly more then slice after scoring
      hasDeprecated: true,
      // includeAdjacent,     // nếu muốn vét rìa (bản goong hiện tại chưa dùng tham số này)
    }
  );

  if (!corePOIs.length) {
    console.log(`\n✅ FINAL: 0 POIs returned`);
    return [];
  }

  // Score & sort
  const scoredPOIs = corePOIs
    .map((poi) => ({
      ...poi,
      ...scorePOI(poi, zone, vibes), // { matchScore: 0..1, ... }
      tier: 'core',
    }))
    .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0))
    .slice(0, limit);

  console.log(`     ✅ Found ${scoredPOIs.length} scored POIs`);
  console.log(`\n✅ FINAL: ${scoredPOIs.length} POIs returned`);

  return scoredPOIs;
}

module.exports = {
  findPOIsForZone,
};
