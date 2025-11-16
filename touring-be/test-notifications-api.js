const mongoose = require('mongoose');
require('dotenv').config();

async function testNotificationsAPI() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const Notification = require('./models/Notification');

    // Get recent notifications
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    console.log(`🔔 Found ${notifications.length} recent notifications:\n`);

    notifications.forEach((notif, index) => {
      console.log(`\n📌 Notification ${index + 1}:`);
      console.log(`  - ID: ${notif._id}`);
      console.log(`  - Type: ${notif.type}`);
      console.log(`  - Title: ${notif.title}`);
      console.log(`  - Message: ${notif.message.substring(0, 60)}...`);
      console.log(`  - Status: ${notif.status}`);
      console.log(`  - RelatedId: ${notif.relatedId || '(none)'}`);
      console.log(`  - RelatedModel: ${notif.relatedModel || '(none)'}`);
      console.log(`  - Data:`, JSON.stringify(notif.data, null, 2));
      console.log(`  - UserId: ${notif.userId || '(none)'}`);
      console.log(`  - CreatedAt: ${notif.createdAt}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testNotificationsAPI();
