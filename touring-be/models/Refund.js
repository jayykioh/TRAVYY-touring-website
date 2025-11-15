const mongoose = require("mongoose");

const refundSchema = new mongoose.Schema(
  {
    // ===== REFERENCE INFO =====
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    orderRef: {
      type: String, // Booking reference/order ID for display
      index: true,
    },

    // ===== REFUND TYPE =====
    refundType: {
      type: String,
      enum: ["pre_trip_cancellation", "post_trip_issue"],
      required: true,
    },

    // ===== REFUND CALCULATION =====
    originalAmount: { type: Number, required: true }, // Total amount paid
    refundableAmount: { type: Number, required: true }, // Amount to be refunded
    refundPercentage: { type: Number, required: true }, // Percentage of refund (0-100)
    processingFee: { type: Number, default: 0 }, // Any processing fees deducted
    finalRefundAmount: { type: Number, required: true }, // Actual amount refunded

    // ===== PRE-TRIP CANCELLATION DETAILS =====
    cancellationDetails: {
      tourStartDate: { type: Date }, // Tour departure date
      cancellationDate: { type: Date }, // When user requested cancellation
      daysBeforeTour: { type: Number }, // Days between cancellation and tour start
      cancellationPolicy: { type: String }, // Policy applied (e.g., "7-14 days: 50% refund")
    },

    // ===== POST-TRIP ISSUE DETAILS =====
    issueDetails: {
      completionDate: { type: Date }, // When tour was completed
      issueCategory: {
        type: String,
        enum: [
          "service_quality",
          "safety_concern",
          "itinerary_deviation",
          "guide_issue",
          "accommodation_problem",
          "transportation_issue",
          "other",
        ],
      },
      description: { type: String }, // User's description of the issue
      evidence: [
        {
          // Photos, documents, etc.
          type: { type: String }, // "image", "document"
          url: { type: String },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
      severity: {
        type: String,
        enum: ["minor", "moderate", "major", "critical"],
        default: "moderate",
      },
    },

    // ===== REQUEST INFO =====
    requestedAt: { type: Date, default: Date.now },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestNote: { type: String }, // User's note with request

    // ===== REFUND STATUS =====
    status: {
      type: String,
      enum: [
        "pending", // Awaiting admin review
        "under_review", // Admin is reviewing
        "approved", // Approved, pending processing
        "processing", // Payment is being processed
        "completed", // Refund completed
        "rejected", // Request rejected
        "cancelled", // Request cancelled by user
      ],
      default: "pending",
      index: true,
    },

    // ===== ADMIN REVIEW =====
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: { type: Date },
    reviewNote: { type: String }, // Admin's review note

    // ===== PAYMENT INFO =====
    refundMethod: {
      type: String,
      enum: ["original_payment", "bank_transfer", "wallet", "other"],
      default: "original_payment",
    },

    paymentProvider: {
      type: String,
      enum: ["paypal", "momo", "bank", "cash"],
    },

    // Bank account info for refund (user provides after approval)
    bankInfo: {
      bankName: { type: String }, // Tên ngân hàng
      accountNumber: { type: String }, // Số tài khoản
      accountName: { type: String }, // Tên chủ tài khoản
      branchName: { type: String }, // Chi nhánh (optional)
      providedAt: { type: Date }, // Thời điểm cung cấp
    },

    // Original payment reference
    originalPayment: {
      provider: { type: String },
      orderId: { type: String },
      transactionId: { type: String },
    },

    // Refund payment reference
    refundPayment: {
      transactionId: { type: String }, // Refund transaction ID
      processedAt: { type: Date },
      raw: { type: mongoose.Schema.Types.Mixed }, // Full refund response from payment gateway
    },

    // Bank transfer details (if applicable)
    bankDetails: {
      accountName: { type: String },
      accountNumber: { type: String },
      bankName: { type: String },
      branchName: { type: String },
    },

    // ===== TIMELINE =====
    timeline: [
      {
        status: { type: String },
        note: { type: String },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    // ===== METADATA =====
    currency: { type: String, default: "VND" },
    refundReference: { type: String, unique: true, sparse: true }, // Unique refund reference (REF-XXXXXX)

    // ===== PROCESSING FLAGS =====
    requiresManualProcessing: { type: Boolean, default: false }, // Flag when auto-refund fails
    processingNote: { type: String }, // Note about processing issues/status

    // ===== MANUAL PAYMENT INFO (for sandbox transfer) =====
    manualPayment: {
      orderId: { type: String }, // MoMo order ID
      payUrl: { type: String }, // MoMo payment URL
      qrCodeUrl: { type: String }, // QR code URL
      deeplink: { type: String }, // MoMo app deeplink
      deeplinkMiniApp: { type: String }, // MoMo mini app deeplink
      createdAt: { type: Date },
      completedAt: { type: Date },
    },

    // ===== TIMESTAMPS =====
    completedAt: { type: Date },
    rejectedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ===== INDEXES =====
refundSchema.index({ userId: 1, createdAt: -1 });
refundSchema.index({ status: 1, createdAt: -1 });
refundSchema.index({ refundType: 1 });
refundSchema.index({ bookingId: 1 });

// ===== METHODS =====

// Generate unique refund reference
refundSchema.methods.generateRefundReference = function () {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  this.refundReference = `REF-${timestamp}-${random}`;
  return this.refundReference;
};

// Add timeline entry
refundSchema.methods.addTimelineEntry = function (status, note, userId) {
  this.timeline.push({
    status,
    note,
    updatedBy: userId,
    timestamp: new Date(),
  });
  return this;
};

// Calculate refund based on cancellation policy
refundSchema.statics.calculatePreTripRefund = function (
  tourStartDate,
  originalAmount
) {
  const now = new Date();
  const tourDate = new Date(tourStartDate);
  const daysBeforeTour = Math.ceil((tourDate - now) / (1000 * 60 * 60 * 24));

  let refundPercentage = 0;
  let policy = "";

  if (daysBeforeTour >= 30) {
    refundPercentage = 90;
    policy = "30+ days: 90% refund";
  } else if (daysBeforeTour >= 14) {
    refundPercentage = 70;
    policy = "14-29 days: 70% refund";
  } else if (daysBeforeTour >= 7) {
    refundPercentage = 50;
    policy = "7-13 days: 50% refund";
  } else if (daysBeforeTour >= 3) {
    refundPercentage = 25;
    policy = "3-6 days: 25% refund";
  } else if (daysBeforeTour >= 1) {
    refundPercentage = 10;
    policy = "1-2 days: 10% refund";
  } else {
    refundPercentage = 0;
    policy = "Less than 1 day: No refund";
  }

  const refundableAmount = Math.round(
    originalAmount * (refundPercentage / 100)
  );
  const processingFee = Math.round(refundableAmount * 0.02); // 2% processing fee
  const finalRefundAmount = refundableAmount - processingFee;

  return {
    daysBeforeTour,
    refundPercentage,
    policy,
    refundableAmount,
    processingFee,
    finalRefundAmount,
  };
};

// Calculate post-trip refund based on issue severity
refundSchema.statics.calculatePostTripRefund = function (
  originalAmount,
  severity = "moderate"
) {
  let refundPercentage = 0;

  switch (severity) {
    case "critical":
      refundPercentage = 100; // Full refund
      break;
    case "major":
      refundPercentage = 70; // 70% refund
      break;
    case "moderate":
      refundPercentage = 40; // 40% refund
      break;
    case "minor":
      refundPercentage = 20; // 20% refund
      break;
    default:
      refundPercentage = 30;
  }

  const refundableAmount = Math.round(
    originalAmount * (refundPercentage / 100)
  );
  const processingFee = 0; // No processing fee for post-trip issues
  const finalRefundAmount = refundableAmount - processingFee;

  return {
    refundPercentage,
    refundableAmount,
    processingFee,
    finalRefundAmount,
  };
};

// Find by booking ID
refundSchema.statics.findByBookingId = function (bookingId) {
  return this.find({ bookingId }).sort({ createdAt: -1 });
};

const Refund = mongoose.model("Refund", refundSchema);

module.exports = Refund;
