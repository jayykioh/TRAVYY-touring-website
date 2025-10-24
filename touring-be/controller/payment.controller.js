// controller/payment.controller.js
// Unified payment controller for MoMo and PayPal
// NOTE (prod): Verify amount server-side (recompute from cart/quote), persist order BEFORE redirect,
// verify signature on redirect & IPN, reconcile idempotently, update booking status.

const crypto = require("crypto");
const PaymentSession = require("../models/PaymentSession");
const mongoose = require("mongoose");
const Booking = require("../models/Bookings");
const Tour = require("../models/agency/Tours");
const { Cart, CartItem } = require("../models/Carts");

// Import unified helpers
const {
  clearCartAfterPayment,
  createBookingFromSession,
  FX_VND_USD,
} = require("../utils/paymentHelpers");

// Export helpers for use in other controllers
module.exports.clearCartAfterPayment = clearCartAfterPayment;
module.exports.createBookingFromSession = createBookingFromSession;

// Attempt to get a fetch implementation (Node 18+ has global fetch)
async function getFetch() {
  if (typeof fetch === "function") return fetch; // native
  try {
    return (await import("node-fetch")).default;
  } catch (e) {
    throw new Error(
      "Fetch API not available. Install node-fetch: npm i node-fetch --save"
    );
  }
}

// Build raw signature according to MoMo docs (v2)
function buildRawSignature(payload) {
  return [
    `accessKey=${payload.accessKey}`,
    `amount=${payload.amount}`,
    `extraData=${payload.extraData}`,
    `ipnUrl=${payload.ipnUrl}`,
    `orderId=${payload.orderId}`,
    `orderInfo=${payload.orderInfo}`,
    `partnerCode=${payload.partnerCode}`,
    `redirectUrl=${payload.redirectUrl}`,
    `requestId=${payload.requestId}`,
    `requestType=${payload.requestType}`,
  ].join("&");
}

// ===== Helpers similar to PayPal buildCharge =====
const normDate = (s) => String(s || "").slice(0, 10);
const clamp0 = (n) => Math.max(0, Number(n) || 0);

async function getPricesAndMeta(tourId, date) {
  const t = await Tour.findById(tourId).lean();
  if (!t) throw Object.assign(new Error("TOUR_NOT_FOUND"), { status: 404 });
  const dep = (t.departures || []).find((d) => normDate(d?.date) === date);
  const unitPriceAdult =
    typeof dep?.priceAdult === "number"
      ? dep.priceAdult
      : typeof t.basePrice === "number"
      ? t.basePrice
      : 0;
  const unitPriceChild =
    typeof dep?.priceChild === "number"
      ? dep.priceChild
      : Math.round((unitPriceAdult || 0) * 0.5);
  return {
    name: t.title || t.name || "",
    image: t.imageItems?.[0]?.imageUrl || t.image || "",
    unitPriceAdult,
    unitPriceChild,
  };
}

async function buildMoMoCharge(userId, body) {
  const mode = body?.mode;
  if (mode === "cart") {
    const cart = await Cart.findOne({ userId });
    if (!cart) return { items: [], totalVND: 0, mode };
    const lines = await CartItem.find({ cartId: cart._id, selected: true });
    const items = [];
    let totalVND = 0;
    for (const line of lines) {
      const { name, image, unitPriceAdult, unitPriceChild } =
        await getPricesAndMeta(line.tourId, normDate(line.date));
      const a = clamp0(line.adults);
      const c = clamp0(line.children);
      const amt = unitPriceAdult * a + unitPriceChild * c;
      totalVND += amt;
      items.push({
        name,
        price: amt,
        originalPrice: undefined,
        tourId: line.tourId,
        meta: {
          date: normDate(line.date),
          adults: a,
          children: c,
          unitPriceAdult,
          unitPriceChild,
          image,
        },
      });
    }
    return { items, totalVND, mode };
  }
  if (mode === "buy-now") {
    const inc = body?.item || {};
    const tourId = inc.tourId || inc.id;
    const date = normDate(inc.date);
    if (!tourId || !date)
      throw Object.assign(new Error("INVALID_BUY_NOW"), { status: 400 });
    const { name, image, unitPriceAdult, unitPriceChild } =
      await getPricesAndMeta(tourId, date);
    const a = clamp0(inc.adults);
    const c = clamp0(inc.children);
    const amt = unitPriceAdult * a + unitPriceChild * c;
    return {
      items: [
        {
          name,
          price: amt,
          originalPrice: undefined,
          tourId,
          meta: {
            date,
            adults: a,
            children: c,
            unitPriceAdult,
            unitPriceChild,
            image,
          },
        },
      ],
      totalVND: amt,
      mode,
    };
  }
  // fallback: empty
  return {
    items: [],
    totalVND: Number(body?.amount) || 0,
    mode: mode || "cart",
  };
}

