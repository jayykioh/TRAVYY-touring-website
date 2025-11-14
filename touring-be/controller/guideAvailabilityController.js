const Guide = require('../models/guide/Guide');
const GuideAvailability = require('../models/guide/GuideAvailability');
const TourCustomRequest = require('../models/TourCustomRequest');

/**
 * Check if guide is available for given date range (optimized)
 */
exports.checkGuideAvailability = async (req, res) => {
  try {
    const { guideId } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        error: 'startDate and endDate are required' 
      });
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Find guide profile (lean for speed)
    const guideProfile = await Guide.findById(guideId).select('availability').lean();
    if (!guideProfile) {
      return res.status(404).json({ success: false, error: 'Guide not found' });
    }
    
    // Check availability (optimized with findOne instead of count)
    const isAvailable = await GuideAvailability.isGuideAvailable(
      guideId,
      start,
      end
    );
    
    // Get conflicting bookings only if not available
    let conflicts = [];
    if (!isAvailable) {
      conflicts = await GuideAvailability.find({
        guideId,
        status: 'active',
        startDate: { $lte: end },
        endDate: { $gte: start }
      })
      .select('startDate endDate tourDetails bookingId')
      .populate('bookingId', 'bookingCode status')
      .lean()
      .limit(5); // Limit to first 5 conflicts
    }
    
    res.json({
      success: true,
      available: isAvailable,
      guideStatus: guideProfile.availability,
      conflicts: conflicts.map(c => ({
        startDate: c.startDate,
        endDate: c.endDate,
        bookingCode: c.tourDetails?.bookingCode,
        zoneName: c.tourDetails?.zoneName
      }))
    });
    
  } catch (error) {
    console.error('[GuideAvailability] Error checking availability:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get guide's busy dates for calendar view (optimized)
 */
exports.getGuideBusyDates = async (req, res) => {
  try {
    const { guideId } = req.params;
    const { fromDate, toDate } = req.query;
    
    const guideProfile = await Guide.findById(guideId).select('availability').lean();
    if (!guideProfile) {
      return res.status(404).json({ success: false, error: 'Guide not found' });
    }
    
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    
    // Use optimized getGuideBusyDates static method
    const busyDates = await GuideAvailability.getGuideBusyDates(
      guideId,
      from,
      to
    );
    
    res.json({
      success: true,
      busyDates: busyDates.map(bd => ({
        startDate: bd.startDate,
        endDate: bd.endDate,
        status: bd.status,
        tourDetails: bd.tourDetails,
        bookingCode: bd.tourDetails?.bookingCode
      })),
      guideAvailability: guideProfile.availability
    });
    
  } catch (error) {
    console.error('[GuideAvailability] Error getting busy dates:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Validate tour request dates against guide availability (optimized with parallel checks)
 * Called before creating a tour request
 */
exports.validateTourRequestDates = async (req, res) => {
  try {
    const { guideId, preferredDates } = req.body;
    
    if (!guideId || !preferredDates || !Array.isArray(preferredDates) || preferredDates.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'guideId and preferredDates are required' 
      });
    }
    
    const guideProfile = await Guide.findById(guideId).select('availability').lean();
    if (!guideProfile) {
      return res.status(404).json({ success: false, error: 'Guide not found' });
    }
    
    // Check all dates in parallel for better performance
    const validationPromises = preferredDates.map(async (dateRange) => {
      const start = new Date(dateRange.startDate || dateRange);
      const end = new Date(dateRange.endDate || dateRange);
      
      const isAvailable = await GuideAvailability.isGuideAvailable(
        guideId,
        start,
        end
      );
      
      return {
        startDate: start,
        endDate: end,
        available: isAvailable
      };
    });
    
    const validationResults = await Promise.all(validationPromises);
    const allAvailable = validationResults.every(r => r.available);
    
    res.json({
      success: true,
      allAvailable,
      guideStatus: guideProfile.availability,
      dateValidations: validationResults,
      message: allAvailable 
        ? 'Guide is available for all selected dates' 
        : 'Guide has conflicts with some selected dates'
    });
    
  } catch (error) {
    console.error('[GuideAvailability] Error validating dates:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;
