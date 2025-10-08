const mongoose = require("mongoose");

const DepartureSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // ISO 'YYYY-MM-DD' (UTC, dạng String để so khớp FE/BE)
    priceAdult: { type: Number, required: true, min: 0 },
    priceChild: { type: Number, required: true, min: 0 },
    seatsTotal: { type: Number, default: null }, // optional

    seatsLeft: { type: Number, default: null }, // optional
    status: { type: String, enum: ["open", "closed", "soldout"], default: "open" },
    startTime: { type: String }, // optional: nếu mỗi ngày còn có giờ khởi hành
    endTime: { type: String }, // optional
    external: {
      provider: { type: String }, // 'XTravel', 'YHub', ...
      productId: { type: String }, // id phía agency (nếu có)
      lastSyncedAt: { type: Date },
    },
  },
  { _id: false }
);

const TourSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "VND" },

    locations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Location" }],

    duration: { days: { type: Number, required: true }, nights: { type: Number, required: true } },

    schedule: { startTime: String, endTime: String },

    itinerary: [
      { part: String, day: Number, title: String, description: [String] },
    ],

    agencyId: { type: mongoose.Schema.Types.ObjectId, ref: "TravelAgency", required: true },

    createdAt: { type: Date, default: Date.now },

    imageItems: [{ imageUrl: String }],

    // ❌ BỎ dateOptions, thay bằng departures:
    departures: { type: [DepartureSchema], default: [] },

    tags: [String],
    usageCount: { type: Number, default: 0 },

    // Nếu còn nhu cầu theo dõi chỗ ở mức tour (không khuyến nghị):
    remainingSeats: { type: Number, default: null },
  },
  { timestamps: true }
);

// Index phục vụ tra cứu nhanh theo ngày & agency
TourSchema.index({ "departures.date": 1 });
TourSchema.index({ agencyId: 1 });

module.exports = mongoose.model("Tour", TourSchema);