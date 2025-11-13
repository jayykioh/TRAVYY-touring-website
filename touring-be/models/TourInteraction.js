const mongoose = require('mongoose');

/**
 * Track user interactions with tours
 * Similar to ZoneInteraction but for tours
 */
const tourInteractionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  tourId: {
    type: String, // Tour ID from Tours collection
    required: true,
    index: true
  },
  
  action: {
    type: String,
    enum: ['view', 'click', 'bookmark', 'booking', 'dismiss'],
    required: true
  },
  
  // View engagement
  durationSec: {
    type: Number, // How long user stayed on tour detail page
    default: 0
  },
  
  // Booking specific data
  bookingData: {
    adults: Number,
    children: Number,
    totalPrice: Number,
    departureDate: Date
  },
  
  // Extracted data for AI matching (vibes + provinces)
  metadata: {
    vibes: [String],      // Tour styles/vibes
    provinces: [String]   // Tour locations
  },
  
  // Session grouping
  sessionId: {
    type: String,
    index: true
  },
  
  // Context
  source: {
    type: String, // 'search', 'discover', 'related', 'direct'
    default: 'direct'
  },
  
  deviceType: String, // 'mobile', 'tablet', 'desktop'
  
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound indexes
tourInteractionSchema.index({ userId: 1, timestamp: -1 });
tourInteractionSchema.index({ tourId: 1, timestamp: -1 });
tourInteractionSchema.index({ userId: 1, action: 1 });

module.exports = mongoose.model('TourInteraction', tourInteractionSchema);
