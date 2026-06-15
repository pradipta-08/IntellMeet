const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
    {
        meeting: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Meeting",
            required: true,
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },

        senderName: {
            type: String,
        },

        message: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "Chat",
    chatSchema
);