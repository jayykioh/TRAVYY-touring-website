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

const guideTourSchema = new mongoose.Schema(
  {
    tourId: { type: String, unique: true, required: true },
    tourName: { type: String, required: true },
    customerId: String,
    customerName: String,
    customerAvatar: String,
    customerEmail: String,
    departureDate: Date,
    startTime: String,
    endTime: String,
    location: String,
    numberOfGuests: Number,
    duration: String,
    totalPrice: Number,
    earnings: Number,
    status: {
      type: String,
      enum: ["ongoing", "accepted", "completed", "canceled"],
      default: "accepted"
    },
    progress: Number, // For ongoing tours
    pickupPoint: String,
    specialRequests: String,
    contactPhone: String,
    paymentStatus: { type: String, enum: ["pending", "paid", "refunded"], default: "paid" },
    paymentMethod: String,
    imageItems: [imageItemSchema],
    itinerary: [itineraryItemSchema],
    includedServices: [String],
    excludedServices: [String],
    guideId: { type: mongoose.Schema.Types.ObjectId, ref: "Guide", required: true },
    // For completed tours
    completedAt: Date,
    rating: Number,
    review: String,
    // For canceled tours
    canceledAt: Date,
    cancelReason: String,
    canceledBy: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("GuideTour", guideTourSchema);