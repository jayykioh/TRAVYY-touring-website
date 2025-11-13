const mongoose = require("mongoose");
const Refund = require("../models/Refund");
const Booking = require("../models/Bookings");
const { processRefund } = require("../services/refundService");

// ===== USER ENDPOINTS =====

/**
 * Request Pre-Trip Cancellation Refund
 * POST /api/refunds/pre-trip
 */
exports.requestPreTripRefund = async (req, res) => {
  try {
    const userId = req.userId;
    const { bookingId, requestNote } = req.body;

    console.log("=== Pre-trip refund request ===");
    console.log("User ID:", userId);
    console.log("Booking ID:", bookingId);
    console.log("Request body:", req.body);

    // Validate booking
    const booking = await Booking.findById(bookingId);
    console.log("Booking found:", booking ? "Yes" : "No");

    if (!booking) {
      console.log("ERROR: Booking not found for ID:", bookingId);
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if booking belongs to user
    console.log("Booking userId:", booking.userId?.toString());
    console.log("Request userId:", userId.toString());
    if (booking.userId.toString() !== userId.toString()) {
      console.log("ERROR: Unauthorized access");
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to this booking",
      });
    }

    // Check if booking is paid
    console.log("Booking status:", booking.status);
    if (booking.status !== "paid") {
      console.log("ERROR: Booking status is not 'paid'");
      return res.status(400).json({
        success: false,
        message: "Only paid bookings can be refunded",
      });
    }

    // Check if already refunded
    if (booking.status === "refunded") {
      console.log("ERROR: Already refunded");
      return res.status(400).json({
        success: false,
        message: "This booking has already been refunded",
      });
    }

    // Check for existing pending refund
    const existingRefund = await Refund.findOne({
      bookingId,
      status: { $in: ["pending", "under_review", "approved", "processing"] },
    });
    console.log("Existing refund found:", existingRefund ? "Yes" : "No");

    if (existingRefund) {
      console.log("ERROR: Refund already in progress");
      return res.status(400).json({
        success: false,
        message: "A refund request for this booking is already in progress",
      });
    }

    // Get tour start date from first item
    if (!booking.items || booking.items.length === 0) {
      console.log("ERROR: No tour items in booking");
      return res.status(400).json({
        success: false,
        message: "Booking has no tour items",
      });
    }

    const tourStartDate = new Date(booking.items[0].date);
    const now = new Date();
    console.log("Tour start date:", tourStartDate);
    console.log("Current date:", now);

    // Check if tour has already started
    if (tourStartDate <= now) {
      console.log("ERROR: Tour already started");
      return res.status(400).json({
        success: false,
        message:
          "Cannot request pre-trip refund after tour has started. Please use post-trip refund instead.",
      });
    }

    // Calculate refund amount
    const originalAmount = booking.totalAmount;
    const refundCalc = Refund.calculatePreTripRefund(
      tourStartDate,
      originalAmount
    );
    console.log("Refund calculation:", refundCalc);

    if (refundCalc.finalRefundAmount <= 0) {
      console.log("ERROR: Final refund amount is 0 or negative");
      return res.status(400).json({
        success: false,
        message: `Cancellation too close to departure date. ${refundCalc.policy}`,
        refundDetails: refundCalc,
      });
    }

    // Create refund request
    const refund = new Refund({
      bookingId: booking._id,
      userId: booking.userId,
      refundType: "pre_trip_cancellation",
      originalAmount,
      refundableAmount: refundCalc.refundableAmount,
      refundPercentage: refundCalc.refundPercentage,
      processingFee: refundCalc.processingFee,
      finalRefundAmount: refundCalc.finalRefundAmount,
      cancellationDetails: {
        tourStartDate,
        cancellationDate: now,
        daysBeforeTour: refundCalc.daysBeforeTour,
        cancellationPolicy: refundCalc.policy,
      },
      requestedBy: userId,
      requestNote,
      currency: booking.currency || "VND",
      paymentProvider: booking.payment?.provider,
      originalPayment: {
        provider: booking.payment?.provider,
        orderId: booking.payment?.orderId,
        transactionId: booking.payment?.transactionId,
      },
    });

    refund.generateRefundReference();
    refund.addTimelineEntry("pending", "Refund request created", userId);

    await refund.save();
    console.log("Refund saved successfully:", refund._id);

    res.status(201).json({
      success: true,
      message: "Pre-trip cancellation refund request created successfully",
      data: refund,
    });
  } catch (error) {
    console.error("Error requesting pre-trip refund:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error creating refund request",
      error: error.message,
    });
  }
};

