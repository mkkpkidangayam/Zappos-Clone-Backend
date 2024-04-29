const express = require("express");
const router = express.Router();
const productControl = require("../controls/productControl");

router.route("/products").get(productControl.getProducts);
router.route("/product/:id").get(productControl.getProductsById);
router.route("/categories").get(productControl.subCategories);

module.exports = router;
