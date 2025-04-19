const Mechanic = require("../models/Mechanic");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const geocoder = require("../utils/geocoder");

// Helper: Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

exports.registerMechanic = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      address,
      coordinates,
      specializations,
      serviceTypes,
      workingHours, // { start: "09:00", end: "18:00" }
      isAvailable,
      verified, // optional, default false
      rating, // optional, default 0
      totalCompletedServices, // optional, default 0
    } = req.body;

    // Check if mechanic already exists
    const existing = await Mechanic.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Mechanic already exists" });
    }

    let finalCoordinates = coordinates;

    // If coordinates not provided, try to get from address
    if (!coordinates || !coordinates.length) {
      const geoData = await geocoder.geocode(address);
      if (!geoData.length) {
        return res
          .status(400)
          .json({ message: "Invalid address. Unable to geocode." });
      }
      console.log("im here");
      
      finalCoordinates = [geoData[0].latitude, geoData[0].longitude];
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new mechanic
    const newMechanic = new Mechanic({
      name,
      email,
      phone,
      password: hashedPassword,
      address,
      location: {
        type: "Point",
        coordinates: finalCoordinates,
      },
      specializations,
      serviceTypes,
      availability: {
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        workingHours,
      },
      verified: verified || false,
      rating: rating || 0,
      totalCompletedServices: totalCompletedServices || 0,
    });

    await newMechanic.save();

    const token = generateToken(newMechanic._id);

    res.status(201).json({
      message: "Mechanic registered successfully",
      token,
      mechanic: {
        ...newMechanic.toObject(),
        password: undefined, // Don't expose password
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Login Mechanic
exports.loginMechanic = async (req, res) => {
  try {
    const { email, password } = req.body;

    const mechanic = await Mechanic.findOne({ email });
    if (!mechanic)
      return res.status(404).json({ message: "Mechanic not found" });

    const isMatch = await bcrypt.compare(password, mechanic.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(mechanic._id);

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.logoutMechanic = async (req, res) => {
  try {
    res.clearCookie("token"); // Clear cookie if you're using one
    res.status(200).json({ message: "Mechanic logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all available mechanics nearby (within radius)
exports.getNearbyAvailableMechanics = async (req, res) => {
  const { longitude, latitude, radius = 20000 } = req.query; // radius in meters

  if (!longitude || !latitude) {
    return res.status(400).json({ message: "Coordinates are required" });
  }

  try {
    const mechanics = await Mechanic.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseFloat(radius),
        },
      },
      "availability.isAvailable": true,
    });

    res.status(200).json(mechanics);
  } catch (error) {
    console.error("Error in nearby mechanics:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update mechanic availability
exports.updateAvailability = async (req, res) => {
  try {
    const { mechanicId } = req.params;
    const { isAvailable, workingHours } = req.body;

    const updated = await Mechanic.findByIdAndUpdate(
      mechanicId,
      {
        $set: {
          "availability.isAvailable": isAvailable,
          "availability.workingHours": workingHours,
        },
      },
      { new: true }
    );

    res.status(200).json({ message: "Availability updated", updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update location (if mechanic moves)
exports.updateLocation = async (req, res) => {
  try {
    const { mechanicId } = req.params;
    const { coordinates } = req.body;

    const updated = await Mechanic.findByIdAndUpdate(
      mechanicId,
      {
        $set: {
          location: {
            type: "Point",
            coordinates: coordinates,
          },
        },
      },
      { new: true }
    );

    res.status(200).json({ message: "Location updated", updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Get mechanic profile
exports.getMechanicProfile = async (req, res) => {
  try {
    const { mechanicId } = req.params;
    const mechanic = await Mechanic.findById(mechanicId);
    res.status(200).json(mechanic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Get all mechanics (available and unavailable)
exports.getAllMechanics = async (req, res) => {
  try {
    const mechanics = await Mechanic.find().select("-password"); // exclude password
    res.status(200).json(mechanics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
