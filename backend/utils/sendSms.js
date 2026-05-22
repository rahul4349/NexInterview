/**
 * Utility to send SMS OTP. If Twilio credentials are not configured,
 * it automatically falls back to a highly visible Dev Mock Mode in the terminal.
 */
const sendSms = async (phoneNumber, otp) => {
  const isTwilioConfigured =
    process.env.TWILIO_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER;

  if (!isTwilioConfigured) {
    console.log("\n📱 ==================== MOCK SMS OTP MODE ====================");
    console.log(`TO:       ${phoneNumber}`);
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
      to: phoneNumber,
    });

    return response;
  } catch (error) {
    console.error("Twilio SMS send error:", error.message);
    throw error;
  }
};

module.exports = sendSms;
