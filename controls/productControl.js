const tryCatchHandler = require("../Middleware/trycatchHandler");
const ProductModel = require("../Models/productModal");


//show products-----------------
const getProducts = tryCatchHandler(async (req, res) => {
  const products = await ProductModel.find();

  if (!products) {
    res.status(401).json({
      success: false,
      message: "Products not found",
    });
  } else {
    res.status(201).json(products);
  }
});


//show products by id-----------------
const getProductsById = tryCatchHandler(async (req, res) => {
  const _id = req.params.id;

  const productById = await ProductModel.findById(_id);

  if (!productById) {
    res.status(401).json({
      success: false,
      message: "Products not found",
    });
  } else {
    res.status(201).json(productById);
  }
});


//show products by category-----------------
const productsByCategory = tryCatchHandler(async (req, res) => {
  const category = req.params.category;
  const categoryFind = await ProductModel.aggregate([
    {
      $match: { category: category },
    },
  ]);

  if (!categoryFind || categoryFind.length === 0) {
    res.status(404).json({
      success: false,
      message: "Category not found",
    });
  } else {
    res.status(201).json(categoryFind);
  }
});

module.exports = {
  getProducts,
  getProductsById,
  productsByCategory,
};
