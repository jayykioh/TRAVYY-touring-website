const router = require("express").Router();
const passport = require("passport");
const {
  register,
  login,
  phoneOtpSend,
  phoneOtpVerify,
} = require("../controller/auth.controller");

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

router.post("/set-role", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthenticated" });

  const { role } = req.body;
  if (!["Traveler", "TourGuide", "TravelAgency"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  req.user.role = role;
  await req.user.save();
  res.json({ message: "Role set successfully", user: req.user });
});

// =========================
// Facebook Login
// =========================
// router.get(
//   "/facebook",
//   passport.authenticate("facebook", { scope: ["email"] })
// );

// router.get(
//   "/facebook/callback",
//   passport.authenticate("facebook", {
//     failureRedirect: "http://localhost:5173/login",
//   }),
//   (req, res) => {
//     res.redirect("http://localhost:5173/");
//   }
// );

// =========================
// Phone Login (OTP)
// =========================
// router.post("/phone/send-otp", phoneOtpSend);
// router.post("/phone/verify-otp", phoneOtpVerify);

// Lấy user từ session (nếu có) và trả về cho FE
// FE sẽ dùng API này để kiểm tra user đã login chưa
router.get("/me", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthenticated" });
  const u = req.user.toObject ? req.user.toObject() : req.user;
  delete u.password;
  return res.json(u); // có phone, location.*
});

router.post("/logout", (req, res, next) => {
  console.log("HIT /api/auth/logout", {
    sid: req.sessionID,
    hasUser: !!req.user,
    hasSession: !!req.session,
  });

  // ❗ Không có session: không gọi req.logout, chỉ xoá cookie
  if (!req.session) {
    res.clearCookie("sid", { path: "/" });
    return res.status(200).json({ ok: true, note: "no session" });
  }

  // ❗ Passport v0.6+: dùng keepSessionInfo để Passport KHÔNG gọi session.regenerate
  req.logout({ keepSessionInfo: true }, (err) => {
    if (err) return next(err);

    req.session.destroy((e) => {
      if (e) console.error("session.destroy error:", e);
      res.clearCookie("sid", { path: "/" }); // tên cookie của bạn là 'sid'
      return res.status(200).json({ ok: true });
    });
  });
});


module.exports = router;
