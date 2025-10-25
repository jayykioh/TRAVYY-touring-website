const express = require("express");
const authJwt = require("../middlewares/authJwt");
const { createOrder, captureOrder, getConfig } = require("../controller/paypal.controller");

const router = express.Router();

// Lấy PayPal config (clientId, currency) cho FE
router.get("/config", getConfig);

// Tạo order trên PayPal (cart hoặc buy-now)
router.post("/create-order", authJwt, createOrder);

// Capture sau khi user approve
router.post("/capture", authJwt, captureOrder);

module.exports = router;