/**
 * Request Post-Trip Issue Refund
 * POST /api/refunds/post-trip
 */
exports.requestPostTripRefund = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      bookingId,
      issueCategory,
      description,
      severity,
      evidence,
      requestNote,
    } = req.body;

    // Validate inputs
    if (!issueCategory || !description) {
      return res.status(400).json({
        success: false,
        message: "Issue category and description are required",
      });
    }

    // Validate booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if booking belongs to user
    if (booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to this booking",
      });
    }

    // Check if booking is paid
    if (booking.status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Only paid bookings can be refunded",
      });
    }

    // Check if already refunded
    if (booking.status === "refunded") {
      return res.status(400).json({
        success: false,
        message: "This booking has already been refunded",
      });
    }

    // Get tour completion date (tour start date + duration or use current date)
    const tourStartDate = new Date(booking.items[0].date);
    const completionDate = new Date(); // Current date as completion date

    // Check if tour has completed (must be after tour start date)
    if (completionDate < tourStartDate) {
      return res.status(400).json({
        success: false,
        message: "Cannot request post-trip refund before tour starts",
      });
    }

    // Calculate refund amount based on severity
    const originalAmount = booking.totalAmount;
    const refundCalc = Refund.calculatePostTripRefund(originalAmount, severity);

    // Create refund request
    const refund = new Refund({
      bookingId: booking._id,
      userId: booking.userId,
      refundType: "post_trip_issue",
      originalAmount,
      refundableAmount: refundCalc.refundableAmount,
      refundPercentage: refundCalc.refundPercentage,
      processingFee: refundCalc.processingFee,
      finalRefundAmount: refundCalc.finalRefundAmount,
      issueDetails: {
        completionDate,
        issueCategory,
        description,
        evidence: evidence || [],
        severity: severity || "moderate",
      },
      requestedBy: userId,
      requestNote,
      currency: booking.currency || "VND",
      paymentProvider: booking.payment?.provider,
      originalPayment: {
        provider: booking.payment?.provider,
        orderId: booking.payment?.orderId,
        transactionId: booking.payment?.transactionId,
      },
      status: "pending", // Requires admin review
    });

    refund.generateRefundReference();
    refund.addTimelineEntry(
      "pending",
      "Post-trip refund request created",
      userId
    );

    await refund.save();

    res.status(201).json({
      success: true,
      message: "Post-trip issue refund request created successfully",
      data: refund,
    });
  } catch (error) {
    console.error("Error requesting post-trip refund:", error);
    res.status(500).json({
      success: false,
      message: "Error creating refund request",
      error: error.message,
    });
  }
};

/**
 * Get User's Refund Requests
 * GET /api/refunds/my-refunds
 */
