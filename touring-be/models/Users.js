const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const locationSchema = new mongoose.Schema(
  {
    provinceId: String,
    provinceName: String,
    wardId: String,
    wardName: String,
    addressLine: String,
  },
  { _id: false }
);

const avatarSchema = new mongoose.Schema(
  {
    data: Buffer,
    contentType: String,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, sparse: true },
    password: String,
    phone: { type: String, unique: true, sparse: true },
    username: String,
    name: String,
    googleId: String,
    facebookId: String,
    role: {
      type: String,
      enum: ["Traveler", "TourGuide", "TravelAgency", "Admin"],
      default: null,
    },
    avatar: avatarSchema, // 🔥 avatar lưu trong MongoDB
    location: locationSchema,
    // 🔒 Reset password fields
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    // 🔐 Two-Factor Authentication
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: String, // TOTP secret for authenticator app
    twoFactorConfirmToken: String, // Token để confirm việc bật 2FA
    twoFactorConfirmExpires: Date,
    // ✉️ Email verification
    emailVerificationEnabled: { type: Boolean, default: false },
    emailVerificationCode: String,
    emailVerificationExpires: Date,
    emailVerificationConfirmToken: String, // Token để confirm việc bật/tắt email verification
    emailVerificationConfirmExpires: Date,
    emailVerificationPendingState: Boolean, // Trạng thái pending (true/false)
    // 🎁 Track used promotions
    usedPromotions: [
      {
        promotionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Promotion",
        },
        code: String,
        usedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // 🔐 Account status management
    accountStatus: {
      type: String,
      enum: ["active", "banned", "inactive", "pending"],
      default: "active",
    },
    statusReason: String, // Lý do khóa/cấm
    statusUpdatedAt: Date,
    statusUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // Lock history: track each lock/unlock action for audit
    lockHistory: [
      {
        reason: String,
        lockedAt: Date,
        unlockedAt: Date,
        lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        unlockedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    lastLogin: Date, // Track last login time
  },
  { timestamps: true }
);

// helper: hash password
userSchema.methods.setPassword = async function (password) {
  this.password = await bcrypt.hash(password, 10);
};

userSchema.methods.validatePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
