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
  // Get all users from MongoDB
  const users = await User.find().select("-password").lean();

  // If no users
  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }

  res.json(users);
});

// @description => Create new user
// @route and method - POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {});

// @description => Update a user
// @route and method - PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {});

// @description => Delete a user
// @route and method - DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
