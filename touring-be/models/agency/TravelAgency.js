const mongoose = require("mongoose");
const { agencyConn } = require("../../config/db");

// Employee stats sub-schema
const EmployeeStatsSchema = new mongoose.Schema(
  {
    tours: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    currency: { type: String, default: "VND" },
  },
  { _id: false }
);

// Employee sub-schema
const EmployeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User collection
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    experienceYears: {
      type: Number,
      default: 0,
    },
    email: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    stats: {
      type: EmployeeStatsSchema,
      default: () => ({}),
    },
    languages: {
      type: [String],
      default: ["Tiếng Việt"],
    },
    specializations: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
  },
  { _id: false }
);

const TravelAgencySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    contact: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    total: {
      type: Number,
      default: null, // Tổng số tour/doanh thu/đơn hàng...
    },
    image: {
      type: String,
      trim: true, // Link ảnh Cloudinary
      default: null,
    },
    employees: {
      type: [EmployeeSchema],
      default: [],
    },
  },
  { timestamps: true, collection: "travel_agency" }
);

// Index for better query performance
TravelAgencySchema.index({ name: 1 });
TravelAgencySchema.index({ "employees.employeeId": 1 });

module.exports = agencyConn.model("TravelAgency", TravelAgencySchema);
