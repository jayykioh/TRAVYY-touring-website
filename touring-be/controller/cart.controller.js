// controller/cart.controller.js
const mongoose = require("mongoose");
const { Cart, CartItem } = require("../models/Carts");
const Tour = require("../models/Tours");

/* ============ utils ============ */
const normalizeDate = (d) => (d ? String(d).slice(0, 10) : "");
const clamp0 = (n) => Math.max(0, Number(n) || 0);
const sumQty = (a, c) => clamp0(a) + clamp0(c);

/** seats còn lại của 1 departure (null => không giới hạn) */
async function getSeatsLeft(tourId, date) {
  const tour = await Tour.findById(tourId, { departures: 1 }).lean();
  const dep = tour?.departures?.find((d) => {
    const dStr =
      d?.date instanceof Date
        ? d.date.toISOString().slice(0, 10)
        : String(d?.date || "").slice(0, 10);
    return dStr === date;
  });
  return typeof dep?.seatsLeft === "number" ? dep.seatsLeft : null;
}

/** Lấy giá theo ngày + meta (kèm giá gốc nếu có) */
async function getPricesAndMeta(tourId, date) {
  const tour = await Tour.findById(tourId).lean();
  if (!tour) {
    return {
      unitPriceAdult: 0,
      unitPriceChild: 0,
      originalAdult: null,
      originalChild: null,
      meta: {
        name: "",
        image: "",
        departureStatus: "open",
        seatsLeft: null,
        seatsTotal: null,
        found: false,
      },
    };
  }

  const dep = (tour.departures || []).find(
    (d) => (d?.date || "").slice(0, 10) === date
  );

  const unitPriceAdult =
    typeof dep?.priceAdult === "number"
      ? dep.priceAdult
      : typeof tour.basePrice === "number"
      ? tour.basePrice
      : 0;

  const unitPriceChild =
    typeof dep?.priceChild === "number"
      ? dep.priceChild
      : Math.round((unitPriceAdult || 0) * 0.5);

  const originalAdult =
    typeof dep?.priceOriginalAdult === "number"
      ? dep.priceOriginalAdult
      : typeof dep?.priceOriginal === "number"
      ? dep.priceOriginal
      : typeof tour?.originalPrice === "number"
      ? tour.originalPrice
      : null;

  const originalChild =
    typeof dep?.priceOriginalChild === "number"
      ? dep.priceOriginalChild
      : originalAdult != null
      ? Math.round(originalAdult * 0.5)
      : null;

  const meta = {
    name: tour.title || "",
    image: tour.imageItems?.[0]?.imageUrl || "",
    departureStatus: dep?.status || "open",
    seatsLeft: dep?.seatsLeft ?? null,
    seatsTotal: dep?.seatsTotal ?? null,
    found: !!dep,
  };

  return { unitPriceAdult, unitPriceChild, originalAdult, originalChild, meta };
}

function normalizeInc(x = {}) {
  return {
    tourId: x.tourId || x.id || null,
    date: normalizeDate(x.date),
    adults: clamp0(x.adults),
    children: clamp0(x.children),
    selected: x.selected !== false,
    available: x.available !== false,
    name: x.name || "",
    image: x.image || "",
  };
}

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ userId });
  if (!cart) cart = await Cart.create({ userId });
  return cart;
}

/** Map CartItem -> FE format */
function mapItem(ci, extra = {}) {
  return {
    itemId: String(ci._id),
    id: String(ci.tourId),
    name: ci.name || "",
    date: ci.date,
    adults: ci.adults,
    children: ci.children,
    adultPrice: ci.unitPriceAdult,
    childPrice: ci.unitPriceChild,
    adultOriginalPrice: ci.unitOriginalAdult ?? null,
    childOriginalPrice: ci.unitOriginalChild ?? null,
    selected: !!ci.selected,
    available: !!ci.available,
    image: ci.image || "",
    seatsLeft: extra.seatsLeft ?? null,
    seatsTotal: extra.seatsTotal ?? null,
  };
}

/* ============ handlers ============ */

/** GET /api/cart */
async function getCart(req, res) {
  try {
    const userId = req.user.sub;
    const cart = await getOrCreateCart(userId);
    const rows = await CartItem.find({ cartId: cart._id }).sort({
      createdAt: -1,
    });

    const items = [];
    for (const ci of rows) {
      const { meta } = await getPricesAndMeta(ci.tourId, ci.date);
      items.push(
        mapItem(ci, { seatsLeft: meta.seatsLeft, seatsTotal: meta.seatsTotal })
      );
    }

    res.json({ items });
  } catch (err) {
    console.error("getCart error:", err);
    res.status(500).json({ error: "GET_CART_FAILED" });
  }
}

