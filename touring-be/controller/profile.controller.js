const User = require("../models/Users");
const Guide = require("../models/guide/Guide");
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
    
    // If user is a guide, also fetch guide profile
    if (user.role === 'guide') {
      const guide = await Guide.findOne({ userId: uid });
      if (guide) {
        // Merge user and guide data
        const profile = {
          ...user.toObject(),
          guideId: guide.guideId,
          bio: guide.bio || user.bio,
          rating: guide.rating,
          totalTours: guide.totalTours,
          toursConducted: guide.toursConducted,
          experience: guide.experience,
          languages: guide.languages || [],
          specialties: guide.specialties || [],
          availability: guide.availability,
          responseTime: guide.responseTime,
          joinedDate: guide.joinedDate,
        };
        return res.json(profile);
      }
    }
    
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: "FETCH_FAILED", message: e.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const uid = req.user?.sub || req.user?._id;
    const user = await User.findById(uid);
    if (!user) return res.status(404).json({ error: "USER_NOT_FOUND" });

    // Handle both standard user fields and guide-specific fields
    const {
      name,
      username,
      phone,
      location,
      bio,
      experience,
      languages,
      specialties,
    } = req.body;

    // Update User model
    const userUpdates = {};
    if (name !== undefined) userUpdates.name = name.trim();
    if (username !== undefined) userUpdates.username = username.toLowerCase().trim();
    if (phone !== undefined) userUpdates.phone = phone.trim();

    // Handle location object
    if (location) {
      if (typeof location === 'string') {
        userUpdates.location = location;
      } else if (location.provinceId && location.wardId) {
        userUpdates["location.provinceId"] = location.provinceId;
        userUpdates["location.wardId"] = location.wardId;
        if (location.addressLine !== undefined) {
          userUpdates["location.addressLine"] = location.addressLine;
        }
      }
    }

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(uid, { $set: userUpdates });
    }

    // If user is a guide, also update Guide model
    if (user.role === 'guide') {
      const guide = await Guide.findOne({ userId: uid });
      if (guide) {
        const guideUpdates = {};
        if (name !== undefined) guideUpdates.name = name.trim();
        if (phone !== undefined) guideUpdates.phone = phone.trim();
        if (bio !== undefined) guideUpdates.bio = bio.trim();
        if (experience !== undefined) guideUpdates.experience = experience;
        if (languages !== undefined) guideUpdates.languages = languages;
        if (specialties !== undefined) guideUpdates.specialties = specialties;
        if (typeof location === 'string') guideUpdates.location = location;

        if (Object.keys(guideUpdates).length > 0) {
          await Guide.findByIdAndUpdate(guide._id, { $set: guideUpdates });
        }
      }
    }

    // Fetch updated profile
    const updated = await User.findById(uid).select("-password");
    
    // Merge guide data if applicable
    if (user.role === 'guide') {
      const guide = await Guide.findOne({ userId: uid });
      if (guide) {
        const profile = {
          ...updated.toObject(),
          guideId: guide.guideId,
          bio: guide.bio || updated.bio,
          rating: guide.rating,
          totalTours: guide.totalTours,
          toursConducted: guide.toursConducted,
          experience: guide.experience,
          languages: guide.languages || [],
          specialties: guide.specialties || [],
          availability: guide.availability,
          responseTime: guide.responseTime,
          joinedDate: guide.joinedDate,
        };
        return res.json(profile);
      }
    }

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
