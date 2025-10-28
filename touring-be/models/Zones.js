const mongoose = require("mongoose");

const zoneSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    province: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
    },

    center: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    radiusM: {
      type: Number,
      default: 1500, // 1.5km
      min: 100,
    },
    polygon: {
      type: Object,
      default: null,
    },
    /* ========== SEMANTIC TAGS ========== */
    tags: {
      type: [String],
      default: [], // hard vibes
    },
    vibeKeywords: {
      type: [String],
      default: [], // soft match
    },
    avoidTags: {
      type: [String],
      default: [],
    },
    avoidKeywords: {
      type: [String],
      default: [],
    },

    /* ========== DESCRIPTION & INFO ========== */
    desc: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    whyChoose: {
      type: [String],
      default: [],
    },
    funActivities: {
      type: [String],
      default: [],
    },
    mustSee: {
      type: [String],
      default: [],
    },
    bestTime: {
      type: String,
      enum: ["morning", "afternoon", "evening", "night", "anytime"],
      default: "anytime",
    },
    tips: {
      type: [String],
      default: [],
    },
    donts: {
      type: [String],
      default: [],
    },

    /* ========== MEDIA ========== */
    heroImg: {
      type: String,
      trim: true,
    },
    gallery: {
      type: [String],
      default: [],
    },

    /* ========== SYSTEM META ========== */
    scorePriority: {
      type: Number,
      default: 0.5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

// Index for faster zone lookup by province or tag
zoneSchema.index({ province: 1, tags: 1 });

const Zone = mongoose.model("Zone", zoneSchema);
module.exports = Zone;