/** POST /api/cart/sync — merge local cart */
async function syncCart(req, res) {
  try {
    const userId = req.user.sub;
    const cart = await getOrCreateCart(userId);
    const incItems = Array.isArray(req.body.items)
      ? req.body.items.map(normalizeInc)
      : [];

    const existing = await CartItem.find({ cartId: cart._id });

    for (const inc of incItems) {
      if (!inc.tourId || !inc.date) continue;

      let tourId;
      try {
        tourId = new mongoose.Types.ObjectId(inc.tourId);
      } catch {
        continue;
      }

      let line = existing.find(
        (i) => i.tourId.toString() === tourId.toString() && i.date === inc.date
      );

      const {
        unitPriceAdult,
        unitPriceChild,
        originalAdult,
        originalChild,
        meta,
      } = await getPricesAndMeta(tourId, inc.date);

      if (!line) {
        const created = await CartItem.create({
          cartId: cart._id,
          tourId,
          date: inc.date,
          adults: inc.adults,
          children: inc.children,
          selected: inc.selected,
          available: inc.available,
          unitPriceAdult,
          unitPriceChild,
          unitOriginalAdult: originalAdult ?? null,
          unitOriginalChild: originalChild ?? null,
          name: inc.name || meta.name,
          image: inc.image || meta.image,
        });
        existing.push(created);
      } else {
        // cộng dồn & refresh snapshot
        line.adults += inc.adults;
        line.children += inc.children;
        line.selected = inc.selected ?? line.selected;
        line.available = inc.available ?? line.available;
        line.unitPriceAdult = unitPriceAdult;
        line.unitPriceChild = unitPriceChild;
        line.unitOriginalAdult = originalAdult ?? null;
        line.unitOriginalChild = originalChild ?? null;
        if (meta?.name && !line.name) line.name = meta.name;
        if (meta?.image && !line.image) line.image = meta.image;
        await line.save();
      }
    }

    const rows = await CartItem.find({ cartId: cart._id }).sort({
      createdAt: -1,
    });

    const items = [];
    for (const ci of rows) {
      const { meta } = await getPricesAndMeta(ci.tourId, ci.date);
      items.push(
        mapItem(ci, { seatsLeft: meta.seatsLeft, seatsTotal: meta.seatsTotal })
      );
    }
    res.json({ items });
  } catch (err) {
    console.error("syncCart error:", err);
    res.status(500).json({ error: "SYNC_CART_FAILED" });
  }
}

/** POST /api/cart — ADD with capacity guard */
async function addToCart(req, res) {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const userId = req.user.sub;
      const cart = await getOrCreateCart(userId);
      const inc = normalizeInc(req.body);
      if (!inc.tourId || !inc.date)
        throw Object.assign(new Error("BAD"), {
          status: 400,
          body: { error: "MISSING_TOUR_OR_DATE" },
        });

      let tourId;
      try {
        tourId = new mongoose.Types.ObjectId(inc.tourId);
      } catch {
        throw Object.assign(new Error("BAD"), {
          status: 400,
          body: { error: "INVALID_TOUR_ID" },
        });
      }

      const date = normalizeDate(inc.date);
      const addQty = sumQty(inc.adults, inc.children);
      if (addQty <= 0)
        throw Object.assign(new Error("BAD"), {
          status: 400,
          body: { error: "INVALID_QUANTITY" },
        });

      // 1) seats
      const seatsLeft = await getSeatsLeft(tourId, date);

      // 2) dòng hiện có
      const existing = await CartItem.findOne(
        { cartId: cart._id, tourId, date },
        { adults: 1, children: 1 },
        { session }
      );

      // 3) enforce capacity
      const current = existing ? sumQty(existing.adults, existing.children) : 0;
      if (seatsLeft != null && current + addQty > seatsLeft) {
        throw Object.assign(new Error("CAPACITY"), {
          status: 409,
          body: { error: "EXCEEDS_DEPARTURE_CAPACITY", limit: seatsLeft },
        });
      }

      // 4) snapshot giá/meta
      const {
        unitPriceAdult,
        unitPriceChild,
        originalAdult,
        originalChild,
        meta,
      } = await getPricesAndMeta(tourId, date);

      // 5) upsert + $inc
      await CartItem.findOneAndUpdate(
        { cartId: cart._id, tourId, date },
        {
          $setOnInsert: {
            selected: true,
            available:
              meta.departureStatus === "open" &&
              (seatsLeft == null || seatsLeft > 0),
            name: inc.name || meta.name,
            image: inc.image || meta.image,
          },
          $set: {
            unitPriceAdult,
            unitPriceChild,
            unitOriginalAdult: originalAdult ?? null,
            unitOriginalChild: originalChild ?? null,
          },
          $inc: {
            adults: clamp0(inc.adults),
            children: clamp0(inc.children),
          },
        },
        { upsert: true, new: true, session }
      );

      // 6) trả giỏ
      const rows = await CartItem.find({ cartId: cart._id }, null, {
        session,
      }).sort({ createdAt: -1 });

      const items = [];
      for (const ci of rows) {
        const { meta: m } = await getPricesAndMeta(ci.tourId, ci.date);
        items.push(
          mapItem(ci, { seatsLeft: m.seatsLeft, seatsTotal: m.seatsTotal })
        );
      }
      res.json({ items });
    });
  } catch (err) {
    if (err?.status) return res.status(err.status).json(err.body);
    if (err?.code === 11000) {
      // race unique: trả giỏ hiện tại
      const userId = req.user.sub;
      const cart = await getOrCreateCart(userId);
      const rows = await CartItem.find({ cartId: cart._id }).sort({
        createdAt: -1,
      });
      const items = [];
      for (const ci of rows) {
        const { meta: m } = await getPricesAndMeta(ci.tourId, ci.date);
        items.push(
          mapItem(ci, { seatsLeft: m.seatsLeft, seatsTotal: m.seatsTotal })
        );
      }
      return res.json({ items });
    }
    console.error("addToCart error:", err);
    res.status(500).json({ error: "ADD_TO_CART_FAILED" });
  } finally {
    session.endSession();
  }
}

