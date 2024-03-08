const ProductModal = require("../Models/productModal"); // Assuming the schema is in the same directory

const createProduct = async () => {
  try {
    // Create a new product object
    const newProduct = new ProductModal({
      title: "Sample Product",
      description: "This is a sample product description.",
      price: 50.99,
      brand: "Sample Brand",
      gender: "men",
      category: { main: "shoe", sub: "sneakers" },
      sizes: [
        { size: "M", quantity: 10 },
        { size: "L", quantity: 15 },
      ],
      color: "black",
    });

    // Save the product to the database
    const savedProduct = await newProduct.save();
    

    console.log("Product created:", savedProduct);
  } catch (error) {
    console.error("Error creating product:", error);
  }
};
module.exports = createProduct;
// createProduct();
