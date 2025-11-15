const mongoose = require('mongoose');

const ItineraryItemSchema = new mongoose.Schema({
  poiId: { type: String }, // POI or tour id
  name: { type: String, required: true },
  address: String,
  location: {
    lat: Number,
    lng: Number
  },
  types: [String],
  rating: Number,
  photos: [String],
  day: { type: Number, default: 1 },
  timeSlot: String,
  duration: { type: Number, default: 60 },
  startTime: String,
  endTime: String,
  // New: distinguish between POI and tour
  itemType: { type: String, enum: ['poi', 'tour'], default: 'poi' },
  tourInfo: {
    tourId: String,
    agency: Object,
    basePrice: Number,
    currency: String,
    itinerary: Array,
    // ...other tour fields as needed
  },
  // AI optimization fields
  travelFromPrevious: {
    distance: Number,
    duration: Number,
    mode: String
  },
  distanceFromOrigin: Number,
  addedAt: { type: Date, default: Date.now }
});

const ItinerarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  zoneId: String,
  zoneName: String,
  
  preferences: {
    vibes: [String],
    pace: { type: String, enum: ['light', 'moderate', 'intense'], default: 'moderate' },
    budget: { type: String, enum: ['budget', 'mid', 'luxury'], default: 'mid' },
    durationDays: { type: Number, default: 1 },
    bestTime: { // ✅ Add bestTime
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'sunset', 'anytime'],
      default: 'anytime'
    }
  },
  
  items: [ItineraryItemSchema],
  // New: flag for custom tour
  isCustomTour: { type: Boolean, default: false },
  // New: tour guide request status
  tourGuideRequest: {
    status: { type: String, enum: ['pending', 'accepted', 'rejected', 'none'], default: 'none' },
    guideId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    requestedAt: Date,
    respondedAt: Date
  },
  
  status: {
    type: String,
    enum: ['draft', 'optimized', 'confirmed'],
    default: 'draft'
  },
  
  routePolyline: {
    type: String,
    default: null
  },
  
  totalDistance: {
    type: Number,
    default: 0
  },
  
  totalDuration: {
    type: Number,
    default: 0
  },
  
  // ✅ FIXED: Only summary + tips (flat array)
  aiInsights: {
    summary: { type: String, default: '' },
    tips: { type: [String], default: [] }
  },
  
  aiProcessing: {
    type: Boolean,
    default: false
  },
  
  aiWarnings: {
    type: [String],
    default: []
  },
  
  isOptimized: {
    type: Boolean,
    default: false
  },
  
  optimizedAt: {
    type: Date
  },
  
  itemCount: { type: Number, default: 0 },
  maxDistance: { type: Number, default: 50 },
  
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    // ✅ ADD: Transform to ensure aiProcessing is always boolean
    transform: function(doc, ret) {
      ret.aiProcessing = Boolean(ret.aiProcessing);
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.aiProcessing = Boolean(ret.aiProcessing);
      return ret;
    }
  }
});

ItinerarySchema.pre('save', function(next) {
  this.itemCount = this.items.length;
  next();
});

module.exports = mongoose.model('Itinerary', ItinerarySchema);