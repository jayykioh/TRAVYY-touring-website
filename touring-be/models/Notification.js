// models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  // Thông tin người nhận
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: false,  // ✅ Không bắt buộc vì có thể gửi email mà chưa có user
    index: true 
  },
  recipientEmail: { 
    type: String, 
    required: true,
    index: true 
  },
  recipientName: { 
    type: String 
  },

  // Loại thông báo
  type: {
    type: String,
    enum: [
      "register", 
      "payment_success", 
      "booking_success", 
      "new_tour", 
      "general",
      "password_reset",         // 🔑 Quên mật khẩu
      "password_changed",       // 🔒 Đổi mật khẩu
      "security_alert",         // ⚠️ Cảnh báo bảo mật
      "tour_guide_accepted",    // ✅ Guide chấp nhận tour
      "tour_guide_rejected",    // ❌ Guide từ chối tour
      "deposit_paid",           // 💰 Đã đặt cọc
      "new_message",            // 💬 Tin nhắn mới
      "price_offer",            // 💵 Đề xuất giá mới
      "agreement_complete",     // 🤝 Thỏa thuận hoàn tất
      "guide_price_offer",      // 💰 Guide đề xuất giá
      "user_price_offer",       // 💰 User đề xuất giá
      "user_agreed",            // ✅ User đồng ý
      "guide_agreed",           // ✅ Guide đồng ý
      "request_cancelled",      // ❌ Yêu cầu bị hủy
      "tour_completed",         // 🎉 Tour hoàn thành
      "cancellation",           // ❌ Hủy booking
      "new_request",            // 🎯 Yêu cầu tour mới
      "new_tour_request",       // 🎯 Yêu cầu tour mới (alias)
      "request_accepted",       // ✅ Yêu cầu được chấp nhận
      "tour_reminder",          // ⏰ Nhắc nhở tour
      "schedule_change",        // 📅 Thay đổi lịch trình
      "review",                 // ⭐ Đánh giá
      "refund_processed",       // 💸 Hoàn tiền
      "payment_failed"          // ❌ Thanh toán thất bại
    ],
    required: true,
    index: true
  },

  // Nội dung thông báo
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  
  // Thông tin email (nếu có gửi email)
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSubject: { 
    type: String 
  },
  emailHtml: { 
    type: String 
  },
  emailMessageId: { 
    type: String 
  },

  // Metadata cho từng loại notification
  data: {
    // Cho payment_success
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    bookingCode: { type: String },
    amount: { type: String },
    tourTitle: { type: String },
    
    // Cho booking_success  
    tourId: { type: mongoose.Schema.Types.ObjectId, ref: "Tour" },
    
    // Cho new_tour
    tourName: { type: String },
    
    // Chung
    paymentProvider: { type: String },
    orderId: { type: String },
    
    // Thêm field tùy chỉnh
    additionalData: { type: mongoose.Schema.Types.Mixed }
  },

  // Related document (flexible reference)
  relatedId: { type: mongoose.Schema.Types.ObjectId },
  relatedModel: { type: String, enum: ['Itinerary', 'TourCustomRequest', 'Booking', 'Tour', null] },

  // Trạng thái
  status: {
    type: String,
    enum: ["pending", "sent", "read", "failed"],
    default: "pending",
    index: true
  },
  
  // Thông tin lỗi (nếu có)
  errorMessage: { 
    type: String 
  },
  
  // Thời gian
  sentAt: { 
    type: Date 
  },
  readAt: { 
    type: Date 
  },
  
}, {
  timestamps: true // Tự động tạo createdAt và updatedAt
});

// Indexes cho performance
notificationSchema.index({ userId: 1, type: 1, createdAt: -1 });
notificationSchema.index({ recipientEmail: 1, type: 1, createdAt: -1 });
notificationSchema.index({ status: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });

// Virtual để check notification đã đọc
notificationSchema.virtual('isRead').get(function() {
  return this.status === 'read' || !!this.readAt;
});

// Virtual để check notification thành công
notificationSchema.virtual('isSuccess').get(function() {
  return this.status === 'sent';
});

// Static methods
notificationSchema.statics.findByUser = function(userId, options = {}) {
  const { 
    limit = 20, 
    type = null, 
    status = null,
    unreadOnly = false 
  } = options;

  let query = { userId };
  
  if (type) query.type = type;
  if (status) query.status = status;
  if (unreadOnly) query.status = { $ne: 'read' };

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'name email')
    .populate('data.bookingId', 'bookingCode totalVND')
    .populate('data.tourId', 'title');
};

notificationSchema.statics.markAsRead = function(notificationIds, userId = null) {
  let query = { _id: { $in: notificationIds } };
  if (userId) query.userId = userId;

  return this.updateMany(query, {
    $set: { 
      status: 'read',
      readAt: new Date()
    }
  });
};

notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ 
    userId, 
    status: { $ne: 'read' }
  });
};

notificationSchema.statics.getStatsByType = function(days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: {
          type: '$type',
          status: '$status'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.type',
        stats: {
          $push: {
            status: '$_id.status',
            count: '$count'
          }
        },
        total: { $sum: '$count' }
      }
    }
  ]);
};

// Instance methods
notificationSchema.methods.markAsRead = function() {
  this.status = 'read';
  this.readAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsSent = function(messageId = null) {
  this.status = 'sent';
  this.sentAt = new Date();
  if (messageId) this.emailMessageId = messageId;
  return this.save();
};

notificationSchema.methods.markAsFailed = function(errorMessage) {
  this.status = 'failed';
  this.errorMessage = errorMessage;
  return this.save();
};

module.exports = mongoose.model("Notification", notificationSchema);