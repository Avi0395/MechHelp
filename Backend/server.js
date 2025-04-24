const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes.js");
const mechanicRoutes = require("./routes/mechanicRoutes.js");
const requestRoutes = require("./routes/RequestRoutes.js");
const cookieparser = require("cookie-parser");
const path = require("path");
const cors = require("cors");

dotenv.config({
  path: ".env",
});

connectDB();

const app = express();

app.use(express.json()); // Middleware to parse JSON requests


const corsOptions = {
  origin: "http://localhost:5173", // Frontend URL
  credentials: true, // Allow credentials (cookies, authorization headers)
  allowedHeaders: "Content-Type, Authorization", 
};
app.use(cors(corsOptions)); // Apply CORS middleware
app.use(cookieparser()); // Middleware to parse cookies
// Static file serving for profile images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/mechanics", mechanicRoutes);
app.use("/api/requests", requestRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
