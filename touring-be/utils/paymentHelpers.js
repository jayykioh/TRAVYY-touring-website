// utils/paymentHelpers.js
// Unified payment helpers for both PayPal and MoMo

const mongoose = require("mongoose");
const Booking = require("../models/Bookings");
const Tour = require("../models/Tours");
const { Cart, CartItem } = require("../models/Carts");

// Exchange rate (VND to USD)
const FX_VND_USD = Number(process.env.FX_VND_USD || 0.000039);

/**
 * Create booking from payment data (unified for PayPal & MoMo)
 */
async function createBookingFromPayment({
  userId,
  items,
  provider,
  orderId,
  pricing,
  voucher = {},
  paymentData = {},
  contactInfo = {}
}) {
  // Check if booking already exists (idempotent)
  const existing = await Booking.findByOrderId(orderId);
  if (existing) {
    console.log(`[Payment] Booking already exists for orderId: ${orderId}`);
    return existing;
  }

  const { originalAmount, discountAmount, totalAmount, currency } = pricing;

  // Enrich items with tour data if needed
  const enrichedItems = await Promise.all(items.map(async (item) => {
    let tourData = { name: item.name, image: item.image };

    if (item.tourId && mongoose.isValidObjectId(item.tourId)) {
      const tour = await Tour.findById(item.tourId).lean();
      if (tour) {
        tourData = {
          name: tour.title || tour.name || item.name,
          image: tour.imageItems?.[0]?.imageUrl || tour.image || item.image
        };
      }
    }

    return { ...item, name: tourData.name, image: tourData.image };
  }));

  const booking = new Booking({
    userId,
    items: enrichedItems,
    currency,
    originalAmount,
    discountAmount,
    totalAmount,
    totalVND: currency === 'VND' ? totalAmount : Math.round(totalAmount / FX_VND_USD),
    totalUSD: currency === 'USD' ? totalAmount : Number((totalAmount * FX_VND_USD).toFixed(2)),
    voucherCode: voucher.code,
    promotionId: voucher.promotionId,
    contactInfo,
    payment: {
      provider,
      orderId,
      transactionId: paymentData.transactionId,
      requestId: paymentData.requestId,
      status: 'pending',
      amount: totalAmount,
      currency,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      ipAddress: paymentData.ipAddress,
      userAgent: paymentData.userAgent
    },
    status: 'pending'
  });

  console.log(`[Payment] 📝 Creating booking with status='pending', payment.status='pending'`);

  // Add provider-specific data
  if (provider === 'paypal' && paymentData.paypal) {
    booking.payment.paypalData = paymentData.paypal;
  } else if (provider === 'momo' && paymentData.momo) {
    booking.payment.momoData = paymentData.momo;
  }

  booking.generateOrderRef();
  await booking.save();
  
  console.log(`[Payment] ✅ Created booking ${booking.orderRef} for ${provider}: ${orderId}`);
  return booking;
}

/**
 * Create booking from PaymentSession (backward compatibility)
 */
async function createBookingFromSession(session) {
  const finalAmountVND = Number(session.amount) || 0;
  const discountAmount = Number(session.discountAmount) || 0;
  const originalAmount = finalAmountVND + discountAmount;

  const items = (session.items || []).map(it => ({
    tourId: it.tourId,
    date: it.meta?.date || '',
    name: it.name,
    image: it.meta?.image || it.image || '',
    adults: Number(it.meta?.adults) || 0,
    children: Number(it.meta?.children) || 0,
    unitPriceAdult: Number(it.meta?.unitPriceAdult) || 0,
    unitPriceChild: Number(it.meta?.unitPriceChild) || 0
  }));

  return createBookingFromPayment({
    userId: session.userId,
    items,
    provider: session.provider || 'paypal',
    orderId: session.orderId,
    pricing: {
      originalAmount,
      discountAmount,
      totalAmount: finalAmountVND,
      currency: 'VND'
    },
    voucher: {
      code: session.voucherCode,
      promotionId: session.promotionId
    },
    paymentData: { raw: session.response }
  });
}

/**
 * Mark booking as paid
 */
