const express = require("express");
const Wishlist = require("../models/Wishlist");

const router = express.Router();

// 📌 Lấy toàn bộ wishlist của user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const wishlist = await Wishlist.find({ userId }).populate("tourId");
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Thêm tour vào wishlist
router.post("/", async (req, res) => {
  try {
    const { userId, tourId } = req.body;
    if (!userId || !tourId) {
      return res.status(400).json({ message: "Thiếu userId hoặc tourId" });
    }

    const exist = await Wishlist.findOne({ userId, tourId });
    if (exist) {
      return res.status(400).json({ message: "Tour đã có trong wishlist" });
    }

    const newItem = new Wishlist({ userId, tourId });
    await newItem.save();

    res.json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Xóa tour khỏi wishlist
router.delete("/", async (req, res) => {
  try {
    const { userId, tourId } = req.body;
    await Wishlist.findOneAndDelete({ userId, tourId });
    res.json({ message: "Đã xóa khỏi wishlist" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Check tour có trong wishlist hay chưa
router.get("/check/:userId/:tourId", async (req, res) => {
  try {
    const { userId, tourId } = req.params;
    const exist = await Wishlist.findOne({ userId, tourId });
    res.json({ isFav: !!exist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
