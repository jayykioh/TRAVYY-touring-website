const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    banner: { type: String },
    description: { type: String },
    region: { type: String },

    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String },
    },

    activities: [
      {
        name: { type: String },
      },
    ],

    sightseeing: [
      {
        name: { type: String },
      },
    ],

    transport: [
      {
        name: { type: String },
      },
    ],

    hotels: [
      {
        name: { type: String },
        price: { type: String },
      },
    ],

    quickInfo: {
      weather: { type: String },
      bestSeason: { type: String },
      duration: { type: String },
      language: { type: String },
      distance: { type: String },
    },

    faq: [
      {
        q: { type: String },
        a: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", BlogSchema, "blogs");
