const express = require("express");
const Tour = require("../models/Tours");
const router = express.Router();
require("../models/Location");
require("../models/TravelAgency");

// ==============================
// [GET] /api/tours
// ==============================
router.get("/", async (req, res) => {
  try {
    const { from, to, location, search } = req.query;
    const filter = {};

    // 🔹 Lọc theo ngày (tùy chọn)
    if (from && to) {
      filter.$or = [
        { "departures.date": { $gte: new Date(from), $lte: new Date(to) } },
        { "dateOptions.isFlexible": true },
      ];
    }

    // 🔹 Lọc theo location
    if (location) {
      filter.locations = location;
    }

    // 🔹 Tìm kiếm theo từ khóa (title / description / location name)
    if (search) {
      const regex = new RegExp(search, "i");
      const searchConditions = [
        { title: regex },
        { description: regex },
        { "locations.name": regex },
      ];

      // ✅ Merge $or thay vì ghi đè
      if (filter.$or) {
        filter.$or = [...filter.$or, ...searchConditions];
      } else {
        filter.$or = searchConditions;
      }
    }

    const tours = await Tour.find(filter)
      .populate("locations", "name country coordinates")
      .populate("agencyId", "name contact")
      .sort({ createdAt: -1 });

    res.json(tours);
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách tour:", err);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách tour" });
  }
});

// ==============================
// [PUT] /api/tours/:id — Cập nhật tour
// ==============================
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

// ==============================
// [DELETE] /api/tours/:id — Xóa tour
// ==============================
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

// ==============================
// [GET] /api/tours/:id — Lấy chi tiết tour
// ==============================
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