async function markBookingAsPaid(orderId, paymentData = {}) {
  try {
    console.log(`[markBookingAsPaid] 🔍 Looking for booking with orderId: ${orderId}`);
    
    // Query directly using payment.orderId field
    const booking = await Booking.findOne({ 'payment.orderId': orderId });
    
    if (!booking) {
      const error = new Error(`Booking not found for payment.orderId: ${orderId}`);
      console.error('[markBookingAsPaid] ❌ Error:', error.message);
      
      // Debug: check if booking exists with different field
      const bookingByOrderRef = await Booking.findOne({ orderRef: orderId });
      if (bookingByOrderRef) {
        console.error(`[markBookingAsPaid] ⚠️ WARNING: Booking found by orderRef instead of payment.orderId!`);
        console.error(`[markBookingAsPaid] This booking has payment.orderId: ${bookingByOrderRef.payment.orderId}`);
      }
      
      throw error;
    }

    console.log(`[markBookingAsPaid] ✅ Found booking ${booking._id}`);
    console.log(`[markBookingAsPaid] Current status: "${booking.status}", payment.status: "${booking.payment.status}"`);

    // Update payment status
    booking.payment.status = 'completed';
    booking.payment.paidAt = new Date();
    
    if (paymentData.transactionId) {
      booking.payment.transactionId = paymentData.transactionId;
    }

    // Update provider-specific data
    if (booking.payment.provider === 'paypal' && paymentData.paypal) {
      booking.payment.paypalData = {
        ...(booking.payment.paypalData?.toObject?.() || {}),
        ...paymentData.paypal
      };
    } else if (booking.payment.provider === 'momo' && paymentData.momo) {
      booking.payment.momoData = {
        ...(booking.payment.momoData?.toObject?.() || {}),
        ...paymentData.momo
      };
    }

    // ✅ Update booking status to PAID
    booking.status = 'paid';
    
    console.log(`[markBookingAsPaid] 💾 Saving with status: "${booking.status}", payment.status: "${booking.payment.status}"`);
    
    await booking.save();
    
    console.log(`[markBookingAsPaid] ✅ SUCCESS! Booking ${booking.orderRef} marked as paid`);
    console.log(`[markBookingAsPaid] Final verified status: "${booking.status}", payment.status: "${booking.payment.status}"`);
    
    // ✅ Clear cart after successful payment (only if payment was from cart mode)
    try {
      const PaymentSession = require("../models/PaymentSession");
      const session = await PaymentSession.findOne({ orderId });
      
      if (session && session.mode === 'cart') {
        console.log(`[markBookingAsPaid] 🛒 Payment was from cart, clearing cart items...`);
        await clearCartAfterPayment(booking.userId);
      } else {
        console.log(`[markBookingAsPaid] 🛒 Payment mode: ${session?.mode || 'unknown'}, skipping cart clear`);
      }
    } catch (cartError) {
      console.error(`[markBookingAsPaid] ⚠️ Failed to clear cart:`, cartError);
      // Don't fail the booking if cart clear fails
    }
    
    // ✅ Send confirmation email via notify controller
    try {
      const User = require("../models/Users");
      const user = await User.findById(booking.userId);
      
      if (user && user.email) {
        // Gọi notification service
        const notifyController = require("../controller/notifyController");
        
        // Format data for email
        const emailData = {
          email: user.email,
          amount: booking.totalAmount.toLocaleString('vi-VN'),
          bookingCode: booking.orderRef,
          tourTitle: booking.items.map(i => i.name).join(', '),
          bookingId: booking._id.toString()
        };
        
        // Create mock req/res objects
        const mockReq = { body: emailData };
        const mockRes = {
          json: () => {},
          status: () => mockRes
        };
        
        await notifyController.notifyPaymentSuccess(mockReq, mockRes);
        console.log(`[markBookingAsPaid] 📧 Confirmation email sent to ${user.email}`);
      }
    } catch (emailError) {
      console.error(`[markBookingAsPaid] ❌ Failed to send confirmation email:`, emailError);
      // Don't fail the booking if email fails
    }
    
    return booking;
  } catch (error) {
    console.error('[markBookingAsPaid] ❌ CRITICAL ERROR marking booking as paid:', error.message);
    console.error('[markBookingAsPaid] Stack:', error.stack);
    throw error;
  }
}

