// routes/security.routes.js
const router = require("express").Router();
const authJwt = require("../middlewares/authJwt");
const {
  request2FAEnable,
  enable2FA,
  verify2FA,
  disable2FA,
  resend2FACode,
  getSecuritySettings,
  removeTrustedDevice,
  removeAllTrustedDevices,
} = require("../controller/security.controller");

// ============================================
// 2FA Routes
// ============================================
router.post("/2fa/request-enable", authJwt, request2FAEnable); // Step 1: Send email (requires auth)
router.post("/2fa/enable", enable2FA); // Step 2: Confirm via email link (public - uses token)
router.post("/2fa/verify", verify2FA); // Step 3: Verify email-based OTP code
router.post("/2fa/resend", resend2FACode); // Resend 2FA code (public - for login)
router.post("/2fa/disable", authJwt, disable2FA);

// ============================================
// Email Verification Routes - REMOVED
// ============================================
// Email verification feature has been removed

// ============================================
// Get Security Settings
// ============================================
router.get("/settings", authJwt, getSecuritySettings);

// ============================================
// Trusted Devices Management
// ============================================
router.delete("/trusted-devices/:deviceId", authJwt, removeTrustedDevice); // Remove specific device
router.delete("/trusted-devices", authJwt, removeAllTrustedDevices); // Remove all devices

module.exports = router;
