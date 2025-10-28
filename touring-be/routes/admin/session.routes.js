// touring-be/routes/admin/session.routes.js

const express = require("express");
const router = express.Router();
const sessionController = require("../../controller/admin/admin.session.controller");
const { verifyAdminToken } = require("../../middlewares/authJwt");

// Get all sessions
router.get("/", verifyAdminToken, sessionController.getSessions);

// Logout specific session
router.delete("/:sessionId", verifyAdminToken, sessionController.logoutSession);

// Logout all other sessions
router.post(
  "/logout-all-others",
  verifyAdminToken,
  sessionController.logoutAllOtherSessions
);

module.exports = router;
