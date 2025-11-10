const TourCustomRequest = require('../models/TourCustomRequest');
const Itinerary = require('../models/Itinerary');
const User = require('../models/Users');
const GuideNotification = require('../models/guide/GuideNotification');
const Notification = require('../models/Notification');

// Helper function to get user ID from JWT
function getUserId(user) {
  return user?.sub || user?._id || user?.id;
}

// Helper function to create user notification
async function createUserNotification(data) {
  try {
    const notification = await Notification.create(data);
    console.log(`[Notification] Created for user: ${data.userId}`);
    return notification;
  } catch (error) {
    console.error('[Notification] Creation error:', error);
  }
}

exports.createTourRequest = async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const { 
      itineraryId, 
      initialBudget, 
      numberOfGuests,
      specialRequirements,
      contactInfo,
      preferredDates,
      guideId // Optional: pre-assign to specific guide
    } = req.body;

    // 🔍 DEBUG: Log incoming request
    console.log('[TourRequest] Incoming request body:', {
      itineraryId,
      initialBudget,
      numberOfGuests,
      specialRequirements: specialRequirements?.substring(0, 50),
      contactInfo,
      preferredDates,
      guideId,
      userId
    });

    // Validate required fields
    if (!itineraryId) {
      return res.status(400).json({ 
        success: false, 
        error: 'itineraryId is required' 
      });
    }

    if (!initialBudget || typeof initialBudget !== 'object') {
      return res.status(400).json({ 
        success: false, 
        error: 'initialBudget must be an object with amount and currency' 
      });
    }

    if (!initialBudget.amount || initialBudget.amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'initialBudget.amount must be a positive number' 
      });
    }

    if (!numberOfGuests || numberOfGuests < 1) {
      return res.status(400).json({ 
        success: false, 
        error: 'numberOfGuests must be at least 1' 
      });
    }

    // 🚀 VALIDATE: Max 10 guests per tour
    if (numberOfGuests > 10) {
      return res.status(400).json({ 
        success: false, 
        error: 'Number of guests cannot exceed 10 people per tour' 
      });
    }

    if (!Array.isArray(preferredDates) || preferredDates.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'preferredDates must be a non-empty array' 
      });
    }

    if (!contactInfo || typeof contactInfo !== 'object') {
      return res.status(400).json({ 
        success: false, 
        error: 'contactInfo must be an object with phone, email' 
      });
    }

    // Validate itinerary exists and belongs to user
    const itinerary = await Itinerary.findOne({ 
      _id: itineraryId, 
      userId 
    });

    if (!itinerary) {
      return res.status(404).json({ 
        success: false, 
        error: 'Itinerary not found or access denied' 
      });
    }

    // Verify itinerary is a custom tour (has tour items)
    if (!itinerary.isCustomTour) {
      return res.status(400).json({ 
        success: false, 
        error: 'This itinerary is not a custom tour. Please add tour items first.' 
      });
    }

    // Check if there's already a pending/negotiating request for this itinerary
    const existingRequest = await TourCustomRequest.findOne({
      itineraryId,
      userId,
      status: { $in: ['pending', 'negotiating'] }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        error: 'You already have an active request for this itinerary',
        requestId: existingRequest._id
      });
    }

    // Get user info for contact
    const user = await User.findById(userId).select('name email phone');

    // Extract tour details from itinerary
    const tourDetails = {
      zoneName: itinerary.zoneName || itinerary.name,
      numberOfDays: itinerary.preferences?.durationDays || 1,
      numberOfGuests: numberOfGuests || 1,
      preferences: {
        vibes: itinerary.preferences?.vibes || [],
        pace: itinerary.preferences?.pace || 'moderate',
        budget: itinerary.preferences?.budget || 'mid',
        bestTime: itinerary.preferences?.bestTime || 'anytime'
      },
      items: itinerary.items.map(item => ({
        poiId: item.poiId,
        name: item.name,
        address: item.address,
        location: item.location,
        itemType: item.itemType,
        startTime: item.startTime,
        endTime: item.endTime,
        duration: item.duration,
        day: item.day,
        timeSlot: item.timeSlot
      }))
    };

    // Create tour request with synced itinerary
    const tourRequest = new TourCustomRequest({
      userId,
      itineraryId,
      guideId: guideId || null, // Pre-assign guide if provided
      tourDetails,
      initialBudget: {
        amount: initialBudget?.amount || 0,
        currency: initialBudget?.currency || 'VND'
      },
      specialRequirements,
      contactInfo: {
        phone: contactInfo?.phone || user.phone,
        email: contactInfo?.email || user.email,
        preferredContactMethod: contactInfo?.preferredContactMethod || 'app'
      },
      // Convert preferredDates array of strings to array of date objects
      preferredDates: (preferredDates || []).map(dateStr => ({
        startDate: new Date(dateStr),
        endDate: new Date(new Date(dateStr).setDate(new Date(dateStr).getDate() + (tourDetails.numberOfDays || 1))),
        flexible: false
      })),
      status: 'pending', // Always start as pending, guide will accept/negotiate
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiry
      itinerarySynced: true, // ✅ Itinerary is synced to guide
      itinerarySyncedAt: new Date()
    });

    await tourRequest.save();

    // Update itinerary with request reference
    itinerary.tourGuideRequest = {
      status: 'pending', // Always start as pending
      guideId: guideId || null,
      requestedAt: new Date()
    };
    await itinerary.save();

    // If guide pre-assigned, notify them
    if (guideId) {
      try {
        await GuideNotification.create({
          guideId,
          notificationId: `guide-${guideId}-${Date.now()}`,
          type: 'new_request',
          title: 'New Custom Tour Request',
          message: `You have been requested for ${tourDetails.zoneName}. Budget: ${initialBudget?.amount?.toLocaleString('vi-VN')} ${initialBudget?.currency || 'VND'}`,
          tourId: tourRequest._id.toString(),
          priority: 'high'
        });
        console.log(`[TourRequest] Notified guide ${guideId} about new request`);
      } catch (notifError) {
        console.error('[TourRequest] Error creating guide notification:', notifError);
      }
    }

    // Populate user info for response
    await tourRequest.populate('userId', 'name email phone avatar');

    console.log('[TourRequest] Created new custom tour request:', {
      requestId: tourRequest._id,
      requestNumber: tourRequest.requestNumber,
      userId,
      itineraryId,
      zoneName: tourDetails.zoneName
    });

    res.json({
      success: true,
      tourRequest,
      message: 'Tour request created successfully. Guides will be notified.'
    });

  } catch (error) {
    console.error('[TourRequest] Error creating tour request:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get all tour requests for the current user
exports.getUserTourRequests = async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const { status, page = 1, limit = 10 } = req.query;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const requests = await TourCustomRequest.find(query)
      .populate('guideId', 'name email phone avatar profile')
      .populate('itineraryId', 'name zoneName items preferences')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await TourCustomRequest.countDocuments(query);

    res.json({
      success: true,
      requests,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('[TourRequest] Error fetching user requests:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get single tour request details
exports.getTourRequestDetails = async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const { requestId } = req.params;

    const tourRequest = await TourCustomRequest.findOne({
      _id: requestId,
      userId
    })
      .populate('guideId', 'name email phone avatar profile')
      .populate('itineraryId', 'name zoneName items preferences routePolyline')
      .populate('userId', 'name email phone avatar');

    if (!tourRequest) {
      return res.status(404).json({
        success: false,
        error: 'Tour request not found'
      });
    }

    res.json({
      success: true,
      tourRequest
    });

  } catch (error) {
    console.error('[TourRequest] Error fetching request details:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// User makes a counter-offer or updates budget
exports.userMakeOffer = async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const { requestId } = req.params;
    const { amount, currency = 'VND', message } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid offer amount'
      });
    }

    const tourRequest = await TourCustomRequest.findOne({
      _id: requestId,
      userId
    });

    if (!tourRequest) {
      return res.status(404).json({
        success: false,
        error: 'Tour request not found'
      });
    }

    if (!['pending', 'negotiating'].includes(tourRequest.status)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot make offer on this request'
      });
    }

    // Add price offer
    await tourRequest.addPriceOffer('user', amount, currency, message);

    // Notify guide if assigned
    if (tourRequest.guideId) {
      try {
        await GuideNotification.create({
          userId: tourRequest.guideId,
          type: 'price_offer',
          title: 'New Price Offer',
          message: `Customer offered ${amount.toLocaleString()} ${currency} for ${tourRequest.requestNumber}`,
          relatedId: tourRequest._id,
          relatedModel: 'TourCustomRequest'
        });
      } catch (notifError) {
        console.error('[TourRequest] Error creating notification:', notifError);
      }
    }

    await tourRequest.populate('guideId', 'name email phone avatar');

    res.json({
      success: true,
      tourRequest,
      message: 'Offer submitted successfully'
    });

  } catch (error) {
    console.error('[TourRequest] Error making offer:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// User sends a message to guide
exports.userSendMessage = async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const { requestId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message content is required'
      });
    }

    const tourRequest = await TourCustomRequest.findOne({
      _id: requestId,
      userId
    });

    if (!tourRequest) {
      return res.status(404).json({
        success: false,
        error: 'Tour request not found'
      });
    }

    await tourRequest.addMessage('user', content.trim());

    // Notify guide if assigned
    if (tourRequest.guideId) {
      try {
        await GuideNotification.create({
          userId: tourRequest.guideId,
          type: 'new_message',
          title: 'New Message',
          message: `New message for request ${tourRequest.requestNumber}`,
          relatedId: tourRequest._id,
          relatedModel: 'TourCustomRequest'
        });
      } catch (notifError) {
        console.error('[TourRequest] Error creating notification:', notifError);
      }
    }

    res.json({
      success: true,
      message: 'Message sent successfully',
      messages: tourRequest.messages
    });

  } catch (error) {
    console.error('[TourRequest] Error sending message:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// User cancels a tour request
exports.cancelTourRequest = async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const { requestId } = req.params;
    const { reason } = req.body;

    const tourRequest = await TourCustomRequest.findOne({
      _id: requestId,
      userId
    });

    if (!tourRequest) {
      return res.status(404).json({
        success: false,
        error: 'Tour request not found'
      });
    }

    if (tourRequest.status === 'accepted') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel an accepted request. Please contact support.'
      });
    }

    await tourRequest.cancelRequest(reason);

    // Update itinerary status
    const itinerary = await Itinerary.findById(tourRequest.itineraryId);
    if (itinerary) {
      itinerary.tourGuideRequest.status = 'cancelled';
      await itinerary.save();
    }

    // Notify guide if assigned
    if (tourRequest.guideId) {
      try {
        await GuideNotification.create({
          userId: tourRequest.guideId,
          type: 'request_cancelled',
          title: 'Request Cancelled',
          message: `Customer cancelled request ${tourRequest.requestNumber}`,
          relatedId: tourRequest._id,
          relatedModel: 'TourCustomRequest'
        });
      } catch (notifError) {
        console.error('[TourRequest] Error creating notification:', notifError);
      }
    }

    res.json({
      success: true,
      message: 'Tour request cancelled successfully'
    });

  } catch (error) {
    console.error('[TourRequest] Error cancelling request:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// User accepts guide's final offer (moves to payment)
exports.acceptGuideOffer = async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const { requestId } = req.params;

    const tourRequest = await TourCustomRequest.findOne({
      _id: requestId,
      userId
    });

    if (!tourRequest) {
      return res.status(404).json({
        success: false,
        error: 'Tour request not found'
      });
    }

    if (tourRequest.status !== 'negotiating') {
      return res.status(400).json({
        success: false,
        error: 'No active negotiation to accept'
      });
    }

    const latestOffer = tourRequest.latestOffer;
    if (!latestOffer || latestOffer.offeredBy !== 'guide') {
      return res.status(400).json({
        success: false,
        error: 'No guide offer to accept'
      });
    }

    // Accept the request with final price
    await tourRequest.acceptRequest(latestOffer.amount, latestOffer.currency);

    // Update itinerary
    const itinerary = await Itinerary.findById(tourRequest.itineraryId);
    if (itinerary) {
      itinerary.tourGuideRequest.status = 'accepted';
      itinerary.tourGuideRequest.guideId = tourRequest.guideId;
      itinerary.tourGuideRequest.respondedAt = new Date();
      await itinerary.save();
    }

    // Notify guide
    if (tourRequest.guideId) {
      try {
        await GuideNotification.create({
          userId: tourRequest.guideId,
          type: 'request_accepted',
          title: 'Offer Accepted!',
          message: `Customer accepted your offer for ${tourRequest.requestNumber}. Proceed to booking.`,
          relatedId: tourRequest._id,
          relatedModel: 'TourCustomRequest'
        });
      } catch (notifError) {
        console.error('[TourRequest] Error creating notification:', notifError);
      }
    }

    await tourRequest.populate('guideId', 'name email phone avatar profile');

    res.json({
      success: true,
      tourRequest,
      message: 'Offer accepted! Proceed to payment to confirm booking.',
      nextStep: 'payment'
    });

  } catch (error) {
    console.error('[TourRequest] Error accepting offer:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// User agrees to terms (commitment before booking)
exports.userAgreeToTerms = async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const { requestId } = req.params;
    const { terms } = req.body;

    const tourRequest = await TourCustomRequest.findOne({
      _id: requestId,
      userId
    });

    if (!tourRequest) {
      return res.status(404).json({
        success: false,
        error: 'Tour request not found'
      });
    }

    if (tourRequest.status !== 'negotiating') {
      return res.status(400).json({
        success: false,
        error: 'Request must be in negotiating status to agree to terms'
      });
    }

    // User agrees to the terms
    await tourRequest.userAgreeToTerms(terms);

    // Check if both parties agreed
    const bothAgreed = tourRequest.isBothAgreed();

    // Notify guide
    if (tourRequest.guideId) {
      try {
        await GuideNotification.create({
          guideId: tourRequest.guideId,
          notificationId: `guide-${tourRequest.guideId}-${Date.now()}`,
          type: bothAgreed ? 'agreement_complete' : 'user_agreed',
          title: bothAgreed ? 'Agreement Complete!' : 'User Agreed to Terms',
          message: bothAgreed 
            ? `Both parties agreed! Request ${tourRequest.requestNumber} is ready for final acceptance.`
            : `User agreed to terms for ${tourRequest.requestNumber}. Please review and confirm.`,
          tourId: tourRequest._id.toString(),
          priority: 'high'
        });
      } catch (notifError) {
        console.error('[TourRequest] Error creating notification:', notifError);
      }
    }

    await tourRequest.populate('guideId', 'name email phone avatar');

    res.json({
      success: true,
      tourRequest,
      bothAgreed,
      message: bothAgreed 
        ? 'Both parties agreed! Ready for final acceptance and booking.'
        : 'You have agreed to the terms. Waiting for tour guide confirmation.'
    });

  } catch (error) {
    console.error('[TourRequest] Error user agreeing to terms:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get agreement status
exports.getAgreementStatus = async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const { requestId } = req.params;

    const tourRequest = await TourCustomRequest.findOne({
      _id: requestId,
      userId
    }).select('agreement status');

    if (!tourRequest) {
      return res.status(404).json({
        success: false,
        error: 'Tour request not found'
      });
    }

    res.json({
      success: true,
      agreement: tourRequest.agreement || {},
      status: tourRequest.status,
      bothAgreed: tourRequest.isBothAgreed()
    });

  } catch (error) {
    console.error('[TourRequest] Error getting agreement status:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Create booking from accepted request
exports.createBookingFromRequest = async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const { requestId } = req.params;

    const tourRequest = await TourCustomRequest.findOne({
      _id: requestId,
      userId
    })
      .populate('guideId', 'name email phone')
      .populate('itineraryId')
      .populate('userId', 'name email phone');

    if (!tourRequest) {
      return res.status(404).json({
        success: false,
        error: 'Tour request not found'
      });
    }

    if (tourRequest.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        error: 'Request must be accepted before creating booking'
      });
    }

    // ✅ CHECK: Both parties must agree to terms before booking
    if (!tourRequest.isBothAgreed()) {
      return res.status(400).json({
        success: false,
        error: 'Both parties must agree to terms before creating booking',
        requiresAgreement: true
      });
    }

    // Check if booking already exists
    if (tourRequest.bookingId) {
      const existingBooking = await Booking.findById(tourRequest.bookingId);
      if (existingBooking) {
        return res.json({
          success: true,
          booking: existingBooking,
          message: 'Booking already exists',
          paymentUrl: `/payment/${existingBooking._id}`
        });
      }
    }

    const Booking = require('../models/Bookings');
    
    // Generate unique order reference
    const orderRef = `TRAV-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    
    // Get final agreed price
    const finalPrice = tourRequest.finalPrice || tourRequest.latestOffer?.amount || tourRequest.proposedPrice;
    const currency = tourRequest.finalCurrency || tourRequest.latestOffer?.currency || 'VND';

    // Create booking item from itinerary
    const itinerary = tourRequest.itineraryId;
    const bookingItem = {
      name: `Custom Tour - ${itinerary.zoneName || 'Tour'}`,
      image: itinerary.items && itinerary.items[0]?.image || '',
      adults: tourRequest.numberOfPeople || 1,
      children: 0,
      unitPriceAdult: finalPrice / (tourRequest.numberOfPeople || 1),
      unitPriceChild: 0,
      date: tourRequest.preferredDate || new Date().toISOString().split('T')[0]
    };

    // Create booking
    const booking = new Booking({
      userId,
      items: [bookingItem],
      currency,
      originalAmount: finalPrice,
      discountAmount: 0,
      totalAmount: finalPrice,
      totalVND: currency === 'VND' ? finalPrice : null,
      totalUSD: currency === 'USD' ? finalPrice : null,
      orderRef,
      status: 'pending',
      payment: {
        provider: 'pending',
        orderId: orderRef,
        status: 'pending',
        amount: finalPrice,
        currency,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      },
      contactInfo: {
        email: tourRequest.userId.email,
        phone: tourRequest.contactPhone || tourRequest.userId.phone,
        fullName: tourRequest.userId.name
      },
      customerNote: tourRequest.specialRequirements || '',
      customTourRequest: {
        requestId: tourRequest._id,
        guideId: tourRequest.guideId._id,
        itineraryId: tourRequest.itineraryId._id
      }
    });

    await booking.save();

    // Link booking to tour request
    tourRequest.bookingId = booking._id;
    await tourRequest.save();

    console.log('[TourRequest] Created booking from custom tour request:', {
      bookingId: booking._id,
      orderRef: booking.orderRef,
      requestId: tourRequest._id,
      amount: finalPrice,
      currency
    });

    res.json({
      success: true,
      booking,
      message: 'Booking created successfully. Proceed to payment.',
      paymentUrl: `/payment/${booking._id}`,
      nextStep: 'payment'
    });

  } catch (error) {
    console.error('[TourRequest] Error creating booking:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
