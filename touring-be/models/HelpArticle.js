// models/HelpArticle.js - Help Center Article Model
const mongoose = require("mongoose");

const helpArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'booking-payment',    // Đặt tour & thanh toán
        'voucher-promotion',  // Mã giảm giá & khuyến mãi
        'refund-cancel',      // Hoàn tiền & hủy tour
        'account-security',   // Tài khoản & bảo mật
        'guide-agency',       // Hướng dẫn viên / agency
        'contact-report'      // Liên hệ / Báo lỗi
      ],
    },
    icon: {
      type: String,
      default: '📄'
    },
    excerpt: {
      type: String,
      required: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
    },
    tags: [String],
    order: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
    },
    views: {
      type: Number,
      default: 0,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    notHelpfulCount: {
      type: Number,
      default: 0,
    },
    relatedArticles: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HelpArticle'
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual: helpfulness rate
helpArticleSchema.virtual('helpfulnessRate').get(function() {
  const total = this.helpfulCount + this.notHelpfulCount;
  if (total === 0) return null;
  return Math.round((this.helpfulCount / total) * 100);
});

// Index for search
helpArticleSchema.index({ title: 'text', content: 'text', tags: 'text' });
helpArticleSchema.index({ category: 1, order: 1 });
// slug already has unique index in schema definition

module.exports = mongoose.model("HelpArticle", helpArticleSchema);
