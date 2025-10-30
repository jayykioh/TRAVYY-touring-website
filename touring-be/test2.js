require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');

const MAP4D_API_KEY = process.env.MAP4D_API_KEY;
const Zone = require('../touring-be/models/Zones');

async function checkZonePolygon() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const zoneId = 'dn-son-tra';
    const zone = await Zone.findOne({ id: zoneId }).lean();
    
    if (!zone) {
      console.log('❌ Zone not found');
      process.exit(1);
    }
    
    console.log('📦 Zone found:', zone.name);
    console.log('\n🔍 Checking polygon fields:');
    
    // Check poly field
    if (zone.poly) {
      console.log('✅ poly field exists:');
      console.log('   Type:', Array.isArray(zone.poly) ? 'array' : typeof zone.poly);
      console.log('   Length:', zone.poly.length);
      console.log('   First element:', zone.poly[0]);
      console.log('   Sample:', zone.poly.slice(0, 3));
    } else {
      console.log('❌ No poly field');
    }
    
    // Check geometry field
    if (zone.geometry) {
      console.log('\n✅ geometry field exists:');
      console.log('   Type:', zone.geometry.type);
      console.log('   Coordinates type:', Array.isArray(zone.geometry.coordinates) ? 'array' : typeof zone.geometry.coordinates);
      if (zone.geometry.coordinates?.[0]) {
        console.log('   Ring 0 length:', zone.geometry.coordinates[0].length);
        console.log('   First point:', zone.geometry.coordinates[0][0]);
        console.log('   Sample:', zone.geometry.coordinates[0].slice(0, 3));
      }
    } else {
      console.log('❌ No geometry field');
    }
    
    // Check polygon field
    if (zone.polygon) {
      console.log('\n✅ polygon field exists:');
      console.log('   Type:', Array.isArray(zone.polygon) ? 'array' : typeof zone.polygon);
      console.log('   Length:', zone.polygon.length);
      console.log('   Sample:', zone.polygon.slice(0, 3));
    } else {
      console.log('❌ No polygon field');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

async function testSonTraQueries() {
  console.log('\n🧪 Testing Sơn Trà specific queries...\n');

  const queries = [
    'chùa linh ứng sơn trà',
    'bán đảo sơn trà',
    'viewpoint sơn trà',
    'điểm tham quan sơn trà',
    'bãi biển sơn trà',
    'nhà hàng sơn trà'
  ];

  for (const query of queries) {
    console.log(`\n📍 Testing: "${query}"`);
    
    try {
      const res = await axios.get('https://api.map4d.vn/sdk/place/text-search', {
        params: {
          key: MAP4D_API_KEY,
          text: query,
          location: '16.1173,108.2889',
          radius: 3500
        }
      });

      console.log(`   ✅ Results: ${res.data.result?.length || 0}`);
      if (res.data.result?.length > 0) {
        console.log(`   Top 3:`);
        res.data.result.slice(0, 3).forEach((p, i) => {
          console.log(`   ${i + 1}. ${p.name} (${p.types?.join(', ')})`);
        });
      }
    } catch (err) {
      console.error(`   ❌ Error:`, err.response?.data || err.message);
    }
  }
}

checkZonePolygon();
testSonTraQueries();