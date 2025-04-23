const express = require("express");
const { registerUser, loginUser, getUserProfile, updateUserProfile, deleteUser, logout } = require("../controllers/UserController");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logout)
router.get("/profile/:id", getUserProfile); // Pass user ID as a parameter
router.put("/profile/:id", updateUserProfile); // Pass user ID as a parameter
router.delete("/profile/:id", deleteUser); // Pass user ID as a parameter

module.exports = router;
