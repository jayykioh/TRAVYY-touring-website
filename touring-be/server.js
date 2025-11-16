const path = require("path");
// Load .env explicitly relative to this file to avoid CWD issues
require("dotenv").config({ path: path.join(__dirname, ".env") });
const PORT = process.env.PORT || 4000;
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const passport = require("passport");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const tourRoutes = require("./routes/tour.routes");
const profileRoutes = require("./routes/profile.routes");
const authRoutes = require("./routes/auth.routes");

// Admin Routes (modular structure)
const adminRoutes = require("./routes/admin");
const blogRoutes = require("./routes/blogs");
const vnAddrRoutes = require("./middlewares/vnAddress.routes");
const cartRoutes = require("./routes/carts.routes");
const paypalRoutes = require("./routes/paypal.routes");
require("./middlewares/passport");
const wishlistRoutes = require("./routes/wishlist.routes");
const locationRoutes = require("./routes/location.routes");
const bookingRoutes = require("./routes/bookingRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const promotionRoutes = require("./routes/promotion.routes");
const refundRoutes = require("./routes/refund.routes");
const { setupRefundScheduler } = require("./utils/refundScheduler");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // ✅ SỬA: Đồng bộ origin với Express
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  transports: ['websocket', 'polling']
});
const isProd = process.env.NODE_ENV === "production";
const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  "mongodb://127.0.0.1:27017/travelApp";
const notifyRoutes = require("./routes/notifyRoutes");
const paymentRoutes = require("./routes/payment.routes");
// Guide Routes
const guideRoutes = require("./routes/guide/guide.routes");
// Tour Request Routes
const tourRequestRoutes = require("./routes/tourRequest.routes");
// Itinerary Routes
const itineraryRoutes = require("./routes/itinerary.routes");
// Quick visibility of PayPal env presence (not actual secrets)
console.log("[Boot] PayPal env present:", {
  hasClient: !!process.env.PAYPAL_CLIENT_ID,
  hasSecret: !!(process.env.PAYPAL_SECRET || process.env.PAYPAL_CLIENT_SECRET),
  mode: process.env.PAYPAL_MODE,
});
// Deep diagnostics: list any env keys containing 'PAYPAL'
try {
  const paypalLike = Object.keys(process.env)
    .filter((k) => k.toUpperCase().includes("PAYPAL"))
    .map((k) => ({
      key: k,
      length: k.length,
      codes: k.split("").map((c) => c.charCodeAt(0)),
      valuePreview: (process.env[k] || "").slice(0, 6) + "...",
    }));
  console.log("[Boot] PayPal related raw keys:", paypalLike);
} catch (e) {
  console.warn("Diag paypal keys failed", e);
}

// --- location tour for RegionTour ---
const locationTourRoutes = require("./routes/locationTour.routes");
// --- Core middlewares ---
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(morgan(isProd ? "combined" : "dev"));
app.use(cookieParser());
app.use(
  cors({
    // ✅ SỬA: Đồng bộ origin với Socket.IO
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Type", "Cross-Origin-Resource-Policy"],
  })
);

// Add Cross-Origin-Resource-Policy header for all responses
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});
app.use("/api/location-tours", locationTourRoutes);

if (isProd) app.set("trust proxy", 1);

