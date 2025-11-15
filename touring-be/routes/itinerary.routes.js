
const express = require("express");
const router = express.Router();
const Itinerary = require("../models/Itinerary");
const { verifyToken } = require("../middlewares/authJwt");
const authJwt = require("../middlewares/authJwt");
const { tripV2 } = require("../services/ai/libs/goong");
const { generateAIInsightsAsync } = require("../services/itinerary/optimizer");
const polyline = require('polyline');
const { buildGpx } = require('../utils/gpx');
const logger = require('../utils/logger');

/* ==================== HELPERS ==================== */

function getUserId(user) {
  return user?.sub || user?._id || user?.id;
}

function getZoneTimeWindow(bestTime = "anytime") {
  const MAP = {
    morning:  { start: "07:30", end: "11:30" },
    afternoon:{ start: "13:30", end: "17:30" },
    evening:  { start: "16:30", end: "20:30" },
    night:    { start: "18:30", end: "22:30" },
    sunset:   { start: "16:30", end: "19:00" },
    anytime:  { start: "09:00", end: "18:00" },
  };
  return MAP[bestTime] || MAP.anytime;
}

function toMin(hhmm) {
  const [h, m] = (hhmm || "0:0").split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function fromMin(min) {
  const h = Math.floor(min / 60), m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function estimateDurationByCategory(item, pace = "moderate") {
  if (typeof item?.duration === "number" && item.duration > 0) return item.duration;
  const pidx = { light: 0, moderate: 1, medium: 1, intense: 2 }[pace] ?? 1;
  const base = {
    landmark: [25, 20, 15],
    museum:   [75, 60, 45],
    temple:   [60, 45, 30],
    beach:    [120, 90, 60],
    nature:   [120, 90, 60],
    cafe:     [45, 35, 25],
    market:   [75, 60, 45],
    activity: [120, 90, 60],
    default:  [60, 45, 30],
  };
  const key = String(item?.category || "default").toLowerCase();
  return (base[key] || base.default)[pidx];
}

function timeSlotFromMinute(min) {
  if (min < toMin("12:00")) return "morning";
  if (min < toMin("17:00")) return "afternoon";
  if (min < toMin("21:00")) return "evening";
  return "night";
}

/**
 * Update itinerary's custom tour flag and reset tour guide request if needed
 */
function updateCustomTourFlag(itinerary) {
  const hasTour = itinerary.items.some((item) => item.itemType === 'tour');
  itinerary.isCustomTour = hasTour;
  
  // Reset tour guide request if no tours present
  if (!hasTour) {
    itinerary.tourGuideRequest = {
      status: 'none',
      guideId: null,
      requestedAt: null,
      respondedAt: null,
    };
  }
  
  return hasTour;
}

/* ==================== ROUTES ==================== */

/**
 * GET /api/itinerary
 * Get all itineraries for current user
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const itineraries = await Itinerary.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);
    return res.sendSuccess({ itineraries });
  } catch (error) {
    logger.error("Error fetching itineraries:", error);
    return res.sendError('FETCH_ITINERARIES_FAILED', error.message, 500);
  }
});

/**
 * POST /api/itinerary
 * Create new itinerary or get existing draft
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { zoneId, zoneName, preferences } = req.body;
    const userId = getUserId(req.user);

    let itinerary = await Itinerary.findOne({ userId, zoneId, status: "draft" });
    if (itinerary) {
      return res.sendSuccess({ itinerary, message: "Using existing draft" });
    }

    itinerary = new Itinerary({
      userId,
      zoneId,
      name: zoneName,
      zoneName,
      preferences: preferences || {},
      items: [],
      status: "draft",
    });
    await itinerary.save();

    return res.sendSuccess({ itinerary });
  } catch (error) {
    logger.error("Error creating itinerary:", error);
    return res.sendError('CREATE_ITINERARY_FAILED', error.message, 500);
  }
});

/**
 * GET /api/itinerary/:id
 * Get single itinerary by ID
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      userId
    });

    if (!itinerary) {
      return res.sendError('ITINERARY_NOT_FOUND', 'Itinerary not found', 404);
    }

    // Ensure custom tour flag is correct
    updateCustomTourFlag(itinerary);
    
    // Ensure tour request state is valid
    if (itinerary.isCustomTour && (!itinerary.tourGuideRequest || !['pending','accepted'].includes(itinerary.tourGuideRequest.status))) {
      itinerary.tourGuideRequest = resetTourGuideRequest();
      await itinerary.save();
    }

    return res.sendSuccess({ itinerary });
  } catch (error) {
    logger.error('❌ [GET] Error:', error.message);
    return res.sendError('FETCH_ITINERARY_FAILED', error.message, 500);
  }
});

/**
 * POST /api/itinerary/:id/items
 * Add POI/tour to itinerary
 */
router.post("/:id/items", verifyToken, async (req, res) => {
  try {
    const { poi } = req.body;
    const userId = getUserId(req.user);

    const itinerary = await Itinerary.findOne({ _id: req.params.id, userId });
    if (!itinerary) return res.sendError('ITINERARY_NOT_FOUND', 'Itinerary not found', 404);

    // Determine if item is tour or POI
    const isTour = poi.itemType === 'tour' || !!poi.tourId;
    const poiId = isTour ? (poi.tourId || poi.id || poi.poiId) : (poi.place_id || poi.id || poi.poiId);
    
    if (!poiId) return res.status(400).json({ success: false, error: "POI/tour must have id" });

    // Check for duplicates
    if (itinerary.items.some((item) => item.poiId === poiId)) {
      return res.sendError('DUPLICATE_ITEM', 'Item already in itinerary', 400);
    }

    // Extract location
    const location = {
      lat: poi.geometry?.location?.lat || poi.lat || poi.location?.lat || 0,
      lng: poi.geometry?.location?.lng || poi.lng || poi.location?.lng || 0,
    };

    const address = poi.address || poi.vicinity || poi.formatted_address || "Địa chỉ không xác định";
    const photos = Array.isArray(poi.photos)
      ? poi.photos.map((p) => (typeof p === "string" ? p : (p.photo_reference || p.url || ""))).filter(Boolean).slice(0, 5)
      : [];

    // Build item object
    let newItem = {
      poiId,
      name: poi.name || "Unknown Place",
      address,
      location,
      types: Array.isArray(poi.types) ? poi.types : [],
      rating: typeof poi.rating === "number" ? poi.rating : 0,
      photos,
      itemType: isTour ? 'tour' : 'poi',
    };

    // Add tour info if applicable
    if (isTour) {
      newItem.tourInfo = {
        tourId: poi.tourId || poi.id,
        agency: poi.agency || null,
        basePrice: poi.basePrice,
        currency: poi.currency,
        itinerary: poi.itinerary,
      };
    }

    if (!location.lat || !location.lng) {
      logger.warn("⚠️ Item missing location coordinates:", newItem.name);
    }

    // Add to itinerary
    itinerary.items.push(newItem);

    // Mark as custom tour if it has ANY items (POIs or tours)
    // This allows users to request guides for POI-only itineraries
    itinerary.isCustomTour = itinerary.items.length > 0;
    
    // luôn reset trạng thái về 'none' cho rõ ràng
    itinerary.tourGuideRequest = {
      status: 'none',
      guideId: null,
      requestedAt: null,
      respondedAt: null,
    };

    // Logging for debug
    const poiCount = itinerary.items.filter(i => i.itemType === 'poi').length;
    const tourCount = itinerary.items.filter(i => i.itemType === 'tour').length;
    const hasTour = tourCount > 0;
    logger.info('[Itinerary ADD ITEM]', {
      itineraryId: itinerary._id,
      item: newItem.name,
      isCustomTour: itinerary.isCustomTour,
      totalItems: itinerary.items.length,
      poiCount,
      tourCount,
      hasTour,
      items: itinerary.items.map(i => ({ name: i.name, type: i.itemType }))
    });

    // Warn if too many POIs with a tour
    if (hasTour && poiCount > 3) {
      logger.warn('[Itinerary WARNING] Too many POIs with a tour:', { itineraryId: itinerary._id.toString(), poiCount });
    }

    itinerary.isOptimized = false;
    await itinerary.save();

    return res.sendSuccess({ itinerary });
  } catch (error) {
    logger.error("❌ Error adding POI:", error);
    return res.sendError('ADD_POI_FAILED', error.message, 500);
  }
});

/**
 * DELETE /api/itinerary/:id/items/:poiId
 * Remove POI from itinerary
 */
router.delete("/:id/items/:poiId", verifyToken, async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const itinerary = await Itinerary.findOne({ _id: req.params.id, userId });
    if (!itinerary) return res.status(404).json({ success: false, error: "Itinerary not found" });

    itinerary.items = itinerary.items.filter((item) => item.poiId !== req.params.poiId);
    updateCustomTourFlag(itinerary);
    itinerary.isOptimized = false;
    
    // Recompute custom-tour flags after removal
    const hasItems = itinerary.items.length > 0;
    itinerary.isCustomTour = hasItems;
    
    // Reset tour guide request if no items left
    if (!hasItems) {
      itinerary.tourGuideRequest = {
        status: 'none',
        guideId: null,
        requestedAt: null,
        respondedAt: null,
      };
    }
    
    await itinerary.save();

    return res.sendSuccess({ itinerary });
  } catch (error) {
    logger.error("Error removing POI:", error);
    return res.sendError('REMOVE_POI_FAILED', error.message, 500);
  }
});

