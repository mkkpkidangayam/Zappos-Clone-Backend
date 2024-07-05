const express = require("express");
const router = express.Router();
const controller = require("../controls/customerControls");
const orderControl =require("../controls/orderControls")
const authentication = require("../Middleware/authentication");

router.route("/register").post(controller.registerUser);
router.route("/otpsend").post(controller.otpSendByEmail);
router.route("/login").post(controller.customerLogin);
router.route("/google-login").post(controller.googleLogin);
router.route("/forgot-password").post(controller.forgotPassword);
router.route("/reset-password/:token").post(controller.resetPassword);
router.route("/user/profile/:userId").get(authentication, controller.userProfile);

router.route("/add-to-cart").post(authentication, controller.addToCart);
router.route("/get-cart/:id").get(authentication, controller.getCart);
router.route("/update-cart/:userId").put(authentication, controller.updateCart);
router.route("/remove-from-cart/:userId/:itemId").delete(authentication, controller.removeCartItem);

router.route("/user/:userId/addresses").get(authentication, controller.getAddresses);
router.route("/user/:userId/address").post(authentication, controller.addNewAddress);
router.route("/user/:userId/address/:addressId").put(authentication, controller.editAddress);
router.route("/user/:userId/address/:addressId").delete(authentication, controller.deleteAddress);

router.route("/checkout/:userId").post(authentication, controller.goToPayment);
router.route("/create-order/:userId").post(authentication, orderControl.createOrder);
router.route("/user/orders/:userId").get(authentication, orderControl.getOrderDetails);

router.route("/add-to-wishlist").post(authentication, controller.addWishlist);
router.route("/wishlist/:id").get(authentication, controller.displayWishlist);
router.route("/remove-from-wishlist/:userId/:productId").delete(authentication, controller.removeFromWislist);

router.post("/apply-coupon", authentication, controller.applyCoupon)

module.exports = router;
