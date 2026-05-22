const nodemailer = require("nodemailer");

/**
 * Utility to send email. If SMTP configuration is missing,
 * it falls back to a development Mock Mode that prints to the console.
 */
const sendEmail = async (options) => {
  const isSmtpConfigured =
    process.env.SMTP_EMAIL &&
    process.env.SMTP_PASSWORD;

  if (!isSmtpConfigured) {
    console.log("\n📧 ==================== MOCK EMAIL MODE ====================");
    console.log(`TO:      ${options.to}`);
    console.log(`SUBJECT: ${options.subject}`);
    console.log("----------------------------------------------------------");
    console.log(options.text);
    console.log("==========================================================\n");
    return { mock: true };
  }

  const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE || "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"InterviewPrep AI" <${process.env.SMTP_EMAIL}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
