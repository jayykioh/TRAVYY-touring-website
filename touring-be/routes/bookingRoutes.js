const express = require("express");
const authJwt = require("../middlewares/authJwt");
const { quote, getUserBookings } = require("../controller/bookingController");
const router = express.Router();

router.post("/quote", authJwt, quote);
router.get("/my", authJwt, getUserBookings);

module.exports = router;