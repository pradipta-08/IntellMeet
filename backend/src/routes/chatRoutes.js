const express = require("express");

const router = express.Router();

const {
    getMeetingChats,
} = require("../controllers/chatController");

const protect = require(
    "../middleware/authMiddleware"
);

router.get(
    "/:meetingId",
    getMeetingChats
);

module.exports = router;