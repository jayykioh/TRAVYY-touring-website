// models/Booking.js
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tourId: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", required: true },
  bookingCode: { type: String, unique: true, required: true }, // Ví dụ: BK20251006-XYZ
  quantity: { type: Number, default: 1 },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "paid", "cancelled"],
    default: "pending",
  },
  paymentMethod: { type: String, enum: ["MoMo", "PayPal", "CreditCard"], required: true },
  qrCode: { type: String }, // link QR code
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Booking", bookingSchema);
