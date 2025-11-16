const mongoose = require('mongoose');
require('dotenv').config();

async function fixItinerary() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Define minimal schema
    const Itinerary = mongoose.model('Itinerary', new mongoose.Schema({}, { strict: false }));

    // Update the specific itinerary
    const result = await Itinerary.updateOne(
      { _id: '690bfccfb2994adc683424fe' },
      { $set: { isCustomTour: true } }
    );

    console.log('✅ Update result:', result);

    // Verify the update
    const updated = await Itinerary.findById('690bfccfb2994adc683424fe');
    console.log('✅ Verified isCustomTour:', updated?.isCustomTour);
    console.log('✅ Items count:', updated?.items?.length);

    await mongoose.disconnect();
    console.log('✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixItinerary();
