const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authJwt');
const TourInteraction = require('../models/TourInteraction');
const BlogInteraction = require('../models/BlogInteraction');
const crypto = require('crypto');

// Helper: Generate simple sessionId (no middleware needed)
function generateSessionId() {
  return `sess_${crypto.randomBytes(8).toString('hex')}_${Date.now()}`;
}

// ==================== TOUR TRACKING ====================

/**
 * POST /api/track/tour-view
 * Track when user views tour detail page
 * Simplified: Only extract vibes + provinces from tour data (no duration tracking)
 */
router.post('/tour-view', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { tourId } = req.body;

    if (!tourId) {
      return res.status(400).json({ error: 'tourId is required' });
    }

    // Fetch tour to extract vibes + provinces
    const Tour = require('../models/agency/Tours');
    const tour = await Tour.findById(tourId)
      .select('tags locations')
      .populate('locations', 'name region'); // Populate to get location names

    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    // Extract meaningful data for itinerary creation
    const vibes = tour.tags || []; // Use tags as vibes
    const provinces = tour.locations 
      ? tour.locations.map(loc => loc.name || loc.region).filter(Boolean)
      : [];

    const interaction = new TourInteraction({
      userId,
      tourId,
      action: 'view',
      metadata: {
        vibes,          // Tour tags (e.g., ["Phiêu lưu", "Thiên nhiên"])
        provinces       // Location names (e.g., ["Hà Nội", "Ninh Bình"])
      },
      sessionId: generateSessionId()
    });

    await interaction.save();

    console.log(`👁️ [Track] Tour view: User ${userId} viewed ${tourId} | Vibes: ${vibes.join(', ')} | Provinces: ${provinces.join(', ')}`);

    res.json({
      success: true,
      message: 'Tour view tracked',
      interaction
    });

  } catch (error) {
    console.error('❌ [Track] tour-view error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/track/tour-click
 * Track when user clicks on tour card (from search/discover)
 */
router.post('/tour-click', verifyToken, async (req, res) => {
  try {
    const userId = req.userId; // ✅ FIX: Use req.userId from middleware
    const { tourId, source = 'search', deviceType = 'desktop' } = req.body;

    if (!tourId) {
      return res.status(400).json({ error: 'tourId is required' });
    }

    const interaction = new TourInteraction({
      userId,
      tourId,
      action: 'click',
      source,
      sessionId: generateSessionId()
    });

    await interaction.save();

    res.json({
      success: true,
      message: 'Tour click tracked',
      interaction
    });

  } catch (error) {
    console.error('❌ [Track] tour-click error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/track/tour-bookmark
 * Track when user bookmarks/unbookmarks a tour
 */
router.post('/tour-bookmark', verifyToken, async (req, res) => {
  try {
    const userId = req.userId; // ✅ FIX: Use req.userId from middleware
    const { tourId, bookmarked } = req.body;

    if (!tourId || typeof bookmarked !== 'boolean') {
      return res.status(400).json({ error: 'tourId and bookmarked (boolean) are required' });
    }

    if (bookmarked) {
      const interaction = new TourInteraction({
        userId,
        tourId,
        action: 'bookmark',
        sessionId: generateSessionId()
      });

      await interaction.save();

      res.json({
        success: true,
        message: 'Tour bookmark tracked',
        interaction
      });
    } else {
      // Unbookmark - don't track (neutral action)
      res.json({
        success: true,
        message: 'Tour unbookmarked (not tracked)'
      });
    }

  } catch (error) {
    console.error('❌ [Track] tour-bookmark error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/track/tour-booking
 * ⚠️ REMOVED - Booking tracking moved to payment capture endpoint
 * This route is deprecated - bookings should only be tracked when payment succeeds
 */
router.post('/tour-booking', verifyToken, async (req, res) => {
  res.status(410).json({ 
    error: 'This endpoint is deprecated. Booking tracking happens automatically after successful payment.' 
  });
});

// ==================== BLOG TRACKING ====================

/**
 * POST /api/track/blog-view
 * Track when user reads a blog
 * Simplified: Extract vibes + provinces from blog metadata
 */
router.post('/blog-view', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { blogSlug } = req.body;

    if (!blogSlug) {
      return res.status(400).json({ error: 'blogSlug is required' });
    }

    // Fetch blog to extract vibes + provinces
    const Blog = require('../models/Blogs');
    const blog = await Blog.findOne({ slug: blogSlug }).select('tags provinces');

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Extract meaningful data for itinerary creation
    const vibes = blog.tags || [];
    const provinces = blog.provinces || [];

    const interaction = new BlogInteraction({
      userId,
      blogSlug,
      action: 'view',
      relatedVibes: vibes,
      relatedProvinces: provinces,
      sessionId: generateSessionId()
    });

    await interaction.save();

    console.log(`📖 [Track] Blog view: User ${userId} read ${blogSlug} | Vibes: ${vibes.join(', ')} | Provinces: ${provinces.join(', ')}`);

    res.json({
      success: true,
      message: 'Blog view tracked',
      interaction
    });

  } catch (error) {
    console.error('❌ [Track] blog-view error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/track/blog-scroll
 * Track blog scroll engagement (called when user scrolls past 50%, 75%, 100%)
 */
router.post('/blog-scroll', verifyToken, async (req, res) => {
  try {
    const userId = req.userId; // ✅ FIX: Use req.userId from middleware
    const { blogSlug, scrollPercent } = req.body;

    if (!blogSlug || !scrollPercent) {
      return res.status(400).json({ error: 'blogSlug and scrollPercent are required' });
    }

    const interaction = new BlogInteraction({
      userId,
      blogSlug,
      action: 'scroll',
      scrollPercent,
      sessionId: generateSessionId()
    });

    await interaction.save();

    res.json({
      success: true,
      message: 'Blog scroll tracked'
    });

  } catch (error) {
    console.error('❌ [Track] blog-scroll error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
