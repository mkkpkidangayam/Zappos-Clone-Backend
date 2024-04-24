const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming you have a User model
      required: true
    },
    items: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product", // Assuming you have a Product model
          required: true
        },
        quantity: {
          type: Number,
          required: true
        },
        size: String // Assuming you want to include size information
      }
    ],
    address: {
      type: String,
      required: true
    },
    totalPrice: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered"],
      default: "pending"
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

const OrderModel = mongoose.model("Order", orderSchema);

module.exports = OrderModel;
