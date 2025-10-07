// utils/emailService.js
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // dùng TLS
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
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || `"Travyy Touring" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
  console.log("📧 Mail sent:", info.messageId, "to:", to);
  return info;
};

module.exports = { sendMail };
