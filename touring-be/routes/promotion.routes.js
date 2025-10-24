const express = require("express");
const router = express.Router();
const promotionController = require("../controller/promotionController");
const { verifyToken, optionalAuth } = require("../middlewares/authJwt");

// Middleware kiểm tra Admin
const isAdmin = (req, res, next) => {
  if (req.userRole !== "Admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
};

// === PUBLIC ROUTES ===
// ✅ Use optionalAuth: filter out used vouchers for logged-in users
router.get("/active", optionalAuth, promotionController.getActivePromotions);
// ✅ Use optionalAuth: if user logged in, check if they used the voucher
router.post("/validate", optionalAuth, promotionController.validatePromotion);

// === ADMIN ROUTES ===
router.use(verifyToken, isAdmin); // Tất cả routes dưới đây cần Admin

router.get("/", promotionController.getPromotions);
router.post("/", promotionController.createPromotion);
router.put("/:id", promotionController.updatePromotion);
router.delete("/:id", promotionController.deletePromotion);

module.exports = router;
