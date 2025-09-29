// middlewares/authJwt.js
const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
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
