const Zone = require('../../models/Zones');
const { findPOIsForZone } = require('./poi-finder');

async function getZoneById(zoneId) {
  console.log(`🔍 [ZoneService] getZoneById: "${zoneId}"`);
  try {
    const zone = await Zone.findOne({ 
      id: zoneId, 
      isActive: true 
    }).lean();
    
    if (!zone) {
      console.log(`❌ Zone not found`);
      const availableZones = await Zone.find({ isActive: true })
        .select('id name')
        .limit(5)
        .lean();
      
      console.log(`   Available zones: ${availableZones.map(z => z.id).join(', ')}`);
      
      return null;
    }
    
    console.log(`   ✅ Found: ${zone.name} (${zone.province})`);
    return zone;
    
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    throw error;
  }
}

/**
 * Get POIs for a zone
 */
async function getZonePOIs(zoneId, options = {}) {
  const { vibes = [], limit = 20, includeAdjacent = true } = options;
  console.log(`\n📍 [ZoneService] getZonePOIs called`);
  console.log(`   zoneId: "${zoneId}"`);
  console.log(`   vibes: [${vibes.join(', ')}]`);
  console.log(`   limit: ${limit}`);
  console.log(`   includeAdjacent: ${includeAdjacent}`);
  try {
    const zone = await getZoneById(zoneId);
    
    if (!zone) {
      const error = new Error(`ZONE_NOT_FOUND: Zone "${zoneId}" does not exist`);
      error.code = 'ZONE_NOT_FOUND';
      throw error;
    }
    
    if (!zone.center?.lat || !zone.center?.lng) {
      console.warn(`   ⚠️ Zone "${zone.name}" has no center coordinates`);
      return [];
    }
    
    console.log(`   ✅ Calling findPOIsForZone...`);
    
    const pois = await findPOIsForZone(zoneId, {
      vibes,
      limit,
      includeAdjacent
    });
    
    console.log(`   ✅ getZonePOIs completed: ${pois.length} POIs\n`);
    
    return pois;
    
  } catch (error) {
    console.error(`   ❌ getZonePOIs error: ${error.message}\n`);
    throw error;
  }
}

/**
 * Get all zones in a province
 */
async function getZonesByProvince(province) {
  console.log(`🔍 [ZoneService] getZonesByProvince: "${province}"`);
  
  try {
    const zones = await Zone.find({ 
      province, 
      isActive: true 
    })
    .select('id name province center tags desc heroImg scorePriority')
    .sort({ scorePriority: -1 })
    .lean();
    
    console.log(`   ✅ Found ${zones.length} zones`);
    return zones;
    
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    throw error;
  }
}

/**
 * Get all active zones
 */
async function getAllZones(options = {}) {
  const { province = null } = options;
  
  console.log(`🔍 [ZoneService] getAllZones${province ? ` (province: ${province})` : ''}`);
  
  try {
    const query = { isActive: true };
    if (province) query.province = province;
    
    const zones = await Zone.find(query)
           .select('id name province center tags desc heroImg gallery scorePriority bestTime mustSee funActivities tips donts whyChoose vibeKeywords avoidTags') 
      .sort({ scorePriority: -1 })
      .lean();
    
    console.log(`   ✅ Found ${zones.length} zones`);
    return zones;
    
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    throw error;
  }
}

/**
 * Check if zone exists
 */
async function zoneExists(zoneId) {
  const count = await Zone.countDocuments({ 
    id: zoneId, 
    isActive: true 
  });
  return count > 0;
}

// ========== EXPORTS ==========
module.exports = {
  // Zone CRUD
  getZoneById,
  getZonesByProvince,
  getAllZones,
  zoneExists,
  
  // POI operations
  getZonePOIs,
};