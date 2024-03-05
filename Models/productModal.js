const mongoos = require("mongoose");

const productSchema = new mongoos.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [50, "Title cannot exceed 50 characters"],
    },

    description: {
      type: String,
      maxlength: [100, "Description cannot exceed 100 characters"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    brand: {
      type: String
    },
   

    image: {
      type: [String],
      required: [true, "Image URLs is required"],
    },

    gender: {
      type: String,
      require: [true, "product gender is required"],
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
    color:{
      type: String,
      required: true
    },
  },
  {
    timestamps: true,
  }
);

const ProductModal = mongoos.model("Product", productSchema);

module.exports = ProductModal;
