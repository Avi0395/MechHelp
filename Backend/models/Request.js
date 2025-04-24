const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mechanicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mechanic",
      required: true,
    },
    userLocation: { 
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    mechanicLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
    },
    message: {
      type: String,
      enum: ["Puncture", "Fuel Problem", "Engine Issue", "Brake Failure","Battery Issue", "Other"],
      required: true,
    },    
    distanceInKm: {
      type: Number, // Optional: you can calculate using Haversine formula or Google Maps API
    },
  },
  {
    timestamps: true,
  }
);

// Index for geospatial queries if needed later
RequestSchema.index({ userLocation: "2dsphere" });
RequestSchema.index({ mechanicLocation: "2dsphere" });

module.exports = mongoose.model("Request", RequestSchema);