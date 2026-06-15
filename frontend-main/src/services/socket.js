import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

export const socket = io(
  SOCKET_URL,
  {
    transports: ["websocket"],
  }
);

socket.on("connect", () => {

  console.log(
    "Socket Connected:",
    socket.id
  );
});

socket.on("disconnect", () => {

  console.log(
    "Socket Disconnected"
  );
});