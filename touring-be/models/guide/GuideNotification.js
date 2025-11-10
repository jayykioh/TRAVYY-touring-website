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
        "tour_reminder", 
        "cancellation", 
        "review", 
        "schedule_change",
        "deposit_received"
      ],
      required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    tourId: String,
    timestamp: Date,
    read: { type: Boolean, default: false },
    icon: String,
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    guideId: { type: mongoose.Schema.Types.ObjectId, ref: "Guide", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GuideNotification", guideNotificationSchema);