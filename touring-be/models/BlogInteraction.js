const mongoose = require('mongoose');

/**
 * Track user interactions with blogs
 * Blogs are destination guides that influence travel preferences
 */
const blogInteractionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  blogSlug: {
    type: String, // Blog slug (e.g., 'da-nang-travel-guide')
    required: true,
    index: true
  },
  
  action: {
    type: String,
    enum: ['view', 'scroll', 'share', 'bookmark'],
    default: 'view'
  },
  
  // Engagement metrics
  durationSec: {
    type: Number, // Time spent reading
    default: 0
  },
  
  scrollPercent: {
    type: Number, // How much of blog was scrolled (0-100)
    default: 0
  },
  
  // Extracted vibes from blog
  relatedVibes: [String], // ['beach', 'food', 'culture'] extracted from blog tags
  
  relatedProvinces: [String], // ['Da Nang', 'Hoi An'] extracted from blog
  
  // Session grouping
  sessionId: {
    type: String,
    index: true
  },
  
  // Context
  source: {
    type: String, // 'search', 'recommended', 'direct'
    default: 'direct'
  },
  
  deviceType: String,
  
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound indexes
blogInteractionSchema.index({ userId: 1, timestamp: -1 });
blogInteractionSchema.index({ blogSlug: 1, timestamp: -1 });

module.exports = mongoose.model('BlogInteraction', blogInteractionSchema);
