const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  
  // Vibe preferences với weights (PostHog aggregated)
  vibeProfile: {
    type: Map,
    of: {
      weight: { type: Number, default: 0 }, // 0-1 normalized score
      interactions: { type: Number, default: 0 },
      lastUpdated: { type: Date, default: Date.now }
    },
    default: {}
  },
  
  // Province/region preferences với weights (PostHog aggregated)
  provinceProfile: {
    type: Map,
    of: {
      weight: { type: Number, default: 0 }, // 0-1 normalized score
      interactions: { type: Number, default: 0 },
      lastUpdated: { type: Date, default: Date.now }
    },
    default: {}
  },
  
  // Event counts by type (for debugging PostHog aggregation)
  eventCounts: {
    type: Map,
    of: Number, // eventType → count
    default: {}
  },
  
  // Interaction summary as freeText (for AI semantic matching)
  interactionSummary: {
    type: String,
    default: ''
  },
  
  // Travel preferences
  travelStyle: {
    type: String,
    enum: ['adventurer', 'relaxer', 'culture', 'explorer', 'foodie'],
    default: 'explorer'
  },
  
  budgetTier: {
    type: String,
    enum: ['budget', 'medium', 'luxury'],
    default: 'medium'
  },
  
  // Location
  homeProvince: String,
  lastKnownLocation: {
    lat: Number,
    lng: Number,
    timestamp: Date
  },
  
  // History
  recentVisitedZones: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone'
  }],
  
  bookmarkedZones: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone'
  }],
  
  // Metadata
  confidence: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
  
  totalInteractions: {
    type: Number,
    default: 0
  },
  
  lastSyncedAt: Date,
  
  // Privacy
  optInPersonalization: {
    type: Boolean,
    default: true
  },
  
  // A/B Testing
  abTestVariant: {
    type: String,
    enum: ['auto', 'manual'],
    default: null
  }
}, {
  timestamps: true
});

// Indexes for performance
UserProfileSchema.index({ userId: 1, lastSyncedAt: -1 });
UserProfileSchema.index({ confidence: -1 });

// Use mainConn to ensure pipeline sync uses same connection
const { mainConn } = require('../config/db');
module.exports = mainConn.model('UserProfile', UserProfileSchema);