/** PUT /api/cart/:itemId — UPDATE with capacity guard */
async function updateCartItem(req, res) {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const userId = req.user.sub;
      const cart = await getOrCreateCart(userId);
      const { itemId } = req.params;

      const line = await CartItem.findOne(
        { _id: itemId, cartId: cart._id },
        null,
        { session }
      );
      if (!line) return res.status(404).json({ error: "ITEM_NOT_FOUND" });

      const nextAdults =
        req.body.adults != null ? clamp0(req.body.adults) : line.adults;
      const nextChildren =
        req.body.children != null ? clamp0(req.body.children) : line.children;

      // seats
      const seatsLeft = await getSeatsLeft(line.tourId, line.date);
      if (seatsLeft != null && sumQty(nextAdults, nextChildren) > seatsLeft) {
        return res
          .status(409)
          .json({ error: "EXCEEDS_DEPARTURE_CAPACITY", limit: seatsLeft });
      }

      const {
        unitPriceAdult,
        unitPriceChild,
        originalAdult,
        originalChild,
      } = await getPricesAndMeta(line.tourId, line.date);

      line.adults = nextAdults;
      line.children = nextChildren;
      if (req.body.selected != null) line.selected = !!req.body.selected;
      if (req.body.available != null) line.available = !!req.body.available;

      line.unitPriceAdult = unitPriceAdult;
      line.unitPriceChild = unitPriceChild;
      line.unitOriginalAdult = originalAdult ?? null;
      line.unitOriginalChild = originalChild ?? null;

      await line.save({ session });

      const rows = await CartItem.find({ cartId: cart._id }, null, {
        session,
      }).sort({ createdAt: -1 });

      const items = [];
      for (const ci of rows) {
        const { meta: m } = await getPricesAndMeta(ci.tourId, ci.date);
        items.push(
          mapItem(ci, { seatsLeft: m.seatsLeft, seatsTotal: m.seatsTotal })
        );
      }
      res.json({ items });
    });
  } catch (err) {
    console.error("updateCartItem error:", err);
    res.status(500).json({ error: "UPDATE_CART_ITEM_FAILED" });
  } finally {
    session.endSession();
  }
}

/** DELETE /api/cart/:itemId */
async function deleteCartItem(req, res) {
  try {
    const userId = req.user.sub;
    const cart = await getOrCreateCart(userId);
    const { itemId } = req.params;

    const own = await CartItem.findOne({ _id: itemId, cartId: cart._id });
    if (!own) return res.status(404).json({ error: "ITEM_NOT_FOUND" });

    await CartItem.deleteOne({ _id: itemId });

    const rows = await CartItem.find({ cartId: cart._id }).sort({
      createdAt: -1,
    });

    const items = [];
    for (const ci of rows) {
      const { meta } = await getPricesAndMeta(ci.tourId, ci.date);
      items.push(
        mapItem(ci, { seatsLeft: meta.seatsLeft, seatsTotal: meta.seatsTotal })
      );
    }
    res.json({ items });
  } catch (err) {
    console.error("deleteCartItem error:", err);
    res.status(500).json({ error: "DELETE_CART_ITEM_FAILED" });
  }
}

/** DELETE /api/cart — clear all */
async function clearCart(req, res) {
  try {
    const userId = req.user.sub;
    const cart = await getOrCreateCart(userId);
    await CartItem.deleteMany({ cartId: cart._id });
    res.json({ items: [] });
  } catch (err) {
    console.error("clearCart error:", err);
    res.status(500).json({ error: "CLEAR_CART_FAILED" });
  }
}

module.exports = {
  getCart,
  syncCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
  clearCart,
};
