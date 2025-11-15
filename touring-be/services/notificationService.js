const Notification = require('../models/Notification');
const GuideNotification = require('../models/guide/GuideNotification');
const User = require('../models/Users');
const Guide = require('../models/guide/Guide');

/**
 * Unified Notification Service
 * Handles both traveller and guide notifications
 */

class NotificationService {
  /**
   * Send notification to traveller (User)
   */
  static async notifyTraveller({
    userId,
    email,
    name,
    type,
    title,
    message,
    relatedId = null,
    relatedModel = null,
    data = {},
    priority = 'medium'
  }) {
    try {
      // Find user if not provided
      let user = null;
      if (!email && userId) {
        user = await User.findById(userId).select('email name').lean();
        email = user?.email;
        name = user?.name;
      }

      if (!email) {
        console.warn('[NotificationService] Cannot send notification: missing email');
        return null;
      }

      const notification = await Notification.create({
        userId,
        recipientEmail: email,
        recipientName: name,
        type,
        title,
        message,
        relatedId,
        relatedModel,
        data,
        status: 'pending'
      });

      console.log(`✅ [NotificationService] Traveller notification created: ${notification._id} - ${type}`);
      return notification;
    } catch (error) {
      console.error('[NotificationService] Error creating traveller notification:', error);
      return null;
    }
  }

  /**
   * Send notification to guide
   */
  static async notifyGuide({
    guideId,
    guideUserId = null, // User._id of guide
    type,
    title,
    message,
    relatedId = null,
    relatedModel = null,
    tourId = null,
    priority = 'medium'
  }) {
    try {
      // If guideUserId provided, find Guide profile
      let guideProfileId = guideId;
      if (!guideProfileId && guideUserId) {
        const guideProfile = await Guide.findOne({ userId: guideUserId }).select('_id').lean();
        guideProfileId = guideProfile?._id;
      }

      if (!guideProfileId) {
        console.warn('[NotificationService] Cannot send notification: missing guideId');
        return null;
      }

      const notification = await GuideNotification.create({
        guideId: guideProfileId,
        notificationId: `guide-${guideProfileId}-${Date.now()}`,
        type,
        title,
        message,
        tourId: tourId?.toString(),
        relatedId,
        relatedModel,
        priority,
        read: false
      });

      console.log(`✅ [NotificationService] Guide notification created: ${notification._id} - ${type}`);
      return notification;
    } catch (error) {
      console.error('[NotificationService] Error creating guide notification:', error);
      return null;
    }
  }

  /**
   * Notify both parties (traveller and guide)
   */
  static async notifyBothParties({
    travellerUserId,
    guideUserId,
    travellerMessage,
    guideMessage,
    type,
    title,
    relatedId = null,
    relatedModel = null,
    priority = 'medium'
  }) {
    try {
      const [traveller, guide] = await Promise.all([
        User.findById(travellerUserId).select('name email').lean(),
        Guide.findOne({ userId: guideUserId }).lean()
      ]);

      const notifications = await Promise.allSettled([
        this.notifyTraveller({
          userId: travellerUserId,
          email: traveller?.email,
          name: traveller?.name,
          type,
          title,
          message: travellerMessage,
          relatedId,
          relatedModel,
          priority
        }),
        this.notifyGuide({
          guideId: guide?._id,
          type,
          title,
          message: guideMessage,
          relatedId,
          relatedModel,
          priority
        })
      ]);

      console.log(`✅ [NotificationService] Both parties notified for ${type}`);
      return notifications;
    } catch (error) {
      console.error('[NotificationService] Error notifying both parties:', error);
      return null;
    }
  }

  /**
   * Tour Request Notifications
   */
  
