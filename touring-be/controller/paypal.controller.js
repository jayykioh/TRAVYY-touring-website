const fetch = global.fetch || ((...args) => import("node-fetch").then(({default: f}) => f(...args)));
const mongoose = require("mongoose");
const { Cart, CartItem } = require("../models/Carts");
const Tour = require("../models/Tours");
const Bookings = require("../models/Bookings"); // nếu khác tên, đổi lại

const FX = Number(process.env.FX_VND_USD || 0.000039);
const PAYPAL_BASE = process.env.PAYPAL_MODE === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

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
  const secret = process.env.PAYPAL_SECRET;

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
    throw new Error(`PayPal oauth failed: ${res.status} ${t}`);
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
    if (!cart) return { currency: "USD", items: [], totalVND: 0 };

    const lines = await CartItem.find({ cartId: cart._id, selected: true });
    const items = [];
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
    }
    return { currency: "USD", items, totalVND };
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

  throw Object.assign(new Error("UNSUPPORTED_MODE"), { status: 400 });
}

// ==== controllers ====
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { mode } = req.body;

    console.log("🔍 createOrder request:");
    console.log("   userId:", userId);
    console.log("   body:", JSON.stringify(req.body, null, 2));

    const { items, totalVND, currency, _buyNowMeta } = await buildChargeForUser(userId, req.body);

    if (!items.length || totalVND <= 0) {
      return res.status(400).json({ error: "EMPTY_OR_INVALID_AMOUNT" });
    }

    const accessToken = await getAccessToken();

    // Xây purchase_units
    const amountUSD = toUSD(totalVND);
    const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
    
    // Tính tổng items để so sánh
    const itemsTotal = items.reduce((sum, i) => {
      return sum + (parseFloat(toUSD(i.unit_amount_vnd)) * (i.quantity || 1));
    }, 0);
    const itemsTotalFormatted = itemsTotal.toFixed(2);
    
    console.log("Payment details:", {
      totalVND,
      amountUSD,
      itemsTotalFormatted,
      items: items.map(i => ({
        name: i.name,
        qty: i.quantity,
        unitVND: i.unit_amount_vnd,
        unitUSD: toUSD(i.unit_amount_vnd)
      }))
    });

    const orderBody = {
      intent: "CAPTURE",
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amountUSD,
          breakdown: {
            item_total: {
              currency_code: currency,
              value: itemsTotalFormatted
            }
          }
        },
        items: items.map(i => ({
          name: i.name.substring(0, 127), // PayPal limit 127 chars
          quantity: String(i.quantity || 1),
          unit_amount: { currency_code: currency, value: toUSD(i.unit_amount_vnd) },
        })),
      }],
      application_context: {
        return_url: `${CLIENT_URL}/payment/callback`,
        cancel_url: `${CLIENT_URL}/cart`,
        brand_name: "Travyy Tour",
        shipping_preference: "NO_SHIPPING",
      },
    };

    console.log("PayPal orderBody:", JSON.stringify(orderBody, null, 2));

    const resp = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "PayPal-Request-Id": `order-${userId}-${Date.now()}`
      },
      body: JSON.stringify(orderBody),
    });
    const data = await resp.json();
    
    if (!resp.ok) {
      console.error("PayPal create order failed:", data);
      return res.status(resp.status).json(data);
    }

    // ⬇️ LƯU METADATA VÀO SESSION
    req.session ??= {};
    req.session[`order_${data.id}`] = {
      mode,
      item: req.body.item, // Lưu item nếu buy-now
      totalVND,
      items: items.map(i => {
        const tourId = i.sku?.split('-')[0];
        // ⬇️ FIX: Lấy date từ _buyNowMeta hoặc parse sku đúng (bỏ tourId + dấu '-')
        const date = _buyNowMeta?.date || i.sku?.substring(tourId?.length + 1);
        
        return {
          tourId,
          date: date, // "2025-10-15" ✅
          name: i.name,
          adults: _buyNowMeta?.adults || 0,
          children: _buyNowMeta?.children || 0,
          unitPriceAdult: _buyNowMeta?.unitPriceAdult || 0,
          unitPriceChild: _buyNowMeta?.unitPriceChild || 0,
        };
      })
    };

    res.json({ orderID: data.id });
  } catch (e) {
    console.error("createOrder error", e);
    res.status(e.status || 500).json({ error: "CREATE_ORDER_FAILED" });
  }
};

