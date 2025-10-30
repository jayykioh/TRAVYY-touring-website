const POI_CATEGORIES = {
  views: {
    label: 'Điểm tham quan',
    labelEn: 'Views & Landmarks',
    icon: '📸',
    // ✅ Just use main keyword (Map4D will return relevant results)
    query: 'điểm tham quan',
    vibes: ['photo', 'sunset', 'nature'],
    priority: 1,
  },
  
  beach: {
    label: 'Biển & Đảo',
    labelEn: 'Beach & Island',
    icon: '🏖️',
    query: 'bãi biển',
    vibes: ['beach', 'island', 'relaxation'],
    priority: 2,
  },
  
  nature: {
    label: 'Thiên nhiên',
    labelEn: 'Nature & Outdoor',
    icon: '🌳',
    query: 'thiên nhiên',
    vibes: ['nature', 'adventure', 'hiking'],
    priority: 3,
  },

  food: {
    label: 'Ẩm thực',
    labelEn: 'Food & Dining',
    icon: '🍜',
    query: 'nhà hàng',
    vibes: ['food', 'local'],
    priority: 4,
    lazy: true,
  },
  
  culture: {
    label: 'Văn hóa',
    labelEn: 'Culture & History',
    icon: '🏛️',
    query: 'chùa',
    vibes: ['culture', 'history', 'spiritual'],
    priority: 5,
    lazy: true,
  },
  
  shopping: {
    label: 'Mua sắm',
    labelEn: 'Shopping & Markets',
    icon: '🛍️',
    query: 'chợ',
    vibes: ['shopping', 'local'],
    priority: 6,
    lazy: true,
  },
  
  nightlife: {
    label: 'Giải trí',
    labelEn: 'Nightlife & Entertainment',
    icon: '🌃',
    query: 'bar',
    vibes: ['nightlife', 'party'],
    priority: 7,
    lazy: true,
  },
};

function getPriorityCategories() {
  return Object.entries(POI_CATEGORIES)
    .filter(([_, cat]) => !cat.lazy)
    .sort((a, b) => a[1].priority - b[1].priority)
    .map(([key, cat]) => ({ key, ...cat }));
}

/**
 * Get lazy categories (load on demand)
 */
function getLazyCategories() {
  return Object.entries(POI_CATEGORIES)
    .filter(([_, cat]) => cat.lazy)
    .sort((a, b) => a[1].priority - b[1].priority)
    .map(([key, cat]) => ({ key, ...cat }));
}

/**
 * Get all category keys
 */
function getAllCategoryKeys() {
  return Object.keys(POI_CATEGORIES);
}

/**
 * Get category by vibes
 */
function getCategoryByVibes(vibes = []) {
  const vibeSet = new Set(vibes);
  
  let bestMatch = null;
  let maxOverlap = 0;
  
  for (const [key, cat] of Object.entries(POI_CATEGORIES)) {
    const overlap = cat.vibes.filter(v => vibeSet.has(v)).length;
    if (overlap > maxOverlap) {
      maxOverlap = overlap;
      bestMatch = { key, ...cat };
    }
  }
  
  return bestMatch || { key: 'views', ...POI_CATEGORIES.views };
}

module.exports = {
  POI_CATEGORIES,
  getPriorityCategories,
  getLazyCategories,
  getAllCategoryKeys,
  getCategoryByVibes,
};