/**
 * PATCH /api/itinerary/:id/items/reorder
 * Reorder POIs in itinerary
 */
router.patch("/:id/items/reorder", verifyToken, async (req, res) => {
  try {
    const { order } = req.body;
    const userId = getUserId(req.user);
    
    if (!Array.isArray(order) || order.length === 0) {
      return res.status(400).json({ success: false, error: "Order must be a non-empty array" });
    }

    const itinerary = await Itinerary.findOne({ _id: req.params.id, userId });
    if (!itinerary) return res.status(404).json({ success: false, error: "Itinerary not found" });

    const itemMap = new Map(itinerary.items.map((item) => [item.poiId, item]));
    const reorderedItems = order.map((poiId) => itemMap.get(poiId)).filter(Boolean);

    itinerary.items = reorderedItems;
    itinerary.isOptimized = false;
    itinerary.updatedAt = Date.now();
    await itinerary.save();

    return res.sendSuccess({ itinerary });
  } catch (error) {
    logger.error("Error reordering items:", error);
    return res.sendError('REORDER_FAILED', error.message, 500);
  }
});

/**
 * POST /api/itinerary/:id/optimize-ai
 * Optimize route using Goong Trip V2 + AI insights (async)
 */
router.post('/:id/optimize-ai', verifyToken, async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      userId
    });

    if (!itinerary) {
      return res.status(404).json({ success: false, error: 'Itinerary not found' });
    }

    // Extract coordinates from items
    const items = itinerary.items.filter(
      i => i.location?.lat && i.location?.lng
    );

    if (items.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Need at least 2 locations with valid coordinates'
      });
    }

    const points = items.map(i => [i.location.lng, i.location.lat]);

    logger.info('📍 Calling Trip V2 with', points.length, 'points');

    // Call Goong Trip V2
    const tripData = await tripV2(points, { vehicle: 'car', roundtrip: false });
    const trip = tripData.trips[0];

    if (!trip) {
      return res.status(500).json({
        success: false,
        error: 'Failed to get route from Goong API'
      });
    }

    logger.debug('✅ Trip data received:', {
      distance: `${(trip.distance / 1000).toFixed(2)} km`,
      duration: `${Math.round(trip.duration / 60)} min`,
    });

    // Save route data
    itinerary.routePolyline = trip.geometry;
    itinerary.totalDistance = Math.round((trip.distance / 1000) * 100) / 100;
    itinerary.totalDuration = Math.round(trip.duration / 60);

    // Build timeline
    const zoneBestTime = itinerary.preferences?.bestTime || 'anytime';
    const { start, end } = getZoneTimeWindow(zoneBestTime);
    let currentTime = toMin(start);

    items.forEach((item, idx) => {
      const leg = trip.legs?.[idx - 1];
      const travelMin = leg ? Math.round(leg.duration / 60) : 0;
      const stayMin = estimateDurationByCategory(item, itinerary.preferences?.pace);

      if (idx > 0) currentTime += travelMin;

      item.startTime = fromMin(currentTime);
      item.endTime = fromMin(currentTime + stayMin);
      item.duration = stayMin;
      item.timeSlot = timeSlotFromMinute(currentTime);

      if (leg) {
        item.travelFromPrevious = {
          distance: Math.round((leg.distance / 1000) * 100) / 100,
          duration: travelMin,
          mode: travelMin < 5 ? 'walking' : 'driving'
        };
      }

      currentTime += stayMin;
    });

    itinerary.items = items;
    itinerary.isOptimized = true;
    itinerary.optimizedAt = new Date();
    itinerary.aiInsights = {
      summary: '⏳ Đang phân tích với AI...',
      tips: ['⏳ Đang tải gợi ý...']
    };
    itinerary.aiProcessing = true;

    await itinerary.save();

    logger.info('💾 [optimize-ai] Route saved, AI processing in background...');

    // Return immediately
    res.sendSuccess({ itinerary, message: 'Route optimized. AI insights are being generated...' });

    // Generate AI insights in background
    generateAIInsightsAsync(itinerary._id, itinerary.toObject(), tripData).catch(err => {
      logger.error('❌ [Background AI] Error:', err.message);
    });

  } catch (error) {
    logger.error('❌ [optimize-ai] Error:', error.message);
    return res.sendError('OPTIMIZE_AI_FAILED', error.message, 500);
  }
});

