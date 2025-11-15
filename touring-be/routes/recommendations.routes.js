/**
 * Personalized Recommendations Routes
 * /api/recommendations/*
 */

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authJwt');
const recommendationsController = require('../controller/recommendations.controller');

/**
 * GET /api/recommendations/profile
 * Get user's personalized profile summary (Discovery Wrapped style)
 * Returns: topVibes, topProvinces, travelStyle, eventBreakdown
 */
router.get('/profile', verifyToken, recommendationsController.getProfileSummary);

/**
 * GET /api/recommendations/tours
 * Get personalized tour recommendations
 * Query params: ?limit=10
 */
router.get('/tours', verifyToken, recommendationsController.getPersonalizedTours);

/**
 * GET /api/recommendations/itinerary-suggestions
 * Get itinerary templates tailored to user preferences
 * Query params: ?duration=3-day&budget=Medium
 */
router.get('/itinerary-suggestions', verifyToken, recommendationsController.getItinerarySuggestions);

module.exports = router;
