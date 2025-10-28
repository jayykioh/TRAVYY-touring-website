const express = require('express');
const router = express.Router();

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
    
    // Validate
    if (!zoneId || zoneId.length < 3) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Invalid zone ID' 
      });
    }
    
    // Call service (business logic)
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

module.exports = router;