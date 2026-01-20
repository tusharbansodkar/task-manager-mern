const mongoose = require("mongoose");
const User = require("../models/User");

const getUsers = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false }).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({ _id: id, isDeleted: false }).select(
      "-password",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const loggedInUser = req.user;

    // Prevent admin from deleting their own account
    if (loggedInUser._id.toString() === id) {
      return res
        .status(400)
        .json({ message: "Admin users cannot delete their own account." });
    }

    const user = await User.findByIdAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getUsers, getUserById, deleteUser };
