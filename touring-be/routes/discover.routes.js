const { Router } = require("express");
const { getMatchingZones } = require("../services/zones/matcher");
const { verifyToken } = require("../middlewares/authJwt");
const { getUserLocation } = require("../services/user-location");
const User = require("../models/Users");

const router = Router();

router.post("/parse", verifyToken, async (req, res) => {
  try {
    // ===== 1. INPUT VALIDATION =====
    const vibes = Array.isArray(req.body.vibes) ? req.body.vibes : [];
    const freeText = (req.body.freeText || '').trim();
    const requestLocation = req.body.userLocation || null;

    // Must have vibes OR freeText
    if (vibes.length === 0 && freeText.length === 0) {
      return res.status(400).json({
        ok: false,
        error: 'EMPTY_INPUT',
        message: 'Please select vibes or type a description'
      });
    }

    // ===== 2. GET USER LOCATION (Priority: GPS → Profile → None) =====
    let userLocation = null;
    let user = null;
    
    // If user is logged in, fetch their profile for fallback location
    if (req.user?.sub) {
      try {
        user = await User.findOne({ _id: req.user.sub }).lean();
      } catch (err) {
        console.warn('⚠️ Could not fetch user profile:', err.message);
      }
    }
    
    // Use getUserLocation helper to get best available location
    userLocation = getUserLocation(user, { userLocation: requestLocation });

    // ===== 3. LOG INPUT =====
    console.log(`\n🔍 [Discover/Parse] User request:`);
    console.log(`   Vibes: ${vibes.join(', ') || '(none)'}`);
    console.log(`   Text: ${freeText.slice(0, 50)}${freeText.length > 50 ? '...' : ''}`);
    console.log(`   Location: ${userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)} (${userLocation.source})` : 'none'}`);
    console.log(`   User: ${req.user?.sub || 'anonymous'}`);

    // ===== 4. CALL MATCHER DIRECTLY (no intermediate wrapper) =====
    const result = await getMatchingZones(
      { 
        vibes,
        freeText: freeText  // Use actual freeText only (empty string if not provided)
      },
      { 
        userLocation,
        useEmbedding: true,
        userId: req.user?.sub
      }
    );

    // ===== 4. HANDLE NO RESULTS =====
    if (!result.zones || result.zones.length === 0) {
      console.log('⚠️  [Discover] No matching zones found');
      return res.json({
        ok: true,
        zones: [],
        noMatch: true,
        reason: 'Không tìm thấy zone phù hợp'
      });
    }

    // ===== 5. LOG RESULTS =====
    console.log(`✅ [Discover] Found ${result.zones.length} zones`);
    result.zones.slice(0, 3).forEach((z, i) => {
      console.log(`   ${i + 1}. ${z.name} (score: ${z.finalScore?.toFixed(3)})`);
    });

    // ===== 6. GROUP BY PROVINCE =====
    const byProvince = result.zones.reduce((acc, zone) => {
      if (!acc[zone.province]) acc[zone.province] = [];
      acc[zone.province].push(zone);
      return acc;
    }, {});

    // ===== 7. RETURN RESULTS =====
    res.json({
      ok: true,
      zones: result.zones,
      byProvince
    });

  } catch (error) {
    console.error('❌ [Discover] Error:', error.message);
    res.status(500).json({
      ok: false,
      error: 'INTERNAL_ERROR',
      message: error.message
    });
  }
});

module.exports = router;
