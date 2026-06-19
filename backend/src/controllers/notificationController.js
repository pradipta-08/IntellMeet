const Notification = require("../models/Notification");

// Get User Notifications
const getNotifications = async (req, res) => {
  try {

    console.log("JWT USER ID:", req.user._id);

    const notifications = await Notification.find({
      user: req.user._id,
      read: false,
    }).sort({ createdAt: -1 });

    console.log("FOUND:", notifications.length);

    res.status(200).json({
      success: true,
      notifications,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Mark Notification as Read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
};
