const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
    maxDiscount: {
      type: Number,
      default: null,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      default: null,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "expired"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // ⬅️ Cho phép null để test
    },
  },
  { timestamps: true }
);

// Method tính discount
promotionSchema.methods.calculateDiscount = function (orderTotal) {
  const now = new Date();
  
  // Check validity
  if (this.status !== "active" || this.startDate > now || this.endDate < now) {
    return 0;
  }
  
  if (this.usageLimit && this.usageCount >= this.usageLimit) {
    return 0;
  }
  
  if (orderTotal < this.minOrderValue) {
    return 0;
  }

  let discount = 0;
  if (this.type === "percentage") {
    discount = (orderTotal * this.value) / 100;
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    discount = this.value;
  }

  return Math.min(discount, orderTotal);
};

module.exports = mongoose.model("Promotion", promotionSchema);
