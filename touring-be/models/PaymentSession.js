const mongoose = require("mongoose");
// Use the explicit main connection so the model is created on the intended DB
const { mainConn } = require("../config/db");

const paymentItemSchema = new mongoose.Schema(
  {
    name: String,
    price: Number,
    originalPrice: Number,
    tourId: { type: mongoose.Schema.Types.ObjectId, ref: "Tour" },
    meta: Object, // optional snapshot (date, pax, etc.)
  },
  { _id: false }
);

const paymentSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    provider: { type: String, default: "momo", enum: ["momo", "paypal"] },
    orderId: { type: String, unique: true, required: true },
    requestId: { type: String, required: true },
    amount: { type: Number, required: true },
  // Session lifecycle: pending -> paid | failed. Allow 'expired' for timeouts.
  status: { type: String, enum: ["pending", "paid", "failed","cancelled", "expired"], default: "pending" },
  // mode indicates the origin of the payment intent. Allow 'retry-payment'
  // for retrying previously failed payments (frontend may pass this value).
  mode: { type: String, enum: ["cart", "buy-now", "retry-payment"], default: "cart" },
    items: [paymentItemSchema],
    voucherCode: String, // Promotion/voucher code used
    discountAmount: { type: Number, default: 0 }, // Discount amount applied
    rawCreateResponse: Object,
    paidAt: Date,
    transId: String,
    payType: String,
    message: String,
    resultCode: String,
  },
  { timestamps: true }
);

// Prefer registering the model on the explicit main connection to ensure
// PaymentSession documents are written to the main DB (MONGO_URI).
// Fall back to default mongoose model if mainConn is not available.
try {
  module.exports = (mainConn && mainConn.models && mainConn.models.PaymentSession)
    ? mainConn.models.PaymentSession
    : mainConn.model("PaymentSession", paymentSessionSchema);
} catch (e) {
  // If something goes wrong (e.g., mainConn undefined), fallback to default
  module.exports = mongoose.models.PaymentSession || mongoose.model("PaymentSession", paymentSessionSchema);
}
