const Task = require("../models/Task");
const Notification = require("../models/Notification");
const User = require("../models/User");
const mongoose = require("mongoose");

// Helper to sanitise ObjectId strings
const getValidObjectId = (val) => {
  if (!val || val === "" || val === "null" || val === "undefined") return null;
  return mongoose.Types.ObjectId.isValid(val) ? new mongoose.Types.ObjectId(val) : null;
};

// Create Task
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, assignee, meetingId } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const task = await Task.create({
      title,
      description,
      status: status || "todo",
      priority: priority || "medium",
      assignee: getValidObjectId(assignee),
      meeting: getValidObjectId(meetingId),
    });

    const populatedTask = await Task.findById(task._id).populate("assignee", "name email");

    // If assignee exists, create a notification
    const assigneeObjId = getValidObjectId(assignee);
    if (assigneeObjId) {
      await Notification.create({
        user: assigneeObjId,
        message: `You have been assigned a new task: "${title}"`,
      });
    }

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: populatedTask,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignee", "name email")
      .populate("meeting", "title meetingCode")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assignee } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    // Check if assignee changed
    const previousAssignee = task.assignee ? task.assignee.toString() : null;
    const cleanedAssignee = assignee !== undefined ? getValidObjectId(assignee) : task.assignee;
    const newAssignee = cleanedAssignee ? cleanedAssignee.toString() : null;

    task.title = title !== undefined ? title : task.title;
    task.description = description !== undefined ? description : task.description;
    task.status = status !== undefined ? status : task.status;
    task.priority = priority !== undefined ? priority : task.priority;
    task.assignee = cleanedAssignee;

    await task.save();

    const populatedTask = await Task.findById(task._id).populate("assignee", "name email");

    // Trigger notification if newly assigned
    if (newAssignee && newAssignee !== previousAssignee) {
      await Notification.create({
        user: newAssignee,
        message: `You have been assigned a task: "${task.title}"`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: populatedTask,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
};
