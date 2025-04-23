// controllers/requestController.js
const Request = require("../models/Request");
const Mechanic = require("../models/Mechanic");
const User = require("../models/User");

// Create a new request
exports.createRequest = async (req, res) => {
    try {
        const allowedMessages = ["puncture", "engine", "battery", "brake", "other"];
        const { userId, mechanicId, userLocation, mechanicLocation, message } = req.body;

        if (!allowedMessages.includes(message)) {
            return res.status(400).json({ message: "Invalid problem type selected." });
        }

        const newRequest = new Request({
            userId,
            mechanicId,
            userLocation,
            mechanicLocation,
            message,
        });

        await newRequest.save();
        res.status(201).json({ message: "Request sent successfully", request: newRequest });
    } catch (error) {
        res.status(500).json({ message: "Error creating request", error: error.message });
    }
};


// // Get all requests for a user
exports.getRequestsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const requests = await Request.find({ userId });//.populate("mechanicId");
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user requests", error: error.message });
    }
};



// Get all requests for a mechanic
exports.getRequestsByMechanic = async (req, res) => {
    try {
        const { mechanicId } = req.params;
        const requests = await Request.find({ mechanicId }).populate("userId");
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: "Error fetching mechanic requests", error: error.message });
    }
};

// Update request status
exports.updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ["pending", "accepted", "rejected", "completed", "cancelled"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const request = await Request.findByIdAndUpdate(id, { status }, { new: true });
        res.status(200).json({ message: "Status updated", request });
    } catch (error) {
        res.status(500).json({ message: "Error updating status", error: error.message });
    }
};

// Delete request
exports.deleteRequest = async (req, res) => {
    try {
        const { id } = req.params;
        await Request.findByIdAndDelete(id);
        res.status(200).json({ message: "Request deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting request", error: error.message });
    }
};
