const mongoose = require("mongoose");
const Tour = require("../models/agency/Tours");
const Booking = require("../models/Bookings");

// copy các helper từ cart.controller (normalizeDate, clamp0, getPricesAndMeta) hoặc require chúng
const normalizeDate = (d) => (d ? String(d).slice(0, 10) : "");
const clamp0 = (n) => Math.max(0, Number(n) || 0);

async function getPricesAndMeta(tourId, date) {
  const tour = await Tour.findById(tourId).lean();
  if (!tour)
    return {
      unitPriceAdult: 0,
      unitPriceChild: 0,
      meta: {
        name: "",
        image: "",
        departureStatus: "open",
        seatsLeft: null,
        seatsTotal: null,
        found: false,
      },
    };
  const dep = (tour.departures || []).find(
    (d) => (d?.date || "").slice(0, 10) === date
  );
  const unitPriceAdult =
    typeof dep?.priceAdult === "number"
      ? dep.priceAdult
      : typeof tour.basePrice === "number"
      ? tour.basePrice
      : 0;
  const unitPriceChild =
    typeof dep?.priceChild === "number"
      ? dep.priceChild
      : Math.round((unitPriceAdult || 0) * 0.5);
  const meta = {
    name: tour.title || "",
    image: tour.imageItems?.[0]?.imageUrl || "",
    departureStatus: dep?.status || "open",
    seatsLeft: dep?.seatsLeft ?? null,
    seatsTotal: dep?.seatsTotal ?? null,
    found: !!dep,
  };
  return { unitPriceAdult, unitPriceChild, meta };
}

exports.quote = async (req, res) => {
  try {
    const incItems = Array.isArray(req.body.items) ? req.body.items : [];
    const out = [];

    for (const x of incItems) {
      // validate
      let tourId;
      try {
        tourId = new mongoose.Types.ObjectId(x.tourId);
      } catch {
        return res.status(400).json({ error: "INVALID_TOUR_ID" });
      }
      const date = normalizeDate(x.date);
      const adults = clamp0(x.adults);
      const children = clamp0(x.children);
      if (!date || adults + children <= 0) {
        return res.status(400).json({ error: "INVALID_INPUT" });
      }

      // pricing + seats snapshot (no DB write)
      const { unitPriceAdult, unitPriceChild, meta } = await getPricesAndMeta(
        tourId,
        date
      );

      // optional: enforce seatsLeft (nếu seatsLeft != null)
      if (meta.seatsLeft != null && adults + children > meta.seatsLeft) {
        return res
          .status(409)
          .json({ error: "EXCEEDS_DEPARTURE_CAPACITY", limit: meta.seatsLeft });
      }

      out.push({
        tourId: String(tourId),
        date,
        adults,
        children,
        unitPriceAdult,
        unitPriceChild,
        name: meta.name,
        image: meta.image,
        seatsLeft: meta.seatsLeft,
        seatsTotal: meta.seatsTotal,
      });
    }

    res.json({ items: out });
  } catch (e) {
    console.error("quote error", e);
    res.status(500).json({ error: "QUOTE_FAILED" });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ error: "UNAUTHORIZED" });

    console.log("📚 Fetching bookings for userId:", userId);

    // 1️⃣ Lấy danh sách booking từ travelApp (bao gồm cả cancelled và refunded)
    const bookings = await Booking.find({
      userId,
      status: {
        $in: ["pending", "confirmed", "paid", "cancelled", "refunded"],
      }, // Include cancelled for failed bookings and refunded for completed refunds
    })
      .sort({ createdAt: -1 })
      .lean();

    // 2️⃣ Gom tất cả tourId
    const tourIds = bookings
      .flatMap((b) => b.items?.map((i) => i.tourId?.toString()))
      .filter(Boolean);

    // 3️⃣ Lấy tour tương ứng từ TravelAgency DB
    const tours = await Tour.find({ _id: { $in: tourIds } })
      .select("title imageItems")
      .lean();

    // 4️⃣ Merge kết quả thủ công
    const enrichedBookings = bookings.map((booking) => {
      const items = booking.items?.map((item) => {
        // ✅ Safe check: item.tourId might be undefined
        const t = item.tourId
          ? tours.find(
              (x) => x._id.toString() === item.tourId.toString()
            )
          : null;
        return {
          ...item,
          name: item.name || t?.title || "",
          image: item.image || t?.imageItems?.[0]?.imageUrl || "",
        };
      });
      // Provide frontend-friendly top-level properties for payment
      const paymentStatus =
        booking.status === "paid"
          ? "paid"
          : booking.payment?.status === "completed"
          ? "paid"
          : booking.payment?.status || "pending";

      const paymentMethod = booking.payment?.provider || booking.payment?.method || "";

      return { ...booking, items, paymentStatus, paymentMethod };
    });

    res.json({
      success: true,
      bookings: enrichedBookings,
      count: enrichedBookings.length,
    });
  } catch (e) {
    console.error("getUserBookings error", e);
    res.status(500).json({ error: "FETCH_BOOKINGS_FAILED" });
  }
};

/**
 * Get single booking by ID
 * GET /api/bookings/:id
 */
exports.getBookingById = async (req, res) => {
  try {
    const userId = req.user?.sub || req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "UNAUTHORIZED",
      });
    }

    // Validate booking ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "INVALID_BOOKING_ID",
      });
    }

    // Find booking
    const booking = await Booking.findById(id).lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "BOOKING_NOT_FOUND",
      });
    }

    // Check if booking belongs to user (security check)
    if (booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: "FORBIDDEN",
      });
    }

    // Enrich with tour details
    const tourIds = booking.items
      ?.map((i) => i.tourId?.toString())
      .filter(Boolean);
    const tours = await Tour.find({ _id: { $in: tourIds } })
      .select("title imageItems")
      .lean();

    const items = booking.items?.map((item) => {
      const t = tours.find((x) => x._id.toString() === item.tourId.toString());
      return {
        ...item,
        name: item.name || t?.title || "",
        image: item.image || t?.imageItems?.[0]?.imageUrl || "",
      };
    });

    const paymentStatus =
      booking.status === "paid"
        ? "paid"
        : booking.payment?.status === "completed"
        ? "paid"
        : booking.payment?.status || "pending";

    const paymentMethod = booking.payment?.provider || booking.payment?.method || "";

    res.json({
      success: true,
      data: { ...booking, items, paymentStatus, paymentMethod },
    });
  } catch (e) {
    console.error("getBookingById error", e);
    res.status(500).json({
      success: false,
      error: "FETCH_BOOKING_FAILED",
    });
  }
};

// NOTE: getBookingByPayment has been moved to payment.controller.js
// for unified handling of both MoMo and PayPal payment callbacks
