const Guide = require("../../models/guide/Guide");
const TourRequest = require("../../models/guide/TourRequest");
const GuideTour = require("../../models/guide/GuideTour");
const GuideEarnings = require("../../models/guide/GuideEarnings");
const GuideNotification = require("../../models/guide/GuideNotification");
const TourCustomRequest = require("../../models/TourCustomRequest");
const User = require("../../models/Users");
const Zone = require("../../models/Zones");
const Booking = require("../../models/Bookings");
const NotificationService = require("../../services/notificationService");

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

    // Get GuideTour (custom tours)
    const guideTours = await GuideTour.find({ guideId: guide._id })
      .sort({ departureDate: -1 });

    // Get regular bookings assigned to this guide
    const regularBookings = await Booking.find({ 
      guideId: guide._id,
      status: { $in: ['paid', 'completed'] }
    })
    .populate('userId', 'name email avatar')
    .sort({ createdAt: -1 })
    .select('items totalAmount status createdAt tourScheduledAt tourCompletedAt bookingCode');

    // Combine and format the results
    const tours = [
      ...guideTours.map(tour => ({
        id: tour._id,
        type: 'custom',
        tourName: tour.tourName,
        customerName: tour.customerName,
        customerEmail: tour.customerEmail,
        departureDate: tour.departureDate,
        startTime: tour.startTime,
        endTime: tour.endTime,
        status: tour.status,
        totalPrice: tour.totalPrice,
        earnings: tour.earnings,
        createdAt: tour.createdAt
      })),
      ...regularBookings.map(booking => ({
        id: booking._id,
        type: 'regular',
        tourName: booking.items[0]?.name || 'Tour',
        customerName: booking.userId?.name || 'Customer',
        customerEmail: booking.userId?.email || '',
        departureDate: booking.tourScheduledAt || booking.items[0]?.date,
        status: booking.status,
        totalPrice: booking.totalAmount,
        earnings: booking.totalAmount * 0.8, // 80% commission
        bookingCode: booking.bookingCode,
        createdAt: booking.createdAt
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(tours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get guide earnings
const getGuideEarnings = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id || req.user?.id;
    const guide = await Guide.findOne({ userId });
    if (!guide) {
      return res.status(404).json({ message: "Guide not found" });
    }

    // Calculate earnings from actual bookings and tour requests
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Find completed bookings with this guide
    const completedBookings = await Booking.find({
      guideId: guide._id,
      status: 'completed'
    }).select('totalAmount createdAt items');

    // Commission rate (guide gets 80% by default)
    const COMMISSION_RATE = 0.8;

    // Calculate this week earnings
    const thisWeek = completedBookings
      .filter(b => new Date(b.createdAt) >= startOfWeek)
      .reduce((sum, b) => sum + (b.totalAmount || 0) * COMMISSION_RATE, 0);

    // Calculate this month earnings
    const thisMonth = completedBookings
      .filter(b => new Date(b.createdAt) >= startOfMonth)
      .reduce((sum, b) => sum + (b.totalAmount || 0) * COMMISSION_RATE, 0);

    // Calculate last month earnings
    const lastMonth = completedBookings
      .filter(b => {
        const date = new Date(b.createdAt);
        return date >= startOfLastMonth && date <= endOfLastMonth;
      })
      .reduce((sum, b) => sum + (b.totalAmount || 0) * COMMISSION_RATE, 0);

    // Calculate total earnings
    const totalEarnings = completedBookings
      .reduce((sum, b) => sum + (b.totalAmount || 0) * COMMISSION_RATE, 0);

    // Calculate pending payments (accepted but not completed)
    const pendingBookings = await Booking.find({
      guideId: guide._id,
      status: { $in: ['paid'] }
    }).select('totalAmount');

    const pendingPayment = pendingBookings
      .reduce((sum, b) => sum + (b.totalAmount || 0) * COMMISSION_RATE, 0);

    // Generate weekly data (last 7 days)
    const weeklyData = [];
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const dayEarnings = completedBookings
        .filter(b => {
          const bookingDate = new Date(b.createdAt);
          return bookingDate >= date && bookingDate < nextDate;
        })
        .reduce((sum, b) => sum + (b.totalAmount || 0) * COMMISSION_RATE, 0);

      weeklyData.push({
        day: dayNames[date.getDay()],
        amount: Math.round(dayEarnings)
      });
    }

    // Generate monthly stats (last 12 months)
    const monthlyStats = [];
    const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const monthEarnings = completedBookings
        .filter(b => {
          const bookingDate = new Date(b.createdAt);
          return bookingDate >= monthStart && bookingDate <= monthEnd;
        })
        .reduce((sum, b) => sum + (b.totalAmount || 0) * COMMISSION_RATE, 0);

      monthlyStats.push({
        month: monthNames[monthStart.getMonth()],
        earnings: Math.round(monthEarnings)
      });
    }

    // Get recent payments (last 10 completed bookings)
    const recentPayments = completedBookings
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(b => {
        const amount = b.totalAmount || 0;
        const commission = amount * (1 - COMMISSION_RATE);
        const netAmount = amount * COMMISSION_RATE;
        
        return {
          paymentId: b._id.toString(),
          tourId: b.items?.[0]?.tourId?.toString() || '',
          tourName: b.items?.[0]?.tourId?.title || 'Custom Tour',
          date: b.createdAt,
          amount: Math.round(amount),
          commission: Math.round(commission),
          netAmount: Math.round(netAmount),
          status: 'paid',
          paidAt: b.createdAt
        };
      });

    const earnings = {
      summary: {
        thisWeek: Math.round(thisWeek),
        thisMonth: Math.round(thisMonth),
        lastMonth: Math.round(lastMonth),
        totalEarnings: Math.round(totalEarnings),
        pendingPayment: Math.round(pendingPayment)
      },
      weeklyData,
      recentPayments,
      monthlyStats,
      yearlyStats: monthlyStats // Same data for now
    };

    res.json(earnings);
  } catch (error) {
    console.error('[Guide] Error fetching earnings:', error);
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

    // 🔔 Notify traveller that guide accepted
    const traveller = await User.findById(request.customerId);
    if (traveller) {
      NotificationService.onTourRequestAccepted(
        request,
        traveller,
        guide
      ).catch(err => console.error('[Guide] Notification error:', err));
    }

    res.json({ message: "Tour request accepted", tour: newTour });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject tour request
const rejectTourRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;
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

    // 🔔 Notify traveller that guide rejected
    const traveller = await User.findById(request.customerId);
    if (traveller) {
      NotificationService.onTourRequestRejected(
        request,
        traveller,
        guide,
        reason
      ).catch(err => console.error('[Guide] Notification error:', err));
    }

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
    console.log('[guideAcceptDeal] req.user:', req.user);

    const tourRequest = await TourCustomRequest.findOne({
      _id: requestId,
      guideId: userId
    });

    if (!tourRequest) {
      console.warn('[guideAcceptDeal] Tour request not found:', requestId, 'for userId:', userId);
      
      // Debug: Check if request exists at all
      const requestExists = await TourCustomRequest.findById(requestId);
      console.log('[guideAcceptDeal] Request exists?', !!requestExists);
      if (requestExists) {
        console.log('[guideAcceptDeal] Request guideId:', requestExists.guideId, 'status:', requestExists.status);
      }
      
      return res.status(404).json({
        success: false,
        error: 'Tour request not found or not assigned to you'
      });
    }

    console.log('[guideAcceptDeal] Current status:', tourRequest.status);
    console.log('[guideAcceptDeal] Tour request details:', {
      guideId: tourRequest.guideId,
      userId: tourRequest.userId,
      status: tourRequest.status,
      hasPriceOffers: tourRequest.priceOffers?.length || 0,
      initialBudget: tourRequest.initialBudget
    });

    // Allow accepting from pending or negotiating status
    if (tourRequest.status !== 'negotiating' && tourRequest.status !== 'pending') {
      console.warn('[guideAcceptDeal] Invalid status for acceptance:', tourRequest.status);
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
      } else if (tourRequest.initialBudget?.amount && tourRequest.initialBudget.amount > 0) {
        amountToAccept = tourRequest.initialBudget.amount;
        console.log('[guideAcceptDeal] Using initial budget:', amountToAccept);
      } else {
        // Allow accepting with 0 price - price can be negotiated later
        amountToAccept = 0;
        console.log('[guideAcceptDeal] No price information found, accepting with amount 0');
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

// Get guide profile by ID (public - for viewing)
const getGuideProfileById = async (req, res) => {
  try {
    const { guideId } = req.params;
    
    const guide = await Guide.findById(guideId)
      .select('-userId -__v'); // Hide sensitive fields
    
    if (!guide) {
      return res.status(404).json({ 
        success: false,
        message: "Guide not found" 
      });
    }
    
    res.json({ 
      success: true,
      guide
    });
  } catch (error) {
    console.error("getGuideProfileById error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "Error fetching guide profile" 
    });
  }
};

// Mark guide tour as completed
const completeGuideTour = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id || req.user?.id;
    const { tourId } = req.params;

    console.log('[completeGuideTour] Starting completion for tour:', tourId, 'by user:', userId);

    // Find guide
    const guide = await Guide.findOne({ userId });
    if (!guide) {
      console.log('[completeGuideTour] Guide not found for userId:', userId);
      return res.status(404).json({ success: false, message: 'Guide not found' });
    }

    // Find the guide tour
    const guideTour = await GuideTour.findOne({ _id: tourId, guideId: guide._id });
    if (!guideTour) {
      console.log('[completeGuideTour] Guide tour not found:', tourId, 'for guide:', guide._id);
      return res.status(404).json({ success: false, message: 'Tour not found' });
    }

    // Check if already completed
    if (guideTour.status === 'completed') {
      console.log('[completeGuideTour] Tour already completed');
      return res.json({ success: true, message: 'Tour already completed', tour: guideTour });
    }

    // Update guide tour status
    guideTour.status = 'completed';
    guideTour.completedAt = new Date();
    await guideTour.save();

    console.log('[completeGuideTour] Guide tour marked as completed');

    // Update related Booking status if exists
    let booking = null;
    if (guideTour.bookingId) {
      try {
        const Booking = require("../../models/Bookings");
        booking = await Booking.findByIdAndUpdate(guideTour.bookingId, { 
          status: 'completed', 
          completedAt: new Date() 
        }, { new: true });
        console.log('[completeGuideTour] Related booking updated to completed');
      } catch (bkErr) {
        console.warn('[completeGuideTour] Could not update Booking status:', bkErr.message);
      }
    }

    // 🔔 Emit socket event for real-time update
    try {
      const io = global.io;
      if (io) {
        // Notify guide about tour completion
        io.to(`user-${userId}`).emit('tourMarkedDone', {
          bookingId: booking?._id || guideTour.bookingId,
          tourTitle: guideTour.tourName || 'Tour',
          message: 'Tour đã được đánh dấu hoàn thành'
        });
        console.log('[completeGuideTour] 🔔 Emitted tourMarkedDone to guide');
        
        // Notify traveller about tour completion
        if (guideTour.customerId) {
          io.to(`user-${guideTour.customerId}`).emit('tourCompleted', {
            bookingId: booking?._id || guideTour.bookingId,
            tourTitle: guideTour.tourName || 'Tour',
            message: 'Tour đã hoàn thành'
          });
          console.log('[completeGuideTour] 🔔 Emitted tourCompleted to traveller');
        }
      }
    } catch (socketErr) {
      console.warn('[completeGuideTour] ⚠️ Socket emit failed:', socketErr);
    }

    // Create notification for traveller
    try {
      const Notification = require("../../models/Notification");
      await Notification.create({
        userId: guideTour.customerId,
        type: 'tour_completed',
        title: 'Tour đã hoàn thành',
        message: `Hướng dẫn viên ${guide.name} đã đánh dấu tour "${guideTour.tourName}" là hoàn thành. Vui lòng đánh giá trải nghiệm của bạn!`,
        relatedId: guideTour._id,
        relatedModel: 'GuideTour'
      });
      console.log('[completeGuideTour] Notification created for traveller');
    } catch (notifErr) {
      console.error('[completeGuideTour] Notification error:', notifErr);
    }

    res.json({ 
      success: true, 
      message: 'Tour marked as completed successfully', 
      tour: guideTour,
      bookingId: booking?._id || guideTour.bookingId
    });

  } catch (error) {
    console.error('[completeGuideTour] Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Mark regular tour booking as completed
const completeRegularTour = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id || req.user?.id;
    const { bookingId } = req.params;

    console.log('[completeRegularTour] Starting completion for booking:', bookingId, 'by user:', userId);

    // Find guide
    const guide = await Guide.findOne({ userId });
    if (!guide) {
      console.log('[completeRegularTour] Guide not found for userId:', userId);
      return res.status(404).json({ success: false, message: 'Guide not found' });
    }

    // Find the booking
    const booking = await Booking.findOne({ _id: bookingId, guideId: guide._id });
    if (!booking) {
      console.log('[completeRegularTour] Booking not found or not assigned to guide:', bookingId, 'guide:', guide._id);
      return res.status(404).json({ success: false, message: 'Booking not found or not assigned to you' });
    }

    // Check if already completed
    if (booking.status === 'completed') {
      console.log('[completeRegularTour] Booking already completed');
      return res.json({ success: true, message: 'Booking already completed', booking });
    }

    // Check if booking is paid
    if (booking.status !== 'paid') {
      return res.status(400).json({ success: false, message: 'Booking must be paid before completion' });
    }

    // Update booking status
    booking.status = 'completed';
    booking.tourCompletedAt = new Date();
    await booking.save();

    console.log('[completeRegularTour] Booking marked as completed');

    // Release guide availability
    try {
      const GuideAvailability = require("../../models/guide/GuideAvailability");
      await GuideAvailability.releaseGuideLock(bookingId, 'completed');
      console.log('[completeRegularTour] Guide availability released');
    } catch (availError) {
      console.warn('[completeRegularTour] Could not release guide availability:', availError.message);
    }

    // Check if guide has other active bookings
    try {
      const GuideAvailability = require("../../models/guide/GuideAvailability");
      const activeBookingsCount = await GuideAvailability.countDocuments({
        guideId: guide._id,
        status: 'active'
      });

      if (activeBookingsCount === 0) {
        guide.availability = 'Available';
        await guide.save();
        console.log('[completeRegularTour] Guide set to Available');
      }
    } catch (guideUpdateError) {
      console.warn('[completeRegularTour] Could not update guide availability:', guideUpdateError.message);
    }

    // Create notification for traveller
    try {
      const Notification = require("../../models/Notification");
      await Notification.create({
        userId: booking.userId,
        type: 'tour_completed',
        title: 'Tour đã hoàn thành',
        message: `Hướng dẫn viên ${guide.name} đã đánh dấu tour "${booking.items[0]?.name || 'Tour'}" là hoàn thành. Vui lòng đánh giá trải nghiệm của bạn!`,
        relatedId: booking._id,
        relatedModel: 'Booking'
      });
      console.log('[completeRegularTour] Notification created for traveller');
    } catch (notifErr) {
      console.error('[completeRegularTour] Notification error:', notifErr);
    }

    res.json({ 
      success: true, 
      message: 'Tour marked as completed successfully', 
      booking 
    });

  } catch (error) {
    console.error('[completeRegularTour] Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = {
  getAvailableGuides,
  getGuideProfile,
  getGuideProfileById,
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
  getGuideAgreementStatus,
  completeGuideTour,
  completeRegularTour
};