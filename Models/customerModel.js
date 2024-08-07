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

const CustomerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
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
      required: function () {
        return this.loginType !== "Google";
      },
      minlength: [6, "Password must be at least 6 characters"],
    },

    loginType: {
      type: String,
      default: "email",
    },

    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        size: { type: String },
        quantity: { type: Number },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    address: [AddressSchema],
    isBlocked: {
      type: Boolean,
      default: false,
    },

    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "orders" }],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

const CustomerModel = mongoose.model("customer", CustomerSchema);

module.exports = CustomerModel;

// order: [
//   {
//     item: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Product",
//       required: true,
//     },
//     size: { type: String },
//     quantity: { type: Number },
//     address: {
//       type: AddressSchema,
//       required: true,
//     },
//     orderTime: {
//       type: Date,
//       default: Date.now,
//     },
//   },
// ],
