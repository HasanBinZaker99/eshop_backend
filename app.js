const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
require("dotenv/config");

const api = process.env.API_URL || "/api"; // Default API path

// Middleware
app.use(express.json());
app.use(morgan("tiny"));

// Product Schema and Model
const productSchema = mongoose.Schema({
  name: String,
  image: String,
  countInStock: Number,
});

const Product = mongoose.model("Product", productSchema);

// Get Products Route
app.get(`${api}/products`, (req, res) => {
  const product = {
    id: 1,
    name: "hair dresser 1",
    image: "some url",
  };
  res.send(product);
});

// Post Product Route
app.post(`${api}/products`, (req, res) => {
  const product = new Product({
    name: req.body.name,
    image: req.body.image,
    countInStock: req.body.countInStock,
  });

  product
    .save()
    .then((createdProduct) => {
      res.status(201).json(createdProduct);
    })
    .catch((err) => {
      res.status(500).json({
        error: err.message,
        success: false,
      });
    });
});

// MongoDB Connection
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database Connection is ready...");
  })
  .catch((err) => {
    console.error(err);
  });

// Start the Server
app.listen(3000, () => {
  console.log("Server is running at http://localhost:3000");
});
