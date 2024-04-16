const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const moment = require("moment-timezone");
// const { tryCatchHandler  } = require("../Middleware/trycatchHandler");

const AddressSchema = new mongoose.Schema({
  street: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  postalCode: {
    type: String,
  },
});

const CustomerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
      maxlength: [24, "Username cannot exceed 24 characters"],
    },

    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    wishlist: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      },
    ],
    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        size: { type: String },
        quantity: { type: Number },
      },
    ],
    order: Array,
    address: [AddressSchema],
    createdAt: String,
    updatedAt: String,
  },
  { timestamps: true }
);

const CustomerModel = mongoose.model("customers", CustomerSchema);

module.exports = CustomerModel;
