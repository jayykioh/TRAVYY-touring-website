// routes/notifyRoutes.js
const express = require("express");
const {
  notifyBookingSuccess,
  notifyPaymentSuccess,
  notifyNewTour,
  notifyRegister,
  getUserNotifications,
  markNotificationsAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
  getNotificationStats,
  notifyPasswordChanged,
  notifyPasswordReset,
  notifyPasswordResetSuccess,
} = require("../controller/notifyController");
const authJwt = require("../middlewares/authJwt");

const router = express.Router();

// Email sending endpoints (public)
router.post("/booking", notifyBookingSuccess);
router.post("/payment", notifyPaymentSuccess);
router.post("/new-tour", notifyNewTour);
router.post("/register", notifyRegister);

// 🔒 Security notification endpoints
router.post("/password-changed", notifyPasswordChanged);
router.post("/password-reset", notifyPasswordReset);
router.post("/password-reset-success", notifyPasswordResetSuccess);

// User notification management (protected)
router.get("/", authJwt, getUserNotifications); // Default endpoint
router.get("/my", authJwt, getUserNotifications); // Alias
router.post("/mark-read", authJwt, markNotificationsAsRead); // Changed from PATCH to POST
router.post("/mark-all-read", authJwt, markAllNotificationsAsRead);
router.delete("/:id", authJwt, deleteNotification);
router.get("/unread-count", authJwt, getUnreadCount);

// Admin stats (protected - có thể thêm admin middleware sau)
router.get("/stats", authJwt, getNotificationStats);

module.exports = router;
