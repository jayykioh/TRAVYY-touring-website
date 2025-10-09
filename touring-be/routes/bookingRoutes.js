const express = require("express");
const authJwt = require("../middlewares/authJwt");
const { quote, getUserBookings, getBookingByPayment } = require("../controller/bookingController");
const router = express.Router();

router.post("/quote", authJwt, quote);
router.get("/my", authJwt, getUserBookings);
router.get("/by-payment/:provider/:orderId", authJwt, getBookingByPayment);

module.exports = router;