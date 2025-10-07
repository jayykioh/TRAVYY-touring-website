const mongoose = require("mongoose");


const TicketSchema = new mongoose.Schema(
{
bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
tourId: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", required: true },
userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },


// Vé điện tử: chỉ code + QR payload, không lưu chi tiết khách
code: { type: String, unique: true, index: true },
qrPayload: { type: String, required: true },


currency: { type: String, default: "VND" },
amount: { type: Number, required: true },


status: { type: String, enum: ["issued", "used", "refunded"], default: "issued" },
expiredAt: { type: Date },
},
{ timestamps: true }
);


module.exports = mongoose.model("Ticket", TicketSchema);