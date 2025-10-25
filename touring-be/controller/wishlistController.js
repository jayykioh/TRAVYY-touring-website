// controllers/wishlistController.js
const mongoose = require("mongoose");
const Wishlist = require("../models/Wishlist");
const Tour = require("../models/agency/Tours");
const Location = require("../models/agency/Location");
// Helper ép ObjectId an toàn
const toObjectId = (id) => new mongoose.Types.ObjectId(id);

// 1) Lấy toàn bộ wishlist (populate tour info)
async function getMyWishlist(req, res) {
  const userId = toObjectId(req.user.sub);
  try {
    const items = await Wishlist.find({ userId })
      .populate({
        path: "tourId",
        model: Tour,
        select:
          "title description imageItems basePrice isRating isReview usageCount locations",
        populate: {
          path: "locations",
          model: Location,
          select: "name country",
        },
      })
      .lean();

    // ✅ Lọc bỏ những record mà tourId = null (tour đã bị xóa)
    const safeItems = items.filter((item) => item.tourId != null);

    return res.json({ success: true, data: safeItems });
  } catch (e) {
    console.error("getMyWishlist error:", e);
    return res.status(500).json({ success: false, error: e.message });
  }
}

// 2) Thêm tour vào wishlist
async function addToWishlist(req, res) {
  try {
    const userId = toObjectId(req.user.sub);
    const { tourId } = req.body;
    if (!tourId)
      return res
        .status(400)
        .json({ success: false, message: "tourId is required" });

    const tour = await Tour.findById(tourId);
    if (!tour)
      return res
        .status(404)
        .json({ success: false, message: "Tour not found" });

    const doc = await Wishlist.create({ userId, tourId: toObjectId(tourId) });
    return res
      .status(201)
      .json({ success: true, data: doc, message: "Added to wishlist" });
  } catch (e) {
    if (e.code === 11000) {
      return res
        .status(200)
        .json({ success: false, message: "Already in wishlist" });
    }
    console.error("addToWishlist error:", e);
    return res.status(500).json({ success: false, error: e.message });
  }
}

// 3) Xóa tour khỏi wishlist
async function removeFromWishlist(req, res) {
  try {
    const userId = toObjectId(req.user.sub);
    const { tourId } = req.params;

    await Wishlist.deleteOne({ userId, tourId: toObjectId(tourId) });
    return res.json({ success: true, message: "Removed from wishlist" });
  } catch (e) {
    console.error("removeFromWishlist error:", e);
    return res.status(500).json({ success: false, error: e.message });
  }
}

// 4) Toggle (nếu có thì xóa, chưa có thì thêm)
async function toggleWishlist(req, res) {
  try {
    const userId = toObjectId(req.user.sub);
    const { tourId } = req.body;
    if (!tourId)
      return res
        .status(400)
        .json({ success: false, message: "tourId is required" });

    const found = await Wishlist.findOne({
      userId,
      tourId: toObjectId(tourId),
    });
    if (found) {
      await Wishlist.deleteOne({ _id: found._id });
      return res.json({
        success: true,
        isFav: false,
        message: "Removed from wishlist",
      });
    } else {
      await Wishlist.create({ userId, tourId: toObjectId(tourId) });
      return res
        .status(201)
        .json({ success: true, isFav: true, message: "Added to wishlist" });
    }
  } catch (e) {
    if (e.code === 11000) {
      return res
        .status(200)
        .json({ success: true, isFav: true, message: "Already in wishlist" });
    }
    console.error("toggleWishlist error:", e);
    return res.status(500).json({ success: false, error: e.message });
  }
}

// 5) Check một tour có trong wishlist không
async function checkOne(req, res) {
  try {
    const userId = toObjectId(req.user.sub);
    const { tourId } = req.params;
    const exists = await Wishlist.exists({
      userId,
      tourId: toObjectId(tourId),
    });
    return res.json({ success: true, isFav: !!exists });
  } catch (e) {
    console.error("checkOne error:", e);
    return res.status(500).json({ success: false, error: e.message });
  }
}

// 6) Check nhiều tour (cho list nhiều cái)
async function checkMany(req, res) {
  try {
    const userId = toObjectId(req.user.sub);
    const ids = (req.query.ids || "")
      .split(",")
      .filter(Boolean)
      .map(toObjectId);

    const rows = await Wishlist.find({
      userId,
      tourId: { $in: ids },
    })
      .select("tourId")
      .lean();

    const favIds = rows.map((r) => String(r.tourId));
    return res.json({ success: true, favIds });
  } catch (e) {
    console.error("checkMany error:", e);
    return res.status(500).json({ success: false, error: e.message });
  }
}

module.exports = {
  getMyWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  checkOne,
  checkMany,
};
