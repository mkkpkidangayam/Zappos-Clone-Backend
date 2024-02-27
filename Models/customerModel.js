const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const moment = require("moment-timezone");
// const { tryCatchHandler  } = require("../Middleware/trycatchHandler");


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
    wishlist: Array,
    cart: Array,
    order: Array,
    address: Array,
    createdAt: String,
    updatedAt: String,
  },
  { timestamps: true }
);

// CustomerSchema.pre("save", trCatchHandler( async function (next) {
//   if (!this.isModified("password")) {
//     return next();
//   }
//   this.password = await bcrypt.hash(this.password, 10);
//   const nowIST = moment().tz("Asia/Kolkata").format("YYYY-MM-DDTHH:mm:ss.SSSZ");
//   this.createdAt = this.createdAt || nowIST;
//   this.updatedAt = nowIST;
//   next();
// }));

const CustomerModel = mongoose.model("customers", CustomerSchema);

module.exports = CustomerModel;  
