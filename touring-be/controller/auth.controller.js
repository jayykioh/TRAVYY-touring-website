// controller/auth.controller.js
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { z } = require("zod");
const User = require("../models/Users");
const { signAccess, signRefresh, newId } = require("../utils/jwt");
const axios = require("axios");
const { sendMail } = require("../utils/emailService");

const isProd = process.env.NODE_ENV === "production";

const USERNAME = /^[a-z0-9_]{3,20}$/i;
const VN_PHONE = /^(?:\+?84|0)\d{9,10}$/;
const ALLOWED_ROLES = ["Traveler", "Guide", "Agency", "Admin"];

const RegisterSchema = z.object({
  name: z.string().trim().optional().nullable().transform((v) => (v == null ? "" : v)),
  email: z.string().trim().email(),
  password: z.string().min(8),
  username: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((v) => (v == null ? "" : v))
    .refine((v) => v === "" || USERNAME.test(v), "Username 3–20 ký tự; chỉ a-z, 0-9, _"),
  phone: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((v) => (v == null ? "" : v))
    .refine((v) => v === "" || VN_PHONE.test(v), "Số điện thoại VN không hợp lệ"),
  role: z.enum(ALLOWED_ROLES).optional().default("Traveler"),
  provinceId: z.string().min(1, "Chưa chọn tỉnh/thành"),
  wardId: z.string().min(1, "Chưa chọn phường/xã"),
  addressLine: z.string().trim().optional().nullable(),
});

// Default notify endpoint for sending password-change notifications
const notifyUrl = process.env.NOTIFY_URL || process.env.API_URL || "https://api.travvytouring.page";

const normalizePhone = (p) => {
  if (!p) return "";
  let d = p.replace(/\D/g, "");
  if (d.startsWith("84") && d.length === 11) d = "0" + d.slice(2);
  return d;
};

