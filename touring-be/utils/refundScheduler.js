const cron = require("node-cron");
const refundController = require("../controller/refundController");

/**
 * Setup scheduled tasks for refund management
 */
const setupRefundScheduler = () => {
  // Run every minute to check and expire old refunds
  cron.schedule("* * * * *", async () => {
    console.log("🕒 Running scheduled task: Auto-expire refunds");
    try {
      const result = await refundController.autoExpireRefunds();
      if (result.success && result.expiredCount > 0) {
        console.log(`✅ ${result.message}`);
      }
    } catch (error) {
      console.error("❌ Error in scheduled task:", error);
    }
  });

  console.log("✅ Refund scheduler initialized");
  console.log("   - Checking every minute for expired refunds");
};

module.exports = { setupRefundScheduler };
