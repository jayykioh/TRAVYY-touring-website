const { EVENT_WEIGHTS, TIME_DECAY_DAYS } = require('../../config/posthog.config');

/**
 * Vietnamese → English vibe mapping (match database tags)
 * Database tags: photo, nature, local, history, culture, food, beach, temple, sunset, view, architecture, nightlife, adventure, market, shopping, cave
 */
const VIBE_MAPPING = {
  'Văn hóa': 'culture',
  'Lịch sử': 'history',
  'Mạo hiểm': 'adventure',
  'Khám phá': 'adventure',
  'Thiên nhiên': 'nature',
  'Tự nhiên': 'nature',
  'Ẩm thực': 'food',
  'Biển': 'beach',
  'Bãi biển': 'beach',
  'Núi': 'mountain',
  'Thư giãn': 'relaxation',
  'Nghỉ dưỡng': 'relaxation',
  'Tâm linh': 'temple',
  'Chùa': 'temple',
  'Nhiếp ảnh': 'photo',
  'Chụp ảnh': 'photo',
  'Mua sắm': 'shopping',
  'Chợ': 'market',
  'Bản địa': 'local',
  'Cảnh đẹp': 'view',
  'Hoàng hôn': 'sunset',
  'Kiến trúc': 'architecture',
  'Nightlife': 'nightlife',
  'Hang động': 'cave'
};

/**
 * Aggregate events per user with weighted scoring
 * Similar to Facebook/TikTok recommendation aggregation
 */
class EventAggregator {
  /**
   * Group events by user and calculate weighted vibes
   * @param {Array} events - Array of transformed events
   * @returns {Map} Map of userId → aggregated profile
   */
  aggregateByUser(events) {
    console.log(`🔄 Aggregating ${events.length} events...`);
    
    const userProfiles = new Map();
    
    for (const event of events) {
      const userId = event.userId;
      
      // Skip invalid user IDs
      if (!userId || userId === 'anonymous' || userId === 'null') {
        continue;
      }
      
      // Initialize user profile if not exists
      if (!userProfiles.has(userId)) {
        userProfiles.set(userId, {
          userId,
          vibeWeights: {},
          provinceWeights: {},
          totalEvents: 0,
          totalWeight: 0,
          eventCounts: {},
          interactionTexts: [], // NEW: For building freeText
          lastEventAt: event.timestamp,
          firstEventAt: event.timestamp
        });
      }
      
      const profile = userProfiles.get(userId);
      
      // Get event weight
      const baseWeight = EVENT_WEIGHTS[event.eventType] || 0.5;
      
      // Apply time decay (recent events more important)
      const daysSinceEvent = (Date.now() - new Date(event.timestamp)) / (1000 * 60 * 60 * 24);
      const decayFactor = Math.exp(-daysSinceEvent / TIME_DECAY_DAYS);
      let finalWeight = baseWeight * decayFactor;
      
      // Apply duration boost (engagement multiplier)
      if (event.duration > 30000) { // > 30 seconds
        const durationBoost = Math.min(event.duration / 60000, 3); // Max 3x boost
        finalWeight *= (1 + durationBoost * 0.1);
      }
      
      // Apply price boost for bookings (higher price = stronger signal)
      if (event.totalPrice && event.totalPrice > 0) {
        const priceBoost = Math.min(event.totalPrice / 1000000, 2); // Max 2x boost
        finalWeight *= (1 + priceBoost * 0.2);
      }
      
      // Update vibe weights (map Vietnamese → English)
      if (event.vibes && Array.isArray(event.vibes) && event.vibes.length > 0) {
        for (const vibe of event.vibes) {
          if (vibe && typeof vibe === 'string') {
            // Skip PostHog system properties (start with $)
            if (vibe.startsWith('$')) {
              continue;
            }
            
            // Map Vietnamese to English database tags
            let mappedVibe = VIBE_MAPPING[vibe] || vibe.toLowerCase();
            // Sanitize: remove MongoDB special characters ($, .) and trim spaces
            mappedVibe = mappedVibe.replace(/[$.]/g, '_').trim();
            
            if (mappedVibe && !mappedVibe.startsWith('_')) { // Skip empty or _-only keys
              profile.vibeWeights[mappedVibe] = (profile.vibeWeights[mappedVibe] || 0) + finalWeight;
            }
          }
        }
      }
      
      // Build interaction text for freeText summary
      const props = event.properties || {};
      if (event.eventType === 'tour_view' && props.tourName) {
        profile.interactionTexts.push(`xem tour ${props.tourName}`);
      } else if (event.eventType === 'tour_bookmark' && props.tourName) {
        profile.interactionTexts.push(`lưu tour ${props.tourName}`);
      } else if (event.eventType === 'tour_booking_complete' && props.tourName) {
        profile.interactionTexts.push(`đặt tour ${props.tourName}`);
      } else if (event.eventType === 'blog_view' && props.title) {
        profile.interactionTexts.push(`đọc blog ${props.title}`);
      }
      
      // Update province weights
      if (event.provinces && Array.isArray(event.provinces) && event.provinces.length > 0) {
        for (const province of event.provinces) {
          if (province && typeof province === 'string') {
            // Sanitize: remove MongoDB special characters ($, .) and trim spaces
            const cleanProvince = province.replace(/[$.]/g, '_').trim();
            
            if (cleanProvince) { // Skip empty keys
              profile.provinceWeights[cleanProvince] = (profile.provinceWeights[cleanProvince] || 0) + finalWeight;
            }
          }
        }
      }
      
      // Update metadata
      profile.totalEvents += 1;
      profile.totalWeight += finalWeight;
      profile.eventCounts[event.eventType] = (profile.eventCounts[event.eventType] || 0) + 1;
      
      if (new Date(event.timestamp) > new Date(profile.lastEventAt)) {
        profile.lastEventAt = event.timestamp;
      }
      if (new Date(event.timestamp) < new Date(profile.firstEventAt)) {
        profile.firstEventAt = event.timestamp;
      }
    }
    
    // Calculate confidence and travel style for each profile
    for (const [userId, profile] of userProfiles.entries()) {
      profile.confidence = this.calculateConfidence(profile);
      profile.travelStyle = this.detectTravelStyle(profile);
    }
    
    console.log(`✅ Aggregated profiles for ${userProfiles.size} users`);
    
    return userProfiles;
  }
  
