// utils/paymentHelpers.js
// Unified payment helpers for both PayPal and MoMo

const mongoose = require("mongoose");
const Booking = require("../models/Bookings");
const Tour = require("../models/agency/Tours");
const { Cart, CartItem } = require("../models/Carts");
const User = require("../models/Users");
const axios = require("axios");
// Exchange rate (VND to USD)
const FX_VND_USD = Number(process.env.FX_VND_USD || 0.000039);

/**
 * Create Booking From Session (used by payment flows)
 * - session must include userId, orderId and items[] with meta prices
 */
// utils/paymentHelpers.js
async function createBookingFromSession(session, additionalData = {}) {
  try {
    const Booking = require("../models/Bookings");
    if (!session) throw new Error("Session data missing");
    if (!session.userId) throw new Error("Missing userId in session");

    // ✅ Nhận biết kết quả thanh toán
    const isPaid =
      additionalData.markPaid === true ||
      String(additionalData?.ipn?.resultCode) === "0" || // MoMo IPN success
      String(additionalData?.capture?.status || "").toUpperCase() ===
        "COMPLETED"; // PayPal capture success

    const isFailed =
      additionalData.failReason ||
      String(session.status) === "failed" ||
      (String(additionalData?.ipn?.resultCode || "") !== "" &&
        String(additionalData?.ipn?.resultCode) !== "0");

    const paymentStatus = isPaid
      ? "completed"
      : isFailed
      ? "failed"
      : "pending";
    const bookingStatus = isPaid ? "paid" : isFailed ? "cancelled" : "pending";

    // ✅ Nếu là “retry-payment” và có retryBookingId, cập nhật booking cũ thay vì tạo cái mới
    if (session.retryBookingId) {
      let booking = await Booking.findById(session.retryBookingId);
      if (booking) {
        // cập nhật line items từ session mới (phòng trường hợp giá/pax thay đổi)
        const bookingItems = [];
        for (const item of session.items || []) {
          const adults = Number(item.meta?.adults) || 0;
          const children = Number(item.meta?.children) || 0;
          const unitA = Number(item.meta?.unitPriceAdult) || 0;
          const unitC = Number(item.meta?.unitPriceChild) || 0;

          bookingItems.push({
            tourId: item.tourId,
            name: item.name,
            image: item.meta?.image,
            date: item.meta?.date,
            adults,
            children,
            unitPriceAdult: unitA,
            unitPriceChild: unitC,
          });
        }

        const totalFromItems = calculateTotal(bookingItems);
        const discountAmount = Number(session.discountAmount || 0);
        const originalAmount = totalFromItems;
        const finalAmount = Math.max(0, totalFromItems - discountAmount);

        booking.items = bookingItems;
        booking.originalAmount = originalAmount;
        booking.discountAmount = discountAmount;
        booking.totalAmount = finalAmount;
        booking.currency = "VND";
        booking.voucherCode = session.voucherCode || booking.voucherCode;

        booking.payment = booking.payment || {};
        booking.payment.provider = String(
          session.provider || "momo"
        ).toLowerCase();
        booking.payment.orderId = session.orderId;
        booking.payment.status = paymentStatus;
        if (isPaid) booking.payment.paidAt = new Date();
        booking.payment.providerData = {
          ...booking.payment.providerData,
          ...additionalData,
        };

        booking.status = bookingStatus;

        // totalVND / totalUSD cho FE
        booking.totalVND =
          booking.currency === "VND"
            ? booking.totalAmount
            : toVND(booking.totalAmount);
        booking.totalUSD =
          booking.currency === "USD"
            ? booking.totalAmount
            : Number(toUSD(booking.totalAmount));

        await booking.save();

        // ✅ Update tour departure seats if booking is paid
        if (isPaid) {
          await updateTourSeats(bookingItems);
        }

        return booking;
      }
      // nếu retryBookingId không tìm thấy -> rơi xuống nhánh tạo mới
    }

    // ✅ Tạo booking mới (case thường)
    const bookingItems = [];
    for (const item of session.items || []) {
      const adults = Number(item.meta?.adults) || 0;
      const children = Number(item.meta?.children) || 0;
      const unitA = Number(item.meta?.unitPriceAdult) || 0;
      const unitC = Number(item.meta?.unitPriceChild) || 0;

      bookingItems.push({
        tourId: item.tourId,
        name: item.name,
        image: item.meta?.image,
        date: item.meta?.date,
        adults,
        children,
        unitPriceAdult: unitA,
        unitPriceChild: unitC,
      });
    }

    const totalFromItems = calculateTotal(bookingItems);
    const discountAmount = Number(session.discountAmount || 0);
    const originalAmount = totalFromItems;
    const finalAmount = Math.max(0, totalFromItems - discountAmount);

    const providerNormalized = (session.provider || "momo")
      .toString()
      .toLowerCase();

    const bookingDoc = await Booking.create({
      userId: session.userId,
      items: bookingItems,
      totalAmount: finalAmount,
      originalAmount,
      discountAmount,
      currency: "VND",
      voucherCode: session.voucherCode || undefined,
      payment: {
        provider: providerNormalized,
        orderId: session.orderId,
        status: paymentStatus,
        paidAt: isPaid ? new Date() : undefined,
        raw: additionalData,
      },
      status: bookingStatus,
    });

    const bookingCode = bookingDoc._id.toString().substring(0, 8).toUpperCase();
    bookingDoc.bookingCode = bookingCode;
    bookingDoc.totalVND =
      bookingDoc.currency === "VND"
        ? bookingDoc.totalAmount
        : toVND(bookingDoc.totalAmount);
    bookingDoc.totalUSD =
      bookingDoc.currency === "USD"
        ? bookingDoc.totalAmount
        : Number(toUSD(bookingDoc.totalAmount));
    await bookingDoc.save();

    // ✅ Update tour departure seats if booking is paid
    if (isPaid) {
      await updateTourSeats(bookingItems);
    }

    return bookingDoc;
  } catch (err) {
    console.error("[Payment] ❌ createBookingFromSession failed:", err);
    throw err;
  }
}

