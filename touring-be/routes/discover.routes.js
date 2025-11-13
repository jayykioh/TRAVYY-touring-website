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
      error: "INTERNAL_ERROR",
      message: error.message,
    });
  }
});

// ========================================
// POST /api/discover/save-history
// Save discovery search to user history
// ========================================
router.post("/save-history", verifyToken, async (req, res) => {
  try {
    const userId = req.userId || req.user?.sub;
    if (!userId) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }

    const { vibes, freeText, parsedPrefs, zoneResults } = req.body;

    if (!vibes && !freeText) {
      return res
        .status(400)
        .json({ ok: false, message: "Missing vibes or freeText" });
    }

    console.log(
      "💾 [Save History] User:",
      userId,
      "Zones:",
      zoneResults?.length
    );

    // Prepare history entry
    const historyEntry = {
      vibes: vibes || [],
      freeText: freeText || "",
      parsedPrefs: parsedPrefs || {},
      zoneResults: (zoneResults || []).slice(0, 10).map((z) => ({
        zoneId: z._id || z.id,
        zoneName: z.name,
        matchScore: z.finalScore || z.matchScore || 0,
        embedScore: z.embedScore || 0,
        ruleScore: z.ruleScore || 0,
        ruleReasons: z.ruleReasons || [],
      })),
      createdAt: new Date(),
    };

    // Update user - add to beginning of array and limit to 20 entries
    await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          discoveryHistory: {
            $each: [historyEntry],
            $position: 0,
            $slice: 20, // Keep only last 20 searches
          },
        },
      },
      { new: true }
    );

    console.log("✅ [Save History] Saved successfully");
    res.json({ ok: true, message: "History saved" });
  } catch (error) {
    console.error("❌ [Save History] Error:", error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

// ========================================
// GET /api/discover/history
// Get user's discovery history
// ========================================
router.get("/history", verifyToken, async (req, res) => {
  try {
    const userId = req.userId || req.user?.sub;
    if (!userId) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId)
      .select("discoveryHistory")
      .populate(
        "discoveryHistory.zoneResults.zoneId",
        "id name province heroImg gallery desc tags center poly polyComputed bestTime funActivities tips donts rating"
      );

    const history = user?.discoveryHistory || [];

    console.log("📜 [Get History] User:", userId, "Entries:", history.length);
    res.json({ ok: true, history });
  } catch (error) {
    console.error("❌ [Get History] Error:", error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

// ========================================
// DELETE /api/discover/clear-history
// Delete all history entries
// ========================================
router.delete("/clear-history", verifyToken, async (req, res) => {
  try {
    const userId = req.userId || req.user?.sub;
    if (!userId) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }

    // Clear all history
    user.discoveryHistory = [];
    await user.save();

    console.log("🗑️ [Clear History] User:", userId);
    res.json({ ok: true, message: "All history deleted" });
  } catch (error) {
    console.error("❌ [Delete All History] Error:", error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

// ========================================
// DELETE /api/discover/history/:historyId
// Delete a single history entry
// ========================================
router.delete("/history/:historyId", verifyToken, async (req, res) => {
  try {
    const userId = req.userId || req.user?.sub;
    if (!userId) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }

    const { historyId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }

    // Remove the specific history entry
    user.discoveryHistory = user.discoveryHistory.filter(
      (entry) => entry._id.toString() !== historyId
    );

    await user.save();

    console.log("🗑️ [Delete History] User:", userId, "Entry:", historyId);
    res.json({ ok: true, message: "History entry deleted" });
  } catch (error) {
    console.error("❌ [Delete History Entry] Error:", error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

module.exports = router;
