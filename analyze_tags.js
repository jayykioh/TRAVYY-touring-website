const fs = require('fs');
const logger = require('./touring-be/utils/logger');
const zones = JSON.parse(fs.readFileSync('travelApp.zones.json'));

// Count tag frequency
const tagFreq = {};
zones.forEach(zone => {
  (zone.tags || []).forEach(tag => {
    tagFreq[tag] = (tagFreq[tag] || 0) + 1;
  });
});

// Sort by frequency
const sortedByFreq = Object.entries(tagFreq)
  .sort(([, a], [, b]) => b - a)
  .map(([tag, count]) => ({ tag, count }));

logger.info('=== TAGS BY FREQUENCY ===');
sortedByFreq.forEach(({ tag, count }) => {
  logger.info(`${count.toString().padStart(3)} zones: ${tag}`);
});

logger.info('\n=== RECOMMENDED: TOP 15-18 TAGS (most used) ===');
const topTags = sortedByFreq.slice(0, 18).map(({ tag }) => tag);
logger.info(JSON.stringify(topTags, null, 2));
