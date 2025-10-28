// middlewares/authJwt.js
const jwt = require("jsonwebtoken");

// Required auth - must have valid token
const verifyToken = (req, res, next) => {
  const h = req.headers.authorization || "";
  console.log(
    "Auth header at",
    req.method,
    req.originalUrl,
    "=>",
    h || "(none)"
  );
  const t = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!t) return res.status(401).json({ message: "Missing token" });
  try {
    req.user = jwt.verify(t, process.env.JWT_ACCESS_SECRET);
    // Extract userId and role from token payload
    req.userId = req.user.sub || req.user.id || req.user._id;
    req.userRole = req.user.role;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
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

module.exports = verifyToken;
module.exports.verifyToken = verifyToken;
module.exports.optionalAuth = optionalAuth;
module.exports.verifyAdminToken = verifyAdminToken;
