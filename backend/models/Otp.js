const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300, // Auto-delete document from MongoDB after 5 minutes (300 seconds)
    },
  }
);

// Add indexes to query quickly
otpSchema.index({ email: 1, otp: 1 });
otpSchema.index({ phoneNumber: 1, otp: 1 });

module.exports = mongoose.model("Otp", otpSchema);
