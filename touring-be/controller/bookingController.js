const mongoose = require("mongoose");
const Tour = require("../models/Tours");
const Booking = require("../models/Bookings");

// copy các helper từ cart.controller (normalizeDate, clamp0, getPricesAndMeta) hoặc require chúng
const normalizeDate = d => (d ? String(d).slice(0,10) : "");
const clamp0 = (n) => Math.max(0, Number(n) || 0);

async function getPricesAndMeta(tourId, date) {
  const tour = await Tour.findById(tourId).lean();
  if (!tour) return { unitPriceAdult:0, unitPriceChild:0, meta:{ name:"", image:"", departureStatus:"open", seatsLeft:null, seatsTotal:null, found:false } };
  const dep = (tour.departures || []).find(d => (d?.date || "").slice(0,10) === date);
  const unitPriceAdult = typeof dep?.priceAdult === "number" ? dep.priceAdult :
                         typeof tour.basePrice === "number" ? tour.basePrice : 0;
  const unitPriceChild = typeof dep?.priceChild === "number" ? dep.priceChild :
                         Math.round((unitPriceAdult || 0) * 0.5);
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
      const { unitPriceAdult, unitPriceChild, meta } = await getPricesAndMeta(tourId, date);

      // optional: enforce seatsLeft (nếu seatsLeft != null)
      if (meta.seatsLeft != null && adults + children > meta.seatsLeft) {
        return res.status(409).json({ error: "EXCEEDS_DEPARTURE_CAPACITY", limit: meta.seatsLeft });
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
    const userId = req.user?.sub; // từ authJwt middleware (JWT payload có field "sub")

    if (!userId) {
      console.error("getUserBookings: Missing userId from token");
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    console.log("📚 Fetching bookings for userId:", userId);

    // Tìm tất cả bookings của user, sắp xếp mới nhất trước
    const bookings = await Booking.find({ userId })
      .populate("items.tourId", "title imageItems")
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✅ Found ${bookings.length} bookings for user ${userId}`);

    // Enrich với thông tin tour nếu cần
    const enrichedBookings = bookings.map(booking => {
      const items = booking.items?.map(item => {
        // Nếu tourId được populate
        if (item.tourId && typeof item.tourId === 'object') {
          return {
            ...item,
            name: item.name || item.tourId.title,
            image: item.image || item.tourId.imageItems?.[0]?.imageUrl
          };
        }
        return item;
      });

      return {
        ...booking,
        items
      };
    });

    res.json({ 
      success: true,
      bookings: enrichedBookings,
      count: enrichedBookings.length
    });
  } catch (e) {
    console.error("getUserBookings error", e);
    res.status(500).json({ error: "FETCH_BOOKINGS_FAILED" });
  }
};

// NOTE: getBookingByPayment has been moved to payment.controller.js
// for unified handling of both MoMo and PayPal payment callbacks