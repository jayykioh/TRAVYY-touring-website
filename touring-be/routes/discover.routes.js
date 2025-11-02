const { Router } = require("express");
const { parsePreferences } = require("../services/ai");
const { getMatchingZones } = require("../services/zones");

const router = Router();
router.post("/parse", async (req, res) => {
  try {
    // Accept both old and new formats
    let combinedText = '';
    let vibes = [];
    let avoid = [];
    
    if (req.body.text) {
      // Old format: single text field
      combinedText = req.body.text;
    } else {
      // New format: structured vibes + freeText
      vibes = req.body.vibes || [];
      avoid = req.body.avoid || [];
      const freeText = req.body.freeText || '';
      combinedText = [...vibes, freeText].filter(Boolean).join(", ");
    }
    
    if (!combinedText || combinedText.trim().length < 3) {
      return res.status(400).json({
        ok: false,
        error: 'TEXT_TOO_SHORT',
        message: 'Query must be at least 3 characters'
      });
    }
    
    console.log(`\n🔍 [Discover] Query: "${combinedText.slice(0, 60)}..."`);
    console.log(`   Vibes: ${vibes.join(', ')}`);
    console.log(`   Avoid: ${avoid.join(', ')}`);
    
    const { province } = req.body;
    
    // 1. Parse with LLM (get structured preferences)
    const prefs = await parsePreferences(combinedText);
    
    // Override with explicit vibes/avoid if provided
    if (vibes.length > 0) prefs.vibes = [...new Set([...prefs.vibes, ...vibes])];
    if (avoid.length > 0) prefs.avoid = [...new Set([...prefs.avoid, ...avoid])];
    
    console.log('📋 [Discover] Parsed preferences:', {
      vibes: prefs.vibes?.slice(0, 5),
      avoid: prefs.avoid?.slice(0, 3)
    });
    
    // 2. Match zones (uses hybrid embedding + keyword)
    const result = await getMatchingZones(prefs, {
      province,
      useEmbedding: true
    });
    
    // 3. Check if zones found
    if (!result.zones || result.zones.length === 0) {
      return res.json({
        ok: true,
        prefs,
        strategy: 'none',
        zones: [],
        reason: 'Không tìm thấy zone phù hợp',
        noMatch: true
      });
    }
    
    // 4. Group by province
    const byProvince = result.zones.reduce((acc, zone) => {
      (acc[zone.province] = acc[zone.province] || []).push(zone);
      return acc;
    }, {});

    console.log('[Discover] Zones to return:', {
      count: result.zones?.length,
      firstZone: result.zones?.[0]?.name,
      hasFinalScore: !!result.zones?.[0]?.finalScore,
      finalScore: result.zones?.[0]?.finalScore,
      scores: result.zones?.slice(0, 3).map(z => ({
        name: z.name,
        finalScore: z.finalScore,
        embedScore: z.embedScore,
        ruleScore: z.ruleScore,
        ruleReasons: z.ruleReasons,
        ruleDetails: z.ruleDetails || z.ruleReasons?.details || null
      }))
    });


    res.json({
      ok: true,
      prefs,
      strategy: result.strategy,
      reason: result.reason,
      zones: result.zones,
      byProvince,
      fallback: result.strategy === 'keyword'
    });
    
  } catch (error) {
    console.error('❌ [Discover] Error:', error);
    res.status(500).json({
      ok: false,
      error: 'INTERNAL_ERROR',
      message: error.message
    });
  }
});

module.exports = router;
