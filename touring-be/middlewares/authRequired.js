// middlewares/authRequired.js
module.exports = function authRequired(req, res, next) {
  if (req.isAuthenticated?.() || req.user) return next();
  return res.status(401).json({ error: "UNAUTHORIZED" });
};
