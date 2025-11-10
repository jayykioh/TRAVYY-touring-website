const mongoose = require("mongoose");
// ==================== CART ====================
const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

// ==================== CART ITEM ====================

const CartItemSchema = new mongoose.Schema({
  cartId: { type: mongoose.Schema.Types.ObjectId, ref: "Cart", required: true },
  tourId: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", required: true },
  date: { type: String, required: true },       

  // dữ liệu giỏ hàng từ FE
  adults: { type: Number, default: 0 },
  children: { type: Number, default: 0 },
  selected: { type: Boolean, default: true },
  available: { type: Boolean, default: true },

  // snapshot giá (BE sẽ tính, không tin FE)
  unitPriceAdult: { type: Number, required: true },
  unitPriceChild: { type: Number, required: true },

  
  unitOriginalAdult: { type: Number, default: null },
  unitOriginalChild: { type: Number, default: null },

  // snapshot info (hiển thị nhanh, optional)
  name: String,
  image: String,
}, { timestamps: true });
CartItemSchema.index({ cartId: 1, tourId: 1, date: 1 }, { unique: true });
// ==================== ORDER ====================
const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cartId: { type: mongoose.Schema.Types.ObjectId, ref: "Cart" },

  items: [{
    tourId: mongoose.Schema.Types.ObjectId,
    date: String,
    adults: Number,
    children: Number,
    unitPriceAdult: Number,
    unitPriceChild: Number,
    name: String,
    image: String
  }],

  total: { type: Number, required: true },
  payMethod: { type: String, enum: ["paypal", "momo"], required: true },
  status: { 
    type: String, 
    enum: ["PENDING_PAYMENT", "PAID", "FAILED", "CANCELLED"], 
    default: "PENDING_PAYMENT" 
  }
}, { timestamps: true });

// ==================== EXPORT ====================
module.exports = {
  Cart: mongoose.model("Cart", CartSchema),
  CartItem: mongoose.model("CartItem", CartItemSchema),
  Order: mongoose.model("Order", OrderSchema)
};
