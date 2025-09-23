const router = require("express").Router();
const passport = require("passport");
const {
  register,
  login,
  phoneOtpSend,
  phoneOtpVerify,
} = require("./auth.controller");

// =========================
// Email Register / Login
// =========================
router.post("/register", register);
router.post("/login", login);

// =========================
// Google Login
// =========================
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/login",
  }),
  (req, res) => {
    // Sau khi login thành công, redirect về FE
    res.redirect("http://localhost:5173/");
  }
);

// =========================
// Facebook Login
// =========================
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "http://localhost:5173/login",
  }),
  (req, res) => {
    res.redirect("http://localhost:5173/");
  }
);

// =========================
// Phone Login (OTP)
// =========================
router.post("/phone/send-otp", phoneOtpSend);
router.post("/phone/verify-otp", phoneOtpVerify);

module.exports = router;
