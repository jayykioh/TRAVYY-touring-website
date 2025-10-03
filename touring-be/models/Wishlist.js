const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tourId: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", required: true },
  createdAt: { type: Date, default: Date.now },
});
wishlistSchema.index({ userId: 1, tourId: 1 }, { unique: true });
module.exports = mongoose.model("Wishlist", wishlistSchema);
