// routes/bookingRoutes.js
const express = require("express");
const router = express.Router();
const { createBooking, getMyBookings } = require("../controller/bookingController");
const auth = require("../middlewares/authJwt");

router.post("/", auth, createBooking);  // Tạo booking
router.get("/my", auth, getMyBookings); // Lấy lịch sử booking

module.exports = router;
