const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '..', '.env'),
});

const Zone = require('../models/Zones');
const { embed, upsert: upsertToFAISS } = require('./ai/libs/embedding-client');

const EMBED_URL = process.env.AI_EMBED_URL || 'https://ai-embed.travyytouring.page';

/**
 * Build rich semantic text for embedding.
 * Matches what was used to compute any cached vector.
 */
function buildSemanticText(zone) {
  const parts = [
    zone.name,
    zone.desc || '',
    zone.whyChoose?.join('. ') || '',
    zone.funActivities?.join(', ') || '',
    zone.mustSee?.join(', ') || '',
    zone.tags?.join(', ') || '',
    zone.vibeKeywords?.join(', ') || '',
    zone.tips?.join('. ') || '',
  ].filter(Boolean);

  const full = parts.join(' - ');
  return full.length > 1000 ? full.substring(0, 1000) + '...' : full;
}

async function syncZones(isAutomatic = false) {
  try {
    console.log('🔄 Syncing zones to embedding service...\n');

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ Connected to MongoDB');
    } else {
      console.log('ℹ️  MongoDB already connected');
    }

    // Load zones INCLUDING cached embedding (normally excluded via select:false)
    const zones = await Zone.find({ isActive: true })
      .select('+embedding +embeddingText')
      .lean();
    console.log(`📦 Found ${zones.length} active zones`);

    if (zones.length === 0) {
      console.log('⚠️ No zones to sync');
      if (!isAutomatic) process.exit(0);
      return;
    }

    // --- Partition: use cached vector vs call HF API ---
    const needEmbed = [];
    const hasCached = [];

    for (const zone of zones) {
      const text = buildSemanticText(zone);
      zone._semanticText = text;
      if (zone.embedding?.length > 0 && zone.embeddingText === text) {
        hasCached.push(zone);
      } else {
        needEmbed.push(zone);
      }
    }

    console.log(`   💾 Cached vectors: ${hasCached.length}`);
    console.log(`   🌐 Need HF embed: ${needEmbed.length}`);

    // --- Call HF API only for zones without a valid cache ---
    if (needEmbed.length > 0) {
      const texts = needEmbed.map(z => z._semanticText);
      console.log(`📡 Calling HF Inference API for ${texts.length} zones...`);

      // embed() calls ai-embed /embed → HF API
      const embedResult = await embed(texts);
      const vectors = embedResult.vectors;

      if (!vectors || vectors.length !== texts.length) {
        throw new Error(`Embed returned ${vectors?.length} vectors for ${texts.length} texts`);
      }

      // Store new vectors in MongoDB (select:false fields need explicit $set)
      const bulkOps = needEmbed.map((zone, i) => ({
        updateOne: {
          filter: { _id: zone._id },
          update: {
            $set: {
              embedding: vectors[i],
              embeddingText: zone._semanticText,
            },
          },
        },
      }));
      await Zone.bulkWrite(bulkOps);
      console.log(`✅ Stored ${needEmbed.length} new vectors in MongoDB`);

      // Update in-memory so items array below uses them
      needEmbed.forEach((zone, i) => {
        zone.embedding = vectors[i];
      });
    }

    // --- Build upsert items with pre-computed vectors ---
    const allZones = [...hasCached, ...needEmbed];
    const items = allZones.map(zone => ({
      id: zone.id,
      type: 'zone',
      text: zone._semanticText,
      vector: zone.embedding,  // ai-embed uses this directly, no HF API call
      payload: {
        name: zone.name,
        province: zone.province,
        tags: zone.tags || [],
        vibes: zone.vibeKeywords || [],
        rating: zone.rating || 0,
        bestTime: zone.bestTime || 'anytime',
        center: zone.center ? { lat: zone.center.lat, lng: zone.center.lng } : null,
      },
    }));

    console.log(`\n📤 Upserting ${items.length} items to FAISS (all pre-computed)...`);
    const upsertResult = await upsertToFAISS(items);
    console.log('✅ Upsert complete:', upsertResult);

    // Verify index
    const healthRes = await fetch(`${EMBED_URL}/healthz`);
    const healthData = await healthRes.json();
    console.log('📊 Index status:', {
      vectors: healthData.vectors,
      ready: healthData.ready,
    });

    console.log('\n✅ Sync complete!');
    if (!isAutomatic) process.exit(0);
  } catch (error) {
    console.error('\n❌ Sync error:', error.message);
    if (!isAutomatic) process.exit(1);
    throw error;
  }
}

module.exports = { syncZones };

if (require.main === module) {
  syncZones(false);
}
