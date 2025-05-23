const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// Register User
exports.registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      address,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber,
      address,
    });

    await newUser.save();
    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ error: error.message });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({ message: "Login successful", user, token });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ error: error.message });
  }
};

// Logout
exports.Logout = (req, res) => {
  return res.cookie("token", "", { expires: new Date(0) }).json({
    message: "Logged out successfully",
    success: true,
  });
};

// Get User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update User Profile
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { firstName, lastName, phoneNumber, address } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.address = address || user.address;

    await user.save();
    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User deleted successfully", status: "success" });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(500).json({ error: error.message });
  }
};
