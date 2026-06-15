const emitParticipants = (
   io,
   meetingId,
   participants
) => {

   io.to(meetingId).emit(
      "PARTICIPANTS_UPDATED",
      participants
   );
};

module.exports = {
   emitParticipants,
};