/**
 * POST /api/itinerary/:id/request-tour-guide
 * Request tour guide for custom tour
 */
router.post('/:id/request-tour-guide', verifyToken, async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      userId
    });

    if (!itinerary) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }

    // Ensure isCustomTour is always correct (has ANY items - POIs or tours)
    const hasItems = itinerary.items && itinerary.items.length > 0;
    if (itinerary.isCustomTour !== hasItems) {
      itinerary.isCustomTour = hasItems;
      await itinerary.save();
    }

    // If isCustomTour but status is not 'pending' or 'accepted', always set to 'none'
    if (itinerary.isCustomTour && (!itinerary.tourGuideRequest || !['pending','accepted'].includes(itinerary.tourGuideRequest.status))) {
      itinerary.tourGuideRequest = {
        status: 'none',
        guideId: null,
        requestedAt: null,
        respondedAt: null,
      };
      await itinerary.save();
    }

    // Log full itinerary for debugging and tour guide integration
    logger.debug('\n📤 [GET /api/itinerary/:id] FULL RESPONSE:', JSON.stringify(itinerary, null, 2));
    return res.sendSuccess({ itinerary });
  } catch (error) {
    logger.error('[GuideAPI] Error fetching requests:', error);
    return res.sendError('GUIDE_REQUESTS_FETCH_FAILED', error.message, 500);
  }
});

