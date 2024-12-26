const { Category } = require("../models/category");
const express = require("express");
const { Product } = require("../models/product");
const router = express.Router();

router.get(`/`, async (req, res) => {
  const categoryList = await Category.find();

  if (!categoryList) {
    res.status(500).json({ success: false });
  }
  res.send(categoryList);
});

router.post("/", async (req, res) => {
  let category = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });
  category = await category.save();

  if (!category) return res.status(404).send("the category cannot be created!");
  res.send(category);
});

// router.delete("/:id", (req, res) => {
//   Category.findByIdAndRemove(req.params.id)
//     .then((category) => {
//       if (category) {
//         return res
//           .status(200)
//           .json({ success: true, message: "the category is deleted!" });
//       } else {
//         return res
//           .status(404)
//           .json({ success: false, message: "category not found!" });
//       }
//     })
//     .catch((err) => {
//       return res.status(400).json({ success: false, error: err });
//     });
// });

router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (category) {
      return res
        .status(200)
        .json({ success: true, message: "The category has been deleted!" });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Category not found!" });
    }
  } catch (err) {
    return res
      .status(500) // Changed from 400 to 500 for unexpected errors
      .json({
        success: false,
        message: "An error occurred.",
        error: err.message,
      });
  }
});

module.exports = router;
