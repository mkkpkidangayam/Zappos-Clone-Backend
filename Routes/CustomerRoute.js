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

router.route("/user/:userId/addresses").get(controller.getAddresses);
router.route("/user/:userId/address").post(controller.addNewAddress);
router.route("/user/:userId/address/:addressId").put(controller.editAddress);
router.route("/user/:userId/address/:addressId").delete(controller.deleteAddress);

router.route("/checkout/:userId").post(controller.goToPayment);
router.route("/create-order/:userId").post(controller.createOrder);

router.route("/add-to-wishlist").post(controller.addWishlist);
router.route("/wishlist/:id").get(controller.displayWishlist);
router.route("/remove-from-wishlist/:userId/:productId").delete(controller.removeFromWislist);


module.exports = router;
