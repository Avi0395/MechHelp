const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes.js");
const mechanicRoutes = require("./routes/mechanicRoutes.js");
const RequestRoutes = require("./routes/RequestRoutes.js");
const FeedbackRoutes = require("./routes/FeedbackRoutes.js");
const cors = require("cors");
const cookieParser = require("cookie-parser");

dotenv.config({ path: ".env" });

// Connect to MongoDB
connectDB();

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
const corsOptions = {
  origin: "https://mechhelp.vercel.app",
  credentials: true,
};

app.use(cors(corsOptions));
// Routes
app.use("/api/users", userRoutes);
app.use("/api/mechanics", mechanicRoutes);
app.use("/api/requests", RequestRoutes);
app.use("/api/feedback", FeedbackRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
