// routes/help.routes.js - Help Center Routes
const express = require("express");
const router = express.Router();
const helpController = require("../controller/helpController");
const { verifyToken, optionalAuth } = require("../middlewares/authJwt");

// Middleware kiểm tra Admin
const isAdmin = (req, res, next) => {
  if (req.userRole !== "Admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
};

// === PUBLIC ROUTES ===
router.get("/categories", helpController.getCategories);
router.get("/featured", helpController.getFeaturedArticles);
router.get("/search", helpController.searchArticles);
router.get("/category/:category", helpController.getArticlesByCategory);
router.get("/article/:slug", helpController.getArticle);

// === USER ROUTES (optional auth) ===
router.post("/article/:articleId/feedback", optionalAuth, helpController.submitFeedback);

// === ADMIN ROUTES ===
router.use(verifyToken, isAdmin);
router.post("/article", helpController.createArticle);
router.put("/article/:id", helpController.updateArticle);
router.delete("/article/:id", helpController.deleteArticle);

module.exports = router;
