const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authJwt');
const tourCompletionController = require('../controller/tourCompletionController');

// Mark tour as completed (Guide only)
router.post('/bookings/:bookingId/complete', verifyToken, tourCompletionController.completeTour);

// Cancel booking (Guide, Traveller, or Admin)
router.post('/bookings/:bookingId/cancel', verifyToken, tourCompletionController.cancelBooking);

// Get guide's schedule (Guide only)
router.get('/guide/schedule', verifyToken, tourCompletionController.getGuideSchedule);

module.exports = router;
