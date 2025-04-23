const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/UserRoutes");
const requestRoutes=require("./routes/RequestRoutes");
const cors = require("cors");


dotenv.config({
    path: ".env"
});
// Connect to database
connectDB();

const app = express();

app.use(express.json()); // Middleware to parse JSON requests

const corsOptions = {
    origin: "http://localhost:5173", // Frontend URL
    credentials: true // Allow credentials (cookies, authorization headers, etc.)
};
app.use(cors(corsOptions));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
