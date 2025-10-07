import mongoose from "mongoose";
import dotenv from "dotenv";
import Location from "./models/Location.js";
import Tour from "./models/Tours.js";
import { mockLocations } from "./data/mockLocations.js";
import { mockTours } from "./data/mockTours.js";

dotenv.config();

// 🧩 Hàm chuẩn hóa dữ liệu trước khi insert
const normalizeData = (data) =>
  data.map((item) => {
    const clean = { ...item };

    // Xử lý _id
    if (clean._id?.$oid) clean._id = clean._id.$oid;

    // Xử lý createdAt / updatedAt
    if (clean.createdAt?.$date)
      clean.createdAt = new Date(clean.createdAt.$date);
    if (clean.updatedAt?.$date)
      clean.updatedAt = new Date(clean.updatedAt.$date);

    // Xử lý locations (có thể là object hoặc mảng)
    if (clean.locations?.$oid) clean.locations = clean.locations.$oid;
    if (Array.isArray(clean.locations))
      clean.locations = clean.locations.map((l) => (l.$oid ? l.$oid : l));

    // Xử lý agencyId
    if (clean.agencyId?.$oid) clean.agencyId = clean.agencyId.$oid;

    return clean;
  });

async function seedData() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected!");

    // Xóa dữ liệu cũ
    await Location.deleteMany({});
    await Tour.deleteMany({});
    console.log("🧹 Old data cleared");

    // Chuẩn hóa dữ liệu
    const cleanLocations = normalizeData(mockLocations);
    const cleanTours = normalizeData(mockTours);

    // Insert dữ liệu mới
    await Location.insertMany(cleanLocations);
    await Tour.insertMany(cleanTours);

    console.log("🌱 Seed thành công: Locations + Tours");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed lỗi:", err);
    process.exit(1);
  }
}

seedData();
