const express = require("express");
const router = express.Router();
const mechanicCtrl = require("../controllers/mechanicController");
const { verifyMechanicToken } = require("../Middleware/authMiddleware");
const upload = require("../Middleware/uploadMiddleware");

router.post("/register", mechanicCtrl.registerMechanic);
router.post("/login", mechanicCtrl.loginMechanic);
router.post("/logout", verifyMechanicToken, mechanicCtrl.logoutMechanic);

router.get("/nearby", mechanicCtrl.getNearbyAvailableMechanics);
router.get("/profiles", mechanicCtrl.getAllMechanics);
router.get("/profile/:mechanicId", mechanicCtrl.getMechanicProfile);
// router.get("/me", verifyMechanicToken, mechanicCtrl.getLoggedInMechanic);
router.put(
  "/update/:id",
  verifyMechanicToken,
  upload.single("profilePic"),
  mechanicCtrl.updateMechanicProfile
);

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
