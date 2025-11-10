const fetch = global.fetch || ((...args) => import("node-fetch").then(({default: f}) => f(...args)));
const mongoose = require("mongoose");
const { Cart, CartItem } = require("../models/Carts");
const Tour = require("../models/agency/Tours");
const Booking = require("../models/Bookings");
const PaymentSession = require("../models/PaymentSession");

// Import unified helpers
const { createBookingFromSession, clearCartAfterPayment, markBookingAsPaid, markBookingAsFailed, FX_VND_USD } = require("../utils/paymentHelpers");

// Import cart restore helper from payment controller
const { restoreCartFromPaymentSession } = require("./payment.controller");

const FX = FX_VND_USD; // Use shared FX rate
const PAYPAL_BASE = process.env.PAYPAL_MODE === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
const isProd = process.env.NODE_ENV === 'production';

// ==== helpers ====
const normDate = (s) => String(s || "").slice(0,10);
const clamp0 = (n) => Math.max(0, Number(n)||0);

async function getPricesAndMeta(tourId, date) {
  const tour = await Tour.findById(tourId).lean();
  if (!tour) throw Object.assign(new Error("NOT_FOUND"), { status: 404 });

  const dep = (tour.departures || []).find(d => normDate(d?.date) === date);

  const unitPriceAdult =
    typeof dep?.priceAdult === "number" ? dep.priceAdult :
    typeof tour.basePrice === "number" ? tour.basePrice : 0;

  const unitPriceChild =
    typeof dep?.priceChild === "number" ? dep.priceChild :
    Math.round((unitPriceAdult || 0) * 0.5);

  return {
    name: tour.title || tour.name || "",
    image: tour.imageItems?.[0]?.imageUrl || tour.image || "",
    unitPriceAdult,
    unitPriceChild,
  };
}

function toUSD(vnd) {
  const usd = (Number(vnd)||0) * FX;
  // PayPal cần 2 chữ số thập phân
  return (Math.round(usd * 100) / 100).toFixed(2);
}

async function getAccessToken() {
  const client = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET || process.env.PAYPAL_CLIENT_SECRET; // hỗ trợ cả 2 tên biến

  if (!client || !secret) {
    const msg = "MISSING_PAYPAL_CREDENTIALS";
    const detail = { hasClient: !!client, hasSecret: !!secret };
    throw Object.assign(new Error(msg), { status: 500, code: msg, detail });
  }

  const auth = Buffer.from(`${client}:${secret}`).toString("base64");
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    const t = await res.text();
    const err = new Error(`PAYPAL_OAUTH_FAILED`);
    err.status = res.status;
    err.raw = t;
    throw err;
  }
  const data = await res.json();
  return data.access_token;
}