exports.getUserRefunds = async (req, res) => {
  try {
    const userId = req.userId;
    const { status, type, page = 1, limit = 10 } = req.query;

    const query = { userId };

    if (status) {
      query.status = status;
    }

    if (type) {
      query.refundType = type;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const refunds = await Refund.find(query)
      .populate("bookingId", "orderRef items totalAmount status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Refund.countDocuments(query);

    res.json({
      success: true,
      data: refunds,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching user refunds:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching refunds",
      error: error.message,
    });
  }
};

/**
 * Get Single Refund Details
 * GET /api/refunds/:id
 */
exports.getRefundDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const refund = await Refund.findById(id)
      .populate(
        "bookingId",
        "orderRef items totalAmount payment.provider payment.status createdAt"
      )
      .populate("requestedBy", "fullName email")
      .populate("reviewedBy", "fullName email")
      .populate("timeline.updatedBy", "fullName email");

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund not found",
      });
    }

    // Check if refund belongs to user (or user is admin)
    if (refund.userId.toString() !== userId.toString() && !req.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to this refund",
      });
    }

    res.json({
      success: true,
      data: refund,
    });
  } catch (error) {
    console.error("Error fetching refund details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching refund details",
      error: error.message,
    });
  }
};

/**
 * Cancel Refund Request (by user, only if pending)
 * POST /api/refunds/:id/cancel
 */
