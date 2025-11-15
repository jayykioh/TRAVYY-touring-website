import { useCallback } from 'react';
import { useAuth } from '@/auth/context';
import logger from '@/utils/logger';

/**
 * Hook for checking if user has active tour request for an itinerary
 * Optimized for fast pre-validation before submission
 */
export const useCheckActiveRequest = () => {
  const { withAuth } = useAuth();

  const checkActiveRequest = useCallback(async (itineraryId) => {
    if (!itineraryId) {
      logger.warn('[useCheckActiveRequest] Missing itineraryId');
      return { hasActive: false, requestId: null };
    }

    try {
      logger.debug('[useCheckActiveRequest] Checking for active request:', itineraryId);
      
      const result = await withAuth(`/api/tour-requests/check-active/${itineraryId}`, {
        method: 'GET'
      });

      logger.debug('[useCheckActiveRequest] Check result:', result);
      
      return {
        hasActive: result?.hasActive || false,
        requestId: result?.requestId || null,
        status: result?.status || null
      };
    } catch (error) {
      logger.error('[useCheckActiveRequest] Error checking active request:', error);
      // Return safe default on error (allow submission to proceed, backend will catch duplicate)
      return { hasActive: false, requestId: null, status: null };
    }
  }, [withAuth]);

  return { checkActiveRequest };
};
