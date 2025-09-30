// models/Blog.js
const mongoose = require("mongoose");
const ItemSchema = new mongoose.Schema({
  name: String,
  img: String,
  price: String,
  description: String,
});

const FAQSchema = new mongoose.Schema({
  q: { type: String, required: true },
  a: { type: String, required: true },
});

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    banner: String,
    description: String,
    activities: [ItemSchema],
    sightseeing: [ItemSchema],
    transport: [ItemSchema],
    hotels: [ItemSchema],
    quickInfo: {
      weather: String,
      bestSeason: String,
      duration: String,
      language: String,
      distance: String,
    },
    location: {
      address: { type: String },
      lat: { type: Number },
      lng: { type: Number },
    },
    faq: [FAQSchema],
    published: { type: Boolean, default: true },
    tags: [String],
    region: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", BlogSchema,"blogs");
