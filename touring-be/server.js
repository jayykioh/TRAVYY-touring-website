const path = require("path");
// Load .env explicitly relative to this file to avoid CWD issues
require("dotenv").config({ path: path.join(__dirname, ".env") });
const PORT = process.env.PORT || 4000;
const express = require("express");
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
const app = express();
const isProd = process.env.NODE_ENV === "production";
const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  "mongodb://127.0.0.1:27017/travelApp";
const notifyRoutes = require("./routes/notifyRoutes");
const paymentRoutes = require("./routes/payment.routes");
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

// --- Core middlewares ---
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(morgan(isProd ? "combined" : "dev"));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // KHÔNG được để "*"
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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
app.use("/api/admin", adminRoutes); // Updated to use modular admin routes
app.use("/api/payments", paymentRoutes);
const securityRoutes = require("./routes/security.routes");
app.use("/api/security", securityRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/notify", notifyRoutes);



// --- Healthcheck ---
app.get("/healthz", (_req, res) => res.json({ ok: true }));
app.use("/api/paypal", paypalRoutes);

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

// --- Connect Mongo + Start server ---
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () =>
      console.log(`🚀 API listening on http://localhost:${PORT}`)
    );
  })
  .catch((e) => {
    console.error("❌ Mongo connect error:", e);
    process.exit(1);
  });


module.exports = app;

// ✅ Check services on startup
const { health, isAvailable } = require('./services/ai/libs/embedding-client');

async function checkServices() {
  console.log('\n🔍 Checking services...');
  
  // MongoDB
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB failed:', error.message);
    process.exit(1);
  }
  
  // Embedding service
  try {
    const available = await isAvailable();
    if (available) {
      const healthData = await health();
      console.log('✅ Embedding service OK:', {
        model: healthData.model,
        vectors: healthData.vectors,
        url: process.env.EMBED_SERVICE_URL || 'http://localhost:8088'
      });
    } else {
      console.warn('⚠️ Embedding service not available');
      console.warn('   URL:', process.env.EMBED_SERVICE_URL || 'http://localhost:8088');
      console.warn('   Will use keyword fallback for zone matching');
    }
  } catch (error) {
    console.warn('⚠️ Embedding check failed:', error.message);
  }
}

checkServices().then(() => {
  // Routes
  app.use('/api/auth', require('./routes/auth.routes'));
  app.use('/api/discover', require('./routes/discover.routes'));
  app.use('/api/zones', require('./routes/zone.routes'));
  app.use('/api/itinerary', require('./routes/itinerary.routes'));

  // Health endpoint
  app.get('/api/health', async (req, res) => {
    const embedHealth = await health();
    res.json({
      backend: 'ok',
      mongo: mongoose.connection.readyState === 1 ? 'ok' : 'error',
      embedding: embedHealth
    });
  });
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`\n🚀 Backend running on port ${PORT}`);
  });
});
