const mongoose = require("mongoose");

const TourSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "VND" },

    locations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
      },
    ],

    duration: {
      days: { type: Number, required: true },
      nights: { type: Number, required: true },
    },

    schedule: {
      startTime: String,
      endTime: String,
    },

    itinerary: [
      {
        part: { type: String },
        day: { type: Number },
        title: { type: String },
        description: [String],
      },
    ],

    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TravelAgency",
      required: true,
    },

    createdAt: { type: Date, default: Date.now },

    imageItems: [
      {
        imageUrl: String,
      },
    ],

    dateOptions: {
      isFlexible: { type: Boolean, default: false },
      availableDates: [Date],
    },

    tags: [String], // Ví dụ: ["Must Try", "Best Seller"]

    usageCount: { type: Number, default: 0 },
    remainingSeats: { type: Number, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tour", TourSchema);

