const { parsePrefsSmart } = require('./libs/llm');
const Zone = require('../../models/Zones');
const { matchZones } = require('../zones/matcher');

async function parsePreferences(text) {
  try {
    // Parse with AI or heuristic
    const parsed = await parsePrefsSmart(text);
    
    // Normalize
    const normalized = {
      vibes: parsed.interests || [],
      avoid: parsed.avoid || [],
      keywords: parsed.keywords || [], // include LLM/heuristic keywords when available
      pace: parsed.pace,
      budget: parsed.budget,
      durationDays: parsed.durationDays,
      _rawText: text // ✅ Pass raw text for semantic matching
    };
    
    console.log(`   ✅ Parsed: ${normalized.vibes.length} vibes, ${normalized.avoid.length} avoid, ${normalized.keywords.length} keywords`, {
      sampleKeywords: normalized.keywords?.slice(0, 6)
    });
    return normalized;
    
  } catch (error) {
    console.error('❌ Parse error:', error);
    throw new Error('AI_PARSE_ERROR: ' + error.message);
  }
}

/**
 * ✨ NEW: Match zones based on preferences
 */
async function getMatchingZones(prefs, options = {}) {
  const { province = null } = options;
  
  console.log('🎯 Matching zones:', prefs);
  
  // Load zones
  const query = { isActive: true };
  if (province) query.province = province;
  
  const zones = await Zone.find(query).lean();
  
  if (zones.length === 0) {
    return { strategy: 'none', zones: [], reason: 'No zones' };
  }
  
  // Match & score
  const result = matchZones(zones, prefs, options);
  
  console.log(`   ✅ Found ${result.zones.length} zones (strategy: ${result.strategy})`);
  
  return result;
}

module.exports = {
  parsePreferences,
  getMatchingZones
};