const fs = require('fs');
const zones = JSON.parse(fs.readFileSync('travelApp.zones.json'));
const tags = new Set();

zones.forEach(zone => {
  (zone.tags || []).forEach(tag => tags.add(tag));
});

const sortedTags = Array.from(tags).sort();

console.log('=== ALL UNIQUE TAGS ===');
sortedTags.forEach(tag => console.log(`- ${tag}`));
console.log(`\nTotal: ${sortedTags.length} tags`);

// Output as JSON
console.log('\n=== AS JSON ARRAY ===');
console.log(JSON.stringify(sortedTags, null, 2));
