const socketAuth = (socket, next) => {

   const {
      userId,
      name,
   } = socket.handshake.auth;

   if (!userId) {
      return next(
         new Error("Unauthorized")
      );
   }

   socket.user = {
      userId,
      name,
   };

   next();
};

module.exports = socketAuth;