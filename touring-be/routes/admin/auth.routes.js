// routes/admin/auth.routes.js
const express = require("express");
const router = express.Router();
const {
  adminLogin,
  adminLogout,
} = require("../../controller/admin/admin.auth.controller");

/**
 * @route   POST /api/admin/login
 * @desc    Admin login
 * @access  Public
 */
router.post("/login", adminLogin);

/**
 * @route   POST /api/admin/logout
 * @desc    Admin logout
 * @access  Private
 */
router.post("/logout", adminLogout);

module.exports = router;
