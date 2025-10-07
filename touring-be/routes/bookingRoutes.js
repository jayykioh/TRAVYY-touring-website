const express = require("express");
const authJwt = require("../middlewares/authJwt");
const { quote } = require("../controller/bookingController");
const router = express.Router();

router.post("/quote", authJwt, quote);
module.exports = router;