  // When traveller creates new tour request
  static async onTourRequestCreated(tourRequest, guideProfile, user) {
    return this.notifyGuide({
      guideId: guideProfile._id,
      type: 'new_tour_request',
      title: '🎯 Yêu cầu tour mới',
      message: `${user.name} đã gửi yêu cầu tour cho ${tourRequest.tourDetails?.zoneName}. Ngân sách: ${tourRequest.initialBudget?.amount?.toLocaleString('vi-VN')} ${tourRequest.initialBudget?.currency || 'VND'}`,
      relatedId: tourRequest._id,
      relatedModel: 'TourCustomRequest',
      tourId: tourRequest._id.toString(),
      priority: 'high'
    });
  }

  // When guide accepts tour request
  static async onTourRequestAccepted(tourRequest, traveller, guide) {
    return this.notifyTraveller({
      userId: traveller._id,
      email: traveller.email,
      name: traveller.name,
      type: 'tour_guide_accepted',
      title: '✅ Yêu cầu được chấp nhận',
      message: `Hướng dẫn viên ${guide.name || 'Guide'} đã chấp nhận yêu cầu tour của bạn. Hãy tiến hành thanh toán để xác nhận.`,
      relatedId: tourRequest._id,
      relatedModel: 'TourCustomRequest',
      priority: 'high'
    });
  }

  // When guide rejects tour request
  static async onTourRequestRejected(tourRequest, traveller, guide, reason = '') {
    return this.notifyTraveller({
      userId: traveller._id,
      email: traveller.email,
      name: traveller.name,
      type: 'tour_guide_rejected',
      title: '❌ Yêu cầu bị từ chối',
      message: `Hướng dẫn viên ${guide.name || 'Guide'} đã từ chối yêu cầu tour của bạn${reason ? `: ${reason}` : ''}. Bạn có thể chọn hướng dẫn viên khác.`,
      relatedId: tourRequest._id,
      relatedModel: 'TourCustomRequest',
      priority: 'high'
    });
  }

  /**
   * Price Offer Notifications
   */
  
  // When traveller makes price offer
  static async onUserPriceOffer(tourRequest, amount, currency, guideProfile) {
    return this.notifyGuide({
      guideId: guideProfile._id,
      type: 'user_price_offer',
      title: '💰 Đề xuất giá từ khách',
      message: `Khách hàng đề xuất ${amount.toLocaleString('vi-VN')} ${currency} cho tour ${tourRequest.requestNumber || tourRequest._id}`,
      relatedId: tourRequest._id,
      relatedModel: 'TourCustomRequest',
      tourId: tourRequest._id.toString(),
      priority: 'high'
    });
  }

  // When guide makes price offer
  static async onGuidePriceOffer(tourRequest, amount, currency, traveller) {
    return this.notifyTraveller({
      userId: traveller._id,
      email: traveller.email,
      name: traveller.name,
      type: 'guide_price_offer',
      title: '💵 Đề xuất giá từ guide',
      message: `Hướng dẫn viên đề xuất ${amount.toLocaleString('vi-VN')} ${currency} cho yêu cầu tour của bạn`,
      relatedId: tourRequest._id,
      relatedModel: 'TourCustomRequest',
      priority: 'high'
    });
  }

  /**
   * Agreement Notifications
   */
  
  // When user agrees to terms
  static async onUserAgreed(tourRequest, guideProfile) {
    return this.notifyGuide({
      guideId: guideProfile._id,
      type: 'user_agreed',
      title: '✅ Khách đã đồng ý',
      message: `Khách hàng đã đồng ý với điều khoản cho tour ${tourRequest.requestNumber}`,
      relatedId: tourRequest._id,
      relatedModel: 'TourCustomRequest',
      tourId: tourRequest._id.toString(),
      priority: 'high'
    });
  }

  // When guide agrees to terms
  static async onGuideAgreed(tourRequest, traveller) {
    return this.notifyTraveller({
      userId: traveller._id,
      email: traveller.email,
      name: traveller.name,
      type: 'guide_agreed',
      title: '✅ Guide đã đồng ý',
      message: `Hướng dẫn viên đã đồng ý với điều khoản cho tour của bạn`,
      relatedId: tourRequest._id,
      relatedModel: 'TourCustomRequest',
      priority: 'high'
    });
  }

