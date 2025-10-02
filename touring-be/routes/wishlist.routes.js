const express = require("express");
const {
  getMyWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  checkOne,
  checkMany,
} = require("../controller/wishlistController");
const authJwt = require("../middlewares/authJwt");
const router = express.Router();

router.get("/",authJwt, getMyWishlist);
router.post("/", authJwt, addToWishlist);
router.delete("/:tourId",authJwt, removeFromWishlist);
router.post("/toggle",authJwt, toggleWishlist);
router.get("/check/:tourId",authJwt, checkOne);
router.get("/check-many",authJwt, checkMany);

module.exports = router;
