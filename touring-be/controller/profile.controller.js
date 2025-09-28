const User = require("../models/User");
const { z } = require("zod");

const UpdateSchema = z.object({
  name: z.string().min(1).trim(),
  phone: z.string().trim().optional().nullable(),
  location: z.object({
    provinceId: z.string().min(1),
    wardId: z.string().min(1),
    addressLine: z.string().trim().optional().nullable(),
  }),
});

exports.updateProfile = async (req, res) => {
  try {
    const body = UpdateSchema.parse(req.body);
    const uid = req.user?._id || req.user?.id;
    if (!uid) return res.status(401).json({ error: "UNAUTHORIZED" });

    const updated = await User.findByIdAndUpdate(
      uid,
      {
        $set: {
          name: body.name,
          phone: body.phone || "",
          location: {
            provinceId: body.location.provinceId,
            wardId: body.location.wardId,
            addressLine: body.location.addressLine || "",
          },
        },
      },
      { new: true, runValidators: true, select: "-password" }
    );
    if (!updated) return res.status(404).json({ error: "USER_NOT_FOUND" });
    res.json(updated);
  } catch (e) {
    if (e.name === "ZodError") {
      return res.status(400).json({ error: "VALIDATION_ERROR", message: e.errors?.[0]?.message });
    }
    console.error(e);
    res.status(500).json({ error: "UPDATE_FAILED", message: e.message || "Server error" });
  }
};
