// models/Zones.js
const mongoose = require("mongoose");

const zoneSchema = new mongoose.Schema(
  {
    /** ===== IDENTIFIERS ===== **/
    id: { type: String, required: true, unique: true, index: true, trim: true },
    province: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true },

    /** ===== LOCATION ===== **/
    center: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    radiusM: { type: Number, default: 1500, min: 100 },

    /**
     * ✅ polygon chuẩn cho FE
     * Cấu trúc: [[lat, lng], [lat, lng], ...]
     */
    poly: {
      type: [[Number]],
      default: null,
      validate: {
        validator: function (arr) {
          if (!arr) return true;
          if (!Array.isArray(arr) || arr.length < 3) return false;
          return arr.every(
            (p) =>
              Array.isArray(p) &&
              p.length === 2 &&
              typeof p[0] === "number" &&
              typeof p[1] === "number"
          );
        },
        message: "poly must be [[lat, lng], ...] with at least 3 points",
      },
    },

    /**
     * ✅ GeoJSON version cho query không gian (optional)
     * Cấu trúc: { type: 'Polygon', coordinates: [[[lng, lat], ...]] }
     */
    geometry: {
      type: {
        type: String,
        enum: ["Polygon"],
        default: "Polygon",
      },
      coordinates: {
        type: [[[Number]]], // [[[lng, lat], ...]]
        default: undefined,
      },
    },

  /** ===== SEMANTIC TAGS ===== **/
  tags: { type: [String], default: [] },
  vibeKeywords: { type: [String], default: [] },
  avoidTags: { type: [String], default: [] },
  avoidKeywords: { type: [String], default: [] },

  /** ===== USER MATCH METADATA ===== **/
  pace: { type: String, enum: ["light", "medium", "intense"], default: null },
  durationDays: { type: Number, min: 1, max: 30, default: null },
  budget: { type: String, enum: ["budget", "mid", "luxury"], default: null },
  groupType: { type: String, enum: ["solo", "couple", "family", "friends"], default: null },

    /** ===== DESCRIPTION ===== **/
    desc: { type: String, trim: true, maxlength: 1000 },
    whyChoose: { type: [String], default: [] },
    funActivities: { type: [String], default: [] },
    mustSee: { type: [String], default: [] },
    bestTime: {
      type: String,
      enum: ["morning", "afternoon", "evening", "night", "anytime"],
      default: "anytime",
    },
    tips: { type: [String], default: [] },
    donts: { type: [String], default: [] },

    /** ===== MEDIA ===== **/
    heroImg: { type: String, trim: true },
    gallery: { type: [String], default: [] },

    /** ===== SYSTEM META ===== **/
    scorePriority: { type: Number, default: 0.5 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ✅ Virtual cho FE hiển thị polygon
zoneSchema.virtual("polyComputed").get(function () {
  if (Array.isArray(this.poly) && this.poly.length >= 3) return this.poly;

  const g = this.geometry;
  if (g?.type === "Polygon" && Array.isArray(g.coordinates?.[0])) {
    return g.coordinates[0].map(([lng, lat]) => [lat, lng]);
  }
  return null;
});

// ✅ Geo index cho truy vấn không gian
zoneSchema.index({ geometry: "2dsphere" });
zoneSchema.index({ province: 1, tags: 1 });

const Zone = mongoose.model("Zone", zoneSchema);
module.exports = Zone;
