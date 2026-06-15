const { rooms } = require("../store/roomStore");

const transferHost = (
   meetingId,
   leavingUserId
) => {

   const room =
      rooms[meetingId];

   if (!room) return;

   const newHost =
      room.participants.find(
         (participant) =>
            participant.userId !==
            leavingUserId
      );

   if (!newHost) return;

   room.hostId =
      newHost.userId;

   room.participants.forEach(
      (participant) => {

         participant.isHost =
            participant.userId ===
            newHost.userId;
      }
   );
};

module.exports = {
   transferHost,
};