// --- Routes ---
app.use("/api/vn", vnAddrRoutes);
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes); // ✅ FIXED: Review routes
app.use("/api/promotions", promotionRoutes); // ✅ FIXED: Promotion routes
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/refunds", refundRoutes); // User refund routes
const securityRoutes = require("./routes/security.routes");
app.use("/api/security", securityRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/notify", notifyRoutes);
app.use("/api/notifications", notifyRoutes); // Alias for notifications
app.use("/api/paypal", paypalRoutes);

// ✅ Discovery & Zone routes (must be AFTER other routes to avoid conflicts)
app.use("/api/discover", require("./routes/discover.routes"));
app.use("/api/zones", require("./routes/zone.routes"));
app.use("/api/itinerary", require("./routes/itinerary.routes"));

// ✅ AI Recommendation Pipeline routes (NEW)
app.use("/api/track", require("./routes/track.routes"));
app.use("/api/recommendations", require("./routes/recommendations.routes"));
// profile.routes already includes /travel endpoints

app.use("/api/guide", guideRoutes);
app.use("/api/tour-requests", tourRequestRoutes);
const chatRoutes = require("./routes/chat.routes");
app.use("/api/chat", chatRoutes);

// ✅ SỬA: Xóa các route bị trùng lặp ở dưới
// app.use("/api/itinerary", itineraryRoutes); // <-- Đã đăng ký ở trên
// const discoverRoutes = require("./routes/discover.routes"); // <-- Đã đăng ký ở trên
// app.use("/api/discover", discoverRoutes); // <-- Đã đăng ký ở trên
// const zoneRoutes = require("./routes/zone.routes"); // <-- Đã đăng ký ở trên
// app.use("/api/zones", zoneRoutes); // <-- Đã đăng ký ở trên

// Guide Availability Routes
const guideAvailabilityRoutes = require("./routes/guideAvailability.routes");
app.use("/api", guideAvailabilityRoutes);

// Tour Completion Routes
const tourCompletionRoutes = require("./routes/tourCompletion.routes");
app.use("/api", tourCompletionRoutes);

// --- Healthcheck ---
app.get("/healthz", (_req, res) => res.json({ ok: true }));

// Lightweight ping to verify credentials loaded (non-sensitive)
app.get("/api/paypal/ping", (_req, res) => {
  res.json({
    ok: true,
    hasClient: !!process.env.PAYPAL_CLIENT_ID,
    hasSecret: !!(
      process.env.PAYPAL_SECRET || process.env.PAYPAL_CLIENT_SECRET
    ),
    mode: process.env.PAYPAL_MODE || "sandbox",
  });
});

// Health endpoint
app.get("/api/health", async (req, res) => {
  const { health } = require("./services/ai/libs/embedding-client");
  const embedHealth = await health();
  res.json({
    backend: "ok",
    mongo: mongoose.connection.readyState === 1 ? "ok" : "error",
    embedding: embedHealth,
  });
});

// --- Global error handler ---
app.use((err, _req, res, _next) => {
  console.error(err && err.stack ? err.stack : err);
  const payload = {
    error: "INTERNAL_ERROR",
    message: err.message || "Server error",
  };
  if (!isProd && err && err.stack) payload.stack = err.stack;
  res.status(500).json(payload);
});


// ✅ SỬA: Xóa toàn bộ khối mongoose.connect() cũ ở đây
// Khối này đã gây ra lỗi gọi .listen() lần 1
// và kết nối Mongo 2 lần.


// Make io available globally and to routes
global.io = io;
app.set('io', io);

module.exports = app;

// ✅ Check services on startup
const { health, isAvailable } = require("./services/ai/libs/embedding-client");
const { syncZones } = require("./services/embedding-sync-zones");

async function checkServices() {
  console.log("\n🔍 Checking services...");

  // MongoDB
  try {
    // ✅ SỬA: Chỉ kết nối Mongo 1 lần duy nhất ở đây
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    // ✅ SỬA: Chuyển logic khởi tạo (scheduler, cron, sockets) vào đây
    // Chỉ chạy sau khi Mongo kết nối thành công
    
    // Setup refund scheduler
    setupRefundScheduler();

    // Start weekly PostHog sync cron
    const { startWeeklySyncCron } = require("./jobs/weeklyProfileSync");
    startWeeklySyncCron();

    // Initialize WebSocket handlers and collection watchers
    const setupSockets = require('./socket');
    setupSockets(io);

  } catch (error) {
    console.error("❌ MongoDB failed:", error.message);
    process.exit(1);
  }

  // Embedding service
  try {
    const available = await isAvailable();
    if (available) {
      const healthData = await health();
      console.log("✅ Embedding service OK:", {
        model: healthData.model,
        vectors: healthData.vectors,
        url: process.env.EMBED_SERVICE_URL || "http://localhost:8088",
      });
      
      // ✅ Auto-sync zones if embedding service is available
      console.log("\n🔄 Auto-syncing zones with embedding service...");
      try {
        await syncZones(true);
        console.log("✅ Zone sync complete");
      } catch (syncError) {
        console.warn("⚠️ Zone sync failed:", syncError.message);
        console.warn("   Continuing without embedding sync...");
      }
    } else {
      console.warn("⚠️ Embedding service not available");
      console.warn(
        "   URL:",
        process.env.EMBED_SERVICE_URL || "http://localhost:8088"
      );
      console.warn("   Will use keyword fallback for zone matching");
    }
  } catch (error) {
    console.warn("⚠️ Embedding check failed:", error.message);
  }
}

checkServices().then(() => {
  // ✅ SỬA: Đổi 'app.listen' thành 'server.listen'
  // Đây là điểm khởi động DUY NHẤT của server
  server.listen(PORT, () => {
    console.log(`\n🚀 Backend (HTTP + WS) running on port ${PORT}`);
  });
});