/**
 * GET /api/itinerary/:id/export.gpx
 * Export itinerary as GPX file
 */
router.get('/:id/export.gpx', verifyToken, async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const it = await Itinerary.findOne({ _id: req.params.id, userId }).lean();

    if (!it) {
      return res.sendError('ITINERARY_NOT_FOUND', 'Not found', 404);
    }

    // Extract track points
    let trackPoints = [];
    if (it.routePolyline) {
      trackPoints = polyline.decode(it.routePolyline);
    } else if (it.trip?.polyline) {
      trackPoints = polyline.decode(it.trip.polyline);
    } else if (Array.isArray(it.trip?.coordinates)) {
      trackPoints = it.trip.coordinates;
    } else {
      trackPoints = (it.items || [])
        .filter(i => i?.location?.lat && i?.location?.lng)
        .map(i => [i.location.lat, i.location.lng]);
    }

    if (trackPoints.length < 2) {
      return res.sendError('NO_ROUTE_TO_EXPORT', 'No route to export', 400);
    }

    // Extract waypoints
    const waypoints = (it.items || [])
      .map(i => ({
        lat: i?.location?.lat,
        lng: i?.location?.lng,
        name: i?.name,
        desc: i?.address || i?.aiNotes || ''
      }))
      .filter(w => Number.isFinite(w.lat) && Number.isFinite(w.lng));

    // Build GPX
    const name = it.name || it.zoneName || 'Itinerary';
    const gpx = buildGpx({ name, trackPoints, waypoints });

    res.setHeader('Content-Type', 'application/gpx+xml; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${name}.gpx"`);

    return res.send(gpx);
  } catch (err) {
    logger.error('Export GPX error:', err);
    return res.sendError('GPX_EXPORT_FAILED', 'Export failed', 500);
  }
});

router.get('/guide/requests', authJwt, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'TourGuide') {
      return res.status(403).json({ success: false, error: 'Permission denied: Only TourGuide can access.' });
    }
    
    const guideUserId = getUserId(req.user);
    
    // ✅ FIXED: Only show requests directly assigned to this guide
    const requests = await Itinerary.find({
      isCustomTour: true,
      'tourGuideRequest.status': 'pending',
      'tourGuideRequest.guideId': guideUserId // ⬅️ Filter by guide ID
    })
      .sort({ 'tourGuideRequest.requestedAt': -1 })
      .populate({ path: 'userId', select: 'name email phone avatar' });
    
    logger.info(`[GuideAPI] Found ${requests.length} pending requests for guide ${guideUserId}`);
    return res.sendSuccess({ requests });
  } catch (error) {
    logger.error('[GuideAPI] Error fetching requests:', error);
    return res.sendError('GUIDE_REQUESTS_FETCH_FAILED', error.message, 500);
  }
});