// Gom dữ liệu thanh toán cho 2 mode
// mode === "cart": lấy các line selected từ giỏ
// mode === "buy-now": từ payload { item: {tourId, date, adults, children} }
async function buildChargeForUser(userId, body) {
  const mode = body?.mode;
  if (mode === "cart") {
    const cart = await Cart.findOne({ userId });
    if (!cart) return { currency: "USD", items: [], totalVND: 0, cartItems: [] };

    const lines = await CartItem.find({ cartId: cart._id, selected: true });
    const items = [];
    const cartItems = []; // ✅ Store cart item details with passenger counts
    let totalVND = 0;

    for (const line of lines) {
      const { name, image, unitPriceAdult, unitPriceChild } =
        await getPricesAndMeta(line.tourId, line.date);
      const a = clamp0(line.adults);
      const c = clamp0(line.children);
      const amt = unitPriceAdult*a + unitPriceChild*c;
      totalVND += amt;

      items.push({
        sku: `${line.tourId}-${line.date}`,
        name: `${name} • ${normDate(line.date)}`,
        quantity: 1, // gộp NL+TE thành 1 item (hoặc tách 2 dòng NL/TE tuỳ thích)
        unit_amount_vnd: amt,
        image,
      });
      
      // ✅ Store full cart item details for booking creation
      cartItems.push({
        tourId: line.tourId,
        date: normDate(line.date),
        name,
        image,
        adults: a,
        children: c,
        unitPriceAdult,
        unitPriceChild
      });
    }
    return { currency: "USD", items, totalVND, cartItems };
  }

  if (mode === "buy-now") {
    const inc = body?.item || {};
    const tourId = inc.tourId || inc.id;
    if (!tourId || !inc.date) throw Object.assign(new Error("BAD"), { status: 400 });

    const { name, image, unitPriceAdult, unitPriceChild } =
      await getPricesAndMeta(tourId, normDate(inc.date));
    const a = clamp0(inc.adults);
    const c = clamp0(inc.children);
    const amt = unitPriceAdult*a + unitPriceChild*c;

    return {
      currency: "USD",
      items: [{
        sku: `${tourId}-${normDate(inc.date)}`,
        name: `${name} • ${normDate(inc.date)}`,
        quantity: 1,
        unit_amount_vnd: amt,
        image,
      }],
      totalVND: amt,
      _buyNowMeta: { tourId, date: normDate(inc.date), name, image, adults: a, children: c, unitPriceAdult, unitPriceChild }
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
        sku: `${tourId}-${date}`,
        name: `${item.name} • ${date}`,
        quantity: 1,
        unit_amount_vnd: amt,
        image: item.image,
      });
    }

    return {
      currency: "USD",
      items,
      totalVND,
      cartItems: retryItems, // Use retry items as cart items
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
    const Booking = require("../models/Bookings");
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
      sku: `custom-tour-${bookingId}`,
      name: item.name,
      quantity: 1,
      unit_amount_vnd: item.priceVND,
      image: booking.customTourRequest?.itineraryId?.thumbnail || '',
    }));

    return {
      currency: "USD",
      items,
      totalVND,
      cartItems: [], // No cart items for custom tour
      bookingId
    };
  }

  throw Object.assign(new Error("UNSUPPORTED_MODE"), { status: 400 });
}

