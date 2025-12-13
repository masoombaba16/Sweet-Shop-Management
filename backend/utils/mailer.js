// backend/utils/mailer.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Safe mail sender
 * @param {Object} param0
 */
async function sendMail({ to, subject, html }) {
  if (!to || typeof to !== "string" || !to.includes("@")) {
    console.warn("⚠️ Email skipped: invalid recipient:", to);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Sweet Shop" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("❌ Email send failed:", err.message);
  }
}

module.exports = sendMail;
