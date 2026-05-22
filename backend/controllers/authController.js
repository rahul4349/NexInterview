const User = require("../models/User");
const Otp = require("../models/Otp");
const sendSms = require("../utils/sendSms");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

/**
 * @desc    Send 6-digit OTP to user's Mobile Phone
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
const sendOtp = async (req, res) => {
  try {
    const { email, phoneNumber, type } = req.body; // type can be 'signup' or 'forgot-password'

    if (!phoneNumber) {
      return res.status(400).json({ message: "Mobile number is required." });
    }

    // Basic format check for mobile number
    if (phoneNumber.length < 10) {
      return res.status(400).json({ message: "Please provide a valid mobile number with country code." });
    }

    if (type === "signup") {
      if (!email) {
        return res.status(400).json({ message: "Email is required." });
      }

      // Check if email is already in use
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already registered." });
      }

      // Check if phone number is already in use
      const phoneExists = await User.findOne({ phoneNumber });
      if (phoneExists) {
        return res.status(400).json({ message: "Mobile number already registered." });
      }
    } else if (type === "forgot-password") {
      // Check if user actually exists with this phone number
      const userExists = await User.findOne({ phoneNumber });
      if (!userExists) {
        return res.status(404).json({ message: "No user found registered with this mobile number." });
      }
    }

    // Generate a secure 6-digit numeric OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Clear any previous OTP entries for this phone number
    await Otp.deleteMany({ phoneNumber });

    // Store the new OTP
    await Otp.create({ phoneNumber, otp: generatedOtp });

    // Send the SMS (calls Twilio or falls back to Dev Mock Console log)
    const info = await sendSms(phoneNumber, generatedOtp);

    res.status(200).json({
      message: "Verification code sent to your mobile phone successfully.",
      mock: !!info.mock, // Informs frontend if it was in Mock Dev Mode
    });

  } catch (error) {
    console.error("Send OTP error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Register a new user (with mandatory Mobile OTP verification)
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, phoneNumber, password, profileImageUrl, otp } = req.body;

    console.log("Register body:", req.body);

    if (!name || !email || !phoneNumber || !password || !otp) {
      return res.status(400).json({ message: "All fields (including OTP) are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    // Verify email uniqueness
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already registered." });
    }

    // Verify phone number uniqueness
    const phoneExists = await User.findOne({ phoneNumber });
    if (phoneExists) {
      return res.status(400).json({ message: "Mobile number already registered." });
    }

    // 1. Verify OTP from the Otp collection against phone number
    const otpRecord = await Otp.findOne({ phoneNumber, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired verification code." });
    }

    // 2. Remove OTP after successful match so it cannot be reused
    await Otp.deleteMany({ phoneNumber });

    // 3. Hash Password & Create User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      phoneNumber,
      password: hashedPassword,
      profileImageUrl: profileImageUrl || null,
    });

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      profileImageUrl: user.profileImageUrl,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Login user & acquire token (Allows Email OR Mobile Number)
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  try {
    const { email, identifier, password } = req.body;

    // Support both 'identifier' (from new dual-input) and fallback 'email'
    const loginId = identifier || email;

    console.log("Login body:", req.body);

    if (!loginId || !password) {
      return res.status(400).json({ message: "Email/Mobile and password are required." });
    }

    // Search for user by EITHER email OR phoneNumber
    const user = await User.findOne({
      $or: [
        { email: loginId.toLowerCase().trim() },
        { phoneNumber: loginId.trim() }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      profileImageUrl: user.profileImageUrl,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Reset password using Mobile OTP verification
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res) => {
  try {
    const { phoneNumber, otp, newPassword } = req.body;

    if (!phoneNumber || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    // 1. Verify OTP
    const otpRecord = await Otp.findOne({ phoneNumber, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired verification code." });
    }

    // 2. Fetch the User
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 3. Delete OTP record so it cannot be reused
    await Otp.deleteMany({ phoneNumber });

    // 4. Hash new password & save
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password reset successful! You can now log in." });

  } catch (error) {
    console.error("Reset password error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(user);

  } catch (error) {
    console.error("Profile error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendOtp, registerUser, loginUser, resetPassword, getUserProfile };