exports.cancelRefundRequest = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { reason } = req.body;

    const refund = await Refund.findById(id);

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund not found",
      });
    }

    // Check if refund belongs to user
    if (refund.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to this refund",
      });
    }

    // Can only cancel if pending
    if (refund.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel refund in ${refund.status} status`,
      });
    }

    // Update refund status
    refund.status = "cancelled";
    refund.addTimelineEntry("cancelled", reason || "Cancelled by user", userId);

    await refund.save();

    // Update booking status back to 'paid' since refund is cancelled
    // This allows user to request refund again if needed
    const booking = await Booking.findById(refund.bookingId);
    if (booking) {
      console.log(
        `Updating booking ${booking._id} status from ${booking.status} to paid (refund cancelled)`
      );
      // Only update if booking is still in a refund-related status
      if (
        booking.status === "refunded" ||
        booking.status === "pending_refund"
      ) {
        booking.status = "paid";
        await booking.save();
      }
    }

    res.json({
      success: true,
      message: "Refund request cancelled successfully",
      data: refund,
    });
  } catch (error) {
    console.error("Error cancelling refund:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling refund request",
      error: error.message,
    });
  }
};

/**
 * Submit Bank Information for Refund
 * POST /api/refunds/:id/bank-info
 * User must provide bank account details after refund is approved
 */
exports.submitBankInfo = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { bankName, accountNumber, accountName, branchName } = req.body;

    // Validation
    if (!bankName || !accountNumber || !accountName) {
      return res.status(400).json({
        success: false,
        message: "Bank name, account number, and account name are required",
      });
    }

    const refund = await Refund.findById(id);

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund not found",
      });
    }

    // Check ownership
    if (refund.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to this refund",
      });
    }

    // Only allow bank info submission for approved refunds
    if (refund.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Bank information can only be provided for approved refunds",
        currentStatus: refund.status,
      });
    }

    // Update bank info
    refund.bankInfo = {
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountName: accountName.trim(),
      branchName: branchName?.trim() || "",
      providedAt: new Date(),
    };

    refund.addTimelineEntry(
      "approved",
      "Bank information provided by user",
      userId
    );

    await refund.save();

    res.json({
      success: true,
      message: "Bank information submitted successfully",
      data: refund,
    });
  } catch (error) {
    console.error("Error submitting bank info:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting bank information",
      error: error.message,
    });
  }
};

// ===== ADMIN ENDPOINTS =====

/**
 * Get All Refund Requests (Admin)
 * GET /api/admin/refunds
 */
exports.getAllRefunds = async (req, res) => {
  try {
    const {
      status,
      type,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (type) {
      query.refundType = type;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [{ refundReference: { $regex: search, $options: "i" } }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const refunds = await Refund.find(query)
      .populate("userId", "fullName email phone")
      .populate("bookingId", "orderRef items totalAmount")
      .populate("reviewedBy", "fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Refund.countDocuments(query);

    // Calculate statistics
    const stats = await Refund.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$finalRefundAmount" },
        },
      },
    ]);

    res.json({
      success: true,
      data: refunds,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
      stats,
    });
  } catch (error) {
    console.error("Error fetching all refunds:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching refunds",
      error: error.message,
    });
  }
};

/**
 * Review Refund Request (Admin)
 * POST /api/admin/refunds/:id/review
 */
exports.reviewRefund = async (req, res) => {
  try {
    const adminId = req.userId;
    const { id } = req.params;
    const { action, reviewNote, adjustedAmount } = req.body;

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Must be 'approve' or 'reject'",
      });
    }

    const refund = await Refund.findById(id).populate("bookingId");

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund not found",
      });
    }

    // Can only review pending or under_review refunds
    if (!["pending", "under_review"].includes(refund.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot review refund in ${refund.status} status`,
      });
    }

    refund.reviewedBy = adminId;
    refund.reviewedAt = new Date();
    refund.reviewNote = reviewNote;

    if (action === "approve") {
      refund.status = "approved";

      // Allow admin to adjust refund amount if needed
      if (adjustedAmount !== undefined && adjustedAmount >= 0) {
        refund.finalRefundAmount = adjustedAmount;
        refund.addTimelineEntry(
          "approved",
          `Approved with adjusted amount: ${adjustedAmount}. ${
            reviewNote || ""
          }`,
          adminId
        );
      } else {
        refund.addTimelineEntry(
          "approved",
          reviewNote || "Approved by admin",
          adminId
        );
      }

      await refund.save();

      // 🚀 AUTO-PROCESS REFUND: Automatically create PayPal sandbox payment
      console.log(
        `🚀 [Auto-Refund] Starting automatic refund processing for ${refund._id}`
      );

      const booking = refund.bookingId;
      if (!booking) {
        console.error(`❌ [Auto-Refund] Booking not found for refund ${id}`);
        return res.status(404).json({
          success: false,
          message: "Associated booking not found",
        });
      }

      // Update status to processing
      refund.status = "processing";
      refund.addTimelineEntry(
        "processing",
        "🤖 Automatically processing refund payment via PayPal",
        adminId
      );
      await refund.save();

      console.log(
        `🔄 [Auto-Refund] Processing refund ${refund._id} for booking ${booking._id}`
      );

      // ✅ AUTOMATIC REFUND PROCESSING via payment gateway
      const refundResult = await processRefund(
        booking,
        refund.finalRefundAmount,
        reviewNote || `Refund for booking ${booking.orderRef || booking._id}`
      );

      console.log(`📊 [Auto-Refund] Result:`, refundResult);

      if (refundResult.success) {
        // Refund successful
        refund.status = "completed";
        refund.completedAt = new Date();
        refund.refundPayment = {
          transactionId: refundResult.transactionId || `REF-${Date.now()}`,
          processedAt: new Date(),
          provider: refundResult.provider,
          refundId: refundResult.refundId,
        };

        if (refundResult.requiresManualProcessing) {
          refund.addTimelineEntry(
            "completed",
            `⚠️ Refund requires manual processing via ${
              refundResult.provider
            }. ${reviewNote || ""}`,
            adminId
          );
        } else {
          refund.addTimelineEntry(
            "completed",
            `✅ Refund automatically processed via ${refundResult.provider}. Transaction ID: ${refundResult.transactionId}`,
            adminId
          );
        }

        // Update booking status to refunded
        booking.status = "refunded";
        booking.refundStatus = "completed";
        booking.refundedAt = new Date();
        await booking.save();

        await refund.save();

        console.log(
          `✅ [Auto-Refund] Completed successfully for ${refund._id}`
        );

        res.json({
          success: true,
          message: refundResult.requiresManualProcessing
            ? "Refund approved and marked for manual processing"
            : "Refund approved and automatically processed via payment gateway",
          data: refund,
          refundResult,
          autoProcessed: true,
        });
      } else {
        // Refund failed - keep in processing status for manual handling
        refund.addTimelineEntry(
          "processing",
          `❌ Automatic refund failed: ${refundResult.error}. Requires manual intervention.`,
          adminId
        );

        refund.processingNote = `Auto-refund failed: ${refundResult.error}`;
        await refund.save();

        res.status(500).json({
          success: false,
          message:
            "Refund approved but automatic processing failed. Please process manually.",
          data: refund,
          error: refundResult.error,
          autoProcessed: false,
        });
      }
    } else {
      // Rejection flow (unchanged)
      refund.status = "rejected";
      refund.rejectedAt = new Date();
      refund.addTimelineEntry(
        "rejected",
        reviewNote || "Rejected by admin",
        adminId
      );

      await refund.save();

      res.json({
        success: true,
        message: "Refund rejected successfully",
        data: refund,
      });
    }
  } catch (error) {
    console.error("Error reviewing refund:", error);
    res.status(500).json({
      success: false,
      message: "Error reviewing refund",
      error: error.message,
    });
  }
};