exports.createMoMoPayment = async (req, res) => {
  try {
    const {
      orderInfo = "Thanh toan don tour",
      redirectUrl,
      ipnUrl,
      extraData = "",
      items = [], // snapshot optional
      mode, // 'cart' | 'buy-now'
      item: buyNowItem,
    } = req.body || {};

    // Authoritatively recompute amount from server-side state
    const userId = req.user?.sub || req.user?._id;
    const { items: serverItems, totalVND } = await buildMoMoCharge(userId, {
      mode,
      item: buyNowItem,
    });

    // Apply discount from voucher/promotion
    const discountAmount = Number(req.body.discountAmount) || 0;
    const finalTotalVND = Math.max(0, totalVND - discountAmount);

    // ⚠️ MOMO SANDBOX LIMIT:
    // - Test wallet: Max 10,000,000 VNĐ per transaction
    // - For development, can cap lower (e.g. 50,000) for quick testing
    const MOMO_TEST_LIMIT =
      process.env.MOMO_SANDBOX_MODE === "true"
        ? Number(process.env.MOMO_MAX_AMOUNT) || 10000000 // Default 10 triệu
        : Infinity;

    const cappedAmount = Math.min(finalTotalVND, MOMO_TEST_LIMIT);

    if (cappedAmount !== finalTotalVND) {
      console.log(
        `⚠️ MoMo Test Limit: Amount capped from ${finalTotalVND.toLocaleString()} to ${cappedAmount.toLocaleString()} VNĐ`
      );
      console.log(
        `   Reason: MoMo test wallet limit is ${MOMO_TEST_LIMIT.toLocaleString()} VNĐ`
      );
    }

    console.log("💰 MoMo Price calculation:", {
      originalTotal: totalVND,
      discountAmount,
      finalTotal: finalTotalVND,
      cappedForTest: cappedAmount,
      testLimit: MOMO_TEST_LIMIT,
      voucherCode: req.body.promotionCode || req.body.voucherCode,
    });

    const amt = Number(cappedAmount);
    if (!Number.isFinite(amt) || amt <= 0)
      return res.status(400).json({ error: "INVALID_AMOUNT" });

    // ENV configuration (provide defaults for sandbox testing)
    const partnerCode = process.env.MOMO_PARTNER_CODE || "MOMO"; // sample: MOMO
    const accessKey = process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85"; // sample sandbox
    const secretKey =
      process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz"; // sample sandbox
    const endpoint =
      process.env.MOMO_CREATE_ENDPOINT ||
      "https://test-payment.momo.vn/v2/gateway/api/create";

    const now = Date.now();
    const requestId = partnerCode + now;
    const orderId = partnerCode + now;
    const envRedirect = process.env.MOMO_REDIRECT_URL;
    const envIpn = process.env.MOMO_IPN_URL;
    const payload = {
      partnerCode,
      partnerName: process.env.MOMO_PARTNER_NAME || "Travyy",
      storeId: process.env.MOMO_STORE_ID || "TravyyStore",
      requestId,
      amount: String(amt),
      orderId,
      orderInfo,
      redirectUrl:
        redirectUrl ||
        envRedirect ||
        `${req.protocol}://${req.get("host")}/momo-sandbox`,
      ipnUrl:
        ipnUrl ||
        envIpn ||
        `${req.protocol}://${req.get("host")}/api/payments/momo/ipn`,
      lang: "vi",
      extraData,
      requestType: "captureWallet",
      accessKey,
    };

    const rawSignature = buildRawSignature(payload);
    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    const body = {
      partnerCode: payload.partnerCode,
      partnerName: payload.partnerName,
      storeId: payload.storeId,
      requestId: payload.requestId,
      amount: payload.amount,
      orderId: payload.orderId,
      orderInfo: payload.orderInfo,
      redirectUrl: payload.redirectUrl,
      ipnUrl: payload.ipnUrl,
      lang: payload.lang,
      extraData: payload.extraData,
      requestType: payload.requestType,
      signature,
    };

    const fetchImpl = await getFetch();
    const momoRes = await fetchImpl(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await momoRes.json().catch(() => ({}));
    const isOk = momoRes.ok && data?.payUrl && data?.resultCode === 0;

    if (!isOk) {
      console.warn("[MoMo] create failed", {
        status: momoRes.status,
        data,
        rawSignature,
        sentBody: body,
      });
      return res.status(502).json({
        error: "MOMO_CREATE_FAILED",
        detail: data,
        ...(process.env.NODE_ENV !== "production"
          ? { debug: { rawSignature, requestBody: body } }
          : {}),
      });
    }

    // Persist pending payment session (simple snapshot)
    try {
      await PaymentSession.create({
        userId: req.user?.sub || req.user?._id || new mongoose.Types.ObjectId(),
        provider: "momo",
        orderId,
        requestId,
        amount: amt,
        status: "pending",
        mode: mode || (buyNowItem ? "buy-now" : "cart"),
        items: (Array.isArray(serverItems) ? serverItems : []).map((it) => ({
          name: it.name,
          price: Number(it.price) || 0,
          originalPrice: Number(it.originalPrice) || undefined,
          tourId:
            it.tourId && mongoose.isValidObjectId(it.tourId)
              ? it.tourId
              : undefined,
          meta: it.meta || {},
        })),
        voucherCode:
          req.body.promotionCode || req.body.voucherCode || undefined,
        discountAmount: discountAmount,
        rawCreateResponse: data,
      });
    } catch (dbErr) {
      console.error("Failed to persist payment session", dbErr);
    }

    res.json({
      payUrl: data.payUrl,
      deeplink: data.deeplink,
      orderId,
      requestId,
      resultCode: data.resultCode,
      ...(process.env.NODE_ENV !== "production" ? { rawSignature } : {}),
    });
  } catch (e) {
    console.error("createMoMoPayment error", e);
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
};

// Verify MoMo IPN signature (simplified for sandbox)
function buildIpnRawSignature(p) {
  // Order per MoMo docs v2 IPN (captureWallet)
  return [
    `accessKey=${p.accessKey}`,
    `amount=${p.amount}`,
    `extraData=${p.extraData}`,
    `message=${p.message}`,
    `orderId=${p.orderId}`,
    `orderInfo=${p.orderInfo}`,
    `orderType=${p.orderType}`,
    `partnerCode=${p.partnerCode}`,
    `payType=${p.payType}`,
    `requestId=${p.requestId}`,
    `responseTime=${p.responseTime}`,
    `resultCode=${p.resultCode}`,
    `transId=${p.transId}`,
  ].join("&");
}

exports.handleMoMoIPN = async (req, res) => {
  try {
    const body = req.body || {};
    const secretKey =
      process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz"; // sandbox fallback
    const raw = buildIpnRawSignature(body);
    const expectedSig = crypto
      .createHmac("sha256", secretKey)
      .update(raw)
      .digest("hex");
    if (expectedSig !== body.signature) {
      console.warn("[MoMo] IPN signature mismatch", {
        raw,
        expectedSig,
        got: body.signature,
      });
      return res.status(400).json({ error: "BAD_SIGNATURE" });
    }

    const session = await PaymentSession.findOne({ orderId: body.orderId });
    if (!session) {
      console.warn("[MoMo] IPN unknown orderId", body.orderId);
      return res.status(404).json({ error: "SESSION_NOT_FOUND" });
    }

    session.resultCode = String(body.resultCode);
    session.message = body.message;
    session.transId = body.transId;
    session.payType = body.payType;

    let justPaid = false;
    if (String(body.resultCode) === "0") {
      if (session.status !== "paid") {
        session.status = "paid";
        session.paidAt = new Date();
        justPaid = true;
      }
    } else if (session.status === "pending") {
      session.status = "failed";
    }

    await session.save();

    // If newly paid -> mark voucher as used and create Booking
    if (justPaid) {
      // Mark voucher as used
      if (session.voucherCode && session.userId) {
        try {
          const User = require("../models/Users");
          const Promotion = require("../models/Promotion");

          const promotion = await Promotion.findOne({
            code: session.voucherCode.toUpperCase(),
          });
          if (promotion) {
            // ✅ Tăng usageCount
            await Promotion.findByIdAndUpdate(promotion._id, {
              $inc: { usageCount: 1 },
            });

            // ✅ Đánh dấu user đã sử dụng
            await User.findByIdAndUpdate(session.userId, {
              $addToSet: {
                usedPromotions: {
                  promotionId: promotion._id,
                  code: promotion.code,
                  usedAt: new Date(),
                },
              },
            });
            console.log(
              `✅ [MoMo IPN] Marked promotion ${session.voucherCode} as used for user ${session.userId} and incremented usageCount`
            );
          }
        } catch (voucherError) {
          console.error(
            "[MoMo IPN] Error marking voucher as used:",
            voucherError
          );
        }
      }

      // Create booking (unified helper with idempotent check)
      await createBookingFromSession(session, {
        ipn: body,
        sessionId: session._id,
      });
    }

    // Important: MoMo expects 200/204 to stop retrying
    res.json({ message: "OK" });
  } catch (e) {
    console.error("handleMoMoIPN error", e);
    res.status(500).json({ error: "IPN_ERROR" });
  }
};

// Query session status (polling endpoint)
exports.getMoMoSessionStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const sess = await PaymentSession.findOne({ orderId });
    if (!sess) return res.status(404).json({ error: "NOT_FOUND" });
    res.json({
      orderId: sess.orderId,
      status: sess.status,
      paidAt: sess.paidAt,
      amount: sess.amount,
      resultCode: sess.resultCode,
      message: sess.message,
    });
  } catch (e) {
    res.status(500).json({ error: "STATUS_ERROR" });
  }
};

