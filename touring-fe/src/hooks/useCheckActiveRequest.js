import { useCallback } from 'react';
import { useAuth } from '@/auth/context';

/**
 * Hook to check if user has active tour requests
 * Optimized for fast response time
 */
export function useCheckActiveRequest() {
  const { withAuth } = useAuth();

  const checkActiveRequest = useCallback(async (itineraryId) => {
    if (!withAuth || !itineraryId) return null;
    
    try {
      // Fast endpoint - check if active request exists for this itinerary
      const response = await withAuth(`/api/tour-requests/check-active/${itineraryId}`, {
        method: 'GET'
      });
      
      return response;
    } catch (error) {
      console.warn('[useCheckActiveRequest] Check failed:', error?.message);
      return null;
    }
  }, [withAuth]);

  return { checkActiveRequest };
}
