const express = require("express");
const router = express.Router();
const controller = require("../controls/customerControls");

router.route("/register").post(controller.registerUser);
router.route("/otpsend").post(controller.otpSendByEmail)
router.route('/login').post(controller.customerLogin)






//router.route("/register").post(controller.customerRegistration);
// router.route("/verify-otp").post(controller.verifyOtp);

module.exports = router;