// Get all accepted tours for this guide
router.get('/guide/accepted-tours', authJwt, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'TourGuide') {
      return res.status(403).json({ success: false, error: 'Permission denied: Only TourGuide can access.' });
    }
    
    const guideUserId = getUserId(req.user);
    
    // Find all tours where this guide has accepted
    const tours = await Itinerary.find({
      isCustomTour: true,
      'tourGuideRequest.status': 'accepted',
      'tourGuideRequest.guideId': guideUserId
    })
      .sort({ 'preferredDate': 1, 'tourGuideRequest.respondedAt': -1 })
      .populate({ path: 'userId', select: 'name email phone avatar' });

    logger.info('[GuideAPI] Found', tours.length, 'accepted tours for guide:', guideUserId);

    // Fetch agreement data from TourCustomRequest for each tour
    const TourCustomRequest = require('../models/TourCustomRequest');
    const toursWithAgreement = await Promise.all(
      tours.map(async (tour) => {
        const tourObj = tour.toObject();
        try {
          // Find the corresponding TourCustomRequest
          const tourRequest = await TourCustomRequest.findOne({
            itineraryId: tour._id
          }).select('agreement status');
          
          if (tourRequest) {
            tourObj.agreement = tourRequest.agreement || {};
            tourObj.tourRequestStatus = tourRequest.status;
            tourObj.bothAgreed = tourRequest.agreement?.userAgreed && tourRequest.agreement?.guideAgreed;
            logger.debug('[GuideAPI] Tour', tour._id, 'agreement:', {
              bothAgreed: tourObj.bothAgreed,
              userAgreed: tourRequest.agreement?.userAgreed,
              guideAgreed: tourRequest.agreement?.guideAgreed
            });
          } else {
            tourObj.agreement = {};
            tourObj.bothAgreed = false;
            logger.debug('[GuideAPI] Tour', tour._id, 'has no TourCustomRequest');
          }
        } catch (err) {
          logger.error('[GuideAPI] Error fetching agreement for tour:', tour._id, err);
          tourObj.agreement = {};
          tourObj.bothAgreed = false;
        }
        return tourObj;
      })
    );
    
    logger.info('[GuideAPI] Returning', toursWithAgreement.length, 'tours with agreement data');
    return res.sendSuccess({ tours: toursWithAgreement });
  } catch (error) {
    logger.error('[GuideAPI] Error fetching accepted tours:', error);
    return res.sendError('GUIDE_ACCEPTED_TOURS_FETCH_FAILED', error.message, 500);
  }
});

// Get specific tour detail for guide (can view tours they've accepted)
router.get('/guide/tours/:id', authJwt, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'TourGuide') {
      return res.status(403).json({ success: false, error: 'Permission denied: Only TourGuide can access.' });
    }
    
    const guideUserId = getUserId(req.user);
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      isCustomTour: true,
      'tourGuideRequest.guideId': guideUserId
    }).populate({ path: 'userId', select: 'name email phone avatar' });
    
    if (!itinerary) {
      return res.status(404).json({ success: false, error: 'Tour not found or you do not have access' });
    }

    // Include customer info for the guide
    const responseData = itinerary.toObject();
    if (itinerary.userId) {
      responseData.customerInfo = {
        name: itinerary.userId.name,
        email: itinerary.userId.email,
        phone: itinerary.userId.phone,
        avatar: itinerary.userId.avatar
      };
    }

    // Fetch agreement data from TourCustomRequest
    try {
      const TourCustomRequest = require('../models/TourCustomRequest');
      const tourRequest = await TourCustomRequest.findOne({
        itineraryId: itinerary._id
      }).select('agreement status');
      
      if (tourRequest) {
        responseData.agreement = tourRequest.agreement || {};
        responseData.tourRequestStatus = tourRequest.status;
        responseData.bothAgreed = tourRequest.agreement?.userAgreed && tourRequest.agreement?.guideAgreed;
      } else {
        responseData.agreement = {};
        responseData.bothAgreed = false;
      }
    } catch (err) {
      logger.error('[GuideAPI] Error fetching agreement for tour:', itinerary._id, err);
      responseData.agreement = {};
      responseData.bothAgreed = false;
    }
    
    logger.info('[GuideAPI] Tour detail for guide:', responseData._id, 'bothAgreed:', responseData.bothAgreed);
    return res.sendSuccess(responseData);
  } catch (error) {
    logger.error('[GuideAPI] Error fetching tour detail:', error);
    return res.sendError('GUIDE_TOUR_DETAIL_FETCH_FAILED', error.message, 500);
  }
});

