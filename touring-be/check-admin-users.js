const mongoose = require('mongoose');
require('dotenv').config();

async function checkAdminUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Define minimal User schema
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false, collection: 'users' }));

    // Find all admin users
    const admins = await User.find({ role: 'Admin' }).lean();
    
    console.log(`🔍 Found ${admins.length} admin user(s):\n`);
    
    admins.forEach((admin, index) => {
      console.log(`Admin ${index + 1}:`);
      console.log(`  - ID: ${admin._id}`);
      console.log(`  - Email: ${admin.email}`);
      console.log(`  - Username: ${admin.username || '(not set)'}`);
      console.log(`  - Name: ${admin.name || '(not set)'}`);
      console.log(`  - Role: ${admin.role}`);
      console.log(`  - Account Status: ${admin.accountStatus || '(not set)'}`);
      console.log('');
    });

    if (admins.length === 0) {
      console.log('❌ No admin users found in database!');
      console.log('You may need to create an admin user first.');
    }

    await mongoose.connection.close();
    console.log('✅ Connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAdminUsers();
