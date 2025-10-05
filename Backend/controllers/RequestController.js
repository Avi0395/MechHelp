const Request = require("../models/Request");
const Mechanic = require("../models/Mechanic");
const User = require("../models/User");

// Create a new request
exports.createRequest = async (req, res) => {
  try {
    const Id = req.user.id;
    const { mechanicId, userLocation, mechanicLocation, message } = req.body;
   
    const newRequest = new Request({
      userId:Id,
      mechanicId,
      userLocation,
      mechanicLocation,
      message,
    });

    await newRequest.save();
    res
      .status(201)
      .json({ message: "Request sent successfully", request: newRequest });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating request", error: error.message });
  }
};

// // Get all requests for a user
exports.getRequestsByUser = async (req, res) => {
  try {
    const  userId  = req.user.id;
    const requests = await Request.find({ userId }).populate("mechanicId");
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
    const requests = await Request.find({ mechanicId }).populate("userId");
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

    // Find the request
    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    // Check mechanic identity
    if (request.mechanicId.toString() !== mechanicId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this request" });
    }

    request.status = status;
    await request.save();

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

    // Check if the logged-in user or mechanic is authorized to delete
    if (
      req.user &&
      request.userId.toString() !== req.user.id &&
      req.mechanic &&
      request.mechanicId.toString() !== req.mechanic.id
    ) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this request" });
    }

    await Request.findByIdAndDelete(id);
    res.status(200).json({ message: "Request deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting request", error: error.message });
  }
};
