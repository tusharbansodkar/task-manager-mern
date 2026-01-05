const express = require("express");
const {
  registerUser,
  login,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/authController");

const { protect, adminOnly } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", login);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

module.exports = router;
