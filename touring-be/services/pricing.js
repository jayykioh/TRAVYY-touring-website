// services/pricing.js
const Tour = require("../models/Tours"); // đường dẫn tới model Tour của bạn

async function getPricesFor(tourId /* ObjectId */, date /* string */) {
  const tour = await Tour.findById(tourId).select("basePrice currency title imageItems");
  if (!tour) throw new Error("Tour not found");

  const unitPriceAdult = tour.basePrice;
  const unitPriceChild = Math.round((tour.basePrice || 0) * 0.5);
  const currency = tour.currency || "VND";
  return { unitPriceAdult, unitPriceChild, currency };
}

async function getTourMeta(tourId) {
  const tour = await Tour.findById(tourId).select("title imageItems");
  if (!tour) return { name: "", image: "" };
  return {
    name: tour.title || "",
    image: tour.imageItems?.[0]?.imageUrl || "",
  };
}

async function calculateCartTotal(items /* Array<CartItem> */) {
  let total = 0;
  for (const it of items) {
    total += (it.adults * (it.unitPriceAdult || 0)) + (it.children * (it.unitPriceChild || 0));
  }
  return total;
}

module.exports = { getPricesFor, getTourMeta, calculateCartTotal };
