const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/Users"); // mongoose model
const bcrypt = require("bcryptjs");
const { notifyRegister } = require("../controller/notifyController");
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
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        let isNewUser = false;

        if (!user) {
          user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0]?.value || "",
            role: "Traveler",
          });
          await user.save();
          isNewUser = true;
        }

        // 📨 Nếu là user mới → gửi mail chào mừng qua controller có sẵn
        if (isNewUser && user.email) {
          try {
            const fakeReq = { body: { email: user.email, fullName: user.name } };
            const fakeRes = { json: () => {}, status: () => ({ json: () => {} }) };
            await notifyRegister(fakeReq, fakeRes);
          } catch (mailErr) {
            console.error("Không gửi được email chào mừng Google:", mailErr);
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

// =========================
// Facebook Strategy (đang tắt, giữ nguyên)
// =========================
// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: process.env.FACEBOOK_APP_ID,
//       clientSecret: process.env.FACEBOOK_APP_SECRET,
//       callbackURL: process.env.FACEBOOK_CALLBACK_URL,
//       profileFields: ["id", "displayName", "emails"],
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         let user = await User.findOne({ facebookId: profile.id });

//         if (!user) {
//           user = new User({
//             facebookId: profile.id,
//             name: profile.displayName,
//             email: profile.emails?.[0]?.value || "",
//           });
//           await user.save();
//         }

//         return done(null, user);
//       } catch (err) {
//         return done(err, false);
//       }
//     }
//   )
// );

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
