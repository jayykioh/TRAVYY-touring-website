// controller/notifyController.js
const { sendMail } = require("../utils/emailService");
const Notification = require("../models/Notification");
const User = require("../models/Users");

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
    const { email, amount, bookingCode, tourTitle, bookingId } = req.body;
    
    // Tìm user để lưu notification
    const user = await User.findOne({ email });
    
    const subject = "🎉 Thanh toán thành công - Travyy";
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; background: #f9fafb; padding: 20px; border-radius: 12px; color: #333;">
          <div style="text-align: center;">
            <img src="https://res.cloudinary.com/dzyq1kp4u/image/upload/v1759849958/logo_wvrds5.png" 
                 alt="Travyy Banner" 
                 style="max-width: 100%; border-radius: 12px; margin-bottom: 20px;" />
          </div>

          <h2 style="color: #16a34a;">✅ Thanh toán thành công!</h2>
          <p>Bạn đã thanh toán thành công cho đơn đặt tour:</p>
          
          <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <p><strong>🏷️ Mã đặt tour:</strong> <span style="color: #2563eb; font-weight: bold;">${bookingCode || 'N/A'}</span></p>
            <p><strong>🎯 Tour:</strong> ${tourTitle || 'Thông tin tour'}</p>
            <p><strong>💰 Số tiền:</strong> <span style="color: #16a34a; font-weight: bold; font-size: 18px;">${amount} VND</span></p>
          </div>

          <p>🎊 Cảm ơn bạn đã tin tưởng và lựa chọn Travyy!</p>
          <p>📧 Bạn sẽ nhận được thông tin chi tiết về chuyến đi qua email này.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://travyy-touring-website-u3p3.vercel.app/booking-history" 
               style="display: inline-block; padding: 14px 28px; background: #16a34a; color: #fff; 
                      font-weight: bold; text-decoration: none; border-radius: 8px; font-size: 16px;">
              📋 Xem lịch sử đặt tour
            </a>
          </div>

          <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
            ✈️ Hẹn gặp bạn trong chuyến đi tuyệt vời sắp tới!
          </p>
        </div>
      `;

    // Tạo notification trong database
    const notification = await Notification.create({
      userId: user?._id,
      recipientEmail: email,
      recipientName: user?.name,
      type: "payment_success",
      title: "Thanh toán thành công",
      message: `Bạn đã thanh toán thành công ${amount} VND cho tour "${tourTitle}" với mã đặt chỗ ${bookingCode}`,
      emailSubject: subject,
      emailHtml: htmlContent,
      data: {
        bookingId,
        bookingCode,
        amount,
        tourTitle
      },
      status: "pending"
    });

    // Gửi email
    try {
      const emailResult = await sendMail(email, subject, htmlContent);
      
      // Cập nhật notification thành công
      await notification.markAsSent(emailResult.messageId);
      
      console.log(`📧 Payment notification sent to ${email} - Notification ID: ${notification._id}`);
    } catch (emailErr) {
      // Cập nhật notification thất bại
      await notification.markAsFailed(emailErr.message);
      throw emailErr;
    }

    res.json({ 
      success: true, 
      notificationId: notification._id 
    });
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
    
    // Tìm user để lưu notification
    const user = await User.findOne({ email });
    
    const subject = "🎉 Chào mừng bạn đến với Travyy!";
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; background: #f9fafb; padding: 20px; border-radius: 12px; color: #333;">
      <div style="text-align: center;">
        <img src="https://res.cloudinary.com/dzyq1kp4u/image/upload/v1759849958/logo_wvrds5.png" 
             alt="Travyy Banner" 
             style="max-width: 50%; border-radius: 12px; margin-bottom: 20px;" />
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
    `;

    // Tạo notification trong database
    const notification = await Notification.create({
      userId: user?._id,
      recipientEmail: email,
      recipientName: fullName,
      type: "register",
      title: "Chào mừng đến với Travyy",
      message: `Chào mừng ${fullName} đã đăng ký tài khoản Travyy thành công!`,
      emailSubject: subject,
      emailHtml: htmlContent,
      data: {
        additionalData: { welcomeBonus: true }
      },
      status: "pending"
    });

    // Gửi email
    try {
      const emailResult = await sendMail(email, subject, htmlContent);
      
      // Cập nhật notification thành công
      await notification.markAsSent(emailResult.messageId);
      
      console.log(`📧 Welcome notification sent to ${email} - Notification ID: ${notification._id}`);
    } catch (emailErr) {
      // Cập nhật notification thất bại
      await notification.markAsFailed(emailErr.message);
      throw emailErr;
    }

    res.json({ 
      success: true, 
      notificationId: notification._id 
    });
  } catch (err) {
    console.error("notifyRegister error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 5. Lấy notifications của user
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id;
    const { limit = 20, type, status, unreadOnly } = req.query;

    const notifications = await Notification.findByUser(userId, {
      limit: parseInt(limit),
      type,
      status,
      unreadOnly: unreadOnly === 'true'
    });

    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      notifications,
      unreadCount,
      total: notifications.length
    });
  } catch (err) {
    console.error("getUserNotifications error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 6. Đánh dấu notifications đã đọc
const markNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id;
    const { notificationIds } = req.body; // Array of notification IDs

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "notificationIds must be a non-empty array" 
      });
    }

    const result = await Notification.markAsRead(notificationIds, userId);

    res.json({
      success: true,
      modifiedCount: result.modifiedCount,
      message: `Đã đánh dấu ${result.modifiedCount} notifications là đã đọc`
    });
  } catch (err) {
    console.error("markNotificationsAsRead error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 7. Lấy thống kê notifications (cho admin)
const getNotificationStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const stats = await Notification.getStatsByType(parseInt(days));

    res.json({
      success: true,
      stats,
      period: `${days} days`
    });
  } catch (err) {
    console.error("getNotificationStats error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 8. Email cảnh báo đổi mật khẩu
const notifyPasswordChanged = async (req, res) => {
  try {
    const { email, name, ipAddress, userAgent } = req.body;
    
    const user = await User.findOne({ email });
    
    const subject = "🔒 Mật khẩu của bạn đã được thay đổi - Travyy";
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; background: #f9fafb; padding: 20px; border-radius: 12px; color: #333;">
      <div style="text-align: center;">
        <img src="https://res.cloudinary.com/dzyq1kp4u/image/upload/v1759849958/logo_wvrds5.png" 
             alt="Travyy Banner" 
             style="max-width: 50%; border-radius: 12px; margin-bottom: 20px;" />
      </div>

      <h2 style="color: #dc2626;">🔒 Thông báo bảo mật</h2>
      <p>Xin chào <b>${name || 'bạn'}</b>,</p>
      <p>Mật khẩu tài khoản Travyy của bạn vừa được thay đổi thành công.</p>
      
      <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
        <p><strong>⏰ Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</p>
        <p><strong>🌐 IP Address:</strong> ${ipAddress || 'N/A'}</p>
        <p><strong>💻 Thiết bị:</strong> ${userAgent || 'N/A'}</p>
      </div>

      <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #dc2626;"><strong>⚠️ Không phải bạn?</strong></p>
        <p style="margin: 10px 0 0 0;">Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ ngay với chúng tôi để bảo vệ tài khoản.</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://travyy-touring-website-u3p3.vercel.app/support" 
           style="display: inline-block; padding: 14px 28px; background: #dc2626; color: #fff; 
                  font-weight: bold; text-decoration: none; border-radius: 8px; font-size: 16px;">
          🆘 Liên hệ hỗ trợ
        </a>
      </div>

      <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
        🔐 Travyy luôn bảo vệ an toàn cho tài khoản của bạn.
      </p>
    </div>
    `;

    const notification = await Notification.create({
      userId: user?._id,
      recipientEmail: email,
      recipientName: name,
      type: "security_alert",
      title: "Mật khẩu đã được thay đổi",
      message: `Mật khẩu của bạn đã được thay đổi vào lúc ${new Date().toLocaleString('vi-VN')}`,
      emailSubject: subject,
      emailHtml: htmlContent,
      data: { ipAddress, userAgent },
      status: "pending"
    });

    try {
      const emailResult = await sendMail(email, subject, htmlContent);
      await notification.markAsSent(emailResult.messageId);
      console.log(`📧 Password change notification sent to ${email}`);
    } catch (emailErr) {
      await notification.markAsFailed(emailErr.message);
      throw emailErr;
    }

    res.json({ success: true, notificationId: notification._id });
  } catch (err) {
    console.error("notifyPasswordChanged error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 9. Email gửi link reset password
const notifyPasswordReset = async (req, res) => {
  try {
    const { email, name, resetLink, resetToken } = req.body;
    
    const user = await User.findOne({ email });
    
    const subject = "🔑 Yêu cầu đặt lại mật khẩu - Travyy";
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; background: #f9fafb; padding: 20px; border-radius: 12px; color: #333;">
      <div style="text-align: center;">
        <img src="https://res.cloudinary.com/dzyq1kp4u/image/upload/v1759849958/logo_wvrds5.png" 
             alt="Travyy Banner" 
             style="max-width: 50%; border-radius: 12px; margin-bottom: 20px;" />
      </div>

      <h2 style="color: #2563eb;">🔑 Đặt lại mật khẩu</h2>
      <p>Xin chào <b>${name || 'bạn'}</b>,</p>
      <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản Travyy của bạn.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" 
           style="display: inline-block; padding: 14px 28px; background: #2563eb; color: #fff; 
                  font-weight: bold; text-decoration: none; border-radius: 8px; font-size: 16px;">
          🔓 Đặt lại mật khẩu
        </a>
      </div>

      <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <p style="margin: 0;"><strong>⏰ Link có hiệu lực trong 15 phút</strong></p>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">Nếu link hết hạn, vui lòng yêu cầu đặt lại mật khẩu mới.</p>
      </div>

      <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #dc2626;"><strong>⚠️ Không phải bạn?</strong></p>
        <p style="margin: 10px 0 0 0;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Mật khẩu của bạn sẽ không thay đổi.</p>
      </div>

      <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
        🔐 Travyy luôn bảo vệ an toàn cho tài khoản của bạn.
      </p>
    </div>
    `;

    const notification = await Notification.create({
      userId: user?._id,
      recipientEmail: email,
      recipientName: name,
      type: "password_reset",
      title: "Yêu cầu đặt lại mật khẩu",
      message: `Link đặt lại mật khẩu đã được gửi đến email ${email}`,
      emailSubject: subject,
      emailHtml: htmlContent,
      data: { resetToken },
      status: "pending"
    });

    try {
      const emailResult = await sendMail(email, subject, htmlContent);
      await notification.markAsSent(emailResult.messageId);
      console.log(`📧 Password reset email sent to ${email}`);
    } catch (emailErr) {
      await notification.markAsFailed(emailErr.message);
      throw emailErr;
    }

    res.json({ success: true, notificationId: notification._id });
  } catch (err) {
    console.error("notifyPasswordReset error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 10. Email xác nhận password đã reset thành công
const notifyPasswordResetSuccess = async (req, res) => {
  try {
    const { email, name, ipAddress, userAgent } = req.body;
    
    const user = await User.findOne({ email });
    
    const subject = "✅ Mật khẩu đã được đặt lại thành công - Travyy";
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; background: #f9fafb; padding: 20px; border-radius: 12px; color: #333;">
      <div style="text-align: center;">
        <img src="https://res.cloudinary.com/dzyq1kp4u/image/upload/v1759849958/logo_wvrds5.png" 
             alt="Travyy Banner" 
             style="max-width: 50%; border-radius: 12px; margin-bottom: 20px;" />
      </div>

      <h2 style="color: #16a34a;">✅ Đặt lại mật khẩu thành công</h2>
      <p>Xin chào <b>${name || 'bạn'}</b>,</p>
      <p>Mật khẩu tài khoản Travyy của bạn đã được đặt lại thành công.</p>
      
      <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
        <p><strong>⏰ Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</p>
        
        <p><strong>💻 Thiết bị:</strong> ${userAgent || 'N/A'}</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://travyy-touring-website-u3p3.vercel.app/login" 
           style="display: inline-block; padding: 14px 28px; background: #16a34a; color: #fff; 
                  font-weight: bold; text-decoration: none; border-radius: 8px; font-size: 16px;">
          🔐 Đăng nhập ngay
        </a>
      </div>

      <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #dc2626;"><strong>⚠️ Không phải bạn?</strong></p>
        <p style="margin: 10px 0 0 0;">Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ ngay với chúng tôi.</p>
      </div>

      <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
        🔐 Travyy luôn bảo vệ an toàn cho tài khoản của bạn.
      </p>
    </div>
    `;

    const notification = await Notification.create({
      userId: user?._id,
      recipientEmail: email,
      recipientName: name,
      type: "security_alert",
      title: "Mật khẩu đã được đặt lại",
      message: `Mật khẩu của bạn đã được đặt lại thành công vào lúc ${new Date().toLocaleString('vi-VN')}`,
      emailSubject: subject,
      emailHtml: htmlContent,
      data: { ipAddress, userAgent },
      status: "pending"
    });

    try {
      const emailResult = await sendMail(email, subject, htmlContent);
      await notification.markAsSent(emailResult.messageId);
      console.log(`📧 Password reset success notification sent to ${email}`);
    } catch (emailErr) {
      await notification.markAsFailed(emailErr.message);
      throw emailErr;
    }

    res.json({ success: true, notificationId: notification._id });
  } catch (err) {
    console.error("notifyPasswordResetSuccess error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  notifyBookingSuccess,
  notifyPaymentSuccess,
  notifyNewTour,
  notifyRegister,
  getUserNotifications,
  markNotificationsAsRead,
  getNotificationStats,
  notifyPasswordChanged,
  notifyPasswordReset,
  notifyPasswordResetSuccess,
};
