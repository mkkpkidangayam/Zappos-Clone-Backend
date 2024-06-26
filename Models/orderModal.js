const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: [true, "street is required"],
  },
  city: {
    type: String,
    required: [true, "city is required"],
  },
  state: {
    type: String,
    required: [true, "State is required"],
  },
  zipCode: {
    type: String,
    required: [true, "zipCode is required"],
  },
  phoneNumber: {
    type: String,
    required: [true, "phoneNumber is required"],
  },
  label: String,
});

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customer",
      required: true,
    },
    items: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        size: String,
      },
    ],
    address: {
      type: AddressSchema,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "out of delivery",
        "delivered",
      ],
      default: "pending",
    },
    appliedCoupon: {
      type: String,
      default: "nil",
    },
  },
  {
    timestamps: true,
  }
);

const OrderModel = mongoose.model("orders", orderSchema);

module.exports = OrderModel;
