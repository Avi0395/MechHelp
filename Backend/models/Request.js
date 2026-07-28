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
      address: {
        type: String,
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
      address: {
        type: String, 
      }
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
    },
    message: {
      type: String,
      enum: [
        "Puncture",
        "Fuel Problem",
        "Engine Issue",
        "Brake Failure",
        "Battery Issue",
        "Other",
      ],
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

// Index for geospatial queries & status filtering
RequestSchema.index({ userLocation: "2dsphere" });
RequestSchema.index({ mechanicLocation: "2dsphere" });
RequestSchema.index({ userId: 1, status: 1 });
RequestSchema.index({ mechanicId: 1, status: 1 });

module.exports = mongoose.model("Request", RequestSchema);