// routes/profile.routes.js
const router = require("express").Router();
const authRequired = require("../middlewares/authRequired");
const { updateProfile } = require("../controller/profile.controller");

router.patch("/", authRequired, updateProfile);
router.post("/", authRequired, updateProfile);

module.exports = router;
