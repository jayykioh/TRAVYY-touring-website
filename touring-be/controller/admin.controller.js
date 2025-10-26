// controllers/admin.controller.js
const bcrypt = require("bcryptjs");
const User = require("../models/Users");
const { signAccess, signRefresh, newId } = require("../utils/jwt");

const isProd = process.env.NODE_ENV === "production";

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ tìm theo email và role
    const admin = await User.findOne({ email, role: "Admin" });
    if (!admin) {
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền truy cập" });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res
        .status(400)
        .json({ success: false, message: "Mật khẩu không đúng" });
    }

    // tạo token + cookie
    const jti = newId();
    const refresh = signRefresh({ jti, userId: admin.id });
    res.cookie("refresh_token", refresh, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/api/admin",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const accessToken = signAccess({ id: admin.id, role: "Admin" });

    return res.json({
      success: true,
      accessToken,
      user: {
        _id: admin.id,
        email: admin.email,
        role: admin.role,
        name: admin.name,
        username: admin.username,
      },
    });
  } catch (err) {
    console.error("ADMIN_LOGIN_ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
