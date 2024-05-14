const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true
    },
    items: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product", 
          required: true
        },
        quantity: {
          type: Number,
          required: true
        },
        size: String
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
