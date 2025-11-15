
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate two components of contextual score:
 * 1. hardVibeScore: percentage of user's hardVibes that match zone.vibeKeywords (0-1)
 * 2. contextScore: avoid penalties + proximity bonuses (0-1)
 * 
 * Formula in matcher.js: finalScore = (hardVibeScore × 0.6) + (embedScore × 0.4)
 * 
 * Input:
 *   - prefs.vibes: array of hardVibes selected by user
 *   - prefs.freeText: optional text input (for avoid keyword matching)
 *   - userLocation: optional GPS location
 * 
 * Output:
 *   - hardVibeScore: 0-1 (match percentage)
 *   - contextScore: 0-1 (avoid + proximity)
 *   - reasons: explanation of scoring
 */
function scoreZone(zone, prefs = {}, userLocation = null) {
  const hardVibes = Array.isArray(prefs.vibes) ? prefs.vibes : [];
  const freeText = (prefs.freeText || '').toLowerCase();
  
  const reasons = [];

  // ========================================
  // 1️⃣ HARDVIBE SCORE (Match %)
  // ========================================
  // Check how many of user's hardVibes match zone.tags
  
  const zoneTags = (zone.tags || []).map(t => t.toLowerCase());
  
  let matchedHardVibes = 0;
  
  if (hardVibes.length > 0) {
    for (const userVibe of hardVibes) {
      const userVibeLower = userVibe.toLowerCase();
      
      // Check if zone has this tag (exact match)
      const isMatch = zoneTags.includes(userVibeLower);
      
      if (isMatch) {
        matchedHardVibes++;
      }
    }
  }
  
  // hardVibeScore = percentage of hardvibes matched (0-1)
  const hardVibeScore = hardVibes.length > 0 
    ? matchedHardVibes / hardVibes.length
    : 0;
  
  if (hardVibes.length > 0) {
    reasons.push(`🔥 HardVibe match: ${matchedHardVibes}/${hardVibes.length} (${(hardVibeScore * 100).toFixed(0)}%)`);
  }

  // ========================================
  // 2️⃣ CONTEXT SCORE (Avoid + Proximity)
  // ========================================
  
  let contextScore = 0;
  const zoneAvoidKeywords = (zone.avoidKeywords || []).map(a => a.toLowerCase());
  
  // A) Avoid keyword match (penalty)
  if (freeText.length > 0) {
    const matchedAvoids = zoneAvoidKeywords.filter(avoid => 
      freeText.includes(avoid)
    );
    
    if (matchedAvoids.length > 0) {
      const avoidPenalty = Math.min(0.3, matchedAvoids.length * 0.15);
      contextScore -= avoidPenalty;
      reasons.push(`❌ Avoid match: ${matchedAvoids.join(', ')} (-${(avoidPenalty * 100).toFixed(0)}%)`);
    }
  }
  
  // B) Proximity bonus (if user location provided)
  let proximityScore = 0;
  let distanceKm = null;
  
  if (userLocation?.lat && userLocation?.lng && zone.center?.lat && zone.center?.lng) {
    distanceKm = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      zone.center.lat,
      zone.center.lng
    );
    
    // Proximity scoring:
    // - Within 50km: +0.25 bonus (very close) - increased from +0.15
    // - Within 100km: +0.15 bonus (close) - increased from +0.10
    // - Within 200km: +0.08 bonus (nearby) - increased from +0.05
    // - Beyond 200km: no bonus
    if (distanceKm < 50) {
      proximityScore = 0.25;
      reasons.push(`📍 Very close (${distanceKm.toFixed(0)}km) (+25%)`);
    } else if (distanceKm < 100) {
      proximityScore = 0.15;
      reasons.push(`📍 Close (${distanceKm.toFixed(0)}km) (+15%)`);
    } else if (distanceKm < 200) {
      proximityScore = 0.08;
      reasons.push(`📍 Nearby (${distanceKm.toFixed(0)}km) (+8%)`);
    }
    
    contextScore += proximityScore;
  }
  
  // Clamp contextScore to 0-1
  const finalContextScore = Math.max(0, Math.min(1, contextScore));

  return {
    hardVibeScore,        // Main score (0-1): % of hardvibes matched
    contextScore: finalContextScore,  // Context score (0-1): avoid + proximity
    proximityScore,       // Breakdown
    distanceKm,           // Breakdown
    reasons,              // Explanation
    details: {
      matchedHardVibes,
      zoneTags,
      userLocation: userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : null,
      zoneCenter: zone.center ? `${zone.center.lat.toFixed(4)}, ${zone.center.lng.toFixed(4)}` : null
    }
  };
}

module.exports = { scoreZone };