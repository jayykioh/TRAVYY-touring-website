// controller/auth.controller.js
const bcrypt = require("bcryptjs");
const { z } = require("zod");
const User = require("../models/User");
const { signAccess, signRefresh, newId } = require("../utils/jwt");

const isProd = process.env.NODE_ENV === "production";
const ALLOWED_ROLES = ["Traveler", "TourGuide", "TravelAgency"];

const VN_PHONE = /^(03|05|07|08|09)\d{8}$/;
const USERNAME = /^[\p{L}\p{N}_]{3,20}$/u;


const RegisterSchema = z.object({
  email: z.string().email("Email không hợp lệ").transform(v => v.trim().toLowerCase()),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
  name: z.string().trim().optional().nullable(),
  username: z.string().trim().optional().nullable()
    .transform(v => (v == null ? "" : v.toLowerCase()))
    .refine(v => v === "" || USERNAME.test(v), "Username 3–20 ký tự; chỉ a-z, 0-9, _"),
  phone: z.string().trim().optional().nullable()
    .transform(v => (v == null ? "" : v))
    .refine(v => v === "" || VN_PHONE.test(v), "Số điện thoại VN không hợp lệ"),
  role: z.enum(ALLOWED_ROLES).optional().default("Traveler"),
  provinceId: z.string().min(1, "Chưa chọn tỉnh/thành"),
  wardId: z.string().min(1, "Chưa chọn phường/xã"),
  addressLine: z.string().trim().optional().nullable(),
});

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
      return res.status(409).json({ error: "EMAIL_TAKEN", field: "email", message: "Email đã được sử dụng." });
    }
    if (username && await User.exists({ username })) {
      return res.status(409).json({ error: "USERNAME_TAKEN", field: "username", message: "Username đã được sử dụng." });
    }
    if (phone && await User.exists({ phone })) {
      return res.status(409).json({ error: "PHONE_TAKEN", field: "phone", message: "Số điện thoại đã được sử dụng." });
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);

    // ✅ LƯU ROLE + LOCATION ĐÚNG PAYLOAD
    const user = await User.create({
      email,
      password: passwordHash,
      name: payload.name || "",
      username: username || undefined,
      phone: phone || undefined, // đừng lưu "" vào field unique
      role,                      // dùng role đã chọn
      location: {
        provinceId: payload.provinceId,
        wardId: payload.wardId,
        addressLine: payload.addressLine || "",
      },
    });

    // cấp refresh cookie + access token (giống Google flow)
    const jti = newId();
    const refresh = signRefresh({ jti, userId: user.id });
    res.cookie("refresh_token", refresh, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/api/auth",
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
      return res.status(400).json({ error: "VALIDATION_ERROR", message: e.errors?.[0]?.message });
    }
    if (e?.code === 11000) {
      if (e?.keyPattern?.email)   return res.status(409).json({ error: "EMAIL_TAKEN", field: "email", message: "Email đã được sử dụng." });
      if (e?.keyPattern?.username) return res.status(409).json({ error: "USERNAME_TAKEN", field: "username", message: "Username đã được sử dụng." });
      if (e?.keyPattern?.phone)   return res.status(409).json({ error: "PHONE_TAKEN", field: "phone", message: "Số điện thoại đã được sử dụng." });
    }
    console.error(e);
    return res.status(500).json({ error: "REGISTER_FAILED", message: e.message || "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    // cần lấy field password => đừng .select("-password") ở query này
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid email or password" });

    // ✅ tạo refresh cookie + access token như các flow khác
    const jti = newId();
    const refresh = signRefresh({ jti, userId: user.id });
    res.cookie("refresh_token", refresh, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/api/auth",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const accessToken = signAccess({ id: user.id, role: user.role || "Traveler" });

    return res.json({
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
  } catch (err) {
    console.error("LOGIN_ERROR:", err);
    res.status(500).json({ error: "LOGIN_FAILED", message: err.message || "Server error" });
  }
};
