
const UserProfile = require('../models/UserProfile');
const Tour = require('../models/agency/Tours');
const embeddingClient = require('../services/ai/libs/embedding-client');

// Vietnamese → English vibe mapping (for old data compatibility)
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
  'Hang động': 'cave',
  'Lặn biển': 'diving',
  'Phố cổ': 'old-town',
  'Homestay': 'homestay'
};

exports.getProfileSummary = async (req, res) => {
  try {
    const userId = req.userId;
    const profile = await UserProfile.findOne({ userId }).lean();
    if (!profile) {
      return res.json({
        summary: {
          totalInteractions: 0,
          travelStyle: 'Explorer',
          engagementLevel: 'Beginner',
          confidence: 0,
          lastUpdated: null
        },
        topVibes: [],
        topProvinces: [],
        eventBreakdown: {},
        raw: {
          firstEventAt: null,
          lastEventAt: null,
          interactionSummary: ''
        },
        isNewUser: true,
        message: 'Chưa có dữ liệu. Hãy khám phá tour để xây dựng hồ sơ của bạn!'
      });
    }
    
    // DEBUG: Log profile structure
    console.log('📊 Profile data:', {
      hasPreferredVibes: !!profile.preferredVibes && profile.preferredVibes.length > 0,
      preferredVibes: profile.preferredVibes,
      hasVibeProfile: !!profile.vibeProfile,
      vibeProfileType: typeof profile.vibeProfile,
      vibeProfileKeys: profile.vibeProfile ? Object.keys(profile.vibeProfile) : [],
      hasVibeWeights: !!profile.vibeWeights,
      vibeWeightsType: typeof profile.vibeWeights
    });
    
    // Calculate stats
    const totalInteractions = profile.totalInteractions || 0;
    
    // Extract top vibes from vibeProfile or vibeWeights
    let topVibes = [];
    
    if (profile.vibeProfile && Object.keys(profile.vibeProfile).length > 0) {
      // OPTION 1: vibeProfile (with full metadata)
      const vibeEntries = profile.vibeProfile instanceof Map 
        ? Array.from(profile.vibeProfile.entries())
        : Object.entries(profile.vibeProfile);
      
      topVibes = vibeEntries
        .filter(([, data]) => data && (data.weight || data.weight === 0))
        .sort(([, a], [, b]) => (b.weight || 0) - (a.weight || 0))
        .slice(0, 5)
        .map(([vibe, data]) => ({
          vibe,
          score: data.weight || 0
        }));
    } else if (profile.vibeWeights && Object.keys(profile.vibeWeights).length > 0) {
      // FALLBACK: vibeWeights (simplified Map/Object) - map Vietnamese → English
      const weightEntries = profile.vibeWeights instanceof Map
        ? Array.from(profile.vibeWeights.entries())
        : Object.entries(profile.vibeWeights);
      
      topVibes = weightEntries
        .filter(([, weight]) => weight || weight === 0)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([vibe, weight]) => ({
          vibe: VIBE_MAPPING[vibe] || vibe.toLowerCase(), // Map Vietnamese → English
          score: weight,
          originalVibe: vibe // Keep original for debugging
        }));
    }
    
    // Extract top provinces from provinceProfile or provinceWeights
    let topProvinces = [];
    
    if (profile.provinceProfile && Object.keys(profile.provinceProfile).length > 0) {
      // OPTION 1: provinceProfile (with full metadata)
      const provinceEntries = profile.provinceProfile instanceof Map
        ? Array.from(profile.provinceProfile.entries())
        : Object.entries(profile.provinceProfile);
      
      topProvinces = provinceEntries
        .filter(([, data]) => data && (data.weight || data.weight === 0))
        .sort(([, a], [, b]) => (b.weight || 0) - (a.weight || 0))
        .slice(0, 3)
        .map(([province, data]) => ({
          province,
          score: data.weight || 0
        }));
    } else if (profile.provinceWeights && Object.keys(profile.provinceWeights).length > 0) {
      // FALLBACK: provinceWeights (simplified Map/Object)
      const weightEntries = profile.provinceWeights instanceof Map
        ? Array.from(profile.provinceWeights.entries())
        : Object.entries(profile.provinceWeights);
      
      topProvinces = weightEntries
        .filter(([, weight]) => weight || weight === 0)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([province, weight]) => ({
          province,
          score: weight
        }));
    }
    
    // Determine travel style
    const travelStyle = profile.travelStyle || 'Explorer';
    
    // Calculate engagement level
    let engagementLevel = 'Beginner';
    if (totalInteractions > 50) engagementLevel = 'Expert';
    else if (totalInteractions > 20) engagementLevel = 'Enthusiast';
    else if (totalInteractions > 10) engagementLevel = 'Explorer';
    
    res.json({
      summary: {
        totalInteractions,
        travelStyle,
        engagementLevel,
        confidence: Math.round(profile.confidence * 100),
        lastUpdated: profile.updatedAt
      },
      topVibes,
      topProvinces,
      eventBreakdown: profile.eventCounts || {},
      raw: {
        firstEventAt: profile.firstEventAt,
        lastEventAt: profile.lastEventAt,
        interactionSummary: profile.interactionSummary || '' // NEW: For AI matching
      }
    });
    
  } catch (error) {
    console.error('Get profile summary error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/recommendations/tours
 * Get personalized tour recommendations based on user's FAISS vector
 */
exports.getPersonalizedTours = async (req, res) => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit) || 10;
    
    // Get user profile
    const profile = await UserProfile.findOne({ userId }).lean();
    
    if (!profile || !profile.vectorId) {
      // No profile yet - return popular tours
      const popularTours = await Tour.find({ isActive: true })
        .sort({ averageRating: -1 })
        .limit(limit)
        .lean();
      
      return res.json({
        personalized: false,
        message: 'Showing popular tours. Interact with tours to get personalized recommendations!',
        tours: popularTours
      });
    }
    
    // Search similar profiles in FAISS to get diverse recommendations
    const searchResults = await embeddingClient.search(profile.vectorId, {
      top_k: limit * 2,
      filter_type: 'user_profile'
    });
    
    // Get all unique tour IDs from similar users
    const similarUserIds = searchResults.hits
      .filter(h => h.id !== profile.vectorId) // Exclude self
      .map(h => h.payload?.userId)
      .filter(Boolean);
    
    if (similarUserIds.length === 0) {
      // Fallback to weighted vibe search
      const topVibes = Object.entries(profile.vibeWeights || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([vibe]) => vibe);
      
      const recommendedTours = await Tour.find({
        isActive: true,
        vibes: { $in: topVibes }
      })
        .limit(limit)
        .lean();
      
      return res.json({
        personalized: true,
        method: 'vibe_matching',
        tours: recommendedTours,
        profile: {
          topVibes: topVibes.slice(0, 3),
          confidence: profile.confidence
        }
      });
    }
    
    // Get tours that similar users interacted with
    const UserProfileModel = require('../models/UserProfile');
    const similarProfiles = await UserProfileModel.find({
      userId: { $in: similarUserIds }
    }).lean();
    
    // Aggregate tour interactions from similar users
    const tourScores = {};
    similarProfiles.forEach(sp => {
      if (sp.vibeWeights) {
        Object.keys(sp.vibeWeights).forEach(vibe => {
          // Use vibes as proxy for tour preferences
          if (!tourScores[vibe]) tourScores[vibe] = 0;
          tourScores[vibe] += sp.vibeWeights[vibe];
        });
      }
    });
    
    // Get top recommended vibes
    const recommendedVibes = Object.entries(tourScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([vibe]) => vibe);
    
    // Find tours matching recommended vibes
    const recommendedTours = await Tour.find({
      isActive: true,
      vibes: { $in: recommendedVibes }
    })
      .limit(limit)
      .lean();
    
    res.json({
      personalized: true,
      method: 'collaborative_filtering',
      tours: recommendedTours,
      profile: {
        similarUsers: similarUserIds.length,
        recommendedVibes: recommendedVibes.slice(0, 3),
        confidence: profile.confidence
      }
    });
    
  } catch (error) {
    console.error('Get personalized tours error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/recommendations/itinerary-suggestions
 * Get itinerary templates tailored to user preferences
 */
exports.getItinerarySuggestions = async (req, res) => {
  try {
    const userId = req.userId;
    const { duration, budget } = req.query;
    
    const profile = await UserProfile.findOne({ userId }).lean();
    
    if (!profile) {
      return res.status(404).json({
        message: 'Build your profile first by exploring tours!'
      });
    }
    
    // Get top vibes and provinces
    const topVibes = Object.entries(profile.vibeWeights || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([vibe]) => vibe);
    
    const topProvinces = Object.entries(profile.provinceWeights || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([province]) => province);
    
    // Generate itinerary suggestions based on profile
    const suggestions = [
      {
        title: `${topVibes[0]} Adventure in ${topProvinces[0]}`,
        description: `A ${duration || '3-day'} journey featuring your favorite vibes`,
        vibes: topVibes,
        provinces: [topProvinces[0]],
        estimatedBudget: budget || 'Medium',
        confidence: profile.confidence,
        reason: `Based on your ${Math.round(profile.confidence * 100)}% preference for ${topVibes[0]}`
      },
      {
        title: `Multi-City ${topVibes[1]} Experience`,
        description: `Explore ${topProvinces.join(' & ')} with your preferred travel style`,
        vibes: topVibes.slice(1, 3),
        provinces: topProvinces,
        estimatedBudget: budget || 'Medium',
        confidence: profile.confidence * 0.8,
        reason: `Combines your top locations with ${topVibes[1]} activities`
      }
    ];
    
    res.json({
      suggestions,
      profile: {
        topVibes,
        topProvinces,
        travelStyle: profile.travelStyle
      }
    });
    
  } catch (error) {
    console.error('Get itinerary suggestions error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;