// ==== controllers ====
exports.createOrder = async (req, res) => {
  let stage = 'start';
  try {
    const userId = req.user.sub;
    const { mode } = req.body;

    console.log("🔍 createOrder request:");
    console.log("   userId:", userId);
    console.log("   body:", JSON.stringify(req.body, null, 2));

  stage = 'buildCharge';
  const { items, totalVND, currency, _buyNowMeta, cartItems } = await buildChargeForUser(userId, req.body);

    // Apply discount from voucher/promotion
    const discountAmount = Number(req.body.discountAmount) || 0;
    const finalTotalVND = Math.max(0, totalVND - discountAmount);

    console.log("💰 Price calculation:", {
      originalTotal: totalVND,
      discountAmount,
      finalTotal: finalTotalVND,
      voucherCode: req.body.promotionCode || req.body.voucherCode,
    });

    if (!items.length || finalTotalVND <= 0) {
      return res.status(400).json({ error: "EMPTY_OR_INVALID_AMOUNT" });
    }

  stage = 'oauth';
  const accessToken = await getAccessToken();

    // Xây purchase_units với logic làm tròn nhất quán để tránh mismatch giá (CREATE_ORDER_FAILED)
    // Quy tắc: Mỗi line item chuyển sang USD -> cents (integer), sum lại = item_totalCents.
    // Sau đó amount.value = item_total (không lấy toUSD(totalVND) nếu lệch do làm tròn).
  // Normalize client URL to avoid double slashes if env ends with '/'
  const CLIENT_URL = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/+$/,'');

    const lineCents = items.map(i => {
      const usd = Number(toUSD(i.unit_amount_vnd)); // string -> number (2 decimals)
      return Math.round(usd * 100) * (i.quantity || 1);
    });
    const itemTotalCents = lineCents.reduce((a, b) => a + b, 0);
    const discountCents = Math.round(Number(toUSD(discountAmount)) * 100);
    const finalAmountCents = Math.max(0, itemTotalCents - discountCents);

    console.log("Payment calculation:", {
      totalVND,
      discountAmount,
      finalTotalVND,
      itemTotalCents,
      discountCents,
      finalAmountCents,
      items: items.map((i) => ({
        name: i.name,
        qty: i.quantity,
        unitVND: i.unit_amount_vnd,
        unitUSD: toUSD(i.unit_amount_vnd)
      }))
    });

    const itemsTotalUSD = (itemTotalCents / 100).toFixed(2);
    const discountUSD = (discountCents / 100).toFixed(2);
    const finalAmountUSD = (finalAmountCents / 100).toFixed(2);

    // Build breakdown - include discount if applicable
    const breakdown = {
      item_total: {
        currency_code: currency,
        value: itemsTotalUSD,
      },
    };

    if (discountCents > 0) {
      breakdown.discount = {
        currency_code: currency,
        value: discountUSD,
      };
    }

    const orderBody = {
      intent: "CAPTURE",
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: finalAmountUSD,
          breakdown: breakdown
        },
      }],
      application_context: {
  return_url: `${CLIENT_URL}/payment/callback`,
  cancel_url: `${CLIENT_URL}/shoppingcarts`,
        brand_name: "Travyy Tour",
        shipping_preference: "NO_SHIPPING",
      },
    };

    console.log("PayPal orderBody:", JSON.stringify(orderBody, null, 2));

    stage = 'createOrder';
    const resp = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "PayPal-Request-Id": `order-${userId}-${Date.now()}`
      },
      body: JSON.stringify(orderBody),
    });

    // PayPal may sometimes return non-JSON on errors; read text first and try to parse.
    const respText = await resp.text();
    let data;
    try {
      data = respText ? JSON.parse(respText) : {};
    } catch (parseErr) {
      // Keep the raw text for debugging rather than throwing
      data = respText;
      console.warn("Warning: failed to parse PayPal response as JSON, storing raw text for debug");
    }

    if (!resp.ok) {
      console.error("PayPal create order failed:", typeof data === 'string' ? data : JSON.stringify(data, null, 2));
      return res.status(resp.status).json({
        error: 'PAYPAL_CREATE_FAILED',
        ...(isProd ? {} : { debug: { stage, status: resp.status, data, hint: 'Check credentials, amount/item_total match, currency format' } })
      });
    }

    // ⬇️ LƯU VÀO PaymentSession (thay vì req.session)
    let paymentSession;
    try {
      paymentSession = await PaymentSession.create({
        userId,
        provider: "paypal",
        orderId: data.id,
        requestId: `order-${userId}-${Date.now()}`,
        amount: finalTotalVND,
        status: "pending",
        mode: mode || 'cart',
  retryBookingId: req.body?.retryBookingId, // For retry payments
        items: items.map((i, idx) => {
          const tourId = i.sku?.split('-')[0];
          const date = _buyNowMeta?.date || i.sku?.substring(tourId?.length + 1);
          
          // ✅ Use cartItems for cart mode, _buyNowMeta for buy-now mode, retryItems for retry mode
          const cartItem = cartItems?.[idx];
          const adults = cartItem?.adults ?? _buyNowMeta?.adults ?? 0;
          const children = cartItem?.children ?? _buyNowMeta?.children ?? 0;
          const unitPriceAdult = cartItem?.unitPriceAdult ?? _buyNowMeta?.unitPriceAdult ?? 0;
          const unitPriceChild = cartItem?.unitPriceChild ?? _buyNowMeta?.unitPriceChild ?? 0;
          const image = i.image || cartItem?.image || _buyNowMeta?.image || '';
          
          return {
            name: i.name,
            price: i.unit_amount_vnd,
            tourId: tourId && mongoose.isValidObjectId(tourId) ? tourId : undefined,
            meta: {
              date: date,
              adults,
              children,
              unitPriceAdult,
              unitPriceChild,
              image
            }
          };
        }),
        voucherCode:
          req.body.promotionCode || req.body.voucherCode || undefined,
        discountAmount: discountAmount,
        rawCreateResponse: data,
      });
      
      // Hold seats temporarily for 1 minute
      const { holdSeatsForPayment } = require("../controller/payment.controller");
      await holdSeatsForPayment(paymentSession);
      
      console.log(`[PayPal] Payment session created for orderId: ${data.id}`);
      console.log(`[PayPal] Session items with passenger data:`, JSON.stringify(items.map((_, idx) => ({
        adults: cartItems?.[idx]?.adults ?? _buyNowMeta?.adults ?? 0,
        children: cartItems?.[idx]?.children ?? _buyNowMeta?.children ?? 0,
        unitPriceAdult: cartItems?.[idx]?.unitPriceAdult ?? _buyNowMeta?.unitPriceAdult ?? 0,
        unitPriceChild: cartItems?.[idx]?.unitPriceChild ?? _buyNowMeta?.unitPriceChild ?? 0
      })), null, 2));
    } catch (dbErr) {
      console.error("Failed to persist PayPal payment session", dbErr);
      // Do not return an orderID to the client if we couldn't persist the session.
      return res.status(500).json({ error: "SESSION_PERSIST_FAILED", detail: dbErr.message });
    }

    // Only return orderID after session successfully persisted
    res.json({ orderID: data.id });
  } catch (e) {
    console.error("createOrder error", e && e.stack ? e.stack : e);
    res.status(e.status || 500).json({
      error: "CREATE_ORDER_FAILED",
      ...(isProd ? {} : { debug: { message: e.message, code: e.code, stage, detail: e.detail, raw: e.raw, stack: e.stack } })
    });
  }
};

