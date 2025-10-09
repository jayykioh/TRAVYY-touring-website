// controller/notifyController.js
const { sendMail } = require("../utils/emailService");

// 1. Booking thành công
const notifyBookingSuccess = async (req, res) => {
  try {
    const { email, bookingCode, tourTitle } = req.body;
    await sendMail(
      email,
      "Xác nhận đặt tour thành công",
      `
        <h3>Xin chào!</h3>
        <p>Bạn đã đặt tour <b>${tourTitle}</b> thành công.</p>
        <p>Mã vé của bạn: <b>${bookingCode}</b></p>
        <p>Cảm ơn bạn đã chọn Travyy!</p>
      `
    );
    res.json({ success: true });
  } catch (err) {
    console.error("notifyBookingSuccess error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. Payment thành công
const notifyPaymentSuccess = async (req, res) => {
  try {
    const { email, amount } = req.body;
    await sendMail(
      email,
      "Thanh toán thành công",
      `
        <h3>Thanh toán thành công</h3>
        <p>Bạn đã thanh toán số tiền <b>${amount} VND</b>.</p>
        <p>Hẹn gặp bạn trong chuyến đi!</p>
      `
    );
    res.json({ success: true });
  } catch (err) {
    console.error("notifyPaymentSuccess error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Tour mới
const notifyNewTour = async (req, res) => {
  try {
    const { email, tourTitle } = req.body;
    await sendMail(
      email,
      "Tour mới từ Travyy",
      `
        <h3>Tin vui từ Travyy!</h3>
        <p>Một tour mới <b>${tourTitle}</b> vừa được mở.</p>
        <p>Nhanh tay đặt ngay để có ưu đãi đặc biệt.</p>
      `
    );
    res.json({ success: true });
  } catch (err) {
    console.error("notifyNewTour error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 4. Đăng ký tài khoản
const notifyRegister = async (req, res) => {
  try {
    const { email, fullName } = req.body;
 await sendMail(
  email,
  "🎉 Chào mừng bạn đến với Travyy!",
  `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; background: #f9fafb; padding: 20px; border-radius: 12px; color: #333;">
      <div style="text-align: center;">
        <img src="https://res.cloudinary.com/dzyq1kp4u/image/upload/v1759849958/logo_wvrds5.png" 
             alt="Travyy Banner" 
             style="max-width: 100%; border-radius: 12px; margin-bottom: 20px;" />
      </div>

      <h2 style="color: #2563eb;">👋 Xin chào ${fullName},</h2>
      <p>✨ Cảm ơn bạn đã đăng ký tài khoản <b>Travyy</b> thành công.</p>
      <p>Bây giờ bạn có thể:</p>
      <ul>
        <li>🗺️ Khám phá hàng ngàn tour du lịch hấp dẫn</li>
        <li>💳 Đặt tour nhanh chóng, thanh toán tiện lợi</li>
        <li>🎁 Nhận ưu đãi độc quyền dành riêng cho thành viên mới</li>
      </ul>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://travyy-touring-website-u3p3.vercel.app/" 
           style="display: inline-block; padding: 14px 28px; background: #2563eb; color: #fff; 
                  font-weight: bold; text-decoration: none; border-radius: 8px; font-size: 16px;">
          🚀 Bắt đầu khám phá ngay
        </a>
      </div>

      <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
        ❤️ Travyy đồng hành cùng bạn trên mọi hành trình.
      </p>
    </div>
  `
);

    res.json({ success: true });
  } catch (err) {
    console.error("notifyRegister error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  notifyBookingSuccess,
  notifyPaymentSuccess,
  notifyNewTour,
  notifyRegister,
};
