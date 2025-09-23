const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, sparse: true },
    password: String,
    phone: { type: String, unique: true, sparse: true },
    phoneVerified: { type: Boolean, default: false },
    name: String,
    googleId: String,
    facebookId: String
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
