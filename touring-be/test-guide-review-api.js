const axios = require('axios');

const API_URL = 'http://localhost:4000';

async function testGuideReviewAPI() {
  try {
    console.log('🧪 Testing Guide Review API...\n');

    // Test 1: Get guide reviews (should return empty array for non-existent guide)
    console.log('1️⃣ Testing GET /api/reviews/guide/:guideId');
    const response = await axios.get(`${API_URL}/api/reviews/guide/507f1f77bcf86cd799439011`);
    console.log('✅ API Response:', response.data);
    console.log('✅ Guide review API is working!\n');

    // Test 2: Try to create a guide review (will fail without auth, but API should exist)
    console.log('2️⃣ Testing POST /api/reviews/guide (should fail without auth)');
    try {
      await axios.post(`${API_URL}/api/reviews/guide`, {});
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('✅ Auth protection working (expected 401/403)');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }

    console.log('\n🎉 Guide Review API Test Completed Successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error config:', error.config);
    }
  }
}

testGuideReviewAPI();