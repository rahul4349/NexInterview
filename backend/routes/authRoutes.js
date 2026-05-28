const express = require("express");
const { registerUser, loginUser, getUserProfile, sendOtp, resetPassword, requestProfileUpdateOtp, updateUserProfile } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Multer storage config — must be defined BEFORE routes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only jpg, jpeg and png images are allowed"), false);
  }
};

// upload must be defined BEFORE routes
const upload = multer({ storage, fileFilter });

// Routes — defined AFTER upload
router.post("/send-otp", sendOtp);
router.post("/reset-password", resetPassword);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.post("/profile/update-otp", protect, requestProfileUpdateOtp);
router.put("/profile/update", protect, updateUserProfile);
router.post("/upload-image", protect, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

  res.status(200).json({
    message: "Image uploaded successfully",
    imageUrl: imageUrl,
  });
});

module.exports = router;