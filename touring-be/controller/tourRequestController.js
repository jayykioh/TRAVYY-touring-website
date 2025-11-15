const TourCustomRequest = require('../models/TourCustomRequest');
const Itinerary = require('../models/Itinerary');
const User = require('../models/Users');
const Guide = require('../models/guide/Guide');
const GuideNotification = require('../models/guide/GuideNotification');
const Notification = require('../models/Notification');
const NotificationService = require('../services/notificationService');

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
      guideId
    } = req.body;

    console.log('[TourRequest] CREATE REQUEST - Input:', {
      userId,
      itineraryId,
      guideId,
      initialBudget,
      numberOfGuests,
      preferredDates: preferredDates?.length
    });

    // 🔍 VALIDATE: Basic input validation (all in one pass)
    if (!itineraryId || !guideId) {
      return res.status(400).json({ 
        success: false, 
        error: !itineraryId ? 'itineraryId is required' : 'guideId is required' 
      });
    }

    if (!initialBudget?.amount || initialBudget.amount <= 0 || numberOfGuests < 1 || numberOfGuests > 10) {
      return res.status(400).json({ 
        success: false, 
        error: initialBudget?.amount <= 0 ? 'Invalid budget' : 'Invalid guest count (1-10)' 
      });
    }

    if (!Array.isArray(preferredDates) || preferredDates.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please select at least one preferred date' 
      });
    }

    // 🚀 PARALLEL: Fetch guide, user, itinerary, and check duplicate - ALL AT ONCE
    const [guideProfile, user, itinerary, existingRequest] = await Promise.all([
      Guide.findById(guideId).populate('userId', 'name email phone').lean(),
      User.findById(userId).select('name email phone').lean(),
      Itinerary.findOne({ _id: itineraryId, userId }).lean(),
      TourCustomRequest.findOne({
        itineraryId,
        userId,
        status: { $in: ['pending', 'negotiating'] }
      }).lean()
    ]);

    console.log('[TourRequest] DB FETCH - Results:', {
      guideProfile: !!guideProfile,
      guideUserId: guideProfile?.userId?._id || guideProfile?.userId,
      user: !!user,
      itinerary: !!itinerary,
      itineraryItems: itinerary?.items?.length,
      existingRequest: !!existingRequest
    });

    // Validate all in one pass
    if (!guideProfile) return res.status(404).json({ success: false, error: 'Guide not found' });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    if (!itinerary) return res.status(404).json({ success: false, error: 'Itinerary not found' });
    if (!itinerary.items?.length) return res.status(400).json({ success: false, error: 'Itinerary has no items' });
    if (existingRequest) return res.status(400).json({ success: false, error: 'Active request exists', requestId: existingRequest._id });

    // Get User ID from Guide profile
    const guideUserId = guideProfile.userId?._id || guideProfile.userId;
    
    if (!guideUserId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Guide profile incomplete - missing user link' 
      });
    }

    // 📦 BUILD: tourDetails from itinerary items (optimized)
    const tourDetails = {
      zoneName: itinerary.zoneName || itinerary.name,
      numberOfDays: itinerary.preferences?.durationDays || 1,
      numberOfGuests,
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

    // 💾 CREATE: TourCustomRequest + Update Itinerary in PARALLEL (not sequential)
    const [tourRequest] = await Promise.all([
      TourCustomRequest.create({
        userId,
        itineraryId,
        guideId: guideUserId,
        isDirectRequest: true,
        tourDetails,
        initialBudget: {
          amount: initialBudget.amount,
          currency: initialBudget.currency || 'VND'
        },
        specialRequirements,
        contactInfo: {
          phone: contactInfo?.phone || user.phone,
          email: contactInfo?.email || user.email,
          preferredContactMethod: contactInfo?.preferredContactMethod || 'app'
        },
        preferredDates: (preferredDates || []).map(dateStr => ({
          startDate: new Date(dateStr),
          endDate: new Date(new Date(dateStr).setDate(new Date(dateStr).getDate() + (tourDetails.numberOfDays || 1))),
          flexible: false
        })),
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        itinerarySynced: true,
        itinerarySyncedAt: new Date()
      }),
      // Update itinerary in parallel
      Itinerary.updateOne(
        { _id: itineraryId },
        {
          $set: {
            isCustomTour: true,
            tourGuideRequest: {
              status: 'pending',
              guideId: guideUserId,
              requestedAt: new Date()
            }
          }
        }
      )
    ]);

    console.log('[TourRequest] CREATED - Request ID:', tourRequest._id);

    // 💬 CREATE CHAT ROOM ASYNC (non-blocking - fire and forget)
    // Create a system message in TourRequestChat to initialize chat room
    const TourRequestChat = require('../models/TourRequestChat');
    TourRequestChat.create({
      tourRequestId: tourRequest._id,
      sender: {
        userId: userId,
        role: 'user',
        name: user.name
      },
      messageType: 'system',
      content: ` ${user.name} đã tạo yêu cầu tour cho ${tourDetails.zoneName}`,
      isRead: false
    }).catch(err => console.error('[TourRequest] Chat room creation error:', err));

    // 🔔 NOTIFY guide ASYNC (non-blocking - fire and forget with index hint)
    NotificationService.onTourRequestCreated(
      tourRequest,
      guideProfile,
      user
    ).catch(err => console.error('[TourRequest] Notification error:', err));

    // 📤 RESPONSE: Return immediately without waiting for notification
    res.json({
      success: true,
      tourRequest,
      message: 'Yêu cầu đã gửi đến hướng dẫn viên được chọn.'
    });

  } catch (error) {
    console.error('[TourRequest] Error creating tour request:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

/**
 * ⚡ FAST endpoint to check if user has active request for itinerary
 * Used for pre-validation before submission (no transaction, no notifications)
 */
exports.checkActiveRequest = async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const { itineraryId } = req.params;

    if (!itineraryId) {
      return res.status(400).json({ 
        success: false, 
        error: 'itineraryId is required' 
      });
    }

    // ⚡ ULTRA-FAST: Only query for active requests (lean mode, no populate)
    const activeRequest = await TourCustomRequest.findOne({
      itineraryId,
      userId,
      status: { $in: ['pending', 'negotiating'] }
    })
    .select('_id status')
    .lean()
    .hint({ itineraryId: 1, userId: 1, status: 1 }); // Force index usage

    console.log('[TourRequest] CHECK-ACTIVE:', {
      itineraryId,
      userId,
      hasActive: !!activeRequest,
      requestId: activeRequest?._id
    });

    res.json({
      success: true,
      hasActive: !!activeRequest,
      requestId: activeRequest?._id || null,
      status: activeRequest?.status || null
    });

  } catch (error) {
    console.error('[TourRequest] Error checking active request:', error);
    // Return empty response on error instead of error status
    // This allows submission to proceed (backend will catch duplicate)
    res.json({
      success: true,
      hasActive: false,
      requestId: null
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
      const statusList = status.split(',').map(s => s.trim());
      if (statusList.length === 1) {
        query.status = statusList[0];
      } else {
        query.status = { $in: statusList };
      }
    }

    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      TourCustomRequest.find(query)
        .select('-messages -priceOffers.message') // Exclude large fields for list view
        .populate('guideId', 'name email phone avatar')
        .populate('itineraryId', 'name zoneName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      TourCustomRequest.countDocuments(query).hint({ userId: 1, status: 1 }) // Use index hint
    ]);

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
      .populate('guideId', 'name email phone avatar')
      .populate('itineraryId', 'name zoneName items')
      .populate('userId', 'name email phone avatar')
      .lean();

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

    // Validate against minPrice
    if (tourRequest.minPrice?.amount && amount < tourRequest.minPrice.amount) {
      return res.status(400).json({
        success: false,
        error: `Offer must be >= ${tourRequest.minPrice.amount.toLocaleString()} ${tourRequest.minPrice.currency}`,
        minPrice: tourRequest.minPrice
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
        // tourRequest.guideId stores User._id; find the Guide profile
        const guideProfile = await Guide.findOne({ userId: tourRequest.guideId });
        if (guideProfile) {
          await NotificationService.onUserPriceOffer(
            tourRequest,
            amount,
            currency,
            guideProfile
          );
          console.log(`[TourRequest] Sent price offer notification to guide ${guideProfile._id}`);
        }
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
        const guideProfile = await Guide.findOne({ userId: tourRequest.guideId });
        if (guideProfile) {
          await NotificationService.onNewMessage(
            tourRequest,
            { name: 'User' }, // sender
            guideProfile, // recipient
            false // isGuide = false (sender is user)
          );
          console.log(`[TourRequest] Sent new message notification to guide ${guideProfile._id}`);
        }
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
        const guideProfile = await Guide.findOne({ userId: tourRequest.guideId });
        if (guideProfile) {
          await NotificationService.onRequestCancelled(
            tourRequest,
            { name: 'User' },
            guideProfile,
            reason
          );
          console.log(`[TourRequest] Sent cancellation notification to guide ${guideProfile._id}`);
        }
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
        const guideProfile = await Guide.findOne({ userId: tourRequest.guideId });
        if (guideProfile) {
          await GuideNotification.create({
            guideId: guideProfile._id,
            notificationId: `guide-${guideProfile._id}-${Date.now()}`,
            type: 'request_accepted',
            title: '🎉 Đề xuất được chấp nhận!',
            message: `Khách hàng đã chấp nhận đề xuất của bạn cho ${tourRequest.requestNumber}. Hãy tiến hành booking.`,
            relatedId: tourRequest._id,
            relatedModel: 'TourCustomRequest',
            priority: 'high'
          });
          console.log(`[TourRequest] Sent offer accepted notification to guide ${guideProfile._id}`);
        }
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

// User or Guide agrees to terms (commitment before booking)
exports.userAgreeToTerms = async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const userRole = req.user?.role;
    const { requestId } = req.params;
    const { terms } = req.body || {};

    const tourRequest = await TourCustomRequest.findOne({
      _id: requestId
    });

    if (!tourRequest) {
      return res.status(404).json({
        success: false,
        error: 'Tour request not found'
      });
    }

    // Check if user has permission to agree (must be either the creator or the guide)
    if (tourRequest.userId.toString() !== userId && tourRequest.guideId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to agree to this request'
      });
    }

    // Allow agreement on pending or negotiating status
    if (!['pending', 'negotiating'].includes(tourRequest.status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot agree to terms on ${tourRequest.status} request`
      });
    }

    // Ensure status is set to negotiating if pending
    if (tourRequest.status === 'pending') {
      tourRequest.status = 'negotiating';
    }

    // Mark appropriate party as agreed
    if (userRole === 'TourGuide' || tourRequest.guideId.toString() === userId) {
      // Guide agrees
      if (!tourRequest.agreement) {
        tourRequest.agreement = {
          guideAgreed: true,
          guideAgreedAt: new Date()
        };
      } else {
        tourRequest.agreement.guideAgreed = true;
        tourRequest.agreement.guideAgreedAt = new Date();
      }
    } else {
      // User agrees
      await tourRequest.userAgreeToTerms(terms);
    }

    await tourRequest.save();

    // Check if both parties agreed
    const bothAgreed = tourRequest.agreement?.userAgreed && tourRequest.agreement?.guideAgreed;

    if (bothAgreed && !tourRequest.agreement.completedAt) {
      // Another atomic update to set completedAt and status
      await TourCustomRequest.findByIdAndUpdate(
        requestId,
        {
          $set: {
            'agreement.completedAt': new Date(),
            status: 'agreement_pending',
            // Set finalPrice if not already set
            ...(!tourRequest.finalPrice && {
              'finalPrice.amount': tourRequest.latestOffer?.amount || tourRequest.initialBudget?.amount,
              'finalPrice.currency': tourRequest.latestOffer?.currency || 'VND'
            })
          }
        }
      );

      // Refetch to get updated data
      await tourRequest.populate('guideId userId', 'name email phone avatar');

      console.log('[TourRequest] Both parties agreed - sending notifications');

      // Notify BOTH parties (async, non-blocking)
      try {
        // Fetch both user and guide profile in parallel
        const [travellerUser, guideProfile] = await Promise.all([
          User.findById(tourRequest.userId).select('email name').lean(),
          Guide.findOne({ userId: tourRequest.guideId }).lean()
        ]);

        // Use NotificationService to notify both parties
        if (travellerUser && guideProfile) {
          NotificationService.onAgreementComplete(
            tourRequest,
            travellerUser,
            guideProfile
          ).catch(notifError => {
            console.error('[TourRequest] Error creating agreement complete notifications:', notifError);
          });
        }

        // Emit socket event to chat room
        const io = req.app?.get('io');
        if (io) {
          io.to(`chat-${requestId}`).emit('agreementCompleted', {
            requestId,
            bothAgreed: true,
            status: 'agreement_pending',
            finalPrice: tourRequest.finalPrice,
            completedAt: new Date()
          });

          // Also emit to individual user rooms
          io.to(`user-${tourRequest.userId}`).emit('agreementCompleted', {
            requestId,
            bothAgreed: true,
            message: 'Cả hai bên đã đồng ý! Bạn có thể tiến hành thanh toán.'
          });

          io.to(`user-${tourRequest.guideId}`).emit('agreementCompleted', {
            requestId,
            bothAgreed: true,
            message: 'Cả hai bên đã đồng ý! Chờ khách hàng thanh toán.'
          });
        }
      } catch (notifError) {
        console.error('[TourRequest] Error creating agreement complete notifications:', notifError);
      }
    }

    res.json({
      success: true,
      tourRequest,
      bothAgreed,
      message: bothAgreed 
        ? 'Both parties agreed! Ready for final acceptance and booking.'
        : 'You have agreed to the terms. Waiting for the other party confirmation.'
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
