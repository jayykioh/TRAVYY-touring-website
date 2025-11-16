// models/Review.js
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  // Thông tin cơ bản
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true,
    index: true 
  },
  
  // 🔄 Hỗ trợ cả tour có sẵn và custom tour
  reviewType: {
    type: String,
    enum: ['regular_tour', 'custom_tour'],
    required: true,
    default: 'regular_tour',
    index: true
  },
  
  // Tour có sẵn (regular tour)
  tourId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Tour",
    index: true 
  },
  
  // Custom tour request
  customTourRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TourCustomRequest",
    index: true
  },
  
  // Guide (cho custom tour)
  guideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Guide",
    index: true
  },
  
  bookingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Booking",
    required: true,
    index: true 
  },

  // Đánh giá
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'Rating phải là số nguyên từ 1 đến 5'
    }
  },
  
  // Nội dung đánh giá
  title: {
    type: String,
    required: true,
    maxlength: 200,
    trim: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000,
    trim: true
  },

  // Đánh giá chi tiết (optional)
  detailedRatings: {
    service: { type: Number, min: 1, max: 5 }, // Chất lượng dịch vụ
    location: { type: Number, min: 1, max: 5 }, // Điểm đến
    guide: { type: Number, min: 1, max: 5 }, // Hướng dẫn viên
    valueForMoney: { type: Number, min: 1, max: 5 }, // Giá trị tiền bạc
    accommodation: { type: Number, min: 1, max: 5 }, // Chỗ ở (nếu có)
    transportation: { type: Number, min: 1, max: 5 } // Phương tiện di chuyển
  },

  // Hình ảnh đính kèm
  images: [{
    url: { type: String, required: true },
    caption: { type: String, maxlength: 500 },
    uploadedAt: { type: Date, default: Date.now }
  }],

  // Trạng thái
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "hidden"],
    default: "pending",
    index: true
  },

  // Thông tin meta
  isVerified: {
    type: Boolean,
    default: false // Verified nếu user thực sự đã đi tour
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  
  // Tương tác
  likes: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    likedAt: { type: Date, default: Date.now }
  }],
  
  // Phản hồi từ nhà cung cấp tour
  response: {
    content: { type: String, maxlength: 1000 },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    respondedAt: { type: Date }
  },

  // Thời gian
  tourDate: { 
    type: Date, 
    required: true 
  }, // Ngày đi tour
  
}, {
  timestamps: true
});

// Compound indexes
reviewSchema.index({ tourId: 1, rating: -1, createdAt: -1 });
reviewSchema.index({ guideId: 1, rating: -1, createdAt: -1 }); // For guide reviews
reviewSchema.index({ customTourRequestId: 1, createdAt: -1 }); // For custom tour reviews
reviewSchema.index({ userId: 1, createdAt: -1 });
reviewSchema.index({ tourId: 1, status: 1, createdAt: -1 });
reviewSchema.index({ guideId: 1, status: 1, createdAt: -1 }); // For approved guide reviews
reviewSchema.index({ rating: 1, createdAt: -1 });
reviewSchema.index({ reviewType: 1, status: 1, createdAt: -1 }); // Filter by review type

// ✅ Unique constraint: 1 user chỉ có thể review 1 tour/custom request trong 1 booking 1 lần
reviewSchema.index({ userId: 1, tourId: 1, bookingId: 1 }, { unique: true, sparse: true });
reviewSchema.index({ userId: 1, customTourRequestId: 1, bookingId: 1 }, { unique: true, sparse: true });

// Virtual fields
reviewSchema.virtual('likesCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

reviewSchema.virtual('averageDetailedRating').get(function() {
  if (!this.detailedRatings) return null;
  
  const ratings = Object.values(this.detailedRatings).filter(r => r != null);
  if (ratings.length === 0) return null;
  
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
});

// Static methods
reviewSchema.statics.getAverageRating = function(tourId) {
  return this.aggregate([
    { 
      $match: { 
        tourId: new mongoose.Types.ObjectId(tourId), 
        status: 'approved' 
      } 
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    },
    {
      $addFields: {
        ratingCounts: {
          "1": {
            $size: {
              $filter: {
                input: '$ratingDistribution',
                cond: { $eq: ['$$this', 1] }
              }
            }
          },
          "2": {
            $size: {
              $filter: {
                input: '$ratingDistribution', 
                cond: { $eq: ['$$this', 2] }
              }
            }
          },
          "3": {
            $size: {
              $filter: {
                input: '$ratingDistribution',
                cond: { $eq: ['$$this', 3] }
              }
            }
          },
          "4": {
            $size: {
              $filter: {
                input: '$ratingDistribution',
                cond: { $eq: ['$$this', 4] }
              }
            }
          },
          "5": {
            $size: {
              $filter: {
                input: '$ratingDistribution',
                cond: { $eq: ['$$this', 5] }
              }
            }
          }
        }
      }
    }
  ]);
};

reviewSchema.statics.getTourReviews = function(tourId, options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = -1,
    rating = null,
    status = 'approved'
  } = options;

  const skip = (page - 1) * limit;
  let matchQuery = { tourId: new mongoose.Types.ObjectId(tourId) };
  
  if (status) matchQuery.status = status;
  if (rating) matchQuery.rating = rating;

  return this.find(matchQuery)
    .populate('userId', 'name avatar email')
    .populate('tourId', 'title imageItems')
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);
};

