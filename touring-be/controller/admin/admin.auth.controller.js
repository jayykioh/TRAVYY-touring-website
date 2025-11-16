const bcrypt = require("bcryptjs");
const User = require("../../models/Users");
const { signAccess, signRefresh, newId } = require("../../utils/jwt");
const { sendMail } = require("../../utils/emailService");

const isProd = process.env.NODE_ENV === "production";

/**
 * Admin Login
 * POST /api/admin/login
 */
exports.adminLogin = async (req, res) => {
  try {
    // Accept both 'email' and 'username' fields
    const email = req.body.email || req.body.username;
    const { password } = req.body;

    // Tìm theo email và role
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

    // ============================================
    // Đăng nhập admin - không cần 2FA/Email verification
    // ============================================

    // Lưu thông tin session để tracking
    if (req.session) {
      req.session.admin = {
        id: admin.id,
        email: admin.email,
        device: getDeviceType(req.get("user-agent") || ""),
        browser: getBrowserName(req.get("user-agent") || ""),
        location: req.get("cf-ipcountry") || "Unknown", // Cloudflare country code
        ipAddress: req.ip || req.connection.remoteAddress || "Unknown",
      };
    }

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

/**
 * Helper functions to parse user agent
 */
function getDeviceType(userAgent) {
  const ua = userAgent.toLowerCase();
  if (
    ua.includes("mobile") ||
    ua.includes("android") ||
    ua.includes("iphone")
  ) {
    return "Mobile";
  }
  if (ua.includes("tablet") || ua.includes("ipad")) {
    return "Tablet";
  }
  return "Desktop";
}

function getBrowserName(userAgent) {
  const ua = userAgent.toLowerCase();
  if (ua.includes("chrome") && !ua.includes("edg")) return "Chrome";
  if (ua.includes("safari") && !ua.includes("chrome")) return "Safari";
  if (ua.includes("firefox")) return "Firefox";
  if (ua.includes("edg")) return "Edge";
  if (ua.includes("opera") || ua.includes("opr")) return "Opera";
  return "Unknown";
}

/**
 * Admin Logout (optional)
 * POST /api/admin/logout
 */
exports.adminLogout = async (req, res) => {
  try {
    res.clearCookie("refresh_token", { path: "/api/admin" });
    return res.json({
      success: true,
      message: "Đăng xuất thành công",
    });
  } catch (err) {
    console.error("ADMIN_LOGOUT_ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
