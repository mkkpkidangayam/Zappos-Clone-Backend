const tryCatchHandler = require("../Middleware/trycatchHandler");
const jwt = require("jsonwebtoken");
const CustomerModel = require("../Models/customerModel");
const ProductModal = require("../Models/productModal");
const cloudinary = require("../Upload/cloudinary");
const ProductModel = require("../Models/productModal");
const TopBarModel = require("../Models/TopbarModel");
const CouponModel = require("../Models/couponModel");
const OrderModel = require("../Models/orderModal");

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

const addProductForForm = tryCatchHandler(async(req, res) => {
  const { title, info, price, brand, imageUrls, gender, category, sizes, color } = req.body;

  console.log({ title, info, price, brand, imageUrls, gender, category, sizes, color });

  const imageFiles = req.files;
  const images = [...JSON.parse(imageUrls)];

  for (const file of imageFiles) {
    const result = await cloudinary.uploader.upload(file.path);
    images.push(result.secure_url);
  }

  const newProduct = new ProductModal({
    title,
    info: JSON.parse(info),
    price,
    brand,
    images,
    gender,
    category: {
      main: category["main"],
      sub: category["sub"],
    },
    sizes: JSON.parse(sizes),
    color,
    // ratings: JSON.parse(ratings),
  });

  await newProduct.save();
  res.status(201).json({ message: "Product added successfully" });
})

//product listing----------------------------------
// const productList = tryCatchHandler(async (req, res) => {
//   const page = parseInt(req.query.page) || 1;
//   const limit = parseInt(req.query.limit) || 10;

//   const startIndex = (page - 1) * limit;

//   const products = await ProductModal.find().skip(startIndex).limit(limit);

//   const totalProducts = await ProductModal.countDocuments();

//   const totalPages = Math.ceil(totalProducts / limit);

//   const pagination = {
//     currentPage: page,
//     totalPages: totalPages,
//   };

//   res.status(200).json({
//     products,
//     pagination: pagination,
//   });
// });
const productList = tryCatchHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const gender = req.query.gender || "all";
  const category = req.query.category || "";

  let query = {};

  if (gender !== "all") {
    query.gender = gender;
  }

  if (category !== "") {
    query["category.main"] = category;
  }

  const startIndex = (page - 1) * limit;

  const products = await ProductModal.find(query).skip(startIndex).limit(limit);

  const totalProducts = await ProductModal.countDocuments(query);

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

//Product Detils-----------------
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

// Editproduct-------------------------------
const editproduct = tryCatchHandler(async (req, res) => {
  const { id } = req.params;
  const { title, price, brand, images, sizes, info } = req.body;

  const product = await ProductModal.findByIdAndUpdate(
    id,
    { title, price, brand, images, sizes, info },
    { new: true }
  );

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(product);
});

// TopbarTextCreating-----------------------
const topbarContentCreating = tryCatchHandler(async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(404).json({ message: "Enter a content" });
  }

  const newContent = new TopBarModel({ text });

  await newContent.save();

  res.status(201).json({
    content: newContent,
    message: "Content added successfully",
  });
});

// GetAllContents--------------------
const getAllContents = tryCatchHandler(async (req, res) => {
  const contents = await TopBarModel.find();
  res.status(200).json(contents);
});

// DeleteContent---------------------
const deleteContent = async (req, res) => {
  const { contentId } = req.params;
  const deletedContent = await TopBarModel.findByIdAndDelete(contentId);

  res.status(200).json({
    message: "Content deleted successfully!",
    deletedContent: deletedContent,
  });
};

// CreateCoupon----------------------------
const createCoupon = tryCatchHandler(async (req, res) => {
  const { code, discount } = req.body;

  if (!code || !discount) {
    return res.status(404).json({ message: "Add the coupon and discount" });
  }
  const checkCoupon = await CouponModel.find({ code: code });
  if (checkCoupon.length > 0) {
    return res.status(400).json({
      message: "Coupon already exists",
    });
  }
  const newCoupon = await CouponModel.create({ code, discount });

  res.status(201).json({
    message: "Coupon created succesful!",
    coupon: newCoupon,
  });
});

