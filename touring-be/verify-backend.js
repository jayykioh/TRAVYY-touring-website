#!/usr/bin/env node

/**
 * Guide Review System - Backend Verification Script
 * 
 * Tests all backend endpoints and verifies system integrity
 */

const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:4000';
const AUTH_TOKEN = process.env.AUTH_TOKEN || ''; // Set this to test authenticated endpoints

// Test data
let testGuideId = null;
let testBookingId = null;
let testCustomTourRequestId = null;
let testReviewId = null;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'blue');
  log(`  ${title}`, 'blue');
  log(`${'='.repeat(60)}`, 'blue');
}

// Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: AUTH_TOKEN ? { 'Authorization': `Bearer ${AUTH_TOKEN}` } : {},
  validateStatus: () => true, // Don't throw on any status
});

// Test functions
async function testGetGuideProfile() {
  logSection('Test 1: Get Guide Profile (Public)');
  
  if (!testGuideId) {
    logWarning('No guide ID provided, skipping test');
    return;
  }
  
  try {
    const response = await api.get(`/api/guide/profile/${testGuideId}`);
    
    if (response.status === 200) {
      logSuccess(`Status: ${response.status}`);
      logSuccess(`Guide name: ${response.data.guide?.userId?.name || 'N/A'}`);
      logSuccess(`Rating: ${response.data.guide?.rating || 'N/A'}`);
      logSuccess(`Total reviews: ${response.data.guide?.totalReviews || 0}`);
    } else {
      logError(`Failed with status: ${response.status}`);
      logError(`Error: ${response.data.message || 'Unknown error'}`);
    }
  } catch (error) {
    logError(`Request failed: ${error.message}`);
  }
}

async function testGetGuideReviews() {
  logSection('Test 2: Get Guide Reviews (Public)');
  
  if (!testGuideId) {
    logWarning('No guide ID provided, skipping test');
    return;
  }
  
  try {
    const response = await api.get(`/api/reviews/guide/${testGuideId}`, {
      params: {
        page: 1,
        limit: 5,
        sort: 'newest'
      }
    });
    
    if (response.status === 200) {
      logSuccess(`Status: ${response.status}`);
      logSuccess(`Total reviews: ${response.data.stats?.totalReviews || 0}`);
      logSuccess(`Average rating: ${response.data.stats?.averageRating?.toFixed(1) || 'N/A'}`);
      
      if (response.data.reviews && response.data.reviews.length > 0) {
        logInfo(`Latest review: "${response.data.reviews[0].title}"`);
        logInfo(`Rating: ${response.data.reviews[0].rating}⭐`);
      } else {
        logInfo('No reviews found for this guide');
      }
    } else {
      logError(`Failed with status: ${response.status}`);
      logError(`Error: ${response.data.message || 'Unknown error'}`);
    }
  } catch (error) {
    logError(`Request failed: ${error.message}`);
  }
}

async function testGetReviewableBookings() {
  logSection('Test 3: Get Reviewable Bookings (Auth Required)');
  
  if (!AUTH_TOKEN) {
    logWarning('No auth token provided, skipping test');
    logInfo('Set AUTH_TOKEN environment variable to test this endpoint');
    return;
  }
  
  try {
    const response = await api.get('/api/reviews/reviewable-bookings');
    
    if (response.status === 200) {
      logSuccess(`Status: ${response.status}`);
      logSuccess(`Total bookings: ${response.data.bookings?.length || 0}`);
      
      const customTours = response.data.reviewableItems?.filter(item => item.type === 'custom_tour') || [];
      const regularTours = response.data.reviewableItems?.filter(item => item.type !== 'custom_tour') || [];
      
      logInfo(`Custom tours to review: ${customTours.length}`);
      logInfo(`Regular tours to review: ${regularTours.length}`);
      
      if (customTours.length > 0) {
        logSuccess('✓ Custom tour reviews supported');
        const firstCustom = customTours[0];
        logInfo(`Sample custom tour: ${firstCustom.guideName} - ${new Date(firstCustom.tourDate).toLocaleDateString()}`);
        
        // Save IDs for next test
        testBookingId = firstCustom.bookingId;
        testCustomTourRequestId = firstCustom.customTourRequestId;
        testGuideId = testGuideId || firstCustom.guideId;
      }
    } else if (response.status === 401) {
      logError('Authentication failed - check AUTH_TOKEN');
    } else {
      logError(`Failed with status: ${response.status}`);
      logError(`Error: ${response.data.message || 'Unknown error'}`);
    }
  } catch (error) {
    logError(`Request failed: ${error.message}`);
  }
}

