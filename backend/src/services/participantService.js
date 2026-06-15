const { rooms } = require("../store/roomStore");

const addParticipant = (
   meetingId,
   participantData
) => {

   rooms[meetingId].participants.push({
      ...participantData,

      micOn: true,
      videoOn: true,

      isHost:
         rooms[meetingId].hostId ===
         participantData.userId,

      joinedAt: Date.now(),
   });
};

const removeParticipant = (
   meetingId,
   userId
) => {

   rooms[meetingId].participants =
      rooms[meetingId].participants.filter(
         (participant) =>
            participant.userId !== userId
      );
};

const getParticipant = (
   meetingId,
   userId
) => {

   return rooms[
      meetingId
   ]?.participants.find(
      (participant) =>
         participant.userId === userId
   );
};

const updateParticipant = (
   meetingId,
   userId,
   updatedData
) => {

   const participant =
      getParticipant(meetingId, userId);

   if (!participant) return;

   Object.assign(participant, updatedData);
};

module.exports = {
   addParticipant,
   removeParticipant,
   getParticipant,
   updateParticipant,
};