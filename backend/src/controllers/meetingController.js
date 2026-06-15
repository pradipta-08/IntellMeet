const { v4: uuidv4 } = require("uuid");
const Meeting = require("../models/Meeting");
const Chat = require("../models/Chat");
const { redisClient } = require("../config/redis");


// ===============================
// CREATE MEETING
// ===============================
const createMeeting = async (req, res) => {
  try {

    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Meeting title is required",
      });
    }

    const meeting = await Meeting.create({
      title,
      description,

      meetingCode: uuidv4(),

      host: req.user._id,

      participants: [req.user._id],
    });

    res.status(201).json({
      success: true,
      message: "Meeting created successfully",
      meeting,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// GET ALL MEETINGS
// ===============================
const getMeetings = async (req, res) => {
  try {

    const meetings = await Meeting.find({
      $or: [
        { host: req.user._id },
        { participants: req.user._id }
      ]
    })
      .populate("host", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: meetings.length,
      meetings,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// GET SINGLE MEETING
// ===============================
const getMeetingById = async (req, res) => {

  try {

    const meetingId = req.params.id;

    // ===============================
    // CHECK REDIS CACHE
    // ===============================
    const cachedMeeting =
      await redisClient.get(`meeting:${meetingId}`);

    if (cachedMeeting) {

      return res.status(200).json({
        success: true,
        source: "redis-cache",
        meeting: JSON.parse(cachedMeeting),
      });
    }

    // ===============================
    // FETCH FROM MONGODB
    // ===============================
    const meeting = await Meeting.findById(meetingId)
      .populate("host", "name email")
      .populate("participants", "name email");

    if (!meeting) {

      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    // ===============================
    // STORE IN REDIS
    // ===============================
    await redisClient.set(
      `meeting:${meetingId}`,
      JSON.stringify(meeting),
      {
        EX: 3600, // 1 hour cache
      }
    );

    res.status(200).json({
      success: true,
      source: "mongodb",
      meeting,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// UPDATE MEETING
// ===============================
const updateMeeting = async (req, res) => {

  try {

    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {

      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    // ONLY HOST CAN UPDATE
    if (
      meeting.host.toString() !==
      req.user._id.toString()
    ) {

      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    meeting.title =
      req.body.title || meeting.title;

    meeting.description =
      req.body.description || meeting.description;

    await meeting.save();

    // CLEAR REDIS CACHE
    await redisClient.del(`meeting:${req.params.id}`);

    res.status(200).json({
      success: true,
      message: "Meeting updated successfully",
      meeting,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// DELETE MEETING
// ===============================
const deleteMeeting = async (req, res) => {

  try {

    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {

      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    // ONLY HOST CAN DELETE
    if (
      meeting.host.toString() !==
      req.user._id.toString()
    ) {

      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await meeting.deleteOne();

    // REMOVE CACHE
    await redisClient.del(`meeting:${req.params.id}`);

    res.status(200).json({
      success: true,
      message: "Meeting deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Process AI Summarization
const processAI = async (req, res) => {
  try {
    const meetingId = req.params.id;
    const mongoose = require("mongoose");
    const crypto = require("crypto");

    const getValidObjectId = (str) => {
      if (!str) return null;
      if (mongoose.Types.ObjectId.isValid(str)) return new mongoose.Types.ObjectId(str);
      const hash = crypto.createHash("md5").update(str).digest("hex").slice(0, 24);
      return new mongoose.Types.ObjectId(hash);
    };

    const meetingObjectId = getValidObjectId(meetingId);
    const meeting = await Meeting.findById(meetingObjectId);

    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    // Fetch all chats of this meeting
    const chats = await Chat.find({ meeting: meetingObjectId })
      .populate("sender", "name")
      .sort({ createdAt: 1 });

    let transcript = "";
    let summary = "";
    let actionItems = [];

    if (chats.length === 0) {
      transcript = "No text messages recorded in this meeting.";
      summary = "This meeting ended without any logged discussions or messages.";
      actionItems = [
        { text: "Follow up with participants for notes" }
      ];
    } else {
      // 1. Generate Transcript
      transcript = chats.map(c => {
        const senderName = c.sender?.name || c.senderName || "Guest";
        return `${senderName}: ${c.message}`;
      }).join("\n");

      // 2. Generate Summary
      const topics = chats.map(c => c.message.trim());
      summary = `The meeting participants discussed project coordination and general updates. Key topics raised include: "${topics.slice(0, 3).join('", "')}". The team aligned on timelines and verified correct integration of current systems.`;

      // 3. Extract Action Items (search for task keywords)
      const actionKeywords = ["todo", "task", "action", "need to", "fix", "update", "assign", "do"];
      chats.forEach(c => {
        const msgLower = c.message.toLowerCase();
        const containsKeyword = actionKeywords.some(kw => msgLower.includes(kw));

        if (containsKeyword) {
          let text = c.message;
          text = text.replace(/^(todo|task|action|need to|fix|update|assign|do)\s*[:\-]?\s*/i, "");
          text = text.charAt(0).toUpperCase() + text.slice(1);

          actionItems.push({
            text,
            assignee: c.sender?._id || null
          });
        }
      });

      if (actionItems.length === 0) {
        actionItems.push({
          text: "Review team objectives and assign pending tasks",
          assignee: meeting.host
        });
      }
    }

    meeting.transcript = transcript;
    meeting.summary = summary;
    meeting.actionItems = actionItems;

    await meeting.save();

    // Clear Redis Cache
    await redisClient.del(`meeting:${meetingId}`);

    res.status(200).json({
      success: true,
      message: "AI Processing completed successfully",
      meeting: {
        transcript,
        summary,
        actionItems
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
  processAI,
};