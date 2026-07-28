const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Mechanic = require("../models/Mechanic");

const getJwtSecret = () => process.env.JWT_SECRET || "fallback_jwt_secret_key";

// Middleware for verifying user token
exports.verifyUserToken = async (req, res, next) => {
  const token = req.cookies.UserToken; // Get token from cookies

  if (!token) {
    return res.status(401).json({ message: "User token missing" });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()); // Verify token
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
    const decoded = jwt.verify(token, getJwtSecret());
    const mechanic = await Mechanic.findById(decoded.id);
    if (!mechanic) return res.status(401).json({ message: "Invalid mechanic" });

    req.mechanic = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

//for request route
exports.authenticateUser = async (req, res, next) => {
  const token = req.cookies.UserToken; // or from header

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id);

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid token - user not found" });
    }

    req.user = decoded; // attaches user data to request
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
};

exports.authenticateMechanic = async (req, res, next) => {
  try {
    const token = req.cookies.MechToken;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, getJwtSecret());
    const mechanic = await Mechanic.findById(decoded.id);

    if (!mechanic) {
      return res.status(401).json({ message: "Invalid token - Mechanic not found" });
    }

    req.mechanic = decoded; 
    next();
  } catch (err) {
    return res.status(401).json({ message: "Authentication failed", error: err.message });
  }
};
