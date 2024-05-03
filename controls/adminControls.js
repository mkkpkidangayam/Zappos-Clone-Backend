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

  const validation = username === admin.username && password === admin.password;

  if (!validation) {
    return res.status(400).json({
      success: false,
      message: "validation failed: incorrect username or password",
    });
  }

  const adminToken = jwt.sign(
    { username: username },
    process.env.ADMIN_JWT_SECRET,
    {}
  );

  res.cookie("adminToken", adminToken);

  res.status(200).cookie("adminToken", adminToken).json({
    success: true,
    message: "Login success, Welcome admin",
    adminToken: adminToken,
  });
  console.log("Admin login success");
});

// View all users--------------------------
const listingUsers = tryCatchHandler(async (req, res) => {
  const users = await CustomerModel.find();
  if (users) {
    res.status(200).json({
      success: true,
      users: users,
    });
  } else {
    res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
});

// Delete user account-----------------------------
const deleteUserAccount = tryCatchHandler(async (req, res) => {
  const { userId } = req.params;

  await CustomerModel.findByIdAndDelete(userId);
  res.status(200).send("User deleted");
});

// Block user----------------
const blockUser = tryCatchHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await CustomerModel.findByIdAndUpdate(userId, {
    isBlocked: true,
  });
  res.json(user);
});

// Unblock user
const unblockUser = tryCatchHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await CustomerModel.findByIdAndUpdate(userId, {
    isBlocked: false,
  });
  res.json(user);
});

// Add product---------------
const addProduct = tryCatchHandler(async (req, res) => {
  const { title, info, price, brand, images, gender, category, sizes, color } =
    req.body;
  const existingProduct = await ProductModal.findOne({ title: title });

  if (existingProduct) {
    return res.status(400).json({
      success: false,
      message: "Product with the same title already exists",
    });
  }

  // const uploadedImages = [];
  // for (const image of images) {
  //   const uploadImage = await cloudinary.uploader.upload(image);
  //   uploadedImages.push(uploadImage.url);
  // }

  const newProduct = new ProductModal({
    title,
    info,
    price,
    brand,
    images,
    // images: uploadedImages,
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

module.exports = {
  adminLogin,
  listingUsers,
  deleteUserAccount,
  addProduct,
  blockUser,
  unblockUser,
};
