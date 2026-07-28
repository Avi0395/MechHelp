const dotenv = require("dotenv");
dotenv.config({
  path: ".env",
});

const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes.js");
const mechanicRoutes = require("./routes/mechanicRoutes.js");
const RequestRoutes = require("./routes/RequestRoutes.js")
const FeedbackRoutes = require("./routes/FeedbackRoutes.js");
const cookieParser = require("cookie-parser");
const cors = require("cors");

connectDB();

const http = require("http");
const { Server } = require("socket.io");
const Mechanic = require("./models/Mechanic");
const Request = require("./models/Request");

const app = express();
app.use(express.json());
const server = http.createServer(app);

const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(cookieParser());

app.use("/api/users", userRoutes);
app.use("/api/mechanics", mechanicRoutes);
app.use("/api/requests", RequestRoutes);
app.use("/api/feedback", FeedbackRoutes);

// Socket.io Server Setup
const io = new Server(server, {
  cors: corsOptions,
});

app.set("io", io);
app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on("connection", (socket) => {
  console.log("Client connected to socket:", socket.id);

  socket.on("join_request_room", (requestId) => {
    if (requestId) {
      const roomName = `request_${requestId}`;
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room ${roomName}`);
    }
  });

  socket.on("leave_request_room", (requestId) => {
    if (requestId) {
      const roomName = `request_${requestId}`;
      socket.leave(roomName);
      console.log(`Socket ${socket.id} left room ${roomName}`);
    }
  });

  socket.on("update_location", async (data) => {
    const { requestId, mechanicId, location } = data;
    if (!location || !Array.isArray(location) || location.length !== 2) return;

    console.log(`Received location update for request ${requestId}:`, location);

    // Broadcast live location to everyone in the request room
    if (requestId) {
      io.to(`request_${requestId}`).emit("mechanic_location_updated", {
        requestId,
        mechanicId,
        location,
      });

      // Async DB update to keep request document in sync
      try {
        await Request.findByIdAndUpdate(requestId, {
          "mechanicLocation.coordinates": location,
        });
      } catch (err) {
        console.error("Error updating request location in DB via socket:", err.message);
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

