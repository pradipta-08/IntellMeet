import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "https://intellmeet-dq0w.onrender.com";

export const socket = io(
  SOCKET_URL,
  {
    transports: ["websocket", "polling"],
  }
);

socket.on("connect", () => {
  console.log("Socket Connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Socket Disconnected");
});