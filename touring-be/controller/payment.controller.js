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
const { clearCartAfterPayment, createBookingFromSession, markBookingAsPaid, markBookingAsFailed, FX_VND_USD } = require("../utils/paymentHelpers");

// Helper function to restore cart from failed payment session
async function restoreCartFromPaymentSession(session) {
  try {
    if (!session || !session.userId || !session.items || session.items.length === 0) {
      console.log(`[Payment] No items to restore for session ${session?._id}`);
      return false;
    }

    const { Cart, CartItem } = require("../models/Carts");
    
    // Find or create cart for user
    let cart = await Cart.findOne({ userId: session.userId });
    if (!cart) {
      cart = await Cart.create({ userId: session.userId });
      console.log(`[Payment] Created new cart for user ${session.userId}`);
    }

    // Restore items to cart
    let restoredCount = 0;
    for (const item of session.items) {
      // Check if item already exists in cart to avoid duplicates
      const existingItem = await CartItem.findOne({
        cartId: cart._id,
        tourId: item.tourId,
        date: item.meta?.date || '',
        adults: item.meta?.adults || 0,
        children: item.meta?.children || 0
      });

      if (!existingItem) {
        await CartItem.create({
          cartId: cart._id,
          tourId: item.tourId,
          name: item.name,
          image: item.meta?.image || '',
          date: item.meta?.date || '',
          adults: item.meta?.adults || 0,
          children: item.meta?.children || 0,
          unitPriceAdult: item.meta?.unitPriceAdult || 0,
          unitPriceChild: item.meta?.unitPriceChild || 0,
          selected: true // Mark as selected for payment
        });
        restoredCount++;
      }
    }

    if (restoredCount > 0) {
      console.log(`[Payment] ✅ Restored ${restoredCount} items to cart for user ${session.userId} from failed payment`);
      return true;
    } else {
      console.log(`[Payment] All items already exist in cart for user ${session.userId}`);
      return false;
    }
  } catch (error) {
    console.error(`[Payment] ❌ Failed to restore cart from session ${session?._id}:`, error);
    return false;
  }
}

// Helper function to hold seats temporarily during payment
async function holdSeatsForPayment(session) {
  try {
    if (!session || !session.items || session.items.length === 0) {
      console.log(`[Payment] No items to hold seats for session ${session?._id}`);
      return false;
    }

    console.log(`[Payment] 🔒 Holding seats for payment session ${session._id}`);
    
    for (const item of session.items) {
      if (!item.tourId) continue;
      
      const tour = await Tour.findById(item.tourId);
      if (!tour) {
        console.log(`   ⚠️ Tour not found, skipping: ${item.tourId}`);
        continue;
      }

      const dep = tour.departures.find(d => normDate(d.date) === item.meta?.date);
      if (!dep) {
        console.log(`   ⚠️ Departure not found, skipping: ${item.meta?.date}`);
        continue;
      }

      const needed = (item.meta?.adults || 0) + (item.meta?.children || 0);
      const currentSeats = dep.seatsLeft || 0;

      if (currentSeats < needed) {
        throw new Error(`INSUFFICIENT_SEATS: Need ${needed}, available ${currentSeats} for tour ${item.name}`);
      }

      // Temporarily reduce seats (hold them)
      await Tour.updateOne(
        { _id: tour._id, "departures.date": dep.date },
        { $inc: { "departures.$.seatsLeft": -needed } }
      );

      console.log(`   ✅ Held ${needed} seats for tour ${item.name} (${item.tourId})`);
    }

    // Set timeout to release seats after 1 minute if payment not completed
 // controller/payment.controller.js (trong setTimeout của holdSeatsForPayment)
setTimeout(async () => {
  try {
    const currentSession = await PaymentSession.findById(session._id);
    if (currentSession && currentSession.status === 'pending') {
      console.log(`[Payment] ⏰ Timeout reached for session ${session._id}, releasing held seats`);
      await releaseSeatsForPayment(session);
      currentSession.status = 'expired';
      await currentSession.save();
      await restoreCartFromPaymentSession(session);

      // 🔻 Tạo booking thất bại để hiện trong lịch sử (phục vụ "Thanh toán lại")
      try {
        const existing = await Booking.findOne({ "payment.orderId": currentSession.orderId });
        if (!existing) {
          await createBookingFromSession(currentSession, { failReason: "timeout" }); // => status=cancelled
        }
      } catch (e) {
        console.warn("[Payment] Failed to create failed booking on timeout:", e.message);
      }

      // 🔻 (tuỳ chọn) Gửi mail thông báo hết hạn thanh toán
      try {
        const User = require("../models/Users");
        const user = await User.findById(currentSession.userId);
        if (user?.email) {
          const { sendPaymentTimeoutNotification } = require("../controller/notifyController");
          if (typeof sendPaymentTimeoutNotification === "function") {
            await sendPaymentTimeoutNotification({
              email: user.email,
              orderId: currentSession.orderId,
              items: currentSession.items,
            });
          }
        }
      } catch (e) {
        console.warn("[Payment] Failed to send timeout notification:", e.message);
      }
    }
  } catch (error) {
    console.error(`[Payment] ❌ Failed to release seats on timeout for session ${session._id}:`, error);
  }
}, 60 * 1000); // 1 minute

    return true;
  } catch (error) {
    console.error(`[Payment] ❌ Failed to hold seats for session ${session?._id}:`, error);
    throw error;
  }
}

