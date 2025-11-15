/**
 * ⚠️ DEPRECATED ROUTES - USE POSTHOG INSTEAD
 * 
 * These routes are kept for backwards compatibility but should not be used.
 * All tracking now goes through PostHog (frontend: posthog.js)
 * 
 * Migration guide:
 * - Frontend: Use trackTourView(), trackTourBooking(), etc. from posthog.js
 * - Backend: Events are fetched from PostHog API by weeklyProfileSync.js
 */

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authJwt');

// ==================== DEPRECATED ENDPOINTS ====================
// All tracking now via PostHog - these endpoints return 410 Gone

/**
 * POST /api/track/tour-view - DEPRECATED
 */
router.post('/tour-view', verifyToken, async (req, res) => {
  res.status(410).json({ 
    error: 'This endpoint is deprecated. Use PostHog tracking instead.',
    message: 'Import { trackTourView } from utils/posthog.js and call it directly in the frontend.',
    migration: 'https://posthog.com/docs/libraries/js'
  });
});

/**
 * POST /api/track/tour-click - DEPRECATED
 */
router.post('/tour-click', verifyToken, async (req, res) => {
  res.status(410).json({ 
    error: 'This endpoint is deprecated. Use PostHog tracking instead.'
  });
});

/**
 * POST /api/track/tour-bookmark - DEPRECATED
 */
router.post('/tour-bookmark', verifyToken, async (req, res) => {
  res.status(410).json({ 
    error: 'This endpoint is deprecated. Use PostHog tracking instead.'
  });
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

/**
 * POST /api/track/blog-view - DEPRECATED
 */
router.post('/blog-view', verifyToken, async (req, res) => {
  res.status(410).json({ 
    error: 'This endpoint is deprecated. Use PostHog tracking instead.'
  });
});

/**
 * POST /api/track/blog-scroll - DEPRECATED
 */
router.post('/blog-scroll', verifyToken, async (req, res) => {
  res.status(410).json({ 
    error: 'This endpoint is deprecated. Use PostHog tracking instead.'
  });
});

module.exports = router;
