const Mechanic = require("../models/Mechanic");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const geocoder = require("../utils/geocoder");
const JWT_SECRET = process.env.JWT_SECRET;
const generateToken = (id) => {
  return jwt.sign({ id, role: "mechanic" }, process.env.JWT_SECRET, {
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
      workingHours,
      isAvailable,
      verified,
      rating,
      totalCompletedServices,
    } = req.body;

    const existing = await Mechanic.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Mechanic already exists" });

    let finalCoordinates = coordinates;

    if (!coordinates || !coordinates.length) {
      const geoData = await geocoder.geocode(address);
      if (!geoData.length) {
        return res
          .status(400)
          .json({ message: "Invalid address. Unable to geocode." });
      }
      finalCoordinates = [geoData[0].longitude, geoData[0].latitude];
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newMechanic = new Mechanic({
      name,
      email,
      phone,
      password: hashedPassword,
      address,
      location: { type: "Point", coordinates: finalCoordinates },
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
      mechanic: { ...newMechanic.toObject(), password: undefined },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.loginMechanic = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find mechanic by email
    const mechanic = await Mechanic.findOne({ email });
    if (!mechanic) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, mechanic.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: mechanic._id }, JWT_SECRET, {
      expiresIn: "7d", // You can adjust this if necessary
    });

    res.cookie("MechanicToken",token,{
      httpOnly: true,
      maxage: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    })

    // Send response with token and mechanic details (without password)
    res.status(200).json({
      message: "Login successful",
      mechanic: { ...mechanic.toObject(), password: undefined }, // Exclude password
      token,
    });
  } catch (error) {
    console.error("Error in loginMechanic:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.logoutMechanic =(req, res) => {
  return res.cookie("MechanicToken", "", { expires: new Date(0) }).json({
    message: "Logged out successfully",
    success: true,
  });
};

exports.getNearbyAvailableMechanics = async (req, res) => {
  const { longitude, latitude, radius = 20000 } = req.query;

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

exports.updateLocation = async (req, res) => {
  try {
    const { mechanicId } = req.params;
    const { coordinates } = req.body;

    const updated = await Mechanic.findByIdAndUpdate(
      mechanicId,
      { $set: { location: { type: "Point", coordinates } } },
      { new: true }
    );

    res.status(200).json({ message: "Location updated", updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMechanicProfile = async (req, res) => {
  try {
    const { mechanicId } = req.params;
    const mechanic = await Mechanic.findById(mechanicId).select("-password");
    res.status(200).json(mechanic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllMechanics = async (req, res) => {
  try {
    const mechanics = await Mechanic.find().select("-password");
    res.status(200).json(mechanics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLoggedInMechanic = async (req, res) => {
  try {
    const mechanic = await Mechanic.findById(req.mechanicId).select(
      "-password"
    );
    if (!mechanic)
      return res.status(404).json({ message: "Mechanic not found" });
    res.status(200).json(mechanic);
  } catch (error) {
    console.error("Error fetching mechanic:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

exports.updateMechanicProfile = async (req, res) => {
  try {
    const mechanic = await Mechanic.findById(req.params.id);
    if (!mechanic) {
      return res.status(404).json({ message: "Mechanic not found" });
    }

    // Update fields
    mechanic.name = req.body.name || mechanic.name;
    mechanic.email = req.body.email || mechanic.email;
    mechanic.phone = req.body.phone || mechanic.phone;
    mechanic.address = req.body.address || mechanic.address;

    // Update profile picture if uploaded
    if (req.file) {
      mechanic.profilePic = req.file.filename; // Save only the filename
    }

    await mechanic.save();

    // Respond with updated data - don't construct full URL here
    res.status(200).json({
      ...mechanic._doc,
      profilePic: mechanic.profilePic, // Send just the filename
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating mechanic profile" });
  }
};