// Get specific request detail for guide (pending requests)
router.get('/guide/requests/:id', authJwt, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'TourGuide') {
      return res.status(403).json({ success: false, error: 'Permission denied: Only TourGuide can access.' });
    }
    
    const guideUserId = getUserId(req.user);
    
    // ✅ FIXED: Only allow guide to view requests assigned to them
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      isCustomTour: true,
      'tourGuideRequest.status': 'pending',
      'tourGuideRequest.guideId': guideUserId // ⬅️ Must be assigned to this guide
    }).populate({ path: 'userId', select: 'name email phone avatar' });
    
    if (!itinerary) {
      return res.status(404).json({ success: false, error: 'Request not found or you do not have access to this request' });
    }

    // Include customer info for the guide
    const responseData = itinerary.toObject();
    if (itinerary.userId) {
      responseData.customerInfo = {
        name: itinerary.userId.name,
        email: itinerary.userId.email,
        phone: itinerary.userId.phone,
        avatar: itinerary.userId.avatar
      };
    }
    
    logger.info('[GuideAPI] Request detail for guide:', guideUserId, 'request:', responseData._id);
    return res.sendSuccess(responseData);
  } catch (error) {
    logger.error('[GuideAPI] Error fetching request detail:', error);
    return res.sendError('GUIDE_REQUEST_DETAIL_FETCH_FAILED', error.message, 500);
  }
});

// Guide accepts tour request
router.post('/:id/accept-tour-guide', authJwt, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'TourGuide') {
      return res.status(403).json({ success: false, error: 'Permission denied: Only TourGuide can accept.' });
    }
    
    const guideUserId = getUserId(req.user);
    const itinerary = await Itinerary.findById(req.params.id);
    
    if (!itinerary) {
      return res.status(404).json({ success: false, error: 'Itinerary not found' });
    }
    
    if (!itinerary.tourGuideRequest || itinerary.tourGuideRequest.status !== 'pending') {
      return res.sendError('NO_PENDING_REQUEST', 'No pending tour guide request found', 400);
    }
    
    // Update tour guide request status
    itinerary.tourGuideRequest.status = 'accepted';
    itinerary.tourGuideRequest.guideId = guideUserId;
    itinerary.tourGuideRequest.respondedAt = new Date();
    
    await itinerary.save();
    
    // Send notification to customer
    try {
      const Notification = require('../models/Notification');
      await Notification.create({
        userId: itinerary.userId,
        type: 'tour_guide_accepted',
        title: 'Hướng dẫn viên đã chấp nhận',
        message: `Yêu cầu tour "${itinerary.name}" của bạn đã được chấp nhận bởi hướng dẫn viên`,
        relatedId: itinerary._id,
        relatedModel: 'Itinerary'
      });
    } catch (notifError) {
      logger.error('Error creating notification:', notifError);
    }
    
    return res.sendSuccess({ itinerary, message: 'Tour request accepted' });
  } catch (error) {
    logger.error('Error accepting tour guide request:', error);
    return res.sendError('ACCEPT_REQUEST_FAILED', error.message, 500);
  }
});

// Guide rejects tour request
router.post('/:id/reject-tour-guide', authJwt, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'TourGuide') {
      return res.status(403).json({ success: false, error: 'Permission denied: Only TourGuide can reject.' });
    }
    
    const itinerary = await Itinerary.findById(req.params.id);
    
    if (!itinerary) {
      return res.status(404).json({ success: false, error: 'Itinerary not found' });
    }
    
    if (!itinerary.tourGuideRequest || itinerary.tourGuideRequest.status !== 'pending') {
      return res.sendError('NO_PENDING_REQUEST', 'No pending tour guide request found', 400);
    }
    
    // Update tour guide request status
    itinerary.tourGuideRequest.status = 'rejected';
    itinerary.tourGuideRequest.respondedAt = new Date();
    
    await itinerary.save();
    
    // Send notification to customer
    try {
      const Notification = require('../models/Notification');
      await Notification.create({
        userId: itinerary.userId,
        type: 'tour_guide_rejected',
        title: 'Yêu cầu tour bị từ chối',
        message: `Yêu cầu tour "${itinerary.name}" của bạn đã bị từ chối`,
        relatedId: itinerary._id,
        relatedModel: 'Itinerary'
      });
    } catch (notifError) {
      logger.error('Error creating notification:', notifError);
    }
    
    return res.sendSuccess({ message: 'Tour request rejected' });
  } catch (error) {
    logger.error('Error rejecting tour guide request:', error);
    return res.sendError('REJECT_REQUEST_FAILED', error.message, 500);
  }
});

