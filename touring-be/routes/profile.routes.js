const router = require("express").Router();
const authJwt = require("../middlewares/authJwt");
const { updateProfile, getProfile, uploadAvatar, deleteAvatar, getAvatar } = require("../controller/profile.controller");

router.get("/", authJwt, getProfile);
router.get("/info", authJwt, getProfile);
router.patch("/", authJwt, updateProfile);
router.patch("/info", authJwt, updateProfile);

router.post("/upload-avatar", authJwt, ...uploadAvatar);
router.delete("/avatar", authJwt, deleteAvatar);
router.get("/avatar/:userId", getAvatar); 

module.exports = router;
