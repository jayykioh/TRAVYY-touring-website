// controller/helpController.js - Help Center Controller
const HelpArticle = require("../models/HelpArticle");
const HelpFeedback = require("../models/HelpFeedback");

// Categories configuration
const CATEGORIES = {
  "booking-payment": {
    name: "Đặt tour & thanh toán",
    icon: "🧾",
    description: "Hướng dẫn đặt tour và thanh toán",
  },
  "voucher-promotion": {
    name: "Mã giảm giá & khuyến mãi",
    icon: "🎟",
    description: "Cách sử dụng và nhận voucher",
  },
  "refund-cancel": {
    name: "Hoàn tiền & hủy tour",
    icon: "💰",
    description: "Chính sách hoàn tiền và hủy đặt",
  },
  "account-security": {
    name: "Tài khoản & bảo mật",
    icon: "👤",
    description: "Quản lý tài khoản và bảo mật",
  },
  "guide-agency": {
    name: "Hướng dẫn viên / Agency",
    icon: "🧳",
    description: "Dành cho đối tác hướng dẫn",
  },
  "contact-report": {
    name: "Liên hệ / Báo lỗi",
    icon: "⚙️",
    description: "Liên hệ hỗ trợ và báo lỗi",
  },
};

// Get all categories with article count
exports.getCategories = async (req, res) => {
  try {
    const categoriesWithCount = await Promise.all(
      Object.entries(CATEGORIES).map(async ([slug, info]) => {
        const count = await HelpArticle.countDocuments({
          category: slug,
          status: "published",
        });
        return {
          slug,
          ...info,
          articleCount: count,
        };
      })
    );

    res.json({
      success: true,
      data: categoriesWithCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get articles by category
exports.getArticlesByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    if (!CATEGORIES[category]) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const articles = await HelpArticle.find({
      category,
      status: "published",
    })
      .select("title slug excerpt icon views helpfulCount notHelpfulCount")
      .sort({ order: 1, createdAt: -1 });

    res.json({
      success: true,
      category: {
        slug: category,
        ...CATEGORIES[category],
      },
      data: articles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single article
exports.getArticle = async (req, res) => {
  try {
    const { slug } = req.params;

    const article = await HelpArticle.findOne({
      slug,
      status: "published",
    }).populate("relatedArticles", "title slug excerpt icon");

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // Increment view count
    article.views += 1;
    await article.save();

    res.json({
      success: true,
      data: article,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Search articles
exports.searchArticles = async (req, res) => {
  try {
    const { q, category } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query too short",
      });
    }

    const filter = {
      status: "published",
      $text: { $search: q },
    };

    if (category && CATEGORIES[category]) {
      filter.category = category;
    }

    const articles = await HelpArticle.find(filter, {
      score: { $meta: "textScore" },
    })
      .select("title slug excerpt category icon")
      .sort({ score: { $meta: "textScore" } })
      .limit(10);

    res.json({
      success: true,
      query: q,
      data: articles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Submit feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { helpful, comment } = req.body;
    const userId = req.userId || req.user?.sub || req.user?._id;

    const article = await HelpArticle.findById(articleId);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // Check if user already gave feedback (prevent spam)
    if (userId) {
      const existingFeedback = await HelpFeedback.findOne({
        articleId,
        userId,
      });
      if (existingFeedback) {
        return res.status(400).json({
          success: false,
          message: "You have already submitted feedback for this article",
        });
      }
    }

    // Save feedback
    const feedback = new HelpFeedback({
      articleId,
      userId,
      helpful,
      comment,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });
    await feedback.save();

    // Update article counters
    if (helpful) {
      article.helpfulCount += 1;
    } else {
      article.notHelpfulCount += 1;
    }
    await article.save();

    res.json({
      success: true,
      message: "Thank you for your feedback!",
      data: {
        helpfulCount: article.helpfulCount,
        notHelpfulCount: article.notHelpfulCount,
        helpfulnessRate: article.helpfulnessRate,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get featured/popular articles
exports.getFeaturedArticles = async (req, res) => {
  try {
    const articles = await HelpArticle.find({
      status: "published",
      featured: true,
    })
      .select("title slug excerpt category icon views")
      .sort({ views: -1 })
      .limit(5);

    res.json({
      success: true,
      data: articles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// [ADMIN] Get all feedback (Customer Requests)
exports.getAllFeedback = async (req, res) => {
  try {
    const feedback = await HelpFeedback.find()
      .populate("articleId", "title slug category")
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// [ADMIN] Get single feedback
exports.getFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await HelpFeedback.findById(id)
      .populate("articleId", "title slug category content")
      .populate("userId", "name email phone");

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    res.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// [ADMIN] Update feedback status
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, responseMessage } = req.body;

    const feedback = await HelpFeedback.findByIdAndUpdate(
      id,
      {
        status,
        responseMessage,
        respondedAt: status === "resolved" ? new Date() : undefined,
        respondedBy: req.userId,
      },
      { new: true }
    )
      .populate("articleId", "title slug")
      .populate("userId", "name email");

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    res.json({
      success: true,
      message: "Feedback status updated",
      data: feedback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// [ADMIN] Create article
exports.createArticle = async (req, res) => {
  try {
    const article = new HelpArticle({
      ...req.body,
      createdBy: req.userId,
    });
    await article.save();

    res.status(201).json({
      success: true,
      data: article,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// [ADMIN] Update article
exports.updateArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await HelpArticle.findByIdAndUpdate(
      id,
      {
        ...req.body,
        lastUpdatedBy: req.userId,
      },
      { new: true, runValidators: true }
    );

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    res.json({
      success: true,
      data: article,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// [ADMIN] Delete article
exports.deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await HelpArticle.findByIdAndDelete(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    res.json({
      success: true,
      message: "Article deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.CATEGORIES = CATEGORIES;
