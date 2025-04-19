const NodeGeocoder = require("node-geocoder");

const options = {
  provider: "openstreetmap", // You can switch to Google or Mapbox if needed
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
