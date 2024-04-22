const tryCatchHandler = require("../Middleware/trycatchHandler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../Config/config");
const nodemailer = require("nodemailer");
const CustomerModel = require("../Models/customerModel");
const ProductModel = require("../Models/productModal");
const { default: mongoose } = require("mongoose");
// const stripe = process.env.stripe_secret_key
const stripe =
  "sk_test_51P7bVeSBKHzUp8h626uJkC2PrHYJ44zWC8mx2ND4x0Zd7KSX5RU37bMKwTvhPeln6a9jW2OSGfVj3n8LQKvQZJCX00Ds1EIQJ6";
const stripeID = require("stripe")(stripe);

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

  const user = await CustomerModel.findOne({ email });
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

  const existingCartItemIndex = user.cart.findIndex(
    (item) => item.product.toString() === productId && item.size === size
  );

  if (existingCartItemIndex !== -1) {
    // If the product is already in the cart, update its quantity
    user.cart[existingCartItemIndex].quantity += quantity;
  } else {
    // If the product is not in the cart, add it to the cart
    user.cart.push({ product: productId, size, quantity });
  }

  await user.save();
  res.status(201).json({ message: "Product added to cart successfully" });
});

//Get cart-------------------------
const getCart = tryCatchHandler(async (req, res) => {
  const userId = req.params.id;
  const user = await CustomerModel.findById(userId).populate("cart.product");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const userCart = user.cart;
  return res.status(200).json(userCart);
});

//Upadte Cart-------------------------
const updateCart = tryCatchHandler(async (req, res) => {
  const userId = req.params.userId;
  const updatedCart = req.body;

  await CustomerModel.findByIdAndUpdate({ _id: userId }, { cart: updatedCart });
  res.status(200).json({ message: "Cart updated successfully" });
});

//Remove Item from Cart---------------------
const removeCartItem = tryCatchHandler(async (req, res) => {
  const userId = req.params.userId;
  const itemId = req.params.itemId;

  const updatedUser = await CustomerModel.findByIdAndUpdate(
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
});

const addWishlist = tryCatchHandler(async (req, res) => {
  const userId = req.body.userId;
  const productId = req.body.productId;

  const user = await CustomerModel.findById(userId);
  const product = await ProductModel.findById(productId);
  if (!user || !product) {
    return res.status(404).json({
      success: false,
      message: "User or product not found",
    });
  }

  // Check if the product is already in the wishlist
  const productCheck = user.wishlist.includes(productId);

  if (productCheck) {
    // If product is in the wishlist, remove it
    await CustomerModel.updateOne(
      { _id: userId },
      { $pull: { wishlist: productId } } // Corrected field name and simplified update
    );
    return res.status(200).json({
      success: false,

      message: "Product removed from wishlist",
    });
  } else {
    // If product is not in the wishlist, add it
    await CustomerModel.updateOne(
      { _id: userId },
      { $push: { wishlist: productId } } // Corrected field name and simplified update
    );
    return res.status(200).json({
      success: true,

      message: "Product added to wishlist",
    });
  }
});

// view product from wishlist
const displayWishlist = tryCatchHandler(async (req, res) => {
  const userId = req.params.id;
  const user = await CustomerModel.findById(userId).populate("wishlist");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const wishListData = user.wishlist;

  return res.status(200).json(wishListData);
});

// Remove from Wishlist
const removeFromWislist = tryCatchHandler(async (req, res) => {
  const userId = req.params.userId;
  const productId = req.params.productId;

  const user = await CustomerModel.findById(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  user.wishlist = user.wishlist.filter((item) => !item.equals(productId));
  await user.save();

  res.status(200).json({
    success: true,
    message: "Product removed from wishlist",
  });
});

//Add shipping address------------------
const addAddress = tryCatchHandler(async (req, res) => {
  const { userId } = req.params;
  const newAddress = req.body;

  const user = await CustomerModel.findById(userId);
  user.address.push(newAddress);
  await user.save();
  res.status(201).send("Address added successfully");
});

// payment-----------------
const orderCart = tryCatchHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await CustomerModel.findById(userId);

  const cartData = user.cart;

  const line_items = [];

  for (const cartItem of cartData) {
    const product = await ProductModel.findById(cartItem.product);
    if (!product) {
      throw new Error(`Product with ID ${cartItem.product} not found`);
    }
    line_items.push({
      price_data: {
        currency: "inr",
        product_data: {
          name: product.title,
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: cartItem.quantity,
    });
  }
  // Create Stripe session
  const session = await stripeID.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: line_items,
    success_url: `http://localhost:3000/payment-success/user/${userId}`,
    cancel_url: `http://localhost:3000//payment-failure/user/${userId}`,
  });
  const sessionId = session.id;
  const sessionUrl = session.url;
  res.cookie("session", sessionId);
  res.send(sessionUrl);
});

//after payment-------------------------
const paymentSuccess = tryCatchHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await CustomerModel.findById(userId);
  if (!user) {
    return res.status(404).send("User not found");
  }

  if (user.cart && user.cart.length > 0) {
    user.order.push(...user.cart);
    user.cart = [];
    await user.save();
  } else {
    res.status(400).send("Cart is empty or not found");
  }
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
  removeFromWislist,
  orderCart,
  paymentSuccess,
  addAddress,
};