// Create deposit payment for custom tour (after guide accepts)
router.post('/:id/create-deposit-payment', authJwt, async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const { provider } = req.body; // 'momo' or 'paypal'
    
    const itinerary = await Itinerary.findOne({ _id: req.params.id, userId });
    
    if (!itinerary) {
      return res.sendError('ITINERARY_NOT_FOUND', 'Itinerary not found', 404);
    }
    
    if (!itinerary.isCustomTour || itinerary.tourGuideRequest?.status !== 'accepted') {
      return res.status(400).json({ success: false, error: 'Tour guide must accept request before payment' });
    }
    
    if (itinerary.paymentInfo?.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Deposit already paid or invalid status' });
    }
    
    // Calculate deposit (30% of total cost)
    const depositAmount = Math.round(itinerary.estimatedCost * 0.3);
    
    // Initialize payment info if not exists
    if (!itinerary.paymentInfo) {
      itinerary.paymentInfo = {
        status: 'pending',
        depositAmount,
        totalAmount: itinerary.estimatedCost
      };
    }
    
    itinerary.paymentInfo.depositAmount = depositAmount;
    itinerary.paymentInfo.totalAmount = itinerary.estimatedCost;
    
    await itinerary.save();
    
    // Create payment with provider
    let paymentUrl;
    if (provider === 'momo') {
      const crypto = require('crypto');
      const axios = require('axios');
      
      const partnerCode = process.env.MOMO_PARTNER_CODE;
      const accessKey = process.env.MOMO_ACCESS_KEY;
      const secretKey = process.env.MOMO_SECRET_KEY;
      const redirectUrl = `${process.env.FRONTEND_URL}/itinerary/${itinerary._id}/payment-result`;
      const ipnUrl = `${process.env.BACKEND_URL}/api/payments/deposit/momo/callback`;
      const requestType = 'payWithMethod';
      const orderId = `DEPOSIT_${itinerary._id}_${Date.now()}`;
      const requestId = orderId;
      const orderInfo = `Đặt cọc tour: ${itinerary.name}`;
      const amount = depositAmount.toString();
      
      const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
      const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');
      
      const requestBody = {
        partnerCode,
        accessKey,
        requestId,
        amount,
        orderId,
        orderInfo,
        redirectUrl,
        ipnUrl,
        requestType,
        extraData: JSON.stringify({ itineraryId: itinerary._id.toString(), type: 'deposit' }),
        signature,
        lang: 'vi'
      };
      
      const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody);
      
      if (response.data.resultCode === 0) {
        paymentUrl = response.data.payUrl;
        itinerary.paymentInfo.depositOrderId = orderId;
        itinerary.paymentInfo.depositProvider = 'momo';
        await itinerary.save();
      } else {
        return res.status(400).json({ success: false, error: 'Failed to create MoMo payment' });
      }
    } else if (provider === 'paypal') {
      // TODO: Implement PayPal payment
      return res.status(400).json({ success: false, error: 'PayPal payment not implemented yet' });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid payment provider' });
    }
    
    return res.sendSuccess({ paymentUrl, depositAmount, orderId: itinerary.paymentInfo.depositOrderId });
  } catch (error) {
    logger.error('[Itinerary] Create deposit payment error:', error);
    return res.sendError('DEPOSIT_PAYMENT_FAILED', error.message, 500);
  }
});

