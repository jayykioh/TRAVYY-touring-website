// controller/security.controller.js
const User = require("../models/Users");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const crypto = require("crypto");
const { sendMail } = require("../utils/emailService");

// ============================================
// 2FA (Two-Factor Authentication) with TOTP
// ============================================

/**
 * Request to enable 2FA - Send confirmation email first
 */
exports.request2FAEnable = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "USER_NOT_FOUND" });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({
        error: "2FA_ALREADY_ENABLED",
        message: "2FA đã được bật trước đó",
      });
    }

    // Generate confirmation token (valid for 15 minutes)
    const confirmToken = crypto.randomBytes(32).toString("hex");
    user.twoFactorConfirmToken = confirmToken;
    user.twoFactorConfirmExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // Send confirmation email
    const confirmUrl = `${
      process.env.CLIENT_ORIGIN || "http://localhost:5173"
    }/confirm-2fa?token=${confirmToken}`;

    await sendMail(
      user.email,
      "🔐 Xác nhận bật 2FA",
      `
        <h2>Yêu cầu bật Xác thực hai yếu tố</h2>
        <p>Xin chào ${user.name || user.email},</p>
        <p>Bạn đã yêu cầu bật 2FA cho tài khoản TRAVYY.</p>
        <p>Nếu đây là bạn, vui lòng click vào nút bên dưới để tiếp tục:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmUrl}" 
             style="background: #007980; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            ✅ Xác nhận bật 2FA
          </a>
        </div>
        <p>Hoặc copy link sau vào trình duyệt:</p>
        <p style="background: #f0f0f0; padding: 10px; border-radius: 5px; word-break: break-all;">${confirmUrl}</p>
        <p>Link này có hiệu lực trong <strong>15 phút</strong>.</p>
        <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
      `
    );

    res.json({
      success: true,
      message: "Email xác nhận đã được gửi. Vui lòng kiểm tra hộp thư của bạn.",
    });
  } catch (error) {
    console.error("❌ Request 2FA enable error:", error);
    res.status(500).json({
      error: "REQUEST_2FA_FAILED",
      message: error.message,
    });
  }
};

/**
 * Confirm and enable 2FA - Enable email-based 2FA directly
 */
