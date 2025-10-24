// routes/debug.routes.js - Temporary debug endpoints
const router = require("express").Router();
const User = require("../models/Users");
const { optionalAuth } = require("../middlewares/authJwt");

// Check user's used promotions
router.get("/check-used-promotions", optionalAuth, async (req, res) => {
  try {
    const userId = req.userId || req.user?.sub || req.user?._id;
    
    if (!userId) {
      return res.json({
        message: "No user logged in",
        userId: null,
        usedPromotions: []
      });
    }

    const user = await User.findById(userId).select("email usedPromotions");
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      userId: user._id,
      email: user.email,
      usedPromotionsCount: user.usedPromotions?.length || 0,
      usedPromotions: user.usedPromotions || [],
    });
  } catch (error) {
    console.error("Debug check-used-promotions error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Clear user's used promotions (for testing only)
router.post("/clear-used-promotions", optionalAuth, async (req, res) => {
  try {
    const userId = req.userId || req.user?.sub || req.user?._id;
    
    if (!userId) {
      return res.status(400).json({ error: "No user logged in" });
    }

    await User.findByIdAndUpdate(userId, { usedPromotions: [] });
    
    res.json({
      message: "Cleared all used promotions",
      userId
    });
  } catch (error) {
    console.error("Debug clear-used-promotions error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
