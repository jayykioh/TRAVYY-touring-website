const express = require("express");
const Tour = require("../models/Tours");
const router = express.Router();
require("../models/Location");
require("../models/TravelAgency");

// [GET] Lấy tour theo id
router.get("/", async (req, res) => {
  try {
    console.log("📥 GET /api/tours called");

    const tours = await Tour.find()
      .populate("locations", "name country")
      .populate("agencyId", "name contact");

    console.log("✅ Tours fetched:", tours.length);
    res.json(tours);
  } catch (err) {
    console.error("❌ Error in /api/tours:");
    console.error(err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// [POST] Tạo tour mới
router.post("/", async (req, res) => {
  try {
    const newTour = new Tour(req.body);
    await newTour.save();
    res.status(201).json(newTour);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// [PUT] Cập nhật tour
router.put("/:id", async (req, res) => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedTour)
      return res.status(404).json({ message: "Tour not found" });
    res.json(updatedTour);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// [DELETE] Xóa tour
router.delete("/:id", async (req, res) => {
  try {
    const deletedTour = await Tour.findByIdAndDelete(req.params.id);
    if (!deletedTour)
      return res.status(404).json({ message: "Tour not found" });
    res.json({ message: "Tour deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    res.json(tour);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;