exports.enable2FA = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: "MISSING_TOKEN",
        message: "Thiếu token xác nhận",
      });
    }

    const user = await User.findOne({
      twoFactorConfirmToken: token,
      twoFactorConfirmExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        error: "INVALID_TOKEN",
        message: "Link xác nhận không hợp lệ hoặc đã hết hạn",
      });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({
        error: "2FA_ALREADY_ENABLED",
        message: "2FA đã được bật trước đó",
      });
    }

    // ✅ Enable email-based 2FA directly
    user.twoFactorEnabled = true;
    user.twoFactorConfirmToken = undefined;
    user.twoFactorConfirmExpires = undefined;
    await user.save();

    // Send success notification email
    await sendMail(
      user.email,
      "✅ Xác thực 2FA đã được bật - TRAVYY",
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔐 2FA Đã Được Kích Hoạt!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
              Xin chào <strong>${user.name || user.username}</strong>,
            </p>
            
            <p style="font-size: 16px; color: #374151; margin-bottom: 30px;">
              Xác thực hai yếu tố (2FA) đã được bật thành công cho tài khoản TRAVYY của bạn.
            </p>
            
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #10b981;">
              <p style="font-size: 14px; color: #065f46; margin: 0;">
                📧 <strong>Từ giờ, mỗi lần đăng nhập</strong>, bạn sẽ nhận được mã xác thực 6 số qua email này.
              </p>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 20px;">
              Điều này giúp bảo vệ tài khoản của bạn khỏi các truy cập trái phép.
            </p>
            
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">
              Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ hỗ trợ ngay.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">
              © ${new Date().getFullYear()} TRAVYY. All rights reserved.
            </p>
          </div>
        </div>
      `
    );

    res.json({
      success: true,
      message:
        "2FA đã được bật thành công! Từ giờ bạn sẽ nhận mã xác thực qua email khi đăng nhập.",
    });
  } catch (error) {
    console.error("❌ Enable 2FA error:", error);
    res.status(500).json({
      error: "ENABLE_2FA_FAILED",
      message: error.message,
    });
  }
};

/**
 * Verify and activate 2FA
 * Can be called:
 * 1. With auth token (from Settings page after already logged in)
 * 2. Without auth (from email confirmation link, using userId in body)
 */
exports.verify2FA = async (req, res) => {
  try {
    // Try to get userId from auth token first, then from body
    const userId = req.user?.sub || req.user?._id || req.body.userId;
    const { token, isLoginFlow, rememberDevice } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: "MISSING_USER_ID",
        message: "Thiếu thông tin người dùng",
      });
    }

    if (!token) {
      return res.status(400).json({
        error: "MISSING_TOKEN",
        message: "Vui lòng nhập mã xác thực",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: "USER_NOT_FOUND",
        message: "Không tìm thấy người dùng",
      });
    }

    // ✅ LOGIN FLOW: Verify email-based OTP code
    if (isLoginFlow) {
      // Check if code exists and not expired
      if (!user.twoFactorCode || !user.twoFactorCodeExpires) {
        return res.status(400).json({
          error: "NO_CODE",
          message: "Không tìm thấy mã xác thực. Vui lòng gửi lại mã.",
        });
      }

      // Check if code expired
      if (Date.now() > user.twoFactorCodeExpires) {
        return res.status(400).json({
          error: "CODE_EXPIRED",
          message: "Mã xác thực đã hết hạn. Vui lòng gửi lại mã.",
        });
      }

      // Check if code matches
      if (user.twoFactorCode !== token) {
        return res.status(400).json({
          error: "INVALID_CODE",
          message: "Mã xác thực không đúng",
        });
      }

      // ✅ Code is valid - clear it
      user.twoFactorCode = undefined;
      user.twoFactorCodeExpires = undefined;
      await user.save();

      // Generate tokens for login
      const { signAccess, signRefresh, newId } = require("../utils/jwt");
      const crypto = require("crypto");
      const isProd = process.env.NODE_ENV === "production";

      // ✅ Generate trusted device token if user chose "Remember Me"
      let trustedDeviceToken = null;
      if (rememberDevice) {
        trustedDeviceToken = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date();

        // ⏰ For testing: 5 minutes in dev, 30 days in production
        const isDev = process.env.NODE_ENV !== "production";
        if (isDev) {
          expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5 minutes for testing
          console.log("🧪 DEV MODE: Trusted device expires in 5 minutes");
        } else {
          expiresAt.setDate(expiresAt.getDate() + 1); // 30 days in production
        }

        // Get device info from User-Agent
        const userAgent = req.headers["user-agent"] || "Unknown Device";
        const deviceName = userAgent.substring(0, 100); // Limit length

        // Add to trusted devices array
        if (!user.trustedDevices) {
          user.trustedDevices = [];
        }

        // Remove old expired devices
        user.trustedDevices = user.trustedDevices.filter(
          (d) => new Date() < d.expiresAt
        );

        // Add new trusted device
        user.trustedDevices.push({
          deviceToken: trustedDeviceToken,
          deviceName,
          createdAt: new Date(),
          expiresAt,
          lastUsed: new Date(),
        });

        await user.save();
        console.log(
          `✅ Created trusted device token for user: ${
            user.email
          } (expires: ${expiresAt.toLocaleString()})`
        );
      }

      // Clear old cookie first
      res.clearCookie("refresh_token", { path: "/api/auth" });

      const jti = newId();
      const refresh = signRefresh({ jti, userId: user.id });

      res.cookie("refresh_token", refresh, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/api/auth",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      const accessToken = signAccess({
        id: user.id,
        role: user.role || "Traveler",
      });

      return res.json({
        success: true,
        accessToken,
        trustedDeviceToken, // Return token to save in frontend
        user: {
          _id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          username: user.username || "",
          phone: user.phone || "",
          location: user.location,
        },
        message: "Đăng nhập thành công",
      });
    }

    // ✅ ENABLE 2FA FLOW: This shouldn't happen anymore since we use email-based
    // But keep for backward compatibility
    return res.status(400).json({
      error: "INVALID_FLOW",
      message: "Flow không hợp lệ",
    });
  } catch (error) {
    console.error("❌ Verify 2FA error:", error);
    res.status(500).json({
      error: "VERIFY_2FA_FAILED",
      message: error.message,
    });
  }
};

/**
 * Resend 2FA code - For login flow when user needs new code
 */
exports.resend2FACode = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: "MISSING_USER_ID",
        message: "Thiếu thông tin người dùng",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: "USER_NOT_FOUND",
        message: "Không tìm thấy người dùng",
      });
    }

    // Generate new 6-digit code
    const twoFactorCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    user.twoFactorCode = twoFactorCode;
    user.twoFactorCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send email with new code
    try {
      await sendMail(
        user.email,
        "Mã xác thực 2FA mới - TRAVYY",
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 10px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Mã 2FA mới</h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                Xin chào <strong>${user.name || user.username}</strong>,
              </p>
              
              <p style="font-size: 16px; color: #374151; margin-bottom: 30px;">
                Mã xác thực 2FA mới của bạn là:
              </p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
                <h2 style="color: #1f2937; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: monospace;">
                  ${twoFactorCode}
                </h2>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; margin-bottom: 20px;">
                ⏰ Mã này sẽ hết hạn sau <strong>10 phút</strong>
              </p>
              
              <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">
                Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                © ${new Date().getFullYear()} TRAVYY. All rights reserved.
              </p>
            </div>
          </div>
        `
      );

      res.json({
        success: true,
        message: "Mã 2FA mới đã được gửi đến email của bạn",
      });
    } catch (emailError) {
      console.error("❌ Resend 2FA code - Email error:", emailError);
      return res.status(500).json({
        error: "EMAIL_SEND_FAILED",
        message: "Không thể gửi mã xác thực. Vui lòng thử lại sau.",
      });
    }
  } catch (error) {
    console.error("❌ Resend 2FA code error:", error);
    res.status(500).json({
      error: "RESEND_FAILED",
      message: error.message,
    });
  }
};

