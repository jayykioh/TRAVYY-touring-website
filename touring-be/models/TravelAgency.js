const mongoose = require("mongoose");

const TravelAgencySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    contact: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    total: {
      type: Number,
      default: null, // có thể lưu tổng số tour/doanh thu/đơn hàng...
    },
    employees: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // liên kết tới bảng users
        },
      },
    ],
  },
  { timestamps: true, collection: "travel_agency" } // chỉ rõ collection trong MongoDB
);

module.exports = mongoose.model("TravelAgency", TravelAgencySchema);