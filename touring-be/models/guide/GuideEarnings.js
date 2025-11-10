const mongoose = require("mongoose");

const weeklyDataSchema = new mongoose.Schema(
  {
    day: String,
    amount: Number,
  },
  { _id: false }
);

const recentPaymentSchema = new mongoose.Schema(
  {
    paymentId: String,
    tourId: String,
    tourName: String,
    date: Date,
    amount: Number,
    commission: Number,
    netAmount: Number,
    status: { type: String, enum: ["paid", "pending"], default: "pending" },
    paidAt: Date,
    expectedPayout: Date,
  },
  { _id: false }
);

const monthlyStatsSchema = new mongoose.Schema(
  {
    month: String,
    earnings: Number,
  },
  { _id: false }
);

const guideEarningsSchema = new mongoose.Schema(
  {
    guideId: { type: mongoose.Schema.Types.ObjectId, ref: "Guide", required: true },
    summary: {
      thisWeek: { type: Number, default: 0 },
      thisMonth: { type: Number, default: 0 },
      lastMonth: { type: Number, default: 0 },
      totalEarnings: { type: Number, default: 0 },
      pendingPayment: { type: Number, default: 0 },
    },
    weeklyData: [weeklyDataSchema],
    recentPayments: [recentPaymentSchema],
    monthlyStats: [monthlyStatsSchema],
    yearlyStats: [monthlyStatsSchema], // Reuse the same schema
  },
  { timestamps: true }
);

module.exports = mongoose.model("GuideEarnings", guideEarningsSchema);