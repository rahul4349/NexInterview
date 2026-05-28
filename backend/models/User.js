const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileImageUrl: {
      type: String,
      default: null,
    },
    academicYear: {
      type: String,
      default: "2021-2023",
    },
    registrationNo: {
      type: String,
      default: "2124100001",
    },
    gender: {
      type: String,
      default: "Male",
    },
    bloodGroup: {
      type: String,
      default: "A+",
    },
    address: {
      type: String,
      default: "Near Khantapada High School, Khantapada, Balasore",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);