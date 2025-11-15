const Booking = require('../models/Bookings');
const TourCustomRequest = require('../models/TourCustomRequest');
const GuideAvailability = require('../models/guide/GuideAvailability');
const GuideNotification = require('../models/guide/GuideNotification');
const Notification = require('../models/Notification');
const Guide = require('../models/guide/Guide');
const User = require('../models/Users');
const NotificationService = require('../services/notificationService');

/**
 * Mark a custom tour booking as completed
 * - Updates booking status
 * - Updates tour request status
 * - Releases guide availability lock
 * - Updates guide status to Available if no other active bookings
 * - Sends notifications to both parties
 */
exports.completeTour = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user?.sub || req.user?._id;
    const userRole = req.user?.role;
    
    // Authorization: Only guide or admin can mark as completed
    if (userRole !== 'TourGuide' && userRole !== 'Admin') {
      return res.status(403).json({ success: false, error: 'Only guide can mark tour as completed' });
    }
    
    // Find the booking with minimal data first
    const booking = await Booking.findById(bookingId)
      .select('status customTourRequest userId payment')
      .lean();
    
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    
    // Check if booking is paid (early return)
    if (booking.status !== 'paid') {
      return res.status(400).json({ success: false, error: 'Booking must be paid before completion' });
    }
    
    // Verify guide ownership (only for TourGuide role)
    if (userRole === 'TourGuide') {
      const guideProfile = await Guide.findOne({ userId }).select('_id').lean();
      if (!guideProfile || guideProfile._id.toString() !== booking.customTourRequest?.guideId?.toString()) {
        return res.status(403).json({ success: false, error: 'Not authorized for this booking' });
      }
    }
    
    // Fetch full booking data and related entities in parallel
    const [fullBooking, tourRequest, guideProfile] = await Promise.all([
      Booking.findByIdAndUpdate(
        bookingId,
        { $set: { status: 'completed', completedAt: new Date() } },
        { new: true }
      ).populate('userId', 'name email'),
      booking.customTourRequest?.requestId 
        ? TourCustomRequest.findByIdAndUpdate(
            booking.customTourRequest.requestId,
            { $set: { status: 'completed', completedAt: new Date() } },
            { new: false }
          )
        : Promise.resolve(null),
      booking.customTourRequest?.guideId
        ? Guide.findById(booking.customTourRequest.guideId).select('_id availability')
        : Promise.resolve(null)
    ]);
    
    console.log(`[TourCompletion] ✅ Booking ${bookingId} marked as completed`);
    
    // Release guide lock and check for other active bookings in parallel
    if (guideProfile) {
      const [, activeBookingsCount] = await Promise.all([
        GuideAvailability.releaseGuideLock(bookingId, 'completed'),
        GuideAvailability.countDocuments({
          guideId: guideProfile._id,
          status: 'active'
        }).hint({ guideId: 1, status: 1 })
      ]);
      
      console.log(`[TourCompletion] 🔓 Released guide lock, ${activeBookingsCount} active bookings remaining`);
      
      // Update guide availability if no more active bookings
      if (activeBookingsCount === 0) {
        Guide.findByIdAndUpdate(
          guideProfile._id,
          { $set: { availability: 'Available' } },
          { new: false }
        ).catch(err => console.error('[TourCompletion] Guide update error:', err));
        
        console.log(`[TourCompletion] ✅ Guide ${guideProfile._id} set to Available`);
      }
      
      // 🔔 Emit socket event to notify traveller and guide about tour completion
      try {
        const io = global.io;
        if (io && fullBooking) {
          // Notify traveller that tour is completed
          io.to(`user-${fullBooking.userId}`).emit('tourCompleted', {
            bookingId: fullBooking._id,
            tourTitle: fullBooking.items?.[0]?.name || 'Tour',
            message: 'Tour đã hoàn thành'
          });
          console.log(`[TourCompletion] 🔔 Emitted tourCompleted to traveller ${fullBooking.userId}`);
          
          // Notify guide that tour is marked as done
          io.to(`user-${guideProfile._id.toString()}`).emit('tourMarkedDone', {
            bookingId: fullBooking._id,
            tourTitle: fullBooking.items?.[0]?.name || 'Tour',
            message: 'Tour đã được đánh dấu hoàn thành'
          });
          console.log(`[TourCompletion] 🔔 Emitted tourMarkedDone to guide ${guideProfile._id}`);
        }
      } catch (socketErr) {
        console.warn(`[TourCompletion] ⚠️ Socket emit failed:`, socketErr);
      }
      
      // Send notifications in parallel (fire and forget)
      NotificationService.onTourCompleted(
        fullBooking,
        fullBooking.userId,
        guideProfile
      ).catch(err => console.error('[TourCompletion] Notification error:', err));
    }
    
    res.json({
      success: true,
      message: 'Tour marked as completed successfully',
      booking: fullBooking
    });
    
  } catch (error) {
    console.error('[TourCompletion] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Cancel a booking and release guide lock
 * - Can be called by guide, traveller, or admin
 * - Releases guide availability
 * - Handles refund logic (if applicable)
 */
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    const userId = req.user?.sub || req.user?._id;
    const userRole = req.user?.role;
    
    const booking = await Booking.findById(bookingId)
      .populate('customTourRequest.requestId')
      .populate('customTourRequest.guideId')
      .populate('userId', 'name email');
    
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    
    // Authorization check
    const isOwner = booking.userId._id.toString() === userId;
    const isGuide = userRole === 'TourGuide';
    const isAdmin = userRole === 'Admin';
    
    if (!isOwner && !isGuide && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    
    // Cannot cancel completed bookings
    if (booking.status === 'completed') {
      return res.status(400).json({ success: false, error: 'Cannot cancel completed booking' });
    }
    
    // Update booking
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = reason;
    await booking.save();
    
    // Update tour request if exists
    if (booking.customTourRequest?.requestId) {
      const tourRequest = await TourCustomRequest.findById(booking.customTourRequest.requestId);
      if (tourRequest) {
        tourRequest.status = 'cancelled';
        tourRequest.cancelledAt = new Date();
        await tourRequest.save();
      }
    }
    
    // Release guide lock
    await GuideAvailability.releaseGuideLock(bookingId, 'cancelled');
    
    // Update guide availability if needed
    const guideProfile = await Guide.findById(booking.customTourRequest?.guideId);
    if (guideProfile) {
      const activeBookings = await GuideAvailability.countDocuments({
        guideId: guideProfile._id,
        status: 'active'
      });
      
      if (activeBookings === 0) {
        guideProfile.availability = 'Available';
        await guideProfile.save();
      }
      
      // Notify guide
      await NotificationService.notifyGuide({
        guideId: guideProfile._id,
        type: 'cancellation',
        title: '❌ Booking bị hủy',
        message: `Booking ${booking.bookingCode} đã bị hủy${reason ? `: ${reason}` : ''}`,
        relatedId: booking._id,
        relatedModel: 'Booking',
        tourId: booking.customTourRequest?.requestId?.toString(),
        priority: 'high'
      });
    }
    
    // Notify traveller
    await NotificationService.notifyTraveller({
      userId: booking.userId._id,
      email: booking.userId.email,
      name: booking.userId.name,
      type: 'cancellation',
      title: '❌ Booking đã hủy',
      message: `Booking ${booking.bookingCode} đã được hủy${reason ? `: ${reason}` : ''}`,
      relatedId: booking._id,
      relatedModel: 'Booking',
      priority: 'high'
    });
    
    console.log(`[TourCompletion] ❌ Booking ${bookingId} cancelled and guide lock released`);
    
    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking
    });
    
  } catch (error) {
    console.error('[TourCompletion] Error cancelling booking:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get guide's upcoming tours and schedule
 */
exports.getGuideSchedule = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?._id;
    const guideProfile = await Guide.findOne({ userId }).select('_id availability').lean();
    
    if (!guideProfile) {
      return res.status(404).json({ success: false, error: 'Guide profile not found' });
    }
    
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    // Get all active bookings (optimized query)
    const busyDates = await GuideAvailability.getGuideBusyDates(
      guideProfile._id,
      now,
      thirtyDaysLater
    );
    
    res.json({
      success: true,
      schedule: busyDates,
      availability: guideProfile.availability
    });
    
  } catch (error) {
    console.error('[TourCompletion] Error getting guide schedule:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;