// Simplified mark-paid endpoint (called by FE after redirect) — demo only.
// This is a UNIFIED handler for both MoMo and PayPal callback
exports.markMoMoPaid = async (req, res) => {
  try {
    const { orderId, resultCode } = req.body || {};
    if (!orderId) return res.status(400).json({ error: "MISSING_ORDER_ID" });

    const sess = await PaymentSession.findOne({ orderId });
    if (!sess) return res.status(404).json({ error: "SESSION_NOT_FOUND" });

    if (sess.status !== "paid") {
      if (String(resultCode) !== "0") {
        sess.status = "failed";
        await sess.save();
        return res.status(400).json({ error: "RESULT_NOT_SUCCESS" });
      }
      sess.status = "paid";
      sess.paidAt = new Date();
      await sess.save();

      // Mark voucher as used if stored in session
      if (sess.voucherCode && sess.userId) {
        try {
          const User = require("../models/Users");
          const Promotion = require("../models/Promotion");

          const promotion = await Promotion.findOne({
            code: sess.voucherCode.toUpperCase(),
          });
          if (promotion) {
            // ✅ Tăng usageCount
            await Promotion.findByIdAndUpdate(promotion._id, {
              $inc: { usageCount: 1 },
            });

            // ✅ Đánh dấu user đã sử dụng
            await User.findByIdAndUpdate(sess.userId, {
              $addToSet: {
                usedPromotions: {
                  promotionId: promotion._id,
                  code: promotion.code,
                  usedAt: new Date(),
                },
              },
            });
            console.log(
              `✅ [MoMo] Marked promotion ${sess.voucherCode} as used for user ${sess.userId} and incremented usageCount`
            );
          }
        } catch (voucherError) {
          console.error("[MoMo] Error marking voucher as used:", voucherError);
          // Don't fail the payment if voucher marking fails
        }
      }
    }

    // Idempotent: create booking if not exists (using unified helper)
    const booking = await createBookingFromSession(sess, {
      markPaid: true,
      sessionId: sess._id,
    });

    res.json({
      status: sess.status,
      paidAt: sess.paidAt,
      bookingId: booking?._id,
    });
  } catch (e) {
    console.error("markMoMoPaid error", e);
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
};

// ===== UNIFIED: Get booking by payment provider and orderId =====
// This replaces the separate endpoint in bookingController
exports.getBookingByPayment = async (req, res) => {
  try {
    console.log(
      `Auth header at GET /api/bookings/by-payment/${req.params.provider}/${req.params.orderId} =>`,
      req.headers.authorization
    );

    const { provider, orderId } = req.params;
    const userId = req.user?.sub;

    if (!provider || !orderId) {
      return res.status(400).json({ error: "MISSING_PARAMS" });
    }

    if (!userId) {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    console.log(
      `[Payment] Looking for booking with provider=${provider}, orderId=${orderId}, userId=${userId}`
    );

    // First check if booking exists
    const booking = await Booking.findOne({
      "payment.provider": provider,
      "payment.orderID": orderId,
      userId,
    })
      .populate("items.tourId", "title imageItems")
      .lean();

    if (booking) {
      console.log(`[Payment] ✅ Found booking:`, booking._id);
      return res.json({ success: true, booking });
    }

    // If no booking yet, check payment session status
    console.log(
      `[Payment] ⏳ Booking not found yet, checking payment session...`
    );
    const session = await PaymentSession.findOne({ orderId, provider });

    if (!session) {
      console.log(`[Payment] ❌ No payment session found`);
      return res
        .status(404)
        .json({
          error: "NOT_FOUND",
          message: "No payment session or booking found",
        });
    }

    console.log(`[Payment] Payment session status: ${session.status}`);

    // If session is paid but no booking, try to create it now
    if (session.status === "paid") {
      console.log(
        `[Payment] 🔄 Session is paid, attempting to create booking...`
      );
      try {
        const newBooking = await createBookingFromSession(session, {
          lateCreation: true,
        });
        return res.json({ success: true, booking: newBooking });
      } catch (createErr) {
        console.error(
          "[Payment] Failed to create booking from paid session:",
          createErr
        );
        return res.status(500).json({
          error: "BOOKING_CREATION_FAILED",
          sessionStatus: session.status,
          message: "Payment completed but booking creation failed",
        });
      }
    }

    // Session exists but not paid yet
    return res.status(202).json({
      success: false,
      pending: true,
      sessionStatus: session.status,
      message: "Payment session found but not completed yet",
    });
  } catch (e) {
    console.error("getBookingByPayment error", e);
    res.status(500).json({ error: "FETCH_BOOKING_FAILED" });
  }
};
