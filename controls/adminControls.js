const tryCatchHandler = require("../Middleware/trycatchHandler");
const jwt = require("jsonwebtoken");
const CustomerModel = require("../Models/customerModel");
const ProductModal = require("../Models/productModal");
const cloudinary = require("../Upload/cloudinary");

// Admin Login ---------------
const adminLogin = tryCatchHandler(async (req, res) => {
  const admin = {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
  };

  const { username, password } = req.body;

  const validation =
    username === admin.username && password === admin.password ? true : false;

  if (!validation) {
    res.status(400).send("validation failed: incorrect username or password");
    return;
  }

  const adminToken = jwt.sign({ username: username }, process.env.JWT_SECRET, {
    expiresIn: "1hr",
  });
  console.log(adminToken);

  res.cookie("adminAuth", adminToken);

  const token = req.cookies.adminAuth;
  if (!token) {
    return res.status(400).json({
      success: false,
      message: "cookie issue",
    });
  }

  res.status(200).json({
    success: true,
    message: "Login success",
    adminToken,
  });
  console.log("Admin login success");
});

// View all users
const viewCustomers = tryCatchHandler(async (req, res) => {
  const customers = await CustomerModel.find();
  if (customers) {
    res.status(200).json({
      success: true,
      customer: customers,
    });
  } else {
    res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
});

// Add product
const addProduct = tryCatchHandler(async (req, res) => {
  const {
    title,
    description,
    price,
    brand,
    images,
    gender,
    category,
    sizes,
    color,
  } = req.body;
  const existingProduct = await ProductModal.findOne({ title: title });

  if (existingProduct) {
    return res.status(400).json({
      success: false,
      message: "Product with the same title already exists",
    });
  }

  const uploadedImages = [];
  for (const image of images) {
    const uploadImage = await cloudinary.uploader.upload(image);
    uploadedImages.push(uploadImage.url)
  }

  const newProduct = new ProductModal({
    title,
    description,
    price,
    brand,
    image: uploadedImages,
    gender,
    category,
    sizes,
    color,
  });

  await newProduct.save();

  res.status(201).json({
    success: true,
    message: "Product added successfully",
    product: newProduct,
  });
});

module.exports = { adminLogin, viewCustomers, addProduct };
