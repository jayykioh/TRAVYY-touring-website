const mongoose = require('mongoose');

const PriceOfferSchema = new mongoose.Schema({
  offeredBy: { 
    type: String, 
    enum: ['user', 'guide'], 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0
  },
  currency: { 
    type: String, 
    default: 'VND',
    enum: ['VND', 'USD']
  },
  message: { 
    type: String,
    maxlength: 500
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const MessageSchema = new mongoose.Schema({
  sender: { 
    type: String, 
    enum: ['user', 'guide'], 
    required: true 
  },
  content: { 
    type: String, 
    required: true,
    maxlength: 1000
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Agreement/Commitment Schema
const AgreementSchema = new mongoose.Schema({
  userAgreed: { 
    type: Boolean, 
    default: false 
  },
  guideAgreed: { 
    type: Boolean, 
    default: false 
  },
  userAgreedAt: Date,
  guideAgreedAt: Date,
  terms: {
    finalPrice: Number,
    currency: String,
    numberOfGuests: Number,
    tourDates: [{
      startDate: Date,
      endDate: Date
    }],
    itineraryItems: Number,
    specialConditions: String
  },
  completedAt: Date // When both parties agreed
});

const TourCustomRequestSchema = new mongoose.Schema({
  // Reference to user who created the request
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  
  // Reference to the itinerary (AI-generated custom tour)
  itineraryId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Itinerary', 
    required: true 
  },
  
  // Tour guide who will handle this request
  guideId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    index: true
  },
  
  // Request status
  status: {
    type: String,
    enum: ['pending', 'negotiating', 'agreement_pending', 'accepted', 'rejected', 'cancelled', 'expired'],
    default: 'pending',
    index: true
  },
  
  // Tour details from itinerary (synced to guide)
  tourDetails: {
    zoneName: String,
    numberOfDays: { type: Number, default: 1 },
    numberOfGuests: { 
      type: Number, 
      default: 1,
      min: 1,
      max: 10, // 🚀 LIMIT: Max 10 people per tour
      validate: {
        validator: function(v) {
          return v >= 1 && v <= 10;
        },
        message: 'Number of guests must be between 1 and 10'
      }
    },
    preferences: {
      vibes: [String],
      pace: String,
      budget: String,
      bestTime: String
    },
    items: [{
      poiId: String,
      name: String,
      address: String,
      location: {
        lat: Number,
        lng: Number
      },
      itemType: { type: String, enum: ['poi', 'tour'] },
      startTime: String,
      endTime: String,
      duration: Number
    }]
  },
  
  // Pricing negotiation history
  priceOffers: [PriceOfferSchema],
  
  // Final agreed price
  finalPrice: {
    amount: Number,
    currency: { type: String, default: 'VND' }
  },
  
  // Initial budget from user
  initialBudget: {
    amount: Number,
    currency: { type: String, default: 'VND' }
  },
  
  // Messages between user and guide
  messages: [MessageSchema],
  
  // Agreement/Commitment between both parties
  agreement: AgreementSchema,
  
  // Itinerary sync status
  itinerarySynced: {
    type: Boolean,
    default: true // Auto-synced when request is created
  },
  itinerarySyncedAt: {
    type: Date,
    default: Date.now
  },
  
  // Special requirements/notes from user
  specialRequirements: {
    type: String,
    maxlength: 1000
  },
  
  // Contact information
  contactInfo: {
    phone: String,
    email: String,
    preferredContactMethod: { 
      type: String, 
      enum: ['phone', 'email', 'app'],
      default: 'app'
    }
  },
  
  // Tour dates
  preferredDates: [{
    startDate: Date,
    endDate: Date,
    flexible: { type: Boolean, default: false }
  }],
  
  // Request metadata
  requestNumber: {
    type: String,
    unique: true
  },
  
  // Booking reference (after acceptance and payment)
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  
  // Expiry time for pending requests (24 hours default)
  expiresAt: {
    type: Date,
    index: true
  },
  
  // Timestamps
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  acceptedAt: Date,
  rejectedAt: Date,
  cancelledAt: Date,
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for latest offer
TourCustomRequestSchema.virtual('latestOffer').get(function() {
  if (!this.priceOffers || this.priceOffers.length === 0) return null;
  return this.priceOffers[this.priceOffers.length - 1];
});

// Virtual for offer count
TourCustomRequestSchema.virtual('offerCount').get(function() {
  return this.priceOffers ? this.priceOffers.length : 0;
});

// Virtual for message count
TourCustomRequestSchema.virtual('messageCount').get(function() {
  return this.messages ? this.messages.length : 0;
});

// Virtual for is expired
TourCustomRequestSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Pre-save hook to generate request number
TourCustomRequestSchema.pre('save', async function(next) {
  if (this.isNew && !this.requestNumber) {
    const count = await mongoose.model('TourCustomRequest').countDocuments();
    this.requestNumber = `TCR${String(count + 1).padStart(6, '0')}`;
  }
  
  // Set expiry time (24 hours from creation) if not set
  if (this.isNew && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  
  next();
});

// Instance method to add price offer
TourCustomRequestSchema.methods.addPriceOffer = function(offeredBy, amount, currency = 'VND', message = '') {
  this.priceOffers.push({
    offeredBy,
    amount,
    currency,
    message
  });
  
  // Update status to negotiating if not already
  if (this.status === 'pending') {
    this.status = 'negotiating';
  }
  
  return this.save();
};

// Instance method to add message
TourCustomRequestSchema.methods.addMessage = function(sender, content) {
  this.messages.push({
    sender,
    content
  });
  return this.save();
};

// Instance method for user to agree to terms
TourCustomRequestSchema.methods.userAgreeToTerms = function(terms) {
  if (!this.agreement) {
    this.agreement = {
      userAgreed: true,
      userAgreedAt: new Date(),
      terms: terms || {}
    };
  } else {
    this.agreement.userAgreed = true;
    this.agreement.userAgreedAt = new Date();
    if (terms) {
      this.agreement.terms = { ...this.agreement.terms, ...terms };
    }
  }
  
  // Check if both parties agreed
  if (this.agreement.guideAgreed) {
    this.agreement.completedAt = new Date();
    this.status = 'agreement_pending'; // Ready for final acceptance
  }
  
  return this.save();
};

// Instance method for guide to agree to terms
TourCustomRequestSchema.methods.guideAgreeToTerms = function(terms) {
  if (!this.agreement) {
    this.agreement = {
      guideAgreed: true,
      guideAgreedAt: new Date(),
      terms: terms || {}
    };
  } else {
    this.agreement.guideAgreed = true;
    this.agreement.guideAgreedAt = new Date();
    if (terms) {
      this.agreement.terms = { ...this.agreement.terms, ...terms };
    }
  }
  
  // Check if both parties agreed
  if (this.agreement.userAgreed) {
    this.agreement.completedAt = new Date();
    this.status = 'agreement_pending'; // Ready for final acceptance
  }
  
  return this.save();
};

// Instance method to check if both agreed
TourCustomRequestSchema.methods.isBothAgreed = function() {
  return this.agreement && 
         this.agreement.userAgreed && 
         this.agreement.guideAgreed &&
         this.agreement.completedAt;
};

// Instance method to accept request
TourCustomRequestSchema.methods.acceptRequest = function(finalAmount, currency = 'VND') {
  this.status = 'accepted';
  this.acceptedAt = new Date();
  this.finalPrice = {
    amount: finalAmount,
    currency
  };
  return this.save();
};

// Instance method to reject request
TourCustomRequestSchema.methods.rejectRequest = function(reason) {
  this.status = 'rejected';
  this.rejectedAt = new Date();
  if (reason) {
    this.messages.push({
      sender: 'guide',
      content: `Request rejected: ${reason}`
    });
  }
  return this.save();
};

// Instance method to cancel request
TourCustomRequestSchema.methods.cancelRequest = function(reason) {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  if (reason) {
    this.messages.push({
      sender: 'user',
      content: `Request cancelled: ${reason}`
    });
  }
  return this.save();
};

// Static method to find expired requests
TourCustomRequestSchema.statics.findExpiredRequests = function() {
  return this.find({
    status: { $in: ['pending', 'negotiating'] },
    expiresAt: { $lte: new Date() }
  });
};

// Static method to expire old requests (cron job)
TourCustomRequestSchema.statics.expireOldRequests = async function() {
  const expiredRequests = await this.findExpiredRequests();
  const updatePromises = expiredRequests.map(req => {
    req.status = 'expired';
    return req.save();
  });
  return Promise.all(updatePromises);
};

// Indexes for efficient querying
TourCustomRequestSchema.index({ userId: 1, status: 1 });
TourCustomRequestSchema.index({ guideId: 1, status: 1 });
TourCustomRequestSchema.index({ requestNumber: 1 });
TourCustomRequestSchema.index({ expiresAt: 1 });
TourCustomRequestSchema.index({ createdAt: -1 });

const TourCustomRequest = mongoose.model('TourCustomRequest', TourCustomRequestSchema);

module.exports = TourCustomRequest;
