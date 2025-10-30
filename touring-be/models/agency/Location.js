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

// Register trên agencyConn (primary)
const Location = agencyConn.model("Location", LocationSchema);

// IMPORTANT: Cũng register trên default connection để populate hoạt động
mongoose.model("Location", LocationSchema);

module.exports = Location;
