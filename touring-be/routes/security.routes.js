// routes/security.routes.js
const router = require("express").Router();
const authJwt = require("../middlewares/authJwt");
const {
  request2FAEnable,
  enable2FA,
  verify2FA,
  disable2FA,
  requestEmailVerificationToggle,
  toggleEmailVerification,
  sendVerificationCode,
  verifyEmailCode,
  getSecuritySettings,
} = require("../controller/security.controller");

// ============================================
// 2FA Routes
// ============================================
router.post("/2fa/request-enable", authJwt, request2FAEnable); // Step 1: Send email (requires auth)
router.post("/2fa/enable", enable2FA); // Step 2: Confirm via email link (public - uses token)
router.post("/2fa/verify", verify2FA); // Step 3: Verify TOTP code (can work with or without auth)
router.post("/2fa/disable", authJwt, disable2FA);

// ============================================
// Email Verification Routes
// ============================================
router.post(
  "/email-verification/request-toggle",
  authJwt,
  requestEmailVerificationToggle
); // Step 1: Send email
router.post("/email-verification/toggle", toggleEmailVerification); // Step 2: Confirm via email link (public - uses token)
router.post("/email-verification/send", sendVerificationCode); // Public (for login)
router.post("/email-verification/verify", verifyEmailCode); // Public (for login)

// ============================================
// Get Security Settings
// ============================================
router.get("/settings", authJwt, getSecuritySettings);

module.exports = router;
