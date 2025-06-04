const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes.js");
const mechanicRoutes = require("./routes/mechanicRoutes.js");
const RequestRoutes = require("./routes/RequestRoutes.js")
const FeedbackRoutes = require("./routes/FeedbackRoutes.js");
const cookieParser = require("cookie-parser");
const cors = require("cors");

dotenv.config({
  path: ".env",
});

connectDB();

const app = express();

app.use(express.json()); // Middleware to parse JSON requests

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};
app.use(cors(corsOptions));
app.use(cookieParser());

app.use("/api/users", userRoutes);
app.use("/api/mechanics", mechanicRoutes);
app.use("/api/requests", RequestRoutes);
app.use("/api/feedback", FeedbackRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
