// utils/emailService.js
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: false,       // port 587 dùng STARTTLS
  requireTLS: true,    // bắt buộc TLS, không fallback plaintext
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
// kiểm tra kết nối SMTP khi start
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP error:", error);
  } else {
    console.log("✅ SMTP server ready to send emails");
  }
});


const sendMail = async (to, subject, html) => {
  // Always send from the authenticated SMTP account to avoid Gmail rejection.
  // MAIL_FROM can add a display name, e.g. "Travyy Touring <travy922@gmail.com>"
  const from = process.env.MAIL_FROM || `"Travyy Touring" <${process.env.SMTP_USER}>`;
  const info = await transporter.sendMail({ from, to, subject, html });
  console.log("📧 Mail sent:", info.messageId, "to:", to);
  return info;
};

module.exports = { sendMail };
