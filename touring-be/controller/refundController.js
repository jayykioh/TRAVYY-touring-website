const mongoose = require("mongoose");
const Refund = require("../models/Refund");
const Booking = require("../models/Bookings");
const User = require("../models/Users");
const { processRefund } = require("../services/refundService");
const { sendMail } = require("../utils/emailService");
const crypto = require("crypto");
const axios = require("axios");

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
      orderRef: booking.orderRef, // ✅ Save booking reference
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
      orderRef: booking.orderRef, // ✅ Save booking reference
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
      .populate("bookingId", "  items totalAmount status payment.orderId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // ✅ Auto-update orderRef for refunds missing it (for old refunds)
    let updatedCount = 0;
    for (const refund of refunds) {
      if (!refund.orderRef && refund.bookingId?.orderRef) {
        refund.orderRef = refund.bookingId.orderRef;
        await refund.save();
        updatedCount++;
      }
    }
    if (updatedCount > 0) {
      console.log(`✅ Auto-updated orderRef for ${updatedCount} refunds`);
    }

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
        "orderRef items totalAmount payment.provider payment.status payment.orderId createdAt"
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

    // ✅ Auto-update orderRef if missing (for old refunds)
    if (!refund.orderRef && refund.bookingId?.orderRef) {
      refund.orderRef = refund.bookingId.orderRef;
      await refund.save();
      console.log(`✅ Auto-updated orderRef for refund ${refund._id}`);
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
      .populate("userId", "name email phone")
      .populate("bookingId", "orderRef items totalAmount payment.orderId")
      .populate("reviewedBy", "fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // ✅ Auto-update orderRef for refunds missing it (for old refunds)
    let updatedCount = 0;
    for (const refund of refunds) {
      if (!refund.orderRef && refund.bookingId?.orderRef) {
        refund.orderRef = refund.bookingId.orderRef;
        await refund.save();
        updatedCount++;
      }
    }
    if (updatedCount > 0) {
      console.log(
        `✅ [Admin] Auto-updated orderRef for ${updatedCount} refunds`
      );
    }

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

      console.log(
        `✅ [Refund Approved] ${refund._id} - Waiting for user to provide bank info`
      );

      // 📧 Send approval email asking for bank info
      try {
        const user = await User.findById(refund.userId);
        const booking = refund.bookingId;

        if (user && booking) {
          await sendApprovalEmail(user, refund, booking);
        }
      } catch (emailError) {
        console.error("Error sending approval email:", emailError);
        // Continue even if email fails
      }

      // Return immediately - user must provide bank info before processing
      res.json({
        success: true,
        message:
          "Refund approved successfully. User will be notified to provide bank information.",
        data: refund,
        autoProcessed: false,
        requiresBankInfo: true,
      });
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
 * Send approval email asking for bank information
 */
const sendApprovalEmail = async (user, refund, booking) => {
  try {
    const userEmail = user.email || user.emailAddress;
    if (!userEmail) {
      console.log("⚠️ No email found for user:", user._id);
      return;
    }

    const formatVND = (amount) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);
    };

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #007980 0%, #005f65 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px 20px; border: 1px solid #e5e7eb; border-top: none; }
    .success-badge { background: #dcfce7; color: #166534; padding: 15px 20px; border-radius: 8px; text-align: center; font-weight: bold; margin: 20px 0; border: 2px solid #86efac; }
    .info-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 15px 0; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; margin: 20px 0; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .warning-box { background: #fef3c7; border: 2px solid #fbbf24; border-radius: 8px; padding: 15px; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none; font-size: 13px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="header">
    <h1>✅ Yêu Cầu Hoàn Tiền Được Chấp Nhận</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">TRAVYY Touring</p>
  </div>

  <div class="content">
    <p>Xin chào <strong>${
      user.fullName || user.name || "Quý khách"
    }</strong>,</p>
    
    <div class="success-badge">
      🎉 Yêu cầu hoàn tiền của bạn đã được chấp nhận!
    </div>

    <p>Chúng tôi vui mừng thông báo rằng yêu cầu hoàn tiền <strong>${
      refund.refundReference
    }</strong> của bạn đã được xem xét và chấp nhận.</p>

    <div class="info-box">
      <h3 style="margin-top: 0; color: #111827;">💰 Số Tiền Hoàn</h3>
      <p style="font-size: 24px; font-weight: bold; color: #059669; margin: 10px 0;">${formatVND(
        refund.finalRefundAmount
      )}</p>
      <p style="font-size: 14px; color: #6b7280;">Mã booking: ${
        booking.orderRef || booking._id
      }</p>
    </div>

    <div class="warning-box">
      <h3 style="margin-top: 0; color: #92400e; font-size: 16px;">⚠️ Cần Thực Hiện Ngay</h3>
      <p style="color: #92400e; margin: 10px 0;"><strong>Để nhận tiền hoàn, bạn cần cung cấp thông tin tài khoản ngân hàng.</strong></p>
      <p style="color: #92400e; font-size: 14px;">Vui lòng nhấn vào nút bên dưới và điền đầy đủ thông tin ngân hàng của bạn.</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/profile/refunds" class="cta-button">
        📝 Cung Cấp Thông Tin Ngân Hàng
      </a>
    </div>

    <div class="info-box">
      <h4 style="margin-top: 0; color: #374151;">📋 Thông Tin Cần Cung Cấp:</h4>
      <ul style="color: #6b7280; font-size: 14px; margin: 10px 0; padding-left: 20px;">
        <li>Tên ngân hàng</li>
        <li>Số tài khoản</li>
        <li>Tên chủ tài khoản (phải khớp với thông tin đăng ký)</li>
        <li>Chi nhánh (không bắt buộc)</li>
      </ul>
    </div>

    <div style="background: #eff6ff; border: 1px solid #93c5fd; border-radius: 8px; padding: 12px; margin: 15px 0;">
      <p style="color: #1e40af; font-size: 13px; margin: 5px 0;">
        <strong>💡 Lưu ý:</strong> Sau khi bạn cung cấp thông tin ngân hàng, tiền sẽ được chuyển vào tài khoản trong vòng <strong>3-5 ngày làm việc</strong>.
      </p>
    </div>

    <p style="margin-top: 25px; color: #6b7280; font-size: 14px;">
      Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi qua email hoặc hotline.
    </p>

    <p style="margin-top: 20px; color: #6b7280;">
      Trân trọng,<br>
      <strong>Đội ngũ TRAVYY Touring</strong>
    </p>
  </div>

  <div class="footer">
    <p><strong>TRAVYY Touring</strong></p>
    <p>Email: support@travyy.com | Hotline: 1900-xxxx</p>
    <p style="font-size: 11px; color: #9ca3af; margin-top: 10px;">© 2025 TRAVYY Touring. All rights reserved.</p>
  </div>
</body>
</html>
    `;

    await sendMail(
      userEmail,
      `✅ Refund Approved - Cần Cung Cấp Thông Tin Ngân Hàng - ${refund.refundReference}`,
      emailHtml
    );

    console.log(
      `📧 Refund approval email sent to ${userEmail} for refund ${refund.refundReference}`
    );
  } catch (error) {
    console.error("Error sending approval email:", error);
    // Don't throw - email failure shouldn't break the process
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

    // Can only process approved or processing refunds
    // "approved" = first time processing
    // "processing" = retry after failure
    if (!["approved", "processing"].includes(refund.status)) {
      console.log(
        `❌ [Process Refund] Invalid status: ${refund.status} (must be approved or processing)`
      );
      return res.status(400).json({
        success: false,
        message: `Cannot process refund in ${refund.status} status. Must be approved or processing.`,
        currentStatus: refund.status,
        refundId: refund._id,
      });
    }

    // Check if bank info is provided when required
    if (!refund.bankInfo || !refund.bankInfo.accountNumber) {
      console.log(`⚠️ [Process Refund] No bank info provided yet`);
      return res.status(400).json({
        success: false,
        message:
          "Cannot process refund without bank information. User must provide bank details first.",
        requiresBankInfo: true,
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

    // Update status to processing (if not already)
    if (refund.status !== "processing") {
      refund.status = "processing";
      refund.addTimelineEntry(
        "processing",
        note || "Starting refund payment processing",
        adminId
      );
    } else {
      refund.addTimelineEntry(
        "processing",
        note || "Retrying refund payment processing",
        adminId
      );
    }

    refund.refundMethod = refundMethod || "original_payment";

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

      // 📧 Send completion email to user
      try {
        const user = await User.findById(refund.userId);
        if (user) {
          await sendRefundCompletionEmail(refund, booking, user);
        }
      } catch (emailError) {
        console.error("Error sending refund email:", emailError);
        // Continue even if email fails
      }

      res.json({
        success: true,
        message: refundResult.requiresManualProcessing
          ? "Refund marked for manual processing"
          : "Refund processed successfully via payment gateway",
        data: refund,
        refundResult,
      });
    } else {
      // Refund failed - mark as needing manual processing and keep approved status
      // This allows admin to complete it manually via script or UI
      refund.status = "approved";
      refund.addTimelineEntry(
        "approved",
        `⚠️ Automatic refund failed: ${refundResult.error}. Changed to manual processing mode. Admin can complete this refund manually.`,
        adminId
      );

      refund.processingNote = `Auto-refund failed: ${refundResult.error}. Requires manual bank transfer.`;
      refund.requiresManualProcessing = true; // Add flag for UI
      await refund.save();

      res.status(200).json({
        success: false,
        autoProcessFailed: true,
        message: `Automatic refund via ${refundResult.provider} failed. Refund has been marked for manual processing. Please complete the bank transfer manually and use the manual completion script.`,
        error: refundResult.error,
        data: refund,
        requiresManualProcessing: true,
        instructions:
          "Use: node scripts/manual-complete-refund.js " +
          refund._id +
          " <transactionId> <note>",
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

/**
 * Send refund completion email to user
 * @param {Object} refund - Refund document
 * @param {Object} booking - Booking document
 * @param {Object} user - User document
 */
const sendRefundCompletionEmail = async (refund, booking, user) => {
  try {
    const userEmail = user.email || user.emailAddress;
    if (!userEmail) {
      console.log("⚠️ No email found for user:", user._id);
      return;
    }

    const formatVND = (amount) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);
    };

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #007980 0%, #005f65 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      background: #ffffff;
      padding: 30px 20px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .success-badge {
      background: #dcfce7;
      color: #166534;
      padding: 10px 20px;
      border-radius: 8px;
      text-align: center;
      font-weight: bold;
      margin: 20px 0;
      border: 2px solid #86efac;
    }
    .info-box {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 15px;
      margin: 15px 0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      color: #6b7280;
      font-size: 14px;
    }
    .info-value {
      font-weight: 600;
      color: #111827;
      font-size: 14px;
    }
    .amount-highlight {
      background: #dcfce7;
      color: #166534;
      font-size: 20px;
      font-weight: bold;
      padding: 15px;
      text-align: center;
      border-radius: 8px;
      margin: 20px 0;
    }
    .bank-info {
      background: #eff6ff;
      border: 2px solid #93c5fd;
      border-radius: 8px;
      padding: 15px;
      margin: 15px 0;
    }
    .bank-info h3 {
      color: #1e40af;
      margin-top: 0;
      font-size: 16px;
    }
    .footer {
      background: #f9fafb;
      padding: 20px;
      text-align: center;
      border-radius: 0 0 10px 10px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .footer p {
      margin: 5px 0;
      font-size: 13px;
      color: #6b7280;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #007980 0%, #005f65 100%);
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }
    .note {
      background: #fef3c7;
      border: 1px solid #fcd34d;
      border-radius: 8px;
      padding: 12px;
      margin: 15px 0;
      font-size: 13px;
      color: #92400e;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>✅ Hoàn Tiền Thành Công</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">TRAVYY Touring</p>
  </div>

  <div class="content">
    <p>Xin chào <strong>${
      user.fullName || user.name || "Quý khách"
    }</strong>,</p>
    
    <div class="success-badge">
      🎉 Yêu cầu hoàn tiền của bạn đã được xử lý thành công!
    </div>

    <p>Chúng tôi xin thông báo rằng yêu cầu hoàn tiền của bạn đã được xử lý và hoàn tất.</p>

    <div class="amount-highlight">
      💰 Số tiền hoàn: ${formatVND(refund.finalRefundAmount)}
    </div>

    <div class="info-box">
      <h3 style="margin-top: 0; color: #111827;">Thông Tin Refund</h3>
      <div class="info-row">
        <span class="info-label">Mã Refund:</span>
        <span class="info-value">${refund.refundReference}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Mã Booking:</span>
        <span class="info-value">${booking.orderRef || booking._id}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Loại Refund:</span>
        <span class="info-value">${
          refund.refundType === "pre_trip_cancellation"
            ? "Hủy trước chuyến đi"
            : "Vấn đề sau chuyến đi"
        }</span>
      </div>
      <div class="info-row">
        <span class="info-label">Tỷ lệ hoàn:</span>
        <span class="info-value">${refund.refundPercentage}%</span>
      </div>
      <div class="info-row">
        <span class="info-label">Ngày xử lý:</span>
        <span class="info-value">${new Date(
          refund.completedAt
        ).toLocaleDateString("vi-VN")}</span>
      </div>
    </div>

    ${
      refund.bankInfo?.accountNumber
        ? `
    <div class="bank-info">
      <h3>🏦 Thông Tin Tài Khoản Nhận Tiền</h3>
      <div class="info-row">
        <span class="info-label">Ngân hàng:</span>
        <span class="info-value">${refund.bankInfo.bankName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Số tài khoản:</span>
        <span class="info-value">${refund.bankInfo.accountNumber}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Chủ tài khoản:</span>
        <span class="info-value">${refund.bankInfo.accountName}</span>
      </div>
    </div>
    `
        : ""
    }

    ${
      refund.refundPayment?.transactionId
        ? `
    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Mã giao dịch:</span>
        <span class="info-value">${refund.refundPayment.transactionId}</span>
      </div>
      ${
        refund.refundPayment.provider
          ? `
      <div class="info-row">
        <span class="info-label">Phương thức:</span>
        <span class="info-value">${refund.refundPayment.provider}</span>
      </div>
      `
          : ""
      }
    </div>
    `
        : ""
    }

    <div class="note">
      <strong>📌 Lưu ý:</strong><br>
      • Tiền sẽ được chuyển vào tài khoản trong vòng 3-5 ngày làm việc<br>
      • Vui lòng kiểm tra tài khoản ngân hàng của bạn<br>
      • Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi
    </div>

    <div style="text-align: center;">
      <a href="${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/profile/refunds" class="button">
        Xem Chi Tiết Refund
      </a>
    </div>

    <p style="margin-top: 30px;">
      Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của TRAVYY Touring. Chúng tôi hy vọng có cơ hội được phục vụ bạn trong tương lai!
    </p>

    <p style="color: #6b7280; font-size: 14px;">
      Trân trọng,<br>
      <strong>Đội ngũ TRAVYY Touring</strong>
    </p>
  </div>

  <div class="footer">
    <p><strong>TRAVYY Touring</strong></p>
    <p>Email: support@travyy.com | Hotline: 1900-xxxx</p>
    <p style="font-size: 12px; color: #9ca3af; margin-top: 10px;">
      © 2025 TRAVYY Touring. All rights reserved.
    </p>
  </div>
</body>
</html>
    `;

    await sendMail(
      userEmail,
      `✅ Hoàn Tiền Thành Công - ${refund.refundReference}`,
      emailHtml
    );

    console.log(
      `📧 Refund completion email sent to ${userEmail} for refund ${refund.refundReference}`
    );
  } catch (error) {
    console.error("Error sending refund completion email:", error);
    // Don't throw - email failure shouldn't break the refund process
  }
};

// Export the email function so it can be used in other places
exports.sendRefundCompletionEmail = sendRefundCompletionEmail;

/**
 * Create Manual Refund Payment (MoMo Sandbox)
 * POST /api/refunds/admin/:refundId/create-manual-payment
 * For admin to create a MoMo payment link to transfer refund manually
 */
exports.createManualRefundPayment = async (req, res) => {
  try {
    const { refundId } = req.params;

    console.log("=== Create Manual Refund Payment ===");
    console.log("Refund ID:", refundId);

    // Validate refund
    const refund = await Refund.findById(refundId)
      .populate("userId", "email fullname")
      .populate("bookingId");

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund not found",
      });
    }

    // Check status - Allow approved refunds even without requiresManualProcessing flag
    console.log("Refund status:", refund.status);
    console.log("Requires manual processing:", refund.requiresManualProcessing);

    if (refund.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: `Refund must be in 'approved' status. Current status: ${refund.status}`,
      });
    }

    // Check bank info
    if (!refund.bankInfo?.accountNumber) {
      return res.status(400).json({
        success: false,
        message: "User bank information is required",
      });
    }

    // Create MoMo payment request
    const partnerCode = process.env.MOMO_PARTNER_CODE;
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;
    const endpoint =
      process.env.MOMO_CREATE_ENDPOINT ||
      "https://test-payment.momo.vn/v2/gateway/api/create";
    // Redirect back with payment success flag for auto-verification
    const redirectUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/admin/refunds?paymentSuccess=true&refundId=${refund._id}`;
    const ipnUrl = `${
      process.env.BACKEND_URL || "http://localhost:4000"
    }/api/refunds/momo-refund-ipn`;

    console.log("MoMo Config:", {
      hasPartnerCode: !!partnerCode,
      hasAccessKey: !!accessKey,
      hasSecretKey: !!secretKey,
      endpoint,
      redirectUrl,
      ipnUrl,
    });

    // Validate MoMo credentials
    if (!partnerCode || !accessKey || !secretKey) {
      return res.status(500).json({
        success: false,
        message:
          "MoMo credentials not configured. Please check environment variables.",
        missing: {
          MOMO_PARTNER_CODE: !partnerCode,
          MOMO_ACCESS_KEY: !accessKey,
          MOMO_SECRET_KEY: !secretKey,
        },
      });
    }

    const orderId = `REFUND-${refund._id}-${Date.now()}`;
    const requestId = orderId;
    const amount = Math.round(
      refund.finalRefundAmount || refund.refundableAmount || 0
    );

    // Validate amount
    if (!amount || amount < 1000 || amount > 50000000) {
      return res.status(400).json({
        success: false,
        message: `Invalid refund amount: ${amount} VND. Must be between 1,000 and 50,000,000 VND`,
        refundData: {
          finalRefundAmount: refund.finalRefundAmount,
          refundableAmount: refund.refundableAmount,
        },
      });
    }

    const orderInfo = `Refund ${refund.refundReference} - ${refund.bankInfo.accountName}`;
    const extraData = Buffer.from(
      JSON.stringify({
        refundId: refund._id.toString(),
        type: "manual_refund",
      })
    ).toString("base64");

    console.log("Amount validation:", {
      finalRefundAmount: refund.finalRefundAmount,
      refundableAmount: refund.refundableAmount,
      calculatedAmount: amount,
    });

    // Create signature
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=captureWallet`;

    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    const requestBody = {
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType: "captureWallet",
      signature,
      lang: "vi",
    };

    console.log("📤 [MoMo Payment] Creating payment request:", {
      orderId,
      amount,
      orderInfo,
    });

    const response = await axios.post(endpoint, requestBody, {
      headers: { "Content-Type": "application/json" },
      timeout: 30000,
    });

    console.log("📥 [MoMo Payment] Response:", response.data);

    if (response.data.resultCode === 0) {
      // Generate QR code URL if not provided by MoMo
      const qrCodeUrl =
        response.data.qrCodeUrl ||
        `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
          response.data.payUrl
        )}`;

      // Update refund with payment info
      refund.manualPayment = {
        orderId,
        payUrl: response.data.payUrl,
        qrCodeUrl: qrCodeUrl,
        deeplink: response.data.deeplink || response.data.payUrl,
        deeplinkMiniApp: response.data.deeplinkMiniApp,
        createdAt: new Date(),
      };

      refund.timeline.push({
        status: "manual_payment_created",
        timestamp: new Date(),
        note: `Admin created manual payment link: ${orderId}`,
        performedBy: req.userId,
      });

      await refund.save();

      return res.status(200).json({
        success: true,
        message: "Manual payment created successfully",
        payment: {
          payUrl: response.data.payUrl,
          qrCodeUrl: qrCodeUrl,
          deeplink: response.data.deeplink || response.data.payUrl,
          amount: amount,
          orderId: orderId,
        },
      });
    } else {
      console.error("❌ MoMo payment creation failed:", response.data);
      return res.status(400).json({
        success: false,
        message: "Failed to create MoMo payment",
        error: response.data.message || "MoMo returned error",
        resultCode: response.data.resultCode,
        details: response.data,
      });
    }
  } catch (error) {
    console.error("❌ Error creating manual refund payment:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });
    return res.status(500).json({
      success: false,
      message: "Error creating manual refund payment",
      error: error.message,
      details: error.response?.data || error.toString(),
    });
  }
};

