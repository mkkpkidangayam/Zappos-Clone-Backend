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
    process.env.ADMIN_JWT_SECRET
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
// adminControl.js

const usersList = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const users = await CustomerModel.find().skip(startIndex).limit(limit);
  const totalUsers = await CustomerModel.countDocuments();

  const pagination = {
    totalPages: Math.ceil(totalUsers / limit),
    currentPage: page,
  };

  if (endIndex < totalUsers) {
    pagination.nextPage = page + 1;
  }

  if (startIndex > 0) {
    pagination.previousPage = page - 1;
  }

  res.status(200).json({
    success: true,
    users: users,
    pagination: pagination,
  });
};

// const usersList = tryCatchHandler(async (req, res) => {
//   const page = parseInt(req.query.page) || 1
//   const limit = parseInt(req.query.limit) || 10

//   const startIndex = (page - 1) * limit;
//   const endIndex = page * limit;

//   const users = await CustomerModel.find().skip(startIndex).limit(endIndex);

//   if (users) {
//     res.status(200).json({
//       success: true,
//       users: users,
//     });
//   } else {
//     res.status(404).json({
//       success: false,
//       message: "User not found",
//     });
//   }
// });

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

//product listing----------------------------------
const productList = tryCatchHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const startIndex = (page - 1) * limit;

  const products = await ProductModal.find().skip(startIndex).limit(limit);

  const totalProducts = await ProductModal.countDocuments();

  const totalPages = Math.ceil(totalProducts / limit);

  const pagination = {
    currentPage: page,
    totalPages: totalPages,
  };

  res.status(200).json({
     products,
    pagination: pagination,
  });
});

module.exports = {
  adminLogin,
  usersList,
  blockUser,
  unblockUser,
  deleteUserAccount,
  addProduct,
  productList
};
