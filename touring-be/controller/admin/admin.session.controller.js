// touring-be/controller/admin/admin.session.controller.js

const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");

/**
 * Get all active sessions for current admin
 * GET /api/admin/sessions
 */
exports.getSessions = async (req, res) => {
  try {
    const adminId = req.admin.id;

    // Lấy collection sessions từ MongoDB
    const db = mongoose.connection.db;
    const sessionsCollection = db.collection("sessions");

    // Tìm tất cả sessions của admin này
    const sessions = await sessionsCollection
      .find({ "session.admin.id": adminId })
      .toArray();

    // Parse và format sessions
    const formattedSessions = sessions.map((s) => {
      const session = s.session;
      const admin = session.admin || {};

      return {
        id: s._id.toString(),
        device: admin.device || "Unknown Device",
        browser: admin.browser || "Unknown Browser",
        location: admin.location || "Unknown Location",
        ipAddress: admin.ipAddress || "N/A",
        lastActive: s.expires || new Date(),
        isCurrent: s._id.toString() === req.sessionID,
      };
    });

    res.json({ sessions: formattedSessions });
  } catch (error) {
    console.error("getSessions error:", error);
    res.status(500).json({ error: "FETCH_SESSIONS_FAILED" });
  }
};

/**
 * Logout a specific session
 * DELETE /api/admin/sessions/:sessionId
 */
exports.logoutSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const adminId = req.admin.id;

    // Prevent logging out current session
    if (sessionId === req.sessionID) {
      return res.status(400).json({ error: "CANNOT_LOGOUT_CURRENT_SESSION" });
    }

    const db = mongoose.connection.db;
    const sessionsCollection = db.collection("sessions");

    // Verify session belongs to this admin before deleting
    const session = await sessionsCollection.findOne({
      _id: sessionId,
      "session.admin.id": adminId,
    });

    if (!session) {
      return res.status(404).json({ error: "SESSION_NOT_FOUND" });
    }

    // Delete the session
    await sessionsCollection.deleteOne({ _id: sessionId });

    res.json({ message: "Session logged out successfully" });
  } catch (error) {
    console.error("logoutSession error:", error);
    res.status(500).json({ error: "LOGOUT_SESSION_FAILED" });
  }
};

/**
 * Logout all other sessions except current
 * POST /api/admin/sessions/logout-all-others
 */
exports.logoutAllOtherSessions = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const currentSessionId = req.sessionID;

    const db = mongoose.connection.db;
    const sessionsCollection = db.collection("sessions");

    // Delete all sessions except current one
    const result = await sessionsCollection.deleteMany({
      "session.admin.id": adminId,
      _id: { $ne: currentSessionId },
    });

    res.json({
      message: "All other sessions logged out successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("logoutAllOtherSessions error:", error);
    res.status(500).json({ error: "LOGOUT_ALL_SESSIONS_FAILED" });
  }
};
