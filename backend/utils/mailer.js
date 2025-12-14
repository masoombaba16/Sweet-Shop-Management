const sgMail = require("@sendgrid/mail");

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (!SENDGRID_API_KEY) {
  console.error("❌ Missing SENDGRID_API_KEY in environment");
}

sgMail.setApiKey(SENDGRID_API_KEY);

async function sendMail({ to, subject, html }) {
  if (!to || typeof to !== "string" || !to.includes("@")) {
    console.warn("⚠️ Email skipped: invalid recipient:", to);
    return;
  }

  try {
    await sgMail.send({
      to,
      from: process.env.SENDGRID_SENDER_EMAIL,
      subject,
      html,
    });
  } catch (err) {
    console.error("❌ SendGrid email failed:", err);
    if (err.response) console.error(err.response.body);
  }
}

module.exports = sendMail;
