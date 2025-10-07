// routes/carts.routes.js (CommonJS)
const express = require("express");
const authJwt = require("../middlewares/authJwt"); 

const {
  getCart,
  syncCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
  clearCart,
} = require("../controller/cart.controller");

const router = express.Router();

router.get("/", authJwt, getCart);
router.post("/sync", authJwt, syncCart);
router.post("/", authJwt, addToCart);
router.put("/:itemId", authJwt, updateCartItem);
router.delete("/:itemId", authJwt, deleteCartItem);
router.delete("/", authJwt, clearCart);


module.exports = router;
