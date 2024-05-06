const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 50 characters"],
    },

    info: [
      {
        type: String,
        required: true,
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
      required: true,
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
        required: [true, "Sub category is required"],
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

    ratings: [
      {
        score: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        customer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "customers",
          required: true,
        },
        comment: {
          type: String,
          required: false,
        },
      },
    ],
    isHide: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ title: "text" });

const ProductModel = mongoose.model("Product", productSchema);

module.exports = ProductModel;
