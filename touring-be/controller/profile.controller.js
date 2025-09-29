const User = require("../models/User");
const { z } = require("zod");

const VN_PHONE = /^(03|05|07|08|09)\d{8}$/;
const USERNAME = /^[a-z0-9_]{3,20}$/i;

const UpdateSchema = z.object({
  name: z.string().min(1, "Tên không được để trống").trim(),
  username: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((v) => (v == null ? "" : v.toLowerCase()))
    .refine((v) => v === "" || USERNAME.test(v), "Username 3-20 ký tự, chữ/số/underscore"),
  phone: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((v) => (v == null ? "" : v))
    .refine((v) => v === "" || VN_PHONE.test(v), "Số điện thoại VN không hợp lệ"),
  location: z.object({
    provinceId: z.string().min(1, "Chưa chọn tỉnh/thành"),
    wardId: z.string().min(1, "Chưa chọn phường/xã"),
    addressLine: z.string().trim().optional().nullable(),
  }),
});

exports.getProfile = async (req, res) => {
  try {
    const uid = req.user?.sub || req.user?._id || req.user?.id;
    if (!uid) return res.status(401).json({ error: "UNAUTHORIZED" });

    const user = await User.findById(uid).select("-password");
    if (!user) return res.status(404).json({ error: "USER_NOT_FOUND" });

    res.set("Cache-Control", "no-store");
    res.json(user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "FETCH_FAILED", message: e.message || "Server error" });
  }
};

const normalizePhone = (p) => {
  if (!p) return "";
  let digits = p.replace(/\D/g, "");
  if (digits.startsWith("84") && digits.length === 11) digits = "0" + digits.slice(2);
  return digits;
};

exports.updateProfile = async (req, res) => {
  try {
    const payload = UpdateSchema.parse(req.body);

    const uid = req.user?.sub || req.user?._id || req.user?.id;
    if (!uid) return res.status(401).json({ error: "UNAUTHORIZED" });

    const phone = normalizePhone(payload.phone);
    const username = payload.username || ""; // already lowercased by transform

    // --- Pre-check duplicates (business guard) ---
    if (phone) {
      const exists = await User.exists({ phone, _id: { $ne: uid } });
      if (exists) {
        return res.status(409).json({
          error: "PHONE_TAKEN",
          field: "phone",
          message: "Số điện thoại đã được sử dụng bởi tài khoản khác.",
        });
      }
    }
    if (username) {
      const existsU = await User.exists({ username, _id: { $ne: uid } });
      if (existsU) {
        return res.status(409).json({
          error: "USERNAME_TAKEN",
          field: "username",
          message: "Username đã được sử dụng. Vui lòng chọn tên khác.",
        });
      }
    }

    // --- Build update ---
    const $set = {
      name: payload.name,
      "location.provinceId": payload.location.provinceId,
      "location.wardId": payload.location.wardId,
    };
    if (payload.location.addressLine != null) {
      $set["location.addressLine"] = payload.location.addressLine;
    }

    const $unset = {};
    if (phone) $set.phone = phone; else $unset.phone = "";
    if (username) $set.username = username; else $unset.username = "";

    const updateDoc = Object.keys($unset).length ? { $set, $unset } : { $set };

    const updated = await User.findByIdAndUpdate(uid, updateDoc, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updated) return res.status(404).json({ error: "USER_NOT_FOUND" });

    res.set("Cache-Control", "no-store");
    res.json(updated);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: e.errors?.[0]?.message,
      });
    }
    // Race condition safety: map duplicate key to 409
    if (e?.code === 11000) {
      if (e?.keyPattern?.phone) {
        return res.status(409).json({
          error: "PHONE_TAKEN",
          field: "phone",
          message: "Số điện thoại đã được sử dụng bởi tài khoản khác.",
        });
      }
      if (e?.keyPattern?.username) {
        return res.status(409).json({
          error: "USERNAME_TAKEN",
          field: "username",
          message: "Username đã được sử dụng. Vui lòng chọn tên khác.",
        });
      }
    }
    console.error(e);
    res.status(500).json({ error: "UPDATE_FAILED", message: e.message || "Server error" });
  }
};
