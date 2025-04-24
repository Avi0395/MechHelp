// /middleware/uploadMiddleware.js

const multer = require("multer");
const path = require("path");

// Define storage configuration for local file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store files in the 'uploads' folder (make sure it exists)
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Use a unique suffix to prevent file overwrites and maintain the original file extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)); 
  },
});

// Allow only image files (JPEG, PNG, JPG)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and JPG are allowed."), false);
  }
};

// Configure multer with storage and fileFilter
const upload = multer({ storage, fileFilter });

module.exports = upload;
