const mongoose = require('mongoose');
require('dotenv').config();

async function checkRequests() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Define minimal schema
    const TourCustomRequest = mongoose.model('TourCustomRequest', new mongoose.Schema({}, { strict: false }));

    // Count total requests
    const total = await TourCustomRequest.countDocuments();
    console.log(`📊 Total Tour Requests in DB: ${total}\n`);

    // Get latest requests
    const requests = await TourCustomRequest.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    console.log('🔍 Latest 5 Requests:');
    console.log('==========================================\n');

    requests.forEach((req, index) => {
      console.log(`${index + 1}. Request #${req.requestNumber || 'N/A'}`);
      console.log(`   ID: ${req._id}`);
      console.log(`   Status: ${req.status}`);
      console.log(`   User ID: ${req.userId}`);
      console.log(`   Guide ID: ${req.guideId || 'Not assigned'}`);
      console.log(`   Itinerary ID: ${req.itineraryId}`);
      console.log(`   Budget: ${req.initialBudget?.amount?.toLocaleString('vi-VN')} ${req.initialBudget?.currency || 'VND'}`);
      console.log(`   Number of Guests: ${req.tourDetails?.numberOfGuests || 'N/A'}`);
      console.log(`   Preferred Dates: ${req.preferredDates?.length || 0} dates`);
      if (req.preferredDates?.[0]) {
        console.log(`   First Date: ${new Date(req.preferredDates[0].startDate).toLocaleDateString('vi-VN')}`);
      }
      console.log(`   Created: ${new Date(req.createdAt).toLocaleString('vi-VN')}`);
      console.log(`   Zone: ${req.tourDetails?.zoneName || 'N/A'}`);
      console.log('------------------------------------------\n');
    });

    await mongoose.disconnect();
    console.log('✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkRequests();
