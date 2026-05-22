const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
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

// Add an index to query quickly by phone number and OTP
otpSchema.index({ phoneNumber: 1, otp: 1 });

module.exports = mongoose.model("Otp", otpSchema);
