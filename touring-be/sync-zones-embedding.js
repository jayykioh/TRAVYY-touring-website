// sync-zones-embedding.js
// Production script to upsert all zones to the embedding service with rich semantic fields

const mongoose = require('mongoose');
const fetch = require('node-fetch');
require('dotenv').config();

const Zone = require('./models/Zones');

const EMBED_URL = process.env.EMBED_SERVICE_URL || 'http://localhost:8088';

async function syncZones() {
  try {
    console.log('🔄 Syncing zones to embedding service (PRODUCTION)...\n');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const zones = await Zone.find({ isActive: true }).lean();
    console.log(`📦 Found ${zones.length} active zones\n`);
    if (zones.length === 0) {
      console.log('⚠️ No zones to sync');
      process.exit(0);
    }

    // Build embedding items with all relevant fields
    const items = zones.map(zone => {
      const textParts = [
        zone.name,
        zone.description || zone.desc || '',
        zone.highlights?.join(', ') || '',
        zone.tags?.join(', ') || '',
        zone.vibes?.join(', ') || '',
        zone.vibeKeywords?.join(', ') || '',
        zone.avoidTags?.join(', ') || '',
        zone.avoidKeywords?.join(', ') || '',
        zone.mustSee?.join(', ') || '',
        zone.funActivities?.join(', ') || '',
        zone.tips?.join(', ') || '',
        zone.donts?.join(', ') || '',
        zone.whyChoose?.join(', ') || '',
        zone.bestTime || ''
      ].filter(Boolean);
      return {
        id: zone.id,
        type: 'zone',
        text: textParts.join(' - ').substring(0, 800), // Longer limit for richer context
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
    console.log(`   "${items[0].text.substring(0, 200)}..."\n`);

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
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

syncZones();
