const tryCatchHandler = require("../Middleware/trycatchHandler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../Config/config");
const nodemailer = require("nodemailer");
const CustomerModel = require("../Models/customerModel");
const ProductModel = require("../Models/productModal");
const { default: mongoose } = require("mongoose");
const OrderModel = require("../Models/orderModal");
const stripeID = require("stripe")(process.env.stripe_secret_key);




// Send OTP to customer email ---------------
const otpSendByEmail = tryCatchHandler(async (req, res) => {
  const { email } = req.body;
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
  console.log("config.email.user",config.email.user);
  console.log("email", email);

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

  if (user.isBlocked) {
    return res
      .status(403) // 403 Forbidden status code is more appropriate here
      .json({ success: false, message: "Account is blocked. Please contact support." });
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

  // req.cookies = token

  res.status(200).cookie("token", token).json({
    token: token,
    message: "Sign-in successful. Start shopping...",
    userData: user,
  });
});

//fetch User data to profile
const userProfile = tryCatchHandler(async (req, res) => {
  const { userId } = req.params;
  const userData = await CustomerModel.findById(userId);
  if (!userData) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.status(200).json(userData);
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

//Add item to wishlist----------------------------------------
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
const addNewAddress = tryCatchHandler(async (req, res) => {
  const { userId } = req.params;
  const newAddress = req.body;

  const user = await CustomerModel.findById(userId);
  user.address.push(newAddress);
  await user.save();
  res.status(201).send("Address added successfully");
});

//Edit address
const editAddress = tryCatchHandler(async (req, res) => {
  const { userId, addressId } = req.params;
  const updatedAddress = req.body;

  const user = await CustomerModel.findById(userId);

  const addressIndex = user.address.findIndex(
    (addr) => addr._id.toString() === addressId
  );
  if (addressIndex === -1) {
    return res.status(404).send("Address not found");
  }

  user.address[addressIndex] = updatedAddress;

  await user.save();

  res.status(200).send("Address updated successfully");
});

//Fetch address
const getAddresses = tryCatchHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await CustomerModel.findById(userId);

  if (!user) {
    return res.status(404).send("User not found");
  }
  res.status(200).json(user.address);
});

//Delete address------------------
const deleteAddress = tryCatchHandler(async (req, res) => {
  const { userId, addressId } = req.params;

  const user = await CustomerModel.findById(userId);

  const addressIndex = user.address.findIndex(
    (addr) => addr._id.toString() === addressId
  );
  if (addressIndex === -1) {
    return res.status(404).send("Address not found");
  }
  user.address.splice(addressIndex, 1);
  await user.save();
  res.status(200).send("Address deleted successfully");
});

// payment-----------------
const goToPayment = tryCatchHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await CustomerModel.findById(userId);
  if (!user) {
    return res.status(404).send("User not found");
  }

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

//create order-------------------------
const createOrder = tryCatchHandler(async (req, res) => {
  const { userId } = req.params;
  const { selectedAddressId } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await CustomerModel.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).send("User not found");
    }

    const shippingAddress = user.address.find(
      (addr) => addr._id.toString() === selectedAddressId
    );
    if (!shippingAddress) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).send("Address not found");
    }

    if (user.cart.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).send("Cart is empty");
    }

    const productIds = user.cart.map((item) => item.product);
    const products = await ProductModel.find({
      _id: { $in: productIds },
    }).session(session);

    const newOrder = [];

    for (const cartItem of user.cart) {
      const product = products.find(
        (p) => p._id.toString() === cartItem.product.toString()
      );
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).send(`Product not found: ${cartItem.product}`);
      }

      const sizeIndex = product.sizes.findIndex(
        (size) => size.size === cartItem.size
      );
      if (sizeIndex === -1) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .send(
            `Size ${cartItem.size} not found for product: ${product.title}`
          );
      }

      if (product.sizes[sizeIndex].quantity < cartItem.quantity) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .send(
            `Insufficient quantity for size ${cartItem.size} of product: ${product.title}`
          );
      }

      product.sizes[sizeIndex].quantity -= cartItem.quantity;
      await product.save({ session });

      newOrder.push({
        item: cartItem.product,
        size: cartItem.size,
        quantity: cartItem.quantity,
        address: shippingAddress,
        orderTime: new Date(),
      });
    }

    user.order.push(...newOrder);
    user.cart = [];
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();
    res.status(200).send("Order created successfully");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).send("Failed to create order due to an internal error");
  }
});

