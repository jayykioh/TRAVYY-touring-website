const router = require("express").Router();
const authJwt = require("../middlewares/authJwt");  
const { updateProfile, getProfile } = require("../controller/profile.controller");

// Both root and /info paths for compatibility
router.get("/", authJwt, getProfile);
router.get("/info", authJwt, getProfile);

router.patch("/", authJwt, updateProfile);
router.patch("/info", authJwt, updateProfile);

module.exports = router;
