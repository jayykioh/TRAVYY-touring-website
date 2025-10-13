// routes/notifyRoutes.js
const express = require("express");
const {
  notifyBookingSuccess,
  notifyPaymentSuccess,
  notifyNewTour,
  notifyRegister,
  getUserNotifications,
  markNotificationsAsRead,
  getNotificationStats,
} = require("../controller/notifyController");
const authJwt = require("../middlewares/authJwt");

const router = express.Router();

// Email sending endpoints (public)
router.post("/booking", notifyBookingSuccess);
router.post("/payment", notifyPaymentSuccess);
router.post("/new-tour", notifyNewTour);
router.post("/register", notifyRegister);

// User notification management (protected)
router.get("/my", authJwt, getUserNotifications);
router.patch("/mark-read", authJwt, markNotificationsAsRead);

// Admin stats (protected - có thể thêm admin middleware sau)
router.get("/stats", authJwt, getNotificationStats);

module.exports = router;
