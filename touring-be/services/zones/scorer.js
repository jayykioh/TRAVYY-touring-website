const { calculateSemanticMatch } = require('../ai/libs/keyword-matcher');

/**
 * scoreZone now accepts the full prefs object so we can use:
 * - prefs.vibes (array)
 * - prefs.avoid (array)
 * - prefs.keywords (array) from LLM/heuristic
 * - prefs._rawText (string)
 */
function scoreZone(zone, prefs = {}) {
  const vibes = Array.isArray(prefs.vibes) ? prefs.vibes : [];
  const avoidList = Array.isArray(prefs.avoid) ? prefs.avoid : [];
  const lmKeywords = Array.isArray(prefs.keywords) ? prefs.keywords : [];
  const rawText = prefs._rawText || '';

  let score = 0;
  const reasons = [];

  const desc = (zone.description || zone.desc || '').toLowerCase();
  const name = (zone.name || '').toLowerCase();
  const zoneTags = (zone.tags || []).map(t => (t || '').toLowerCase());
  const zoneVibes = (zone.vibes || []).map(v => (v || '').toLowerCase());

  // 1) Vibe matches (strong boost) - list which vibes matched
  const matchedVibes = [];
  for (const v of vibes) {
    const vl = v.toLowerCase();
    if (zoneTags.includes(vl) || zoneVibes.includes(vl) || desc.includes(vl) || name.includes(vl)) {
      matchedVibes.push(vl);
    }
  }
  if (matchedVibes.length > 0) {
    const vibeScore = Math.min(0.6, matchedVibes.length * 0.15); // cap
    score += vibeScore;
    reasons.push(`${matchedVibes.length} vibe matches (+${(vibeScore * 100).toFixed(0)}%): ${matchedVibes.join(', ')}`);
  }

  // 2) Avoid matches (strong penalty) - supports both simple avoids and avoid-as-tag
  const matchedAvoids = [];
  for (const av of avoidList) {
    const avl = av.toLowerCase();
    if (desc.includes(avl) || name.includes(avl) || zoneTags.includes(avl)) matchedAvoids.push(avl);
  }
  if (matchedAvoids.length > 0) {
    const penalty = Math.min(0.8, matchedAvoids.length * 0.2);
    score -= penalty;
    reasons.push(`${matchedAvoids.length} avoid matches (-${(penalty * 100).toFixed(0)}%): ${matchedAvoids.join(', ')}`);
  }

  // 3) Keyword matches: combine LLM keywords + extracted words from rawText
  const extracted = extractKeywords(rawText);
  const combinedKeywords = [...new Set([...(lmKeywords || []), ...extracted])].map(k => k.toLowerCase());
  const matchedKeywords = combinedKeywords.filter(kw => desc.includes(kw) || name.includes(kw) || zoneTags.includes(kw));
  if (matchedKeywords.length > 0) {
    const kwScore = Math.min(0.4, matchedKeywords.length * 0.05);
    score += kwScore;
    reasons.push(`${matchedKeywords.length} keyword matches (+${(kwScore * 100).toFixed(0)}%): ${matchedKeywords.slice(0,6).join(', ')}`);
  }

  // 4) Semantic category match (optional deeper match)
  try {
    // calculateSemanticMatch expects (userText, zoneKeywords)
    const zoneKeywords = zone.keywords || zone.payload?.keywords || zone.tags || [];
    const sem = calculateSemanticMatch(rawText, zoneKeywords);
    const semScore = sem?.score || (typeof sem === 'number' ? sem : 0);
    if (semScore && semScore > 0) {
      // small boost proportional to semantic confidence
      const normalized = Math.min(0.2, semScore * 0.2);
      score += normalized;
      if (normalized > 0) reasons.push(`semantic match (+${(normalized * 100).toFixed(0)}%)`);
    }
  } catch (e) {
    // fail silently; calculateSemanticMatch is best-effort
  }

  // 5) Rating bonus
  if (zone.rating && zone.rating >= 4.0) {
    const ratingBonus = Math.min(0.1, (zone.rating - 3.0) * 0.05);
    score += ratingBonus;
    reasons.push(`rating ${zone.rating} (+${(ratingBonus * 100).toFixed(0)}%)`);
  }

  // 6) Popular tags small bonus
  const popularTags = ['beach', 'photo', 'nature', 'culture'];
  const popularMatches = zoneTags.filter(t => popularTags.includes(t)).length;
  if (popularMatches > 0) score += popularMatches * 0.03;

  // Final clamp 0..1
  const final = Math.max(0, Math.min(1, score));

  return {
    score: final,
    reasons,
    details: {
      matchedVibes,
      matchedAvoids,
      matchedKeywords
    }
  };
}

function extractKeywords(text) {
  if (!text || typeof text !== 'string') return [];
  const lower = text.toLowerCase();
  
  // Vietnamese stopwords (extend as needed)
  const stopwords = ['của', 'và', 'có', 'là', 'được', 'trong', 'để', 'cho', 'đi', 'với', 'một', 'và', 'nhưng'];
  
  const words = lower
    .replace(/[^\wÀ-ỹ\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopwords.includes(w));
  
  return [...new Set(words)];
}

module.exports = { scoreZone };