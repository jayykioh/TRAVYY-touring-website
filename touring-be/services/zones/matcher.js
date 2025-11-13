const { hybridSearch, isAvailable } = require('../ai/libs/embedding-client');
const { scoreZone } = require('./scorer');
const Zone = require('../../models/Zones');

async function getMatchingZones(prefs, options = {}) {
  const { userLocation, useEmbedding = true } = options;
  console.log('\n🎯 [Matcher] Input:', {
    vibes: prefs.vibes?.slice(0, 3),
    freeText: prefs.freeText?.substring(0, 50),
    userLocation: userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : null
  });
  
  // 📝 LOG: Show full freeText for vector comparison
  if (prefs.freeText) {
    console.log('📝 [Matcher] Full freeText for vector comparison:', {
      text: prefs.freeText,
      length: prefs.freeText.length,
      wordCount: prefs.freeText.split(/\s+/).length
    });
  }
  
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
        
        // 🔍 LOG: Show what will be sent to AI for vector comparison
        console.log('🔍 [Matcher] Vector search parameters:', {
          freeText: prefs.freeText || '(empty)',
          vibes: prefs.vibes || [],
          vibesCount: prefs.vibes?.length || 0,
          explanation: 'AI will convert freeText + vibes into a vector and compare with zone vectors'
        });
        
        const embedResult = await hybridSearch({
          free_text: prefs.freeText,  // Use actual freeText from user input
          vibes: prefs.vibes,
          top_k: 20,
          filter_type: 'zone',
          boost_vibes: 1.3
        });
        
        console.log(`📦 [Matcher] Embedding result: ${embedResult.hits?.length || 0} hits (${embedResult.strategy})`);
        
        // 🎯 LOG: Show how each zone matched with the freeText vector
        if (embedResult.hits && embedResult.hits.length > 0) {
          console.log('🎯 [Matcher] Top 5 vector matches:');
          embedResult.hits.slice(0, 5).forEach((hit, idx) => {
            console.log(`   ${idx + 1}. Zone ${hit.id}:`, {
              embedScore: hit.score.toFixed(4),
              vibeMatches: hit.vibe_matches || [],
              explanation: `Cosine similarity between freeText vector and zone vector`
            });
          });
        }
        
        if (embedResult.hits && embedResult.hits.length > 0) {
          // ✅ CLEAN APPROACH: Get FULL zone data from MongoDB (not from meta.json)
          const zoneIds = embedResult.hits.map(hit => hit.id);
          const zones = await Zone.find({ 
            id: { $in: zoneIds }, 
            isActive: true 
          }).lean();
          
          console.log(`   MongoDB: ${zones.length}/${zoneIds.length} zones loaded`);
          
          // Map embedding scores to full zone data
          candidates = embedResult.hits
            .map(hit => {
              const zone = zones.find(z => z.id === hit.id);
              if (!zone) {
                console.warn(`   ⚠️ Zone ${hit.id} in embedding but not in MongoDB`);
                return null;
              }
              return {
                ...zone, // ✅ FULL MongoDB data (desc, whyChoose, funActivities, etc.)
                embedScore: Math.min(1.0, hit.score), // ⚠️ Clamp to [0, 1] to prevent boost_vibes overflow
                vibeMatches: hit.vibe_matches
              };
            })
            .filter(Boolean);
          
          console.log(`   ✅ Mapped ${candidates.length} candidates with full data`);
          strategy = 'embedding';
        } else {
          console.log('⚠️ [Matcher] Empty embedding index or no match → fallback to keyword');
        }
      }
    } catch (error) {
      console.warn('❌ [Matcher] Embedding error:', error.message);
      console.log('   → Falling back to keyword matching...');
    }
  }
  
  // === STRATEGY 2: Keyword fallback ===
  if (candidates.length === 0) {
    console.log('🔄 [Matcher] Using keyword matching (full MongoDB query)');
    
    const query = { isActive: true };
    candidates = await Zone.find(query).lean();
    
    // Filter by avoid
    if (prefs.avoid?.length > 0) {
      const before = candidates.length;
      candidates = candidates.filter(zone => {
        const text = `${zone.name} ${zone.desc || ''} ${zone.tags?.join(' ') || ''}`.toLowerCase();
        return !prefs.avoid.some(av => text.includes(av.toLowerCase()));
      });
      console.log(`   Avoid filter: ${before} → ${candidates.length}`);
    }
    
    strategy = 'keyword';
  }
  
  // === STRATEGY 3: Re-rank with rules (including proximity) ===
  console.log(`📊 [Matcher] Re-ranking ${candidates.length} candidates with full data...`);
  
  // 🔍 Detect if user mentions proximity keywords
  const freeTextLower = (prefs.freeText || '').toLowerCase();
  const proximityKeywords = ['gần', 'near', 'nearby', 'close', 'around', 'ở', 'tại'];
  const mentionsProximity = proximityKeywords.some(kw => freeTextLower.includes(kw));
  
  if (mentionsProximity && userLocation) {
    console.log('📍 [Matcher] User mentions proximity → boosting distance weight');
  }
  
  const scored = candidates.map(zone => {
    // Get scoring components: hardVibeScore (main) + contextScore (context)
    const scoreResult = scoreZone(zone, prefs || {}, userLocation);

    // 🎯 IMPROVED FINAL SCORE FORMULA:
    // When user mentions "gần" + has location:
    //   finalScore = (hardVibeScore × 0.3) + (embedScore × 0.3) + (proximityScore × 0.4)
    // When user has location (no proximity mention):
    //   finalScore = (hardVibeScore × 0.4) + (embedScore × 0.4) + (proximityScore × 0.2)
    // When no location:
    //   finalScore = (hardVibeScore × 0.5) + (embedScore × 0.5)
    //
    // Components:
    // - hardVibeScore (30-50%): User's explicit vibes matching zone.tags
    // - embedScore (30-50%): AI semantic similarity (understands "gần Đà Nẵng", "biển đẹp", etc.)
    // - proximityScore (20-40%): Distance bonus (boosted when user says "gần")
    
    let finalScore;
    if (userLocation?.lat && userLocation?.lng) {
      if (mentionsProximity) {
        // User explicitly wants nearby places → boost proximity heavily
        finalScore = 
          (scoreResult.hardVibeScore * 0.3) + 
          ((zone.embedScore || 0) * 0.3) + 
          (scoreResult.proximityScore * 0.4);
      } else {
        // User has location but didn't emphasize proximity
        finalScore = 
          (scoreResult.hardVibeScore * 0.4) + 
          ((zone.embedScore || 0) * 0.4) + 
          (scoreResult.proximityScore * 0.2);
      }
    } else {
      // Without location: balance hardVibe and AI semantic
      finalScore = 
        (scoreResult.hardVibeScore * 0.5) + 
        ((zone.embedScore || 0) * 0.5);
    }

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
      
      // Explanation
      reasons: scoreResult.reasons,
      details: scoreResult.details || null
    };
  });
  
  scored.sort((a, b) => b.finalScore - a.finalScore);
  
  const topZones = scored.slice(0, 10);
  
  console.log('🏆 [Matcher] Top 3:', topZones.slice(0, 3).map(z => {
    const weights = mentionsProximity && userLocation 
      ? { hardVibe: 0.3, embed: 0.3, proximity: 0.4 }
      : userLocation 
        ? { hardVibe: 0.4, embed: 0.4, proximity: 0.2 }
        : { hardVibe: 0.5, embed: 0.5, proximity: 0 };
    
    return {
      name: z.name,
      hardVibe: `${z.hardVibeScore?.toFixed(2)} (${(z.hardVibeScore * weights.hardVibe * 100).toFixed(0)}%)`,
      embed: `${z.embedScore?.toFixed(2)} (${(z.embedScore * weights.embed * 100).toFixed(0)}%)`,
      proximity: userLocation ? `${z.proximityScore?.toFixed(2)} (${(z.proximityScore * weights.proximity * 100).toFixed(0)}%)` : 'N/A',
      final: z.finalScore?.toFixed(3),
      distanceKm: z.distanceKm?.toFixed(1) || 'N/A',
      reasons: z.reasons?.slice(0, 3)
    };
  }));
  
  return {
    strategy,
    zones: topZones,
    reason: `Found ${topZones.length} zones using ${strategy}`
  };
}

module.exports = { getMatchingZones };