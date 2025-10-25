const mongoose = require("mongoose");

const mainConn = mongoose.createConnection(process.env.MONGO_URI);
mainConn.once("open", () => console.log("✅ Connected to main DB: travelApp"));

const agencyConn = mongoose.createConnection(
  process.env.MONGO_URI_TRAVEL_AGENCY
);
agencyConn.once("open", () =>
  console.log("✅ Connected to agency DB: TravelAgency")
);

module.exports = { mainConn, agencyConn };
