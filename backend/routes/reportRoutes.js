const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
  exportTaskReport,
  exportUserReport,
} = require("../controllers/reportController");

const router = express.Router();

router.get("/task-report", protect, adminOnly, exportTaskReport);
router.get("/user-report", protect, adminOnly, exportUserReport);

module.exports = router;
