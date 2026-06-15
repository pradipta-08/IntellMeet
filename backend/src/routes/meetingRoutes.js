const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
  processAI,
} = require("../controllers/meetingController");


// CREATE
router.post("/", protect, createMeeting);


// GET ALL
router.get("/", protect, getMeetings);


// PROCESS AI
router.post("/:id/process-ai", protect, processAI);


// GET SINGLE
router.get("/:id", protect, getMeetingById);


// UPDATE
router.put("/:id", protect, updateMeeting);


// DELETE
router.delete("/:id", protect, deleteMeeting);

module.exports = router;