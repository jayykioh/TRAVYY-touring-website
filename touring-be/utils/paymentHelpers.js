// utils/paymentHelpers.js
// Unified payment helpers for both PayPal and MoMo

const mongoose = require("mongoose");
const Booking = require("../models/Bookings");
const Tour = require("../models/agency/Tours");
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

  try {
    // Convert items snapshot
    let vndFromItems = 0;
    const bookingItems = [];

    for (const it of session.items || []) {
      const a = Number(it?.meta?.adults) || 0;
      const c = Number(it?.meta?.children) || 0;
      const uA = Number(it?.meta?.unitPriceAdult) || 0;
      const uC = Number(it?.meta?.unitPriceChild) || 0;
      const line = uA * a + uC * c;
      vndFromItems += line > 0 ? line : Number(it.price) || 0;

      // Enrich with tour info if missing
      let tourMeta = { name: it.name, image: it.meta?.image || it.image || "" };
      if (it.tourId && mongoose.isValidObjectId(it.tourId)) {
        const t = await Tour.findById(it.tourId).lean();
        if (t) {
          tourMeta = {
            name: t.title || t.name || it.name,
            image: t.imageItems?.[0]?.imageUrl || t.image || tourMeta.image,
          };
        }
      }

      bookingItems.push({
        tourId: it.tourId,
        date: it.meta?.date || "",
        name: tourMeta.name,
        image: tourMeta.image,
        adults: a,
        children: c,
        unitPriceAdult: uA,
        unitPriceChild: uC,
      });
    }

    // Calculate amounts
    // session.amount already contains the final amount AFTER discount
    const finalAmountVND = Number(session.amount) || 0;
    const discountAmount = Number(session.discountAmount) || 0;
    const originalAmount = finalAmountVND + discountAmount; // Original = Final + Discount

    const totalUSD = Math.round(finalAmountVND * FX_VND_USD * 100) / 100;

    console.log(`[Payment] 💰 Booking amounts:`, {
      originalAmount,
      discountAmount,
      finalAmount: finalAmountVND,
      voucherCode: session.voucherCode,
    });

    const bookingDoc = await Booking.create({
      userId: session.userId,
      items: bookingItems,
      currency: "VND",
      totalVND: finalAmountVND, // Số tiền sau giảm giá (đã trừ discount)
      totalUSD: totalUSD,
      originalAmount: originalAmount, // Số tiền gốc trước giảm
      discountAmount: discountAmount, // Số tiền được giảm
      voucherCode: session.voucherCode || undefined, // Mã voucher
      payment: {
        provider: session.provider,
        orderID: session.orderId,
        status: "completed",
        raw: additionalData,
      },
      status: "paid",
    });

    // Tạo booking code nhất quán với frontend
    const bookingCode = bookingDoc._id.toString().substring(0, 8).toUpperCase();
    bookingDoc.bookingCode = bookingCode;
    await bookingDoc.save();

    console.log(
      `[Payment] Booking created from ${session.provider} payment:`,
      bookingDoc._id
    );

    // Gửi thông báo thanh toán thành công
    try {
      const User = require("../models/Users");
      const user = await User.findById(booking.userId);
      
      if (user && user.email) {
        const tourNames = bookingItems.map((item) => item.name).join(", ");
        // Sử dụng chính xác booking code như frontend hiển thị
        const bookingCode =
          bookingDoc.bookingCode ||
          bookingDoc._id.toString().substring(0, 8).toUpperCase();

        await axios.post(
          `http://localhost:${process.env.PORT || 4000}/api/notify/payment`,
          {
            email: user.email,
            amount: finalAmountVND.toLocaleString("vi-VN"),
            bookingCode: bookingCode,
            tourTitle: tourNames,
            bookingId: bookingDoc._id,
          }
        );
        console.log(
          `[Payment] ✅ Sent payment success notification to ${user.email} with booking code: ${bookingCode}`
        );
      }
    } catch (notifyErr) {
      console.error(
        "[Payment] ❌ Failed to send payment notification:",
        notifyErr
      );
      // Không throw error để không ảnh hưởng đến quá trình chính
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
