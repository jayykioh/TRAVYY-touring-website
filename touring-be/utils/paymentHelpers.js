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

    // ✅ NEW: Assign guide for regular tours after payment
    if (isPaid && !session.customRequestId && !session.bookingId) {
      try {
        await assignGuideToBooking(bookingDoc);
      } catch (guideError) {
        console.error(`[Payment] ❌ Failed to assign guide to booking ${bookingDoc._id}:`, guideError);
        // Don't fail payment if guide assignment fails
      }
    }

    // ✅ NEW: Update TourCustomRequest status if this is a tour-request payment
    if (isPaid && session.customRequestId) {
      try {
        const TourCustomRequest = require("../models/TourCustomRequest");
        const GuideAvailability = require("../models/guide/GuideAvailability");
        const GuideNotification = require("../models/guide/GuideNotification");
        const Guide = require("../models/guide/Guide");
        const User = require("../models/Users");
        
        const tourRequest = await TourCustomRequest.findById(session.customRequestId)
          .select('userId guideId preferredDates tourDetails status')
          .populate('userId', 'name email')
          .lean();
        
        if (!tourRequest) {
          console.warn(`[Payment] ⚠️ TourCustomRequest ${session.customRequestId} not found`);
          return bookingDoc;
        }
        
        // Update tour request status (non-blocking atomic update)
        TourCustomRequest.findByIdAndUpdate(
          session.customRequestId,
          { 
            $set: { 
              status: 'completed', 
              completedAt: new Date(),
              bookingId: bookingDoc._id 
            }
          },
          { new: false } // Don't wait for result
        ).catch(err => console.error('[Payment] Tour request update error:', err));
        
        console.log(`[Payment] ✅ Updated TourCustomRequest ${session.customRequestId} to 'completed'`);
        
        // 🔒 Lock guide availability for the tour dates
        if (tourRequest.guideId && tourRequest.preferredDates?.length > 0) {
          // Fire and forget guide locking to avoid blocking payment response
          (async () => {
            try {
              const firstDate = tourRequest.preferredDates[0];
              const startDate = new Date(firstDate.startDate);
              const endDate = new Date(firstDate.endDate);
              
              // Find guide profile (with lean for speed)
              const guideProfile = await Guide.findOne({ userId: tourRequest.guideId })
                .select('_id availability')
                .lean();
              
              if (!guideProfile) {
                console.warn(`[Payment] Guide profile not found for user ${tourRequest.guideId}`);
                return;
              }
              
              // Lock guide and update availability in parallel
              await Promise.all([
                GuideAvailability.lockGuideForBooking(
                  guideProfile._id,
                  bookingDoc._id,
                  startDate,
                  endDate,
                  {
                    tourRequestId: tourRequest._id,
                    zoneName: tourRequest.tourDetails?.zoneName,
                    customerName: tourRequest.userId?.name,
                    numberOfGuests: tourRequest.tourDetails?.numberOfGuests,
                    bookingCode: bookingDoc.bookingCode
                  }
                ),
                Guide.findByIdAndUpdate(
                  guideProfile._id,
                  { $set: { availability: 'Busy' } },
                  { new: false }
                )
              ]);
              
              console.log(`[Payment] 🔒 Locked guide ${guideProfile._id} for ${startDate} to ${endDate}`);
              
              // 🔔 Notify guide (non-blocking)
              GuideNotification.create({
                guideId: guideProfile._id,
                notificationId: `guide-${guideProfile._id}-${Date.now()}`,
                type: 'payment_success',
                title: '💰 Thanh toán thành công!',
                message: `Khách hàng ${tourRequest.userId?.name || 'N/A'} đã thanh toán thành công cho tour ${tourRequest.tourDetails?.zoneName}. Booking: ${bookingDoc.bookingCode}. Bạn đã được xác nhận cho tour này.`,
                relatedId: bookingDoc._id,
                relatedModel: 'Booking',
                priority: 'high',
                read: false
              }).catch(err => console.error('[Payment] Notification error:', err));
              
              console.log(`[Payment] 🔔 Sent payment notification to guide ${guideProfile._id}`);
              
            } catch (lockError) {
              console.error(`[Payment] ❌ Guide locking error:`, lockError.message);
            }
          })(); // IIFE for fire-and-forget
        }
      } catch (tourReqError) {
        console.error(`[Payment] ❌ TourCustomRequest update error:`, tourReqError);
      }
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
    const TourCustomRequest = require("../models/TourCustomRequest");
    const Guide = require("../models/guide/Guide");
    const GuideAvailability = require("../models/guide/GuideAvailability");
    const GuideNotification = require("../models/guide/GuideNotification");
    const Notification = require("../models/Notification");
    const {
      sendPaymentSuccessNotification,
    } = require("../controller/notifyController");

    // try both common property names (orderId / orderID)
    let foundBooking = await Booking.findOne({
      $or: [{ "payment.orderId": orderId }, { "payment.orderID": orderId }],
    });

    if (!foundBooking) {
      console.warn(`[Payment] Booking not found for orderId=${orderId} - trying alternate lookups`);

      // Try to locate booking by known alternate identifiers in paymentData
      const altBookingId =
        paymentData?.bookingId ||
        (paymentData?.extraData && (paymentData.extraData.bookingId || paymentData.extraData.bookingId)) ||
        paymentData?.retryBookingId ||
        null;

      if (altBookingId && mongoose.isValidObjectId(String(altBookingId))) {
        try {
          foundBooking = await Booking.findById(altBookingId);
          if (foundBooking) console.log(`[Payment] Found booking by bookingId ${altBookingId}`);
        } catch (e) {
          console.warn(`[Payment] Failed to find booking by altBookingId=${altBookingId}:`, e.message);
        }
      }

      // Fallback: try to find by orderRef (legacy for custom tour bookings)
      if (!foundBooking) {
        try {
          const byRef = await Booking.findOne({ orderRef: orderId });
          if (byRef) {
            foundBooking = byRef;
            console.log(`[Payment] Found booking by orderRef ${orderId}`);
          }
        } catch (e) {
          console.warn(`[Payment] Failed to find booking by orderRef=${orderId}:`, e.message);
        }
      }

      if (!foundBooking) {
        console.warn(`[Payment] ⚠️ Booking still not found for orderId=${orderId}`);
        return null;
      }
    }
    const booking = foundBooking;

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

    // ===== UPDATE TOUR REQUEST IF THIS IS A CUSTOM TOUR BOOKING =====
    if (booking.customTourRequest && booking.customTourRequest.requestId && !wasAlreadyPaid) {
      try {
        console.log(`[Payment] 🔄 Updating TourRequest ${booking.customTourRequest.requestId} for paid booking ${booking._id}`);

        // Update tour request status to completed
        const tourRequest = await TourCustomRequest.findByIdAndUpdate(
          booking.customTourRequest.requestId,
          {
            $set: {
              status: 'completed',
              completedAt: new Date(),
              paymentStatus: 'paid',
              paymentAmount: booking.totalAmount,
              paymentCurrency: booking.currency,
              paymentMethod: booking.payment.provider,
              bookingId: booking._id
            }
          },
          { new: true }
        ).populate('userId', 'name email').populate('guideId', 'name email userId');

        if (tourRequest) {
          console.log(`[Payment] ✅ Updated TourRequest ${tourRequest._id} to completed`);

          // Update guide availability and status
          if (tourRequest.guideId) {
            try {
              // Set guide to busy
              await Guide.findByIdAndUpdate(tourRequest.guideId._id, { availability: 'Busy' });

              // Lock guide availability for tour dates
              if (tourRequest.preferredDates && tourRequest.preferredDates.length > 0) {
                const firstDate = tourRequest.preferredDates[0];
                const startDate = new Date(firstDate.startDate || firstDate);
                const endDate = new Date(firstDate.endDate || startDate);
                endDate.setDate(endDate.getDate() + (tourRequest.numberOfDays || 1));

                await GuideAvailability.lockGuideForBooking(
                  tourRequest.guideId._id,
                  booking._id,
                  startDate,
                  endDate,
                  {
                    tourRequestId: tourRequest._id,
                    zoneName: tourRequest.itineraryId?.zoneName || tourRequest.tourDetails?.zoneName,
                    customerName: tourRequest.userId?.name,
                    numberOfGuests: tourRequest.numberOfPeople || tourRequest.numberOfGuests,
                    bookingCode: booking.bookingCode || booking._id.toString().substring(0, 8).toUpperCase()
                  }
                );

                console.log(`[Payment] 🔒 Locked guide ${tourRequest.guideId._id} availability`);
              }

              // Notify guide
              if (tourRequest.guideId.userId) {
                await Notification.create({
                  userId: tourRequest.guideId.userId,
                  type: 'payment_received',
                  title: '💰 Thanh toán thành công!',
                  message: `Khách hàng ${tourRequest.userId?.name || 'N/A'} đã thanh toán ${booking.totalAmount.toLocaleString()} ${booking.currency} cho tour "${tourRequest.itineraryId?.zoneName || 'Custom Tour'}". Booking: ${booking.bookingCode || booking._id.toString().substring(0, 8).toUpperCase()}`,
                  relatedId: booking._id,
                  relatedModel: 'Booking',
                  priority: 'high'
                });

                console.log(`[Payment] 🔔 Sent payment notification to guide ${tourRequest.guideId.userId}`);
              }

            } catch (guideError) {
              console.error(`[Payment] ❌ Error updating guide for TourRequest ${tourRequest._id}:`, guideError);
            }
          }

          // Update itinerary payment status if exists
          if (tourRequest.itineraryId) {
            try {
              const Itinerary = require("../models/Itinerary");
              await Itinerary.findByIdAndUpdate(tourRequest.itineraryId, {
                $set: {
                  'paymentInfo.status': 'paid',
                  'paymentInfo.paidAt': new Date(),
                  'paymentInfo.amount': booking.totalAmount,
                  'paymentInfo.currency': booking.currency,
                  'paymentInfo.method': booking.payment.provider
                }
              });
              console.log(`[Payment] ✅ Updated Itinerary ${tourRequest.itineraryId} payment status`);
            } catch (itineraryError) {
              console.error(`[Payment] ❌ Error updating itinerary for TourRequest ${tourRequest._id}:`, itineraryError);
            }
          }

        } else {
          console.warn(`[Payment] ⚠️ TourRequest ${booking.customTourRequest.requestId} not found`);
        }

      } catch (tourReqError) {
        console.error(`[Payment] ❌ Error updating TourRequest:`, tourReqError);
      }
    }

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
 * Assign a guide to a regular tour booking after payment
 * @param {Object} booking - The booking document
 */
async function assignGuideToBooking(booking) {
  try {
    console.log(`[Payment] 🔍 Assigning guide to booking ${booking._id}`);

    // Skip if already has a guide
    if (booking.guideId) {
      console.log(`[Payment] Booking ${booking._id} already has guide ${booking.guideId}`);
      return;
    }

    // Get tour details to find location
    const tourIds = booking.items.map(item => item.tourId).filter(Boolean);
    if (tourIds.length === 0) {
      console.warn(`[Payment] No tour IDs found in booking ${booking._id}`);
      return;
    }

    const tours = await Tour.find({ _id: { $in: tourIds } }).select('location province zoneName').lean();
    if (tours.length === 0) {
      console.warn(`[Payment] No tours found for booking ${booking._id}`);
      return;
    }

    // Use the first tour's location as primary location
    const primaryTour = tours[0];
    const location = primaryTour.location || primaryTour.province || primaryTour.zoneName;

    if (!location) {
      console.warn(`[Payment] No location found for tours in booking ${booking._id}`);
      return;
    }

    console.log(`[Payment] Looking for guides in location: ${location}`);

    // Find available guides in the location
    const Guide = require("../models/guide/Guide");
    const GuideAvailability = require("../models/guide/GuideAvailability");
    const GuideNotification = require("../models/guide/GuideNotification");

    // Get tour date from booking items
    const tourDate = booking.items[0]?.date;
    if (!tourDate) {
      console.warn(`[Payment] No tour date found in booking ${booking._id}`);
      return;
    }

    const tourStartDate = new Date(tourDate);
    const tourEndDate = new Date(tourStartDate);
    tourEndDate.setDate(tourEndDate.getDate() + 1); // Assume 1-day tour for now

    // Find available guides
    const availableGuides = await Guide.find({
      isVerified: true,
      profileComplete: true,
      availability: 'Available',
      $or: [
        { location: new RegExp(location, 'i') },
        { coverageAreas: { $elemMatch: { $regex: location, $options: 'i' } } },
        { provinceId: new RegExp(location, 'i') }
      ]
    }).select('_id name email userId').lean();

    console.log(`[Payment] Found ${availableGuides.length} available guides in ${location}`);

    if (availableGuides.length === 0) {
      console.warn(`[Payment] No available guides found for location ${location}`);
      // Could send notification to admin here
      return;
    }

    // Check availability for each guide and assign the first available one
    for (const guide of availableGuides) {
      try {
        const isAvailable = await GuideAvailability.isGuideAvailable(
          guide._id,
          tourStartDate,
          tourEndDate
        );

        if (isAvailable) {
          console.log(`[Payment] ✅ Assigning guide ${guide._id} (${guide.name}) to booking ${booking._id}`);

          // Assign guide to booking
          booking.guideId = guide._id;
          booking.guideAssignedAt = new Date();
          booking.tourScheduledAt = tourStartDate;
          await booking.save();

          // Lock guide availability
          await GuideAvailability.lockGuideForBooking(
            guide._id,
            booking._id,
            tourStartDate,
            tourEndDate,
            {
              tourName: booking.items[0]?.name || 'Tour',
              customerName: 'Customer', // Could populate from user
              numberOfGuests: booking.items.reduce((sum, item) => sum + (item.adults || 0) + (item.children || 0), 0),
              bookingCode: booking.bookingCode || booking._id.toString().substring(0, 8).toUpperCase(),
              location: location
            }
          );

          // Update guide status to Busy
          await Guide.findByIdAndUpdate(guide._id, { availability: 'Busy' });

          // Notify guide
          await GuideNotification.create({
            guideId: guide._id,
            notificationId: `guide-${guide._id}-${Date.now()}`,
            type: 'new_booking',
            title: '🎉 Bạn có tour mới!',
            message: `Khách hàng đã thanh toán thành công cho tour "${booking.items[0]?.name || 'Tour'}" vào ngày ${tourDate}. Mã booking: ${booking.bookingCode || booking._id.toString().substring(0, 8).toUpperCase()}. Số khách: ${booking.items.reduce((sum, item) => sum + (item.adults || 0) + (item.children || 0), 0)}`,
            relatedId: booking._id,
            relatedModel: 'Booking',
            priority: 'high',
            read: false
          });

          console.log(`[Payment] 🔔 Notification sent to guide ${guide._id}`);
          break; // Stop after assigning first available guide
        }
      } catch (guideCheckError) {
        console.error(`[Payment] Error checking guide ${guide._id}:`, guideCheckError);
        continue; // Try next guide
      }
    }

  } catch (error) {
    console.error(`[Payment] ❌ Error assigning guide to booking ${booking._id}:`, error);
    throw error;
  }
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
  assignGuideToBooking,
};
