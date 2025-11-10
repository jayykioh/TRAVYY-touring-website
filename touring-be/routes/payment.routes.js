// routes/payment.routes.js
const express = require("express");
const authJwt = require("../middlewares/authJwt");
const { 
  createMoMoPayment, 
  handleMoMoIPN, 
  markMoMoPaid, 
  getMoMoSessionStatus,
  getBookingByPayment,
  retryPaymentForBooking
} = require("../controller/payment.controller");

const router = express.Router();

// Create payment (auth required to tie to user)
router.post("/momo", authJwt, createMoMoPayment);

// IPN callback (public – MoMo server calls)
router.post("/momo/ipn", handleMoMoIPN);

// FE calls after redirect (demo)
router.post("/momo/mark-paid", authJwt, markMoMoPaid);

// Poll status
router.get("/momo/session/:orderId", authJwt, getMoMoSessionStatus);

// UNIFIED: Get booking by payment provider and orderId
// This handles both MoMo and PayPal
router.get("/booking/:provider/:orderId", authJwt, getBookingByPayment);

// Retry payment for failed booking
router.post("/retry/:bookingId", authJwt, retryPaymentForBooking);

// Handle deposit payment callback
router.post("/deposit/momo/callback", async (req, res) => {
  try {
    const { orderId, resultCode, extraData } = req.body;
    
    console.log('[Deposit Payment] MoMo callback:', { orderId, resultCode });
    
    if (String(resultCode) !== '0') {
      console.log('[Deposit Payment] Payment failed:', resultCode);
      return res.status(200).json({ success: false });
    }
    
    // Extract itinerary ID from extraData
    const data = JSON.parse(extraData || '{}');
    const itineraryId = data.itineraryId;
    
    if (!itineraryId) {
      console.error('[Deposit Payment] Missing itineraryId in extraData');
      return res.status(400).json({ error: 'Missing itineraryId' });
    }
    
    const Itinerary = require('../models/Itinerary');
    const itinerary = await Itinerary.findById(itineraryId);
    
    if (!itinerary) {
      console.error('[Deposit Payment] Itinerary not found:', itineraryId);
      return res.status(404).json({ error: 'Itinerary not found' });
    }
    
    // Update payment status
    itinerary.paymentInfo.status = 'deposit_paid';
    itinerary.paymentInfo.depositPaidAt = new Date();
    await itinerary.save();
    
    // Send notification to traveller
    try {
      const Notification = require('../models/Notification');
      await Notification.create({
        userId: itinerary.userId,
        type: 'deposit_paid',
        title: 'Đặt cọc thành công',
        message: `Bạn đã đặt cọc thành công cho tour "${itinerary.name}". Tour guide sẽ liên hệ với bạn sớm.`,
        relatedId: itinerary._id,
        relatedModel: 'Itinerary'
      });
      
      // Send notification to tour guide
      if (itinerary.tourGuideRequest?.guideId) {
        await Notification.create({
          userId: itinerary.tourGuideRequest.guideId,
          type: 'deposit_received',
          title: 'Đã nhận tiền cọc',
          message: `Khách hàng đã đặt cọc cho tour "${itinerary.name}". Vui lòng liên hệ để hoàn tất các bước tiếp theo.`,
          relatedId: itinerary._id,
          relatedModel: 'Itinerary'
        });
      }
    } catch (notifError) {
      console.error('[Deposit Payment] Error creating notification:', notifError);
    }
    
    console.log('[Deposit Payment] Success for itinerary:', itineraryId);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('[Deposit Payment] Callback error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