  /**
   * Build weighted text for embedding
   * @param {Object} profile - Aggregated user profile
   * @returns {String} Weighted text (e.g., "beach beach mountain food food food")
   */
  buildWeightedText(profile) {
    // Sort vibes by weight (descending)
    const sortedVibes = Object.entries(profile.vibeWeights)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10); // Top 10 vibes
    
    // FALLBACK: If no vibes, use interactionTexts directly (for users with events but no vibes)
    if (sortedVibes.length === 0) {
      if (profile.interactionTexts && profile.interactionTexts.length > 0) {
        const fallbackText = profile.interactionTexts.slice(0, 20).join(' ');
        console.log(`   User ${profile.userId}: (no vibes, using interactions) "${fallbackText}"`);
        return fallbackText;
      }
      return ''; // No vibes and no interactions
    }
    
    // Normalize weights to 1-5 repetitions
    const minWeight = Math.min(...sortedVibes.map(([, w]) => w));
    const maxWeight = Math.max(...sortedVibes.map(([, w]) => w));
    const range = maxWeight - minWeight || 1;
    
    const vibeText = sortedVibes
      .map(([vibe, weight]) => {
        const normalizedWeight = ((weight - minWeight) / range) * 4 + 1; // 1-5 range
        const repeat = Math.ceil(normalizedWeight);
        return Array(repeat).fill(vibe).join(' ');
      })
      .join(' ');
    
    // Add interactionTexts for richer context (optional)
    const interactionSample = (profile.interactionTexts || [])
      .slice(0, 5) // Top 5 interactions
      .join(' ');
    
    // Add top provinces (lower weight than vibes)
    const topProvinces = Object.entries(profile.provinceWeights)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3) // Top 3 provinces
      .map(([p]) => p);
    
    const provinceText = topProvinces.join(' ');
    
    const fullText = `${vibeText} ${interactionSample} ${provinceText}`.trim();
    
    console.log(`   User ${profile.userId}: "${fullText}"`);
    
    return fullText;
  }
  
  /**
   * Calculate user confidence (0-1)
   * Based on total weighted interactions
   */
  calculateConfidence(profile) {
    // Confidence increases with weighted interactions
    // 20 weighted interactions = 1.0 confidence
    return Math.min(profile.totalWeight / 20, 1.0);
  }
  
  /**
   * Detect travel style from vibes
   */
  detectTravelStyle(profile) {
    const vibes = Object.keys(profile.vibeWeights);
    
    if (vibes.length === 0) {
      return 'explorer';
    }
    
    // Check for dominant themes
    const adventureVibes = ['adventure', 'hiking', 'outdoor', 'mountain', 'trekking'];
    const relaxVibes = ['beach', 'relaxation', 'spa', 'resort', 'chill'];
    const cultureVibes = ['history', 'museum', 'culture', 'temple', 'architecture'];
    const foodVibes = ['food', 'local', 'cuisine', 'street food', 'restaurant'];
    
    const scores = {
      adventurer: vibes.filter(v => adventureVibes.some(av => v.toLowerCase().includes(av))).length,
      relaxer: vibes.filter(v => relaxVibes.some(rv => v.toLowerCase().includes(rv))).length,
      culture: vibes.filter(v => cultureVibes.some(cv => v.toLowerCase().includes(cv))).length,
      foodie: vibes.filter(v => foodVibes.some(fv => v.toLowerCase().includes(fv))).length
    };
    
    // Find style with highest score
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) {
      return 'explorer';
    }
    
    const dominantStyle = Object.entries(scores)
      .find(([, score]) => score === maxScore)?.[0];
    
    return dominantStyle || 'explorer';
  }
  
  /**
   * Get summary statistics
   */
  getSummaryStats(userProfiles) {
    const profiles = Array.from(userProfiles.values());
    
    return {
      totalUsers: profiles.length,
      totalEvents: profiles.reduce((sum, p) => sum + p.totalEvents, 0),
      avgEventsPerUser: (profiles.reduce((sum, p) => sum + p.totalEvents, 0) / profiles.length).toFixed(2),
      avgConfidence: (profiles.reduce((sum, p) => sum + this.calculateConfidence(p), 0) / profiles.length).toFixed(2),
      topVibes: this.getTopVibes(profiles, 10),
      travelStyleDistribution: this.getTravelStyleDistribution(profiles)
    };
  }
  
  /**
   * Get top vibes across all users
   */
  getTopVibes(profiles, limit = 10) {
    const globalVibes = {};
    
    for (const profile of profiles) {
      for (const [vibe, weight] of Object.entries(profile.vibeWeights)) {
        globalVibes[vibe] = (globalVibes[vibe] || 0) + weight;
      }
    }
    
    return Object.entries(globalVibes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([vibe, weight]) => ({ vibe, weight: weight.toFixed(2) }));
  }
  
  /**
   * Get travel style distribution
   */
  getTravelStyleDistribution(profiles) {
    const distribution = {};
    
    for (const profile of profiles) {
      const style = this.detectTravelStyle(profile);
      distribution[style] = (distribution[style] || 0) + 1;
    }
    
    return distribution;
  }
}

module.exports = new EventAggregator();
