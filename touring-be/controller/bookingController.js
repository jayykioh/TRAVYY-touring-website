// controllers/bookingController.js
const Booking = require("../models/Bookings");
const Tour = require("../models/Tours");
const QRCode = require("qrcode");

exports.createBooking = async (req, res) => {
  try {
    const { tourId, quantity, paymentMethod } = req.body;
    const userId = req.user.sub;

    const tour = await Tour.findById(tourId);
    if (!tour) return res.status(404).json({ message: "Tour not found" });

    const bookingCode = "BK" + Date.now();

    const totalPrice = tour.basePrice * quantity;

    const qrData = `BookingCode:${bookingCode}|User:${userId}|Tour:${tourId}`;
    const qrCode = await QRCode.toDataURL(qrData);

    const booking = new Booking({
      userId,
      tourId,
      bookingCode,
      quantity,
      totalPrice,
      paymentMethod,
      qrCode,
      status: "paid", // giả sử demo thanh toán thành công
    });

    await booking.save();

    // TODO: gửi email vé điện tử
    return res.json({ success: true, booking });
  } catch (err) {
    console.error("createBooking error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.sub;
    const bookings = await Booking.find({ userId })
      .populate("tourId", "title imageItems basePrice")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
