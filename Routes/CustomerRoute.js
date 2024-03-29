const express = require("express");
const router = express.Router();
const controller = require("../controls/customerControls");
const authentication = require("../Middleware/authentication");

router.route("/register").post(controller.registerUser);
router.route("/otpsend").post(controller.otpSendByEmail);
router.route("/login").post(controller.customerLogin);

router.route("/add-to-cart").post(controller.addToCart);
router.route("/get-cart/:id").get(controller.getCart);
router.route("/update-cart/:userId").put(controller.updateCart);
router.route("/remove-from-cart/:userId/:itemId").delete(controller.removeCartItem);

router.route("/add-to-wishlist").post(controller.addWishlist);
router.route("/wishlist").get(controller.displayWishlist);

module.exports = router;
