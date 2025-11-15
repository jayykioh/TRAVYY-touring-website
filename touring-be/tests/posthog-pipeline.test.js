/**
 * PostHog Pipeline Integration Tests
 * 
 * Run with: npm test
 * or: node tests/posthog-pipeline.test.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

// Services to test
const posthogClient = require('../services/posthog/client');
const eventFetcher = require('../services/posthog/event-fetcher');
const aggregator = require('../services/posthog/aggregator');
const { embed, upsert, health } = require('../services/ai/libs/embedding-client');
const UserProfile = require('../models/UserProfile');

// Test utilities
function log(emoji, message) {
  console.log(`${emoji} ${message}`);
}

function logSection(title) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${'='.repeat(60)}\n`);
}

async function runTests() {
  let exitCode = 0;
  
  try {
    logSection('🧪 PostHog Pipeline Integration Tests');
    
    // =============================================
    // Test 1: Environment Variables
    // =============================================
    logSection('Test 1: Environment Variables');
    
    const requiredEnvVars = [
      'POSTHOG_API_KEY',
      'POSTHOG_HOST',
      'MONGO_URI',
      'EMBED_SERVICE_URL'
    ];
    
    let envSuccess = true;
    for (const varName of requiredEnvVars) {
      if (process.env[varName]) {
        log('✅', `${varName}: ${process.env[varName].substring(0, 20)}...`);
      } else {
        log('❌', `${varName}: MISSING`);
        envSuccess = false;
      }
    }
    
    if (!envSuccess) {
      throw new Error('Missing required environment variables');
    }
    
    // =============================================
    // Test 2: MongoDB Connection
    // =============================================
    logSection('Test 2: MongoDB Connection');
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }
    
    if (mongoose.connection.readyState === 1) {
      log('✅', 'MongoDB connected');
      log('ℹ️', `Database: ${mongoose.connection.name}`);
    } else {
      throw new Error('MongoDB connection failed');
    }
    
    // =============================================
    // Test 3: Embedding Service Health
    // =============================================
    logSection('Test 3: Embedding Service Health');
    
    try {
      const healthData = await health();
      log('✅', `Embedding service available`);
      log('ℹ️', `Model: ${healthData.model}`);
      log('ℹ️', `Vectors: ${healthData.vectors}`);
      log('ℹ️', `Dimensions: ${healthData.dimensions}`);
    } catch (error) {
      log('❌', `Embedding service unavailable: ${error.message}`);
      log('⚠️', 'Start embedding service: cd ai && python app.py');
      throw error;
    }
    
    // =============================================
    // Test 4: PostHog Client
    // =============================================
    logSection('Test 4: PostHog Client');
    
    try {
      // Track a test event
      await posthogClient.track('test_user_' + Date.now(), 'test_pipeline_event', {
        test: true,
        timestamp: new Date().toISOString(),
        source: 'integration_test'
      });
      log('✅', 'PostHog client working');
      log('ℹ️', 'Test event sent successfully');
    } catch (error) {
      log('❌', `PostHog client failed: ${error.message}`);
      throw error;
    }
    
    // =============================================
    // Test 5: Event Fetcher (PostHog API)
    // =============================================
    logSection('Test 5: Event Fetcher (PostHog API)');
    
    try {
      // Test connection first
      await eventFetcher.testConnection();
      log('✅', 'PostHog API connection successful');
      
      // Fetch last 24 hours of events
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const endDate = new Date();
      
      log('ℹ️', `Fetching events from ${startDate.toISOString()} to ${endDate.toISOString()}`);
      
      const events = await eventFetcher.fetchEvents(startDate, endDate);
      log('✅', `Fetched ${events.length} events from PostHog`);
      
      if (events.length > 0) {
        const sampleEvent = events[0];
        log('ℹ️', `Sample event: ${sampleEvent.eventType} by user ${sampleEvent.userId || 'anonymous'}`);
      } else {
        log('⚠️', 'No events found. Use the app to generate some events first.');
      }
    } catch (error) {
      log('❌', `Event fetcher failed: ${error.message}`);
      if (error.response) {
        log('ℹ️', `Status: ${error.response.status}`);
        log('ℹ️', `Message: ${error.response.data?.detail || 'Unknown error'}`);
      }
      throw error;
    }
    
    // =============================================
    // Test 6: Event Aggregation
    // =============================================
    logSection('Test 6: Event Aggregation');
    
    try {
      // Create mock events
      const mockEvents = [
        {
          eventType: 'tour_view',
          userId: 'test_user_123',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          vibes: ['beach', 'adventure'],
          provinces: ['Khánh Hòa'],
          tourPrice: 1500000,
          tourDuration: 3
        },
        {
          eventType: 'tour_booking_complete',
          userId: 'test_user_123',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          vibes: ['beach', 'resort'],
          provinces: ['Khánh Hòa'],
          tourPrice: 3000000,
          tourDuration: 5
        },
        {
          eventType: 'blog_view',
          userId: 'test_user_123',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          vibes: ['food', 'culture'],
          provinces: ['Hà Nội']
        }
      ];
      
      const userProfiles = aggregator.aggregateByUser(mockEvents);
      log('✅', `Aggregated ${userProfiles.size} user profiles`);
      
      if (userProfiles.size > 0) {
        const profile = userProfiles.get('test_user_123');
        log('ℹ️', `User: test_user_123`);
        log('ℹ️', `  Vibe weights: ${JSON.stringify(profile.vibeWeights)}`);
        log('ℹ️', `  Province weights: ${JSON.stringify(profile.provinceWeights)}`);
        log('ℹ️', `  Total weight: ${profile.totalWeight.toFixed(2)}`);
        log('ℹ️', `  Confidence: ${profile.confidence.toFixed(2)}`);
        log('ℹ️', `  Travel style: ${profile.travelStyle}`);
        
        // Test weighted text generation
        const weightedText = aggregator.buildWeightedText(profile);
        log('ℹ️', `  Weighted text: "${weightedText.substring(0, 60)}..."`);
      }
    } catch (error) {
      log('❌', `Aggregation failed: ${error.message}`);
      throw error;
    }
    
    // =============================================
    // Test 7: Embedding Generation
    // =============================================
    logSection('Test 7: Embedding Generation');
    
    try {
      const testText = 'beach beach beach adventure mountain food culture Khánh Hòa Hà Nội';
      log('ℹ️', `Test text: "${testText}"`);
      
      const result = await embed([testText]); // Pass as array
      const embedding = result.embeddings[0];
      log('✅', `Generated embedding vector`);
      log('ℹ️', `Dimensions: ${embedding.length}`);
      log('ℹ️', `Sample values: [${embedding.slice(0, 5).map(v => v.toFixed(3)).join(', ')}...]`);
      
      if (embedding.length < 100) {
        throw new Error(`Embedding dimension too small: ${embedding.length}`);
      }
    } catch (error) {
      log('❌', `Embedding generation failed: ${error.message}`);
      throw error;
    }
    
    // =============================================
    // Test 8: FAISS Upsert
    // =============================================
    logSection('Test 8: FAISS Upsert');
    
    try {
      const testUserId = 'test_user_' + Date.now();
      const testText = 'beach adventure mountain';
      const result = await embed([testText]);
      const testEmbedding = result.embeddings[0];
      
      const upsertResult = await upsert([{
        id: testUserId,
        type: 'user',
        text: testText,
        vector: testEmbedding,
        metadata: {
          confidence: 0.85,
          travelStyle: 'adventurer',
          lastUpdated: new Date().toISOString()
        }
      }]);
      
      log('✅', `Upserted vector to FAISS`);
      log('ℹ️', `User ID: ${testUserId}`);
      log('ℹ️', `Result: ${JSON.stringify(upsertResult)}`);
    } catch (error) {
      log('❌', `FAISS upsert failed: ${error.message}`);
      throw error;
    }
    
    // =============================================
    // Test 9: UserProfile Model
    // =============================================
    logSection('Test 9: UserProfile Model');
    
    try {
      const testUserId = new mongoose.Types.ObjectId();
      const testProfile = {
        userId: testUserId,
        vibeWeights: new Map([
          ['beach', 12.5],
          ['adventure', 8.3],
          ['mountain', 5.2]
        ]),
        provinceWeights: new Map([
          ['Khánh Hòa', 15.0],
          ['Hà Nội', 8.5]
        ]),
        eventCounts: new Map([
          ['tour_view', 10],
          ['tour_booking_complete', 2],
          ['blog_view', 5]
        ]),
        confidence: 0.87,
        travelStyle: 'adventurer',
        embeddingVector: Array(384).fill(0).map(() => Math.random()),
        lastSyncedAt: new Date()
      };
      
      // Upsert test profile
      await UserProfile.findOneAndUpdate(
        { userId: testUserId },
        testProfile,
        { upsert: true, new: true }
      );
      
      log('✅', 'UserProfile upserted to MongoDB');
      
      // Read it back
      const savedProfile = await UserProfile.findOne({ userId: testUserId });
      log('ℹ️', `Retrieved profile for user ${testUserId}`);
      log('ℹ️', `  Vibes: ${savedProfile.vibeWeights.size} vibes tracked`);
      log('ℹ️', `  Provinces: ${savedProfile.provinceWeights.size} provinces tracked`);
      log('ℹ️', `  Confidence: ${savedProfile.confidence}`);
      log('ℹ️', `  Travel style: ${savedProfile.travelStyle}`);
      
      // Cleanup test data
      await UserProfile.deleteOne({ userId: testUserId });
      log('ℹ️', 'Test profile cleaned up');
      
    } catch (error) {
      log('❌', `UserProfile test failed: ${error.message}`);
      throw error;
    }
    
    // =============================================
    // Test 10: End-to-End Pipeline (Mini Version)
    // =============================================
    logSection('Test 10: End-to-End Pipeline Simulation');
    
    try {
      log('ℹ️', 'Running mini pipeline simulation...');
      
      // Step 1: Create mock events
      const mockEvents = [
        {
          eventType: 'tour_view',
          userId: 'pipeline_test_user',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          vibes: ['beach', 'adventure', 'resort'],
          provinces: ['Khánh Hòa'],
          tourPrice: 2000000,
          tourDuration: 4
        },
        {
          eventType: 'tour_bookmark',
          userId: 'pipeline_test_user',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          vibes: ['beach', 'luxury'],
          provinces: ['Phú Quốc']
        },
        {
          eventType: 'blog_view',
          userId: 'pipeline_test_user',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          vibes: ['food', 'culture'],
          provinces: ['Đà Nẵng']
        }
      ];
      
      log('✅', `Step 1: Created ${mockEvents.length} mock events`);
      
      // Step 2: Aggregate
      const userProfiles = aggregator.aggregateByUser(mockEvents);
      const profile = userProfiles.get('pipeline_test_user');
      log('✅', `Step 2: Aggregated user profile`);
      log('ℹ️', `  Confidence: ${profile.confidence.toFixed(2)}`);
      
      // Step 3: Build weighted text
      const weightedText = aggregator.buildWeightedText(profile);
      log('✅', `Step 3: Built weighted text (${weightedText.split(' ').length} words)`);
      
      // Step 4: Generate embedding
      const embedResult = await embed([weightedText]);
      const embedding = embedResult.embeddings[0];
      log('✅', `Step 4: Generated embedding vector (${embedding.length} dims)`);
      
      // Step 5: Upsert to FAISS
      await upsert([{
        id: 'pipeline_test_user',
        type: 'user',
        text: weightedText,
        vector: embedding,
        metadata: {
          confidence: profile.confidence,
          travelStyle: profile.travelStyle
        }
      }]);
      log('✅', `Step 5: Upserted to FAISS`);
      
      // Step 6: Save to MongoDB
      const testUserId = new mongoose.Types.ObjectId();
      await UserProfile.findOneAndUpdate(
        { userId: testUserId },
        {
          userId: testUserId,
          vibeWeights: profile.vibeWeights,
          provinceWeights: profile.provinceWeights,
          eventCounts: profile.eventCounts,
          confidence: profile.confidence,
          travelStyle: profile.travelStyle,
          embeddingVector: embedding,
          lastSyncedAt: new Date()
        },
        { upsert: true, new: true }
      );
      log('✅', `Step 6: Saved to MongoDB`);
      
      // Cleanup
      await UserProfile.deleteOne({ userId: testUserId });
      
      log('🎉', 'End-to-end pipeline simulation PASSED!');
      
    } catch (error) {
      log('❌', `Pipeline simulation failed: ${error.message}`);
      throw error;
    }
    
    // =============================================
    // Summary
    // =============================================
    logSection('✅ All Tests Passed!');
    log('🎉', 'PostHog pipeline is ready for production');
    log('📋', 'Next steps:');
    log('  ', '1. Use the app to generate real events');
    log('  ', '2. Wait 24 hours for data collection');
    log('  ', '3. Run manual sync: node jobs/weeklyProfileSync.js');
    log('  ', '4. Check PostHog dashboard: https://app.posthog.com/events');
    
  } catch (error) {
    logSection('❌ Tests Failed');
    console.error(error);
    exitCode = 1;
  } finally {
    // Cleanup
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      log('ℹ️', 'MongoDB connection closed');
    }
    
    await posthogClient.shutdown();
    log('ℹ️', 'PostHog client shutdown');
  }
  
  process.exit(exitCode);
}

// Run tests
if (require.main === module) {
  runTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runTests };
