const express = require("express");
const authJwt = require("../middlewares/authJwt");
const { quote, getUserBookings } = require("../controller/bookingController");
const { getBookingByPayment } = require("../controller/payment.controller");
const router = express.Router();

router.post("/quote", authJwt, quote);
router.get("/my", authJwt, getUserBookings);

// UNIFIED: Get booking by payment - now handled by payment controller
router.get("/by-payment/:provider/:orderId", authJwt, getBookingByPayment);

module.exports = router;