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
 * Confirm and enable 2FA - Generate QR code after email confirmation
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

    // Generate secret for TOTP
    const secret = speakeasy.generateSecret({
      name: `TRAVYY (${user.email})`,
      issuer: "TRAVYY Touring",
    });

    // Save secret temporarily (will be confirmed with verify step)
    user.twoFactorSecret = secret.base32;
    user.twoFactorConfirmToken = undefined;
    user.twoFactorConfirmExpires = undefined;
    await user.save();

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      userId: user._id.toString(), // Thêm userId để frontend có thể verify
      secret: secret.base32,
      qrCode: qrCodeUrl,
      message:
        "Quét mã QR bằng ứng dụng Authenticator (Google Authenticator, Authy, etc.)",
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
    const { token } = req.body;

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

    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({
        error: "2FA_NOT_SETUP",
        message: "Vui lòng thiết lập 2FA trước",
      });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: token,
      window: 2, // Allow 2 time steps before/after
    });

    if (!verified) {
      return res.status(400).json({
        error: "INVALID_TOKEN",
        message: "Mã xác thực không đúng",
      });
    }

    // Activate 2FA
    user.twoFactorEnabled = true;
    await user.save();

    // Send confirmation email
    try {
      await sendMail(
        user.email,
        "🔐 2FA đã được bật",
        `
          <h2>Xác thực hai yếu tố đã được kích hoạt</h2>
          <p>Xin chào ${user.name || user.email},</p>
          <p>2FA đã được bật thành công cho tài khoản của bạn.</p>
          <p>Từ giờ, bạn sẽ cần nhập mã xác thực từ ứng dụng Authenticator khi đăng nhập.</p>
          <p>Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ hỗ trợ ngay lập tức.</p>
        `
      );
    } catch (emailError) {
      console.error("📧 Email notification failed:", emailError);
    }

    res.json({
      success: true,
      message: "2FA đã được bật thành công",
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

/**
 * Request to toggle Email Verification - Send confirmation email first
 */
exports.requestEmailVerificationToggle = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id;
    const { enabled } = req.body;

    if (typeof enabled !== "boolean") {
      return res.status(400).json({
        error: "INVALID_INPUT",
        message: "enabled phải là boolean",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "USER_NOT_FOUND" });
    }

    // Generate confirmation token (valid for 15 minutes)
    const confirmToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationConfirmToken = confirmToken;
    user.emailVerificationConfirmExpires = new Date(
      Date.now() + 15 * 60 * 1000
    );
    user.emailVerificationPendingState = enabled;
    await user.save();

    // Send confirmation email
    const confirmUrl = `${
      process.env.CLIENT_ORIGIN || "http://localhost:5173"
    }/confirm-email-verification?token=${confirmToken}`;

    await sendMail(
      user.email,
      enabled
        ? "✉️ Xác nhận bật Email Verification"
        : "⚠️ Xác nhận tắt Email Verification",
      `
        <h2>Yêu cầu ${enabled ? "bật" : "tắt"} Xác thực Email</h2>
        <p>Xin chào ${user.name || user.email},</p>
        <p>Bạn đã yêu cầu <strong>${
          enabled ? "BẬT" : "TẮT"
        }</strong> Xác thực Email cho tài khoản TRAVYY.</p>
        ${
          enabled
            ? "<p>Khi bật, bạn sẽ cần nhập mã xác thực từ email mỗi lần đăng nhập.</p>"
            : "<p>Khi tắt, bạn không còn cần mã xác thực email khi đăng nhập.</p>"
        }
        <p>Nếu đây là bạn, vui lòng click vào nút bên dưới để xác nhận:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmUrl}" 
             style="background: #007980; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            ✅ Xác nhận thay đổi
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
    console.error("❌ Request email verification toggle error:", error);
    res.status(500).json({
      error: "REQUEST_FAILED",
      message: error.message,
    });
  }
};

/**
 * Confirm and toggle Email Verification after email confirmation
 */
exports.toggleEmailVerification = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: "MISSING_TOKEN",
        message: "Thiếu token xác nhận",
      });
    }

    const user = await User.findOne({
      emailVerificationConfirmToken: token,
      emailVerificationConfirmExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        error: "INVALID_TOKEN",
        message: "Link xác nhận không hợp lệ hoặc đã hết hạn",
      });
    }

    const enabled = user.emailVerificationPendingState;
    user.emailVerificationEnabled = enabled;
    user.emailVerificationConfirmToken = undefined;
    user.emailVerificationConfirmExpires = undefined;
    user.emailVerificationPendingState = undefined;
    await user.save();

    // Send success notification email
    await sendMail(
      user.email,
      enabled
        ? "✅ Xác thực Email đã được bật"
        : "⚠️ Xác thực Email đã được tắt",
      `
        <h2>Cài đặt bảo mật đã được cập nhật</h2>
        <p>Xin chào ${user.name || user.email},</p>
        <p>Xác thực Email đã được <strong>${
          enabled ? "BẬT" : "TẮT"
        }</strong> thành công.</p>
        ${
          enabled
            ? "<p>Từ giờ, bạn sẽ cần nhập mã xác thực từ email khi đăng nhập.</p>"
            : "<p>Bạn không còn cần mã xác thực email khi đăng nhập.</p>"
        }
        <p>Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ hỗ trợ ngay.</p>
      `
    );

    res.json({
      success: true,
      emailVerificationEnabled: enabled,
      message: enabled
        ? "Xác thực email đã được bật"
        : "Xác thực email đã được tắt",
    });
  } catch (error) {
    console.error("❌ Toggle email verification error:", error);
    res.status(500).json({
      error: "TOGGLE_FAILED",
      message: error.message,
    });
  }
};

/**
 * Send verification code to email
 */
exports.sendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "MISSING_EMAIL",
        message: "Vui lòng cung cấp email",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        error: "USER_NOT_FOUND",
        message: "Email không tồn tại",
      });
    }

    if (!user.emailVerificationEnabled) {
      return res.status(400).json({
        error: "VERIFICATION_NOT_ENABLED",
        message: "Xác thực email chưa được bật",
      });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Save code with 10 minutes expiry
    user.emailVerificationCode = code;
    user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send email
    await sendMail(
      user.email,
      "🔐 Mã xác thực đăng nhập TRAVYY",
      `
        <h2>Mã xác thực của bạn</h2>
        <p>Xin chào ${user.name || user.email},</p>
        <p>Mã xác thực đăng nhập của bạn là:</p>
        <h1 style="font-size: 32px; letter-spacing: 8px; color: #007980; text-align: center; padding: 20px; background: #f0f0f0; border-radius: 8px;">
          ${code}
        </h1>
        <p>Mã này có hiệu lực trong <strong>10 phút</strong>.</p>
        <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
      `
    );

    res.json({
      success: true,
      message: "Mã xác thực đã được gửi đến email của bạn",
    });
  } catch (error) {
    console.error("❌ Send verification code error:", error);
    res.status(500).json({
      error: "SEND_CODE_FAILED",
      message: error.message,
    });
  }
};

/**
 * Verify email code
 */
exports.verifyEmailCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        error: "MISSING_FIELDS",
        message: "Vui lòng cung cấp email và mã xác thực",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        error: "USER_NOT_FOUND",
        message: "Email không tồn tại",
      });
    }

    if (!user.emailVerificationCode) {
      return res.status(400).json({
        error: "NO_CODE",
        message: "Chưa có mã xác thực. Vui lòng yêu cầu gửi mã mới",
      });
    }

    if (new Date() > user.emailVerificationExpires) {
      return res.status(400).json({
        error: "CODE_EXPIRED",
        message: "Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới",
      });
    }

    if (user.emailVerificationCode !== code) {
      return res.status(400).json({
        error: "INVALID_CODE",
        message: "Mã xác thực không đúng",
      });
    }

    // Clear verification code after success
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Xác thực thành công",
    });
  } catch (error) {
    console.error("❌ Verify email code error:", error);
    res.status(500).json({
      error: "VERIFY_CODE_FAILED",
      message: error.message,
    });
  }
};

/**
 * Get security settings
 */
exports.getSecuritySettings = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id;
    const user = await User.findById(userId).select(
      "twoFactorEnabled emailVerificationEnabled"
    );

    if (!user) {
      return res.status(404).json({ error: "USER_NOT_FOUND" });
    }

    res.json({
      twoFactorEnabled: user.twoFactorEnabled || false,
      emailVerificationEnabled: user.emailVerificationEnabled || false,
    });
  } catch (error) {
    console.error("❌ Get security settings error:", error);
    res.status(500).json({
      error: "FETCH_FAILED",
      message: error.message,
    });
  }
};
