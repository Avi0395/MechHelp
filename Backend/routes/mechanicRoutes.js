const express = require("express");
const router = express.Router();

const mechanicCtrl = require("../controllers/mechanicController");
const { verifyMechanicToken } = require("../Middleware/authMiddleware");

router.post("/register", mechanicCtrl.registerMechanic);
router.post("/login", mechanicCtrl.loginMechanic);
router.post("/logout", verifyMechanicToken, mechanicCtrl.logoutMechanic);

router.get("/nearby", mechanicCtrl.getNearbyAvailableMechanics);
router.get("/profiles", mechanicCtrl.getAllMechanics);
router.get("/profile", verifyMechanicToken, mechanicCtrl.getMechanicProfile);
router.put(
  "/updateprofile",
  verifyMechanicToken,

  mechanicCtrl.updateMechanicProfile
);
router.put(
  "/availability",
  verifyMechanicToken,
  mechanicCtrl.updateAvailability
);
router.put("/location", verifyMechanicToken, mechanicCtrl.updateLocation);

module.exports = router;
