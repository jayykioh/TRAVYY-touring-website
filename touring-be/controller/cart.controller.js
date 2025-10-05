// controllers/cartController.js (CommonJS)
const mongoose = require("mongoose");
const { Cart, CartItem } = require("../models/Carts");
const { getPricesFor, getTourMeta } = require("../services/pricing");

function normalizeInc(x) {
  return {
    tourId:   x.tourId || x.id,  // FE có thể gửi id
    date:     String(x.date || ""),
    adults:   Math.max(0, Number(x.adults) || 0),
    children: Math.max(0, Number(x.children) || 0),
    selected: x.selected !== false,
    available:x.available !== false,
    name:     x.name || "",
    image:    x.image || "",
  };
}

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ userId });
  if (!cart) cart = await Cart.create({ userId });
  return cart;
}

/** GET /api/cart */
async function getCart(req, res) {
  try {
    const userId = req.user.sub;            // ✅ bạn đang dùng id trong token
    const cart = await getOrCreateCart(userId);
    const items = await CartItem.find({ cartId: cart._id }).sort({ createdAt: -1 });

    // map về format FE đang dùng
    const mapped = items.map(ci => ({
      id: String(ci.tourId),
      name: ci.name || "",
      date: ci.date,
      adults: ci.adults,
      children: ci.children,
      adultPrice: ci.unitPriceAdult,
      childPrice: ci.unitPriceChild,
      selected: !!ci.selected,
      available: !!ci.available,
      image: ci.image || ""
    }));
    res.json({ items: mapped });
  } catch (err) {
    console.error("getCart error:", err);
    res.status(500).json({ error: "GET_CART_FAILED" });
  }
}

/** POST /api/cart/sync — FE gửi toàn bộ localStorage cart lên → BE merge */
async function syncCart(req, res) {
  try {
    const userId = req.user.id;
    const incItems = Array.isArray(req.body.items) ? req.body.items.map(normalizeInc) : [];
    const cart = await getOrCreateCart(userId);
    const existing = await CartItem.find({ cartId: cart._id });

    for (const inc of incItems) {
      if (!inc.tourId || !inc.date) continue;
      const tourId = new mongoose.Types.ObjectId(inc.tourId);
      let line = existing.find(i => i.tourId.toString() === tourId.toString() && i.date === inc.date);

      const { unitPriceAdult, unitPriceChild } = await getPricesFor(tourId, inc.date);
      const meta = await getTourMeta(tourId);

      if (!line) {
        line = await CartItem.create({
          cartId: cart._id,
          tourId,
          date: inc.date,
          adults: inc.adults,
          children: inc.children,
          selected: inc.selected,
          available: inc.available,
          unitPriceAdult,
          unitPriceChild,
          name: inc.name || meta.name,
          image: inc.image || meta.image,
        });
        existing.push(line);
      } else {
        // cộng dồn & làm mới giá/snapshot
        line.adults += inc.adults;
        line.children += inc.children;
        line.selected = inc.selected ?? line.selected;
        line.unitPriceAdult = unitPriceAdult;
        line.unitPriceChild = unitPriceChild;
        if (meta?.name && !line.name) line.name = meta.name;
        if (meta?.image && !line.image) line.image = meta.image;
        await line.save();
      }
    }

    const items = await CartItem.find({ cartId: cart._id }).sort({ createdAt: -1 });
    const mapped = items.map(ci => ({
      id: String(ci.tourId),
      name: ci.name || "",
      date: ci.date,
      adults: ci.adults,
      children: ci.children,
      adultPrice: ci.unitPriceAdult,
      childPrice: ci.unitPriceChild,
      selected: !!ci.selected,
      available: !!ci.available,
      image: ci.image || ""
    }));
    res.json({ items: mapped });
  } catch (err) {
    console.error("syncCart error:", err);
    res.status(500).json({ error: "SYNC_CART_FAILED" });
  }
}

