const customerModel = require("../Models/customerModel");
const tryCatchHandler = require("../Middleware/trycatchHandler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../Config/config");
const nodemailer = require("nodemailer");
const CustomerModel = require("../Models/customerModel");
const ProductModel = require("../Models/productModal");
const { default: mongoose } = require("mongoose");

// Send OTP to customer email ---------------
const otpSendByEmail = tryCatchHandler(async (req, res) => {
  const { email } = req.body;
  // Check if user already exists
  const checkuser = await CustomerModel.findOne({ email: email });

  if (checkuser) {
    return res.status(400).json({
      message: "User already exists",
      success: false,
    });
  }

  // Generate OTP
  const OTP = Math.floor(1000 + Math.random() * 9000);

  console.log("Generated OTP: " + OTP);

  const hashedOTP = await bcrypt.hash(OTP.toString(), 10);

  // Set OTP cookie
  res.cookie("otp", hashedOTP, { httpOnly: true, secure: true });

  // Send OTP to the user's email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: config.email.user, pass: config.email.pass },
  });

  const mailOptions = {
    from: config.email.user,
    to: email,
    subject: "OTP for Account Verification",
    html: `<p>Your OTP is: <strong>${OTP}</strong></p>`,
  };

  transporter.sendMail(mailOptions, async (err, info) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Error sending OTP", success: false });
    }

    res.status(200).json({
      message: "OTP sent successfully",
      success: true,
    });
  });
});

//Verify OTP and add user to database------------------
const registerUser = tryCatchHandler(async (req, res) => {
  const { userData, otp } = req.body;
  const { name, email, password } = userData;

  const otpInCookie = req.cookies.otp;

  const checkUser = await CustomerModel.find({ email: email });

  if (checkUser.length > 0) {
    res.status(400).json({
      message: "User already exists",
      success: false,
    });
    return;
  }

  const isOtpValid = await bcrypt.compare(otp, otpInCookie);

  if (!isOtpValid) {
    res.status(400).json({
      message: "invalid otp",
      success: false,
    });
    return;
  }
  res.clearCookie("otp");
  const hashedPassword = await bcrypt.hash(password, 10);
  const customer = new CustomerModel({
    name,
    email,
    password: hashedPassword,
  });

  await customer.save();

  res.status(200).json({
    message: "Successful register",
    success: true,
  });
});

//Customer Login-------------------
const customerLogin = tryCatchHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await customerModel.findOne({ email });
  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid email address" });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res
      .status(400)
      .json({ success: false, message: "The password is incorrect" });
  }

  // Generate JWT
  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET
  );

  res.status(200).json({
    token: token,
    message: "Sign-in successful. Start shopping...",
    userData: user,
  });
});

//Products adding to cart-------------------
const addToCart = tryCatchHandler(async (req, res) => {
  const { userId, productId, size, quantity } = req.body;

  if (!userId || !productId || !quantity) {
    return res.status(400).json({ message: "Invalid input data" });
  }

  const user = await CustomerModel.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const product = await ProductModel.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const existingCartItem = user.cart.find(
    (item) => item.product.toString() === productId && item.size === size
  );
  if (existingCartItem) {
    existingCartItem.quantity += quantity;
  } else {
    user.cart.push({ product: product, size, quantity });
  }

  await user.save();
  res.status(201).json({ message: "Product added to cart successfully" });
});

//Get cart-------------------------
const getCart = tryCatchHandler(async (req, res) => {
  const userId = req.params.id;
  const user = await customerModel.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const userCart = user.cart;
  res.status(200).json(userCart);
});

//Upadte Cart-------------------------
const updateCart = tryCatchHandler(async (req, res) => {
  const userId = req.params.userId;
  const updatedCart = req.body;

  await customerModel.findByIdAndUpdate({ _id: userId }, { cart: updatedCart });
  res.status(200).json({ message: "Cart updated successfully" });
});

//Remove Item from Cart---------------------
const removeCartItem = tryCatchHandler(async (req, res) => {
  const userId = req.params.userId;
  const itemId = req.params.itemId;

  try {
    const updatedUser = await customerModel.findByIdAndUpdate(
      userId,
      { $pull: { cart: { _id: itemId } } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const updatedCart = updatedUser.cart;

    res
      .status(200)
      .json({ message: "Item removed from cart successfully", updatedCart });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// const removeCartItem = tryCatchHandler(async (req, res) => {
//   const userId = req.params.userId;
//   const itemId = req.params.itemId;

//   const user = await customerModel.findById(userId);
//   if (!user) {
//     return res.status(404).json({ message: "User not found" });
//   }

//   console.log("asdfghjkl");
//   const itemIdObj = mongoose.Types.ObjectId(itemId)
//   user.cart = user.cart.filter((item) => item.product._id.equals(itemIdObj));
//   // user.cart = user.cart.filter((item) => item.product._id !== itemId);
//   await user.save();
//   res.status(200).json({ message: "Item removed from cart successfully" });
// });

const addWishlist = tryCatchHandler(async (req, res) => {
  const userId = req.body.userId;
  const productId = req.body.productId;

  const user = await customerModel.findById(userId);
  const product = await ProductModel.findById(productId);

  if (!user || !product) {
    return res.status(404).json({
      success: false,
      message: "User or product not found",
    });
  }

  if (!user.wishlist) {
    user.wishlist = [];
  }

  const isExist = user.wishlist.find(
    (item) => item._id.toString() === productId.toString()
  );

  if (isExist) {
    return res.status(400).json({
      message: "Item is already in the wishlist",
    });
  } else {
    user.wishlist.push(product);
    await user.save();
    return res.status(201).json({
      message: "Item added to the wishlist successfully",
      user: user,
    });
  }
});

// view product from wishlist
const displayWishlist = tryCatchHandler(async (req, res) => {
  const userId = req.params.id;

  const user = await customerModel.findById(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const wishListData = user.wishlist;
  return res.status(200).json({
    success: true,
    wishlist: wishListData,
  });
});

module.exports = {
  otpSendByEmail,
  registerUser,
  customerLogin,
  addToCart,
  getCart,
  updateCart,
  removeCartItem,
  addWishlist,
  displayWishlist,
};
