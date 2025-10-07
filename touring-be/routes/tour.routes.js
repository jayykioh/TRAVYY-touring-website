const express = require("express");
const Tour = require("../models/Tours");
const router = express.Router();
const Location = require("../models/Location");
require("../models/TravelAgency");

// ==============================
// [GET] /api/tours
// ==============================
// ==============================
// [GET] /api/tours?search=Huế
// ==============================
function normalizeVietnamese(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu thanh
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};

    if (search) {
      const normalizedSearch = normalizeVietnamese(search.trim().toLowerCase());

      // Lấy tất cả location
      const allLocations = await Location.find({});
      // Lọc theo tên bỏ dấu
      const matchingLocations = allLocations.filter((loc) => {
        const normalizedName = normalizeVietnamese(loc.name.toLowerCase());
        return normalizedName.includes(normalizedSearch);
      });

      const locationIds = matchingLocations.map((l) => l._id);
      filter.locations = { $in: locationIds };
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
    const tour = await Tour.findById(req.params.id)
      .populate("locations", "name country coordinates")
      .populate("agencyId", "name contact");
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    res.json(tour);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
