const jwt = require("jsonwebtoken");

// Middleware to protect routes
const protect = async (req, res, next) => {
  try {
    let token = req.header("Authorization");

    if (token && token.startsWith("Bearer")) {
      token = token.split(" ")[1];
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.user = verified;
      next();
    }
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Token failed.", error: error.message });
  }
};

// Middleware for admin-only access

const adminOnly = async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Access denied, admin only." });
  }
};

module.exports = { protect, adminOnly };