/**
 * Check and Complete Manual Payment
 * POST /api/admin/refunds/:refundId/check-payment
 * For when IPN is not accessible (localhost testing)
 */
exports.checkAndCompleteManualPayment = async (req, res) => {
  try {
    const { refundId } = req.params;

    console.log("=== Checking Manual Payment Status ===");
    console.log("Refund ID:", refundId);

    const refund = await Refund.findById(refundId)
      .populate("userId", "email fullname")
      .populate("bookingId");

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund not found",
      });
    }

    if (!refund.manualPayment?.orderId) {
      return res.status(400).json({
        success: false,
        message: "No manual payment found for this refund",
      });
    }

    // Query MoMo payment status
    const partnerCode = process.env.MOMO_PARTNER_CODE;
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;
    const endpoint = "https://test-payment.momo.vn/v2/gateway/api/query";

    const orderId = refund.manualPayment.orderId;
    const requestId = `CHECK-${Date.now()}`;

    const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=${partnerCode}&requestId=${requestId}`;

    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    const requestBody = {
      partnerCode,
      requestId,
      orderId,
      signature,
      lang: "vi",
    };

    console.log("📤 Querying MoMo payment status...");

    const response = await axios.post(endpoint, requestBody, {
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    });

    console.log("📥 MoMo response:", response.data);

    if (response.data.resultCode === 0 && response.data.transId) {
      // Payment completed - mark refund as completed
      refund.status = "completed";
      refund.completedAt = new Date();
      refund.requiresManualProcessing = false;
      refund.refundPayment = {
        method: "momo_manual",
        transactionId: response.data.transId,
        processedAt: new Date(),
        amount: response.data.amount,
        status: "completed",
      };

      refund.manualPayment.completedAt = new Date();

      refund.timeline.push({
        status: "completed",
        timestamp: new Date(),
        note: `Manual payment completed via MoMo. Transaction: ${response.data.transId}`,
        performedBy: req.userId,
      });

      await refund.save();

      // Update booking
      const booking = refund.bookingId;
      booking.status = "refunded";
      booking.refundedAt = new Date();
      await booking.save();

      // Send completion email
      const user = refund.userId;
      if (user && user.email) {
        try {
          console.log(`📧 Sending completion email to ${user.email}...`);
          await sendRefundCompletionEmail(refund, booking, user);
          console.log(`✅ Completion email sent successfully to ${user.email}`);
        } catch (emailError) {
          console.error("❌ Failed to send email:", emailError);
          console.error("Email error details:", emailError.message);
        }
      } else {
        console.warn("⚠️ Cannot send email: User or email not found");
      }

      console.log(`✅ Refund completed: ${refund.refundReference}`);

      return res.status(200).json({
        success: true,
        message: "Payment verified and refund completed successfully",
        refund: {
          status: refund.status,
          transactionId: response.data.transId,
          completedAt: refund.completedAt,
        },
      });
    } else if (response.data.resultCode === 0) {
      // Payment exists but not completed yet
      return res.status(200).json({
        success: false,
        message: "Payment not completed yet",
        paymentStatus: response.data.message,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Payment check failed",
        error: response.data.message,
      });
    }
  } catch (error) {
    console.error("❌ Error checking payment:", error);
    return res.status(500).json({
      success: false,
      message: "Error checking payment status",
      error: error.message,
    });
  }
};

/**
 * MoMo IPN Handler for Manual Refund Payments
 * POST /api/refunds/momo-refund-ipn
 */
exports.handleMoMoRefundIPN = async (req, res) => {
  try {
    console.log("\n\n");
    console.log("=".repeat(80));
    console.log("🔔 MoMo Refund IPN Received at:", new Date().toISOString());
    console.log("=".repeat(80));
    console.log("Full IPN Data:", JSON.stringify(req.body, null, 2));
    console.log("=".repeat(80));

    const {
      orderId,
      resultCode,
      message,
      transId,
      amount,
      extraData,
      signature,
    } = req.body;

    // Verify signature
    const secretKey = process.env.MOMO_SECRET_KEY;
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const partnerCode = process.env.MOMO_PARTNER_CODE;

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${req.body.orderInfo}&orderType=${req.body.orderType}&partnerCode=${partnerCode}&payType=${req.body.payType}&requestId=${req.body.requestId}&responseTime=${req.body.responseTime}&resultCode=${resultCode}&transId=${transId}`;

    const expectedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("❌ Invalid MoMo signature");
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    // Decode extraData to get refundId
    const decodedData = JSON.parse(Buffer.from(extraData, "base64").toString());
    const refundId = decodedData.refundId;

    const refund = await Refund.findById(refundId).populate("bookingId");

    if (!refund) {
      console.error("❌ Refund not found:", refundId);
      return res
        .status(404)
        .json({ success: false, message: "Refund not found" });
    }

    if (resultCode === 0) {
      // Payment successful - complete the refund
      refund.status = "completed";
      refund.completedAt = new Date();
      refund.requiresManualProcessing = false;
      refund.refundPayment = {
        method: "momo_manual",
        transactionId: transId,
        processedAt: new Date(),
        amount: amount,
        status: "completed",
      };

      refund.timeline.push({
        status: "completed",
        timestamp: new Date(),
        note: `Manual refund payment completed via MoMo. Transaction: ${transId}`,
      });

      await refund.save();

      // Update booking
      const booking = refund.bookingId;
      booking.status = "refunded";
      booking.refundedAt = new Date();
      await booking.save();

      // Send completion email
      const user = await User.findById(refund.userId);
      console.log("📧 Sending completion email...");
      console.log(
        "User:",
        user ? `${user.fullname} (${user.email})` : "Not found"
      );

      if (user && user.email) {
        try {
          console.log(
            `📧 Calling sendRefundCompletionEmail with refund, booking, user...`
          );
          await sendRefundCompletionEmail(refund, booking, user);
          console.log(`✅ Completion email sent successfully to ${user.email}`);
        } catch (emailError) {
          console.error("❌ Failed to send email:", emailError);
          console.error("Email error details:", emailError.message);
        }
      } else {
        console.warn("⚠️ No user email found, skipping email");
      }

      console.log(`✅ Manual refund completed: ${refund.refundReference}`);
    } else {
      // Payment failed
      refund.timeline.push({
        status: "manual_payment_failed",
        timestamp: new Date(),
        note: `Manual payment failed: ${message}`,
      });
      await refund.save();

      console.log(`❌ Manual refund payment failed: ${message}`);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Error handling MoMo refund IPN:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
