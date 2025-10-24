const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const locationSchema = new mongoose.Schema({
  provinceId: String,
  provinceName: String,
  wardId: String,
  wardName: String,
  addressLine: String
}, { _id: false });

const avatarSchema = new mongoose.Schema({
  data: Buffer,
  contentType: String,
}, { _id: false });

const userSchema = new mongoose.Schema({
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
    default: null
  },
  avatar: avatarSchema, // 🔥 avatar lưu trong MongoDB
  location: locationSchema,
  // 🔒 Reset password fields
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  // 🎁 Track used promotions
  usedPromotions: [{
    promotionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Promotion'
    },
    code: String,
    usedAt: {
      type: Date,
      default: Date.now
    }
  }],
}, { timestamps: true });

// helper: hash password
userSchema.methods.setPassword = async function (password) {
  this.password = await bcrypt.hash(password, 10);
};

userSchema.methods.validatePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
