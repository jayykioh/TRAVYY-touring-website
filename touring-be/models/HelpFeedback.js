// models/HelpFeedback.js - Track user feedback on help articles
const mongoose = require("mongoose");

const helpFeedbackSchema = new mongoose.Schema(
  {
    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HelpArticle',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      sparse: true, // Allow null for anonymous users
    },
    helpful: {
      type: Boolean,
      required: true,
    },
    comment: {
      type: String,
      maxlength: 500,
    },
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true }
);

// Prevent duplicate feedback from same user on same article
helpFeedbackSchema.index({ articleId: 1, userId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("HelpFeedback", helpFeedbackSchema);
