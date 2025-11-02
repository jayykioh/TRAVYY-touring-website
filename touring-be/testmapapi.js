require('dotenv').config();
const axios = require('axios');

const MAP4D_API_KEY = process.env.MAP4D_API_KEY;

async function testMap4DAPIs() {
  console.log('\n🧪 Testing Map4D APIs...\n');
  console.log(`API Key: ${MAP4D_API_KEY?.substring(0, 10)}...`);

  const testLocation = {
    lat: 16.1173,
    lng: 108.2889,
    name: 'Sơn Trà, Đà Nẵng'
  };

  // ===== Test 1: Text Search =====
  console.log('\n📍 Test 1: Text Search');
  try {
    const res1 = await axios.get('https://api.map4d.vn/sdk/place/text-search', {
      params: {
        key: MAP4D_API_KEY,
        text: 'beach',
        location: `${testLocation.lat},${testLocation.lng}`,
        radius: 3500,
      },
      timeout: 10000
    });

    console.log('✅ Text Search Response:');
    console.log('   Status:', res1.status);
    console.log('   Code:', res1.data.code);
    console.log('   Results count:', res1.data.result?.length || 0);
    if (res1.data.result?.length > 0) {
      console.log('   First result:', {
        name: res1.data.result[0].name,
        location: res1.data.result[0].location,
        types: res1.data.result[0].types
      });
    }
  } catch (err) {
    console.error('❌ Text Search Error:', err.response?.data || err.message);
  }

  // ===== Test 2: Nearby Search =====
  console.log('\n📍 Test 2: Nearby Search');
  try {
    const res2 = await axios.get('https://api.map4d.vn/sdk/place/nearby-search', {
      params: {
        key: MAP4D_API_KEY,
        location: `${testLocation.lat},${testLocation.lng}`,
        radius: 3500,
        text: 'restaurant',
      },
      timeout: 10000
    });

    console.log('✅ Nearby Search Response:');
    console.log('   Status:', res2.status);
    console.log('   Code:', res2.data.code);
    console.log('   Results count:', res2.data.result?.length || 0);
    if (res2.data.result?.length > 0) {
      console.log('   First 3 results:');
      res2.data.result.slice(0, 3).forEach((place, i) => {
        console.log(`   ${i + 1}. ${place.name}`);
      });
    }
  } catch (err) {
    console.error('❌ Nearby Search Error:', err.response?.data || err.message);
  }

  // ===== Test 3: Viewbox Search =====
  console.log('\n📍 Test 3: Viewbox Search');
  try {
    // Viewbox around Sơn Trà
    const viewbox = `${testLocation.lat - 0.03},${testLocation.lng - 0.03},${testLocation.lat + 0.03},${testLocation.lng + 0.03}`;
    
    const res3 = await axios.get('https://api.map4d.vn/sdk/place/viewbox-search', {
      params: {
        key: MAP4D_API_KEY,
        viewbox,
        text: 'viewpoint',
      },
      timeout: 10000
    });

    console.log('✅ Viewbox Search Response:');
    console.log('   Status:', res3.status);
    console.log('   Code:', res3.data.code);
    console.log('   Results count:', res3.data.result?.length || 0);
    if (res3.data.result?.length > 0) {
      console.log('   Sample results:');
      res3.data.result.slice(0, 3).forEach((place, i) => {
        console.log(`   ${i + 1}. ${place.name}`);
      });
    }
  } catch (err) {
    console.error('❌ Viewbox Search Error:', err.response?.data || err.message);
  }

  // ===== Test 4: Autosuggest =====
  console.log('\n📍 Test 4: Autosuggest');
  try {
    const res4 = await axios.get('https://api.map4d.vn/sdk/autosuggest', {
      params: {
        key: MAP4D_API_KEY,
        text: 'chùa linh ứng',
        location: `${testLocation.lat},${testLocation.lng}`,
      },
      timeout: 10000
    });

    console.log('✅ Autosuggest Response:');
    console.log('   Status:', res4.status);
    console.log('   Code:', res4.data.code);
    console.log('   Results count:', res4.data.result?.length || 0);
    if (res4.data.result?.length > 0) {
      console.log('   Suggestions:');
      res4.data.result.slice(0, 3).forEach((place, i) => {
        console.log(`   ${i + 1}. ${place.name} - ${place.address}`);
      });
    }
  } catch (err) {
    console.error('❌ Autosuggest Error:', err.response?.data || err.message);
  }

  console.log('\n✅ Test complete!\n');
}

testMap4DAPIs();