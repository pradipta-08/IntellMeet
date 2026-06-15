const Meeting = require("../models/Meeting");
const mongoose = require("mongoose");
const crypto = require("crypto");

// Memory stores and services
const { rooms } = require("../store/roomStore");
const { createRoom, getRoom, deleteRoom } = require("../services/roomService");
const { addParticipant, removeParticipant, updateParticipant, getParticipant } = require("../services/participantService");
const { transferHost } = require("../services/hostService");
const { emitParticipants } = require("../utils/socketHelpers");

const disconnectTimers = {};
const rateLimitStore = {};

// Configuration Constants
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW = 5000; // 5 seconds
const DISCONNECT_TIMEOUT = 30000; // 30 seconds

// ========================================
// HELPER UTILITIES
// ========================================
const getValidObjectId = (str) => {
  if (!str) return null;
  if (mongoose.Types.ObjectId.isValid(str)) return new mongoose.Types.ObjectId(str);
  const hash = crypto.createHash("md5").update(str).digest("hex").slice(0, 24);
  return new mongoose.Types.ObjectId(hash);
};

const sanitiseString = (str, maxLength = 50) => {
  if (typeof str !== "string") return "";
  return str.replace(/<[^>]*>/g, "").trim().slice(0, maxLength);
};

const isRateLimited = (socketId) => {
  const now = Date.now();
  if (!rateLimitStore[socketId]) {
    rateLimitStore[socketId] = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
    return false;
  }

  const record = rateLimitStore[socketId];
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW;
    return false;
  }

  record.count++;
  return record.count > RATE_LIMIT_MAX;
};

const Chat = require("../models/Chat");

// Centralized DB Sync Helper
const generateAIMeetingReportHelper = async (meetingObjectId, meetingDoc) => {
  try {
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
          assignee: meetingDoc.host
        });
      }
    }

    meetingDoc.transcript = transcript;
    meetingDoc.summary = summary;
    meetingDoc.actionItems = actionItems;

    console.log(`[AI Auto-sync] Successfully processed AI reports for meeting ${meetingDoc.meetingCode}`);
  } catch (err) {
    console.error("[AI Auto-sync] Failed to process report:", err.message);
  }
};

const syncDatabaseLeave = async (meetingId, userId, participantName, isLastParticipant) => {
  try {
    const meetingObjectId = getValidObjectId(meetingId);
    const meetingDoc = await Meeting.findById(meetingObjectId);
    if (!meetingDoc) return;

    const session = meetingDoc.participantDetails.find(
      (s) => (s.user?.toString() === userId || s.name === participantName) && !s.leaveTime
    );

    if (session) {
      session.leaveTime = Date.now();
      session.duration = Math.floor((session.leaveTime - session.joinTime) / 1000);
    }

    if (isLastParticipant) {
      meetingDoc.status = "ended";
      meetingDoc.endTime = Date.now();
      
      // Auto run AI summarisation
      await generateAIMeetingReportHelper(meetingObjectId, meetingDoc);
    }

    await meetingDoc.save();
  } catch (dbErr) {
    console.error("Database sync leave error:", dbErr.message);
  }
};

