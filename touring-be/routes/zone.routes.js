const express = require('express');
const router = express.Router();
const Tour = require("../models/agency/Tours");
require("../models/agency/Location");
require("../models/agency/TravelAgency");

const { findPOIsByCategory, loadPriorityPOIs } = require('../services/zones/poi-finder');
const { getPlaceDetails, autocompletePlaces } = require('../services/ai/libs/map4d');

let zoneService;
try {
  zoneService = require('../services/zones');
} catch (error) {
  console.error('❌ Failed to import zone service:', error.message);
  throw error;
}

/* ==================== ZONE DETAILS ==================== */

/**
 * GET /api/zones/:zoneId
 * Get zone details by ID
 */
router.get('/:zoneId', async (req, res) => {
  try {
    const { zoneId } = req.params;

    if (!zoneId || zoneId.length < 3) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Invalid zone ID' 
      });
    }
    const zone = await zoneService.getZoneById(zoneId);
    
    if (!zone) {
      return res.status(404).json({ 
        ok: false, 
        error: 'Zone not found' 
      });
    }
    
    res.json({ ok: true, zone });
    
  } catch (error) {
    console.error('❌ Error in GET /zones/:zoneId:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/* ==================== TOURS ==================== */

/**
 * GET /api/zones/:zoneId/tours
 * Get tours for a zone
 */
router.get('/:zoneId/tours', async (req, res) => {
  try {
    const { zoneId } = req.params;
    const { limit = 12 } = req.query;

    if (!zoneId) {
      return res.status(400).json({ ok: false, error: "Missing zoneId" });
    }
    
    const zone = await zoneService.getZoneById(zoneId);
    if (!zone || zone.isActive === false) {
      return res.status(404).json({ ok: false, error: "Zone not found" });
    }

    const tours = await Tour.find({
      isHidden: { $ne: true },
      zoneIds: zone._id,
    })
      .populate("agencyId", "name phone image address")
      .populate("locations", "name coordinates")
      .sort({ usageCount: -1, createdAt: -1 })
      .limit(parseInt(limit, 10) || 12)
      .lean();
    
    console.log(`[ZoneTours] Found ${tours.length} tours for ${zoneId}`);

    const data = tours.map(t => {
      const firstLoc = Array.isArray(t.locations) && t.locations[0] ? t.locations[0] : null;
      const lat = firstLoc?.coordinates?.lat ?? null;
      const lng = firstLoc?.coordinates?.lng ?? null;

      return {
        id: String(t._id),
        title: t.title,
        description: t.description,
        basePrice: t.basePrice,
        currency: t.currency || "VND",
        durationDays: t?.duration?.days ?? null,
        durationNights: t?.duration?.nights ?? null,
        schedule: t?.schedule || null,
        image: t?.imageItems?.[0]?.imageUrl || null,
        tags: Array.isArray(t.tags) ? t.tags : [],
        agency: t.agencyId
          ? { id: String(t.agencyId._id), name: t.agencyId.name, phone: t.agencyId.phone }
          : null,
        location: (typeof lat === "number" && typeof lng === "number") ? { lat, lng } : null,
        externalUrl: `/tours/${t._id}`,
      };
    });

    res.set({ "Cache-Control": "public, max-age=120" });
    return res.json({ ok: true, zoneId, total: data.length, tours: data });
  } catch (err) {
    console.error("❌ GET /api/zones/:zoneId/tours error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

/* ==================== POIs ==================== */

/**
 * GET /api/zones/:zoneId/pois
 * Get all POIs for a zone (with optional vibes filter)
 */
router.get('/:zoneId/pois', async (req, res) => {
  try {
    const { zoneId } = req.params;
    const { vibes, limit } = req.query;

    const zone = await zoneService.getZoneById(zoneId);
    
    if (!zone) {
      return res.status(404).json({ ok: false, error: 'Zone not found' });
    }

    const preferences = {
      vibes: vibes ? vibes.split(',') : [],
      limit: limit ? parseInt(limit) : 10
    };

    const pois = await zoneService.getZonePOIs(zoneId, preferences);

    res.json({
      ok: true,
      zoneId,
      zoneName: zone.name,
      pois
    });
  } catch (error) {
    console.error('❌ [Route] Error:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * GET /api/zones/:zoneId/pois/:category
 * Get POIs by specific category
 */
router.get('/:zoneId/pois/:category', async (req, res) => {
  try {
    const { zoneId, category } = req.params;
    const { limit = 7 } = req.query;

    const pois = await findPOIsByCategory(zoneId, category, {
      limit: parseInt(limit),
    });

    res.set({ 'Cache-Control': 'public, max-age=1800' });
    res.json({ ok: true, category, pois });

  } catch (error) {
    console.error('❌ Error in GET /zones/:zoneId/pois/:category:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * GET /api/zones/:zoneId/pois-priority
 * Get priority POIs (curated list, sorted by proximity if user location provided)
 */
router.get('/:zoneId/pois-priority', async (req, res) => {
  try {
    const { zoneId } = req.params;
    const { limit = 7, userLat, userLng } = req.query;
    
    const userLocation = (userLat && userLng) 
      ? { lat: parseFloat(userLat), lng: parseFloat(userLng) }
      : null;

    const poisByCategory = await loadPriorityPOIs(zoneId, {
      limit: parseInt(limit),
      userLocation,
    });

    res.set({ 'Cache-Control': 'public, max-age=1800' });
    res.json({ ok: true, data: poisByCategory });

  } catch (error) {
    console.error('❌ Error in GET /zones/:zoneId/pois-priority:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/* ==================== SEARCH & DETAILS ==================== */

/**
 * GET /api/zones/:zoneId/search
 * Autocomplete search within zone
 */
router.get('/:zoneId/search', async (req, res) => {
  try {
    const { zoneId } = req.params;
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({ ok: true, results: [] });
    }

    const zone = await zoneService.getZoneById(zoneId);
    if (!zone) {
      return res.status(404).json({ ok: false, error: 'Zone not found' });
    }

    const suggestions = await autocompletePlaces(
      q,
      zone.center.lat,
      zone.center.lng
    );

    res.json({ ok: true, results: suggestions });

  } catch (error) {
    console.error('❌ Error in GET /zones/:zoneId/search:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * GET /api/zones/poi/:placeId/details
 * Get POI details by place ID
 */
router.get('/poi/:placeId/details', async (req, res) => {
  try {
    const { placeId } = req.params;

    const details = await getPlaceDetails(placeId);

    if (!details) {
      return res.status(404).json({ ok: false, error: 'Place not found' });
    }

    res.set({ 'Cache-Control': 'public, max-age=3600' });
    res.json({ ok: true, place: details });

  } catch (error) {
    console.error('❌ Error in GET /poi/:placeId/details:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * GET /api/zones/province/:province
 * Get all zones in a province
 */
router.get('/province/:province', async (req, res) => {
  try {
    const { province } = req.params;
    
    const zones = await zoneService.getZonesByProvince(province);
    
    res.json({ 
      ok: true, 
      zones, 
      total: zones.length 
    });
    
  } catch (error) {
    console.error('❌ Error in GET /zones/province/:province:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/* ==================== MAP4D PROXY (DEPRECATED) ==================== */

/**
 * @deprecated Use /api/zones/poi/:placeId/details instead
 */
router.get("/place/detail", async (req, res) => {
  try {
    const { placeId } = req.query;
    if (!placeId) {
      return res.status(400).json({ ok: false, error: "Missing placeId" });
    }

    const key = process.env.MAP4D_API_KEY;
    const url = `https://api.map4d.vn/map/place/detail?key=${encodeURIComponent(key)}&place_id=${encodeURIComponent(placeId)}`;
    const r = await fetch(url);
    const j = await r.json();

    return res.json({ ok: true, result: j.result || j.data || j });
  } catch (e) {
    console.error("Map4D detail proxy error:", e);
    res.status(500).json({ ok: false, error: "Proxy error" });
  }
});

module.exports = router;