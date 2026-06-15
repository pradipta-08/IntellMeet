const Chat = require("../models/Chat");
const mongoose = require("mongoose");
const crypto = require("crypto");

const getValidObjectId = (str) => {
  if (!str) return null;
  if (mongoose.Types.ObjectId.isValid(str)) {
    return new mongoose.Types.ObjectId(str);
  }
  const hash = crypto.createHash("md5").update(str).digest("hex").slice(0, 24);
  return new mongoose.Types.ObjectId(hash);
};

const getMeetingChats = async (req, res) => {
    try {
        const meetingObjectId = getValidObjectId(req.params.meetingId);
        const chats = await Chat.find({
            meeting: meetingObjectId,
        })
            .populate("sender", "name email avatar")
            .sort({ createdAt: 1 });
        res.status(200).json({
            success: true,
            chats,
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
       }
    };

    module.exports = {
        getMeetingChats,
    };