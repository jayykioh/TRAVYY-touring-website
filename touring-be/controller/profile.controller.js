const User = require("../models/Users");
const { z } = require("zod");
const multer = require("multer");

const storage = multer.memoryStorage(); // ✅ dùng bộ nhớ thay vì lưu file
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.mimetype)) return cb(new Error("Invalid file type"));
    cb(null, true);
  },
});

const VN_PHONE = /^(03|05|07|08|09)\d{8}$/;
const USERNAME = /^[\p{L}\p{N}_]{3,20}$/u;

const UpdateSchema = z.object({
  name: z.string().min(1, "Tên không được để trống").trim(),
  username: z.string().trim().optional().nullable().transform(v => v ?? "").refine(v => v === "" || USERNAME.test(v), "Username 3-20 ký tự"),
  phone: z.string().trim().optional().nullable().transform(v => v ?? "").refine(v => v === "" || VN_PHONE.test(v), "Số điện thoại VN không hợp lệ"),
  location: z.object({
    provinceId: z.string().min(1, "Chưa chọn tỉnh/thành"),
    wardId: z.string().min(1, "Chưa chọn phường/xã"),
    addressLine: z.string().trim().optional().nullable(),
  }),
});

exports.getProfile = async (req, res) => {
  try {
    const uid = req.user?.sub || req.user?._id;
    const user = await User.findById(uid).select("-password");
    if (!user) return res.status(404).json({ error: "USER_NOT_FOUND" });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: "FETCH_FAILED", message: e.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const payload = UpdateSchema.parse(req.body);
    const uid = req.user?.sub || req.user?._id;

    const $set = {
      name: payload.name,
      "location.provinceId": payload.location.provinceId,
      "location.wardId": payload.location.wardId,
      "location.addressLine": payload.location.addressLine,
    };
    if (payload.phone) $set.phone = payload.phone;
    if (payload.username) $set.username = payload.username.toLowerCase();

    const updated = await User.findByIdAndUpdate(uid, { $set }, { new: true }).select("-password");
    res.json(updated);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: "VALIDATION_ERROR", message: e.errors?.[0]?.message });
    }
    res.status(500).json({ error: "UPDATE_FAILED", message: e.message });
  }
};

// ✅ Upload avatar (lưu trong MongoDB)
exports.uploadAvatar = [
  upload.single("avatar"),
  async (req, res) => {
    try {
      const uid = req.user?.sub || req.user?._id;
      if (!req.file) return res.status(400).json({ error: "NO_FILE" });

      const user = await User.findById(uid);
      if (!user) return res.status(404).json({ error: "USER_NOT_FOUND" });

      user.avatar = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
      await user.save();

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "UPLOAD_FAILED", message: err.message });
    }
  },
];

// ✅ Xóa avatar
exports.deleteAvatar = async (req, res) => {
  try {
    const uid = req.user?.sub || req.user?._id;
    const user = await User.findById(uid);
    if (!user || !user.avatar) return res.status(404).json({ error: "NO_AVATAR" });

    user.avatar = undefined;
    await user.save();

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "DELETE_FAILED", message: e.message });
  }
};

// ✅ Lấy ảnh avatar hiển thị (Discord style)
exports.getAvatar = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).send("Not found");

    if (user.avatar?.data) {
      res.set("Content-Type", user.avatar.contentType);
      return res.send(user.avatar.data);
    }

    // Avatar mặc định (Discord style)
    const name = encodeURIComponent(user.name || user.email || "User");
    const color = ["5865F2", "43B581", "FAA61A", "F04747", "7289DA"][
      (name.charCodeAt(0) % 5)
    ];
    return res.redirect(`https://ui-avatars.com/api/?name=${name}&background=${color}&color=fff&bold=true`);
  } catch (e) {
    res.status(500).send("Server error");
  }
};
