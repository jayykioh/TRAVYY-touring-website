const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authJwt');
const recommendationsController = require('../controller/recommendations.controller');
router.get('/profile', verifyToken, recommendationsController.getProfileSummary);
router.get('/tours', verifyToken, recommendationsController.getPersonalizedTours);

router.get('/itinerary-suggestions', verifyToken, recommendationsController.getItinerarySuggestions);

module.exports = router;
