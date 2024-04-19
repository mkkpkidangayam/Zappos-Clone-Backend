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
      },
    ],

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    brand: {
      type: String,
      trim: true,
    },

    images: [
      {
        type: String,
        required: true,
      },
    ],
    
    gender: {
      type: String,
      trim: true,
      required: [true, "Product gender is required"],
      enum: ["men", "women", "girls", "boys"],
    }, 

    category: {
      main: {
        type: String,
        trim: true,
        required: [true, "Main category is required"],
        enum: ["shoe", "cloth", "accessories"],
      },
      sub: {
        type: String,
        trim: true,
      },
    },

    sizes: [
      {
        size: {
          type: String,
          trim: true,
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
      trim: true, 
    },
  },
  {
    timestamps: true,
  }
);

const ProductModel = mongoose.model("Product", productSchema);

module.exports = ProductModel;
