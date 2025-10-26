const mongoose = require("mongoose");
const { agencyConn } = require("../../config/db");

const LocationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    country: { type: String, default: "Vietnam" },
    region: { type: String },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    description: { type: String },
    images: [String],
  },
  { timestamps: true }
);

module.exports = agencyConn.model("Location", LocationSchema);
