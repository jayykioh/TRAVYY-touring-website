// models/HelpCategory.js
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  icon: { type: String, default: "📚" },
});

// Virtual field để đếm số lượng bài viết trong category
categorySchema.virtual("articleCount", {
  ref: "HelpArticle",
  localField: "_id",
  foreignField: "category",
  count: true,
});

categorySchema.set("toJSON", { virtuals: true });
categorySchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("HelpCategory", categorySchema, "helpcategories");
