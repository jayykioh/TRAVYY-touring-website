const POI_CATEGORIES = {
  views: {
    label: 'Điểm tham quan',
    labelEn: 'Views & Landmarks',
    icon: '📸',
    query: 'điểm tham quan',
    vibes: ['photo', 'sunset', 'nature'],
    priority: 1,
  },
  
  beach: {
    label: 'Biển, Đảo & Thiên nhiên',
    labelEn: 'Beach, Island & Nature',
    icon: '🏖️',
    queries: ['bãi biển', 'thiên nhiên'],
    vibes: ['beach', 'island', 'relaxation', 'nature', 'adventure', 'hiking'],
    priority: 2,
  },

  food: {
    label: 'Ẩm thực & Cafe',
    labelEn: 'Food, Dining & Cafe',
    icon: '🍜',
    queries: ['cafe', 'nhà hàng'],
    queryLimit: [4, 3], // 4 cafes, 3 restaurants
    vibes: ['food', 'local', 'cafe', 'coffee', 'drink', 'cà phê'],
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
  tour: {
    label: 'Tour',
    labelEn: 'Tours',
    icon: '🚌',
    query: 'tour du lịch',
    vibes: ['tour', 'travel', 'package'],
    priority: 8,
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