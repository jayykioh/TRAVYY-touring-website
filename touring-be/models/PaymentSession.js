const mongoose = require("mongoose");

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
    status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    mode: { type: String, enum: ["cart", "buy-now"], default: "cart" },
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

module.exports = mongoose.model("PaymentSession", paymentSessionSchema);
