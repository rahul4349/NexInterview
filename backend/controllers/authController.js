const User = require("../models/User");
const Otp = require("../models/Otp");
const sendSms = require("../utils/sendSms");
const sendEmail = require("../utils/sendEmail");
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
    const { email, phoneNumber, type, identifier } = req.body; // type can be 'signup' or 'forgot-password'

    if (type === "forgot-password") {
      const forgotId = identifier || phoneNumber || email;
      if (!forgotId) {
        return res.status(400).json({ message: "Email or Mobile number is required." });
      }

      const isEmail = forgotId.includes("@");
      let userExists;

      if (isEmail) {
        userExists = await User.findOne({ email: forgotId.toLowerCase().trim() });
      } else {
        userExists = await User.findOne({ phoneNumber: forgotId.trim() });
      }

      if (!userExists) {
        return res.status(404).json({ message: "No registered user found with this Email or Mobile number." });
      }

      // Generate secure 6-digit verification code
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

      if (isEmail) {
        // Clear previous OTP entries for this email
        await Otp.deleteMany({ email: userExists.email });
        // Store the new OTP
        await Otp.create({ email: userExists.email, otp: generatedOtp });
        // Send Email
        const info = await sendEmail({
          to: userExists.email,
          subject: "NexInterview - Password Reset OTP",
          text: `Hello ${userExists.name},\n\nYou requested a password reset. Your 6-digit verification code is: ${generatedOtp}.\n\nThis code expires in 5 minutes.\n\nBest regards,\nNexInterview Team`,
          html: `<div style="font-family: 'Outfit', sans-serif; padding: 20px; background-color: #fafafa; border-radius: 12px; max-width: 600px; border: 1px solid #e2e8f0;">
                  <h2 style="color: #0f172a; margin-bottom: 10px;">NexInterview AI Platform</h2>
                  <p style="color: #475569; font-size: 14px; line-height: 1.5;">Hello <strong>${userExists.name}</strong>,</p>
                  <p style="color: #475569; font-size: 14px; line-height: 1.5;">You requested a password reset. Your 6-digit verification code is:</p>
                  <div style="background-color: #f1f5f9; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: 800; color: #4f46e5; letter-spacing: 0.25em;">${generatedOtp}</span>
                  </div>
                  <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">This code will automatically expire in 5 minutes for security reasons.</p>
                  <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                  <p style="color: #64748b; font-size: 12px;">Best regards,<br /><strong>NexInterview Team</strong></p>
                </div>`
        });

        return res.status(200).json({
          message: "Verification code sent to your email successfully.",
          email: userExists.email,
          mock: !!info.mock,
        });
      } else {
        // Clear previous OTP entries for this phone number
        await Otp.deleteMany({ phoneNumber: userExists.phoneNumber });
        // Store the new OTP
        await Otp.create({ phoneNumber: userExists.phoneNumber, otp: generatedOtp });
        // Send SMS
        const info = await sendSms(userExists.phoneNumber, generatedOtp);

        return res.status(200).json({
          message: "Verification code sent to your mobile phone successfully.",
          phoneNumber: userExists.phoneNumber,
          mock: !!info.mock,
        });
      }
    }

    // Default Signup Flow (Mandatory Mobile Verification)
    let targetPhone = phoneNumber;
    if (!targetPhone) {
      return res.status(400).json({ message: "Mobile number is required." });
    }

    if (targetPhone.length < 10) {
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
      const phoneExists = await User.findOne({ phoneNumber: targetPhone });
      if (phoneExists) {
        return res.status(400).json({ message: "Mobile number already registered." });
      }
    }

    // Generate a secure 6-digit numeric OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Clear any previous OTP entries for this phone number
    await Otp.deleteMany({ phoneNumber: targetPhone });

    // Store the new OTP
    await Otp.create({ phoneNumber: targetPhone, otp: generatedOtp });

    // Send the SMS (calls Twilio or falls back to Dev Mock Console log)
    const info = await sendSms(targetPhone, generatedOtp);

    res.status(200).json({
      message: "Verification code sent to your mobile phone successfully.",
      phoneNumber: targetPhone,
      mock: !!info.mock,
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
    const { name, email, phoneNumber, password, profileImageUrl, academicYear, registrationNo, gender, bloodGroup, address, otp } = req.body;

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
      academicYear: academicYear || "2021-2023",
      registrationNo: registrationNo || "2124100001",
      gender: gender || "Male",
      bloodGroup: bloodGroup || "A+",
      address: address || "Near Khantapada High School, Khantapada, Balasore",
    });

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      profileImageUrl: user.profileImageUrl,
      academicYear: user.academicYear,
      registrationNo: user.registrationNo,
      gender: user.gender,
      bloodGroup: user.bloodGroup,
      address: user.address,
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
      academicYear: user.academicYear,
      registrationNo: user.registrationNo,
      gender: user.gender,
      bloodGroup: user.bloodGroup,
      address: user.address,
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
    const { phoneNumber, email, identifier, otp, newPassword } = req.body;

    const resetId = identifier || phoneNumber || email;

    if (!resetId || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const isEmail = resetId.includes("@");
    let otpRecord;
    let user;

    if (isEmail) {
      // 1. Verify OTP using email
      otpRecord = await Otp.findOne({ email: resetId.toLowerCase().trim(), otp });
      if (!otpRecord) {
        return res.status(400).json({ message: "Invalid or expired verification code." });
      }

      // 2. Fetch User by email
      user = await User.findOne({ email: resetId.toLowerCase().trim() });
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // 3. Clear OTP for this email
      await Otp.deleteMany({ email: resetId.toLowerCase().trim() });
    } else {
      // 1. Verify OTP using phoneNumber
      otpRecord = await Otp.findOne({ phoneNumber: resetId.trim(), otp });
      if (!otpRecord) {
        return res.status(400).json({ message: "Invalid or expired verification code." });
      }

      // 2. Fetch User by phoneNumber
      user = await User.findOne({ phoneNumber: resetId.trim() });
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // 3. Clear OTP for this phone number
      await Otp.deleteMany({ phoneNumber: resetId.trim() });
    }

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

/**
 * @desc    Request Profile Update OTP code
 * @route   POST /api/auth/profile/update-otp
 * @access  Private
 */
const requestProfileUpdateOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Generate secure 6-digit OTP code
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Clear previous OTP entries for this email
    await Otp.deleteMany({ email: user.email });

    // Store the new OTP
    await Otp.create({ email: user.email, otp: generatedOtp });

    // Dispatch the email
    const info = await sendEmail({
      to: user.email,
      subject: "NexInterview - Profile Update Verification Code",
      text: `Hello ${user.name},\n\nYou requested to update your profile settings. Your 6-digit verification code is: ${generatedOtp}.\n\nThis code expires in 5 minutes.\n\nBest regards,\nNexInterview Team`,
      html: `<div style="font-family: 'Outfit', sans-serif; padding: 20px; background-color: #fafafa; border-radius: 12px; max-width: 600px; border: 1px solid #e2e8f0;">
              <h2 style="color: #0f172a; margin-bottom: 10px;">NexInterview AI Platform</h2>
              <p style="color: #475569; font-size: 14px; line-height: 1.5;">Hello <strong>${user.name}</strong>,</p>
              <p style="color: #475569; font-size: 14px; line-height: 1.5;">You requested to update your profile settings. Your 6-digit verification code is:</p>
              <div style="background-color: #f1f5f9; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: 800; color: #4f46e5; letter-spacing: 0.25em;">${generatedOtp}</span>
              </div>
              <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">This code will automatically expire in 5 minutes for security reasons.</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="color: #64748b; font-size: 12px;">Best regards,<br /><strong>NexInterview Team</strong></p>
            </div>`
    });

    res.status(200).json({
      message: "Verification code sent successfully to your registered email address.",
      mock: !!info.mock,
    });

  } catch (error) {
    console.error("Profile update OTP error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Verify OTP and update user profile settings
 * @route   PUT /api/auth/profile/update
 * @access  Private
 */
const updateUserProfile = async (req, res) => {
  try {
    const { name, email, phoneNumber, profileImageUrl, academicYear, registrationNo, gender, bloodGroup, address, otp } = req.body;

    if (!name || !email || !phoneNumber || !otp) {
      return res.status(400).json({ message: "Name, Email, Mobile number, and verification OTP are required." });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 1. Verify OTP against current email
    const otpRecord = await Otp.findOne({ email: user.email, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired verification code." });
    }

    // 2. Validate email and phone uniqueness if changed
    if (email.toLowerCase().trim() !== user.email.toLowerCase()) {
      const emailExists = await User.findOne({ email: email.toLowerCase().trim() });
      if (emailExists) {
        return res.status(400).json({ message: "This email is already taken by another account." });
      }
    }

    if (phoneNumber.trim() !== user.phoneNumber) {
      const phoneExists = await User.findOne({ phoneNumber: phoneNumber.trim() });
      if (phoneExists) {
        return res.status(400).json({ message: "This mobile number is already taken by another account." });
      }
    }

    // 3. Delete OTP record
    await Otp.deleteMany({ email: user.email });

    // 4. Commit changes
    user.name = name.trim();
    user.email = email.toLowerCase().trim();
    user.phoneNumber = phoneNumber.trim();
    if (profileImageUrl !== undefined) {
      user.profileImageUrl = profileImageUrl;
    }
    if (academicYear !== undefined) user.academicYear = academicYear.trim();
    if (registrationNo !== undefined) user.registrationNo = registrationNo.trim();
    if (gender !== undefined) user.gender = gender.trim();
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup.trim();
    if (address !== undefined) user.address = address.trim();

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully!",
      id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      profileImageUrl: user.profileImageUrl,
      academicYear: user.academicYear,
      registrationNo: user.registrationNo,
      gender: user.gender,
      bloodGroup: user.bloodGroup,
      address: user.address,
    });

  } catch (error) {
    console.error("Update profile error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  sendOtp, 
  registerUser, 
  loginUser, 
  resetPassword, 
  getUserProfile,
  requestProfileUpdateOtp,
  updateUserProfile
};