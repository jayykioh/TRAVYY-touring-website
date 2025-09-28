const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const locationSchema = new mongoose.Schema({
  provinceId: String,
  provinceName: String,
  districtId: String,
  wardId: String,
  wardName: String,
  addressLine: String  // số nhà, tên đường (optional)
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, sparse: true },
  password: String,
  phone: { type: String, unique: true, sparse: true },
  phoneVerified: { type: Boolean, default: false },
  name: String,
  googleId: String,
  facebookId: String,
  role: { 
    type: String, 
    enum: ["Traveler", "TourGuide", "TravelAgency", "Admin"],
    default: null
  },
  location: locationSchema  
}, { timestamps: true });

// helper: hash password
userSchema.methods.setPassword = async function(password) {
  this.password = await bcrypt.hash(password, 10);
};

userSchema.methods.validatePassword = async function(password) {
  return bcrypt.compare(password, this.password);
}; 

module.exports = mongoose.model("User", userSchema);
