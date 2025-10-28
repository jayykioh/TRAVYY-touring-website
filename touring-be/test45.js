const mongoose = require('mongoose');
const fetch = require('node-fetch'); // ✅ Add this!
require('dotenv').config();

const Zone = require('../touring-be/models/Zones');

const EMBED_URL = process.env.EMBED_SERVICE_URL || 'http://localhost:8088';

async function syncZones() {
  try {
    console.log('🔄 Syncing zones to embedding service...\n');
    
    // Connect MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get all zones
    const zones = await Zone.find({ isActive: true }).lean();
    console.log(`📦 Found ${zones.length} active zones\n`);
    
    if (zones.length === 0) {
      console.log('⚠️ No zones to sync');
      process.exit(0);
    }
    
    // Build embedding items
    const items = zones.map(zone => {
      // Combine zone info for better semantic matching
      const textParts = [
        zone.name,
        zone.description || zone.desc || '',
        zone.highlights?.join(', ') || '',
        zone.tags?.join(', ') || '',
        zone.vibes?.join(', ') || ''
      ].filter(Boolean);
      
      return {
        id: zone.id,
        type: 'zone',
        text: textParts.join(' - ').substring(0, 500), // Limit length
        payload: {
          name: zone.name,
          province: zone.province,
          tags: zone.tags || [],
          vibes: zone.vibes || [],
          rating: zone.rating || 0
        }
      };
    });
    
    console.log('📝 Sample embedding text:');
    console.log(`   "${items[0].text.substring(0, 120)}..."\n`);
    
    // Upsert to embedding service
    console.log('📤 Upserting to embedding service...');
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
    
    // Verify
    console.log('\n📊 Verifying index...');
    const health = await fetch(`${EMBED_URL}/healthz`).then(r => r.json());
    console.log('✅ Index status:', {
      vectors: health.vectors,
      metadata: health.metadata,
      model: health.model
    });
    
    // Test search
    console.log('\n🧪 Testing search with sample query...');
    const testRes = await fetch(`${EMBED_URL}/hybrid-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        free_text: 'biển đẹp lãng mạn ngắm hoàng hôn',
        vibes: ['beach', 'romantic', 'sunset'],
        top_k: 3,
        filter_type: 'zone'
      })
    });
    
    if (testRes.ok) {
      const testResult = await testRes.json();
      console.log('✅ Test search results:', {
        hits: testResult.hits?.length,
        strategy: testResult.strategy,
        top3: testResult.hits?.slice(0, 3).map(h => ({
          name: h.payload?.name,
          score: h.score.toFixed(2)
        }))
      });
    }
    
    console.log('\n✅ Sync complete!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

syncZones();