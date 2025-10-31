// models/HelpArticle.js
const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    icon: { type: String, default: "📄" },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HelpCategory",
      required: true,
    },
    isFeatured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    relatedArticles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HelpArticle",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual fields cho feedback
articleSchema.virtual("helpfulCount", {
  ref: "HelpFeedback",
  localField: "_id",
  foreignField: "articleId",
  count: true,
  match: { helpful: true },
});

articleSchema.virtual("notHelpfulCount", {
  ref: "HelpFeedback",
  localField: "_id",
  foreignField: "articleId",
  count: true,
  match: { helpful: false },
});

// Text index phục vụ tìm kiếm
articleSchema.index({
  title: "text",
  excerpt: "text",
  content: "text",
});

module.exports = mongoose.model("HelpArticle", articleSchema, "helparticles");