exports.register = async (req, res) => {
  try {
    const payload = RegisterSchema.parse(req.body);

    const email = payload.email;
    const username = payload.username || "";
    const phone = normalizePhone(payload.phone);
    const role = payload.role || "Traveler";

    // Uniqueness checks
    if (await User.exists({ email })) {
      return res.status(409).json({
        error: "EMAIL_TAKEN",
        field: "email",
        message: "Email đã được sử dụng.",
      });
    }
    if (username && (await User.exists({ username }))) {
      return res.status(409).json({
        error: "USERNAME_TAKEN",
        field: "username",
        message: "Username đã được sử dụng.",
      });
    }
    if (phone && (await User.exists({ phone }))) {
      return res.status(409).json({
        error: "PHONE_TAKEN",
        field: "phone",
        message: "Số điện thoại đã được sử dụng.",
      });
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);

    // ✅ LƯU ROLE + LOCATION ĐÚNG PAYLOAD
    const user = await User.create({
      email,
      password: passwordHash,
      name: payload.name || "",
      username: username || undefined,
      phone: phone || undefined, // đừng lưu "" vào field unique
      role, // dùng role đã chọn
      location: {
        provinceId: payload.provinceId,
        wardId: payload.wardId,
        addressLine: payload.addressLine || "",
      },
    });

    // cấp refresh cookie + access token (giống Google flow)
    const jti = newId();
    const refresh = signRefresh({ jti, userId: user.id });
    // Set refresh cookie for entire site so it is available to refresh endpoints
    // In dev: use sameSite "lax" for localhost (Chrome blocks "none" without HTTPS)
    // In prod: use sameSite "none" + secure for cross-origin support
    res.cookie("refresh_token", refresh, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const accessToken = signAccess({ id: user.id, role: user.role });

    return res.status(201).json({
      accessToken,
      user: {
        _id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        username: user.username || "",
        phone: user.phone || "",
        location: user.location,
      },
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "VALIDATION_ERROR", message: e.errors?.[0]?.message });
    }
    if (e?.code === 11000) {
      if (e?.keyPattern?.email)
        return res.status(409).json({
          error: "EMAIL_TAKEN",
          field: "email",
          message: "Email đã được sử dụng.",
        });
      if (e?.keyPattern?.username)
        return res.status(409).json({
          error: "USERNAME_TAKEN",
          field: "username",
          message: "Username đã được sử dụng.",
        });
      if (e?.keyPattern?.phone)
        return res.status(409).json({
          error: "PHONE_TAKEN",
          field: "phone",
          message: "Số điện thoại đã được sử dụng.",
        });
    }
    console.error(e);
    return res
      .status(500)
      .json({ error: "REGISTER_FAILED", message: e.message || "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password, trustedDeviceToken } = req.body;

    // ✅ Allow login with email OR username
    const user = await User.findOne({
      $or: [
        { email: username?.toLowerCase().trim() },
        { username: username?.toLowerCase().trim() },
      ],
    });

    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid email or password" });

    // Block login if account is banned
    if (user.accountStatus === "banned") {
      return res.status(403).json({
        message: "Tài khoản của bạn đã bị khóa",
        reason: user.statusReason || "",
      });
    }

    // ============================================
    // ✅ 2FA CHECK - If user has 2FA enabled
    // ============================================
    if (user.twoFactorEnabled) {
      console.log(`🔐 2FA enabled for user: ${user.email}`);

      // ✅ Check if user has a valid trusted device token
      let isTrustedDevice = false;
      if (trustedDeviceToken && user.trustedDevices) {
        const device = user.trustedDevices.find(
          (d) =>
            d.deviceToken === trustedDeviceToken && new Date() < d.expiresAt
        );

        if (device) {
          // Update last used time
          device.lastUsed = new Date();
          await user.save();
          isTrustedDevice = true;
          console.log(`✅ Trusted device verified for user: ${user.email}`);
        }
      }

      // ✅ If not trusted device, require 2FA verification
      if (!isTrustedDevice) {
        // Generate 6-digit code
        const twoFactorCode = Math.floor(
          100000 + Math.random() * 900000
        ).toString();
        user.twoFactorCode = twoFactorCode;
        user.twoFactorCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        // Send email with 2FA code
        try {
          await sendMail(
            user.email,
            "Mã xác thực 2FA - TRAVYY",
            `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 10px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Mã 2FA</h1>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                    Xin chào <strong>${user.name || user.username}</strong>,
                  </p>
                  
                  <p style="font-size: 16px; color: #374151; margin-bottom: 30px;">
                    Mã xác thực 2FA của bạn là:
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

          console.log(`📧 2FA code sent to: ${user.email}`);
        } catch (emailError) {
          console.error("❌ Failed to send 2FA email:", emailError);
          return res.status(500).json({
            message: "Không thể gửi mã 2FA. Vui lòng thử lại sau.",
          });
        }

        // Return response indicating 2FA is required
        return res.json({
          requires2FA: true,
          userId: user._id.toString(),
          message: "Mã xác thực đã được gửi đến email của bạn",
        });
      }

      // ✅ Trusted device - skip 2FA
      console.log(`✅ Trusted device - skipping 2FA for: ${user.email}`);
    }

    // ✅ No 2FA or trusted device - proceed with login
    const jti = newId();
    const refresh = signRefresh({ jti, userId: user.id });
    res.cookie("refresh_token", refresh, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const accessToken = signAccess({
      id: user.id,
      role: user.role || "Traveler",
    });

    const response = {
      accessToken,
      user: {
        _id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        username: user.username || "",
        phone: user.phone || "",
        location: user.location,
      },
    };

    // ✅ Add flag if trusted device was used
    if (user.twoFactorEnabled && trustedDeviceToken) {
      response.trustedDevice = true;
    }

    return res.json(response);
  } catch (err) {
    console.error("LOGIN_ERROR:", err);
    res
      .status(500)
      .json({ error: "LOGIN_FAILED", message: err.message || "Server error" });
  }
};

/* =========================
   Change Password (Đổi mật khẩu khi đã đăng nhập)
   ========================= */
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Thiếu thông tin mật khẩu" });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "Mật khẩu mới phải có ít nhất 8 ký tự" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // ✅ Kiểm tra xem user có đăng nhập bằng OAuth không
    if (user.googleId || user.facebookId) {
      return res.status(400).json({
        message:
          "Bạn đăng nhập bằng Google/Facebook nên không thể đổi mật khẩu. Vui lòng quản lý bảo mật qua tài khoản Google/Facebook của bạn.",
        isOAuthUser: true,
      });
    }

    // ✅ Kiểm tra user có password không
    if (!user.password) {
      return res.status(400).json({
        message:
          "Tài khoản của bạn không có mật khẩu. Vui lòng liên hệ hỗ trợ.",
        isOAuthUser: true,
      });
    }

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Gửi email thông báo
    try {
      await axios.post(`${notifyUrl}/api/notify/password-changed`, {
        email: user.email,
        name: user.name,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });
    } catch (emailErr) {
      console.error("Failed to send password change notification:", emailErr.message);
    }

    res.json({ success: true, message: "Đổi mật khẩu thành công" });
  } catch (err) {
    console.error("CHANGE_PASSWORD_ERROR:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

/* =========================
   Forgot Password (Yêu cầu reset mật khẩu - gửi email)
   ========================= */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email là bắt buộc" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Không tiết lộ email có tồn tại hay không (security)
      console.log(
        `⚠️ Forgot password request for non-existent email: ${email}`
      );
      return res.json({
        success: true,
        message: "Nếu email tồn tại, link đặt lại mật khẩu đã được gửi",
      });
    }

    console.log(`🔑 Forgot password request for: ${user.email}`);

    // Tạo reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 phút
    await user.save();

    // Tạo reset link
    const resetLink = `${process.env.FRONTEND_URL || process.env.CLIENT_URL || "https://travvytouring.page"}/reset-password?token=${resetToken}`;

    console.log(`📧 Sending reset email to: ${user.email}`);
    console.log(`🔗 Reset link: ${resetLink}`);

    // Gửi email trực tiếp
    try {
      const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; background: #f9fafb; padding: 20px; border-radius: 12px; color: #333;">
        <div style="text-align: center;">
          <img src="https://res.cloudinary.com/dzyq1kp4u/image/upload/v1759849958/logo_wvrds5.png" 
               alt="Travyy Banner" 
               style="max-width: 50%; border-radius: 12px; margin-bottom: 20px;" />
        </div>

        <h2 style="color: #2563eb;">🔑 Đặt lại mật khẩu</h2>
        <p>Xin chào <b>${user.name || "bạn"}</b>,</p>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản Travyy của bạn.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="display: inline-block; padding: 14px 28px; background: #2563eb; color: #fff; 
                    font-weight: bold; text-decoration: none; border-radius: 8px; font-size: 16px;">
            🔓 Đặt lại mật khẩu
          </a>
        </div>

        <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0;"><strong>⏰ Link có hiệu lực trong 15 phút</strong></p>
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">Nếu link hết hạn, vui lòng yêu cầu đặt lại mật khẩu mới.</p>
        </div>

        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #dc2626;"><strong>⚠️ Không phải bạn?</strong></p>
          <p style="margin: 10px 0 0 0;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Mật khẩu của bạn sẽ không thay đổi.</p>
        </div>

        <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
          🔐 Travyy luôn bảo vệ an toàn cho tài khoản của bạn.
        </p>
      </div>
      `;

      await sendMail(
        user.email,
        "🔑 Yêu cầu đặt lại mật khẩu - Travyy",
        htmlContent
      );

      console.log(
        `✅ Password reset email sent successfully to: ${user.email}`
      );
    } catch (emailErr) {
      console.error(
        "❌ Failed to send password reset email:",
        emailErr.message
      );
      console.error("❌ Full error:", emailErr);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res
        .status(500)
        .json({ message: "Không thể gửi email. Vui lòng thử lại sau" });
    }

    res.json({
      success: true,
      message: "Link đặt lại mật khẩu đã được gửi đến email của bạn",
    });
  } catch (err) {
    console.error("FORGOT_PASSWORD_ERROR:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

/* =========================
   Reset Password (Đặt lại mật khẩu mới với token)
   ========================= */
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Thiếu thông tin" });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "Mật khẩu mới phải có ít nhất 8 ký tự" });
    }

    // Hash token để so sánh
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn",
      });
    }

    // Cập nhật mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Gửi email xác nhận thành công
    try {
      const subject = "✅ Mật khẩu đã được đặt lại thành công - Travyy";
      const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; background: #f9fafb; padding: 20px; border-radius: 12px; color: #333;">
        <div style="text-align: center;">
          <img src="https://res.cloudinary.com/dzyq1kp4u/image/upload/v1759849958/logo_wvrds5.png" 
               alt="Travyy Banner" 
               style="max-width: 50%; border-radius: 12px; margin-bottom: 20px;" />
        </div>

        <h2 style="color: #16a34a;">✅ Đặt lại mật khẩu thành công</h2>
        <p>Xin chào <b>${user.name || "bạn"}</b>,</p>
        <p>Mật khẩu tài khoản Travyy của bạn đã được đặt lại thành công.</p>
        
        <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
          <p><strong>⏰ Thời gian:</strong> ${new Date().toLocaleString(
            "vi-VN"
          )}</p>
          <p><strong>🌐 IP:</strong> ${req.ip || "N/A"}</p>
          <p><strong>💻 Thiết bị:</strong> ${req.get("user-agent") || "N/A"}</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
           <a href="${process.env.CLIENT_URL || 'https://travvytouring.page'}/login" 
             style="display: inline-block; padding: 14px 28px; background: #16a34a; color: #fff; 
                    font-weight: bold; text-decoration: none; border-radius: 8px; font-size: 16px;">
            🔐 Đăng nhập ngay
          </a>
        </div>

        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #dc2626;"><strong>⚠️ Không phải bạn?</strong></p>
          <p style="margin: 10px 0 0 0;">Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ ngay với chúng tôi.</p>
        </div>

        <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
          🔐 Travyy luôn bảo vệ an toàn cho tài khoản của bạn.
        </p>
      </div>
      `;

      await sendMail(user.email, subject, htmlContent);
      console.log(`✅ Password reset success email sent to: ${user.email}`);
    } catch (emailErr) {
      console.error(
        "❌ Failed to send password reset success email:",
        emailErr.message
      );
      // Không block response vì password đã được reset thành công
    }

    res.json({
      success: true,
      message: "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập ngay bây giờ",
    });
  } catch (err) {
    console.error("RESET_PASSWORD_ERROR:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};
