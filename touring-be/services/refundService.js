// services/refundService.js
// Service to handle actual refund processing via payment gateways

const axios = require("axios");
const crypto = require("crypto");

/**
 * Process MoMo Refund
 * API Docs: https://developers.momo.vn/#/docs/en/aiov2/?id=refund-api
 */
async function processMoMoRefund({ orderId, transId, amount, description }) {
  try {
    const partnerCode = process.env.MOMO_PARTNER_CODE;
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;
    const endpoint =
      process.env.MOMO_ENDPOINT ||
      "https://test-payment.momo.vn/v2/gateway/api";

    // MoMo Refund request
    const requestId = `REFUND-${Date.now()}`;
    const refundId = `REF-${orderId}-${Date.now()}`;

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&description=${description}&orderId=${orderId}&partnerCode=${partnerCode}&requestId=${requestId}&transId=${transId}`;

    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    const requestBody = {
      partnerCode,
      orderId,
      requestId,
      amount,
      transId, // Original transaction ID from payment
      lang: "vi",
      description: description || "Hoàn tiền booking",
      signature,
    };

    console.log("📤 [MoMo Refund] Request:", {
      orderId,
      amount,
      transId,
      requestId,
    });

    const response = await axios.post(`${endpoint}/refund`, requestBody, {
      headers: { "Content-Type": "application/json" },
      timeout: 30000,
    });

    console.log("📥 [MoMo Refund] Response:", response.data);

    if (response.data.resultCode === 0) {
      return {
        success: true,
        transactionId: response.data.transId,
        refundId: requestId,
        message: response.data.message,
        provider: "momo",
      };
    } else {
      return {
        success: false,
        error: response.data.message,
        resultCode: response.data.resultCode,
        provider: "momo",
      };
    }
  } catch (error) {
    console.error("❌ [MoMo Refund] Error:", error.message);
    return {
      success: false,
      error: error.message,
      provider: "momo",
    };
  }
}

/**
 * Process PayPal Refund
 * API Docs: https://developer.paypal.com/docs/api/payments/v2/#captures_refund
 */
async function processPayPalRefund({
  captureId,
  amount,
  currency = "USD",
  note,
}) {
  try {
    // Get PayPal access token
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const baseURL =
      process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com";

    // Get access token
    const authResponse = await axios.post(
      `${baseURL}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        auth: { username: clientId, password: clientSecret },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const accessToken = authResponse.data.access_token;

    // Refund request
    const refundBody = {
      amount: {
        value: amount.toFixed(2),
        currency_code: currency,
      },
      note_to_payer: note || "Refund for your booking",
    };

    console.log("📤 [PayPal Refund] Request:", {
      captureId,
      amount,
      currency,
    });

    const response = await axios.post(
      `${baseURL}/v2/payments/captures/${captureId}/refund`,
      refundBody,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log("📥 [PayPal Refund] Response:", response.data);

    if (response.data.status === "COMPLETED") {
      return {
        success: true,
        transactionId: response.data.id,
        refundId: response.data.id,
        message: "PayPal refund completed",
        provider: "paypal",
      };
    } else {
      return {
        success: false,
        error: `PayPal refund status: ${response.data.status}`,
        provider: "paypal",
      };
    }
  } catch (error) {
    console.error(
      "❌ [PayPal Refund] Error:",
      error.response?.data || error.message
    );
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      provider: "paypal",
    };
  }
}

/**
 * Main refund processor - routes to appropriate gateway
 */
async function processRefund(booking, refundAmount, refundNote) {
  try {
    const paymentProvider = booking.payment?.provider?.toLowerCase();
    const paymentData = booking.payment;

    console.log("🔄 Processing refund:", {
      bookingId: booking._id,
      provider: paymentProvider,
      amount: refundAmount,
    });

    // 🧪 TEST MODE: Simulate successful refund
    const isTestMode =
      process.env.REFUND_TEST_MODE === "true" ||
      process.env.NODE_ENV === "development";

    if (isTestMode) {
      console.log("🧪 [Test Mode] Simulating refund success");
      return {
        success: true,
        transactionId: `TEST-REF-${Date.now()}`,
        refundId: `SIM-${booking._id}`,
        message: "Refund simulated successfully (test mode)",
        provider: paymentProvider || "test",
        isSimulated: true,
      };
    }

    switch (paymentProvider) {
      case "momo":
        // MoMo refund requires original orderId and transId
        if (!paymentData.orderId || !paymentData.transactionId) {
          throw new Error(
            "Missing MoMo payment data (orderId or transactionId)"
          );
        }

        return await processMoMoRefund({
          orderId: paymentData.orderId,
          transId: paymentData.transactionId,
          amount: Math.round(refundAmount), // MoMo uses integer
          description: refundNote || "Hoàn tiền đặt tour",
        });

      case "paypal":
        // PayPal refund requires capture ID
        const captureId =
          paymentData.transactionId || paymentData.providerData?.id;
        if (!captureId) {
          throw new Error("Missing PayPal capture ID");
        }

        // Convert VND to USD for PayPal
        const FX_VND_USD = Number(process.env.FX_VND_USD || 0.000039);
        const refundUSD = refundAmount * FX_VND_USD;

        return await processPayPalRefund({
          captureId,
          amount: refundUSD,
          currency: "USD",
          note: refundNote || "Refund for your tour booking",
        });

      default:
        // Manual refund (bank transfer, cash, etc.)
        console.warn(
          `⚠️ Manual refund required for provider: ${
            paymentProvider || "unknown"
          }`
        );
        return {
          success: true,
          requiresManualProcessing: true,
          message: "Refund requires manual processing (bank transfer)",
          provider: paymentProvider || "manual",
        };
    }
  } catch (error) {
    console.error("❌ Refund processing error:", error);
    return {
      success: false,
      error: error.message,
      requiresManualProcessing: true,
    };
  }
}

module.exports = {
  processRefund,
  processMoMoRefund,
  processPayPalRefund,
};