/**
 * Process Refund Payment (Admin)
 * POST /api/admin/refunds/:id/process
 */
exports.processRefund = async (req, res) => {
  try {
    const adminId = req.userId;
    const { id } = req.params;
    const { refundMethod, transactionId, bankDetails, note } = req.body;

    console.log(`📥 [Process Refund] Request for refund ID: ${id}`);
    console.log(`   Admin ID: ${adminId}`);
    console.log(`   Method: ${refundMethod}`);

    const refund = await Refund.findById(id).populate("bookingId");

    if (!refund) {
      console.log(`❌ [Process Refund] Refund not found: ${id}`);
      return res.status(404).json({
        success: false,
        message: "Refund not found",
      });
    }

    console.log(`✅ [Process Refund] Found refund, status: ${refund.status}`);

    // Can only process approved refunds
    if (refund.status !== "approved") {
      console.log(
        `❌ [Process Refund] Invalid status: ${refund.status} (must be approved)`
      );
      return res.status(400).json({
        success: false,
        message: `Cannot process refund in ${refund.status} status. Must be approved first.`,
        currentStatus: refund.status,
        refundId: refund._id,
      });
    }

    const booking = refund.bookingId;
    if (!booking) {
      console.log(`❌ [Process Refund] Booking not found for refund ${id}`);
      return res.status(404).json({
        success: false,
        message: "Associated booking not found",
      });
    }

    // Update status to processing
    refund.status = "processing";
    refund.refundMethod = refundMethod || "original_payment";
    refund.addTimelineEntry(
      "processing",
      note || "Processing refund payment",
      adminId
    );

    if (bankDetails) {
      refund.bankDetails = bankDetails;
    }

    await refund.save();

    console.log(
      `🔄 [Refund] Processing refund ${refund._id} for booking ${booking._id}`
    );

    // ✅ REAL REFUND PROCESSING via payment gateway
    const refundResult = await processRefund(
      booking,
      refund.finalRefundAmount,
      note || `Refund for booking ${booking.orderRef || booking._id}`
    );

    console.log(`📊 [Refund] Result:`, refundResult);

    if (refundResult.success) {
      // Refund successful
      refund.status = "completed";
      refund.completedAt = new Date();
      refund.refundPayment = {
        transactionId:
          refundResult.transactionId || transactionId || `REF-${Date.now()}`,
        processedAt: new Date(),
        provider: refundResult.provider,
        refundId: refundResult.refundId,
      };

      if (refundResult.requiresManualProcessing) {
        refund.addTimelineEntry(
          "completed",
          `⚠️ Refund requires manual processing via ${refundResult.provider}. ${
            note || ""
          }`,
          adminId
        );
      } else {
        refund.addTimelineEntry(
          "completed",
          `✅ Refund processed successfully via ${refundResult.provider}. Transaction ID: ${refundResult.transactionId}`,
          adminId
        );
      }

      // Update booking status to refunded
      booking.status = "refunded";
      await booking.save();

      await refund.save();

      res.json({
        success: true,
        message: refundResult.requiresManualProcessing
          ? "Refund marked for manual processing"
          : "Refund processed successfully via payment gateway",
        data: refund,
        refundResult,
      });
    } else {
      // Refund failed - keep in processing status for manual handling
      refund.addTimelineEntry(
        "processing",
        `❌ Automatic refund failed: ${refundResult.error}. Requires manual intervention.`,
        adminId
      );

      refund.processingNote = `Auto-refund failed: ${refundResult.error}`;
      await refund.save();

      res.status(500).json({
        success: false,
        message: "Automatic refund failed. Please process manually.",
        error: refundResult.error,
        data: refund,
        requiresManualProcessing: true,
      });
    }
  } catch (error) {
    console.error("Error processing refund:", error);
    res.status(500).json({
      success: false,
      message: "Error processing refund",
      error: error.message,
    });
  }
};

