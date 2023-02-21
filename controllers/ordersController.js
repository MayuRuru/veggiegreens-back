// models:
const User = require("../models/User");
const Order = require("../models/Order");

// prevents handling many try catch blocks using async methods with mongoose:
const asyncHandler = require("express-async-handler");

// @description => Get all orders
// @route and method - GET /orders
// @access Private

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().select().lean();

  if (!orders?.length) {
    return res.status(400).json({ message: "No orders found" });
  }

  // Add username to each order before sending the response:
  const ordersWithUser = await Promise.all(
    orders.map(async (order) => {
      const user = await User.findById(order.user).lean().exec();
      return { ...order, username: user.username };
    })
  );

  res.json(ordersWithUser);
});

// @description => Create new order
// @route and method - POST /orders
// @access Private
const createNewOrder = asyncHandler(async (req, res) => {
  const { user, title, text } = req.body;

  if (!user || !title || !text) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const duplicate = await Order.findOne({ title }).lean().exec();
  if (duplicate) {
    return res.status(409).json({ message: "Duplicate order" });
  }

  const order = await Order.create({ user, title, text });

  if (order) {
    res.status(201).json({ message: `New order created` });
  } else {
    res.status(400).json({ message: "Invalid data received" });
  }
});

// @description => Update a order
// @route and method - PATCH /orders
// @access Private
const updateOrder = asyncHandler(async (req, res) => {
  const { id, user, title, text, completed } = req.body;

  if (!id || !user || !title || !text || typeof completed !== "boolean") {
    return res.status(400).json({ message: "All fields are required" });
  }

  const order = await Order.findById(id).exec();

  if (!order) {
    return res.status(400).json({ message: "Order not found" });
  }

  const duplicate = await Order.findOne({ title }).lean().exec();

  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate order" });
  }

  order.user = user;
  order.title = title;
  order.text = text;
  order.completed = completed;

  const updatedOrder = await order.save();

  res.json({ message: `${updatedOrder.title} updated` });
});

// @description => Delete a order
// @route and method - DELETE /orders
// @access Private
const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Order ID Required" });
  }

  const order = await User.findById(id).exec();

  if (!order) {
    return res.status(400).json({ message: "Order not found" });
  }

  const result = await order.deleteOne();

  const reply = `Order ${result.title} with ID ${result._id} deleted`;

  res.json(reply);
});

module.exports = {
  getAllOrders,
  createNewOrder,
  updateOrder,
  deleteOrder,
};
