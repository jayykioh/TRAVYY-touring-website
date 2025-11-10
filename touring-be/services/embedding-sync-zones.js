const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({
  // .env nằm ở touring-be/.env
  path: path.join(__dirname, '..', '.env'),
});


const Zone = require('../models/Zones');

const EMBED_URL = 'http://localhost:8088';

async function syncZones() {
  try {
    console.log('🔄 Syncing zones to embedding service...\n');
    
    // Connect MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get all active zones
    const zones = await Zone.find({ isActive: true }).lean();
    console.log(`📦 Found ${zones.length} active zones\n`);
    
    if (zones.length === 0) {
      console.log('⚠️ No zones to sync');
      process.exit(0);
    }
    
    // Build embedding items
    const items = zones.map(zone => {
      // Combine zone info for rich semantic matching
      const textParts = [
        zone.name,
        zone.description || zone.desc || '',
        zone.highlights?.join(', ') || '',
        zone.tags?.join(', ') || '',
        zone.vibes?.join(', ') || '',
        zone.keywords?.join(', ') || '' // ✅ Include keywords
      ].filter(Boolean);
      
      // Limit text length (avoid too long embeddings)
      const fullText = textParts.join(' - ');
      const text = fullText.length > 500 ? fullText.substring(0, 500) + '...' : fullText;
      
      return {
        id: zone.id,
        type: 'zone',
        text: text,
        payload: {
          name: zone.name,
          province: zone.province,
          tags: zone.tags || [],
          vibes: zone.vibes || [],
          keywords: zone.keywords || [],
          rating: zone.rating || 0
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
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

syncZones();