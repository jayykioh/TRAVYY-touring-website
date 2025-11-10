const express = require('express');
const router = express.Router();
const authJwt = require('../middlewares/authJwt');
const tourRequestController = require('../controller/tourRequestController');

// User routes for tour custom requests

// Create a new tour request from itinerary
router.post('/create', authJwt, tourRequestController.createTourRequest);

// Get all tour requests for current user
router.get('/', authJwt, tourRequestController.getUserTourRequests);

// Get single tour request details
router.get('/:requestId', authJwt, tourRequestController.getTourRequestDetails);

// User makes a counter-offer or updates budget
router.post('/:requestId/offer', authJwt, tourRequestController.userMakeOffer);

// User sends a message to guide
router.post('/:requestId/message', authJwt, tourRequestController.userSendMessage);

// User accepts guide's final offer (moves to payment)
router.post('/:requestId/accept', authJwt, tourRequestController.acceptGuideOffer);

// User agrees to terms (commitment)
router.post('/:requestId/agree', authJwt, tourRequestController.userAgreeToTerms);

// Get agreement status
router.get('/:requestId/agreement', authJwt, tourRequestController.getAgreementStatus);

// Create booking from accepted request
router.post('/:requestId/create-booking', authJwt, tourRequestController.createBookingFromRequest);

// User cancels a tour request
router.delete('/:requestId', authJwt, tourRequestController.cancelTourRequest);

module.exports = router;
