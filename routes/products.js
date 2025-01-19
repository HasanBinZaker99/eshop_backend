const { Category } = require("../models/category");
const { Product } = require("../models/product");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid image type");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    let fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    // Remove any existing extension from the original file name
    if (fileName.endsWith(`.${extension}`)) {
      fileName = fileName.slice(0, -extension.length - 1); // Remove the extension and dot
    }
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) => {
  try {
    //const productList = await Product.find().select("name image -_id");
    let filter = {};
    if (req.query.categories) {
      filter = { category: req.query.categories.split(",") };
    }

    const productList = await Product.find(filter).populate("category");
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

// Create a new product
router.post(`/`, uploadOptions.single("image"), async (req, res) => {
  try {
    // Validate the category ID
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).send("Invalid Category");
    }
    const file = req.file;
    if (!file) return res.status(400).send("No image in the request");
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    // Create a new product instance
    let product = new Product({
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: `${basePath}${fileName}`,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    });

    // Save the product to the database
    product = await product.save();

    if (!product) {
      return res.status(500).send("The product cannot be created");
    }

    // Send the created product as a response
    res.status(201).send(product);
  } catch (error) {
    console.error("Error creating product:", error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the product",
      error: error.message,
    });
  }
});
// router.post(`/`, async (req, res) => {
//   const category = await Category.findById(req.body.category);
//   if (!category) return res.status(400).send("Invalid Category");

//   let product = new Product({
//     name: req.body.name,
//     description: req.body.description,
//     richDescription: req.body.richDescription,
//     image: req.body.image,
//     brand: req.body.brand,
//     price: req.body.price,
//     category: req.body.category,
//     countInStock: req.body.countInStock,
//     rating: req.body.rating,
//     numReviews: req.body.numReviews,
//     isFeatured: req.body.isFeatured,
//   });

//   product = await product.save();

//   if (!product) return res.status(500).send("The product cannot be created");

//   res.send(product);
// });
// update products
router.put("/:id", uploadOptions.single("image"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid Product Id");
  }
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  const product = await Product.findById(req.params.id);
  if (!product) return res.status(400).send("Invalid Product!");

  const file = req.file;
  let imagepath;

  if (file) {
    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    imagepath = `${basePath}${fileName}`;
  } else {
    imagepath = product.image;
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: imagepath,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true }
  );

  if (!updatedProduct)
    return res.status(500).send("the product cannot be updated!");

  res.send(updatedProduct);
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

router.put(
  "/gallery-images/:id",
  uploadOptions.array("images", 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("Invalid Product Id");
    }
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

    if (files) {
      files.map((file) => {
        imagesPaths.push(`${basePath}${file.filename}`);
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPaths,
      },
      { new: true }
    );

    if (!product) return res.status(500).send("the gallery cannot be updated!");

    res.send(product);
  }
);

module.exports = router;
