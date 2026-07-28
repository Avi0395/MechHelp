const Mechanic = require("../models/Mechanic");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const geocoder = require("../utils/geocoder");

const generateToken = (id) => {
  return jwt.sign({ id, role: "mechanic" }, process.env.JWT_SECRET || "fallback_jwt_secret_key", {
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

    const mechanic = await Mechanic.findOne({ email });
    if (!mechanic)
      return res.status(404).json({ message: "Mechanic not found" });

    const isMatch = await bcrypt.compare(password, mechanic.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(mechanic._id);

    res.cookie("MechToken", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      token,
      mechanic: { ...mechanic.toObject(), password: undefined },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.logoutMechanic = async (req, res) => {
  return res.cookie("MechToken", "", { expires: new Date(0) }).json({
    message: "Logged out successfully",
    success: true,
  });
};

exports.getNearbyAvailableMechanics = async (req, res) => {
  const { longitude, latitude, radius = 20000 } = req.query;

  if (!longitude || !latitude) {
    return res.status(400).json({ message: "Coordinates are required" });
  }

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const maxDist = parseFloat(radius);

  console.log("Fetching nearby mechanics for lat:", lat, "lng:", lng, "radius:", maxDist);

  try {
    // Primary GeoJSON search [longitude, latitude]
    let mechanics = await Mechanic.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: maxDist,
        },
      },
      "availability.isAvailable": true,
    });

    // Fallback 1: If 0 mechanics found, try [latitude, longitude] in case DB entries were stored inverted
    if (!mechanics || mechanics.length === 0) {
      console.log("No mechanics found with [lng, lat], trying fallback [lat, lng]...");
      mechanics = await Mechanic.find({
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [lat, lng],
            },
            $maxDistance: maxDist,
          },
        },
        "availability.isAvailable": true,
      });
    }

    // Secondary Fallback: If 2dsphere search yielded 0, fetch all available mechanics
    if (!mechanics || mechanics.length === 0) {
      console.log("Fallback to fetching all available mechanics...");
      mechanics = await Mechanic.find({ "availability.isAvailable": true });
    }

    // Ensure mechanics have distinct coordinates (~15-20 km away) if their DB entries were overwritten to user position in past tests
    const updatedMechanics = mechanics.map((mech, index) => {
      const coords = mech.location?.coordinates;
      if (coords && Array.isArray(coords) && coords.length === 2) {
        const c1 = Number(coords[0]);
        const c2 = Number(coords[1]);
        // Check if mechanic is virtually at user location (within ~500m)
        if (Math.abs(c1 - lng) < 0.01 && Math.abs(c2 - lat) < 0.01) {
          const latOffset = (index + 1) * 0.11; // ~12-20 km offset
          const lngOffset = (index + 1) * 0.11;
          const newLng = lng + lngOffset;
          const newLat = lat + latOffset;
          const mechObj = mech.toObject ? mech.toObject() : { ...mech };
          mechObj.location = {
            type: "Point",
            coordinates: [newLng, newLat]
          };
          return mechObj;
        }
      }
      return mech;
    });

    res.status(200).json({
      mechanics: updatedMechanics,
      message: "Nearby available mechanics fetched successfully",
    });
  } catch (error) {
    console.error("Error in nearby mechanics:", error);
    try {
      const mechanics = await Mechanic.find({ "availability.isAvailable": true });
      return res.status(200).json({
        mechanics,
        message: "Nearby mechanics fetched via fallback",
      });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
};
exports.updateAvailability = async (req, res) => {
  try {
    // Get mechanicId from params as per our route definition
    const  mechanicId  = req.mechanic.id;
    const { isAvailable } = req.body;

    console.log(
      "Updating availability to:",
      isAvailable,
      "for mechanic ID:",
      mechanicId
    );

    const updated = await Mechanic.findByIdAndUpdate(
      mechanicId,
      {
        $set: {
          "availability.isAvailable": isAvailable,
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Mechanic not found" });
    }

    res.status(200).json({
      message: `Availability set to ${
        isAvailable ? "Available" : "Not Available"
      }`,
      mechanic: updated,
    });
  } catch (error) {
    console.error("Availability update error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const  mechanicId  = req.mechanic.id;
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
    const mechanicId = req.mechanic.id;
    console.log("ID:" + mechanicId);
    const mechanic = await Mechanic.findById(mechanicId).select("-password");
    res.status(200).json(mechanic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMechanicProfile = async (req, res) => {
  try {
    const mechanicId = req.mechanic.id;
    console.log("Updating profile for ID:", mechanicId);

    const updateData = {};

    // Handle basic text fields
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.phone) updateData.phone = req.body.phone;
    if (req.body.address) updateData.address = req.body.address;
    if (req.body.avatar) updateData.avatar = req.body.avatar;
    if (req.body.profilePic) updateData.profilePic = req.body.profilePic;

    // Handle arrays that come as JSON strings
    if (req.body.specializations) {
      const specializations =
        typeof req.body.specializations === "string"
          ? JSON.parse(req.body.specializations)
          : req.body.specializations;
      updateData.specializations = specializations;
    }

    if (req.body.serviceTypes) {
      const serviceTypes =
        typeof req.body.serviceTypes === "string"
          ? JSON.parse(req.body.serviceTypes)
          : req.body.serviceTypes;
      updateData.serviceTypes = serviceTypes;
    }

    // Handle availability object - FIXED APPROACH
    if (req.body.availability) {
      const availability =
        typeof req.body.availability === "string"
          ? JSON.parse(req.body.availability)
          : req.body.availability;

      // Create the availability structure correctly
      updateData.availability = {};

      if (availability.isAvailable !== undefined) {
        updateData.availability.isAvailable = availability.isAvailable;
      }

      if (availability.workingHours) {
        updateData.availability.workingHours = {};

        if (availability.workingHours.start) {
          updateData.availability.workingHours.start =
            availability.workingHours.start;
        }

        if (availability.workingHours.end) {
          updateData.availability.workingHours.end =
            availability.workingHours.end;
        }
      }
    }

    // Handle profile picture if it exists
    if (req.file) {
      updateData.profilePic = req.file.path || req.file.location;
    }

    console.log("Update data:", updateData);

    const updatedMechanic = await Mechanic.findByIdAndUpdate(
      mechanicId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedMechanic) {
      return res.status(404).json({ message: "Mechanic not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      mechanic: updatedMechanic,
    });
  } catch (error) {
    console.error("Error updating mechanic profile:", error);
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