// GetAllCoupons------------------------
const getAllCoupons = tryCatchHandler(async (req, res) => {
  const coupons = await CouponModel.find();
  res.status(200).json(coupons);
});

// DeleteCoupon----------------------------
const deleteCoupon = async (req, res) => {
  const { couponId } = req.params;
  const deletedCoupon = await CouponModel.findByIdAndDelete(couponId);

  res.status(200).json({
    message: "Coupon deleted successfully!",
    deletedCoupon: deletedCoupon,
  });
};

// BlockCoupon------------
const blockCoupon = tryCatchHandler(async (req, res) => {
  const { couponId } = req.params;

  const coupon = await CouponModel.findByIdAndUpdate(couponId, {
    isBlocked: true,
  });
  res.json(coupon);
});

// UnblockCoupon---------------
const unblockCoupon = tryCatchHandler(async (req, res) => {
  const { couponId } = req.params;

  const updatedCoupon = await CouponModel.findByIdAndUpdate(
    couponId,
    { isBlocked: false },
    { new: true }
  );

  if (!updatedCoupon) {
    return res.status(404).json({ message: "Coupon not found" });
  }

  res.json(updatedCoupon);
});

// GetAllOrders-----------------------------
const getAllOrders = tryCatchHandler(async (req, res) => {
  const orders = await OrderModel.find()
    .populate("customer", "name email")
    .populate("items.item", "title price")
    .exec();
    const sortedordersList = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.status(200).send(sortedordersList);
});

const getOrderById = tryCatchHandler(async (req, res) => {
  const { orderId } = req.params;
  if (!orderId) {
    return res.status(404).json({
      message: "OrderId not found",
    });
  }
  const orderById = await OrderModel.findById(orderId)
    .populate("customer", "name email")
    .populate("items.item", "title price")
    .exec();

  if (!orderById) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  res.status(200).send(orderById);
});

const updateOrder = tryCatchHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!orderId) {
    return res.status(404).json({
      message: "OrderId not found",
    });
  }
  if (!status) {
    return res.status(404).json({
      message: "status not get",
    });
  }
  const updatedOrder = await OrderModel.findByIdAndUpdate(
    { _id: orderId },
    { status: status }
  );
  res.status(200).send(updatedOrder);
});

// Order status
const orderStatus = tryCatchHandler(async (req, res) => {
  const orderDetails = await OrderModel.find();

  const totalOrderCount = orderDetails.length;
  const totalOrderPrice = orderDetails.reduce(
    (total, order) => total + order.totalPrice,
    0
  ).toFixed(2);

  const currentDate = new Date();
  const lastMonthDate = new Date();
  lastMonthDate.setMonth(currentDate.getMonth() - 1);

  const monthlyRevenueOrders = orderDetails.filter(
    (order) =>
      order.createdAt >= lastMonthDate && order.createdAt <= currentDate
  );
  const monthlyRevenue = monthlyRevenueOrders.reduce(
    (total, order) => total + order.totalPrice,
    0
  ).toFixed(2);

  res.json({
    message: "User order details retrieved successfully.",
    totalOrderCount: totalOrderCount,
    totalOrderPrice: totalOrderPrice,
    monthlyRevenue: monthlyRevenue,
  });
});

module.exports = {
  adminLogin,
  usersList,
  blockUser,
  unblockUser,
  deleteUserAccount,
  addProduct,
  addProductForForm,
  productList,
  getProductsById,
  editproduct,
  topbarContentCreating,
  createCoupon,
  getAllCoupons,
  deleteCoupon,
  blockCoupon,
  unblockCoupon,
  getAllContents,
  deleteContent,
  getAllOrders,
  getOrderById,
  updateOrder,
  orderStatus,
};