/**
 * Disable 2FA
 */
exports.disable2FA = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        error: "MISSING_PASSWORD",
        message: "Vui lòng nhập mật khẩu để xác nhận",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "USER_NOT_FOUND" });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        error: "2FA_NOT_ENABLED",
        message: "2FA chưa được bật",
      });
    }

    // Verify password for security
    if (!user.password) {
      return res.status(400).json({
        error: "OAUTH_USER",
        message: "Tài khoản OAuth không thể tắt 2FA",
      });
    }

    const isMatch = await user.validatePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        error: "INVALID_PASSWORD",
        message: "Mật khẩu không đúng",
      });
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    // Send notification email
    try {
      await sendMail(
        user.email,
        "🔓 2FA đã được tắt",
        `
          <h2>Xác thực hai yếu tố đã được vô hiệu hóa</h2>
          <p>Xin chào ${user.name || user.email},</p>
          <p>2FA đã được tắt cho tài khoản của bạn.</p>
          <p>Nếu bạn không thực hiện thay đổi này, vui lòng bật lại 2FA và đổi mật khẩu ngay.</p>
        `
      );
    } catch (emailError) {
      console.error("📧 Email notification failed:", emailError);
    }

    res.json({
      success: true,
      message: "2FA đã được tắt",
    });
  } catch (error) {
    console.error("❌ Disable 2FA error:", error);
    res.status(500).json({
      error: "DISABLE_2FA_FAILED",
      message: error.message,
    });
  }
};

// ============================================
// Email Verification for Login
// ============================================

// ============================================
// EMAIL VERIFICATION - REMOVED
// Email verification feature has been removed
// ============================================

/**
 * Get security settings
 */
exports.getSecuritySettings = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id;
    const user = await User.findById(userId).select(
      "twoFactorEnabled emailVerificationEnabled googleId facebookId password trustedDevices"
    );

    if (!user) {
      return res.status(404).json({ error: "USER_NOT_FOUND" });
    }

    // ✅ Pure OAuth user = no password (created via OAuth only)
    // Hybrid user = has password + OAuth (linked accounts)
    const isPureOAuthUser = !user.password;

    // ✅ Format trusted devices for frontend
    const trustedDevices = (user.trustedDevices || []).map((device) => ({
      id: device._id.toString(),
      deviceName: device.deviceName,
      createdAt: device.createdAt,
      expiresAt: device.expiresAt,
      lastUsed: device.lastUsed,
      isExpired: new Date() > device.expiresAt,
    }));

    res.json({
      twoFactorEnabled: user.twoFactorEnabled || false,
      emailVerificationEnabled: user.emailVerificationEnabled || false,
      isOAuthUser: isPureOAuthUser, // Only true if user has no password
      trustedDevices, // ✅ Add trusted devices list
    });
  } catch (error) {
    console.error("❌ Get security settings error:", error);
    res.status(500).json({
      error: "FETCH_FAILED",
      message: error.message,
    });
  }
};

/**
 * Remove a specific trusted device
 */
exports.removeTrustedDevice = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id;
    const { deviceId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "USER_NOT_FOUND" });
    }

    // Remove the specific device
    const initialLength = user.trustedDevices?.length || 0;
    user.trustedDevices = (user.trustedDevices || []).filter(
      (device) => device._id.toString() !== deviceId
    );

    if (user.trustedDevices.length === initialLength) {
      return res.status(404).json({
        error: "DEVICE_NOT_FOUND",
        message: "Không tìm thấy thiết bị",
      });
    }

    await user.save();

    res.json({
      message: "Đã xóa thiết bị thành công",
      remainingDevices: user.trustedDevices.length,
    });
  } catch (error) {
    console.error("❌ Remove trusted device error:", error);
    res.status(500).json({
      error: "REMOVE_FAILED",
      message: error.message,
    });
  }
};

/**
 * Remove all trusted devices
 */
exports.removeAllTrustedDevices = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "USER_NOT_FOUND" });
    }

    const removedCount = user.trustedDevices?.length || 0;
    user.trustedDevices = [];
    await user.save();

    res.json({
      message: "Đã xóa tất cả thiết bị đã tin cậy",
      removedCount,
    });
  } catch (error) {
    console.error("❌ Remove all trusted devices error:", error);
    res.status(500).json({
      error: "REMOVE_ALL_FAILED",
      message: error.message,
    });
  }
};
