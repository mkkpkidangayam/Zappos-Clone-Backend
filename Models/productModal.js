const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [50, "Title cannot exceed 50 characters"],
    },

    info: [
      {
        type: String,
        maxlength: [500, "Description cannot exceed 500 characters"],
      },
    ],

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    brand: {
      type: String,
    },

    images: {
      type: Array,
      required: true,
    },

    gender: {
      type: String,
      required: [true, "Product gender is required"],
      enum: ["men", "women", "girls", "boys"],
    },

    category: {
      main: {
        type: String,
        required: [true, "Main category is required"],
        enum: ["shoe", "cloth", "accessories"],
      },
      sub: {
        type: String,
      },
    },

    sizes: [
      {
        size: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],

    color: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ProductModel = mongoose.model("Product", productSchema);

module.exports = ProductModel;
