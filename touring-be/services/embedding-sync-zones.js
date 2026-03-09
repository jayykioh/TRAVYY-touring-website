const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '..', '.env'),
});


const Zone = require('../models/Zones');

const EMBED_URL = process.env.AI_EMBED_URL || 'https://ai-embed.travyytouring.page';

async function syncZones(isAutomatic = false) {
  try {
    console.log('🔄 Syncing zones to embedding service...\n');
    
    // Connect MongoDB only if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ Connected to MongoDB');
    } else {
      console.log('ℹ️ MongoDB already connected (reusing existing connection)');
    }
    
    // Get all active zones
    const zones = await Zone.find({ isActive: true }).lean();
    console.log(`📦 Found ${zones.length} active zones\n`);
    
    if (zones.length === 0) {
      console.log('⚠️ No zones to sync');
      process.exit(0);
    }
    
    // Build embedding items with RICH semantic text
    const items = zones.map(zone => {
      // ✅ COMPREHENSIVE semantic text for better matching
      const textParts = [
        zone.name,
        zone.desc || '',
        zone.whyChoose?.join('. ') || '',
        zone.funActivities?.join(', ') || '',
        zone.mustSee?.join(', ') || '',
        zone.tags?.join(', ') || '',
        zone.vibeKeywords?.join(', ') || '',
        zone.tips?.join('. ') || ''
      ].filter(Boolean);
      
      // Limit text length (avoid too long embeddings)
      const fullText = textParts.join(' - ');
      const text = fullText.length > 1000 ? fullText.substring(0, 1000) + '...' : fullText;
      
      return {
        id: zone.id,
        type: 'zone',
        text: text,
        payload: {
          name: zone.name,
          province: zone.province,
          tags: zone.tags || [],
          vibes: zone.vibeKeywords || [],
          rating: zone.rating || 0,
          bestTime: zone.bestTime || 'anytime',
          // ✅ Include coordinates for filtering in Python
          center: zone.center ? {
            lat: zone.center.lat,
            lng: zone.center.lng
          } : null
        }
      };
    });
    
    console.log('📝 Sample embedding text:');
    console.log(`   "${items[0].text.substring(0, 150)}..."\n`);
    
    // Upsert to embedding service
    console.log('📤 Upserting to embedding service...');
    console.log(`   URL: ${EMBED_URL}/upsert`);
    console.log(`   Items: ${items.length}\n`);
    
    const res = await fetch(`${EMBED_URL}/upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    
    const result = await res.json();
    console.log('✅ Upsert complete:', {
      added: result.added,
      removed: result.removed,
      total: result.total
    });
    
    // Verify index
    console.log('\n📊 Verifying index...');
    const healthRes = await fetch(`${EMBED_URL}/healthz`);
    const health = await healthRes.json();
    console.log('✅ Index status:', {
      vectors: health.vectors,
      metadata: health.metadata,
      model: health.model
    });
    
    // Test hybrid search
    console.log('\n🧪 Testing hybrid search...');
    const testRes = await fetch(`${EMBED_URL}/hybrid-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        free_text: 'văn hóa lịch sử yên tĩnh',
        vibes: ['culture', 'nature', 'relax'],
        top_k: 5,
        filter_type: 'zone'
      })
    });
    
    if (testRes.ok) {
      const testResult = await testRes.json();
      console.log('✅ Test search results:', {
        hits: testResult.hits?.length || 0,
        strategy: testResult.strategy,
        top3: testResult.hits?.slice(0, 3).map(h => ({
          name: h.payload?.name,
          score: h.score.toFixed(2),
          vibeMatches: h.vibe_matches
        }))
      });
    } else {
      console.warn('⚠️ Test search failed:', testRes.status);
    }
    
    console.log('\n✅ Sync complete!');
    if (!isAutomatic) {
      process.exit(0);
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    if (!isAutomatic) {
      process.exit(1);
    }
  }
}

// Export for use in server.js
module.exports = { syncZones };

// Run as CLI script if called directly
if (require.main === module) {
  syncZones(false);
}