const express = require("express");
const authJwt = require("../middlewares/authJwt");
const {
  quote,
  getUserBookings,
  getBookingById,
} = require("../controller/bookingController");
const { getBookingByPayment } = require("../controller/payment.controller");
const router = express.Router();

router.post("/quote", authJwt, quote);
router.get("/my", authJwt, getUserBookings);

// UNIFIED: Get booking by payment - now handled by payment controller
router.get("/by-payment/:provider/:orderId", authJwt, getBookingByPayment);

// Get single booking by ID - must be LAST to avoid conflicts
router.get("/:id", authJwt, getBookingById);

module.exports = router;
