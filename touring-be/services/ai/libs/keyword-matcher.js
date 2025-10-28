/**
 * Semantic keyword matching
 */

const SEMANTIC_GROUPS = {
  // Mountain/Nature
  mountain: ['núi', 'mountain', 'đồi', 'hill', 'peak', 'view', 'cảnh', 'tầm nhìn'],
  nature: ['thiên nhiên', 'nature', 'rừng', 'forest', 'cảnh đẹp'],
  
  // Culture
  culture: ['văn hóa', 'culture', 'lịch sử', 'history'],
  ancient: ['cổ kính', 'ancient', 'xưa', 'phố cổ'],
  temple: ['chùa', 'đền', 'miếu', 'pagoda', 'temple', 'tâm linh'],
  
  // Relax
  relax: ['nghỉ ngơi', 'thư giãn', 'relax', 'peaceful', 'yên tĩnh', 'quiet'],
  peaceful: ['bình yên', 'peaceful', 'thanh bình'],
  
  // Beach
  beach: ['biển', 'beach', 'bãi biển'],
  sunset: ['hoàng hôn', 'sunset', 'bình minh', 'sunrise'],
  swim: ['bơi', 'tắm biển', 'swimming'],
  
  // Food
  food: ['ẩm thực', 'món ăn', 'food', 'đặc sản'],
  seafood: ['hải sản', 'seafood', 'đồ biển'],
  cheap: ['rẻ', 'tiết kiệm', 'budget', 'cheap', 'bình dân'],
  
  // Photo
  photo: ['chụp ảnh', 'photo', 'sống ảo', 'check in', 'view', 'cảnh'],
  
  // Romantic
  romantic: ['lãng mạn', 'romantic', 'đèn lồng', 'lantern'],
  
  // Family
  family: ['gia đình', 'family', 'kids', 'children', 'trẻ em'],
  
  // Nightlife
  nightlife: ['nightlife', 'đêm', 'bar', 'club', 'pub'],
  
  // Shopping
  shopping: ['mua sắm', 'shopping', 'chợ', 'market']
};

/**
 * ✅ Extract flexible keywords from user text
 * Returns canonical group names (not all variations)
 */
function extractFlexibleKeywords(text) {
  const keywords = new Set();
  const lower = text.toLowerCase();
  
  // Check each semantic group
  for (const [group, terms] of Object.entries(SEMANTIC_GROUPS)) {
    for (const term of terms) {
      if (lower.includes(term)) {
        keywords.add(group); // Add canonical group name
        break; // One match per group is enough
      }
    }
  }
  
  return Array.from(keywords);
}

/**
 * Calculate semantic similarity between user text and zone keywords
 */
function calculateSemanticMatch(userText, zoneKeywords) {
  if (!zoneKeywords || zoneKeywords.length === 0) {
    return { score: 0, matches: [] };
  }
  
  const lower = userText.toLowerCase();
  let totalScore = 0;
  const matches = [];
  
  for (const keyword of zoneKeywords) {
    const score = scoreKeywordMatch(lower, keyword);
    if (score > 0) {
      totalScore += score;
      matches.push({ keyword, score });
    }
  }
  
  const finalScore = Math.min(totalScore / zoneKeywords.length, 1);
  
  return {
    score: Math.round(finalScore * 1000) / 1000,
    matches: matches.sort((a, b) => b.score - a.score)
  };
}

/**
 * Score a single keyword match
 */
function scoreKeywordMatch(userText, keyword) {
  const kw = keyword.toLowerCase();
  
  // 1. Exact match (1.0)
  if (userText.includes(kw)) {
    return 1.0;
  }
  
  // 2. Semantic group match (0.8)
  for (const [group, terms] of Object.entries(SEMANTIC_GROUPS)) {
    if (terms.includes(kw)) {
      for (const term of terms) {
        if (userText.includes(term)) {
          return 0.8;
        }
      }
    }
  }
  
  // 3. Partial match (0.5)
  const words = userText.split(/\s+/);
  for (const word of words) {
    if (word.length >= 3 && kw.length >= 3) {
      if (word.includes(kw) || kw.includes(word)) {
        return 0.5;
      }
    }
  }
  
  return 0;
}

module.exports = {
  extractFlexibleKeywords,  // ✅ MUST export this
  calculateSemanticMatch,
  scoreKeywordMatch,
  SEMANTIC_GROUPS
};