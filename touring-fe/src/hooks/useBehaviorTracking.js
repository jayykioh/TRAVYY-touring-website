import { useCallback } from 'react';
import { useAuth } from '../auth/context';

/**
 * Hook for tracking user behavior (tours, blogs,)
 * Debounced and batched for performance
 */
export function useBehaviorTracking() {
  const { user } = useAuth();

  // Track tour view (simplified - just send tourId, backend extracts vibes + provinces)
  const trackTourView = useCallback(
    async (tourId) => {
      if (!user?.token || !tourId) return;

      try {
        await fetch('/api/track/tour-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ tourId }),
        });
        console.log('👁️ Tour view tracked:', tourId);
      } catch (error) {
        console.error('❌ Failed to track tour view:', error);
      }
    },
    [user?.token]
  );

  // Track tour click (when user clicks tour card from search)
  const trackTourClick = useCallback(
    async (tourId, source = 'search') => {
      if (!user?.token || !tourId) return;

      try {
        await fetch('/api/track/tour-click', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ tourId, source }),
        });
      } catch (error) {
        console.error('❌ Failed to track tour click:', error);
      }
    },
    [user?.token]
  );

  // Track tour bookmark (when user adds/removes from wishlist)
  const trackTourBookmark = useCallback(
    async (tourId, bookmarked) => {
      if (!user?.token || !tourId) return;

      try {
        await fetch('/api/track/tour-bookmark', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ tourId, bookmarked }),
        });
      } catch (error) {
        console.error('❌ Failed to track tour bookmark:', error);
      }
    },
    [user?.token]
  );

  // Booking interactions are tracked only when payment succeeds (highest weight ×3.0)
  const trackTourBooking = useCallback(
    async () => {
      console.warn('⚠️ trackTourBooking is deprecated - booking tracking happens automatically after payment');
    },
    []
  );

  // Track blog view (simplified - just send blogSlug, backend extracts vibes + provinces)
  const trackBlogView = useCallback(
    async (blogSlug) => {
      if (!user?.token || !blogSlug) return;

      try {
        await fetch('/api/track/blog-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ blogSlug }),
        });
        console.log('📖 Blog view tracked:', blogSlug);
      } catch (error) {
        console.error('❌ Failed to track blog view:', error);
      }
    },
    [user?.token]
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

  // Track search queries
  const trackSearch = useCallback(
    async (query, vibes = [], results = []) => {
      if (!user?.token || !query) return;

      try {
        await fetch('/api/track/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            query,
            vibes,
            resultsCount: results.length,
          }),
        });
      } catch (error) {
        console.error('❌ Failed to track search:', error);
      }
    },
    [user?.token]
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
