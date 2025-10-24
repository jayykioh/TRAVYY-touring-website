// utils/paymentHelpers.js
// Shared helpers for payment processing across MoMo and PayPal

const mongoose = require("mongoose");
const Booking = require("../models/Bookings");
const Tour = require("../models/agency/Tours");
const { Cart, CartItem } = require("../models/Carts");
const User = require("../models/Users");
const axios = require("axios");

// FX rate (fallback) for VND->USD conversion
const FX_VND_USD = Number(process.env.FX_VND_USD || 0.000039);

// ===== UNIFIED HELPER: Clear cart after payment =====
async function clearCartAfterPayment(userId, mode) {
  console.log(
    `[Payment] clearCartAfterPayment called - userId: ${userId}, mode: ${mode}`
  );

  if (mode === "cart") {
    try {
      const cart = await Cart.findOne({ userId });
      console.log(`[Payment] Cart found:`, cart ? `ID=${cart._id}` : "null");

      if (cart) {
        const delRes = await CartItem.deleteMany({
          cartId: cart._id,
          selected: true,
        });
        console.log(
          `[Payment] ✅ Cleared ${delRes.deletedCount} selected cart items after successful payment.`
        );
        return delRes.deletedCount;
      } else {
        console.log(`[Payment] No cart found for userId: ${userId}`);
      }
    } catch (clrErr) {
      console.error(
        "[Payment] ❌ Failed to clear cart items post-payment",
        clrErr
      );
    }
  } else {
    console.log(
      `[Payment] Skip clearing cart - mode is '${mode}' (not 'cart')`
    );
  }
  return 0;
}

// ===== UNIFIED HELPER: Create booking from payment session =====
async function createBookingFromSession(session, additionalData = {}) {
  const existing = await Booking.findOne({
    "payment.orderID": session.orderId,
  });
  if (existing) {
    console.log("[Payment] Booking already exists (idempotent):", existing._id);
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
      voucherCode: session.voucherCode
    });

    // ==========================================================
    // 🚀 THÊM MỚI: GIẢM GHẾ + TĂNG usageCount
    // ==========================================================
    for (const item of bookingItems) {
      const totalSeats = (item.adults || 0) + (item.children || 0);
      if (!mongoose.isValidObjectId(item.tourId) || totalSeats <= 0) continue;

      const dateStr = String(item.date).slice(0, 10); // "YYYY-MM-DD"

      // 🔻 Giảm seatsLeft theo ngày khởi hành
      const updateSeats = await Tour.updateOne(
        { _id: item.tourId, "departures.date": dateStr },
        { $inc: { "departures.$.seatsLeft": -totalSeats } }
      );

      // Nếu không tìm thấy (do date kiểu Date) → thử lại với new Date
      if (updateSeats.modifiedCount === 0) {
        const dateAsDate = new Date(dateStr + "T00:00:00.000Z");
        await Tour.updateOne(
          { _id: item.tourId, "departures.date": dateAsDate },
          { $inc: { "departures.$.seatsLeft": -totalSeats } }
        );
      }

      // 🔺 Tăng usageCount (tăng 1 mỗi booking, hoặc tổng người nếu bạn thích)
      await Tour.updateOne(
        { _id: item.tourId },
        { $inc: { usageCount: 1 } } // Hoặc: { $inc: { usageCount: totalSeats } }
      );

      console.log(
        `[Booking] 🪑 Reduced ${totalSeats} seats & incremented usageCount for tourId=${item.tourId}, date=${dateStr}`
      );
    }
    // ==========================================================

    // Sau khi giảm ghế + tăng usageCount → tạo Booking
    const bookingDoc = await Booking.create({
      userId: session.userId,
      items: bookingItems,
      currency: 'VND',
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
      const user = await User.findById(session.userId).lean();
      if (user && user.email) {
        const tourNames = bookingItems.map(item => item.name).join(', ');
        // Sử dụng chính xác booking code như frontend hiển thị
        const bookingCode = bookingDoc.bookingCode || bookingDoc._id.toString().substring(0, 8).toUpperCase();
        
        await axios.post(`http://localhost:${process.env.PORT || 4000}/api/notify/payment`, {
          email: user.email,
          amount: finalAmountVND.toLocaleString('vi-VN'),
          bookingCode: bookingCode,
          tourTitle: tourNames,
          bookingId: bookingDoc._id
        });
        console.log(`[Payment] ✅ Sent payment success notification to ${user.email} with booking code: ${bookingCode}`);
      }
    } catch (notifyErr) {
      console.error(
        "[Payment] ❌ Failed to send payment notification:",
        notifyErr
      );
    }

    // Clear cart if needed
    await clearCartAfterPayment(session.userId, session.mode);

    return bookingDoc;
  } catch (bkErr) {
    console.error("[Payment] Failed to create booking after payment", bkErr);
    throw bkErr;
  }
}

module.exports = {
  clearCartAfterPayment,
  createBookingFromSession,
  FX_VND_USD,
};
