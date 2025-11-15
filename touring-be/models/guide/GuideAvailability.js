const mongoose = require("mongoose");

/**
 * GuideAvailability Model
 * Tracks guide's busy dates when they have confirmed tours
 * Used to lock guide from accepting other tour requests on those dates
 */
const guideAvailabilitySchema = new mongoose.Schema(
  {
    guideId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Guide", 
      required: true,
      index: true 
    },
    
    // Reference to the booking that locks this date range
    bookingId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Booking",
      required: true 
    },
    
    // Reference to the tour custom request
    tourRequestId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "TourCustomRequest" 
    },
    
    // Date range when guide is busy
    startDate: { 
      type: Date, 
      required: true,
      index: true 
    },
    endDate: { 
      type: Date, 
      required: true,
      index: true 
    },
    
    // Status of the availability block
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
      index: true
    },
    
    // Tour details for reference
    tourDetails: {
      zoneName: String,
      customerName: String,
      numberOfGuests: Number,
      bookingCode: String
    },
    
    // Timestamps
    lockedAt: { 
      type: Date, 
      default: Date.now 
    },
    completedAt: Date,
    cancelledAt: Date,
    
    // Notes
    notes: String
  },
  { timestamps: true }
);

// Optimized compound indexes for common query patterns
guideAvailabilitySchema.index({ guideId: 1, status: 1, startDate: 1, endDate: 1 });
guideAvailabilitySchema.index({ guideId: 1, status: 1 }); // For counting active bookings
guideAvailabilitySchema.index({ bookingId: 1, status: 1 }); // For release operations
guideAvailabilitySchema.index({ tourRequestId: 1 });
guideAvailabilitySchema.index({ status: 1, startDate: 1 }); // For date range queries

// Static method: Check if guide is available for given date range (optimized)
guideAvailabilitySchema.statics.isGuideAvailable = async function(guideId, startDate, endDate) {
  // Use lean() and select only _id for faster count
  const conflict = await this.findOne({
    guideId,
    status: 'active',
    startDate: { $lte: endDate },
    endDate: { $gte: startDate }
  })
  .select('_id')
  .lean()
  .hint({ guideId: 1, status: 1, startDate: 1, endDate: 1 });
  
  return !conflict; // Available if no overlapping bookings
};

// Static method: Get guide's busy dates (optimized with projection)
guideAvailabilitySchema.statics.getGuideBusyDates = async function(guideId, fromDate = null, toDate = null) {
  const query = {
    guideId,
    status: 'active'
  };
  
  if (fromDate || toDate) {
    query.$and = [];
    if (fromDate) query.$and.push({ endDate: { $gte: fromDate } });
    if (toDate) query.$and.push({ startDate: { $lte: toDate } });
  }
  
  return this.find(query)
    .select('startDate endDate status tourDetails bookingId tourRequestId')
    .sort({ startDate: 1 })
    .populate('bookingId', 'bookingCode status')
    .populate('tourRequestId', 'requestNumber status')
    .lean()
    .hint({ guideId: 1, status: 1, startDate: 1 });
};

// Static method: Lock guide for a booking (optimized with atomic operations)
guideAvailabilitySchema.statics.lockGuideForBooking = async function(guideId, bookingId, startDate, endDate, tourDetails = {}) {
  // Check if already locked (with projection)
  const existing = await this.findOne({ bookingId, status: 'active' })
    .select('_id guideId')
    .lean();
  
  if (existing) {
    console.log(`[GuideAvailability] Guide ${guideId} already locked for booking ${bookingId}`);
    return existing;
  }
  
  // Check if guide is available (optimized query)
  const isAvailable = await this.isGuideAvailable(guideId, startDate, endDate);
  if (!isAvailable) {
    const conflict = await this.findOne({
      guideId,
      status: 'active',
      startDate: { $lte: endDate },
      endDate: { $gte: startDate }
    }).select('startDate endDate tourDetails.bookingCode').lean();
    
    throw new Error(`Guide is not available for this date range. Conflict with booking ${conflict?.tourDetails?.bookingCode || 'unknown'}`);
  }
  
  // Create availability lock with all data in one operation
  const lock = await this.create({
    guideId,
    bookingId,
    tourRequestId: tourDetails.tourRequestId,
    startDate,
    endDate,
    status: 'active',
    tourDetails: {
      zoneName: tourDetails.zoneName,
      customerName: tourDetails.customerName,
      numberOfGuests: tourDetails.numberOfGuests,
      bookingCode: tourDetails.bookingCode
    },
    lockedAt: new Date()
  });
  
  console.log(`[GuideAvailability] ✅ Locked guide ${guideId} for booking ${bookingId} (${startDate} to ${endDate})`);
  return lock;
};

// Static method: Release guide lock (optimized with hint)
guideAvailabilitySchema.statics.releaseGuideLock = async function(bookingId, newStatus = 'completed') {
  const updateDoc = { 
    status: newStatus
  };
  
  // Set appropriate timestamp field
  if (newStatus === 'completed') {
    updateDoc.completedAt = new Date();
  } else if (newStatus === 'cancelled') {
    updateDoc.cancelledAt = new Date();
  }
  
  const result = await this.updateMany(
    { bookingId, status: 'active' },
    { $set: updateDoc }
  ).hint({ bookingId: 1, status: 1 });
  
  console.log(`[GuideAvailability] ✅ Released lock for booking ${bookingId}, updated ${result.modifiedCount} records`);
  return result;
};

// Instance method: Mark as completed
guideAvailabilitySchema.methods.markCompleted = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Instance method: Mark as cancelled
guideAvailabilitySchema.methods.markCancelled = function() {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  return this.save();
};

module.exports = mongoose.model("GuideAvailability", guideAvailabilitySchema);
