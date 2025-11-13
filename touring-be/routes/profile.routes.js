const router = require("express").Router();
const authJwt = require("../middlewares/authJwt");
const { updateProfile, getProfile, uploadAvatar, deleteAvatar, getAvatar } = require("../controller/profile.controller");
const UserProfile = require('../models/UserProfile');
const DailyAskAnswer = require('../models/DailyAskAnswer');

// User info routes (existing)
router.get("/", authJwt, getProfile);
router.get("/info", authJwt, getProfile);
router.patch("/", authJwt, updateProfile);
router.patch("/info", authJwt, updateProfile);

router.post("/upload-avatar", authJwt, ...uploadAvatar);
router.delete("/avatar", authJwt, deleteAvatar);
router.get("/avatar/:userId", getAvatar);

// ==================== TRAVEL PROFILE ROUTES (NEW) ====================

/**
 * GET /api/profile/travel
 * Get user's AI-built travel profile
 */
router.get('/travel', authJwt, async (req, res) => {
  try {
    const userId = req.user.id;

    let profile = await UserProfile.findOne({ userId });

    if (!profile) {
      // Create default profile
      profile = new UserProfile({
        userId,
        confidence: 0,
        totalInteractions: 0,
        optInPersonalization: true
      });
      await profile.save();
    }

    // Get top vibes
    const topVibes = [];
    if (profile.vibeProfile) {
      for (const [vibe, data] of profile.vibeProfile.entries()) {
        topVibes.push({ vibe, weight: data.weight });
      }
      topVibes.sort((a, b) => b.weight - a.weight);
    }

    res.json({
      success: true,
      profile: {
        confidence: profile.confidence,
        topVibes: topVibes.slice(0, 5),
        travelStyle: profile.travelStyle,
        budgetTier: profile.budgetTier,
        homeProvince: profile.homeProvince,
        totalInteractions: profile.totalInteractions,
        lastSyncedAt: profile.lastSyncedAt,
        optInPersonalization: profile.optInPersonalization
      }
    });

  } catch (error) {
    console.error('❌ [Profile] get error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/profile/travel
 * Update user's travel preferences
 */
router.patch('/travel', authJwt, async (req, res) => {
  try {
    const userId = req.user.id;
    const { optInPersonalization, budgetTier, travelStyle, homeProvince } = req.body;

    const updateData = {};
    if (typeof optInPersonalization !== 'undefined') updateData.optInPersonalization = optInPersonalization;
    if (budgetTier) updateData.budgetTier = budgetTier;
    if (travelStyle) updateData.travelStyle = travelStyle;
    if (homeProvince) updateData.homeProvince = homeProvince;

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Profile updated',
      profile
    });

  } catch (error) {
    console.error('❌ [Profile] update error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/profile/data
 * Delete all user behavioral data (GDPR compliance)
 */
router.delete('/data', authJwt, async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete all interactions
    await ZoneInteraction.deleteMany({ userId });

    // Delete all daily ask answers
    await DailyAskAnswer.deleteMany({ userId });

    // Reset profile
    await UserProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          vibeProfile: new Map(),
          profileVector_short: null,
          profileVector_long: null,
          confidence: 0,
          totalInteractions: 0,
          recentVisitedZones: [],
          bookmarkedZones: []
        }
      }
    );

    res.json({
      success: true,
      message: 'All your behavioral data has been deleted'
    });

  } catch (error) {
    console.error('❌ [Profile] delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
