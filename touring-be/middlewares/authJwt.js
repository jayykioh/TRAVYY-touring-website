const jwt = require("jsonwebtoken");
const { verifyAccess, verifyRefresh, signAccess } = require("../utils/jwt");
/**
 * JWT Auth Middleware
 * Priority:
 * 1. Access token from Authorization header
 * 2. Auto-refresh from refresh_token cookie (fallback)
 */
const User = require("../models/Users");

// Required auth - must have valid token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  console.log(
    "Auth header at",
    req.method,
    req.originalUrl,
    "=>",
    authHeader || "(none)",
    "| Refresh cookie:",
    req.cookies?.refresh_token ? "Present" : "None"
  );

  // ✅ Priority 1: Access token from Authorization header
  const accessToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  // Defensive: treat 'null' string or 'undefined' string as no token (artifact of
  // localStorage.setItem(key, null) which stores string 'null')
  const isInvalidTokenString = accessToken === 'null' || accessToken === 'undefined' || accessToken === '';

  if (accessToken && !isInvalidTokenString) {
    try {
      const decoded = jwt.decode(accessToken);
      const verified = verifyAccess(accessToken);

      req.user = verified;
      req.userId = verified.sub || verified.id || verified._id;
      req.userRole = verified.role;
      console.log(
        "   ✅ Access token valid:",
        req.user.sub,
        "| Role:",
        req.userRole
      );
      return next();
    } catch (error) {
      console.log("   ⚠️ Access token expired/invalid:", error.message);
    }
  } else if (isInvalidTokenString) {
    console.log("   ⚠️ Access token is string 'null'/'undefined', treating as no token, attempting refresh...");
  }


  // ✅ Priority 2: Auto-refresh from refresh_token cookie
  const refreshToken = req.cookies?.refresh_token;

  if (refreshToken) {
    try {
      const refreshPayload = verifyRefresh(refreshToken);

      // Get user from DB to get role
      const user = await User.findById(refreshPayload.sub).select("role");
      if (!user) {
        console.log("   ❌ User not found for refresh token");
        return res.status(401).json({
          message: "User not found",
          needsAuth: true,
        });
      }

      // Generate new access token
      const newAccessToken = signAccess({
        id: user._id.toString(),
        role: user.role,
      });

      // Attach user to request (same format as verifyAccess)
      req.user = {
        sub: user._id.toString(),
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 15 * 60, // 15 min
      };

      // ✅ Send new access token in response header
      res.setHeader("X-New-Access-Token", newAccessToken);

      console.log("   ✅ Auto-refreshed token for user:", req.user.sub);
      // Extract userId and role from token payload
      req.userId = req.user.sub || req.user.id || req.user._id;
      req.userRole = req.user.role;

      // Check account status (prevent banned users using existing tokens)
      try {
        const u = await User.findById(req.userId).select(
          "accountStatus statusReason"
        );
        if (u && u.accountStatus === "banned") {
          return res.status(403).json({
            message: "Tài khoản đã bị khóa",
            reason: u.statusReason || "",
          });
        }
      } catch (e) {
        console.warn(
          "verifyToken: failed to check account status",
          e.message || e
        );
        // proceed if DB check fails (avoid locking out users due to transient DB issues)
      }

      return next();
    } catch (error) {
      console.log("   ❌ Refresh token invalid:", error.message);
    }
  }

  // ❌ No valid auth found
  console.log("   ❌ No valid authentication");
  return res.status(401).json({
    message: "Missing or invalid token",
    needsAuth: true,
  });
};

// Optional auth - if token exists, verify it, otherwise continue
const optionalAuth = (req, res, next) => {
  const h = req.headers.authorization || "";
  const t = h.startsWith("Bearer ") ? h.slice(7) : null;

  if (t) {
    try {
      req.user = jwt.verify(t, process.env.JWT_ACCESS_SECRET);
      req.userId = req.user.sub || req.user._id;
    } catch (err) {
      // Invalid token, but we don't reject - just continue without user
      console.log("Optional auth: Invalid token, continuing without user");
    }
  }

  next();
};

// Admin auth - must have valid token with Admin role
const verifyAdminToken = (req, res, next) => {
  const h = req.headers.authorization || "";
  const t = h.startsWith("Bearer ") ? h.slice(7) : null;

  if (!t) return res.status(401).json({ message: "Missing token" });

  try {
    const decoded = jwt.verify(t, process.env.JWT_ACCESS_SECRET);

    // Check if user has Admin role
    if (decoded.role !== "Admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    req.admin = {
      id: decoded.id || decoded.sub || decoded._id,
      role: decoded.role,
    };

    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
};

// Middleware to check if authenticated user is admin (use after verifyToken)
const isAdmin = (req, res, next) => {
  if (!req.userRole || req.userRole !== "Admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }
  next();
};

module.exports = verifyToken;
module.exports.verifyToken = verifyToken;
module.exports.optionalAuth = optionalAuth;
module.exports.verifyAdminToken = verifyAdminToken;
module.exports.isAdmin = isAdmin;