async function testCreateGuideReview() {
  logSection('Test 4: Create Guide Review (Auth Required)');
  
  if (!AUTH_TOKEN) {
    logWarning('No auth token provided, skipping test');
    return;
  }
  
  if (!testCustomTourRequestId || !testBookingId) {
    logWarning('No custom tour request ID found from previous test');
    logInfo('This test requires a completed custom tour booking');
    return;
  }
  
  const reviewData = {
    customTourRequestId: testCustomTourRequestId,
    rating: 5,
    title: 'Test Review - Great Guide!',
    content: 'This is a test review to verify the guide review system is working correctly. The guide was excellent and professional.',
    serviceRating: 5,
    guideRating: 5,
    valueForMoneyRating: 4,
    images: []
  };
  
  logInfo('⚠️  This will create a REAL review in the database');
  logInfo('Review data:');
  console.log(JSON.stringify(reviewData, null, 2));
  
  // Uncomment to actually create review
  // try {
  //   const response = await api.post('/api/reviews/guide', reviewData);
  //   
  //   if (response.status === 201) {
  //     logSuccess(`Status: ${response.status}`);
  //     logSuccess(`Review created: ${response.data.review._id}`);
  //     testReviewId = response.data.review._id;
  //   } else if (response.status === 409) {
  //     logWarning('Review already exists for this booking');
  //   } else {
  //     logError(`Failed with status: ${response.status}`);
  //     logError(`Error: ${response.data.message || 'Unknown error'}`);
  //   }
  // } catch (error) {
  //   logError(`Request failed: ${error.message}`);
  // }
  
  logWarning('Review creation is commented out by default');
  logInfo('Uncomment lines 172-189 in script to enable');
}

async function testRouteConfiguration() {
  logSection('Test 5: Route Configuration');
  
  const routes = [
    { method: 'GET', path: '/api/guide/available', public: true },
    { method: 'GET', path: '/api/guide/profile/:guideId', public: true },
    { method: 'GET', path: '/api/reviews/guide/:guideId', public: true },
    { method: 'GET', path: '/api/reviews/reviewable-bookings', public: false },
    { method: 'POST', path: '/api/reviews/guide', public: false },
  ];
  
  logInfo('Testing route accessibility...');
  
  for (const route of routes) {
    const testPath = route.path.replace(':guideId', testGuideId || '000000000000000000000000');
    
    try {
      let response;
      if (route.method === 'GET') {
        response = await api.get(testPath);
      } else if (route.method === 'POST') {
        response = await api.post(testPath, {});
      }
      
      const expectedStatus = route.public ? [200, 404] : AUTH_TOKEN ? [200, 400, 404] : [401];
      
      if (expectedStatus.includes(response.status)) {
        logSuccess(`${route.method} ${route.path} - Accessible (${response.status})`);
      } else {
        logError(`${route.method} ${route.path} - Unexpected status: ${response.status}`);
      }
    } catch (error) {
      logError(`${route.method} ${route.path} - Request failed: ${error.message}`);
    }
  }
}

async function testDatabaseSchema() {
  logSection('Test 6: Database Schema Verification');
  
  logInfo('This test requires direct database access');
  logInfo('Checking for:');
  logInfo('  - Review model fields: reviewType, customTourRequestId, guideId');
  logInfo('  - Indexes: { customTourRequestId: 1, userId: 1 }, { guideId: 1 }');
  logInfo('  - Guide model fields: rating, totalReviews');
  
  logWarning('Run the following in MongoDB shell:');
  console.log(`
  // Check Review schema
  db.reviews.findOne({ reviewType: 'custom_tour' });
  
  // Check indexes
  db.reviews.getIndexes();
  
  // Check Guide schema
  db.guides.findOne({}, { rating: 1, totalReviews: 1, userId: 1 });
  `);
}

async function testSystemIntegrity() {
  logSection('Test 7: System Integrity Check');
  
  const checks = [
    { name: 'Backend API responding', check: async () => {
      const response = await api.get('/api/guide/available');
      return response.status < 500;
    }},
    { name: 'Review routes registered', check: async () => {
      const response = await api.get('/api/reviews/guide/000000000000000000000000');
      return response.status !== 404 || response.data.message !== 'Not Found';
    }},
    { name: 'Guide routes registered', check: async () => {
      const response = await api.get('/api/guide/profile/000000000000000000000000');
      return response.status !== 404 || response.data.message !== 'Not Found';
    }},
  ];
  
  for (const check of checks) {
    try {
      const result = await check.check();
      if (result) {
        logSuccess(check.name);
      } else {
        logError(check.name);
      }
    } catch (error) {
      logError(`${check.name} - ${error.message}`);
    }
  }
}

// Main execution
async function runTests() {
  log('\n🚀 Starting Guide Review System Verification\n', 'cyan');
  log(`API URL: ${BASE_URL}`, 'cyan');
  log(`Auth: ${AUTH_TOKEN ? '✓ Token provided' : '✗ No token (some tests will be skipped)'}`, 'cyan');
  
  if (process.argv[2]) {
    testGuideId = process.argv[2];
    log(`Guide ID: ${testGuideId}`, 'cyan');
  } else {
    logWarning('No guide ID provided as argument');
    logInfo('Usage: node verify-backend.js <guideId>');
  }
  
  // Run tests
  await testSystemIntegrity();
  await testRouteConfiguration();
  await testGetGuideProfile();
  await testGetGuideReviews();
  await testGetReviewableBookings();
  await testCreateGuideReview();
  await testDatabaseSchema();
  
  // Summary
  logSection('Verification Complete');
  logInfo('Check the results above for any errors');
  logInfo('For full testing, ensure:');
  logInfo('  1. Backend is running on ' + BASE_URL);
  logInfo('  2. MongoDB is connected');
  logInfo('  3. AUTH_TOKEN is set for authenticated tests');
  logInfo('  4. A guide ID is provided as argument');
  console.log();
}

// Run if called directly
if (require.main === module) {
  runTests().catch(error => {
    logError(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runTests };
