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

    gender: {
      type: String,
      default: "Male",
    },
    dateOfBirth: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "Near Khantapada High School, Khantapada, Balasore",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);