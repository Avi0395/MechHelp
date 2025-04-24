const mongoose = require("mongoose");

const MechanicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    profilePic: {
      type: String,
      default: "", 
    },

    location: {
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
    specializations: [
      {
        type: String,
        trim: true,
      },
    ],
    availability: {
      isAvailable: {
        type: Boolean,
        default: true,
      },
      workingHours: {
        start: String,
        end: String,
      },
    },
    serviceTypes: [
      {
        type: String,
        trim: true,
      },
    ],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalCompletedServices: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create a geospatial index for location-based queries
MechanicSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Mechanic", MechanicSchema);
