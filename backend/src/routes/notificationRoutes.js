const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  getNotifications,
  markAsRead,
} = require("../controllers/notificationController");

router.use(protect);

router.route("/")
  .get(getNotifications);

router.route("/:id")
  .put(markAsRead);

module.exports = router;
