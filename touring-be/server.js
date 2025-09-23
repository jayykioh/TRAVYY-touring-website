const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
require("dotenv").config();

const authRoutes = require("./auth/auth.routes");

// 🔥 Import cấu hình passport (GoogleStrategy, serializeUser…)
require("./auth/passport");

const app = express();
app.use(express.json());

// Session (for passport)
app.use(
  session({ secret: "secret", resave: false, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRoutes);

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.listen(5000, () =>
  console.log("Server running on http://localhost:5000")
);
