const { Category } = require("../models/category");
const { Product } = require("../models/product");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

router.get(`/`, async (req, res) => {
  try {
    //const productList = await Product.find().select("name image -_id");
    const productList = await Product.find().populate("category");
    if (productList.length === 0) {
      return res
        .status(200)
        .json({ success: true, message: "No products found", data: [] });
    }
    res.status(200).json({ success: true, data: productList });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    // Find the product by ID and populate the category
    const product = await Product.findById(req.params.id).populate("category");

    // If no product is found
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product with the given ID was not found.",
      });
    }

    // Send the product as a response
    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    // Handle unexpected errors
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the product.",
      error: error.message,
    });
  }
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

// update products
router.put("/:id", async (req, res) => {
  // Validate product ID
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Product ID.",
    });
  }

  try {
    // Validate category ID
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID.",
      });
    }

    // Update the product
    const updateData = {
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
    };

    // Filter out undefined fields to avoid overwriting with null/undefined
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true } // Return the updated document
    );

    // If product is not found
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "The product with the given ID was not found.",
      });
    }

    // Success response
    return res.status(200).json({
      success: true,
      message: "Product updated successfully!",
      data: product,
    });
  } catch (error) {
    // Handle unexpected errors
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the product.",
      error: error.message,
    });
  }
});

// Delete Product
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (product) {
      return res
        .status(200)
        .json({ success: true, message: "The product has been deleted!" });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Product not found!" });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "An error occured.",
      error: err.message,
    });
  }
});

router.get("/get/count", async (req, res) => {
  try {
    // Count the total number of products
    const productCount = await Product.countDocuments();

    // Send the count as a response
    return res.status(200).json({
      success: true,
      productCount: productCount,
    });
  } catch (error) {
    // Handle unexpected errors
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the product count.",
      error: error.message,
    });
  }
});

router.get(`/get/featured/:count`, async (req, res) => {
  try {
    const count = req.params.count ? req.params.count : 0;
    const products = await Product.find({ isFeatured: true }).limit(+count);

    if (!products) {
      return res.status(500).json({ success: false });
    }

    res.send({ products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
