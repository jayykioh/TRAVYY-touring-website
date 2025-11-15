const mongoose = require("mongoose");

const itineraryItemSchema = new mongoose.Schema(
  {
    title: String,
    time: String,
    description: String,
  },
  { _id: false }
);

const imageItemSchema = new mongoose.Schema(
  {
    imageUrl: String,
  },
  { _id: false }
);

const tourRequestSchema = new mongoose.Schema(
  {
    requestId: { type: String, unique: true, required: true },
    tourName: { type: String, required: true },
    customerId: String,
    customerName: String,
    customerAvatar: String,
    customerEmail: String,
    departureDate: Date,
    startTime: String,
    endTime: String,
    location: String,
    pickupPoint: String,
    numberOfGuests: Number,
    duration: String,
    totalPrice: Number,
    earnings: Number,
    requestedAt: Date,
    specialRequests: String,
    contactPhone: String,
    paymentStatus: { type: String, enum: ["pending", "paid", "refunded"], default: "pending" },
    paymentMethod: String,
    imageItems: [imageItemSchema],
    itinerary: [itineraryItemSchema],
    includedServices: [String],
    excludedServices: [String],
    guideId: { type: mongoose.Schema.Types.ObjectId, ref: "Guide" },
    status: { type: String, enum: ["pending", "accepted", "rejected", "completed"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TourRequest", tourRequestSchema);