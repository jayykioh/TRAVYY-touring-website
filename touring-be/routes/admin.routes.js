const express = require("express");
const router = express.Router();
const { adminLogin } = require("../controller/admin.controller");

router.post("/login", adminLogin);

module.exports = router;
