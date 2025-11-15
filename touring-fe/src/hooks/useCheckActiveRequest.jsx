import { useCallback } from 'react';
import { useAuth } from '@/auth/context';

/**
 * Hook for checking if user has active tour request for an itinerary
 * Optimized for fast pre-validation before submission
 */
export const useCheckActiveRequest = () => {
  const { withAuth } = useAuth();

  const checkActiveRequest = useCallback(async (itineraryId) => {
    if (!itineraryId) {
      console.warn('[useCheckActiveRequest] Missing itineraryId');
      return { hasActive: false, requestId: null };
    }

    try {
      console.log('[useCheckActiveRequest] Checking for active request:', itineraryId);
      
      const result = await withAuth(`/api/tour-requests/check-active/${itineraryId}`, {
        method: 'GET'
      });

      console.log('[useCheckActiveRequest] Check result:', result);
      
      return {
        hasActive: result?.hasActive || false,
        requestId: result?.requestId || null,
        status: result?.status || null
      };
    } catch (error) {
      console.error('[useCheckActiveRequest] Error checking active request:', error);
      // Return safe default on error (allow submission to proceed, backend will catch duplicate)
      return { hasActive: false, requestId: null, status: null };
    }
  }, [withAuth]);

  return { checkActiveRequest };
};
