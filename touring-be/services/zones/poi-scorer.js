/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  
  const toRad = (deg) => deg * (Math.PI / 180);
  
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

/**
 * Score a POI based on zone, vibes, distance, and optional user location
 * @param {Object} poi - POI object { name, types, loc: {lat, lng}, rating }
 * @param {Object} zone - Zone object { center: {lat, lng}, vibeKeywords }
 * @param {Array} vibes - User preferences ['beach', 'food', ...]
 * @param {Object} userLocation - Optional user location {lat, lng}
 * @returns {Object} { matchScore, distanceKm, reasons }
 */
function scorePOI(poi, zone, vibes = [], userLocation = null) {
  // Validate inputs
  if (!poi || !poi.loc || !zone || !zone.center) {
    return {
      matchScore: 0,
      distanceKm: 999,
      reasons: ['invalid data']
    };
  }
  
  let score = 0.5; // Base score
  const reasons = [];
  
  // 1. Distance score from zone center (closer = better, max 5km)
  const distanceKm = calculateDistance(
    zone.center.lat,
    zone.center.lng,
    poi.loc.lat,
    poi.loc.lng
  );
  
  const distanceScore = Math.max(0, 1 - (distanceKm / 5));
  score += distanceScore * 0.3;
  
  if (distanceKm < 1) {
    reasons.push('very close to zone center');
  } else if (distanceKm < 3) {
    reasons.push('close to zone center');
  }
  
  // 1b. Additional proximity score if user location provided
  let userDistanceKm = null;
  let proximityBonus = 0;
  
  if (userLocation && userLocation.lat && userLocation.lng) {
    userDistanceKm = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      poi.loc.lat,
      poi.loc.lng
    );
    
    // Bonus for POIs close to user (within 2km)
    if (userDistanceKm < 0.5) {
      proximityBonus = 0.15;
      score += proximityBonus;
      reasons.push(`📍 very close to you (${userDistanceKm.toFixed(2)}km)`);
    } else if (userDistanceKm < 1) {
      proximityBonus = 0.10;
      score += proximityBonus;
      reasons.push(`📍 close to you (${userDistanceKm.toFixed(2)}km)`);
    } else if (userDistanceKm < 2) {
      proximityBonus = 0.05;
      score += proximityBonus;
      reasons.push(`📍 nearby (${userDistanceKm.toFixed(2)}km)`);
    }
  }
  
  // 2. Vibe match score
  const poiTypes = Array.isArray(poi.types) 
    ? poi.types.map(t => String(t || '').toLowerCase()) 
    : [];
  
  const poiName = String(poi.name || '').toLowerCase();
  
  const zoneKeywords = Array.isArray(zone.vibeKeywords)
    ? zone.vibeKeywords.map(k => String(k || '').toLowerCase())
    : [];
  
  let vibeMatches = 0;
  
  if (vibes && vibes.length > 0) {
    for (const vibe of vibes) {
      const vibeLower = String(vibe || '').toLowerCase();
      
      if (!vibeLower) continue;
      
      // Check POI types
      if (poiTypes.some(type => type.includes(vibeLower) || vibeLower.includes(type))) {
        vibeMatches++;
        reasons.push(`matches ${vibe}`);
      }
      
      // Check POI name
      if (poiName.includes(vibeLower)) {
        vibeMatches += 0.5;
        if (!reasons.includes(`matches ${vibe}`)) {
          reasons.push(`${vibe} in name`);
        }
      }
      
      // Check zone keywords
      const keywordMatch = zoneKeywords.some(kw => 
        poiName.includes(kw) || poiTypes.some(t => t.includes(kw))
      );
      
      if (keywordMatch) {
        vibeMatches += 0.3;
      }
    }
    
    // Add vibe match bonus
    if (vibeMatches > 0) {
      const vibeBonus = Math.min(vibeMatches / vibes.length, 1) * 0.4;
      score += vibeBonus;
    }
  }
  
  // 3. Rating bonus
  const rating = parseFloat(poi.rating);
  if (!isNaN(rating)) {
    if (rating >= 4.5) {
      score += 0.15;
      reasons.push('excellent rating');
    } else if (rating >= 4) {
      score += 0.1;
      reasons.push('high rating');
    } else if (rating >= 3.5) {
      score += 0.05;
      reasons.push('good rating');
    }
  }
  
  // 4. Popular types bonus
  const popularTypes = ['tourist_attraction', 'restaurant', 'cafe', 'beach', 'park', 'museum'];
  const hasPopularType = poiTypes.some(type => 
    popularTypes.some(popular => type.includes(popular))
  );
  
  if (hasPopularType) {
    score += 0.05;
  }
  
  // Normalize score to 0-1
  score = Math.min(Math.max(score, 0), 1);
  
  return {
    matchScore: parseFloat(score.toFixed(3)),
    distanceKm: parseFloat(distanceKm.toFixed(2)),
    userDistanceKm: userDistanceKm ? parseFloat(userDistanceKm.toFixed(2)) : null,
    reasons: reasons.length > 0 ? reasons : ['generic match']
  };
}

module.exports = {
  scorePOI
};