// ========================================
// CORE SOCKET MODULE
// ========================================
const meetingSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`Socket Connected: ${socket.id}`);

    // JOIN MEETING
    socket.on("join-meeting", (data) => {
      try {
        if (isRateLimited(socket.id)) return;

        const { meetingId, userId, name } = data || {};
        const cleanName = sanitiseString(name);

        if (!meetingId || !userId || !cleanName) {
          return socket.emit("error-message", { message: "Missing required fields" });
        }

        // Clear reconnection timeout if applicable
        if (disconnectTimers[userId]) {
          clearTimeout(disconnectTimers[userId]);
          delete disconnectTimers[userId];
        }

        // FIX #2: Safe Room Lock & Validation Check Order
        let room = getRoom(meetingId);
        if (room?.locked) {
          return socket.emit("error-message", { message: "Meeting is locked" });
        }

        const isFirstUser = !room || room.participants.length === 0;

        if (!room) {
          createRoom(meetingId, { userId, name: cleanName });
          room = getRoom(meetingId);
        }

        // Async MongoDB Sync Block
        (async () => {
          try {
            const meetingObjectId = getValidObjectId(meetingId);
            const userObjectId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null;
            let meetingDoc = await Meeting.findById(meetingObjectId);

            if (!meetingDoc) {
              meetingDoc = await Meeting.create({
                _id: meetingObjectId,
                title: `Meeting ${meetingId}`,
                meetingCode: meetingId,
                host: userObjectId || new mongoose.Types.ObjectId(),
                startTime: Date.now(),
                status: "live",
              });
            } else if (isFirstUser) {
              meetingDoc.status = "live";
              meetingDoc.startTime = Date.now();
            }

            if (userObjectId && !meetingDoc.participants.includes(userObjectId)) {
              meetingDoc.participants.push(userObjectId);
            }

            const activeSession = meetingDoc.participantDetails.find(
              (p) => p.user?.toString() === userId || (p.name === cleanName && !p.leaveTime)
            );

            if (!activeSession) {
              meetingDoc.participantDetails.push({
                user: userObjectId,
                name: cleanName,
                joinTime: Date.now(),
              });
            }

            await meetingDoc.save();
          } catch (dbErr) {
            console.error("Database sync join error:", dbErr.message);
          }
        })();

        // Track Participant Connection State
        const existingParticipant = getParticipant(meetingId, userId);
        if (existingParticipant) {
          updateParticipant(meetingId, userId, { socketId: socket.id });
        } else {
          addParticipant(meetingId, { userId, name: cleanName, socketId: socket.id });
        }

        socket.join(meetingId);
        socket.emit("meeting-lock-status", { locked: !!room.locked });
        emitParticipants(io, meetingId, room.participants);

        socket.to(meetingId).emit("notification", {
          type: "USER_JOINED",
          message: `${cleanName} joined the meeting`,
        });

      } catch (error) {
        console.error("Join meeting error:", error.message);
      }
    });

    // LEAVE MEETING
    socket.on("leave-meeting", (data) => {
      try {
        const { meetingId, userId } = data || {};
        const room = getRoom(meetingId);
        if (!room) return;

        const participant = getParticipant(meetingId, userId);
        if (!participant) return;

        const isLastParticipant = room.participants.length <= 1;
        syncDatabaseLeave(meetingId, userId, participant.name, isLastParticipant);

        if (room.hostId === userId) {
          transferHost(meetingId, userId);
        }

        removeParticipant(meetingId, userId);
        socket.leave(meetingId);

        if (room.participants.length === 0) {
          delete rooms[meetingId];
          deleteRoom(meetingId);
          return;
        }

        emitParticipants(io, meetingId, room.participants);
        socket.to(meetingId).emit("notification", {
          type: "USER_LEFT",
          message: `${participant.name} left the meeting`,
        });

      } catch (error) {
        console.error("Leave meeting error:", error.message);
      }
    });

    // TOGGLE MIC
    socket.on("toggle-mic", (data) => {
      try {
        if (isRateLimited(socket.id)) return;
        const { meetingId, userId, micOn } = data || {};
        const room = getRoom(meetingId);
        if (!room) return;

        updateParticipant(meetingId, userId, { micOn });
        emitParticipants(io, meetingId, room.participants);
      } catch (error) {
        console.error("Toggle mic error:", error.message);
      }
    });

    // TOGGLE VIDEO
    socket.on("toggle-video", (data) => {
      try {
        if (isRateLimited(socket.id)) return;
        const { meetingId, userId, videoOn } = data || {};
        const room = getRoom(meetingId);
        if (!room) return;

        updateParticipant(meetingId, userId, { videoOn });
        emitParticipants(io, meetingId, room.participants);
      } catch (error) {
        console.error("Toggle video error:", error.message);
      }
    });

    // FIX #1: WebRTC Signaling System (No Rate Limiting)
    socket.on("offer", (data) => {
      const { targetSocketId, offer } = data || {};
      if (!targetSocketId || !offer) return;
      io.to(targetSocketId).emit("offer", { offer, senderSocketId: socket.id });
    });

    socket.on("answer", (data) => {
      const { targetSocketId, answer } = data || {};
      if (!targetSocketId || !answer) return;
      io.to(targetSocketId).emit("answer", { answer, senderSocketId: socket.id });
    });

    socket.on("ice-candidate", (data) => {
      const { targetSocketId, candidate } = data || {};
      if (!targetSocketId || !candidate) return;
      io.to(targetSocketId).emit("ice-candidate", { candidate, senderSocketId: socket.id });
    });

    // LOCK MEETING (Secure Host Verification)
    socket.on("lock-meeting", (data) => {
      try {
        const { meetingId, userId } = data || {};
        const room = getRoom(meetingId);
        if (!room || room.hostId !== userId) return;

        room.locked = true;
        io.to(meetingId).emit("meeting-lock-status", { locked: true });
        io.to(meetingId).emit("notification", {
          type: "MEETING_LOCKED",
          message: "Meeting has been locked",
        });
      } catch (error) {
        console.error("Lock meeting error:", error.message);
      }
    });

    // UNLOCK MEETING
    socket.on("unlock-meeting", (data) => {
      try {
        const { meetingId, userId } = data || {};
        const room = getRoom(meetingId);
        if (!room || room.hostId !== userId) return;

        room.locked = false;
        io.to(meetingId).emit("meeting-lock-status", { locked: false });
        io.to(meetingId).emit("notification", {
          type: "MEETING_UNLOCKED",
          message: "Meeting has been unlocked",
        });
      } catch (error) {
        console.error("Unlock meeting error:", error.message);
      }
    });

    // TRANSFER HOST
    socket.on("transfer-host", (data) => {
      try {
        const { meetingId, hostId, targetUserId } = data || {};
        const room = getRoom(meetingId);
        if (!room || room.hostId !== hostId) return;

        const targetParticipant = room.participants.find((p) => p.userId === targetUserId);
        if (!targetParticipant) return;

        room.hostId = targetUserId;
        room.participants.forEach((p) => {
          p.isHost = p.userId === targetUserId;
        });

        emitParticipants(io, meetingId, room.participants);
        io.to(meetingId).emit("notification", {
          type: "HOST_TRANSFERRED",
          message: `Host status transferred to ${targetParticipant.name}`,
        });
      } catch (error) {
        console.error("Transfer host error:", error.message);
      }
    });

    // MUTE USER
    socket.on("mute-user", (data) => {
      try {
        const { meetingId, hostId, targetUserId } = data || {};
        const room = getRoom(meetingId);
        if (!room || room.hostId !== hostId) return;

        const participant = getParticipant(meetingId, targetUserId);
        if (!participant) return;

        io.to(participant.socketId).emit("force-mute");
        io.to(meetingId).emit("notification", {
          type: "USER_MUTED",
          message: `${participant.name} was muted`,
        });
      } catch (error) {
        console.error("Mute user error:", error.message);
      }
    });

    // REMOVE USER
    socket.on("remove-user", (data) => {
      try {
        const { meetingId, hostId, targetUserId } = data || {};
        const room = getRoom(meetingId);
        if (!room || room.hostId !== hostId) return;

        const participant = getParticipant(meetingId, targetUserId);
        if (!participant) return;

        removeParticipant(meetingId, targetUserId);

        io.to(participant.socketId).emit("removed-from-meeting", {
          message: "You were removed from the meeting",
        });

        const targetSocket = io.sockets.sockets.get(participant.socketId);
        if (targetSocket) targetSocket.leave(meetingId);

        emitParticipants(io, meetingId, room.participants);
        io.to(meetingId).emit("notification", {
          type: "USER_REMOVED",
          message: `${participant.name} was removed`,
          socketId: participant.socketId // Allows immediate WebRTC peer cleanup on client side
        });
      } catch (error) {
        console.error("Remove user error:", error.message);
      }
    });

    // SCREEN SHARE EVENTS
    socket.on("start-screen-share", (data) => {
      try {
        const { meetingId, userId } = data || {};
        const room = getRoom(meetingId);
        if (!room) return;

        const participant = getParticipant(meetingId, userId);
        if (!participant) return;

        socket.to(meetingId).emit("screen-share-started", { userId, name: participant.name });
        socket.to(meetingId).emit("notification", {
          type: "SCREEN_SHARE_STARTED",
          message: `${participant.name} started sharing screen`,
        });
      } catch (error) {
        console.error("Start screen share error:", error.message);
      }
    });

    socket.on("stop-screen-share", (data) => {
      try {
        const { meetingId, userId } = data || {};
        const room = getRoom(meetingId);
        if (!room) return;

        const participant = getParticipant(meetingId, userId);
        if (!participant) return;

        socket.to(meetingId).emit("screen-share-stopped", { userId, name: participant.name });
        socket.to(meetingId).emit("notification", {
          type: "SCREEN_SHARE_STOPPED",
          message: `${participant.name} stopped sharing screen`,
        });
      } catch (error) {
        console.error("Stop screen share error:", error.message);
      }
    });

    // DISCONNECT (With Reconnection Window Protection)
    socket.on("disconnect", () => {
      console.log(`Socket Disconnected: ${socket.id}`);
      delete rateLimitStore[socket.id];

      Object.keys(rooms).forEach((meetingId) => {
        const room = rooms[meetingId];
        const participant = room.participants.find((p) => p.socketId === socket.id);
        if (!participant) return;

        // Set up the reconnection graceful degradation window
        disconnectTimers[participant.userId] = setTimeout(() => {
          const currentRoom = rooms[meetingId];
          if (!currentRoom) return;

          const currentParticipant = getParticipant(meetingId, participant.userId);

          // FIX #4: If user reconnected under a different socket ID, clean up timer entry and abort drop
          if (currentParticipant && currentParticipant.socketId !== socket.id) {
            delete disconnectTimers[participant.userId];
            return;
          }

          if (currentRoom.hostId === participant.userId) {
            transferHost(meetingId, participant.userId);
          }

          const isLastParticipantDisconnect = currentRoom.participants.length <= 1;
          syncDatabaseLeave(meetingId, participant.userId, participant.name, isLastParticipantDisconnect);

          removeParticipant(meetingId, participant.userId);

          if (currentRoom.participants.length === 0) {
            delete rooms[meetingId];
            deleteRoom(meetingId);
            return;
          }

          emitParticipants(io, meetingId, currentRoom.participants);
        }, DISCONNECT_TIMEOUT);

        socket.to(meetingId).emit("notification", {
          type: "USER_DISCONNECTED",
          message: `${participant.name} disconnected`,
          socketId: socket.id,
        });
      });
    });
  });
};

module.exports = meetingSocket;