exports.captureOrder = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const userId = req.user.sub;
    const { orderID } = req.body;

    console.log("\n🔍 ===== CAPTURE ORDER START =====");
    console.log("userId:", userId);
    console.log("orderID:", orderID);

    // ⬇️ CHECK BOOKING ĐÃ TỒN TẠI TRƯỚC (IDEMPOTENT)
    const existingBooking = await Bookings.findOne({ "payment.orderID": orderID });
    if (existingBooking) {
      console.log("✅ Booking already exists (idempotent):", existingBooking._id);
      return res.json({ success: true, bookingId: existingBooking._id });
    }

    // ⬇️ LẤY METADATA TỪ SESSION
    const orderMeta = req.session?.[`order_${orderID}`];
    if (!orderMeta) {
      console.log("❌ Order metadata not found");
      throw Object.assign(new Error("ORDER_METADATA_NOT_FOUND"), { status: 400 });
    }

    console.log("Order metadata:", orderMeta);

    await session.withTransaction(async () => {
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
        throw Object.assign(new Error("PAYPAL_CAPTURE_FAILED"), { status: 422 });
      }

      console.log("✅ PayPal capture successful:", captureData.id);

      // 2) Lấy bookedItems từ metadata
      const bookedItems = orderMeta.items;
      console.log(`\n📦 Found ${bookedItems.length} items to book`);

      // 3) Kiểm tra và giảm seats
      console.log("\n🎫 Checking and reducing seats...");
      
      for (const bk of bookedItems) {
        console.log(`\n   Processing: ${bk.name}`);
        console.log(`   tourId: ${bk.tourId}`);
        console.log(`   date: ${bk.date}`);
        console.log(`   adults: ${bk.adults}, children: ${bk.children}`);

        const tour = await Tour.findById(bk.tourId).session(session);
        if (!tour) {
          console.log(`   ⚠️ Tour not found, skipping`);
          continue;
        }

        const dep = tour.departures.find(d => normDate(d.date) === bk.date);
        if (!dep) {
          console.log(`   ⚠️ Departure not found, skipping`);
          continue;
        }

        console.log(`   📊 Current seats: left=${dep.seatsLeft}, total=${dep.seatsTotal}`);

        const seatsLeft = Number(dep.seatsLeft);
        
        if (dep.seatsLeft == null || isNaN(seatsLeft)) {
          console.log(`   ✅ Unlimited seats, skip reduction`);
          continue;
        }

        const needed = clamp0(bk.adults) + clamp0(bk.children);
        console.log(`   🔢 Need ${needed} seats, available: ${seatsLeft}`);

        if (seatsLeft < needed) {
          console.log(`   ❌ NOT ENOUGH SEATS!`);
          throw Object.assign(
            new Error("INSUFFICIENT_SEATS_DURING_BOOKING"),
            { status: 409, tourId: String(tour._id), date: bk.date }
          );
        }

        console.log(`   🔄 Reducing ${needed} seats...`);

        const updateResult = await Tour.updateOne(
          { _id: tour._id, "departures.date": bk.date },
          { $inc: { "departures.$.seatsLeft": -needed } },
          { session }
        );

        console.log(`   ✅ Update result:`, updateResult);
        console.log(`   ✅ Successfully reduced ${needed} seats`);
      }

      // 4) Tạo booking - SỬA ĐỂ KHỚP VỚI MODEL
      console.log("\n💾 Creating booking...");
      
      const totalAmount = bookedItems.reduce((sum, bk) => 
        sum + (bk.unitPriceAdult * bk.adults) + (bk.unitPriceChild * bk.children), 0
      );

      const booking = await Bookings.create([{
        userId,
        items: bookedItems.map(bk => ({
          tourId: bk.tourId,
          date: bk.date,
          adults: bk.adults,
          children: bk.children,
          unitPriceAdult: bk.unitPriceAdult || 0,
          unitPriceChild: bk.unitPriceChild || 0,
        })),
        currency: "USD",
        totalUSD: Number(toUSD(totalAmount)),
        payment: {
          provider: "paypal",
          status: "completed",
          orderID: orderID,
          raw: captureData,
        },
        status: "paid", // ⬅️ ĐỔI "completed" → "paid"
      }], { session });

      console.log("✅ Booking created:", booking[0]._id);

      // 5) Clear cart nếu mode = cart
      if (orderMeta.mode === "cart") {
        const cart = await Cart.findOne({ userId }).session(session);
        if (cart) {
          const deleteResult = await CartItem.deleteMany(
            { cartId: cart._id, selected: true },
            { session }
          );
          console.log(`✅ Cleared ${deleteResult.deletedCount} cart items`);
        }
      }

      // Xóa metadata sau khi xong
      delete req.session[`order_${orderID}`];

      console.log("\n✅ ===== CAPTURE ORDER SUCCESS =====\n");
      res.json({ success: true, bookingId: booking[0]._id });
    });

  } catch (e) {
    console.error("\n❌ ===== CAPTURE ORDER FAILED =====");
    console.error("Error:", e.message);
    console.error("Stack:", e.stack);
    res.status(e.status || 500).json({ error: e.message || "CAPTURE_FAILED" });
  } finally {
    session.endSession();
  }
};

// Endpoint trả về config cho FE
exports.getConfig = (req, res) => {
  res.json({
    clientId: process.env.PAYPAL_CLIENT_ID,
    currency: "USD"
  });
};
