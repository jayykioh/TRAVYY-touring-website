const router = require("express").Router();
const Location = require("../models/agency/Location");
const Tour = require("../models/agency/Tours");
const mongoose = require("mongoose");

// GET /api/location-tours/:locationId
router.get("/:locationId", async (req, res) => {
  try {
    const { locationId } = req.params;

    console.log("🔍 [locationTour] Fetching tours for locationId:", locationId);

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(locationId)) {
      console.log("❌ [locationTour] Invalid ObjectId:", locationId);
      return res.json([]);
    }

    // Kiểm tra location có tồn tại không
    const location = await Location.findById(locationId);
    if (!location) {
      console.log("❌ [locationTour] Location not found:", locationId);
      return res.json([]);
    }

    console.log("✅ [locationTour] Location found:", location.name);

    // Query tours - locations có thể là ObjectId đơn HOẶC array
    // Mongoose tự động xử lý cả 2 trường hợp khi dùng locations: locationId
    const tours = await Tour.find({
      locations: locationId,
      isHidden: { $ne: true }
    }).populate('locations', 'name');

    console.log(`✅ [locationTour] Found ${tours.length} tours for ${location.name}`);
    
    if (tours.length > 0) {
      console.log("📋 [locationTour] Sample tour:", {
        title: tours[0].title,
        locations: tours[0].locations
      });
    }

    res.json(tours);
  } catch (e) {
    console.error("❌ [locationTour] Error:", e);
    res.status(500).json({
      error: "LOCATION_TOURS_FAILED",
      message: e.message,
    });
  }
});

module.exports = router;
