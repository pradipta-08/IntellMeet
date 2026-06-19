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

module.exports = (io) => {

  io.on("connection", (socket) => {

    console.log(
      `Chat Socket Connected: ${socket.id}`
    );


    // JOIN MEETING
    socket.on(
      "join-meeting",
      (data) => {

        const meetingId =
          typeof data === "string"
            ? data
            : data.meetingId;

        if (!meetingId) return;

        socket.join(meetingId);

        console.log(
          `Chat Joined Meeting: ${meetingId}`
        );
      }
    );


    // SEND MESSAGE
    socket.on(
      "send-message",
      async (data) => {

        try {

          const {
            meetingId,
            senderId,
            senderName,
            message,
          } = data;

          if (!meetingId || !message) return;

          const meetingObjectId = getValidObjectId(meetingId);
          const isSenderRegistered = mongoose.Types.ObjectId.isValid(senderId);
          const senderObjectId = isSenderRegistered ? new mongoose.Types.ObjectId(senderId) : null;

          // SAVE CHAT
          const chat = await Chat.create({
            meeting: meetingObjectId,
            sender: senderObjectId,
            senderName: senderName || "Guest",
            message,
          });

          // POPULATE USER
          let populatedChat = await Chat.findById(chat._id)
            .populate(
              "sender",
              "name email avatar"
            );

          if (!populatedChat.sender) {
            populatedChat = populatedChat.toObject();
            populatedChat.sender = {
              name: chat.senderName || "Guest",
              avatar: "",
              email: ""
            };
          }

          // EMIT MESSAGE
          io.to(meetingId).emit(
            "receive-message",
            populatedChat
          );

          // NOTIFICATION
          io.to(meetingId).emit(
            "notification",
            {
              type: "NEW_MESSAGE",
              message: "New message received",
            }
          );

        } catch (error) {

          console.log("Send message socket error:", error.message);
        }
      }
    );


    socket.on("disconnect", () => {

      console.log(
        `Chat Socket Disconnected: ${socket.id}`
      );
    });
  });
};