// routes/requestRoutes.js
const express = require("express");
const router = express.Router();
const {
  createRequest,
  getRequestsByUser,
  getRequestsByMechanic,
  updateRequestStatus,
  deleteRequest,
} = require("../controllers/RequestController");

// Create request
router.post("/", createRequest);

// Get requests by user
router.get("/user/:userId", getRequestsByUser);

// Get requests by mechanic
router.get("/mechanic/:mechanicId", getRequestsByMechanic);

// Update request status
router.patch("/:id/status", updateRequestStatus);

// Delete request
router.delete("/:id", deleteRequest);

module.exports = router;
