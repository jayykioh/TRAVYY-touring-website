const mongoose = require("mongoose");

const departureSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  priceAdult: Number,
  priceChild: Number,
  seatsTotal: Number,
  seatsLeft: Number,
  status: { type: String, enum: ["open", "closed"], default: "open" },
});

const TourSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    basePrice: Number,
    currency: { type: String, default: "VND" },
    duration: { days: Number, nights: Number },
    type: { type: String, enum: ["fixed", "flexible"], default: "fixed" },
    agencyId: { type: mongoose.Schema.Types.ObjectId, ref: "TravelAgency" },
    locations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Location" }],
    departures: [departureSchema],
    dateOptions: {
      isFlexible: { type: Boolean, default: false },
      availableDates: [Date],
    },
    imageItems: [{ imageUrl: String }],
    tags: [String],
    usageCount: Number,
    isRating: Number,
    isReview: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tour", TourSchema);