  // When both parties agree (ready for booking)
  static async onAgreementComplete(tourRequest, traveller, guideProfile) {
    return this.notifyBothParties({
      travellerUserId: traveller._id,
      guideUserId: guideProfile.userId,
      travellerMessage: `🎉 Cả hai bên đã đồng ý! Bạn có thể tiến hành thanh toán cho tour ${tourRequest.requestNumber}`,
      guideMessage: `🎉 Cả hai bên đã đồng ý! Chờ khách hàng thanh toán để xác nhận booking ${tourRequest.requestNumber}`,
      type: 'agreement_complete',
      title: '🤝 Thỏa thuận hoàn tất',
      relatedId: tourRequest._id,
      relatedModel: 'TourCustomRequest',
      priority: 'high'
    });
  }

  /**
   * Booking Notifications
   */
  
  // When booking is confirmed (after payment)
  static async onBookingConfirmed(booking, traveller, guideProfile) {
    return this.notifyBothParties({
      travellerUserId: traveller._id,
      guideUserId: guideProfile.userId,
      travellerMessage: `✅ Booking ${booking.bookingCode} đã được xác nhận. Hướng dẫn viên sẽ liên hệ bạn sớm!`,
      guideMessage: `💼 Booking mới ${booking.bookingCode} đã được xác nhận. Hãy chuẩn bị cho chuyến đi!`,
      type: 'booking_success',
      title: '🎉 Booking thành công',
      relatedId: booking._id,
      relatedModel: 'Booking',
      priority: 'high'
    });
  }

  // When deposit is paid
  static async onDepositPaid(booking, traveller, guideProfile, amount, currency) {
    return this.notifyBothParties({
      travellerUserId: traveller._id,
      guideUserId: guideProfile.userId,
      travellerMessage: `💰 Đã thanh toán đặt cọc ${amount.toLocaleString('vi-VN')} ${currency} cho booking ${booking.bookingCode}`,
      guideMessage: `💰 Nhận đặt cọc ${amount.toLocaleString('vi-VN')} ${currency} cho booking ${booking.bookingCode}`,
      type: 'deposit_paid',
      title: '💸 Thanh toán đặt cọc',
      relatedId: booking._id,
      relatedModel: 'Booking',
      priority: 'high'
    });
  }

  // When tour is completed
  static async onTourCompleted(booking, traveller, guideProfile) {
    return this.notifyBothParties({
      travellerUserId: traveller._id,
      guideUserId: guideProfile.userId,
      travellerMessage: `🎉 Tour của bạn đã hoàn thành! Hãy để lại đánh giá cho hướng dẫn viên nhé. Booking: ${booking.bookingCode}`,
      guideMessage: `🎉 Tour với khách ${traveller.name} đã hoàn thành! Booking: ${booking.bookingCode}`,
      type: 'tour_completed',
      title: '🎊 Tour hoàn thành',
      relatedId: booking._id,
      relatedModel: 'Booking',
      priority: 'medium'
    });
  }

  /**
   * Cancellation Notifications
   */
  
  // When traveller cancels tour request
  static async onRequestCancelled(tourRequest, traveller, guideProfile, reason = '') {
    return this.notifyGuide({
      guideId: guideProfile._id,
      type: 'request_cancelled',
      title: '❌ Yêu cầu đã bị hủy',
      message: `${traveller.name} đã hủy yêu cầu tour ${tourRequest.requestNumber}${reason ? `: ${reason}` : ''}`,
      relatedId: tourRequest._id,
      relatedModel: 'TourCustomRequest',
      tourId: tourRequest._id.toString(),
      priority: 'medium'
    });
  }

