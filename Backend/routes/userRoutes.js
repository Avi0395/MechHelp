const express = require("express");
const { registerUser, loginUser, getUserProfile, updateUserProfile, deleteUser } = require("../controllers/userController");
const { verifyUserToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile/:id", getUserProfile); // Pass user ID as a parameter
router.put("/profile/:id", verifyUserToken, updateUserProfile); // Pass user ID as a parameter
router.delete("/profile/:id", verifyUserToken,deleteUser); // Pass user ID as a parameter

module.exports = router;
