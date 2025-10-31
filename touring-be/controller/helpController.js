// controller/helpController.js
const HelpArticle = require("../models/HelpArticle");
const HelpCategory = require("../models/HelpCategory");
const HelpFeedback = require("../models/HelpFeedback");

// ============ CATEGORIES ============
exports.getCategories = async (req, res) => {
  try {
    const categories = await HelpCategory.find().populate("articleCount");
    res.json(categories);
  } catch (err) {
    console.error("getCategories error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ============ ARTICLES ============
exports.getFeaturedArticles = async (req, res) => {
  try {
    const featured = await HelpArticle.find({ isFeatured: true })
      .populate("category")
      .populate("helpfulCount")
      .populate("notHelpfulCount")
      .limit(6);
    res.json(featured);
  } catch (err) {
    console.error("getFeaturedArticles error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getArticlesByCategory = async (req, res) => {
  try {
    const categorySlug = req.params.category;
    const category = await HelpCategory.findOne({ slug: categorySlug });
    if (!category) return res.status(404).json({ message: "Category not found" });

    const articles = await HelpArticle.find({ category: category._id })
      .populate("helpfulCount")
      .populate("notHelpfulCount");
    res.json({ category, articles });
  } catch (err) {
    console.error("getArticlesByCategory error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getArticle = async (req, res) => {
  try {
    const { slug } = req.params;
    const article = await HelpArticle.findOne({ slug })
      .populate("category")
      .populate("relatedArticles")
      .populate("helpfulCount")
      .populate("notHelpfulCount");

    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json(article);
  } catch (err) {
    console.error("getArticle error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ============ SEARCH ============
exports.searchArticles = async (req, res) => {
  try {
    const q = req.query.q || "";
    const results = await HelpArticle.find({ $text: { $search: q } })
      .populate("category")
      .limit(10);
    res.json(results);
  } catch (err) {
    console.error("searchArticles error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ============ FEEDBACK ============
exports.submitFeedback = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { helpful, comment } = req.body;

    const feedback = await HelpFeedback.create({
      articleId,
      userId: req.userId || null,
      helpful,
      comment,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.status(201).json({ success: true, feedback });
  } catch (err) {
    console.error("submitFeedback error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ============ ADMIN ============
exports.createArticle = async (req, res) => {
  try {
    const article = await HelpArticle.create(req.body);
    res.status(201).json(article);
  } catch (err) {
    console.error("createArticle error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateArticle = async (req, res) => {
  try {
    const article = await HelpArticle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!article) return res.status(404).json({ message: "Not found" });
    res.json(article);
  } catch (err) {
    console.error("updateArticle error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    await HelpArticle.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("deleteArticle error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ============ FEEDBACK ADMIN ============
exports.getAllFeedback = async (_req, res) => {
  try {
    const feedbacks = await HelpFeedback.find().populate("articleId userId");
    res.json(feedbacks);
  } catch (err) {
    console.error("getAllFeedback error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getFeedbackById = async (req, res) => {
  try {
    const feedback = await HelpFeedback.findById(req.params.id).populate("articleId userId");
    res.json(feedback);
  } catch (err) {
    console.error("getFeedbackById error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { status, responseMessage } = req.body;
    const feedback = await HelpFeedback.findByIdAndUpdate(
      req.params.id,
      { status, responseMessage },
      { new: true }
    );
    res.json(feedback);
  } catch (err) {
    console.error("updateFeedbackStatus error:", err);
    res.status(500).json({ message: err.message });
  }
};
