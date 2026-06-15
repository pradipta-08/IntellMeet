const { rooms } = require("../store/roomStore");

/**
 * Creates a new meeting room in memory store
 * @param {string} meetingId - Unique identifier for the meeting
 * @param {Object} hostData - Object containing host details (userId)
 */
const createRoom = (meetingId, hostData) => {
   rooms[meetingId] = {
      meetingId,
      hostId: hostData.userId,
      locked: false,
      participants: [],
   };
};

/**
 * Retrieves a room object by its meeting ID
 * @param {string} meetingId 
 * @returns {Object|undefined} The room object or undefined if it doesn't exist
 */
const getRoom = (meetingId) => {
   return rooms[meetingId];
};

/**
 * Permanently removes a room from memory
 * @param {string} meetingId 
 */
const deleteRoom = (meetingId) => {
   delete rooms[meetingId];
};

/**
 * Locks the room to prevent new entries (with defensive check)
 * @param {string} meetingId 
 */
const lockRoom = (meetingId) => {
   if (rooms[meetingId]) {
      rooms[meetingId].locked = true;
   }
};

/**
 * Unlocks the room to allow new entries (with defensive check)
 * @param {string} meetingId 
 */
const unlockRoom = (meetingId) => {
   if (rooms[meetingId]) {
      rooms[meetingId].locked = false;
   }
};

module.exports = {
   createRoom,
   getRoom,
   deleteRoom,
   lockRoom,
   unlockRoom,
};