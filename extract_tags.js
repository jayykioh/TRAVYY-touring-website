const fs = require('fs');
const logger = require('./touring-be/utils/logger');
const zones = JSON.parse(fs.readFileSync('travelApp.zones.json'));
const tags = new Set();

zones.forEach(zone => {
  (zone.tags || []).forEach(tag => tags.add(tag));
});

const sortedTags = Array.from(tags).sort();

logger.info('=== ALL UNIQUE TAGS ===');
sortedTags.forEach(tag => logger.info(`- ${tag}`));
logger.info(`\nTotal: ${sortedTags.length} tags`);

// Output as JSON
logger.info('\n=== AS JSON ARRAY ===');
logger.info(JSON.stringify(sortedTags, null, 2));
