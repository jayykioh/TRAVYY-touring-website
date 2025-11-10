const router = require("express").Router();
const authJwt = require("../../middlewares/authJwt");
const multer = require("multer");
const {
  getAvailableGuides,
  getGuideProfile,
  updateGuideProfile,
  uploadCertificate,
  deleteCertificate,
  getTourRequests,
  getGuideTours,
  getGuideEarnings,
  getGuideNotifications,
  acceptTourRequest,
  rejectTourRequest,
  getCustomTourRequests,
  getCustomTourRequestDetails,
  claimTourRequest,
  guideCounterOffer,
  guideSendMessage,
  guideAcceptDeal,
  guideRejectRequest,
  guideAgreeToTerms,
  getGuideAgreementStatus
} = require("../../controller/guide/guide.controller");

// Setup multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_, file, cb) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Invalid file type. Only PDF and images allowed."));
    }
    cb(null, true);
  },
});

// Public route - get available guides (with location filter)
router.get("/available", getAvailableGuides);

// All other guide routes require authentication
router.use(authJwt);

// Get guide profile
router.get("/profile", getGuideProfile);

// Update guide profile
router.patch("/profile", updateGuideProfile);
router.put("/profile", updateGuideProfile);

// Certificate management
router.post("/certificate", upload.single("certificate"), uploadCertificate);
router.delete("/certificate/:certId", deleteCertificate);

// Tour requests (old system)
router.get("/requests", getTourRequests);
router.put("/requests/:requestId/accept", acceptTourRequest);
router.put("/requests/:requestId/reject", rejectTourRequest);

// Custom tour requests (new system with negotiation)
router.get("/custom-requests", getCustomTourRequests);
router.get("/custom-requests/:requestId", getCustomTourRequestDetails);
router.post("/custom-requests/:requestId/claim", claimTourRequest);
router.post("/custom-requests/:requestId/counter-offer", guideCounterOffer);
router.post("/custom-requests/:requestId/message", guideSendMessage);
router.post("/custom-requests/:requestId/accept", guideAcceptDeal);
router.post("/custom-requests/:requestId/reject", guideRejectRequest);
router.post("/custom-requests/:requestId/agree", guideAgreeToTerms);
router.get("/custom-requests/:requestId/agreement", getGuideAgreementStatus);

// Tours
router.get("/tours", getGuideTours);

// Earnings
router.get("/earnings", getGuideEarnings);

// Notifications
router.get("/notifications", getGuideNotifications);

module.exports = router;