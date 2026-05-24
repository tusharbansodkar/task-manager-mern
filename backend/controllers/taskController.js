const Task = require("../models/Task");
const mongoose = require("mongoose");

//@desc   Get all tasks (Admin: all, User: only assigned task)
//@route  GET /api/tasks
//@access Private

const getTasks = async (req, res) => {
  try {
    const status = req.query.status;
    let filter = {};

    if (status) {
      filter.status = status;
    }

    let tasks =
      req.user.role === "admin"
        ? await Task.find({ ...filter, isDeleted: false })
            .populate("assignedTo", "name email profileImageURL")
            .lean()
        : await Task.find({
            ...filter,
            assignedTo: req.user.id,
            isDeleted: false,
          })
            .populate("assignedTo", "name email profileImageURL")
            .lean();

    tasks = tasks.map((task) => {
      const completedCount = task.todoChecklist.filter(
        (item) => item.completed,
      ).length;

      return { ...task, completedTodoCount: completedCount };
    });

    // Status summary count

    const allTasks = tasks.length;

    const pendingTasks = tasks.filter(
      (task) => task.status === "Pending",
    ).length;

    const inProgressTasks = tasks.filter(
      (task) => task.status === "In Progress",
    ).length;

    const completedTasks = tasks.filter(
      (task) => task.status === "Completed",
    ).length;

    res.json({
      tasks,
      statusSummary: {
        all: allTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc   Get task by ID
//@route  GET /api/tasks/:id
//@access Private

const getTaskById = async (req, res) => {
  try {
    const taskId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findOne({ _id: taskId, isDeleted: false })
      .populate("assignedTo createdBy", "name email profileImageURL")
      .lean();

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc   Create a new task(Admin only)
//@route  POST /api/tasks
//@access Private

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      status,
      dueDate,
      assignedTo,
      attachments,
      todoChecklist,
    } = req.body;

    if (!Array.isArray(assignedTo)) {
      return res
        .status(400)
        .json({ message: "Assigned to must be an array of user IDs." });
    }

    const newTask = await Task.create({
      title,
      description,
      priority,
      status,
      dueDate,
      assignedTo,
      createdBy: req.user.id,
      attachments,
      todoChecklist,
    });

    res
      .status(201)
      .json({ message: "Task created successfully", task: newTask });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc   Update task details
//@route  PUT /api/tasks/:id
//@access Private

const updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findOne({ _id: taskId, isDeleted: false });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Permission check
    if (req.user.role !== "admin" && !task.assignedTo.includes(req.user.id)) {
      return res.status(403).json({
        message: "Forbidden: You don't have permission to update this task.",
      });
    }

    // Field restrictions
    if (req.user.role !== "admin") {
      task.title = req.body.title || task.title;
      task.description = req.body.description || task.description;
      task.priority = req.body.priority || task.priority;
      task.dueDate = req.body.dueDate || task.dueDate;
      task.attachments = req.body.attachments || task.attachments;
      task.todoChecklist = req.body.todoChecklist || task.todoChecklist;

      if (req.body.assignedTo) {
        if (!Array.isArray(req.body.assignedTo)) {
          return res
            .status(400)
            .json({ message: "Assigned to must be an array of user IDs." });
        }
        task.assignedTo = req.body.assignedTo;
      }
    } else {
      task.status = req.body.status || task.status;
      task.todoChecklist = req.body.todoChecklist || task.todoChecklist;
    }

    const updatedTask = await task.save();
    await updatedTask.populate("assignedTo", "name email profileImageURL");

    res.json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc   Delete a task (Admin only)
//@route  DELETE /api/tasks/:id
//@access Private

const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findOne({ _id: taskId, isDeleted: false });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Permission check for admin or assigned user
    const isAssigned = task.assignedTo.some(
      (userId) => userId.toString() === req.user.id,
    );

    if (req.user.role !== "admin" && !isAssigned) {
      return res.status(403).json({
        message: "Forbidden: You don't have permission to delete this task.",
      });
    }

    task.isDeleted = true;
    task.deletedAt = new Date();
    task.deletedBy = req.user.id;

    await task.save();
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc   Update task status
//@route  PUT /api/tasks/:id/status
//@access Private

const updateTaskStatus = async (req, res) => {
  try {
    const taskId = req.params.id;
    const newStatus = req.body.status;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findOne({
      _id: taskId,
      isDeleted: false,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check assignment
    const isAssigned = task.assignedTo.some(
      (userId) => userId.toString() === req.user.id,
    );

    // Authorization
    if (req.user.role !== "admin" && !isAssigned) {
      return res.status(403).json({
        message:
          "Forbidden: You don't have permission to update this task status.",
      });
    }

    // Role-based logic
    if (req.user.role !== "admin") {
      // Only allow Pending -> In Progress
      if (task.status !== "Pending" || newStatus !== "In Progress") {
        return res.status(403).json({
          message:
            "You can only change status from 'Pending' to 'In Progress'.",
        });
      }
    }

    task.status = newStatus;

    if (newStatus === "Completed") {
      task.todoChecklist.forEach((item) => (item.completed = true));
      task.progress = 100;
    }

    await task.save();

    res.status(200).json({
      message: "Task status updated successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc   Update task checklist
//@route  PUT /api/tasks/:id/todo
//@access Private

const updateTaskChecklist = async (req, res) => {
  try {
    const taskId = req.params.id;
    const todoChecklist = req.body.todoChecklist;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findOne({
      _id: taskId,
      isDeleted: false,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check assignment
    const isAssigned = task.assignedTo.some(
      (userId) => userId.toString() === req.user.id,
    );

    // Authorization
    if (req.user.role !== "admin" && !isAssigned) {
      return res.status(403).json({
        message:
          "Forbidden: You don't have permission to update this task checklist.",
      });
    }

    task.todoChecklist = todoChecklist;

    // Update progress
    const completedCount = task.todoChecklist.filter(
      (item) => item.completed,
    ).length;
    const totalCount = task.todoChecklist.length;
    task.progress =
      totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    // Auto-update status to Completed if all todos are done
    if (task.progress === 100) {
      task.status = "Completed";
    } else if (task.progress > 0) {
      task.status = "In Progress";
    } else {
      task.status = "Pending";
    }

    const updatedTask = await task.save();
    await updatedTask.populate("assignedTo", "name email profileImageURL");

    res.status(200).json({
      message: "Task checklist updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc   Dashboard data (Admin only)
//@route  GET /api/tasks/dashboard-data
//@access Private

const getDashboardData = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc   Dashboard data (User specific)
//@route  GET /api/tasks/user-dashboard-data
//@access Private

const getUserDashboardData = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskChecklist,
  getDashboardData,
  getUserDashboardData,
};
