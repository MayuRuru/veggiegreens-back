// models:
const User = require("../models/User");
const Order = require("../models/Order");

// prevents handling many try catch blocks using async methods with mongoose:
const asyncHandler = require("express-async-handler");

// hashes/encrypts passwords:
const bcrypt = require("bcrypt");

// @description => Get all users
// @route and method - GET /users
// @access Private

const getAllUsers = asyncHandler(async (req, res) => {
  // Get all users from MongoDB but not their password
  // lean() is like a json from mongoose
  const users = await User.find().select("-password").lean();

  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }
  res.json(users);
});

// @description => Create new user
// @route and method - POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;

  // Confirm data and reject errors in those cases:
  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for duplicate username:
  // exec() to receive a promise when passing something
  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Hash password:
  const hashedPassword = await bcrypt.hash(password, 10); // Bcrypt salt rounds

  // Create user object:
  const userObject = { username, password: hashedPassword, roles };

  // Create and store new user:
  const user = await User.create(userObject);

  if (user) {
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
});

// @description => Update a user
// @route and method - PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  const { id, username, roles, active, password } = req.body;

  // Confirm data, including id and active/inactive
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res
      .status(400)
      .json({ message: "All fields except password are required" });
  }

  // Check if the user exist to update:
  // exec() as we pass a value and we need to receive a promise
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Check for duplicate
  const duplicate = await User.findOne({ username }).lean().exec();

  // Allow updates to the original user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    // Hash password
    user.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.username} updated` });
});

// @description => Delete a user
// @route and method - DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "User ID Required" });
  }

  // Check if the user still have assigned orders
  const order = await Order.findOne({ user: id }).lean().exec();
  if (order) {
    return res.status(400).json({ message: "User has assigned orders still" });
  }

  // Does the user exist to delete?
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const result = await user.deleteOne();

  const reply = `Username ${result.username} with ID ${result._id} deleted`;

  res.json(reply);
});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