// ✅ POST /api/itinerary/:id/request-tour-guide
// Simple broadcast request - sends to all guides
// For direct requests with specific guide selection, use POST /api/tour-requests/create
router.post('/:id/request-tour-guide', authJwt, async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const itinerary = await Itinerary.findOne({ _id: req.params.id, userId });
    
    if (!itinerary) {
      return res.sendError('ITINERARY_NOT_FOUND', 'Itinerary not found', 404);
    }
    
    // Check if itinerary has items
    if (!itinerary.items || itinerary.items.length === 0) {
      return res.sendError('NO_ITEMS', 'Itinerary has no items. Please add at least one location first.', 400);
    }
    
    // Auto-set isCustomTour if it has items but flag is false
    if (!itinerary.isCustomTour) {
      itinerary.isCustomTour = true;
      logger.info('[TourGuideRequest] Auto-enabled isCustomTour for itinerary:', itinerary._id);
    }
    
    // Only allow if not already requested or status is none/rejected
    if (itinerary.tourGuideRequest && ['pending','accepted'].includes(itinerary.tourGuideRequest.status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tour guide request already sent or accepted' 
      });
    }
    
    // ✅ CHECK: If there's already a TourCustomRequest, don't create duplicate
    const TourCustomRequest = require('../models/TourCustomRequest');
    const existingRequest = await TourCustomRequest.findOne({
      itineraryId: itinerary._id,
      userId,
      status: { $in: ['pending', 'negotiating', 'agreement_pending'] }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        error: 'You already have an active request for this itinerary',
        requestId: existingRequest._id
      });
    }
    
    // ✅ CREATE TourCustomRequest (broadcast - no specific guide)
    const User = require('../models/Users');
    const user = await User.findById(userId).select('name email phone');
    
    // Extract tour details from itinerary
    const tourDetails = {
      zoneName: itinerary.zoneName || itinerary.name,
      numberOfDays: itinerary.preferences?.durationDays || 1,
      numberOfGuests: itinerary.numberOfPeople || 1,
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

    // Create broadcast request (no specific guide - any guide can accept)
    const tourRequest = new TourCustomRequest({
      userId,
      itineraryId: itinerary._id,
      guideId: null, // ⬅️ NULL = broadcast to all guides
      isDirectRequest: false, // ⬅️ FALSE = open request
      tourDetails,
      initialBudget: {
        amount: itinerary.estimatedCost || 0,
        currency: 'VND'
      },
      specialRequirements: '',
      contactInfo: {
        phone: user?.phone || '',
        email: user?.email || '',
        preferredContactMethod: 'app'
      },
      preferredDates: [],
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      itinerarySynced: true,
      itinerarySyncedAt: new Date()
    });

    await tourRequest.save();
    
    // Update itinerary
    const now = new Date();
    itinerary.tourGuideRequest = {
      status: 'pending',
      requestedAt: now,
      respondedAt: null,
      guideId: null
    };
    await itinerary.save();
    
    logger.info('[TourGuideRequest] Created TourCustomRequest (broadcast):', {
      requestId: tourRequest._id,
      requestNumber: tourRequest.requestNumber,
      itineraryId: itinerary._id.toString(),
      userId,
      zoneName: itinerary.zoneName
    });
    
    // ✅ Send notification to all active tour guides
    try {
      const GuideNotification = require('../models/guide/GuideNotification');
      const Guide = require('../models/guide/Guide');

      // Find all guide profiles
      const guides = await Guide.find({}).select('_id');
      
      logger.info(`[TourRequest] Found ${guides.length} guides to notify`);
      
      if (guides.length === 0) {
        logger.warn('[TourRequest] ⚠️ No guides found in database!');
      }
      
      // Create notification for each guide profile
      const notificationPromises = guides.map(guide => 
        GuideNotification.create({
          guideId: guide._id,
          notificationId: `guide-${guide._id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'new_request',
          title: 'Yêu cầu tour mới',
          message: `${user?.name || 'Khách hàng'} có yêu cầu tour tại ${itinerary.zoneName}`,
          tourId: tourRequest._id.toString(), // ⬅️ Link to TourCustomRequest
          priority: 'medium'
        })
      );
      
      await Promise.all(notificationPromises);
      logger.info(`[TourRequest] ✅ Sent ${guides.length} notifications successfully`);
    } catch (notifError) {
      logger.error('[TourRequest] ❌ Error creating guide notifications:', notifError);
    }
    
    return res.sendSuccess({ itinerary, tourRequest, message: 'Tour guide request sent to all available guides' });
  } catch (error) {
    logger.error('[TourGuideRequest] Error:', error);
    return res.sendError('TOUR_REQUEST_FAILED', error.message, 500);
  }
});

module.exports = router;
