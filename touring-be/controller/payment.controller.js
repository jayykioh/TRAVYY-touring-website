// controller/payment.controller.js
// Simple MoMo Sandbox integration (Capture Wallet)
// NOTE (prod): Verify amount server-side (recompute from cart/quote), persist order BEFORE redirect,
// verify signature on redirect & IPN, reconcile idempotently, update booking status.

const crypto = require("crypto");
const PaymentSession = require("../models/PaymentSession");
const mongoose = require("mongoose");
const Booking = require("../models/Bookings");
const Tour = require("../models/Tours");
const { Cart, CartItem } = require("../models/Carts");

// FX rate (fallback) for VND->USD conversion
const FX_VND_USD = Number(process.env.FX_VND_USD || 0.000039);

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

exports.createMoMoPayment = async (req, res) => {
  try {
    const {
      amount,
      orderInfo = "Thanh toan don tour",
      redirectUrl,
      ipnUrl,
      extraData = "",
      items = [], // snapshot optional
    } = req.body || {};

    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      return res.status(400).json({ error: "INVALID_AMOUNT" });
    }

    // ENV configuration (provide defaults for sandbox testing)
    const partnerCode = process.env.MOMO_PARTNER_CODE || "MOMO"; // sample: MOMO
    const accessKey = process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85"; // sample sandbox
    const secretKey = process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz"; // sample sandbox
    const endpoint = process.env.MOMO_CREATE_ENDPOINT || "https://test-payment.momo.vn/v2/gateway/api/create";

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
        redirectUrl || envRedirect || `${req.protocol}://${req.get("host")}/momo-sandbox`,
      ipnUrl:
        ipnUrl || envIpn || `${req.protocol}://${req.get("host")}/api/payments/momo/ipn`,
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
        items: (Array.isArray(items) ? items : []).map((it) => ({
          name: it.name,
          price: Number(it.price) || 0,
          originalPrice: Number(it.originalPrice) || undefined,
          tourId: it.tourId && mongoose.isValidObjectId(it.tourId) ? it.tourId : undefined,
          meta: it.meta || {},
        })),
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
    const secretKey = process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz"; // sandbox fallback
    const raw = buildIpnRawSignature(body);
    const expectedSig = crypto.createHmac("sha256", secretKey).update(raw).digest("hex");
    if (expectedSig !== body.signature) {
      console.warn("[MoMo] IPN signature mismatch", { raw, expectedSig, got: body.signature });
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

    // If newly paid -> create Booking (idempotent check: does a booking already have this orderId?)
    if (justPaid) {
      const existing = await Booking.findOne({ 'payment.orderID': session.orderId });
      if (!existing) {
        try {
          // Convert items snapshot (they may lack adults/children breakdown; treat price as total line VND)
          // We'll store currency USD, totalUSD derived from session.amount
          const amountVND = Number(session.amount) || 0;
          const totalUSD = Math.round(amountVND * FX_VND_USD * 100) / 100;

          // Attempt to fetch extra tour info for name/image if missing
          const bookingItems = [];
          for (const it of session.items || []) {
            let tourMeta = null;
            if (it.tourId && mongoose.isValidObjectId(it.tourId)) {
              const t = await Tour.findById(it.tourId).lean();
              if (t) {
                tourMeta = {
                  name: t.title || t.name || it.name,
                  image: t.imageItems?.[0]?.imageUrl || t.image || it.image,
                };
              }
            }
            bookingItems.push({
              tourId: it.tourId, // may be undefined
              date: it.meta?.date || it.meta?.departureDate || '',
              name: it.name || tourMeta?.name || 'Tour',
              image: it.image || tourMeta?.image || '',
              adults: it.meta?.adults || 0,
              children: it.meta?.children || 0,
              unitPriceAdult: it.meta?.unitPriceAdult || 0,
              unitPriceChild: it.meta?.unitPriceChild || 0,
            });
          }

          const bookingDoc = await Booking.create({
            userId: session.userId,
            items: bookingItems,
            currency: 'USD',
            totalUSD,
            payment: {
              provider: 'momo',
              orderID: session.orderId,
              status: 'completed',
              raw: { ipn: body, sessionId: session._id }
            },
            status: 'paid'
          });
          console.log('[MoMo] Booking created from paid session', bookingDoc._id);

          // Optional: clear selected cart items (session doesn't currently store mode; attempt heuristic)
          try {
            const cart = await Cart.findOne({ userId: session.userId });
            if (cart) {
              const delRes = await CartItem.deleteMany({ cartId: cart._id, selected: true });
              console.log(`[MoMo] Cleared ${delRes.deletedCount} cart items after successful payment.`);
            }
          } catch (clrErr) {
            console.warn('[MoMo] Failed to clear cart items post-payment', clrErr);
          }
        } catch (bkErr) {
          console.error('[MoMo] Failed to create booking after payment', bkErr);
        }
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
exports.markMoMoPaid = async (req, res) => {
  try {
    const { orderId, resultCode } = req.body || {};
    if (!orderId) return res.status(400).json({ error: "MISSING_ORDER_ID" });
    const sess = await PaymentSession.findOne({ orderId });
    if (!sess) return res.status(404).json({ error: "SESSION_NOT_FOUND" });
    if (sess.status === "paid") return res.json({ status: "already_paid" });
    if (String(resultCode) !== "0") {
      sess.status = "failed";
      await sess.save();
      return res.status(400).json({ error: "RESULT_NOT_SUCCESS" });
    }
    sess.status = "paid";
    sess.paidAt = new Date();
    await sess.save();
    // TODO: create Booking documents from sess.items (mapping tourId, qty) if needed.
    res.json({ status: "paid", paidAt: sess.paidAt });
  } catch (e) {
    console.error("markMoMoPaid error", e);
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
};
