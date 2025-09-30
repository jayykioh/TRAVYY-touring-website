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
const profileRoutes = require("./routes/profile.routes");
const authRoutes = require("./routes/auth.routes");
const cookieParser = require("cookie-parser");

const blogRoutes = require("./routes/blogs");

const vnAddrRoutes = require("./middlewares/vnAddress.routes");
require("./middlewares/passport");

const app = express();
const isProd = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 5000;

// --- Core middlewares --- ( cho bảo mật, logging, body parsing, v.v. )
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(morgan(isProd ? "combined" : "dev"));
app.use(cookieParser());

// --- CORS: chỉ bật ở DEV (FE chạy http://localhost:5173) ---
 app.use(cors({
 origin: isProd ? process.env.CLIENT_ORIGIN : "http://localhost:5173",
  credentials: true,
 methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
 }));

// Nếu chạy sau reverse proxy (Nginx/Traefik) thì bật (đặc biệt khi dùng cookie secure)
if (isProd) {
  app.set("trust proxy", 1);
}

// --- Session store (không dùng MemoryStore ở prod) 
app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 60 * 60 * 24 * 7, // 7 ngày
    }),
    cookie: {
      httpOnly: true,
      secure: isProd,            // Prod + HTTPS
      sameSite: isProd ? "lax" : "lax", // cùng domain: lax là hợp lý
      // Nếu sau này FE/BE KHÁC domain và vẫn muốn cookie:
      // sameSite: "none", secure: true
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

// --- Routes không cần session trước cũng OK ---
app.use("/api/vn", vnAddrRoutes);

// --- Passport session ---
app.use(passport.initialize());
app.use(passport.session());

// --- Auth routes ---
app.use("/api/auth", authRoutes);

app.use("/api/profile/info", profileRoutes);

// --- Healthcheck ---
app.get("/healthz", (_req, res) => res.json({ ok: true }));


app.use("/api/blogs", blogRoutes);



// --- Global error handler (chốt đuôi) ---
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "INTERNAL_ERROR", message: err.message || "Server error" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
  })
  .catch((e) => {
    console.error("Mongo connect error:", e);
    process.exit(1);
  });

module.exports = app;
