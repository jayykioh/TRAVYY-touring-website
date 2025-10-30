const express = require('express');
const router = express.Router();
const { findPOIsByCategory, loadPriorityPOIs } = require('../services/zones/poi-finder');
const { getPlaceDetails, autocompletePlaces } = require('../services/ai/libs/map4d');

// Check if service file exists
let zoneService;
try {
  zoneService = require('../services/zones');
  console.log('✅ Zone service imported successfully');
  console.log('   Available methods:', Object.keys(zoneService));
  console.log('   getZonePOIs:', typeof zoneService.getZonePOIs);
} catch (error) {
  console.error('❌ Failed to import zone service:', error.message);
  throw error;
}

/**
 * GET /api/zones/:zoneId
 * Get zone details
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
    
    // Handle not found
    if (!zone) {
      return res.status(404).json({ 
        ok: false, 
        error: 'Zone not found' 
      });
    }
    
    // Success response
    res.json({ ok: true, zone });
    
  } catch (error) {
    console.error('❌ Error in GET /zones/:zoneId:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * GET /api/zones/:id/pois
 * Get POIs for a zone with preferences
 */
router.get('/:zoneId/pois', async (req, res) => {
  try {
    const { zoneId } = req.params;
    const { vibes, limit } = req.query;

    // ✅ ADD THIS LINE (get zone data first)
    const zone = await zoneService.getZoneById(zoneId);
    
    if (!zone) {
      return res.status(404).json({ error: 'Zone not found' });
    }

    const preferences = {
      vibes: vibes ? vibes.split(',') : [],
      limit: limit ? parseInt(limit) : 10
    };

    const pois = await zoneService.getZonePOIs(zoneId, preferences);

    res.json({
      success: true,
      zoneId,
      zoneName: zone.name, // ✅ NOW this works
      pois
    });
  } catch (error) {
    console.error('❌ [Route] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/zones/province/:province
 * Get all zones in province
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

// ✅ NEW: Get POIs by category
router.get('/:zoneId/pois/:category', async (req, res) => {
  try {
    const { zoneId, category } = req.params;
    const { limit = 7 } = req.query;

    console.log(`\n📥 [API] GET /zones/${zoneId}/pois/${category}`);

    const pois = await findPOIsByCategory(zoneId, category, {
      limit: parseInt(limit),
    });

    res.set({
      'Cache-Control': 'public, max-age=1800', // Cache 30 min
    });

    res.json({ ok: true, category, pois });

  } catch (error) {
    console.error('❌ Error in GET /zones/:zoneId/pois/:category:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// ✅ NEW: Load all priority POIs at once
router.get('/:zoneId/pois-priority', async (req, res) => {
  try {
    const { zoneId } = req.params;
    const { limit = 7 } = req.query;

    console.log(`\n📥 [API] GET /zones/${zoneId}/pois-priority`);

    const poisByCategory = await loadPriorityPOIs(zoneId, {
      limit: parseInt(limit),
    });

    res.set({
      'Cache-Control': 'public, max-age=1800',
    });

    res.json({ ok: true, data: poisByCategory });

  } catch (error) {
    console.error('❌ Error in GET /zones/:zoneId/pois-priority:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// ✅ Get POI details (on click)
router.get('/poi/:placeId/details', async (req, res) => {
  try {
    const { placeId } = req.params;

    console.log(`\n📥 [API] GET /poi/${placeId}/details`);

    const details = await getPlaceDetails(placeId);

    if (!details) {
      console.log(`   ⚠️ Place not found: ${placeId}`);
      return res.status(404).json({ ok: false, error: 'Place not found' });
    }

    console.log(`   ✅ Returning place details:`, {
      id: details.id,
      name: details.name,
      address: details.address,
      phone: details.phone,
      website: details.website,
      rating: details.rating
    });

    res.set({
      'Cache-Control': 'public, max-age=3600',
    });

    res.json({ ok: true, place: details });

  } catch (error) {
    console.error('❌ Error in GET /poi/:placeId/details:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// ✅ NEW: Autocomplete search within zone
router.get('/:zoneId/search', async (req, res) => {
  try {
    const { zoneId } = req.params;
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({ ok: true, results: [] });
    }

    console.log(`\n📥 [API] GET /zones/${zoneId}/search?q=${q}`);

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


router.get("/place/detail", async (req, res) => {
  try {
    const { placeId } = req.query;
    if (!placeId) return res.status(400).json({ ok: false, error: "Missing placeId" });

    const key = process.env.MAP4D_API_KEY;
    const url = `https://api.map4d.vn/map/place/detail?key=${encodeURIComponent(key)}&place_id=${encodeURIComponent(placeId)}`;
    const r = await fetch(url);
    const j = await r.json();

    // Chuẩn hoá output
    return res.json({ ok: true, result: j.result || j.data || j });
  } catch (e) {
    console.error("Map4D detail proxy error:", e);
    res.status(500).json({ ok: false, error: "Proxy error" });
  }
});

module.exports = router;