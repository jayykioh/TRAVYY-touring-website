// =========================
// ENV + CORE IMPORTS
// =========================
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

// Initialize structured logger and route native console to it
const logger = require("./utils/logger");
try {
  const logger = require("./utils/logger");
  if (logger) {
    console.log = (...args) => logger.info(...args);
    console.info = (...args) => logger.info(...args);
    console.warn = (...args) => logger.warn(...args);
    console.error = (...args) => logger.error(...args);
    console.debug = (...args) => logger.debug(...args);
    console.trace = (...args) => logger.trace(...args);
  }
} catch (e) {
  // If logger fails to load, keep native console
}

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

// =========================
// EXPRESS + HTTP + SOCKET
// =========================
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  transports: ["websocket", "polling"],
});
global.io = io;
app.set("io", io);

// =========================
// MONGO URI
// =========================
const isProd = process.env.NODE_ENV === "production";
const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  "mongodb://127.0.0.1:27017/travelApp";

// =========================
// ROUTES - FROM BOTH FILES
// =========================
const tourRoutes = require("./routes/tour.routes");
const profileRoutes = require("./routes/profile.routes");
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin");
const blogRoutes = require("./routes/blogs");
const vnAddrRoutes = require("./middlewares/vnAddress.routes");
const cartRoutes = require("./routes/carts.routes");
const paypalRoutes = require("./routes/paypal.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const locationRoutes = require("./routes/location.routes");
const bookingRoutes = require("./routes/bookingRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const promotionRoutes = require("./routes/promotion.routes");
const refundRoutes = require("./routes/refund.routes");
const notifyRoutes = require("./routes/notifyRoutes");
const paymentRoutes = require("./routes/payment.routes");

const guideRoutes = require("./routes/guide/guide.routes");
const tourRequestRoutes = require("./routes/tourRequest.routes");
const chatRoutes = require("./routes/chat.routes");
const itineraryRoutes = require("./routes/itinerary.routes");
const discoverRoutes = require("./routes/discover.routes");
const zoneRoutes = require("./routes/zone.routes");
const locationTourRoutes = require("./routes/locationTour.routes");
const securityRoutes = require("./routes/security.routes");

// AI / TRACKING / RECOMMEND (Từ file thứ 2)
const trackRoutes = require("./routes/track.routes");
const recommendationRoutes = require("./routes/recommendations.routes");

// Passport
require("./middlewares/passport");

// Refund scheduler
const { setupRefundScheduler } = require("./utils/refundScheduler");

// PostHog weekly sync
const { startWeeklySyncCron } = require("./jobs/weeklyProfileSync");

// Embedding services
const {
  health,
  isAvailable,
} = require("./services/ai/libs/embedding-client");
const { syncZones } = require("./services/embedding-sync-zones");

// =========================
// MIDDLEWARES
// =========================
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "2mb" }));
app.use(morgan(isProd ? "combined" : "dev"));
app.use(cookieParser());
// Attach standardized response helpers
app.use(require("./middlewares/responseFormatter"));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Type", "Cross-Origin-Resource-Policy"],
  })
);

// CORP header
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

// =========================
// ROUTES (BIG LIST – GHÉP CẢ 2)
// =========================
app.use(passport.initialize());

// Core routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/refunds", refundRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/vn", vnAddrRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/notify", notifyRoutes);
// Alias: keep backwards compatibility with frontend expecting `/api/notifications`
app.use("/api/notifications", notifyRoutes);
app.use("/api/paypal", paypalRoutes);

// Discover / Zone / Itinerary
app.use("/api/discover", discoverRoutes);
app.use("/api/zones", zoneRoutes);
app.use("/api/itinerary", itineraryRoutes);
app.use("/api/location-tours", locationTourRoutes);

// Guide + Tour Requests + Chat
app.use("/api/guide", guideRoutes);
app.use("/api/tour-requests", tourRequestRoutes);
app.use("/api/chat", chatRoutes);

// AI & Tracking & Recommendations
app.use("/api/track", trackRoutes);
app.use("/api/recommendations", recommendationRoutes);

// Security
app.use("/api/security", securityRoutes);

// HEALTHCHECK
app.get("/healthz", (req, res) => res.json({ ok: true }));

// =========================
// GLOBAL ERROR HANDLER
// =========================
app.use((err, req, res, next) => {
  try {
    const logger = require('./utils/logger');
    if (logger && logger.error) logger.error('GLOBAL ERROR:', err);
  } catch (e) {}
  if (res && typeof res.sendError === 'function') {
    return res.sendError('INTERNAL_ERROR', err.message || 'Internal server error', 500);
  }
  res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
});

// =========================
// MONGO + SERVICES + SOCKET + SERVER START
// =========================
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    logger.info("✅ MongoDB connected");

    setupRefundScheduler();
    startWeeklySyncCron();

    // Embedding check
    try {
      const available = await isAvailable();
      if (available) {
        const info = await health();
        logger.info("✅ Embedding OK:", info.model);

        logger.info("🔄 Sync zones...");
        await syncZones(true);
        logger.info("✅ Zone sync complete");
      } else {
        logger.warn("⚠ Embedding service unavailable");
      }
    } catch (err) {
      logger.warn("⚠ Embedding check failed:", err.message);
    }

    // SOCKET HANDLER
    const setupSockets = require("./socket");
    setupSockets(io);

    // START SERVER
      server.listen(PORT, () => {
      logger.info(`🚀 API + Socket running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    logger.error("❌ MongoDB ERROR:", err);
    process.exit(1);
  });

module.exports = app;
