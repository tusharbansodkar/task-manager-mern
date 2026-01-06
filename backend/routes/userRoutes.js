const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
  getUsers,
  getUserById,
  deleteUser,
} = require("../controllers/userController");

// User management routes

router.get("/", protect, adminOnly, getUsers); // Get all users (admin only)
router.get("/:id", protect, adminOnly, getUserById); // Get user specific role
router.delete("/:id", protect, adminOnly, deleteUser); // Delete user (admin only)

module.exports = router;
