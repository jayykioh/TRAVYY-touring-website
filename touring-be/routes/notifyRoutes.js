// routes/notifyRoutes.js
const express = require("express");
const {
  notifyBookingSuccess,
  notifyPaymentSuccess,
  notifyNewTour,
  notifyRegister,
} = require("../controller/notifyController");

const router = express.Router();

router.post("/booking", notifyBookingSuccess);
router.post("/payment", notifyPaymentSuccess);
router.post("/new-tour", notifyNewTour);
router.post("/register", notifyRegister);

module.exports = router;
