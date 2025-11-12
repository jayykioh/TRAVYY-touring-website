const { Router } = require("express");
const { parsePreferences } = require("../services/ai");
const { getMatchingZones } = require("../services/zones");
const { verifyToken } = require("../middlewares/authJwt");
const User = require("../models/Users");

const router = Router();
router.post("/parse", async (req, res) => {
  try {
    // Accept both old and new formats
    let combinedText = "";
    let vibes = [];
    let avoid = [];

    if (req.body.text) {
      // Old format: single text field
      combinedText = req.body.text;
    } else {
      // New format: structured vibes + freeText
      vibes = req.body.vibes || [];
      avoid = req.body.avoid || [];
      const freeText = req.body.freeText || "";
      combinedText = [...vibes, freeText].filter(Boolean).join(", ");
    }

    if (!combinedText || combinedText.trim().length < 3) {
      return res.status(400).json({
        ok: false,
        error: "TEXT_TOO_SHORT",
        message: "Query must be at least 3 characters",
      });
    }

    console.log(`\n🔍 [Discover] Query: "${combinedText.slice(0, 60)}..."`);
    console.log(`   Vibes: ${vibes.join(", ")}`);
    console.log(`   Avoid: ${avoid.join(", ")}`);

    const { province } = req.body;

    // 1. Parse with LLM (get structured preferences)
    const prefs = await parsePreferences(combinedText);

    // Override with explicit vibes/avoid if provided
    if (vibes.length > 0)
      prefs.vibes = [...new Set([...prefs.vibes, ...vibes])];
    if (avoid.length > 0)
      prefs.avoid = [...new Set([...prefs.avoid, ...avoid])];

    console.log("📋 [Discover] Parsed preferences:", {
      vibes: prefs.vibes?.slice(0, 5),
      avoid: prefs.avoid?.slice(0, 3),
    });

    // 2. Match zones (uses hybrid embedding + keyword)
    const result = await getMatchingZones(prefs, {
      province,
      useEmbedding: true,
    });

    // 3. Check if zones found
    if (!result.zones || result.zones.length === 0) {
      return res.json({
        ok: true,
        prefs,
        strategy: "none",
        zones: [],
        reason: "Không tìm thấy zone phù hợp",
        noMatch: true,
      });
    }

    // 4. Group by province
    const byProvince = result.zones.reduce((acc, zone) => {
      (acc[zone.province] = acc[zone.province] || []).push(zone);
      return acc;
    }, {});

    console.log("[Discover] Zones to return:", {
      count: result.zones?.length,
      firstZone: result.zones?.[0]?.name,
      hasFinalScore: !!result.zones?.[0]?.finalScore,
      finalScore: result.zones?.[0]?.finalScore,
      scores: result.zones?.slice(0, 3).map((z) => ({
        name: z.name,
        finalScore: z.finalScore,
        embedScore: z.embedScore,
        ruleScore: z.ruleScore,
        ruleReasons: z.ruleReasons,
        ruleDetails: z.ruleDetails || z.ruleReasons?.details || null,
      })),
    });

    res.json({
      ok: true,
      prefs,
      strategy: result.strategy,
      reason: result.reason,
      zones: result.zones,
      byProvince,
      fallback: result.strategy === "keyword",
    });
  } catch (error) {
    console.error("❌ [Discover] Error:", error);
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
