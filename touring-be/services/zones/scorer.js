const { calculateSemanticMatch } = require('../ai/libs/keyword-matcher');

/**
 * Enhanced zone scorer with hard vibes boost
 */
function scoreZone(zone, vibes = [], rawText = '', avoidKeywords = []) {
  let score = 0;
  let reasons = [];
  
  const desc = (zone.description || zone.desc || '').toLowerCase();
  const name = zone.name.toLowerCase();
  const zoneTags = (zone.tags || []).map(t => t.toLowerCase());
  const zoneVibes = (zone.vibes || []).map(v => v.toLowerCase());
  
  // 1. Hard vibes match (STRONG boost)
  const hardVibeMatches = vibes.filter(v => {
    const vLower = v.toLowerCase();
    return zoneTags.includes(vLower) || 
           zoneVibes.includes(vLower) ||
           desc.includes(vLower) ||
           name.includes(vLower);
  });
  
  if (hardVibeMatches.length > 0) {
    const vibeScore = hardVibeMatches.length * 0.15; // 15% per match
    score += vibeScore;
    reasons.push(`${hardVibeMatches.length} vibe matches (+${(vibeScore * 100).toFixed(0)}%)`);
  }
  
  // 2. Avoid keywords (STRONG penalty)
  const avoidMatches = avoidKeywords.filter(av => {
    const avLower = av.toLowerCase();
    return desc.includes(avLower) || name.includes(avLower);
  });
  
  if (avoidMatches.length > 0) {
    const penalty = avoidMatches.length * 0.2; // -20% per avoid match
    score -= penalty;
    reasons.push(`${avoidMatches.length} avoid matches (-${(penalty * 100).toFixed(0)}%)`);
  }
  
  // 3. Semantic keywords from rawText
  const keywords = extractKeywords(rawText);
  const keywordMatches = keywords.filter(kw => 
    desc.includes(kw) || name.includes(kw)
  ).length;
  
  if (keywordMatches > 0) {
    const kwScore = keywordMatches * 0.05; // 5% per keyword
    score += kwScore;
    reasons.push(`${keywordMatches} keywords (+${(kwScore * 100).toFixed(0)}%)`);
  }
  
  // 4. Rating bonus
  if (zone.rating && zone.rating >= 4.0) {
    const ratingBonus = (zone.rating - 3.0) * 0.05; // Max +10% for 5.0 rating
    score += ratingBonus;
    reasons.push(`rating ${zone.rating} (+${(ratingBonus * 100).toFixed(0)}%)`);
  }
  
  // 5. Popular tags bonus
  const popularTags = ['beach', 'photo', 'nature', 'culture'];
  const popularMatches = zoneTags.filter(t => popularTags.includes(t)).length;
  if (popularMatches > 0) {
    score += popularMatches * 0.03;
  }
  
  return {
    score: Math.max(0, Math.min(1, score)), // Clamp 0-1
    reasons
  };
}

function extractKeywords(text) {
  const lower = text.toLowerCase();
  const keywords = [];
  
  // Vietnamese stopwords
  const stopwords = ['của', 'và', 'có', 'là', 'được', 'trong', 'để', 'cho', 'đi', 'với'];
  
  const words = lower
    .replace(/[^\wÀ-ỹ\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopwords.includes(w));
  
  return [...new Set(words)];
}

module.exports = { scoreZone };