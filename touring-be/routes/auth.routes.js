// routes/auth.routes.js
const router = require("express").Router();
const passport = require("passport");
const {
  signAccess,
  signRefresh,
  verifyRefresh,
  newId,
} = require("../utils/jwt");
const authJwt = require("../middlewares/authJwt");
const User = require("../models/Users");
const {
  register,
  login,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controller/auth.controller");

const isProd = process.env.NODE_ENV === "production";

/* =========================
   Email Register / Login
   ========================= */
router.post("/register", register);
router.post("/login", login);

/* =========================
   Password Management
   ========================= */
router.post("/change-password", authJwt, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

/* =========================
   Google Login (Hybrid JWT)
   ========================= */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: process.env.CLIENT_URL ? `${process.env.CLIENT_URL.replace(/\/+$/,'')}/login` : "https://travvytouring.page/login",
  }),
  async (req, res) => {
    try {
      // user đã được tạo / upsert trong passport strategy
      const user = req.user; // mongoose doc hoặc plain object
      const jti = newId();

      const refreshToken = signRefresh({ jti, userId: user.id });
      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
        ...(isProd && { domain: ".travyytouring.page" }),
      });

      // Redirect sạch -> FE gọi POST /api/auth/refresh để lấy access
      return res.redirect(process.env.CLIENT_URL ? `${process.env.CLIENT_URL.replace(/\/+$/,'')}/oauth/callback` : "https://travyytouring.page/oauth/callback");
    } catch (e) {
      console.error("google/callback error:", e);
      return res.status(500).json({ message: "OAuth callback error" });
    }
  }
);

/* =========================
   Facebook Login (Mở lại)
   ========================= */
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"], session: false })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    session: false,
    failureRedirect: process.env.CLIENT_URL ? `${process.env.CLIENT_URL.replace(/\/+$/,'')}/login` : "https://travvytouring.page/login",
  }),
  async (req, res) => {
    try {
      const user = req.user;
      const jti = newId();

      const refreshToken = signRefresh({ jti, userId: user.id });

      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60 * 1000,
        ...(isProd && { domain: ".travyytouring.page" }),
      });

      return res.redirect(process.env.CLIENT_URL ? `${process.env.CLIENT_URL.replace(/\/+$/,'')}/oauth/callback` : "https://travvytouring.page/oauth/callback");
    } catch (e) {
      console.error("facebook/callback error:", e);
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
    const user = await User.findById(p.sub).select(
      "role accountStatus statusReason"
    );
    if (!user) return res.status(401).json({ message: "Invalid refresh" });

    const access = signAccess({ id: p.sub, role: user.role || "Traveler" });

    // Return account status so clients (OAuth callback) can detect banned accounts immediately
    return res.json({
      accessToken: access,
      accountStatus: user.accountStatus,
      statusReason: user.statusReason,
    });
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
    // 🧹 Xoá cookie refresh_token triệt để
    // CRITICAL: clearCookie phải match CHÍNH XÁC các options khi set cookie
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
    };
    
    // Clear cookie với đúng options
    res.clearCookie("refresh_token", cookieOptions);
    
    // Set header để client biết phải clear cache
    res.set("Clear-Site-Data", '"cache", "cookies", "storage"');

    return res.status(200).json({ ok: true, message: "Logged out" });
  } catch (e) {
    console.error("logout error:", e);
    return res.status(500).json({ ok: false, message: "Logout error" });
  }
});

module.exports = router;
