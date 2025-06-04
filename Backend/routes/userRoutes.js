const express = require("express");
const { registerUser, loginUser, getUserProfile, updateUserProfile, deleteUser,Logout } = require("../controllers/userController");
const { verifyUserToken } = require("../Middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout",verifyUserToken, Logout);
router.get("/profile", verifyUserToken, getUserProfile);
router.put("/updateprofile", verifyUserToken, updateUserProfile); 
router.delete("/delete", verifyUserToken,deleteUser); // Pass user ID as a parameter

module.exports = router;
