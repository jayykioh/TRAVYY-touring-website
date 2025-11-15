const express = require('express');
const router = express.Router();
const guideAvailabilityController = require('../controller/guideAvailabilityController');

// Check if guide is available for date range
router.get('/guides/:guideId/availability', guideAvailabilityController.checkGuideAvailability);

// Get guide's busy dates
router.get('/guides/:guideId/busy-dates', guideAvailabilityController.getGuideBusyDates);

// Validate tour request dates (before creating request)
router.post('/guides/validate-dates', guideAvailabilityController.validateTourRequestDates);

module.exports = router;
