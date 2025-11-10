const { hybridSearch, isAvailable } = require('../ai/libs/embedding-client');
const { scoreZone } = require('./scorer');
const Zone = require('../../models/Zones');

/**
 * Match zones with fallback chain:
 * 1. Embedding (if available + index has data)
 * 2. Keyword matching (heuristic)
 * Always re-rank with rule-based scorer
 */
async function getMatchingZones(prefs, options = {}) {
  const { province, useEmbedding = true } = options;
  
  console.log('\n🎯 [Matcher] Input:', {
    vibes: prefs.vibes?.slice(0, 3),
    avoid: prefs.avoid?.slice(0, 2),
    pace: prefs.pace,
    budget: prefs.budget,
    province,
    source: prefs._source
  });
  
  let candidates = [];
  let strategy = 'hybrid';
  
  // === STRATEGY 1: Embedding-based search ===
  if (useEmbedding) {
    try {
      console.log('🔍 [Matcher] Checking embedding service...');
      
      const available = await isAvailable();
      
      if (!available) {
        console.log('⚠️ [Matcher] Embedding service down → skipping');
      } else {
        console.log('✅ [Matcher] Embedding OK → calling hybrid-search...');
        
        const embedResult = await hybridSearch({
          free_text: prefs._rawText || prefs.vibes?.join(' '),
          vibes: prefs.vibes,
          avoid: prefs.avoid,
          top_k: 20,
          filter_type: 'zone',
          filter_province: province,
          boost_vibes: 1.3
        });
        
        console.log(`📦 [Matcher] Result: ${embedResult.hits?.length || 0} hits (${embedResult.strategy})`);
        
        if (embedResult.hits && embedResult.hits.length > 0) {
          // Load zones from DB
          const zoneIds = embedResult.hits.map(hit => hit.id);
          const zones = await Zone.find({ 
            id: { $in: zoneIds }, 
            isActive: true 
          }).lean();
          
          console.log(`   DB: ${zones.length}/${zoneIds.length} zones found`);
          
          // Map embedding results
          candidates = embedResult.hits
            .map(hit => {
              const zone = zones.find(z => z.id === hit.id);
              if (!zone) {
                console.warn(`   ⚠️ Zone ${hit.id} not in DB`);
                return null;
              }
              return {
                ...zone,
                embedScore: hit.score,
                vibeMatches: hit.vibe_matches
              };
            })
            .filter(Boolean);
          
          console.log(`   ✅ Mapped ${candidates.length} candidates`);
          strategy = 'embedding';
        } else {
          console.log('⚠️ [Matcher] Empty index or no match → fallback');
        }
      }
    } catch (error) {
      console.warn('❌ [Matcher] Embedding error:', error.message);
      console.log('   → Falling back to keyword...');
    }
  }
  
  // === STRATEGY 2: Keyword fallback ===
  if (candidates.length === 0) {
    console.log('🔄 [Matcher] Using keyword matching');
    
    const query = { isActive: true };
    if (province) query.province = province;
    
    candidates = await Zone.find(query).lean();
    
    // Filter by avoid
    if (prefs.avoid?.length > 0) {
      const before = candidates.length;
      candidates = candidates.filter(zone => {
        const text = `${zone.name} ${zone.description || zone.desc || ''}`.toLowerCase();
        return !prefs.avoid.some(av => text.includes(av.toLowerCase()));
      });
      console.log(`   Avoid filter: ${before} → ${candidates.length}`);
    }
    
    strategy = 'keyword';
  }
  
  // === STRATEGY 3: Re-rank with rules ===
  console.log(`📊 [Matcher] Re-ranking ${candidates.length} candidates...`);
  
  const scored = candidates.map(zone => {
    // Pass full prefs object so scorer can use vibes, avoid, keywords, duration, rawText, etc.
    const ruleResult = scoreZone(zone, prefs || {});

    return {
      ...zone,
      embedScore: zone.embedScore,
      ruleScore: ruleResult.score,
      ruleReasons: ruleResult.reasons,
      ruleDetails: ruleResult.details || null,
      finalScore: (zone.embedScore || 0) * 0.6 + ruleResult.score * 0.4
    };
  });
  
  scored.sort((a, b) => b.finalScore - a.finalScore);
  
  const topZones = scored.slice(0, 10);
  
  console.log('🏆 [Matcher] Top 3:', topZones.slice(0, 3).map(z => ({
    name: z.name,
    embed: z.embedScore?.toFixed(2) || 'N/A',
    rule: z.ruleScore?.toFixed(2),
    final: z.finalScore?.toFixed(2),
    reasons: z.ruleReasons?.slice(0, 2)
  })));
  
  return {
    strategy,
    zones: topZones,
    reason: `Found ${topZones.length} zones using ${strategy}`
  };
}

module.exports = { getMatchingZones };