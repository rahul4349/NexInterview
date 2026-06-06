/**
 * Utility to send SMS OTP. If Twilio credentials are not configured,
 * it automatically falls back to a highly visible Dev Mock Mode in the terminal.
 */
const sendSms = async (phoneNumber, otp) => {
  // Normalize phone number (e.g. format 10-digit numbers to +91)
  let formattedPhone = phoneNumber.trim().replace(/[-\s()]/g, "");
  if (formattedPhone.length === 10 && !formattedPhone.startsWith("+")) {
    formattedPhone = "+91" + formattedPhone;
  } else if (!formattedPhone.startsWith("+")) {
    formattedPhone = "+" + formattedPhone;
  }

  console.log(`DEBUG [sendSms]: Normalized phone from '${phoneNumber}' to '${formattedPhone}'`);
  console.log("DEBUG [sendSms]: Checking environment variables...");
  console.log("TWILIO_SID:", process.env.TWILIO_SID ? "Present (Length: " + process.env.TWILIO_SID.length + ")" : "Undefined/Empty");
  console.log("TWILIO_AUTH_TOKEN:", process.env.TWILIO_AUTH_TOKEN ? "Present (Length: " + process.env.TWILIO_AUTH_TOKEN.length + ")" : "Undefined/Empty");
  console.log("TWILIO_PHONE_NUMBER:", process.env.TWILIO_PHONE_NUMBER ? "Present ('" + process.env.TWILIO_PHONE_NUMBER + "')" : "Undefined/Empty");

  const isTwilioConfigured =
    process.env.TWILIO_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER;

  if (!isTwilioConfigured) {
    console.log("\n📱 ==================== MOCK SMS OTP MODE ====================");
    console.log(`TO:       ${formattedPhone}`);
    console.log(`MESSAGE:  Your InterviewPrep AI verification code is: ${otp}`);
    console.log("==============================================================\n");
    return { mock: true };
  }

  try {
    const twilio = require("twilio")(
      process.env.TWILIO_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const response = await twilio.messages.create({
      body: `Your InterviewPrep AI verification code is: ${otp}. Valid for 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    return response;
  } catch (error) {
    console.error("Twilio SMS send error:", error.message);
    console.log("\n📱 ==================== FALLBACK TO MOCK SMS OTP MODE ====================");
    console.log(`TO:       ${formattedPhone}`);
    console.log(`MESSAGE:  Your InterviewPrep AI verification code is: ${otp}`);
    console.log("==========================================================================\n");
    return { mock: true, error: error.message };
  }
};

module.exports = sendSms;
