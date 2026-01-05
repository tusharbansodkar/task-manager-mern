require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");
const connectDB = require("./config/db");

const app = express();

// Connect DB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
// app.use("/api/report", reportRoutes);
// app.use("/api/task", taskRoutes);
// app.use("/api/user", userRoutes);

const PORT = process.env.PORT || 5000;

app.get("/home", (req, res) => {
  return res.send("welcome");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