/** POST /api/cart — thêm 1 dòng vào giỏ */
async function addToCart(req, res) {
  try {
    const userId = req.user.id;
    const cart = await getOrCreateCart(userId);
    const { tourId: _tourId, id, date, adults = 0, children = 0, name, image } = req.body;
    const tourId = new mongoose.Types.ObjectId(_tourId || id);

    let line = await CartItem.findOne({ cartId: cart._id, tourId, date });
    const { unitPriceAdult, unitPriceChild } = await getPricesFor(tourId, date);

    if (line) {
      line.adults += Number(adults) || 0;
      line.children += Number(children) || 0;
      line.unitPriceAdult = unitPriceAdult;
      line.unitPriceChild = unitPriceChild;
      await line.save();
    } else {
      const meta = await getTourMeta(tourId);
      await CartItem.create({
        cartId: cart._id,
        tourId,
        date,
        adults: Number(adults) || 0,
        children: Number(children) || 0,
        selected: true,
        available: true,
        unitPriceAdult,
        unitPriceChild,
        name: name || meta.name,
        image: image || meta.image,
      });
    }

    const items = await CartItem.find({ cartId: cart._id }).sort({ createdAt: -1 });
    const mapped = items.map(ci => ({
      id: String(ci.tourId),
      name: ci.name || "",
      date: ci.date,
      adults: ci.adults,
      children: ci.children,
      adultPrice: ci.unitPriceAdult,
      childPrice: ci.unitPriceChild,
      selected: !!ci.selected,
      available: !!ci.available,
      image: ci.image || ""
    }));
    res.json({ items: mapped });
  } catch (err) {
    console.error("addToCart error:", err);
    res.status(500).json({ error: "ADD_TO_CART_FAILED" });
  }
}

/** PUT /api/cart/:itemId — update qty/toggle */
async function updateCartItem(req, res) {
  try {
    const userId = req.user.id;
    const cart = await getOrCreateCart(userId);
    const { itemId } = req.params;
    const { adults, children, selected, available } = req.body;

    const line = await CartItem.findOne({ _id: itemId, cartId: cart._id });
    if (!line) return res.status(404).json({ error: "Item not found" });

    if (adults   != null) line.adults   = Math.max(0, Number(adults) || 0);
    if (children != null) line.children = Math.max(0, Number(children) || 0);
    if (selected != null) line.selected = !!selected;
    if (available!= null) line.available= !!available;

    await line.save();

    const items = await CartItem.find({ cartId: cart._id }).sort({ createdAt: -1 });
    const mapped = items.map(ci => ({
      id: String(ci.tourId),
      name: ci.name || "",
      date: ci.date,
      adults: ci.adults,
      children: ci.children,
      adultPrice: ci.unitPriceAdult,
      childPrice: ci.unitPriceChild,
      selected: !!ci.selected,
      available: !!ci.available,
      image: ci.image || ""
    }));
    res.json({ items: mapped });
  } catch (err) {
    console.error("updateCartItem error:", err);
    res.status(500).json({ error: "UPDATE_CART_ITEM_FAILED" });
  }
}

/** DELETE /api/cart/:itemId */
async function deleteCartItem(req, res) {
  try {
    const userId = req.user.id;
    const cart = await getOrCreateCart(userId);
    const { itemId } = req.params;

    await CartItem.deleteOne({ _id: itemId, cartId: cart._id });

    const items = await CartItem.find({ cartId: cart._id }).sort({ createdAt: -1 });
    const mapped = items.map(ci => ({
      id: String(ci.tourId),
      name: ci.name || "",
      date: ci.date,
      adults: ci.adults,
      children: ci.children,
      adultPrice: ci.unitPriceAdult,
      childPrice: ci.unitPriceChild,
      selected: !!ci.selected,
      available: !!ci.available,
      image: ci.image || ""
    }));
    res.json({ items: mapped });
  } catch (err) {
    console.error("deleteCartItem error:", err);
    res.status(500).json({ error: "DELETE_CART_ITEM_FAILED" });
  }
}

/** DELETE /api/cart — clear all */
async function clearCart(req, res) {
  try {
    const userId = req.user.id;
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
