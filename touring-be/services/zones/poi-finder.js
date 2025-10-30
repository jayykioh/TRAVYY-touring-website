const Zone = require('../../models/Zones');
const { searchPOIsByText } = require('../ai/libs/map4d');
const { scorePOI } = require('./poi-scorer');
const { POI_CATEGORIES, getPriorityCategories, getCategoryByVibes } = require('./poi-categories');

const pLimit = require('p-limit').default || require('p-limit');
const limit = pLimit(3);

/**
 * ✅ Check if point is inside zone boundary
 */
function isPointInZone(lat, lng, zone) {
  if (!zone.polygon || zone.polygon.length < 3) {
    if (!zone.center?.lat || !zone.center?.lng || !zone.radiusM) {
      return true;
    }
    
    const distance = getDistance(
      { lat, lng },
      { lat: zone.center.lat, lng: zone.center.lng }
    );
    
    return distance <= (zone.radiusM / 1000);
  }
  
  const lats = zone.polygon.map(p => p[0]);
  const lngs = zone.polygon.map(p => p[1]);
  
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
}

function getDistance(p1, p2) {
  const R = 6371;
  const dLat = (p2.lat - p1.lat) * Math.PI / 180;
  const dLng = (p2.lng - p1.lng) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * ✅ Find POIs by category (with multiple queries support)
 */
async function findPOIsByCategory(zoneId, categoryKey, options = {}) {
  const { limit: maxResults = 7 } = options;
  
  console.log(`\n🔍 [POI-FINDER] Finding POIs for zone: ${zoneId}, category: ${categoryKey}`);

  const zone = await Zone.findOne({ id: zoneId, isActive: true }).lean();
  if (!zone) {
    throw new Error(`Zone not found: ${zoneId}`);
  }

  console.log(`   ✅ Zone loaded: ${zone.name}`);
  console.log(`   📍 Center: (${zone.center?.lat}, ${zone.center?.lng})`);
  console.log(`   📏 Radius: ${zone.radiusM}m`);
  console.log(`   🔷 Polygon: ${zone.polygon ? `${zone.polygon.length} points` : 'NONE'}`);

  const category = POI_CATEGORIES[categoryKey];
  if (!category) {
    throw new Error(`Invalid category: ${categoryKey}`);
  }

  console.log(`   📂 Category: ${category.label} (${category.labelEn})`);

  const radiusM = zone.radiusM || 3000;

  // ✅ Handle multiple queries (if exists) or single query
  const queries = category.queries || [category.query];
  console.log(`   🔍 Queries (${queries.length}):`, queries);

  // ✅ Search with each query and merge results
  const allPOIs = [];
  const seenIds = new Set();

  for (const query of queries) {
    console.log(`   🎯 Searching: "${query}"`);
    
    const pois = await searchPOIsByText(
      zone.center.lat,
      zone.center.lng,
      radiusM,
      {
        query: query,
        limit: Math.ceil(maxResults * 2 / queries.length), // Split limit across queries
      }
    );

    console.log(`      📦 Found: ${pois.length} POIs`);

    // Deduplicate by ID
    for (const poi of pois) {
      const id = poi.place_id || poi.id;
      if (!seenIds.has(id)) {
        seenIds.add(id);
        allPOIs.push(poi);
      }
    }
  }

  console.log(`   📦 Total unique POIs: ${allPOIs.length}`);

  if (allPOIs.length === 0) {
    console.log(`   ⚠️ No POIs found for ${category.label}`);
    return [];
  }

  // Log sample
  console.log(`   📋 Sample POIs:`);
  allPOIs.slice(0, 3).forEach((p, i) => {
    console.log(`      ${i + 1}. ${p.name} at (${p.lat.toFixed(4)}, ${p.lng.toFixed(4)})`);
  });

  // Filter by zone boundary
  let filteredPOIs = allPOIs;
  
  if (zone.polygon && zone.polygon.length > 0) {
    console.log(`   🔍 Filtering by zone polygon...`);
    filteredPOIs = allPOIs.filter(poi => isPointInZone(poi.lat, poi.lng, zone));
    console.log(`   ✅ ${filteredPOIs.length}/${allPOIs.length} POIs inside zone`);
  } else {
    console.log(`   ⚠️ No polygon, keeping all POIs`);
  }

  if (filteredPOIs.length === 0) {
    console.log(`   ⚠️ No POIs inside zone boundary for ${category.label}`);
    return [];
  }

  // Score and sort
  const scored = filteredPOIs
    .map(poi => ({
      ...poi,
      ...scorePOI(poi, zone, category.vibes),
      category: categoryKey,
      categoryLabel: category.label,
    }))
    .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0))
    .slice(0, maxResults);

  console.log(`   ✅ Returning ${scored.length} POIs for ${category.label}`);
  if (scored.length > 0) {
    console.log(`      Top 3: ${scored.slice(0, 3).map(p => p.name).join(', ')}`);
  }

  return scored;
}

/**
 * Load priority categories in parallel
 */
async function loadPriorityPOIs(zoneId, options = {}) {
  const { limit: maxPerCategory = 7 } = options;
  
  console.log(`\n🚀 Loading priority POIs for zone: ${zoneId}`);
  
  const categories = getPriorityCategories();
  
  const results = await Promise.all(
    categories.map(cat =>
      limit(() =>
        findPOIsByCategory(zoneId, cat.key, { limit: maxPerCategory })
          .catch(err => {
            console.error(`   ❌ Error loading ${cat.key}:`, err.message);
            return [];
          })
      )
    )
  );

  const poisByCategory = {};
  categories.forEach((cat, idx) => {
    poisByCategory[cat.key] = results[idx];
  });

  const totalPOIs = Object.values(poisByCategory).reduce((sum, arr) => sum + arr.length, 0);
  console.log(`\n✅ Loaded ${totalPOIs} total POIs across ${categories.length} categories`);

  return poisByCategory;
}

/**
 * Legacy function for backward compatibility
 */
async function findPOIsForZone(zoneId, options = {}) {
  const { vibes = [], limit = 20 } = options;
  
  const category = getCategoryByVibes(vibes);
  console.log(`   🔄 Mapping vibes [${vibes.join(', ')}] → category: ${category.key}`);
  
  return findPOIsByCategory(zoneId, category.key, { limit });
}

module.exports = {
  findPOIsByCategory,
  loadPriorityPOIs,
  findPOIsForZone,
};
