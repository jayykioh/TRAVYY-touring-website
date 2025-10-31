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
  const zoneVibeKeywords = (zone.vibeKeywords || []).map(v => v.toLowerCase());
  const zoneAvoidTags = (zone.avoidTags || []).map(t => t.toLowerCase());
  const zoneAvoidKeywords = (zone.avoidKeywords || []).map(t => t.toLowerCase());
  const mustSee = (zone.mustSee || []).map(t => t.toLowerCase());
  const funActivities = (zone.funActivities || []).map(t => t.toLowerCase());
  const whyChoose = (zone.whyChoose || []).map(t => t.toLowerCase());
  const tips = (zone.tips || []).map(t => t.toLowerCase());
  const donts = (zone.donts || []).map(t => t.toLowerCase());

  // 1. Hard vibes match (STRONG boost)
  const hardVibeMatches = vibes.filter(v => {
    const vLower = v.toLowerCase();
    return zoneTags.includes(vLower) || 
           zoneVibes.includes(vLower) ||
           zoneVibeKeywords.includes(vLower) ||
           desc.includes(vLower) ||
           name.includes(vLower);
  });
  if (hardVibeMatches.length > 0) {
    const vibeScore = hardVibeMatches.length * 0.15; // 15% per match
    score += vibeScore;
    reasons.push(`${hardVibeMatches.length} vibe matches (+${(vibeScore * 100).toFixed(0)}%)`);
    console.log(`[SCORER] [${zone.name}] Vibe matches:`, hardVibeMatches, `(+${(vibeScore * 100).toFixed(0)}%)`);
  }

  // 2. Avoid keywords/tags (STRONG penalty)
  const avoidMatches = avoidKeywords.filter(av => {
    const avLower = av.toLowerCase();
    return desc.includes(avLower) ||
           name.includes(avLower) ||
           zoneAvoidTags.includes(avLower) ||
           zoneAvoidKeywords.includes(avLower) ||
           mustSee.includes(avLower) ||
           funActivities.includes(avLower) ||
           whyChoose.includes(avLower) ||
           tips.includes(avLower) ||
           donts.includes(avLower);
  });
  if (avoidMatches.length > 0) {
    const penalty = avoidMatches.length * 0.18; // -18% per avoid match (tuneable)
    score -= penalty;
    reasons.push(`${avoidMatches.length} avoid matches (-${(penalty * 100).toFixed(0)}%)`);
    console.log(`[SCORER] [${zone.name}] Avoid matches:`, avoidMatches, `(-${(penalty * 100).toFixed(0)}%)`);
  }

  // 3. Semantic keywords from rawText (match with all semantic fields)
  const keywords = extractKeywords(rawText);
  let keywordMatches = 0;
  let keywordAvoidMatches = 0;
  let matchedKeywords = [];
  let matchedAvoidKeywords = [];
  keywords.forEach(kw => {
    if (
      desc.includes(kw) ||
      name.includes(kw) ||
      zoneTags.includes(kw) ||
      zoneVibes.includes(kw) ||
      zoneVibeKeywords.includes(kw) ||
      mustSee.includes(kw) ||
      funActivities.includes(kw) ||
      whyChoose.includes(kw) ||
      tips.includes(kw) ||
      donts.includes(kw)
    ) {
      keywordMatches++;
      matchedKeywords.push(kw);
    }
    if (zoneAvoidTags.includes(kw) || zoneAvoidKeywords.includes(kw)) {
      keywordAvoidMatches++;
      matchedAvoidKeywords.push(kw);
    }
  });
  if (keywordMatches > 0) {
    const kwScore = keywordMatches * 0.045; // 4.5% per keyword
    score += kwScore;
    reasons.push(`${keywordMatches} keywords (+${(kwScore * 100).toFixed(0)}%)`);
    console.log(`[SCORER] [${zone.name}] Keyword matches:`, matchedKeywords, `(+${(kwScore * 100).toFixed(0)}%)`);
  }
  if (keywordAvoidMatches > 0) {
    const kwPenalty = keywordAvoidMatches * 0.12; // -12% per avoid-keyword match
    score -= kwPenalty;
    reasons.push(`${keywordAvoidMatches} avoid-keywords (-${(kwPenalty * 100).toFixed(0)}%)`);
    console.log(`[SCORER] [${zone.name}] Avoid-keyword matches:`, matchedAvoidKeywords, `(-${(kwPenalty * 100).toFixed(0)}%)`);
  }

  // 4. Rating bonus
  if (zone.rating && zone.rating >= 4.0) {
    const ratingBonus = (zone.rating - 3.0) * 0.05; // Max +10% for 5.0 rating
    score += ratingBonus;
    reasons.push(`rating ${zone.rating} (+${(ratingBonus * 100).toFixed(0)}%)`);
    console.log(`[SCORER] [${zone.name}] Rating bonus: +${(ratingBonus * 100).toFixed(0)}%`);
  }
  
  // 5. Popular tags bonus
  const popularTags = ['beach', 'photo', 'nature', 'culture'];
  const popularMatches = zoneTags.filter(t => popularTags.includes(t)).length;
  if (popularMatches > 0) {
    score += popularMatches * 0.03;
    console.log(`[SCORER] [${zone.name}] Popular tag matches:`, popularMatches, `(+${(popularMatches * 3)}%)`);
  }
  
  const finalScore = Math.max(0, Math.min(1, score));
  console.log(`[SCORER] [${zone.name}] Final ruleScore:`, finalScore, '| Reasons:', reasons);
  return {
    score: finalScore,
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