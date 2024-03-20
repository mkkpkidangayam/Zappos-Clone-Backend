const express = require("express");
const router = express.Router();
const controller = require("../controls/customerControls");
const authentication = require('../Middleware/authentication')

router.route("/register").post(controller.registerUser);
router.route("/otpsend").post(controller.otpSendByEmail);
router.route("/login").post(controller.customerLogin);

router.route("/add-to-cart").post(controller.addToCart)
router.route("/get-cart/:id").post(controller.getCart)

module.exports = router;
