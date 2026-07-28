// controllers/requestController.js
const Request = require("../models/Request");
const Mechanic = require("../models/Mechanic");
const User = require("../models/User");

// Create a new request
exports.createRequest = async (req, res) => {
  try {
    const Id = req.user.id;
    const { mechanicId, userLocation, mechanicLocation, message } = req.body;
   
    const newRequest = new Request({
      userId: Id,
      mechanicId,
      userLocation,
      mechanicLocation,
      message,
    });

    await newRequest.save();

    // Broadcast socket event for real-time update
    const io = req.io || req.app.get("io");
    if (io) {
      console.log(`📡 Emitting socket events for new request: ${newRequest._id}`);
      io.emit("new_request_received", newRequest);
      io.emit("request_status_updated", { requestId: newRequest._id, status: "pending" });
    }

    res
      .status(201)
      .json({ message: "Request sent successfully", request: newRequest });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating request", error: error.message });
  }
};

// Get all requests for a user
exports.getRequestsByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await Request.find({ userId })
      .populate("mechanicId")
      .populate("userId", "name email phoneNumber")
      .sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user requests", error: error.message });
  }
};

// Get all requests for a mechanic
exports.getRequestsByMechanic = async (req, res) => {
  try {
    const mechanicId = req.mechanic.id;
    const requests = await Request.find({ mechanicId })
      .populate("userId", "name email phoneNumber")
      .populate("mechanicId")
      .sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching mechanic requests",
        error: error.message,
      });
  }
};

exports.updateRequestStatusUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId, status } = req.body;

    const validStatuses = [
      "pending",
      "accepted",
      "rejected",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this request" });
    }

    request.status = status;
    await request.save();

    // Broadcast real-time status update
    const io = req.io || req.app.get("io");
    if (io) {
      console.log(`📡 Emitting user status update for request ${requestId}: ${status}`);
      io.emit("request_status_updated", { requestId, status });
      io.to(`request_${requestId}`).emit("request_status_updated", { requestId, status });
    }

    res.status(200).json({ message: "Status updated successfully", request });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating status", error: error.message });
  }
};

exports.updateRequestStatusMechanic = async (req, res) => {
  try {
    const mechanicId = req.mechanic.id;
    const { requestId, status } = req.body;

    const validStatuses = [
      "pending",
      "accepted",
      "rejected",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.mechanicId.toString() !== mechanicId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this request" });
    }

    request.status = status;
    await request.save();

    // Broadcast real-time status update
    const io = req.io || req.app.get("io");
    if (io) {
      console.log(`📡 Emitting mechanic status update for request ${requestId}: ${status}`);
      io.emit("request_status_updated", { requestId, status });
      io.to(`request_${requestId}`).emit("request_status_updated", { requestId, status });
    }

    res.status(200).json({ message: "Status updated successfully", request });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating status", error: error.message });
  }
};

// Delete request
exports.deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (
      req.user &&
      request.userId.toString() !== req.user.id &&
      req.mechanic &&
      request.mechanicId.toString() !== req.mechanic.id
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this request" });
    }

    await Request.findByIdAndDelete(id);

    const io = req.io || req.app.get("io");
    if (io) {
      io.emit("request_status_updated", { requestId: id, status: "deleted" });
    }

    res.status(200).json({ message: "Request deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting request", error: error.message });
  }
};
