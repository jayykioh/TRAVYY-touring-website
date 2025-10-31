const mongoose = require("mongoose");
const { agencyConn } = require("../../config/db");

/** ===== Departure Sub-schema ===== **/
const DepartureSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // ISO 'YYYY-MM-DD'
    priceAdult: { type: Number, required: true, min: 0 },
    priceChild: { type: Number, required: true, min: 0 },
    seatsTotal: { type: Number, default: null },
    seatsLeft: { type: Number, default: null },
    status: {
      type: String,
      enum: ["open", "closed", "soldout"],
      default: "open",
    },
    startTime: { type: String },
    endTime: { type: String },
    external: {
      provider: { type: String },
      productId: { type: String },
      lastSyncedAt: { type: Date },
    },
  },
  { _id: false }
);

/** ===== Tour Schema ===== **/
const TourSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "VND" },

    /** ===== RELATIONSHIPS ===== **/
    locations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Location" }],

    // ⬇️ NEW: gắn zoneId cố định để query nhanh
      zoneIds: [
      {
        type: mongoose.Schema.Types.ObjectId, // ObjectId của Zone
        ref: "Zone",
        index: true,
      },
    ],

    duration: {
      days: { type: Number, required: true },
      nights: { type: Number, required: true },
    },

    schedule: { startTime: String, endTime: String },

    itinerary: [
      {
        part: String,
        day: Number,
        title: String,
        description: [String],
      },
    ],

    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TravelAgency",
      required: true,
    },

    createdAt: { type: Date, default: Date.now },

    imageItems: [{ imageUrl: String }],

    departures: { type: [DepartureSchema], default: [] },

    tags: [String],
    usageCount: { type: Number, default: 0 },

    // Optional UI flags
    isHidden: { type: Boolean, default: false },
    isRating: { type: Number, default: 0 },
    isReview: { type: Number, default: 0 },

    remainingSeats: { type: Number, default: null },
  },
  { timestamps: true }
);

/** ===== Indexes ===== **/
TourSchema.index({ "departures.date": 1 });
TourSchema.index({ agencyId: 1 });
   TourSchema.index({ zoneIds: 1 }); // ✅ query tours theo zone nhanh hơn

/** ===== Model registration ===== **/
const Tour = agencyConn.model("Tour", TourSchema);

// Register thêm cho populate cross-connection
mongoose.models.Tour = Tour;

module.exports = Tour;
