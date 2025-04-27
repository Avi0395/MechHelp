const express = require("express");
const { registerUser, loginUser, getUserProfile, updateUserProfile, deleteUser,Logout } = require("../controllers/userController");
const { verifyUserToken } = require("../Middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout",verifyUserToken, Logout);
router.get("/profile/:id", verifyUserToken, getUserProfile);
router.put("/profile/:id", verifyUserToken, updateUserProfile); // Pass user ID as a parameter
router.delete("/profile/:id", verifyUserToken,deleteUser); // Pass user ID as a parameter

module.exports = router;