reviewSchema.statics.getUserReviews = function(userId, options = {}) {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  return this.find({ userId })
    .populate('tourId', 'title imageItems basePrice')
    .populate('guideId', 'name avatar rating location')
    .populate('customTourRequestId', 'requestNumber tourDetails')
    .populate('bookingId', 'bookingCode createdAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// 🎯 Get guide reviews - for guide profile page
reviewSchema.statics.getGuideReviews = function(guideId, options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = -1,
    rating = null,
    status = 'approved'
  } = options;

  const skip = (page - 1) * limit;
  let matchQuery = { 
    guideId: new mongoose.Types.ObjectId(guideId),
    reviewType: 'custom_tour'
  };
  
  if (status) matchQuery.status = status;
  if (rating) matchQuery.rating = rating;

  return this.find(matchQuery)
    .populate('userId', 'name avatar email')
    .populate('guideId', 'name avatar rating location')
    .populate('customTourRequestId', 'requestNumber tourDetails')
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);
};

// 🎯 Get guide average rating
reviewSchema.statics.getGuideAverageRating = function(guideId) {
  return this.aggregate([
    { 
      $match: { 
        guideId: new mongoose.Types.ObjectId(guideId),
        reviewType: 'custom_tour',
        status: 'approved' 
      } 
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    },
    {
      $addFields: {
        ratingCounts: {
          "1": {
            $size: {
              $filter: {
                input: '$ratingDistribution',
                cond: { $eq: ['$$this', 1] }
              }
            }
          },
          "2": {
            $size: {
              $filter: {
                input: '$ratingDistribution', 
                cond: { $eq: ['$$this', 2] }
              }
            }
          },
          "3": {
            $size: {
              $filter: {
                input: '$ratingDistribution',
                cond: { $eq: ['$$this', 3] }
              }
            }
          },
          "4": {
            $size: {
              $filter: {
                input: '$ratingDistribution',
                cond: { $eq: ['$$this', 4] }
              }
            }
          },
          "5": {
            $size: {
              $filter: {
                input: '$ratingDistribution',
                cond: { $eq: ['$$this', 5] }
              }
            }
          }
        }
      }
    }
  ]);
};

// Instance methods
reviewSchema.methods.addLike = function(userId) {
  if (this.likes.some(like => like.userId.toString() === userId.toString())) {
    // Remove like if already exists
    this.likes = this.likes.filter(like => like.userId.toString() !== userId.toString());
  } else {
    // Add new like
    this.likes.push({ userId });
  }
  return this.save();
};

reviewSchema.methods.addResponse = function(content, respondedBy) {
  this.response = {
    content,
    respondedBy,
    respondedAt: new Date()
  };
  return this.save();
};

reviewSchema.methods.canEdit = function(userId, timeLimit = 24 * 60 * 60 * 1000) {
  // User chỉ có thể edit trong 24h và là chủ review
  const isOwner = this.userId.toString() === userId.toString();
  const isWithinTimeLimit = Date.now() - this.createdAt.getTime() < timeLimit;
  return isOwner && isWithinTimeLimit && this.status === 'pending';
};

// Pre-save middleware
reviewSchema.pre('save', function(next) {
  // Validate: reviewType phải match với các field tương ứng
  if (this.reviewType === 'regular_tour' && !this.tourId) {
    return next(new Error('tourId is required for regular_tour review'));
  }
  
  if (this.reviewType === 'custom_tour' && (!this.customTourRequestId || !this.guideId)) {
    return next(new Error('customTourRequestId and guideId are required for custom_tour review'));
  }
  
  // Auto-approve nếu user đã verified hoặc có booking hợp lệ
  if (this.isNew && this.isVerified) {
    this.status = 'approved';
  }
  next();
});

module.exports = mongoose.model("Review", reviewSchema);