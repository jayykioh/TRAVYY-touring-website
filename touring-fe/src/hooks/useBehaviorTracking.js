import { useCallback } from 'react';
import { useAuth } from '../auth/context';
import { trackTourView as posthogTrackTourView, trackTourBooking as posthogTrackTourBooking, trackTourBookmark as posthogTrackTourBookmark, trackBlogView as posthogTrackBlogView } from '../utils/posthog';

/**
 * Hook for tracking user behavior via PostHog
 * All events are sent to PostHog for AI recommendation pipeline
 */
export function useBehaviorTracking() {
  const { user } = useAuth();

  // Track tour view (via PostHog - backend will extract vibes + provinces)
  const trackTourView = useCallback(
    async (tourId, tourData = {}) => {
      if (!user?._id || !tourId) return;

      try {
        // Send to PostHog with tour metadata
        await posthogTrackTourView({
          _id: tourId,
          name: tourData.tourName,
          price: tourData.price,
          duration: tourData.duration,
          location: { province: tourData.locations?.[0] },
          vibes: tourData.tags || []
        });
        console.log('👁️ [PostHog] Tour view tracked:', tourId);
      } catch (error) {
        console.error('❌ Failed to track tour view:', error);
      }
    },
    [user?._id]
  );

  // Track tour click - now merged with tour view (PostHog handles this automatically)
  const trackTourClick = useCallback(
    async (tourId, tourData = {}) => {
      // Alias to trackTourView - PostHog will track the click as a view event
      return trackTourView(tourId, tourData);
    },
    [trackTourView]
  );

  // Track tour bookmark (via PostHog)
  const trackTourBookmark = useCallback(
    async (tourId, isAdded, tourData = {}) => {
      if (!user?._id || !tourId) return;

      try {
        // Send to PostHog
        await posthogTrackTourBookmark({
          _id: tourId,
          name: tourData.tourName,
          price: tourData.price,
          vibes: tourData.tags || []
        }, isAdded);
        console.log(`🔖 [PostHog] Tour bookmark tracked:`, { tourId, isAdded });
      } catch (error) {
        console.error('❌ Failed to track tour bookmark:', error);
      }
    },
    [user?._id]
  );

  // Track tour booking (via PostHog - called from payment success handler)
  const trackTourBooking = useCallback(
    async (tourId, bookingData = {}) => {
      if (!user?._id || !tourId) return;

      try {
        // Send to PostHog
        await posthogTrackTourBooking({
          tourId,
          _id: bookingData._id,
          totalPrice: bookingData.totalPrice,
          participants: (bookingData.adults || 0) + (bookingData.children || 0),
          bookingDate: bookingData.departureDate,
          ...bookingData
        });
        console.log('💰 [PostHog] Tour booking tracked:', tourId);
      } catch (error) {
        console.error('❌ Failed to track tour booking:', error);
      }
    },
    [user?._id]
  );

  // Track blog view (via PostHog)
  const trackBlogView = useCallback(
    async (blogSlug, blogData = {}) => {
      if (!user?._id || !blogSlug) return;

      try {
        // Send to PostHog
        await posthogTrackBlogView({
          _id: blogSlug,
          slug: blogSlug,
          title: blogData.title,
          vibes: blogData.tags || [],
          provinces: blogData.provinces || []
        });
        console.log('📖 [PostHog] Blog view tracked:', blogSlug);
      } catch (error) {
        console.error('❌ Failed to track blog view:', error);
      }
    },
    [user?._id]
  );

  // ⚠️ REMOVED: trackBlogScroll - Not needed for itinerary creation
  const trackBlogScroll = useCallback(
    async () => {
      console.warn('⚠️ trackBlogScroll is deprecated - not needed for itinerary creation');
    },
    []
  );

  // ⚠️ REMOVED: Zone interactions - Not needed for itinerary creation
  const trackZoneView = useCallback(
    async () => {
      console.warn('⚠️ trackZoneView is deprecated - zone tracking removed');
    },
    []
  );

  // Track search queries (deprecated - PostHog autocapture handles this)
  const trackSearch = useCallback(
    async () => {
      console.warn('⚠️ trackSearch is deprecated - PostHog autocapture handles search events');
    },
    []
  );

  return {
    // Tour tracking
    trackTourView,
    trackTourClick,
    trackTourBookmark,
    trackTourBooking,
    
    // Blog tracking
    trackBlogView,
    trackBlogScroll,
    
    // Zone tracking
    trackZoneView,
    
    // Search tracking
    trackSearch,
  };
}