/**
 * Get Refund Statistics (Admin)
 * GET /api/admin/refunds/stats
 */
exports.getRefundStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const stats = await Refund.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalRefunds: { $sum: 1 },
          totalAmount: { $sum: "$finalRefundAmount" },
          approvedAmount: {
            $sum: {
              $cond: [
                { $in: ["$status", ["approved", "processing", "completed"]] },
                "$finalRefundAmount",
                0,
              ],
            },
          },
          avgRefundAmount: { $avg: "$finalRefundAmount" },
          preTripCancellations: {
            $sum: {
              $cond: [{ $eq: ["$refundType", "pre_trip_cancellation"] }, 1, 0],
            },
          },
          postTripIssues: {
            $sum: {
              $cond: [{ $eq: ["$refundType", "post_trip_issue"] }, 1, 0],
            },
          },
          pendingCount: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          underReviewCount: {
            $sum: { $cond: [{ $eq: ["$status", "under_review"] }, 1, 0] },
          },
          approvedCount: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
          processingCount: {
            $sum: { $cond: [{ $eq: ["$status", "processing"] }, 1, 0] },
          },
          completedCount: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          rejectedCount: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
          },
          cancelledCount: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        totalRefunds: 0,
        totalAmount: 0,
        avgRefundAmount: 0,
        preTripCancellations: 0,
        postTripIssues: 0,
        pendingCount: 0,
        approvedCount: 0,
        completedCount: 0,
        rejectedCount: 0,
      },
    });
  } catch (error) {
    console.error("Error fetching refund stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message,
    });
  }
};

/**
 * Auto-expire pending refunds after 7 days
 * This should be called by a cron job
 */
exports.autoExpireRefunds = async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    console.log("=== Auto-expiring refunds ===");
    console.log("Checking refunds created before:", sevenDaysAgo);

    // Find all pending refunds older than 7 days
    const expiredRefunds = await Refund.find({
      status: "pending",
      createdAt: { $lt: sevenDaysAgo },
    });

    console.log(`Found ${expiredRefunds.length} expired refunds`);

    let expiredCount = 0;

    for (const refund of expiredRefunds) {
      refund.status = "rejected";
      refund.rejectedAt = new Date();
      refund.reviewNote =
        "Yêu cầu hoàn tiền đã hết hạn sau 7 ngày chờ xử lý. Vui lòng tạo yêu cầu mới hoặc liên hệ bộ phận hỗ trợ.";
      refund.addTimelineEntry(
        "rejected",
        "Auto-rejected: Request expired after 7 days without review",
        null // System action, no admin user
      );

      await refund.save();
      expiredCount++;

      console.log(`Expired refund ${refund.refundReference}`);
    }

    console.log(`✅ Auto-expired ${expiredCount} refunds`);

    return {
      success: true,
      expiredCount,
      message: `Successfully expired ${expiredCount} refunds`,
    };
  } catch (error) {
    console.error("Error auto-expiring refunds:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
