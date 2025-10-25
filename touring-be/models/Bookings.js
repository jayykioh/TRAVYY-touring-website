// models/Booking.js
const mongoose = require("mongoose");

const bookingItemSchema = new mongoose.Schema({
  tourId: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  name: { type: String },
  image: { type: String },
  adults: { type: Number, default: 0 },
  children: { type: Number, default: 0 },
  unitPriceAdult: { type: Number, default: 0 },
  unitPriceChild: { type: Number, default: 0 },
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [bookingItemSchema], // Hỗ trợ nhiều tour trong 1 booking
  currency: { type: String, default: "VND" },
  totalVND: { type: Number, required: true }, // Tổng tiền sau giảm giá
  totalUSD: { type: Number }, // Giữ lại để backward compatible
  // Thông tin voucher/promotion
  originalAmount: { type: Number }, // Tổng tiền trước giảm giá
  discountAmount: { type: Number, default: 0 }, // Số tiền được giảm
  voucherCode: { type: String }, // Mã voucher đã sử dụng
  payment: {
    provider: { type: String, enum: ["paypal", "momo"], required: true },
    orderID: { type: String },
    status: { type: String },
    raw: { type: mongoose.Schema.Types.Mixed }, // Lưu full response từ payment gateway
  },
  status: {
    type: String,
    enum: ["pending", "paid", "cancelled"],
    default: "pending",
  },
  bookingCode: { type: String, unique: true, sparse: true }, // Generate sau nếu cần
  qrCode: { type: String }, // link QR code
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);