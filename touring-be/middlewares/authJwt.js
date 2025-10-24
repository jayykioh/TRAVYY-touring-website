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

module.exports = verifyToken;
module.exports.verifyToken = verifyToken;
module.exports.optionalAuth = optionalAuth;