// Helper function to release held seats
async function releaseSeatsForPayment(session) {
  try {
    if (!session || !session.items || session.items.length === 0) {
      console.log(`[Payment] No items to release seats for session ${session?._id}`);
      return false;
    }

    console.log(`[Payment] 🔓 Releasing held seats for payment session ${session._id}`);
    
    for (const item of session.items) {
      if (!item.tourId) continue;
      
      const tour = await Tour.findById(item.tourId);
      if (!tour) continue;

      const dep = tour.departures.find(d => normDate(d.date) === item.meta?.date);
      if (!dep) continue;

      const needed = (item.meta?.adults || 0) + (item.meta?.children || 0);

      // Release seats back
      await Tour.updateOne(
        { _id: tour._id, "departures.date": dep.date },
        { $inc: { "departures.$.seatsLeft": needed } }
      );

      console.log(`   ✅ Released ${needed} seats for tour ${item.name} (${item.tourId})`);
    }

    return true;
  } catch (error) {
    console.error(`[Payment] ❌ Failed to release seats for session ${session?._id}:`, error);
    return false;
  }
}

// Helper function to confirm held seats (permanent reduction)
async function confirmSeatsForPayment(session) {
  try {
    console.log(`[Payment] ✅ Confirming held seats for successful payment session ${session._id}`);
    // Seats are already reduced, just log success
    console.log(`[Payment] Seats permanently confirmed for session ${session._id}`);
    return true;
  } catch (error) {
    console.error(`[Payment] ❌ Failed to confirm seats for session ${session?._id}:`, error);
    return false;
  }
}

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
  if (mode === "retry-payment") {
    const retryItems = body?.retryItems || [];
    if (!retryItems.length) throw Object.assign(new Error("NO_RETRY_ITEMS"), { status: 400 });
    
    const items = [];
    let totalVND = 0;
    
    for (const item of retryItems) {
      const tourId = item.tourId;
      const date = normDate(item.date);
      const a = clamp0(item.adults);
      const c = clamp0(item.children);
      const unitPriceAdult = Number(item.unitPriceAdult) || 0;
      const unitPriceChild = Number(item.unitPriceChild) || 0;
      const amt = unitPriceAdult * a + unitPriceChild * c;
      totalVND += amt;
      
      items.push({
        name: item.name,
        price: amt,
        originalPrice: undefined,
        tourId,
        meta: {
          date,
          adults: a,
          children: c,
          unitPriceAdult,
          unitPriceChild,
          image: item.image,
        },
      });
    }
    
    return {
      items,
      totalVND,
      mode,
      retryBookingId: body?.retryBookingId
    };
  }
  
  // ✅ NEW: Support for custom-tour mode
  if (mode === "custom-tour") {
    const bookingId = body?.bookingId;
    if (!bookingId) {
      throw Object.assign(new Error("MISSING_BOOKING_ID"), { status: 400 });
    }

    // Load booking to get amount
    const booking = await Booking.findById(bookingId).populate('customTourRequest.itineraryId');
    if (!booking) {
      throw Object.assign(new Error("BOOKING_NOT_FOUND"), { status: 404 });
    }

    // Verify booking belongs to user
    if (booking.userId.toString() !== userId.toString()) {
      throw Object.assign(new Error("UNAUTHORIZED_BOOKING"), { status: 403 });
    }

    // Verify booking is in pending payment status
    if (booking.payment?.status !== 'pending') {
      throw Object.assign(new Error("BOOKING_NOT_PENDING"), { status: 400 });
    }

    const totalVND = booking.payment.totalVND;
    const items = booking.items.map(item => ({
      name: item.name,
      price: item.priceVND,
      originalPrice: undefined,
      tourId: null, // Custom tour doesn't have tourId
      meta: {
        date: item.date,
        adults: item.adults,
        children: item.children,
        unitPriceAdult: item.priceVND / (item.adults + item.children), // Approximate
        unitPriceChild: 0,
        image: booking.customTourRequest?.itineraryId?.thumbnail || '',
      },
    }));

    return {
      items,
      totalVND,
      mode,
      bookingId
    };
  }

  // ✅ NEW: Support for tour-request mode (custom tour requests with guide negotiation)
  if (mode === "tour-request") {
    const TourCustomRequest = require("../models/TourCustomRequest");
    const requestId = body?.requestId;
    
    if (!requestId) {
      throw Object.assign(new Error("MISSING_REQUEST_ID"), { status: 400 });
    }

    // Load tour custom request
    const tourRequest = await TourCustomRequest.findById(requestId).populate('userId', 'name email');
    if (!tourRequest) {
      throw Object.assign(new Error("REQUEST_NOT_FOUND"), { status: 404 });
    }

    // Verify request belongs to user and is accepted by guide
    if (tourRequest.userId._id.toString() !== userId.toString()) {
      throw Object.assign(new Error("UNAUTHORIZED_REQUEST"), { status: 403 });
    }

    if (tourRequest.status !== 'accepted') {
      throw Object.assign(new Error("REQUEST_NOT_ACCEPTED"), { status: 400 });
    }

    // Get the final amount (either from latest offer or initial budget)
    const finalAmount = tourRequest.latestOffer?.amount || tourRequest.initialBudget?.amount;
    if (!finalAmount) {
      throw Object.assign(new Error("NO_VALID_AMOUNT"), { status: 400 });
    }

    const items = [{
      name: tourRequest.title || 'Custom Tour Request',
      price: finalAmount,
      originalPrice: undefined,
      tourId: null, // Tour request doesn't have tourId
      meta: {
        date: tourRequest.startDate ? normDate(tourRequest.startDate) : '',
        adults: tourRequest.numberOfAdults || 0,
        children: tourRequest.numberOfChildren || 0,
        unitPriceAdult: 0,
        unitPriceChild: 0,
        image: tourRequest.thumbnail || '',
      },
    }];

    return {
      items,
      totalVND: finalAmount,
      mode,
      customRequestId: requestId
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
      mode, // 'cart' | 'buy-now' | 'retry-payment'
      item: buyNowItem,
      retryItems,
      retryBookingId,
    } = req.body || {};

    console.log("📥 [MoMo] Received payment request:", {
      mode,
      buyNowItem,
      frontendAmount: req.body.amount,
      frontendItems: items,
      userId: req.user?.sub || req.user?._id,
    });

    // Authoritatively recompute amount from server-side state
    const userId = req.user?.sub || req.user?._id;
    const { items: serverItems, totalVND, retryBookingId: serverRetryBookingId, customRequestId } = await buildMoMoCharge(userId, {
      mode,
      item: buyNowItem,
      retryItems,
      retryBookingId,
    });

    console.log("🧮 [MoMo] Server calculated:", {
      totalVND,
      serverItems: serverItems.map((it) => ({
        name: it.name,
        price: it.price,
        meta: it.meta,
      })),
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
    let paymentSession;
    try {
      paymentSession = await PaymentSession.create({
        userId: req.user?.sub || req.user?._id || new mongoose.Types.ObjectId(),
        provider: "momo",
        orderId,
        requestId,
        amount: amt,
        status: "pending",
        mode: mode || (buyNowItem ? "buy-now" : "cart"),
        retryBookingId: serverRetryBookingId, // For retry payments
        customRequestId: customRequestId, // For tour-request or custom-tour payments
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

      // Hold seats temporarily for 1 minute
      await holdSeatsForPayment(paymentSession);
      
    } catch (dbErr) {
      console.error("Failed to persist payment session", dbErr);
      throw dbErr;
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
    // Detailed debug logging for IPN
    console.log('\n🔔 [MoMo IPN] Received IPN');
    try { console.log('Headers:', JSON.stringify(req.headers)); } catch(e) { console.log('Headers: <unserializable>'); }
    try { console.log('Body:', JSON.stringify(body, null, 2)); } catch(e) { console.log('Body: <unserializable>'); }
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

    // Try several ways to locate the payment session: orderId, requestId, transId,
    // or nested rawCreateResponse fields. This helps when different fields were
    // used to persist the Pay/Session identifiers.
    let session = null;
    const candidates = [];
    if (body.orderId) candidates.push({ orderId: body.orderId });
    if (body.requestId) candidates.push({ requestId: body.requestId });
    if (body.transId) candidates.push({ transId: body.transId });

    // Try direct matches first
    for (const q of candidates) {
      console.log('[MoMo IPN] Trying session lookup with', q);
      session = await PaymentSession.findOne(q);
      console.log('[MoMo IPN] Lookup result:', session ? `FOUND session._id=${session._id}` : 'not found');
      if (session) break;
    }

    // Try nested rawCreateResponse matches
    if (!session && body.orderId) {
      session = await PaymentSession.findOne({ $or: [ { 'rawCreateResponse.orderId': body.orderId }, { 'rawCreateResponse.id': body.orderId } ] });
    }

    if (!session) {
      console.warn("[MoMo] IPN unknown orderId/requestId/transId", { orderId: body.orderId, requestId: body.requestId, transId: body.transId });
      // Also attempt to find by nested rawCreateResponse keys and log
      if (body.orderId) {
        const nested = await PaymentSession.findOne({ $or: [ { 'rawCreateResponse.orderId': body.orderId }, { 'rawCreateResponse.id': body.orderId } ] });
        console.log('[MoMo IPN] nested lookup by rawCreateResponse:', nested ? `FOUND session._id=${nested._id}` : 'not found');
      }
      return res.status(404).json({ error: "SESSION_NOT_FOUND" });
    }

    session.resultCode = String(body.resultCode);
    session.message = body.message;
    session.transId = body.transId;
    session.payType = body.payType;

    let justPaid = false;
    let justFailed = false;
    
    if (String(body.resultCode) === "0") {
      if (session.status !== "paid") {
        session.status = "paid";
        session.paidAt = new Date();
        justPaid = true;
        console.log(`✅ [MoMo IPN] Payment successful (resultCode: 0) - setting status to 'paid'`);
        
        // Confirm held seats permanently
        await confirmSeatsForPayment(session);
      }
    } else if (session.status === "pending") {
      session.status = "failed";
      justFailed = true;
      console.log(`⚠️ [MoMo IPN] Payment failed (resultCode: ${body.resultCode}) - setting status to 'failed'`);
    }

  console.log('[MoMo IPN] Updating session status ->', session.status, ' saving...');
  await session.save();
  console.log('[MoMo IPN] Session saved:', session._id, 'status:', session.status);

    // If payment failed -> release seats and restore cart
    if (justFailed) {
      console.log(`[MoMo IPN] Payment failed, releasing seats and restoring cart...`);
      await releaseSeatsForPayment(session);
      await restoreCartFromPaymentSession(session);
    }

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

      // Create or update booking (unified helper with idempotent check)
      let booking;
      if (session.retryBookingId) {
        // For retry payments, update the existing failed booking
        console.log(`🔄 [MoMo IPN] Updating existing booking ${session.retryBookingId} for retry payment`);
        booking = await Booking.findById(session.retryBookingId);
        if (booking) {
          booking.status = 'paid';
          booking.payment.status = 'completed';
          booking.payment.paidAt = new Date();
          booking.payment.transactionId = body.transId;
          booking.payment.momoData = {
            partnerCode: body.partnerCode,
            resultCode: body.resultCode,
            message: body.message,
            transId: body.transId,
            raw: body
          };
          await booking.save();
          console.log(`✅ [MoMo IPN] Updated existing booking ${booking._id} to paid status`);
        } else {
          console.warn(`⚠️ [MoMo IPN] Retry booking ${session.retryBookingId} not found, creating new booking`);
       booking = await createBookingFromSession(
            session,{
              ipn: body,
            sessionId: session._id,
              markPaid: true 
          });
        }
      } else {
        // Normal payment flow
        booking = await createBookingFromSession(session, {
          ipn: body,
          sessionId: session._id,
        });
      }

      // Send payment success notification
      try {
        const User = require("../models/Users");
        const user = await User.findById(session.userId);
        if (user && user.email && booking) {
          const { sendPaymentSuccessNotification } = require("../controller/notifyController");
          const tourTitle = booking.items?.[0]?.name || "Tour";
          await sendPaymentSuccessNotification({
            email: user.email,
            amount: booking.totalAmount,
            bookingCode: booking.bookingCode,
            tourTitle: tourTitle,
            bookingId: booking._id
          });
          console.log(`[MoMo IPN] ✅ Payment success notification sent for booking ${booking._id}`);
        } else {
          console.warn(`[MoMo IPN] ⚠️ User email not found for session ${session._id}, skipping notification`);
        }
      } catch (notifyError) {
        console.error(`[MoMo IPN] ❌ Failed to send payment notification:`, notifyError);
        // Don't fail the IPN if notification fails
      }
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
    const { orderId, resultCode, message } = req.body || {};
    console.log("\n🔍 [markMoMoPaid] Called by frontend:", { orderId, resultCode, message });

    if (!orderId) return res.status(400).json({ error: "MISSING_ORDER_ID" });

    // 1️⃣ Tìm PaymentSession
    let sess = await PaymentSession.findOne({ orderId });
    if (!sess) sess = await PaymentSession.findOne({ requestId: orderId });
    if (!sess) sess = await PaymentSession.findOne({ transId: orderId });
    if (!sess) sess = await PaymentSession.findOne({ 'rawCreateResponse.orderId': orderId });
    if (!sess) sess = await PaymentSession.findOne({ 'rawCreateResponse.id': orderId });

    if (!sess) {
      console.warn("[markMoMoPaid] SESSION_NOT_FOUND for", orderId);
      return res.status(404).json({ error: "SESSION_NOT_FOUND" });
    }

    // 2️⃣ Nếu MoMo trả lỗi → đánh dấu thất bại
    if (String(resultCode) !== "0") {
      sess.status = "failed";
      sess.message = message || "Payment failed";
      await sess.save();

      await restoreCartFromPaymentSession(sess);
      await markBookingAsFailed(orderId, {
        transactionId: orderId,
        momo: { orderId, resultCode, message, failedAt: new Date() },
      });

      return res.json({
        success: false,
        status: "failed",
        message: "Thanh toán thất bại, đơn hàng đã được ghi nhận",
      });
    }

    // 3️⃣ Nếu thanh toán thành công
    if (sess.status !== "paid") {
      sess.status = "paid";
      sess.paidAt = new Date();
      await sess.save();
      console.log(`✅ [markMoMoPaid] Session ${sess._id} marked as paid`);
    }

    // 4️⃣ Tạo booking từ session (nếu chưa có)
    const booking = await createBookingFromSession(sess, {
      markPaid: true,
      sessionId: sess._id,
    });

    console.log(`✅ [markMoMoPaid] Booking created successfully: ${booking?._id}`);

    // 5️⃣ Gửi email xác nhận (tùy chọn)
    try {
      const User = require("../models/Users");
      const user = await User.findById(sess.userId);
      if (user?.email) {
        const { sendPaymentSuccessNotification } = require("../controller/notifyController");
        await sendPaymentSuccessNotification({
          email: user.email,
          amount: booking.totalAmount,
          bookingCode: booking.bookingCode,
          tourTitle: booking.items?.[0]?.name || "Tour",
          bookingId: booking._id,
        });
        console.log(`[markMoMoPaid] ✅ Payment success email sent to ${user.email}`);
      }
    } catch (notifyErr) {
      console.error("[markMoMoPaid] ⚠️ Failed to send success email:", notifyErr);
    }

    return res.json({
      success: true,
      status: "paid",
      bookingId: booking?._id,
      message: "Thanh toán thành công!",
    });
  } catch (err) {
    console.error("markMoMoPaid error", err);
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
    // Look up booking by the canonical payment.orderId field (lowercase),
    // but keep a fallback for legacy 'payment.orderID' (uppercase D).
    const booking = await Booking.findOne({ 
      'payment.provider': provider, 
      $or: [ { 'payment.orderId': orderId }, { 'payment.orderID': orderId } ],
      userId 
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
        const newBooking = await createBookingFromSession(session, { lateCreation: true });
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

// ===== Retry payment for failed booking =====
exports.retryPaymentForBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user?.sub;
    
    if (!userId) return res.status(401).json({ error: "UNAUTHORIZED" });
    if (!bookingId) return res.status(400).json({ error: "BOOKING_ID_REQUIRED" });

    console.log(`[Payment] 🔄 Retrying payment for booking ${bookingId} by user ${userId}`);

    // 1) Find the failed booking
    const booking = await Booking.findOne({ 
      _id: bookingId, 
      userId,
      status: "cancelled",
      "payment.status": "failed"
    });

    if (!booking) {
      return res.status(404).json({ error: "FAILED_BOOKING_NOT_FOUND" });
    }

    // 2) Check if seats are still available
    for (const item of booking.items) {
      const tour = await Tour.findById(item.tourId);
      if (!tour) {
        return res.status(400).json({ error: `TOUR_NOT_FOUND: ${item.tourId}` });
      }

      const dep = tour.departures.find(d => normDate(d.date) === item.date);
      if (!dep) {
        return res.status(400).json({ error: `DEPARTURE_NOT_FOUND: ${item.date}` });
      }

      const needed = (item.adults || 0) + (item.children || 0);
      if (dep.seatsLeft < needed) {
        return res.status(400).json({ 
          error: "INSUFFICIENT_SEATS", 
          message: `Not enough seats available for ${item.name}. Available: ${dep.seatsLeft}, Needed: ${needed}` 
        });
      }
    }

    // 3) Create new payment session from booking data
    const paymentSession = await PaymentSession.create({
      userId,
      provider: booking.payment.provider,
      items: booking.items.map(item => ({
        tourId: item.tourId,
        name: item.name,
        image: item.image,
        meta: {
          date: item.date,
          adults: item.adults,
          children: item.children,
          unitPriceAdult: item.unitPriceAdult,
          unitPriceChild: item.unitPriceChild,
          image: item.image
        }
      })),
      currency: booking.currency,
      originalAmount: booking.originalAmount,
      discountAmount: booking.discountAmount,
      totalAmount: booking.totalAmount,
      voucherCode: booking.voucherCode,
      promotionId: booking.promotionId,
      status: 'pending',
      createdAt: new Date()
    });

    // 4) Hold seats temporarily
    await holdSeatsForPayment(paymentSession);

    console.log(`[Payment] ✅ Created retry payment session ${paymentSession._id} for booking ${bookingId}`);

    // 5) Return session info for frontend to proceed with payment
    res.json({
      success: true,
      sessionId: paymentSession._id,
      provider: booking.payment.provider,
      amount: booking.totalAmount,
      currency: booking.currency,
      items: paymentSession.items
    });

  } catch (e) {
    console.error("retryPaymentForBooking error", e);
    res.status(500).json({ error: "RETRY_PAYMENT_FAILED" });
  }
};

// Export helpers for use in other controllers
// Export helpers for use in other controllers
module.exports.restoreCartFromPaymentSession = restoreCartFromPaymentSession;
module.exports.holdSeatsForPayment = holdSeatsForPayment;
module.exports.releaseSeatsForPayment = releaseSeatsForPayment;
module.exports.confirmSeatsForPayment = confirmSeatsForPayment;
