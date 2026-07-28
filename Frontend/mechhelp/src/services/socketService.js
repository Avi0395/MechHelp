import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  withCredentials: true,
});

export const joinRequestRoom = (requestId) => {
  if (socket && requestId) {
    socket.emit("join_request_room", requestId);
  }
};

export const leaveRequestRoom = (requestId) => {
  if (socket && requestId) {
    socket.emit("leave_request_room", requestId);
  }
};

export const emitLocationUpdate = (data) => {
  if (socket) {
    socket.emit("update_location", data);
  }
};

export default socket;
