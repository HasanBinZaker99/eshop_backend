const { Category } = require("../models/category");
const express = require("express");
const { Product } = require("../models/product");
const router = express.Router();

router.get(`/`, async (req, res) => {
  const categoryList = await Category.find();

  if (!categoryList) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(categoryList);
});

// router.get("/:id", async (req, res) => {
//   const category = await Category.findById(req.params.id);
//   if (!category) {
//     res
//       .status(500)
//       .json({ message: "The category with the given id was not found." });
//   }
//   res.status(200).send(category);
// });

router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ message: "The category with the given ID was not found." });
    }
    return res.status(200).send(category);
  } catch (err) {
    return res.status(500).json({
      message: "An error occurred while fetching the category.",
      error: err.message,
    });
  }
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

//Updating the category
// router.put("/:id", async (req, res) => {
//   const category = await Category.findByIdAndUpdate(req.params.id, {
//     name: req.body.name,
//     icon: req.bdoy.icon,
//     color: req.body.color,
//   });
//   if (!category) return res.status(404).send("the category cannot be created!");
//   res.send(category);
// });
router.put("/:id", async (req, res) => {
  try {
    // Validate input (optional)
    const { name, icon, color } = req.body;

    // Update the category
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, icon, color },
      { new: true } // Return the updated document
    );

    // If category is not found
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "The category with the given ID was not found.",
      });
    }

    // Send the updated category as a response
    return res.status(200).json({
      success: true,
      message: "Category updated successfully!",
      data: category,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the category.",
      error: err.message,
    });
  }
});

// Delete Category

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
    return res.status(500).json({
      success: false,
      message: "An error occured.",
      error: err.message,
    });
  }
});

module.exports = router;