  // When booking is cancelled
  static async onBookingCancelled(booking, cancelledBy, reason = '') {
    const promises = [];

    // Notify traveller
    if (booking.userId) {
      promises.push(
        this.notifyTraveller({
          userId: booking.userId._id || booking.userId,
          type: 'cancellation',
          title: '❌ Booking đã hủy',
          message: `Booking ${booking.bookingCode} đã bị hủy${reason ? `: ${reason}` : ''}`,
          relatedId: booking._id,
          relatedModel: 'Booking',
          priority: 'high'
        })
      );
    }

    // Notify guide if exists
    if (booking.customTourRequest?.guideId) {
      promises.push(
        this.notifyGuide({
          guideId: booking.customTourRequest.guideId,
          type: 'cancellation',
          title: '❌ Booking bị hủy',
          message: `Booking ${booking.bookingCode} đã bị hủy bởi ${cancelledBy}${reason ? `: ${reason}` : ''}`,
          relatedId: booking._id,
          relatedModel: 'Booking',
          tourId: booking.customTourRequest?.requestId?.toString(),
          priority: 'high'
        })
      );
    }

    return Promise.allSettled(promises);
  }

  /**
   * Message Notifications
   */
  
  // When new message is sent
  static async onNewMessage(tourRequest, sender, recipient, isGuide = false) {
    if (isGuide) {
      // Sender is guide, notify traveller
      return this.notifyTraveller({
        userId: recipient._id,
        email: recipient.email,
        name: recipient.name,
        type: 'new_message',
        title: '💬 Tin nhắn mới',
        message: `Hướng dẫn viên đã gửi tin nhắn mới cho yêu cầu tour ${tourRequest.requestNumber}`,
        relatedId: tourRequest._id,
        relatedModel: 'TourCustomRequest',
        priority: 'medium'
      });
    } else {
      // Sender is traveller, notify guide
      return this.notifyGuide({
        guideId: recipient._id,
        type: 'new_message',
        title: '💬 Tin nhắn mới',
        message: `${sender.name} đã gửi tin nhắn mới cho yêu cầu tour ${tourRequest.requestNumber}`,
        relatedId: tourRequest._id,
        relatedModel: 'TourCustomRequest',
        tourId: tourRequest._id.toString(),
        priority: 'medium'
      });
    }
  }

  /**
   * Schedule & Reminder Notifications
   */
  
  // Tour reminder (send 1-2 days before tour)
  static async onTourReminder(booking, traveller, guideProfile, daysUntil = 1) {
    return this.notifyBothParties({
      travellerUserId: traveller._id,
      guideUserId: guideProfile.userId,
      travellerMessage: `⏰ Nhắc nhở: Tour của bạn sẽ bắt đầu sau ${daysUntil} ngày. Booking: ${booking.bookingCode}`,
      guideMessage: `⏰ Nhắc nhở: Tour với khách ${traveller.name} sẽ bắt đầu sau ${daysUntil} ngày. Booking: ${booking.bookingCode}`,
      type: 'tour_reminder',
      title: '⏰ Nhắc nhở tour',
      relatedId: booking._id,
      relatedModel: 'Booking',
      priority: 'medium'
    });
  }

  /**
   * Review Notification
   */
  static async onReviewReceived(review, guideProfile) {
    return this.notifyGuide({
      guideId: guideProfile._id,
      type: 'review',
      title: '⭐ Đánh giá mới',
      message: `Bạn nhận được đánh giá ${review.rating} sao từ ${review.userName || 'khách hàng'}`,
      relatedId: review._id,
      relatedModel: 'Review',
      priority: 'low'
    });
  }

  /**
   * Refund Notification
   */
  static async onRefundProcessed(booking, traveller, amount, currency) {
    return this.notifyTraveller({
      userId: traveller._id,
      email: traveller.email,
      name: traveller.name,
      type: 'payment_success', // Reuse payment_success for refund
      title: '💰 Hoàn tiền thành công',
      message: `Đã hoàn ${amount.toLocaleString('vi-VN')} ${currency} cho booking ${booking.bookingCode}. Tiền sẽ về tài khoản trong 3-5 ngày làm việc.`,
      relatedId: booking._id,
      relatedModel: 'Booking',
      priority: 'high'
    });
  }
}

module.exports = NotificationService;
