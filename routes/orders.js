const { Order } = require("../models/order");
const express = require("express");
const router = express.Router();
const { OrderItem } = require("../models/order-item");
const { populate } = require("dotenv");

router.get(`/`, async (req, res) => {
  const orderList = await Order.find()
    .populate("user", "name")
    .sort({ dateOrdered: -1 });

  if (!orderList) {
    res.status(500).json({ success: false });
  }
  res.send(orderList);
});

router.get(`/:id`, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name")
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    });
  if (!order) {
    res.status(500).json({ success: false });
  }
  res.send(order);
});

router.post("/", async (req, res) => {
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });
      newOrderItem = await newOrderItem.save();
      return newOrderItem._id;
    })
  );
  const orderItemsIdsResolved = await orderItemsIds;
  //console.log(orderItemsIdsResolved);
  const totalPrices = await Promise.all(
    orderItemsIdsResolved.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        "product",
        "price"
      );
      const totalPrice = orderItem.product.price * orderItem.quantity;
      return totalPrice;
    })
  );
  console.log(totalPrices);
  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);
  //console.log(totalPrices);
  let order = new Order({
    orderItems: orderItemsIdsResolved,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
  });
  order = await order.save();

  if (!order) return res.status(404).send("the order cannot be created!");
  res.send(order);
});
// router.post("/", async (req, res) => {
//   const orderItemsIds = Promise.all(
//     req.body.orderItems.map(async (orderItem) => {
//       let newOrderItem = new OrderItem({
//         quantity: orderItem.quantity,
//         product: orderItem.product,
//       });
//       newOrderItem = await newOrderItem.save();
//       return newOrderItem._id;
//     })
//   );
//   let order = new Order({
//     orderItems: orderItemsIds,
//     shippingAddress1: req.body.shippingAddress1,
//     shippingAddress2: req.body.shippingAddress2,
//     city: req.body.city,
//     zip: req.body.zip,
//     country: req.body.country,
//     phone: req.body.phone,
//     status: req.body.status,
//     totalPrice: req.body.totalPrice,
//     user: req.body.user,
//   });
//   //order = await order.save();

//   if (!order) return res.status(404).send("the order cannot be created!");
//   res.send(order);
// });
router.put("/:id", async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },

    { new: true }
  );
  if (!order) return res.status(404).send("the order cannot be created!");
  res.send(order);
});

router.delete("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found!" });
    }

    // Delete associated order items
    await Promise.all(
      order.orderItems.map(async (orderItem) => {
        await OrderItem.findByIdAndDelete(orderItem);
      })
    );

    // Delete the order
    await Order.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "The order and its items have been deleted!",
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/get/totalsales", async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
  ]);
  if (!totalSales) {
    return res.status(400).send("The order sales cannot be generated");
  }
  res.send({ totalsales: totalSales.pop().totalsales });
});

// router.get(`/get/count`, async (req, res) => {
//   const orderCount = await Order.countDocuments((count) => count);
//   if (!orderCount) {
//     res.status(500).json({ success: false });
//   }
//   res.send({
//     orderCount: orderCount,
//   });
// });
router.get("/get/count", async (req, res) => {
  try {
    // Count the total number of products
    const orderCount = await Order.countDocuments();

    // Send the count as a response
    return res.status(200).json({
      success: true,
      orderCount: orderCount,
    });
  } catch (error) {
    // Handle unexpected errors
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the order count.",
      error: error.message,
    });
  }
});

router.get(`/get/userorders/:userid`, async (req, res) => {
  const userOrderList = await Order.find({ user: req.params.userid })
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    })
    .sort({ dateOrdered: -1 });

  if (!userOrderList) {
    res.status(500).json({ success: false });
  }
  res.send(userOrderList);
});

module.exports = router;
