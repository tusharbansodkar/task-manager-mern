const express = require("express");
const {
  registerUser,
  login,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/authController");

const { protect, adminOnly } = require("../middlewares/authMiddleware");

const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", login);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file updaded" });
  }

  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
    req.file.filename
  }`;

  res.status(200).json({ imageUrl });
});

module.exports = router;