/**
 * Clear cart after payment
 */
async function clearCartAfterPayment(userId) {
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return true;

    const result = await CartItem.deleteMany({
      cartId: cart._id,
      selected: true,
    });
    console.log(
      `[Payment] ✅ Cleared ${result.deletedCount} selected items from cart for user: ${userId}`
    );
    return true;
  } catch (error) {
    console.error("[Payment] ❌ Error clearing cart:", error);
    return false;
  }
}

// ===== Mark booking as paid =====
async function markBookingAsPaid(orderId, paymentData = {}) {
  try {
    const Booking = require("../models/Bookings");
    const User = require("../models/Users");
    const {
      sendPaymentSuccessNotification,
    } = require("../controller/notifyController");

    // try both common property names (orderId / orderID)
    const booking = await Booking.findOne({
      $or: [{ "payment.orderId": orderId }, { "payment.orderID": orderId }],
    });

    if (!booking) {
      console.warn(`[Payment] Booking not found for orderId=${orderId}`);
      return null;
    }

    // Check if already paid to avoid duplicate notifications
    const wasAlreadyPaid = booking.status === "paid";

    // Ensure required fields exist for schema validation

    booking.payment = booking.payment || {};
    booking.payment.orderId = booking.payment.orderId || orderId;
    booking.payment.provider = (
      booking.payment.provider ||
      paymentData.provider ||
      paymentData.paymentProvider ||
      booking.payment.provider ||
      "paypal"
    )
      .toString()
      .toLowerCase();

    // set amounts if missing (compute from items)
    if (
      typeof booking.totalAmount === "undefined" ||
      booking.totalAmount === null
    ) {
      booking.totalAmount = calculateTotal(booking.items || []);
    }
    if (
      typeof booking.originalAmount === "undefined" ||
      booking.originalAmount === null
    ) {
      booking.originalAmount = calculateTotal(booking.items || []);
    }

    // Ensure totalVND/totalUSD exist for frontend
    booking.totalVND =
      booking.totalVND ||
      (booking.currency === "VND"
        ? booking.totalAmount
        : toVND(booking.totalAmount));
    booking.totalUSD =
      booking.totalUSD ||
      (booking.currency === "USD"
        ? booking.totalAmount
        : Number(toUSD(booking.totalAmount)));

    booking.status = "paid";
    booking.payment.status = "completed";
    booking.payment.paidAt = new Date();
    booking.payment.transactionId =
      paymentData.transactionId ||
      paymentData.id ||
      paymentData.orderId ||
      null;
    booking.payment.providerData = paymentData;

    await booking.save();
    console.log(
      `[Payment] ✅ Booking ${booking._id} marked as paid (orderId=${orderId})`
    );

    // Send payment success notification if not already paid
    if (!wasAlreadyPaid) {
      try {
        const user = await User.findById(booking.userId);
        if (user && user.email) {
          const tourTitle = booking.items?.[0]?.name || "Tour";
          await sendPaymentSuccessNotification({
            email: user.email,
            amount: booking.totalAmount,
            bookingCode: booking.bookingCode,
            tourTitle: tourTitle,
            bookingId: booking._id,
          });
          console.log(
            `[Payment] ✅ Payment success notification sent for booking ${booking._id}`
          );
        } else {
          console.warn(
            `[Payment] ⚠️ User email not found for booking ${booking._id}, skipping notification`
          );
        }
      } catch (notifyError) {
        console.error(
          `[Payment] ❌ Failed to send payment notification for booking ${booking._id}:`,
          notifyError
        );
        // Don't fail the payment if notification fails
      }
    }

    return booking;
  } catch (err) {
    console.error("[Payment] ❌ Failed to mark booking as paid:", err);
    throw err;
  }
}