/**
 * Mark booking as failed
 */
async function markBookingAsFailed(orderId, failureData = {}) {
  try {
    console.log(`[markBookingAsFailed] 🔍 Looking for booking with orderId: ${orderId}`);
    
    // Try to find existing booking
    let booking = await Booking.findOne({ 'payment.orderId': orderId });
    
    if (!booking) {
      console.log(`[markBookingAsFailed] ⚠️ No booking found, creating failed booking record...`);
      
      // Get session to create booking
      const PaymentSession = require("../models/PaymentSession");
      const session = await PaymentSession.findOne({ orderId });
      
      if (!session) {
        console.error(`[markBookingAsFailed] ❌ No session found for orderId: ${orderId}`);
        return null;
      }
      
      // Create booking from session
      booking = await createBookingFromSession(session, { failureData });
    }

    console.log(`[markBookingAsFailed] ✅ Found/Created booking ${booking._id}`);
    console.log(`[markBookingAsFailed] Current status: "${booking.status}", payment.status: "${booking.payment.status}"`);

    // Update payment status
    booking.payment.status = 'failed';
    booking.payment.failedAt = new Date();
    
    if (failureData.transactionId) {
      booking.payment.transactionId = failureData.transactionId;
    }

    // Update provider-specific data
    if (booking.payment.provider === 'paypal' && failureData.paypal) {
      booking.payment.paypalData = {
        ...(booking.payment.paypalData?.toObject?.() || {}),
        ...failureData.paypal
      };
    } else if (booking.payment.provider === 'momo' && failureData.momo) {
      booking.payment.momoData = {
        ...(booking.payment.momoData?.toObject?.() || {}),
        ...failureData.momo
      };
    }

    // ✅ Update booking status to CANCELLED (failed payment)
    booking.status = 'cancelled';
    
    console.log(`[markBookingAsFailed] 💾 Saving with status: "${booking.status}", payment.status: "${booking.payment.status}"`);
    
    await booking.save();
    
    console.log(`[markBookingAsFailed] ✅ SUCCESS! Booking ${booking.orderRef} marked as failed`);
    console.log(`[markBookingAsFailed] Final verified status: "${booking.status}", payment.status: "${booking.payment.status}"`);
    
    return booking;
  } catch (error) {
    console.error('[markBookingAsFailed] ❌ CRITICAL ERROR marking booking as failed:', error.message);
    console.error('[markBookingAsFailed] Stack:', error.stack);
    throw error;
  }
}

/**
 * Clear cart after payment
 */
async function clearCartAfterPayment(userId) {
  try {
    // Find the cart for this user
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      console.log(`[Payment] ℹ️ No cart found for user: ${userId}`);
      return true;
    }

    // Delete all selected CartItems for this cart
    const result = await CartItem.deleteMany({ 
      cartId: cart._id, 
      selected: true 
    });
    
    console.log(`[Payment] ✅ Cleared ${result.deletedCount} selected items from cart for user: ${userId}`);
    return true;
  } catch (error) {
    console.error('[Payment] ❌ Error clearing cart:', error);
    return false;
  }
}

/**
 * Calculate total from items
 */
function calculateTotal(items) {
  return items.reduce((total, item) => {
    const adultTotal = (item.adults || 0) * (item.unitPriceAdult || 0);
    const childTotal = (item.children || 0) * (item.unitPriceChild || 0);
    return total + adultTotal + childTotal;
  }, 0);
}

/**
 * Convert VND to USD
 */
function toUSD(vnd) {
  const usd = (Number(vnd) || 0) * FX_VND_USD;
  return (Math.round(usd * 100) / 100).toFixed(2);
}

/**
 * Convert USD to VND
 */
function toVND(usd) {
  return Math.round((Number(usd) || 0) / FX_VND_USD);
}

module.exports = {
  FX_VND_USD,
  createBookingFromPayment,
  createBookingFromSession,
  markBookingAsPaid,
  markBookingAsFailed,
  clearCartAfterPayment,
  calculateTotal,
  toUSD,
  toVND
};
