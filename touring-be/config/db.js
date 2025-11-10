const mongoose = require("mongoose");
const path = require("path");

// Ensure .env is loaded if this file is required before server bootstrap
try {
  require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
} catch {}

// Resolve URIs with sensible fallbacks for local development
const MAIN_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  "mongodb://127.0.0.1:27017/travelApp";

const AGENCY_URI =
  process.env.MONGO_URI_TRAVEL_AGENCY ||
  process.env.MONGODB_URI_AGENCY ||
  MAIN_URI.replace(/\/(\w+)(\?.*)?$/, "/TravelAgency$2");

if (typeof MAIN_URI !== "string" || !MAIN_URI) {
  throw new Error(
    "MONGO_URI is not set and no default could be resolved. Please set MONGO_URI in touring-be/.env"
  );
}

// Optional: reduce deprecation warnings
mongoose.set("strictQuery", true);

// Connect default mongoose to main DB for models that don't specify connection



const mainConn = mongoose.createConnection(MAIN_URI);
mainConn.once("open", () => console.log("✅ Connected to main DB"));

const agencyConn = mongoose.createConnection(AGENCY_URI);
agencyConn.once("open", () => console.log("✅ Connected to agency DB"));

module.exports = { mainConn, agencyConn };