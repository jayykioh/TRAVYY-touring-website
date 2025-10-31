// models/HelpFeedback.js
const mongoose = require("mongoose");

const helpFeedbackSchema = new mongoose.Schema(
  {
    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HelpArticle",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
    },
    helpful: { type: Boolean, required: true },
    comment: { type: String, maxlength: 500 },
    ipAddress: String,
    userAgent: String,
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved", "closed"],
      default: "pending",
    },
    responseMessage: { type: String, maxlength: 1000 },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    respondedAt: Date,
  },
  { timestamps: true }
);

helpFeedbackSchema.index({ articleId: 1, userId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("HelpFeedback", helpFeedbackSchema);
