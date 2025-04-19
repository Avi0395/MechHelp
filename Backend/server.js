const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes.js");
const mechanicRoutes = require("./routes/mechanicRoutes.js");
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

app.use("/api/users", userRoutes);
app.use("/api/mechanics", mechanicRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
