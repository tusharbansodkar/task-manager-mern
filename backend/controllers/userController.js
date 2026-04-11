const mongoose = require("mongoose");
const User = require("../models/User");
const Task = require("../models/Task");

const getUsers = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false })
      .select("-password")
      .lean();

    // Add task count to each user
    const usersWithTasksCount = await Promise.all(
      users.map(async (user) => {
        const pendingTasks = await Task.countDocuments({
          assignedTo: user._id,
          status: "Pending",
        });

        const inProgressTasks = await Task.countDocuments({
          assignedTo: user._id,
          status: "In Progress",
        });

        const completedTasks = await Task.countDocuments({
          assignedTo: user._id,
          status: "Completed",
        });

        return {
          user,
          pendingTasks,
          inProgressTasks,
          completedTasks,
        };
      }),
    );

    res.json(usersWithTasksCount);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findOne({ _id: userId, isDeleted: false }).select(
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "User not found" });
    }

    const loggedInUser = req.user.id;

    // Prevent admin from deleting their own account
    if (loggedInUser === id) {
      return res
        .status(400)
        .json({ message: "Admin users cannot delete their own account." });
    }

    const user = await User.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully.", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getUsers, getUserById, deleteUser };
