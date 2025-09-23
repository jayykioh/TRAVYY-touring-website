const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Fake OTP store (dùng Redis trong thực tế)
const otpStore = {};

// Register
exports.register = async (req, res) => {
    try {
        const { email, password, phone } = req.body;
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: "Email already exists" });

        const hash = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hash, phone });
        await user.save();

        res.json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid email or password" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: "Invalid email or password" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Phone OTP send
exports.phoneOtpSend = async (req, res) => {
    const { phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[phone] = otp;

    // TODO: Gửi OTP qua Twilio/Nexmo/Firebase SMS
    console.log(`OTP for ${phone}: ${otp}`);

    res.json({ message: "OTP sent successfully" });
};

// Phone OTP verify
exports.phoneOtpVerify = async (req, res) => {
    const { phone, otp } = req.body;
    if (otpStore[phone] && otpStore[phone] === otp) {
        delete otpStore[phone];
        const user = await User.findOneAndUpdate(
            { phone },
            { phoneVerified: true },
            { upsert: true, new: true }
        );
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        return res.json({ message: "Phone verified", token, user });
    }
    res.status(400).json({ message: "Invalid OTP" });
};