exports.captureOrder = async (req, res) => {
  const mongoSession = await mongoose.startSession();

  try {
    const userId = req.user.sub;
    const orderID = req.body.orderID; // properly declare variable

    console.log("\n🔍 ===== PAYPAL CAPTURE ORDER START =====");
    console.log("userId:", userId);
    console.log("orderID:", orderID);

    // ⬇️ CHECK BOOKING ĐÃ TỒN TẠI TRƯỚC (IDEMPOTENT)
    const existingBooking = await Booking.findOne({ "payment.orderId": orderID });
    if (existingBooking) {
      console.log("✅ [PayPal] Booking already exists (idempotent):", existingBooking._id);
      return res.json({ success: true, bookingId: existingBooking._id });
    }

    // ⬇️ LẤY METADATA TỪ PaymentSession (thay vì req.session)
    let paymentSession = await PaymentSession.findOne({ orderId: orderID, provider: 'paypal' });

    // Fallbacks: try to locate by nested rawCreateResponse.id or by recent pending session for this user
    if (!paymentSession) {
      console.warn(`⚠️ [PayPal] PaymentSession not found by orderId=${orderID}. Trying fallbacks...`);

      // Try matching rawCreateResponse.id if stored
      try {
        paymentSession = await PaymentSession.findOne({ 'rawCreateResponse.id': orderID, provider: 'paypal' });
        if (paymentSession) console.log(`ℹ️ [PayPal] Found session by rawCreateResponse.id: ${paymentSession._id}`);
      } catch (e) {
        console.warn('[PayPal] rawCreateResponse lookup failed', e && e.message);
      }
    }

    if (!paymentSession) {
      // Last-ditch: find most recent pending PayPal session for this user (created within last 10 minutes)
      try {
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        paymentSession = await PaymentSession.findOne({
          provider: 'paypal',
          userId: userId,
          status: { $in: ['pending'] },
          createdAt: { $gte: tenMinutesAgo }
        }).sort({ createdAt: -1 });

        if (paymentSession) {
          console.log(`ℹ️ [PayPal] Found recent pending session for user ${userId}: ${paymentSession._id} (orderId=${paymentSession.orderId})`);
        }
      } catch (e) {
        console.warn('[PayPal] recent session lookup failed', e && e.message);
      }
    }

    if (!paymentSession) {
      console.error("❌ [PayPal] Payment session not found after fallbacks. orderID=", orderID, "userId=", userId);
      // Helpful debug: list up to 5 recent PayPal sessions in DB for this user
      try {
        const recent = await PaymentSession.find({ provider: 'paypal', userId }).sort({ createdAt: -1 }).limit(5).lean();
        console.error("[PayPal] Recent sessions for user:", recent.map(r => ({ id: r._id, orderId: r.orderId, status: r.status, createdAt: r.createdAt })));
      } catch (listErr) {
        console.error('[PayPal] Failed to list recent payment sessions for diagnostics', listErr && listErr.message);
      }

      throw Object.assign(new Error("PAYMENT_SESSION_NOT_FOUND"), { status: 400 });
    }

    console.log("✅ [PayPal] Found payment session:", paymentSession._id);
    console.log("📊 [PayPal] Current session status:", paymentSession.status);

    await mongoSession.withTransaction(async () => {
      // 1) Capture PayPal payment
      const accessToken = await getAccessToken();
      const captureUrl = `${PAYPAL_BASE}/v2/checkout/orders/${orderID}/capture`;
      
      const captureRes = await fetch(captureUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const captureData = await captureRes.json();

      if (!captureRes.ok) {
        console.error("❌ PayPal capture failed:", captureData);
        console.log(`⚠️ [PayPal] Setting session status to 'failed'`);
        throw Object.assign(new Error("PAYPAL_CAPTURE_FAILED"), { status: 422 });
      }

      console.log("✅ PayPal capture successful:", captureData.id);

      // 2) Update payment session status
     paymentSession.status = 'paid';
paymentSession.paymentStatus = 'completed'; // ✅ thêm dòng này
paymentSession.paidAt = new Date();
paymentSession.rawCreateResponse = { ...paymentSession.rawCreateResponse, capture: captureData };
await paymentSession.save();


      // 2.5) Mark voucher as used if stored in session
      if (paymentSession.voucherCode && paymentSession.userId) {
        try {
          const User = require("../models/Users");
          const Promotion = require("../models/Promotion");

          console.log(
            `🎫 Marking voucher ${paymentSession.voucherCode} as used for user ${paymentSession.userId}`
          );

          const promotion = await Promotion.findOne({
            code: paymentSession.voucherCode.toUpperCase(),
          });
          if (promotion) {
            console.log(`   Found promotion: ${promotion._id}`);

            // ✅ Tăng usageCount của promotion
            await Promotion.findByIdAndUpdate(
              promotion._id,
              { $inc: { usageCount: 1 } },
              { session: mongoSession }
            );
            console.log(`   ✅ Incremented usageCount`);

            // ✅ Đánh dấu user đã sử dụng voucher
            await User.findByIdAndUpdate(
              paymentSession.userId,
              {
                $addToSet: {
                  usedPromotions: {
                    promotionId: promotion._id,
                    code: promotion.code,
                    usedAt: new Date(),
                  },
                },
              },
              { session: mongoSession }
            );
            console.log(
              `✅ [PayPal] Marked promotion ${paymentSession.voucherCode} as used for user ${paymentSession.userId} and incremented usageCount`
            );
          } else {
            console.warn(
              `   ⚠️ Promotion not found: ${paymentSession.voucherCode}`
            );
          }
        } catch (voucherError) {
          console.error(
            "[PayPal] Error marking voucher as used:",
            voucherError
          );
          // Don't fail the payment if voucher marking fails
        }
      }

      // 4) Confirm held seats permanently (seats were already held during order creation)
      console.log("\n🎫 Confirming held seats...");
      const { confirmSeatsForPayment } = require("../controller/payment.controller");
      await confirmSeatsForPayment(paymentSession);

      // 5) Create or update booking using unified helper
      console.log("\n💾 Creating/updating booking using unified helper...");
      
      let booking;
      if (paymentSession.retryBookingId) {
        // For retry payments, update the existing failed booking
        console.log(`🔄 Updating existing booking ${paymentSession.retryBookingId} for retry payment`);
        booking = await Booking.findById(paymentSession.retryBookingId);
        if (booking) {
          booking.status = 'paid';
          booking.payment.status = 'completed';
          booking.payment.paidAt = new Date();
          booking.payment.transactionId = captureData.id;
          booking.payment.paypalData = {
            captureId: captureData.id,
            payerId: captureData.payer?.payer_id,
            payerEmail: captureData.payer?.email_address,
            raw: captureData
          };
          await booking.save();
          console.log(`✅ Updated existing booking ${booking._id} to paid status`);
        } else {
          console.warn(`⚠️ Retry booking ${paymentSession.retryBookingId} not found, creating new booking`);
          booking = await createBookingFromSession(paymentSession, { 
            capture: captureData,
            sessionId: paymentSession._id 
          });
        }
      } else {
        // Normal payment flow
        booking = await createBookingFromSession(paymentSession, { 
          capture: captureData,
          sessionId: paymentSession._id 
        });
      }

      console.log("✅ Booking created:", booking._id);

      // 6) Mark booking as paid
      console.log("\n💳 Marking booking as paid...");
      try {
        await markBookingAsPaid(orderID, {
          transactionId: captureData.id,
          paypal: {
            captureId: captureData.id,
            status: captureData.status,
            payer: captureData.payer
          }
        });
        console.log("✅ Booking marked as paid");
      } catch (markError) {
        console.error("❌ Failed to mark booking as paid:", markError);
        // Booking exists but payment status update failed
        // Return success anyway since payment was captured
        console.log("⚠️ Payment captured but status update failed. Booking ID:", booking._id);
      }

      console.log("\n✅ ===== PAYPAL CAPTURE ORDER SUCCESS =====");
      console.log(`✅ [PayPal] Final session status: "${paymentSession.status}"`);
      console.log(`✅ [PayPal] Booking ID: ${booking._id}`);
      res.json({ success: true, bookingId: booking._id });
    });

  } catch (e) {
    console.error("\n❌ ===== PAYPAL CAPTURE ORDER FAILED =====");
    console.error("Error:", e.message);
    console.error("Stack:", e.stack);
    
    // Mark session as failed and create failed booking
    try {
      const paymentSession = await PaymentSession.findOne({ orderId: orderID, provider: 'paypal' });
      if (paymentSession && paymentSession.status !== 'failed') {
        paymentSession.status = 'failed';
        await paymentSession.save();
        console.log(`✅ [PayPal] Session marked as failed for orderId: ${orderID}`);
        console.log(`⚠️ [PayPal] Session status set to 'failed'`);
        console.log(`💾 [PayPal] Session saved: status="${paymentSession.status}"`);
        
        // Restore cart items when payment fails
        console.log(`[PayPal] Payment failed, restoring cart items...`);
        await restoreCartFromPaymentSession(paymentSession);
        
        // Release held seats back to availability
        console.log(`[PayPal] Payment failed, releasing held seats...`);
        const { releaseSeatsForPayment } = require("../controller/payment.controller");
        await releaseSeatsForPayment(paymentSession);
        
        // Create failed booking for user's booking history
        await markBookingAsFailed(orderID, {
          transactionId: orderID,
          paypal: {
            orderId: orderID,
            status: 'failed',
            error: e.message,
            failedAt: new Date()
          }
        });
        console.log(`✅ [PayPal] Failed booking created for orderId: ${orderID}`);
      }
    } catch (failError) {
      console.error(`❌ [PayPal] Failed to record failure:`, failError);
    }
    
    res.status(e.status || 500).json({ error: e.message || "CAPTURE_FAILED" });
  } finally {
    mongoSession.endSession();
  }
};

// Endpoint trả về config cho FE
exports.getConfig = (req, res) => {
  res.json({
    clientId: process.env.PAYPAL_CLIENT_ID,
    currency: "USD"
  });
};