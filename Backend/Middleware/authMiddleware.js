const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Mechanic = require("../models/Mechanic");

// Middleware for verifying user token
exports.verifyUserToken = async (req, res, next) => {
  const token = req.cookies.UserToken; // Get token from cookies

  if (!token) {
    return res.status(401).json({ message: "User token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Invalid user" }); // Invalid user message
    }

    req.user = decoded; // Attach decoded token to req.user
    next(); // Continue to the route handler
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};


// Middleware for verifying mechanic token
exports.verifyMechanicToken = async (req, res, next) => {
  const token = req.cookies.MechToken; // Get token from cookies
  if (!token)
    return res.status(401).json({ message: "Mechanic token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const mechanic = await Mechanic.findById(decoded.id);
    if (!mechanic) return res.status(401).json({ message: "Invalid mechanic" });

    req.mechanic = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};