const express = require("express");
const router = express();
const adminAuth = require("../Middleware/adminAuth");
const adminControl = require("../controls/adminControls");
const upload = require("../Upload/multer");
const createProduct = require('../controls/productAdding')

router.route("/admin/login").post(adminControl.adminLogin);

router.route("/admin/users-mangae").get( adminControl.listingUsers);
router.route("/admin/users/delete/:userId").delete(adminAuth, adminControl.deleteUserAccount);

// router.post("/admin/addproduct", adminAuth, upload.array("images", 6), adminControl.addProduct);
router.post("/admin/addproduct",adminAuth, adminControl.addProduct);
// router.post("/admin/addproduct", createProduct);


module.exports = router             