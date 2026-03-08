const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/Users"); // mongoose model
const bcrypt = require("bcryptjs");
const axios = require("axios");
// =========================
// Local Strategy (email + password)
// =========================
passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) return done(null, false, { message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return done(null, false, { message: "Invalid password" });

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

// =========================
// Google Strategy
// =========================
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({
            $or: [
              { googleId: profile.id },
              { email: profile.emails?.[0]?.value }
            ]
          });
          let isNewUser = false;

          if (!user) {
            // Tạo user mới
            user = new User({
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails?.[0]?.value || "",
              role: "Traveler",
            });
            await user.save();
            isNewUser = true;
            console.log(`🆕 New Google user created: ${user.email}`);
          } else if (!user.googleId) {
            // User đã tồn tại với email nhưng chưa có googleId
            user.googleId = profile.id;
            await user.save();
            console.log(`🔗 Linked existing user with Google: ${user.email}`);
          } else {
            console.log(`🔄 Existing Google user login: ${user.email}`);
          }

          // 📨 Gửi email chào mừng khi user mới
          if (isNewUser && user.email) {
            try {
              // Priority: NOTIFY_URL > API_URL > env fallback
              const baseUrl = process.env.NOTIFY_URL || process.env.API_URL || "https://api.travvytouring.page";
              await axios.post(`${baseUrl}/api/notify/register`, {
                email: user.email,
                fullName: user.name || 'Bạn'
              });
              console.log(`✅ Sent welcome email to new Google user: ${user.email}`);
            } catch (mailErr) {
              console.error("❌ Failed to send welcome email for Google signup:", mailErr.message);
              // Không block OAuth flow nếu email fail
            }
          }

          return done(null, user);
        } catch (err) {
          console.error("Google OAuth error:", err);
          return done(err, false);
        }
      }
    )
  );
} else {
  console.warn("⚠️ Google OAuth credentials missing – Google login disabled.");
}

// =========================
// Facebook Strategy
// =========================
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL,
        profileFields: ["id", "displayName", "emails"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({
            $or: [
              { facebookId: profile.id },
              { email: profile.emails?.[0]?.value }
            ]
          });
          let isNewUser = false;

          if (!user) {
            // Tạo user mới
            user = new User({
              facebookId: profile.id,
              name: profile.displayName,
              email: profile.emails?.[0]?.value || "",
              role: "Traveler",
            });
            await user.save();
            isNewUser = true;
            console.log(`🆕 New Facebook user created: ${user.email}`);
          } else if (!user.facebookId) {
            // User đã tồn tại với email nhưng chưa có facebookId
            user.facebookId = profile.id;
            await user.save();
            console.log(`🔗 Linked existing user with Facebook: ${user.email}`);
          } else {
            console.log(`🔄 Existing Facebook user login: ${user.email}`);
          }

          // 📨 Gửi email chào mừng khi user mới
          if (isNewUser && user.email) {
            try {
              await axios.post(process.env.API_URL ? `${process.env.API_URL.replace(/\/+$/, '')}/api/notify/register` : `https://api.travvytouring.page/api/notify/register`, {
                email: user.email,
                fullName: user.name || 'Bạn'
              });
              console.log(`✅ Sent welcome email to new Facebook user: ${user.email}`);
            } catch (mailErr) {
              console.error("❌ Failed to send welcome email for Facebook signup:", mailErr.message);
            }
          }

          return done(null, user);
        } catch (err) {
          console.error("Facebook OAuth error:", err);
          return done(err, false);
        }
      }
    )
  );
} else {
  console.warn("⚠️ Facebook OAuth credentials missing – Facebook login disabled.");
}

// =========================
// Serialize & Deserialize
// =========================
passport.serializeUser((user, done) => {
  done(null, user.id); // chỉ lưu id vào session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
