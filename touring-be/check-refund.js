// Quick script to check refund status
const mongoose = require("mongoose");
require("dotenv").config();

async function checkRefund() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected\n");

    // Load models
    const User = require("./models/Users");
    const Booking = require("./models/Bookings");
    const Refund = require("./models/Refund");

    const refundInput = process.argv[2];

    if (!refundInput) {
      console.log("❌ Please provide refund ID or reference");
      console.log("Usage: node check-refund.js <REFUND_ID or REF-XXX>");
      console.log("Example: node check-refund.js REF-MHVN1BG0-EST0");
      process.exit(1);
    }

    // Try to find by reference first, then by ID
    let refund;
    if (refundInput.startsWith("REF-")) {
      refund = await Refund.findOne({ refundReference: refundInput })
        .populate("userId", "fullName email")
        .populate(
          "bookingId",
          "orderRef totalAmount payment.provider payment.status"
        );
    } else {
      refund = await Refund.findById(refundInput)
        .populate("userId", "fullName email")
        .populate(
          "bookingId",
          "orderRef totalAmount payment.provider payment.status"
        );
    }

    if (!refund) {
      console.log("❌ Refund not found");
      console.log(`   Searched for: ${refundInput}`);
      process.exit(1);
    }

    console.log("\n📋 Refund Details:");
    console.log("─".repeat(60));
    console.log("Reference:", refund.refundReference);
    console.log("ID:", refund._id);
    console.log("Status:", refund.status);
    console.log("Type:", refund.refundType);
    console.log(
      "Amount:",
      refund.finalRefundAmount?.toLocaleString() || 0,
      "VND"
    );
    console.log("Percentage:", refund.refundPercentage + "%");
    console.log("\n👤 User:", refund.userId?.fullName || "N/A");
    console.log("   Email:", refund.userId?.email || "N/A");
    console.log(
      "\n📦 Booking:",
      refund.bookingId?.orderRef || refund.bookingId?._id || "N/A"
    );
    console.log(
      "   Total:",
      refund.bookingId?.totalAmount?.toLocaleString() || 0,
      "VND"
    );
    console.log("   Payment:", refund.bookingId?.payment?.provider || "N/A");
    console.log(
      "   Payment Status:",
      refund.bookingId?.payment?.status || "N/A"
    );
    console.log("\n📅 Created:", refund.createdAt);
    console.log("   Reviewed:", refund.reviewedAt || "Not yet");
    console.log("   Completed:", refund.completedAt || "Not yet");

    const canProcess = refund.status === "approved";
    console.log("\n💡 Can process?", canProcess ? "✅ YES" : "❌ NO");
    if (!canProcess) {
      console.log("   Current status:", refund.status);
      console.log("   Required status: approved");
    }
    console.log("─".repeat(60));

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the check
checkRefund();
