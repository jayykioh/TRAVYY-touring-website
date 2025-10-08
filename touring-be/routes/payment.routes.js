// routes/payment.routes.js
const express = require("express");
const authJwt = require("../middlewares/authJwt");
const { createMoMoPayment, handleMoMoIPN, markMoMoPaid, getMoMoSessionStatus } = require("../controller/payment.controller");

const router = express.Router();

// Create payment (auth required to tie to user)
router.post("/momo", authJwt, createMoMoPayment);

// IPN callback (public – MoMo server calls)
router.post("/momo/ipn", handleMoMoIPN);

// FE calls after redirect (demo)
router.post("/momo/mark-paid", authJwt, markMoMoPaid);

// Poll status
router.get("/momo/session/:orderId", authJwt, getMoMoSessionStatus);

module.exports = router;
