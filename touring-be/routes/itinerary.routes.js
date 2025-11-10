
const express = require("express");
const router = express.Router();
const Itinerary = require("../models/Itinerary");
const authJwt = require("../middlewares/authJWT");
const { tripV2 } = require("../services/ai/libs/goong");
const { buildItineraryPrompt, callLLMAndParse, generateAIInsightsAsync } = require("../services/itinerary/optimizer");
const polyline = require('polyline');
const { buildGpx } = require('../utils/gpx');

/* ---------------- Helpers (time window & timeline utils) ---------------- */

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
function getUserId(user) {
  return user?.sub || user?._id || user?.id;
}

/* -------------------------------- Routes -------------------------------- */

router.get("/", authJwt, async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const itineraries = await Itinerary.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ success: true, itineraries });
  } catch (error) {
    console.error("Error fetching itineraries:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/itinerary
 * Create new itinerary or get existing draft
 */
router.post("/", authJwt, async (req, res) => {
  try {
    const { zoneId, zoneName, preferences } = req.body;
    const userId = getUserId(req.user);

    let itinerary = await Itinerary.findOne({ userId, zoneId, status: "draft" });
    if (itinerary) {
      return res.json({ success: true, itinerary, message: "Using existing draft" });
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

    res.json({ success: true, itinerary });
  } catch (error) {
    console.error("Error creating itinerary:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/itinerary/:id/items
 * Add POI to itinerary
 */
router.post("/:id/items", authJwt, async (req, res) => {
  try {
  const { poi } = req.body;
    const userId = getUserId(req.user);

    const itinerary = await Itinerary.findOne({ _id: req.params.id, userId });
    if (!itinerary) return res.status(404).json({ success: false, error: "Itinerary not found" });

    const isTour = poi.itemType === 'tour' || !!poi.tourId;
    const poiId = isTour ? (poi.tourId || poi.id || poi.poiId) : (poi.place_id || poi.id || poi.poiId);
    if (!poiId) return res.status(400).json({ success: false, error: "POI/tour must have id" });

    if (itinerary.items.some((item) => item.poiId === poiId)) {
      return res.status(400).json({ success: false, error: "Item already in itinerary" });
    }

    const location = {
      lat: poi.geometry?.location?.lat || poi.lat || poi.location?.lat || 0,
      lng: poi.geometry?.location?.lng || poi.lng || poi.location?.lng || 0,
    };
    const address =
      poi.address || poi.vicinity || poi.formatted_address || "Địa chỉ không xác định";
    const photos = Array.isArray(poi.photos)
      ? poi.photos.map((p) => (typeof p === "string" ? p : (p.photo_reference || p.url || ""))).filter(Boolean).slice(0, 5)
      : [];

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
    if (isTour) {
      newItem.tourInfo = {
        tourId: poi.tourId || poi.id,
        agency: poi.agency || null,
        basePrice: poi.basePrice,
        currency: poi.currency,
        itinerary: poi.itinerary,
        // ...add more tour fields as needed
      };
    }

    if (!location.lat || !location.lng) {
      console.warn("⚠️ Item missing location coordinates:", newItem.name);
    }

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
    console.log('[Itinerary ADD ITEM]', {
      itineraryId: itinerary._id.toString(),
      isCustomTour: itinerary.isCustomTour,
      tourGuideRequest: itinerary.tourGuideRequest,
      totalItems: itinerary.items.length,
      poiCount,
      tourCount,
      hasTour,
      items: itinerary.items.map(i => ({ name: i.name, type: i.itemType }))
    });

    // Warn if too many POIs with a tour
    if (hasTour && poiCount > 3) {
      console.warn('[Itinerary WARNING] Too many POIs with a tour:', { itineraryId: itinerary._id.toString(), poiCount });
    }

    itinerary.isOptimized = false;
    await itinerary.save();

    res.json({ success: true, itinerary });
  } catch (error) {
    console.error("❌ Error adding POI:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/itinerary/:id/items/:poiId
 * Remove POI from itinerary
 */
router.delete("/:id/items/:poiId", authJwt, async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const itinerary = await Itinerary.findOne({ _id: req.params.id, userId });
    if (!itinerary) return res.status(404).json({ success: false, error: "Itinerary not found" });

    itinerary.items = itinerary.items.filter((item) => item.poiId !== req.params.poiId);
    itinerary.isOptimized = false;
    // Recompute custom-tour flags after removal
    const hasTour = itinerary.items.some((i) => i.itemType === 'tour');
    itinerary.isCustomTour = hasTour;
    if (!hasTour) {
      itinerary.tourGuideRequest = {
        status: 'none',
        guideId: null,
        requestedAt: null,
        respondedAt: null,
      };
    }
    await itinerary.save();

    res.json({ success: true, itinerary });
  } catch (error) {
    console.error("Error removing POI:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/itinerary/:id/items/reorder
 * Reorder POIs in itinerary
 */
router.patch("/:id/items/reorder", authJwt, async (req, res) => {
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

    res.json({ success: true, itinerary });
  } catch (error) {
    console.error("Error reordering items:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/itinerary/:id/optimize-ai
 * Optimize route with Goong Trip V2 + AI insights (async)
 */
router.post('/:id/optimize-ai', authJwt, async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      userId
    });

    if (!itinerary) {
      return res.status(404).json({ success: false, error: 'Itinerary not found' });
    }

    // ========== STEP 1: Extract coordinates ==========
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

    console.log('📍 Calling Trip V2 with', points.length, 'points');

    // ========== STEP 2: Call Goong Trip V2 ==========
    const tripData = await tripV2(points, { vehicle: 'car', roundtrip: false });
    const trip = tripData.trips[0];

    if (!trip) {
      return res.status(500).json({
        success: false,
        error: 'Failed to get route from Goong API'
      });
    }

    console.log('✅ Trip data received:', {
      distance: `${(trip.distance / 1000).toFixed(2)} km`,
      duration: `${Math.round(trip.duration / 60)} min`,
      hasGeometry: !!trip.geometry,
      geometryLength: trip.geometry?.length
    });

    // ========== STEP 3: Save route data immediately ==========
    itinerary.routePolyline = trip.geometry;
    itinerary.totalDistance = Math.round((trip.distance / 1000) * 100) / 100;
    itinerary.totalDuration = Math.round(trip.duration / 60);

    // ========== STEP 4: Build timeline ==========
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

    // ✅ FIXED: Correct placeholder matching schema
    itinerary.aiInsights = {
      summary: '⏳ Đang phân tích với AI...',
      tips: ['⏳ Đang tải gợi ý...'] // ✅ FLAT array [String]
    };
    itinerary.aiProcessing = true;

    await itinerary.save();

    console.log('💾 [POST optimize-ai] Saved itinerary (without AI insights yet):', {
      id: itinerary._id,
      hasRoutePolyline: true,
      polylineLength: itinerary.routePolyline?.length,
      aiProcessing: true
    });

    // ✅ Return immediately
    res.json({ 
      success: true, 
      itinerary,
      message: 'Route optimized. AI insights are being generated...'
    });

    // ========== STEP 5: Generate AI insights in background ==========
    generateAIInsightsAsync(itinerary._id, itinerary.toObject(), tripData).catch(err => {
      console.error('❌ [Background AI] Unhandled error:', err);
    });

  } catch (error) {
    console.error('❌ [POST optimize-ai] Error:', {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 3)
    });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/itinerary/:id - Get single itinerary by ID
router.get('/:id', authJwt, async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      userId
    });

    if (!itinerary) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }

    // Ensure isCustomTour is always correct (has at least one tour)
    const hasTour = itinerary.items.some((item) => item.itemType === 'tour');
    if (itinerary.isCustomTour !== hasTour) {
      itinerary.isCustomTour = hasTour;
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
    console.log('\n📤 [GET /api/itinerary/:id] FULL RESPONSE:', JSON.stringify(itinerary, null, 2));

    res.json({
      success: true,
      itinerary
    });
  } catch (error) {
    console.error('❌ [GET] Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});




router.get('/:id/export.gpx', authJwt, async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const it = await Itinerary.findOne({ _id: req.params.id, userId }).lean();

    if (!it) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    // 1️⃣ Lấy track points
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
      return res.status(400).json({ success: false, message: 'No route geometry to export' });
    }

    // 2️⃣ Waypoints
    const waypoints = (it.items || [])
      .map(i => ({
        lat: i?.location?.lat,
        lng: i?.location?.lng,
        name: i?.name,
        desc: i?.address || i?.aiNotes || ''
      }))
      .filter(w => Number.isFinite(w.lat) && Number.isFinite(w.lng));

    // 3️⃣ Build GPX
    const name = it.name || it.zoneName || 'Itinerary';
    const gpx = buildGpx({ name, trackPoints, waypoints });

    // 4️⃣ Tạo tên file an toàn
    const { ascii, utf8Star } = safeFilename(name, 'route');
    res.setHeader('Content-Type', 'application/gpx+xml; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${ascii}.gpx"; filename*=UTF-8''${utf8Star}.gpx`
    );

    return res.send(gpx);
  } catch (err) {
    console.error('Export GPX error:', err);
    return res.status(500).json({ success: false, message: 'Export failed' });
  }
});

router.get('/guide/requests', authJwt, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'TourGuide') {
      return res.status(403).json({ success: false, error: 'Permission denied: Only TourGuide can access.' });
    }
    // Only show requests for custom tours (isCustomTour = true)
    const requests = await Itinerary.find({
      isCustomTour: true,
      'tourGuideRequest.status': 'pending'
    })
      .sort({ 'tourGuideRequest.requestedAt': -1 })
      .populate({ path: 'userId', select: 'name email phone avatar' });
    res.json({ success: true, requests });
  } catch (error) {
    console.error('[GuideAPI] Error fetching requests:', error);
    res.status(500).json({ success: false, error: error.message });
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
    
    res.json({ success: true, tours });
  } catch (error) {
    console.error('[GuideAPI] Error fetching accepted tours:', error);
    res.status(500).json({ success: false, error: error.message });
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
    
    console.log('[GuideAPI] Tour detail for guide:', responseData._id);
    res.json(responseData);
  } catch (error) {
    console.error('[GuideAPI] Error fetching tour detail:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get specific request detail for guide (pending requests)
router.get('/guide/requests/:id', authJwt, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'TourGuide') {
      return res.status(403).json({ success: false, error: 'Permission denied: Only TourGuide can access.' });
    }
    
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      isCustomTour: true,
      'tourGuideRequest.status': 'pending'
    }).populate({ path: 'userId', select: 'name email phone avatar' });
    
    if (!itinerary) {
      return res.status(404).json({ success: false, error: 'Request not found or no longer available' });
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
    
    console.log('[GuideAPI] Request detail for guide:', responseData._id);
    res.json(responseData);
  } catch (error) {
    console.error('[GuideAPI] Error fetching request detail:', error);
    res.status(500).json({ success: false, error: error.message });
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
      return res.status(400).json({ success: false, error: 'No pending tour guide request found' });
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
      console.error('Error creating notification:', notifError);
    }
    
    res.json({ success: true, message: 'Tour request accepted', itinerary });
  } catch (error) {
    console.error('Error accepting tour guide request:', error);
    res.status(500).json({ success: false, error: error.message });
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
      return res.status(400).json({ success: false, error: 'No pending tour guide request found' });
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
      console.error('Error creating notification:', notifError);
    }
    
    res.json({ success: true, message: 'Tour request rejected' });
  } catch (error) {
    console.error('Error rejecting tour guide request:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create deposit payment for custom tour (after guide accepts)
router.post('/:id/create-deposit-payment', authJwt, async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const { provider } = req.body; // 'momo' or 'paypal'
    
    const itinerary = await Itinerary.findOne({ _id: req.params.id, userId });
    
    if (!itinerary) {
      return res.status(404).json({ success: false, error: 'Itinerary not found' });
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
    
    res.json({ 
      success: true, 
      paymentUrl,
      depositAmount,
      orderId: itinerary.paymentInfo.depositOrderId
    });
  } catch (error) {
    console.error('[Itinerary] Create deposit payment error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/request-tour-guide', authJwt, async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const itinerary = await Itinerary.findOne({ _id: req.params.id, userId });
    if (!itinerary) return res.status(404).json({ success: false, error: 'Itinerary not found' });
    if (!itinerary.isCustomTour) {
      return res.status(400).json({ success: false, error: 'Itinerary is not a custom tour (no tour present)' });
    }
    // Only allow if not already requested or status is none/rejected
    if (itinerary.tourGuideRequest && ['pending','accepted'].includes(itinerary.tourGuideRequest.status)) {
      return res.status(400).json({ success: false, error: 'Tour guide request already sent or accepted' });
    }
    // Save request info
    const now = new Date();
    itinerary.tourGuideRequest = {
      status: 'pending',
      requestedAt: now,
      respondedAt: null,
      guideId: null
    };
    await itinerary.save();
    // Log full itinerary for tour guide integration
    console.log('[TourGuideRequest][BACKEND] Đã gửi yêu cầu tour guide:', {
      itineraryId: itinerary._id.toString(),
      userId,
      requestedAt: now,
      status: 'pending',
      name: itinerary.name,
      zoneName: itinerary.zoneName,
      items: itinerary.items.map(item => ({
        poiId: item.poiId,
        name: item.name,
        address: item.address,
        location: item.location,
        itemType: item.itemType,
        tourInfo: item.tourInfo || undefined
      })),
      preferences: itinerary.preferences,
    });
    
    // Send notification to all tour guides in the system about new request
    try {
      const GuideNotification = require('../models/guide/GuideNotification');
      const User = require('../models/Users');
      
      // Find all active tour guides
      const guides = await User.find({ role: 'TourGuide', isActive: true }).select('_id');
      
      // Create notification for each guide
      const notificationPromises = guides.map(guide => 
        GuideNotification.create({
          guideId: guide._id,
          notificationId: `guide-${guide._id}-${Date.now()}`,
          type: 'new_tour_request',
          title: 'Yêu cầu tour mới',
          message: `Có yêu cầu tour mới tại ${itinerary.zoneName}: ${itinerary.name}`,
          tourId: itinerary._id,
          priority: 'high'
        })
      );
      
      await Promise.all(notificationPromises);
      console.log(`[TourRequest] Sent notification to ${guides.length} guides`);
    } catch (notifError) {
      console.error('[TourRequest] Error creating guide notifications:', notifError);
    }
    
    res.json({ success: true, itinerary, message: 'Tour guide request sent' });
  } catch (error) {
    console.error('Error sending tour guide request:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
module.exports = router;
