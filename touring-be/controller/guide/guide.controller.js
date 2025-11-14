const Guide = require("../../models/guide/Guide");
const TourRequest = require("../../models/guide/TourRequest");
const GuideTour = require("../../models/guide/GuideTour");
const GuideEarnings = require("../../models/guide/GuideEarnings");
const GuideNotification = require("../../models/guide/GuideNotification");
const TourCustomRequest = require("../../models/TourCustomRequest");
const User = require("../../models/Users");
const Zone = require("../../models/Zones");

// Get all available guides (public) - filter by location if provided
const getAvailableGuides = async (req, res) => {
  try {
    const { location, provinceId, coverageArea, zoneName } = req.query;
    
    // Build query
    const query = { 
      isVerified: true, // Only show verified guides
      profileComplete: true, // Only show complete profiles
      availability: 'Available'
    };

    // ✅ Priority filter: zone name (most specific)
    if (zoneName) {
      // 🔍 Lookup zone in database to get the correct province
      const zone = await Zone.findOne({ name: zoneName }).select('province');
      
      let province;
      if (zone && zone.province) {
        // Use province from zone database
        province = zone.province.toLowerCase();
        console.log(`[Guide] Found zone "${zoneName}" -> province: "${province}"`);
      } else {
        // Fallback: extract from zoneName (e.g., "Da Nang - Son Tra" -> "Da Nang")
        province = zoneName.split('-')[0].trim().toLowerCase();
        console.log(`[Guide] Zone not found, extracted province from name: "${province}"`);
      }
      
      // Create flexible regex patterns to match both "nha trang" and "nha-trang"
      const provinceWithSpace = province.replace(/-/g, ' ');
      const provinceWithDash = province.replace(/\s+/g, '-');
      
      query.$or = [
        { location: new RegExp(provinceWithSpace, 'i') },
        { location: new RegExp(provinceWithDash, 'i') },
        { coverageAreas: { $elemMatch: { $regex: provinceWithSpace, $options: 'i' } } },
        { coverageAreas: { $elemMatch: { $regex: provinceWithDash, $options: 'i' } } },
        { provinceId: new RegExp(provinceWithSpace, 'i') },
        { provinceId: new RegExp(provinceWithDash, 'i') }
      ];
      
      console.log(`[Guide] Filtering by province: "${provinceWithSpace}" or "${provinceWithDash}"`);
    }
    // Filter by provinceId
    else if (provinceId) {
      query.provinceId = provinceId;
    }
    // Filter by coverage area
    else if (coverageArea) {
      query.coverageAreas = { $in: [coverageArea] };
    }
    // Filter by general location
    else if (location) {
      query.$or = [
        { location: new RegExp(location, 'i') },
        { coverageAreas: { $elemMatch: { $regex: location, $options: 'i' } } }
      ];
    }

    const guides = await Guide.find(query)
      .select('name bio rating totalTours languages specialties location coverageAreas avatar licenseNumber licenseVerified')
      .sort({ rating: -1, totalTours: -1 })
      .limit(50);
    
    console.log(`[Guide] Found ${guides.length} guides for query:`, query);
    
    res.json({ 
      success: true,
      guides,
      total: guides.length,
      filter: zoneName || location || provinceId || coverageArea || 'all'
    });
  } catch (error) {
    console.error('[Guide] Error fetching available guides:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get guide profile
const getGuideProfile = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id || req.user?.id;
    
    // Find guide by userId
    let guide = await Guide.findOne({ userId });
    
    // If guide doesn't exist, create one
    if (!guide) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: "User not found" 
        });
      }

      // Create new guide profile
      guide = new Guide({
        guideId: `guide-${Date.now()}`,
        userId: userId,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        avatar: user.avatar?.url || '',
        bio: '',
        rating: 5.0,
        totalTours: 0,
        toursConducted: 0,
        experience: 'Mới',
        languages: [],
        specialties: [],
        location: user.location?.addressLine || '',
        provinceId: user.location?.provinceId || '',
        coverageAreas: [],
        certifications: [],
        availability: 'Available',
        joinedDate: new Date(),
        profileComplete: false,
        isVerified: false,
        verificationStatus: 'incomplete'
      });
      await guide.save();
    }
    
    // Check and update profile completeness
    guide.checkProfileComplete();
    await guide.save();
    
    res.json({ 
      success: true,
      ...guide.toObject() 
    });
  } catch (error) {
    console.error('[Guide] Error fetching profile:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get tour requests for guide
const getTourRequests = async (req, res) => {
  try {
    const guide = await Guide.findOne({ userId: req.user.id });
    if (!guide) {
      return res.status(404).json({ message: "Guide not found" });
    }

    const requests = await TourRequest.find({ guideId: guide._id })
      .sort({ requestedAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get guide tours
const getGuideTours = async (req, res) => {
  try {
    const guide = await Guide.findOne({ userId: req.user.id });
    if (!guide) {
      return res.status(404).json({ message: "Guide not found" });
    }

    const tours = await GuideTour.find({ guideId: guide._id })
      .sort({ departureDate: -1 });
    res.json(tours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get guide earnings
const getGuideEarnings = async (req, res) => {
  try {
    const guide = await Guide.findOne({ userId: req.user.id });
    if (!guide) {
      return res.status(404).json({ message: "Guide not found" });
    }

    const earnings = await GuideEarnings.findOne({ guideId: guide._id });
    if (!earnings) {
      return res.status(404).json({ message: "Earnings data not found" });
    }
    res.json(earnings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get guide notifications
const getGuideNotifications = async (req, res) => {
  try {
    const guide = await Guide.findOne({ userId: req.user.id });
    if (!guide) {
      return res.status(404).json({ message: "Guide not found" });
    }

    const notifications = await GuideNotification.find({ guideId: guide._id })
      .sort({ timestamp: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept tour request
const acceptTourRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const guide = await Guide.findOne({ userId: req.user.id });
    if (!guide) {
      return res.status(404).json({ message: "Guide not found" });
    }

    const request = await TourRequest.findOne({ requestId, guideId: guide._id });
    if (!request) {
      return res.status(404).json({ message: "Tour request not found" });
    }

    request.status = "accepted";
    await request.save();

    // Create a new tour from the request
    const newTour = new GuideTour({
      tourId: `tour-${Date.now()}`,
      tourName: request.tourName,
      customerId: request.customerId,
      customerName: request.customerName,
      customerAvatar: request.customerAvatar,
      customerEmail: request.customerEmail,
      departureDate: request.departureDate,
      startTime: request.startTime,
      endTime: request.endTime,
      location: request.location,
      numberOfGuests: request.numberOfGuests,
      duration: request.duration,
      totalPrice: request.totalPrice,
      earnings: request.earnings,
      status: "accepted",
      pickupPoint: request.pickupPoint,
      specialRequests: request.specialRequests,
      contactPhone: request.contactPhone,
      paymentStatus: request.paymentStatus,
      paymentMethod: request.paymentMethod,
      imageItems: request.imageItems,
      itinerary: request.itinerary,
      includedServices: request.includedServices,
      excludedServices: request.excludedServices,
      guideId: guide._id,
    });

    await newTour.save();

    res.json({ message: "Tour request accepted", tour: newTour });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject tour request
const rejectTourRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const guide = await Guide.findOne({ userId: req.user.id });
    if (!guide) {
      return res.status(404).json({ message: "Guide not found" });
    }

    const request = await TourRequest.findOne({ requestId, guideId: guide._id });
    if (!request) {
      return res.status(404).json({ message: "Tour request not found" });
    }

    request.status = "rejected";
    await request.save();

    res.json({ message: "Tour request rejected" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============= CUSTOM TOUR REQUEST HANDLERS =============

// Get all custom tour requests for guide
const getCustomTourRequests = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id || req.user?.id;
    const { status, page = 1, limit = 10 } = req.query;

    console.log('[Guide] getCustomTourRequests - req.user:', req.user);
    console.log('[Guide] getCustomTourRequests - userId:', userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: User ID not found in token'
      });
    }

    // Build query: Show ALL requests assigned to this guide (both direct and claimed)
    const query = {
      guideId: userId
      // ✅ Removed isDirectRequest filter - show both direct and broadcast requests
    };

    // Filter by specific status if provided
    // Support both single status and comma-separated list of statuses
    if (status) {
      const statusList = status.split(',').map(s => s.trim());
      if (statusList.length === 1) {
        query.status = statusList[0];
      } else {
        query.status = { $in: statusList };
      }
    }

    const skip = (page - 1) * limit;

    console.log('[Guide] Fetching requests for guide:', userId);
    console.log('[Guide] Query:', JSON.stringify(query));

    const requests = await TourCustomRequest.find(query)
      .populate('userId', 'name email phone avatar')
      .populate('itineraryId', 'name zoneName items preferences routePolyline totalDistance totalDuration')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await TourCustomRequest.countDocuments(query);

    console.log(`[Guide] Found ${total} requests for guide ${userId}`);
    console.log('[Guide] Requests:', requests.map(r => ({ id: r._id, status: r.status, isDirectRequest: r.isDirectRequest })));

    res.json({
      success: true,
      tourRequests: requests,  // ✅ FIX: Frontend expects 'tourRequests'
      requests,                 // ✅ Keep for backward compat
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('[Guide] Error fetching custom tour requests:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get single custom tour request details
const getCustomTourRequestDetails = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id || req.user?.id;
    const { requestId } = req.params;

    const tourRequest = await TourCustomRequest.findById(requestId)
      .populate('userId', 'name email phone avatar')
      .populate('itineraryId', 'name zoneName items preferences routePolyline totalDistance totalDuration aiInsights')
      .populate('guideId', 'name email phone avatar profile');

    if (!tourRequest) {
      return res.status(404).json({
        success: false,
        error: 'Tour request not found'
      });
    }

    // Check if guide has access to this request
    const hasAccess = tourRequest.status === 'pending' || 
                     (tourRequest.guideId && tourRequest.guideId._id.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this request'
      });
    }

    res.json({
      success: true,
      tourRequest
    });

  } catch (error) {
    console.error('[Guide] Error fetching request details:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Guide claims a pending request (assigns themselves)
const claimTourRequest = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id || req.user?.id;
    const { requestId } = req.params;

    const tourRequest = await TourCustomRequest.findById(requestId);

    if (!tourRequest) {
      return res.status(404).json({
        success: false,
        error: 'Tour request not found'
      });
    }

    if (tourRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Request is no longer available'
      });
    }

    if (tourRequest.guideId) {
      return res.status(400).json({
        success: false,
        error: 'Request already claimed by another guide'
      });
    }

    // Assign guide to request
    tourRequest.guideId = userId;
    tourRequest.status = 'negotiating';
    await tourRequest.save();

    // Notify customer
    try {
      const Notification = require("../../models/Notification");
      await Notification.create({
        userId: tourRequest.userId,
        type: 'tour_guide_assigned',
        title: 'Tour Guide Found!',
        message: `A guide has claimed your tour request ${tourRequest.requestNumber}`,
        relatedId: tourRequest._id,
        relatedModel: 'TourCustomRequest'
      });
    } catch (notifError) {
      console.error('[Guide] Error creating notification:', notifError);
    }

    await tourRequest.populate('userId', 'name email phone avatar');
    await tourRequest.populate('guideId', 'name email phone avatar profile');

    res.json({
      success: true,
      tourRequest,
      message: 'Request claimed successfully. You can now negotiate with the customer.'
    });

  } catch (error) {
    console.error('[Guide] Error claiming request:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Guide makes a counter-offer
const guideCounterOffer = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id || req.user?.id;
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
      guideId: userId
    });

    if (!tourRequest) {
      return res.status(404).json({
        success: false,
        error: 'Tour request not found or not assigned to you'
      });
    }

    if (!['pending', 'negotiating'].includes(tourRequest.status)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot make offer on this request'
      });
    }

    // Add price offer
    await tourRequest.addPriceOffer('guide', amount, currency, message);

    // Notify customer
    try {
      const Notification = require("../../models/Notification");
      await Notification.create({
        userId: tourRequest.userId,
        type: 'price_offer',
        title: 'New Price Offer from Guide',
        message: `Your guide offered ${amount.toLocaleString()} ${currency} for ${tourRequest.requestNumber}`,
        relatedId: tourRequest._id,
        relatedModel: 'TourCustomRequest'
      });
    } catch (notifError) {
      console.error('[Guide] Error creating notification:', notifError);
    }

    await tourRequest.populate('userId', 'name email phone avatar');

    res.json({
      success: true,
      tourRequest,
      message: 'Counter-offer sent successfully'
    });

  } catch (error) {
    console.error('[Guide] Error making counter-offer:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Guide sends a message
const guideSendMessage = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id || req.user?.id;
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
      guideId: userId
    });

    if (!tourRequest) {
      return res.status(404).json({
        success: false,
        error: 'Tour request not found or not assigned to you'
      });
    }

    await tourRequest.addMessage('guide', content.trim());

    // Notify customer
    try {
      const Notification = require("../../models/Notification");
      await Notification.create({
        userId: tourRequest.userId,
        type: 'new_message',
        title: 'New Message from Guide',
        message: `New message for request ${tourRequest.requestNumber}`,
        relatedId: tourRequest._id,
        relatedModel: 'TourCustomRequest'
      });
    } catch (notifError) {
      console.error('[Guide] Error creating notification:', notifError);
    }

    res.json({
      success: true,
      message: 'Message sent successfully',
      messages: tourRequest.messages
    });

  } catch (error) {
    console.error('[Guide] Error sending message:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Guide accepts and finalizes the deal
const guideAcceptDeal = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id || req.user?.id;
    const { requestId } = req.params;
    const { finalAmount, currency = 'VND' } = req.body;

    console.log('[guideAcceptDeal] Request:', { userId, requestId, finalAmount, currency });

    const tourRequest = await TourCustomRequest.findOne({
      _id: requestId,
      guideId: userId
    });

    if (!tourRequest) {
      console.warn('[guideAcceptDeal] Tour request not found:', requestId);
      return res.status(404).json({
        success: false,
        error: 'Tour request not found or not assigned to you'
      });
    }

    console.log('[guideAcceptDeal] Current status:', tourRequest.status);

    // Allow accepting from pending or negotiating status
    if (tourRequest.status !== 'negotiating' && tourRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Request cannot be accepted from ${tourRequest.status} status`
      });
    }

    // Determine final amount to use
    let amountToAccept = finalAmount;
    if (!finalAmount || finalAmount === 0) {
      // Use latest negotiated price or initial budget
      if (tourRequest.priceOffers && tourRequest.priceOffers.length > 0) {
        const latestOffer = tourRequest.priceOffers[tourRequest.priceOffers.length - 1];
        amountToAccept = latestOffer.amount;
        console.log('[guideAcceptDeal] Using latest price offer:', amountToAccept);
      } else if (tourRequest.initialBudget?.amount) {
        amountToAccept = tourRequest.initialBudget.amount;
        console.log('[guideAcceptDeal] Using initial budget:', amountToAccept);
      } else {
        return res.status(400).json({
          success: false,
          error: 'No price information available to accept'
        });
      }
    }

    console.log('[guideAcceptDeal] Final amount to accept:', amountToAccept);

    // Accept request with final price
    await tourRequest.acceptRequest(amountToAccept, currency);

    // Update itinerary if exists
    const Itinerary = require("../../models/Itinerary");
    if (tourRequest.itineraryId) {
      try {
        const itinerary = await Itinerary.findById(tourRequest.itineraryId);
        if (itinerary) {
          itinerary.tourGuideRequest.status = 'accepted';
          itinerary.tourGuideRequest.guideId = userId;
          itinerary.tourGuideRequest.respondedAt = new Date();
          await itinerary.save();
          console.log('[guideAcceptDeal] Updated itinerary status to accepted');
        }
      } catch (itinError) {
        console.warn('[guideAcceptDeal] Warning: Could not update itinerary:', itinError.message);
      }
    }

    // Notify customer
    try {
      const Notification = require("../../models/Notification");
      await Notification.create({
        userId: tourRequest.userId,
        type: 'request_accepted',
        title: '✅ Tour Request Accepted!',
        message: `Your guide accepted the deal for ${tourRequest.requestNumber}. Final price: ${amountToAccept.toLocaleString('vi-VN')} ${currency}`,
        relatedId: tourRequest._id,
        relatedModel: 'TourCustomRequest'
      });
      console.log('[guideAcceptDeal] Notification created for customer');
    } catch (notifError) {
      console.error('[guideAcceptDeal] Error creating notification:', notifError.message);
      // Don't fail the main operation if notification fails
    }

    // Refetch updated document with populated customer info
    const updatedRequest = await TourCustomRequest.findById(requestId)
      .populate('userId', 'name email phone avatar');

    console.log('[guideAcceptDeal] Success - request status now:', updatedRequest.status);

    res.json({
      success: true,
      tourRequest: updatedRequest,
      message: 'Deal accepted! Waiting for customer payment.'
    });

  } catch (error) {
    console.error('[guideAcceptDeal] Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Guide rejects a request
const guideRejectRequest = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id || req.user?.id;
    const { requestId } = req.params;
    const { reason } = req.body || {};

    console.log('[guideRejectRequest] Request:', { userId, requestId, reason });

    const tourRequest = await TourCustomRequest.findOne({
      _id: requestId,
      guideId: userId
    });

    if (!tourRequest) {
      console.warn('[guideRejectRequest] Tour request not found:', requestId);
      return res.status(404).json({
        success: false,
        error: 'Tour request not found or not assigned to you'
      });
    }

    console.log('[guideRejectRequest] Current status:', tourRequest.status);

    if (tourRequest.status === 'accepted' || tourRequest.status === 'rejected') {
      return res.status(400).json({
        success: false,
        error: `Cannot reject a ${tourRequest.status} request`
      });
    }

    await tourRequest.rejectRequest(reason);

    // Update itinerary if exists
    const Itinerary = require("../../models/Itinerary");
    if (tourRequest.itineraryId) {
      try {
        const itinerary = await Itinerary.findById(tourRequest.itineraryId);
        if (itinerary) {
          itinerary.tourGuideRequest.status = 'rejected';
          itinerary.tourGuideRequest.respondedAt = new Date();
          await itinerary.save();
          console.log('[guideRejectRequest] Updated itinerary status to rejected');
        }
      } catch (itinError) {
        console.warn('[guideRejectRequest] Warning: Could not update itinerary:', itinError.message);
      }
    }

    // Notify customer
    try {
      const Notification = require("../../models/Notification");
      await Notification.create({
        userId: tourRequest.userId,
        type: 'request_rejected',
        title: '❌ Tour Request Rejected',
        message: `Your guide rejected request ${tourRequest.requestNumber}${reason ? ': ' + reason : ''}`,
        relatedId: tourRequest._id,
        relatedModel: 'TourCustomRequest'
      });
      console.log('[guideRejectRequest] Notification created for customer');
    } catch (notifError) {
      console.error('[guideRejectRequest] Error creating notification:', notifError.message);
      // Don't fail the main operation if notification fails
    }

    console.log('[guideRejectRequest] Success - request status now: rejected');

    res.json({
      success: true,
      message: 'Request rejected successfully'
    });

  } catch (error) {
    console.error('[guideRejectRequest] Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Update guide profile
const updateGuideProfile = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id || req.user?.id;
    const guide = await Guide.findOne({ userId });
    
    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide profile not found'
      });
    }

    const {
      name,
      phone,
      bio,
      experience,
      languages,
      specialties,
      location,
      provinceId,
      coverageAreas,
      licenseNumber,
      availability
    } = req.body;

    // Update allowed fields
    if (name) guide.name = name.trim();
    if (phone) guide.phone = phone.trim();
    if (bio !== undefined) guide.bio = bio.trim();
    if (experience) guide.experience = experience;
    if (languages && Array.isArray(languages)) guide.languages = languages;
    if (specialties && Array.isArray(specialties)) guide.specialties = specialties;
    if (location) guide.location = location;
    if (provinceId) guide.provinceId = provinceId;
    if (coverageAreas && Array.isArray(coverageAreas)) guide.coverageAreas = coverageAreas;
    if (licenseNumber) guide.licenseNumber = licenseNumber.trim();
    if (availability) guide.availability = availability;

    // Check and update profile completeness
    guide.checkProfileComplete();
    
    await guide.save();

    res.json({
      success: true,
      guide,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('[Guide] Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Upload certificate
const uploadCertificate = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id || req.user?.id;
    const guide = await Guide.findOne({ userId });
    
    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide profile not found'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { name, issuer, issueDate, expiryDate } = req.body;

    if (!name || !issuer) {
      return res.status(400).json({
        success: false,
        message: 'Certificate name and issuer are required'
      });
    }

    // Store file in MongoDB as base64 or binary
    const certificate = {
      name: name.trim(),
      issuer: issuer.trim(),
      issueDate: issueDate ? new Date(issueDate) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      documentUrl: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
      verified: false
    };

    guide.certifications.push(certificate);
    
    // Check and update profile completeness
    guide.checkProfileComplete();
    
    // If profile was incomplete and now complete, update verification status
    if (guide.profileComplete && guide.verificationStatus === 'incomplete') {
      guide.verificationStatus = 'pending';
    }
    
    await guide.save();

    res.json({
      success: true,
      certificate: guide.certifications[guide.certifications.length - 1],
      profileComplete: guide.profileComplete,
      message: 'Certificate uploaded successfully'
    });
  } catch (error) {
    console.error('[Guide] Error uploading certificate:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete certificate
const deleteCertificate = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id || req.user?.id;
    const { certId } = req.params;
    
    const guide = await Guide.findOne({ userId });
    
    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide profile not found'
      });
    }

    const certIndex = guide.certifications.findIndex(
      cert => cert._id.toString() === certId
    );

    if (certIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    guide.certifications.splice(certIndex, 1);
    
    // Check and update profile completeness
    guide.checkProfileComplete();
    
    await guide.save();

    res.json({
      success: true,
      profileComplete: guide.profileComplete,
      message: 'Certificate deleted successfully'
    });
  } catch (error) {
    console.error('[Guide] Error deleting certificate:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Guide agrees to terms (commitment)
const guideAgreeToTerms = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id || req.user?.id;
    const { requestId } = req.params;
    const { terms } = req.body;

    const tourRequest = await TourCustomRequest.findOne({
      _id: requestId,
      guideId: userId
    });

    if (!tourRequest) {
      return res.status(404).json({
        success: false,
        error: 'Tour request not found or not assigned to you'
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

    // Guide agrees to the terms
    await tourRequest.guideAgreeToTerms(terms);

    // Check if both parties agreed
    const bothAgreed = tourRequest.isBothAgreed();

    // Notify customer
    try {
      const Notification = require("../../models/Notification");
      await Notification.create({
        userId: tourRequest.userId,
        type: bothAgreed ? 'agreement_complete' : 'guide_agreed',
        title: bothAgreed ? 'Agreement Complete!' : 'Guide Agreed to Terms',
        message: bothAgreed 
          ? `Both parties agreed! Request ${tourRequest.requestNumber} is ready for final acceptance and booking.`
          : `Your guide agreed to terms for ${tourRequest.requestNumber}. Please review and confirm.`,
        relatedId: tourRequest._id,
        relatedModel: 'TourCustomRequest'
      });
    } catch (notifError) {
      console.error('[Guide] Error creating notification:', notifError);
    }

    await tourRequest.populate('userId', 'name email phone avatar');

    res.json({
      success: true,
      tourRequest,
      bothAgreed,
      message: bothAgreed 
        ? 'Both parties agreed! Ready for final acceptance and booking.'
        : 'You have agreed to the terms. Waiting for traveller confirmation.'
    });

  } catch (error) {
    console.error('[Guide] Error agreeing to terms:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get agreement status for guide
const getGuideAgreementStatus = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id || req.user?.id;
    const { requestId } = req.params;

    const tourRequest = await TourCustomRequest.findOne({
      _id: requestId,
      guideId: userId
    }).select('agreement status');

    if (!tourRequest) {
      return res.status(404).json({
        success: false,
        error: 'Tour request not found or not assigned to you'
      });
    }

    res.json({
      success: true,
      agreement: tourRequest.agreement || {},
      status: tourRequest.status,
      bothAgreed: tourRequest.isBothAgreed()
    });

  } catch (error) {
    console.error('[Guide] Error getting agreement status:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

module.exports = {
  getAvailableGuides,
  getGuideProfile,
  updateGuideProfile,
  uploadCertificate,
  deleteCertificate,
  getTourRequests,
  getGuideTours,
  getGuideEarnings,
  getGuideNotifications,
  acceptTourRequest,
  rejectTourRequest,
  // Custom tour request handlers
  getCustomTourRequests,
  getCustomTourRequestDetails,
  claimTourRequest,
  guideCounterOffer,
  guideSendMessage,
  guideAcceptDeal,
  guideRejectRequest,
  guideAgreeToTerms,
  getGuideAgreementStatus
};