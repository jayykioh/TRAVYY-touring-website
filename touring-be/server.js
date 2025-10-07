require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const tourRoutes = require("./routes/tour.routes");
const profileRoutes = require("./routes/profile.routes");
const authRoutes = require("./routes/auth.routes");
const blogRoutes = require("./routes/blogs");
const vnAddrRoutes = require("./middlewares/vnAddress.routes");
const cartRoutes = require("./routes/carts.routes");
require("./middlewares/passport");
const wishlistRoutes = require("./routes/wishlist.routes");
const locationRoutes = require("./routes/location.routes");
const bookingRoutes = require("./routes/bookingRoutes");
const app = express();
const isProd = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 4000;

// --- Core middlewares ---
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(morgan(isProd ? "combined" : "dev"));
app.use(cookieParser());
app.use(
  cors({
    origin: isProd ? process.env.CLIENT_ORIGIN : "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

if (isProd) app.set("trust proxy", 1);

// --- Session ---
app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 60 * 60 * 24 * 7,
    }),
    cookie: {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "lax" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

// --- Routes ---
app.use("/api/vn", vnAddrRoutes);
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/profile/info", profileRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/location", locationRoutes);

// --- Healthcheck ---
app.get("/healthz", (_req, res) => res.json({ ok: true }));

// --- Global error handler ---
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    error: "INTERNAL_ERROR",
    message: err.message || "Server error",
  });
});

// --- Connect Mongo + Start server ---
mongoose
  .connect(process.env.MONGO_URI)
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
