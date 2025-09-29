const router = require("express").Router();
const authJwt = require("../middlewares/authJwt");  
const { updateProfile, getProfile } = require("../controller/profile.controller");

router.get("/", authJwt, getProfile);

router.patch("/", authJwt, updateProfile);

module.exports = router;