// const createOrder = tryCatchHandler(async (req, res) => {
//   const { userId } = req.params;
//   const { selectedAddressId } = req.body;

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const user = await CustomerModel.findById(userId).session(session);
//     if (!user) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).send("User not found");
//     }

//     const shippingAddress = user.address.find((addr) => addr._id.toString() === selectedAddressId);
//     if (!shippingAddress) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).send("Address not found");
//     }

//     if (user.cart.length === 0) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).send("Cart is empty");
//     }

//     const productIds = user.cart.map(item => item.product);
//     const products = await ProductModel.find({_id: { $in: productIds }}).session(session);

//     const newOrderItems = [];

//     for (const cartItem of user.cart) {
//       const product = products.find(p => p._id.toString() === cartItem.product.toString());
//       if (!product) {
//         await session.abortTransaction();
//         session.endSession();
//         return res.status(404).send(`Product not found: ${cartItem.product}`);
//       }

//       const sizeIndex = product.sizes.findIndex((size) => size.size === cartItem.size);
//       if (sizeIndex === -1) {
//         await session.abortTransaction();
//         session.endSession();
//         return res.status(400).send(`Size ${cartItem.size} not found for product: ${product.title}`);
//       }

//       if (product.sizes[sizeIndex].quantity < cartItem.quantity) {
//         await session.abortTransaction();
//         session.endSession();
//         return res.status(400).send(`Insufficient quantity for size ${cartItem.size} of product: ${product.title}`);
//       }

//       product.sizes[sizeIndex].quantity -= cartItem.quantity;
//       await product.save({ session });

//       newOrderItems.push({
//         item: cartItem.product,
//         size: cartItem.size,
//         quantity: cartItem.quantity,
//         orderTime: new Date(),
//       });
//     }

//     const calculateTotalPrice = async (cartItems) => {
//       let totalPrice = 0;

//       for (const cartItem of cartItems) {
//         try {
//           const product = await ProductModel.findById(cartItem.product);
//           if (product) {
//             const itemPrice = product.price;
//             totalPrice += itemPrice * cartItem.quantity;
//           } else {
//             console.error(`Product not found: ${cartItem.product}`);
//           }
//         } catch (error) {
//           console.error(`Error fetching product: ${error}`);
//         }
//       }

//       return totalPrice;
//     };

//     const order = new OrderModel({
//       user: userId,
//       items: newOrderItems,
//       address: shippingAddress,
//       totalPrice: calculateTotalPrice(user.cart), // You need to implement this function
//       status: "pending"
//     });

//     await order.save({ session });

//     user.cart = [];
//     await user.save({ session });

//     await session.commitTransaction();
//     session.endSession();
//     res.status(200).send("Order created successfully");
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error(error);
//     res.status(500).send("Failed to create order due to an internal error");
//   }
// });

//Fetching order details--------------------------
const getOrderDetails = tryCatchHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await CustomerModel.findById(userId).populate("order.product");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const orderDetails = user.order;
  return res.status(200).json(orderDetails);
});

module.exports = {
  otpSendByEmail,
  registerUser,
  customerLogin,
  userProfile,
  addToCart,
  getCart,
  updateCart,
  removeCartItem,
  addWishlist,
  displayWishlist,
  removeFromWislist,
  addNewAddress,
  editAddress,
  getAddresses,
  deleteAddress,
  goToPayment,
  createOrder,
  getOrderDetails,
};
