const mongoose = require("mongoose");

const guideNotificationSchema = new mongoose.Schema(
  {
    notificationId: { type: String, unique: true, required: true },
    type: {
      type: String,
      enum: [
        "new_request", 
        "new_tour_request",
        "new_message",
        "payment_success", 
        "booking_success",       // 🎉 Booking được xác nhận
        "tour_reminder", 
        "cancellation", 
        "review", 
        "schedule_change",
        "deposit_received",
        "price_offer",            // 💵 User đề xuất giá mới
        "request_accepted",       // ✅ User chấp nhận đề xuất
        "user_agreed",            // ✅ User đồng ý thỏa thuận
        "agreement_complete",     // 🤝 Cả 2 bên đã đồng ý
        "request_cancelled",      // ❌ User hủy yêu cầu
        "tour_completed"          // 🎉 Tour hoàn thành
      ],
      required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    tourId: String,
    relatedId: { type: mongoose.Schema.Types.ObjectId }, // For linking to TourCustomRequest or other resources
    relatedModel: { type: String }, // Model name for relatedId (e.g., 'TourCustomRequest')
    timestamp: Date,
    read: { type: Boolean, default: false },
    icon: String,
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    guideId: { type: mongoose.Schema.Types.ObjectId, ref: "Guide", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GuideNotification", guideNotificationSchema);