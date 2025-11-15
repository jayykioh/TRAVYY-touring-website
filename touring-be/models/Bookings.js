// models/Booking.js
const mongoose = require("mongoose");

const bookingItemSchema = new mongoose.Schema(
  {
    tourId: { type: mongoose.Schema.Types.ObjectId, ref: "Tour" }, // Removed required for testing
    date: { type: String }, // Removed required for testing
    name: { type: String },
    image: { type: String },
    adults: { type: Number, default: 0 },
    children: { type: Number, default: 0 },
    unitPriceAdult: { type: Number, default: 0 },
    unitPriceChild: { type: Number, default: 0 },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [bookingItemSchema], // Hỗ trợ nhiều tour trong 1 booking

    // ===== PRICING INFO =====
    currency: { type: String, default: "VND", enum: ["VND", "USD"] },
    originalAmount: { type: Number, required: true }, // Tổng tiền trước giảm giá
    discountAmount: { type: Number, default: 0 }, // Số tiền được giảm
    totalAmount: { type: Number, required: true }, // Tổng sau giảm = originalAmount - discountAmount

    // Backward compatible fields
    totalVND: { type: Number }, // = totalAmount nếu currency = VND
    totalUSD: { type: Number }, // = totalAmount nếu currency = USD

    // ===== VOUCHER/PROMOTION =====
    voucherCode: { type: String }, // Mã voucher đã sử dụng
    promotionId: { type: mongoose.Schema.Types.ObjectId, ref: "Promotion" }, // ID promotion đã dùng

    // ===== PAYMENT INFO (Unified cho cả PayPal và MoMo) =====
    payment: {
      provider: {
        type: String,
        enum: ["paypal", "momo", "cash"],
        required: true,
      },

      // Order/Transaction IDs
      orderId: { type: String, required: true }, // PayPal orderID hoặc MoMo orderId
      transactionId: { type: String }, // PayPal capture ID hoặc MoMo transId
      requestId: { type: String }, // MoMo requestId (unique per request)

      // Payment status
      status: {
        type: String,
        enum: [
          "pending",
          "processing",
          "completed",
          "failed",
          "cancelled",
          "refunded",
        ],
        default: "pending",
      },

      // Amounts (trong currency của payment gateway)
      amount: { type: Number }, // Số tiền thanh toán
      currency: { type: String }, // Currency của payment (USD cho PayPal, VND cho MoMo)

      // Timestamps
      paidAt: { type: Date }, // Thời điểm thanh toán thành công
      failedAt: { type: Date }, // Thời điểm thanh toán thất bại
      expiresAt: { type: Date }, // Thời gian hết hạn (cho pending payments)

      // Gateway-specific data
      paypalData: {
        captureId: { type: String }, // PayPal capture ID
        payerId: { type: String }, // PayPal payer ID
        payerEmail: { type: String },
        raw: { type: mongoose.Schema.Types.Mixed }, // Full PayPal response
      },

      momoData: {
        partnerCode: { type: String },
        resultCode: { type: Number }, // 0 = success
        message: { type: String },
        signature: { type: String },
        raw: { type: mongoose.Schema.Types.Mixed }, // Full MoMo response
      },

      // Metadata
      ipAddress: { type: String },
      userAgent: { type: String },
    },

    // ===== BOOKING STATUS =====
    status: {
      type: String,
      enum: ["pending", "confirmed", "paid", "cancelled", "refunded"],
      default: "pending",
    },

    // ===== REFUND INFO =====
    refundStatus: {
      type: String,
      enum: ["none", "requested", "processing", "completed", "failed"],
      default: "none",
    },
    refundedAt: { type: Date }, // Thời điểm hoàn tiền thành công

    // ===== BOOKING INFO =====
    orderRef: { type: String, unique: true, sparse: true }, // Mã booking hiển thị cho user (TRAV-XXXXXX)
    qrCode: { type: String }, // Link QR code

    // ===== GUIDE ASSIGNMENT =====
    guideId: { type: mongoose.Schema.Types.ObjectId, ref: "Guide" }, // Assigned guide for regular tours
    guideAssignedAt: { type: Date }, // When guide was assigned
    tourScheduledAt: { type: Date }, // When tour is scheduled to start
    tourCompletedAt: { type: Date }, // When tour was marked as completed

    // ===== NOTES & CONTACT =====
    customerNote: { type: String }, // Ghi chú từ khách hàng
    adminNote: { type: String }, // Ghi chú nội bộ
    contactInfo: {
      email: { type: String },
      phone: { type: String },
      fullName: { type: String },
    },
  
  // ===== CUSTOM TOUR REQUEST LINK =====
  customTourRequest: {
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "TourCustomRequest" },
    guideId: { type: mongoose.Schema.Types.ObjectId, ref: "Guide" },
    itineraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Itinerary" }
  },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ===== INDEXES =====
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ "payment.orderId": 1 });
bookingSchema.index({ "payment.transactionId": 1 });
// orderRef already has unique index in schema definition
bookingSchema.index({ status: 1, createdAt: -1 });

// ===== METHODS =====

// Generate unique order reference
bookingSchema.methods.generateOrderRef = function () {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  this.orderRef = `TRAV-${timestamp}-${random}`;
  return this.orderRef;
};

// Mark as paid
bookingSchema.methods.markAsPaid = function (paymentData = {}) {
  this.status = "paid";
  this.payment.status = "completed";
  this.payment.paidAt = new Date();

  // Update provider-specific data
  if (this.payment.provider === "paypal" && paymentData.paypal) {
    this.payment.paypalData = {
      ...this.payment.paypalData,
      ...paymentData.paypal,
    };
  } else if (this.payment.provider === "momo" && paymentData.momo) {
    this.payment.momoData = {
      ...this.payment.momoData,
      ...paymentData.momo,
    };
  }

  return this;
};

// Check if payment is expired
bookingSchema.methods.isPaymentExpired = function () {
  if (!this.payment.expiresAt) return false;
  return new Date() > this.payment.expiresAt;
};

// ===== STATICS =====

// Find by order ID (works for both PayPal and MoMo)
bookingSchema.statics.findByOrderId = function (orderId) {
  return this.findOne({ "payment.orderId": orderId });
};

// Find by transaction ID
bookingSchema.statics.findByTransactionId = function (transactionId) {
  return this.findOne({ "payment.transactionId": transactionId });
};

const Booking = mongoose.model("Booking", bookingSchema);

// Register on global models cache for populate to work
mongoose.models.Booking = Booking;

module.exports = Booking;
