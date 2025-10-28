
const Tour = require("../models/Tour");

async function getPricesFor(tourId, date) {
  if (!date) throw new Error("MISSING_DATE");
  const tour = await Tour.findById(tourId).lean();
  if (!tour) throw new Error("TOUR_NOT_FOUND");

  const dep = (tour.departures || []).find(d => d.date === String(date) && d.status === "open");
  if (!dep) throw new Error("INVALID_DEPARTURE_DATE");

  return { unitPriceAdult: dep.priceAdult, unitPriceChild: dep.priceChild };
}

async function getTourMeta(tourId) {
  const t = await Tour.findById(tourId).lean();
  return {
    name: t?.title || "",
    image: t?.imageItems?.[0]?.imageUrl || "",
  };
}

module.exports = { getPricesFor, getTourMeta };
