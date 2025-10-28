const jwt = require("jsonwebtoken");
const { verifyAccess, verifyRefresh, signAccess } = require("../utils/jwt");
const User = require("../models/Users");

/**
 * JWT Auth Middleware
 * Priority:
 * 1. Access token from Authorization header
 * 2. Auto-refresh from refresh_token cookie (fallback)
 */
module.exports = async (req, res, next) => {
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

  if (accessToken) {
    try {
      // ✅ ADD: Decode để xem exp
      const decoded = jwt.decode(accessToken);
      const now = Math.floor(Date.now() / 1000);
      console.log(
        "   📝 Token exp:",
        decoded?.exp,
        "| Now:",
        now,
        "| Diff:",
        decoded?.exp - now,
        "seconds"
      );

      const verified = verifyAccess(accessToken);
      req.user = verified;
      console.log("   ✅ Access token valid:", req.user.sub);
      return next();
    } catch (error) {
      console.log("   ⚠️ Access token expired/invalid:", error.message);
    }
  }

  // ✅ Priority 2: Auto-refresh from refresh_token cookie
  const refreshToken = req.cookies?.refresh_token;

  if (refreshToken) {
    try {
      const refreshPayload = verifyRefresh(refreshToken);

      // Get user from DB to get role
      const user = await User.findById(refreshPayload.sub).select("role");
      if (!user) {a
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