// ===== Mark booking as failed =====
async function markBookingAsFailed(orderId, failureData = {}) {
  try {
    const Booking = require("../models/Bookings");
    const booking = await Booking.findOne({
      $or: [{ "payment.orderId": orderId }, { "payment.orderID": orderId }],
    });
    if (!booking) {
      console.warn(
        `[Payment] ⚠️ No booking found for failed orderId=${orderId}`
      );
      return null;
    }

    booking.status = "cancelled";
    booking.payment = booking.payment || {};
    booking.payment.status = "failed";
    booking.payment.failedAt = new Date();
    booking.payment.failureData = failureData;

    await booking.save();
    console.log(`[Payment] ✅ Booking ${booking._id} marked as failed`);
    return booking;
  } catch (err) {
    console.error("[Payment] ❌ Failed to mark booking as failed:", err);
    throw err;
  }
}

/**
 * Calculate total from items (VND)
 */
function calculateTotal(items) {
  return (items || []).reduce((total, item) => {
    const adultTotal = (item.adults || 0) * (item.unitPriceAdult || 0);
    const childTotal = (item.children || 0) * (item.unitPriceChild || 0);
    return total + adultTotal + childTotal;
  }, 0);
}

/** Convert VND to USD */
function toUSD(vnd) {
  const usd = (Number(vnd) || 0) * FX_VND_USD;
  return (Math.round(usd * 100) / 100).toFixed(2);
}

/** Convert USD to VND */
function toVND(usd) {
  return Math.round((Number(usd) || 0) / FX_VND_USD);
}

/**
 * Update tour departure seats after successful booking
 * @param {Array} bookingItems - Array of booking items with tourId, date, adults, children
 */
async function updateTourSeats(bookingItems) {
  try {
    for (const item of bookingItems) {
      const tourId = item.tourId;
      const departureDate = item.date;
      const totalSeats = (item.adults || 0) + (item.children || 0);

      if (!tourId || !departureDate || totalSeats <= 0) continue;

      // Find tour and update specific departure's seatsLeft
      const tour = await Tour.findOne({
        _id: tourId,
        "departures.date": departureDate,
      });

      if (!tour) {
        console.warn(
          `⚠️ Tour ${tourId} or departure ${departureDate} not found`
        );
        continue;
      }

      const departure = tour.departures.find((d) => d.date === departureDate);

      if (departure && departure.seatsLeft != null) {
        const newSeatsLeft = Math.max(0, departure.seatsLeft - totalSeats);

        await Tour.updateOne(
          { _id: tourId, "departures.date": departureDate },
          {
            $set: {
              "departures.$.seatsLeft": newSeatsLeft,
              "departures.$.status":
                newSeatsLeft === 0 ? "soldout" : departure.status,
            },
            $inc: { usageCount: 1 }, // ✅ Increment booking count
          }
        );

        console.log(
          `✅ Updated tour ${tourId}: seatsLeft ${departure.seatsLeft} -> ${newSeatsLeft}, usageCount +1`
        );
      } else {
        // If no seatsLeft tracking, just increment usageCount
        await Tour.updateOne({ _id: tourId }, { $inc: { usageCount: 1 } });

        console.log(`✅ Updated tour ${tourId}: usageCount +1`);
      }
    }
  } catch (error) {
    console.error("❌ Error updating tour seats:", error);
    // Don't throw - booking should succeed even if seat update fails
  }
}

module.exports = {
  FX_VND_USD,
  createBookingFromSession,
  markBookingAsPaid,
  markBookingAsFailed,
  clearCartAfterPayment,
  calculateTotal,
  toUSD,
  toVND,
  updateTourSeats,
};
