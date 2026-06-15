const mongoose = require("mongoose");

const participantSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  name: {
    type: String,
    required: true,
  },
  joinTime: {
    type: Date,
    default: Date.now,
  },
  leaveTime: {
    type: Date,
  },
  duration: {
    type: Number, // in seconds
  },
});

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    meetingCode: {
      type: String,
      required: true,
      unique: true,
    },

    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    participantDetails: [participantSessionSchema],

    startTime: {
      type: Date,
      default: Date.now,
    },

    endTime: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["scheduled", "live", "ended"],
      default: "scheduled",
    },

    transcript: {
      type: String,
      default: "",
    },

    summary: {
      type: String,
      default: "",
    },

    actionItems: [
      {
        text: { type: String, required: true },
        assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
      }
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Meeting", meetingSchema);