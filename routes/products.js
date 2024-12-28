const { Category } = require("../models/category");
const { Product } = require("../models/product");
const express = require("express");
const router = express.Router();

router.get(`/`, async (req, res) => {
  const productList = await Product.find();

  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.send(productList);
});

router.post("/", async (req, res) => {
  try {
    // Validate category
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category." });
    }

    // Create a new product
    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    });

    // Save the product
    const savedProduct = await product.save();
    if (!savedProduct) {
      return res
        .status(500)
        .json({ success: false, message: "The product could not be created." });
    }

    // Send success response
    return res.status(201).json({
      success: true,
      message: "Product created successfully!",
      data: savedProduct,
    });
  } catch (err) {
    // Handle unexpected errors
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the product.",
      error: err.message,
    });
  }
});

module.exports = router;
