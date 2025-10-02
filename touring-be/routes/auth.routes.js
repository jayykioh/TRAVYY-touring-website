// routes/auth.routes.js
const router = require("express").Router();
const passport = require("passport");
const { signAccess, signRefresh, verifyRefresh, newId } = require("../utils/jwt");
const authJwt = require("../middlewares/authJwt");
const User = require("../models/Users");
const { register, login } = require("../controller/auth.controller");

const isProd = process.env.NODE_ENV === "production";

/* =========================
   Email Register / Login
   ========================= */
router.post("/register", register);
router.post("/login", login);

/* =========================
   Google Login (Hybrid JWT)
   ========================= */
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "http://localhost:5173/login" }),
  async (req, res) => {
    try {
      // user đã được tạo / upsert trong passport strategy
      const user = req.user; // mongoose doc hoặc plain object
      const jti = newId();

      // (access token không cần trả ở redirect; FE sẽ gọi /refresh)
      const refreshToken = signRefresh({ jti, userId: user.id });

      // Set refresh cookie theo môi trường
      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: isProd,                    // dev: false, prod: true (HTTPS)
        sameSite: isProd ? "none" : "lax", // dev: 'lax'
        path: "/api/auth",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
      });

      // Redirect sạch -> FE gọi POST /api/auth/refresh để lấy access
      return res.redirect("http://localhost:5173/oauth/callback");
    } catch (e) {
      console.error("google/callback error:", e);
      return res.status(500).json({ message: "OAuth callback error" });
    }
  }
);

/* =========================
   Refresh -> Access token
   ========================= */
router.post("/refresh", async (req, res) => {
  const t = req.cookies?.refresh_token;
  if (!t) return res.status(401).json({ message: "Missing refresh" });

  try {
    const p = verifyRefresh(t); // { sub: userId, jti, iat, exp, ... }

    // (khuyến nghị) Kiểm tra jti trong DB/Redis nếu có rotate/revoke
    const user = await User.findById(p.sub).select("role");
    if (!user) return res.status(401).json({ message: "Invalid refresh" });

    const access = signAccess({ id: p.sub, role: user.role || "Traveler" });
    return res.json({ accessToken: access });
  } catch {
    return res.status(401).json({ message: "Invalid refresh" });
  }
});

/* =========================
   Me (trả FULL user để FE hiển thị Profile)
   ========================= */
router.get("/me", authJwt, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub).select("-password");
    if (!user) return res.status(404).json({ message: "Not found" });
    res.set("Cache-Control", "no-store");
    return res.json(user);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   Set role (JWT guard)
   ========================= */
router.post("/set-role", authJwt, async (req, res) => {
  const { role } = req.body;
  const allowed = ["Traveler", "TourGuide", "TravelAgency"];
  if (!allowed.includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }
  try {
    const user = await User.findByIdAndUpdate(
      req.user.sub,
      { $set: { role } },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "Not found" });
    return res.json({ message: "Role set successfully", user });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/logout", async (req, res) => {
  try {
    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: isProd,                    // prod: true (HTTPS)
      sameSite: isProd ? "none" : "lax", // trùng với lúc set
      path: "/api/auth",
    });
    return res.status(200).json({ ok: true, message: "Logged out" });
  } catch (e) {
    console.error("logout error:", e);
    return res.status(200).json({ ok: true }); 
  }
});

module.exports = router;
