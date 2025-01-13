const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.get(`/`, async (req, res) => {
  const userList = await User.find().select("-passwordHash");

  if (!userList) {
    res.status(500).json({ success: false });
  }
  res.send(userList);
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");
    if (!user) {
      return res
        .status(404)
        .json({ message: "The user with the given ID was not found." });
    }
    return res.status(200).send(user);
  } catch (err) {
    return res.status(500).json({
      message: "An error occurred while fetching the user.",
      error: err.message,
    });
  }
});

router.post("/", async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    color: req.body.color,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });
  user = await user.save();

  if (!user) return res.status(404).send("the user cannot be created!");
  res.send(user);
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const secret = process.env.secret;

  if (!user) {
    return res.status(400).send("The user not found");
  }

  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      secret,
      { expiresIn: "1w" }
    );
    return res.status(200).send({ user: user.email, token: token });
  } else {
    return res.status(400).send("Password is Wrong!");
  }
});

router.post("/register", async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });
  user = await user.save();
  if (!user) return res.status(400).send("the user cannot be created!");
  res.send(user);
});

// Delete Users
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (user) {
      return res
        .status(200)
        .json({ success: true, message: "The user has been deleted!" });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
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
  // Count the total number of products
  // const userCount = await User.countDocuments((count) => count);

  // if (!userCount) {
  //   res.status(500).json({ success: false });
  // }
  // res.send({
  //   userCount: userCount,
  // });

  try {
    // Count the total number of users
    const userCount = await User.countDocuments();

    res.status(200).json({
      userCount: userCount,
    });
  } catch (error) {
    console.error("Error fetching user count:", error);
    res.status(500).json({
      success: false,
      message: "Unable to retrieve user count",
      error: error.message,
    });
  }
});

module.exports = router;
