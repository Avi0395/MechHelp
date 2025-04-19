const express = require("express");
const router = express.Router();
const mechanicCtrl = require("../controllers/mechanicController");
const { verifyMechanicToken } = require("../middlewares/authMiddleware");

// Public Routes
router.post("/register", mechanicCtrl.registerMechanic);
router.post("/login", mechanicCtrl.loginMechanic);
router.post("/logout", verifyMechanicToken, mechanicCtrl.logoutMechanic);

// Public: for users to find nearby available mechanics
router.get("/nearby", mechanicCtrl.getNearbyAvailableMechanics);
router.get("/profiles", mechanicCtrl.getAllMechanics);
router.get("/profile/:mechanicId", mechanicCtrl.getMechanicProfile);

// Protected: mechanic must be logged in
router.put(
  "/availability/:mechanicId",
  verifyMechanicToken,
  mechanicCtrl.updateAvailability
);
router.put(
  "/location/:mechanicId",
  verifyMechanicToken,
  mechanicCtrl.updateLocation
);

module.exports = router;
