const Task = require("../models/Task");
const User = require("../models/User");
const excelJS = require("exceljs");

const exportTaskReport = async (req, res) => {
  try {
    const tasks = await Task.find({ isDeleted: "false" })
      .populate("assignedTo createdBy", "name email")
      .lean();

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Tasks Report");

    worksheet.columns = [
      { header: "Title", key: "title", width: 30 },
      { header: "Description", key: "description", width: 30 },
      { header: "Priority", key: "priority", width: 10 },
      { header: "Status", key: "status", width: 10 },
      { header: "Assigned To", key: "assignedTo", width: 30 },
      { header: "Due Date", key: "dueDate", width: 15 },
      { header: "Created By", key: "createdBy", width: 30 },
    ];

    tasks.forEach((task) => {
      const assignedTo = task.assignedTo
        .map((user) => `${user.name} ${user.email}`)
        .join(", ");

      worksheet.addRow({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        assignedTo: assignedTo || "unassigned",
        dueDate: task.dueDate.toISOString().split("T")[0],
        createdBy: task.createdBy.name,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=tasks-report.xlsx",
    );

    return workbook.xlsx.write(res).then(() => {
      res.end();
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const exportUserReport = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false })
      .select("name email _id")
      .lean();

    const allTasks = await Task.find({ isDeleted: false })
      .populate("assignedTo", "name email _id")
      .lean();

    const userTaskMap = {};

    users.forEach((user) => {
      userTaskMap[user._id] = {
        name: user.name,
        email: user.email,
        taskCount: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
      };
    });

    allTasks.forEach((task) => {
      task.assignedTo.forEach((user) => {
        if (userTaskMap[user._id]) {
          userTaskMap[user._id].taskCount++;
          switch (task.status) {
            case "Pending":
              userTaskMap[user._id].pendingTasks++;
              break;
            case "In Progress":
              userTaskMap[user._id].inProgressTasks++;
              break;
            case "Completed":
              userTaskMap[user._id].completedTasks++;
              break;
          }
        }
      });
    });

    // Create Excel workbook and worksheet
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Users Report");

    worksheet.columns = [
      { header: "Name", key: "name", width: 20 },
      { header: "Email", key: "email", width: 30 },
      { header: "Total Tasks", key: "taskCount", width: 15 },
      { header: "Pending Tasks", key: "pendingTasks", width: 15 },
      { header: "In Progress Tasks", key: "inProgressTasks", width: 15 },
      { header: "Completed Tasks", key: "completedTasks", width: 15 },
    ];

    Object.values(userTaskMap).forEach((user) => {
      worksheet.addRow(user);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=users-report.xlsx",
    );

    return workbook.xlsx.write(res).then(() => {
      res.end();
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { exportTaskReport, exportUserReport };
