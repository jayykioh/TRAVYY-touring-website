/**
 * POST /api/itinerary/:id/request-tour-guide
 * Send a request to a tour guide for a custom tour itinerary
 * Only allowed if itinerary has at least one tour (isCustomTour)
 */

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

    // If any item is a tour, mark as custom tour (do NOT auto request)
    const hasTour = itinerary.items.some((item) => item.itemType === 'tour');
    itinerary.isCustomTour = hasTour;
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
    console.log('[Itinerary ADD ITEM]', {
      itineraryId: itinerary._id.toString(),
      isCustomTour: itinerary.isCustomTour,
      tourGuideRequest: itinerary.tourGuideRequest,
      totalItems: itinerary.items.length,
      poiCount,
      tourCount,
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
    // TODO: Send notification to tour guide system here if needed
    res.json({ success: true, itinerary, message: 'Tour guide request sent' });
  } catch (error) {
    console.error('Error sending tour guide request:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});


module.exports = router;
