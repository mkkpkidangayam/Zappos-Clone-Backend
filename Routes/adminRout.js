const express = require("express");
const router = express();
const adminAuth = require("../Middleware/adminAuth");
const adminControl = require("../controls/adminControls");
const upload = require("../Upload/multer");

router.route("/admin/login").post(adminControl.adminLogin);

router.route("/admin/users").get(adminAuth, adminControl.viewCustomers);

router.post("/admin/add-product", adminAuth, upload.array("images", 6), adminControl.addProduct);


module.exports = router