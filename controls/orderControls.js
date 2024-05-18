const tryCatchHandler = require("../Middleware/trycatchHandler");
const CouponModel = require("../Models/couponModel");
const CustomerModel = require("../Models/customerModel");
const OrderModel = require("../Models/orderModal");
const ProductModel = require("../Models/productModal");

const createOrder = tryCatchHandler(async (req, res) => {
  const { userId } = req.params;
  const { selectedAddressId, couponCode} = req.body;


  const user = await CustomerModel.findById(userId);
  if (!user) {
    return res.status(404).send("User not found");
  }

  const shippingAddress = user.address.find(
    (addr) => addr._id.toString() === selectedAddressId
  );
  if (!shippingAddress) {
    return res.status(404).send("Address not found");
  }

  if (user.cart.length === 0) {
    return res.status(400).send("Cart is empty");
  }

  const productIds = user.cart.map((item) => item.product);
  const products = await ProductModel.find({ _id: { $in: productIds } });

  let newOrderItems = [];

  for (const cartItem of user.cart) {
    const product = products.find(
      (p) => p._id.toString() === cartItem.product.toString()
    );
    if (!product) {
      return res.status(404).send(`Product not found: ${cartItem.product}`);
    }

    const sizeIndex = product.sizes.findIndex(
      (size) => size.size === cartItem.size
    );
    if (sizeIndex === -1) {
      return res
        .status(400)
        .send(`Size ${cartItem.size} not found for product: ${product.title}`);
    }

    if (product.sizes[sizeIndex].quantity < cartItem.quantity) {
      return res
        .status(400)
        .send(
          `Insufficient quantity for size ${cartItem.size} of product: ${product.title}`
        );
    }

    product.sizes[sizeIndex].quantity -= cartItem.quantity;
    await product.save();

    newOrderItems.push({
      item: cartItem.product,
      size: cartItem.size,
      quantity: cartItem.quantity,
      orderTime: new Date(),
    });
  }

//   const coupon = await CouponModel.findById(couponCode)
//   console.log(coupon);

  const calculateTotalPrice = async (cartItems) => {
    let totalPrice = 0;

    for (const cartItem of cartItems) {
      try {
        const product = await ProductModel.findById(cartItem.product);
        if (product) {
          const itemPrice = product.price;
          totalPrice += itemPrice * cartItem.quantity;
        } else {
          console.error(`Product not found: ${cartItem.product}`);
        }
      } catch (error) {
        console.error(`Error fetching product: ${error}`);
      }
    }

    return totalPrice;
  };

  const totalPrice = await calculateTotalPrice(user.cart);

  const order = await OrderModel.create({
    user: userId,
    items: newOrderItems,
    address: shippingAddress,
    totalPrice: totalPrice,
    status: "pending",
  });

  user.order.push(order._id);
  user.cart = [];
  await user.save();

  res.status(200).send("Order created successfully");
});

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

module.exports = { createOrder, getOrderDetails };
