// hooks/useAgencyAPI.js
import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../services/adminAPI';

export const useAgencyAPI = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let result;
      switch(endpoint) {
        case 'tours':
          result = await adminAPI.getTours();
          break;
        case 'bookings':
          result = await adminAPI.getBookings();
          break;
        case 'guides':
          result = await adminAPI.getGuides();
          break;
        default:
          throw new Error('Invalid endpoint');
      }
      
      setData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Hook for sync operations
export const useSync = () => {
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  const syncItem = async (id, type) => {
    try {
      setSyncing(true);
      setSyncError(null);
      
      let result;
      switch(type) {
        case 'tour':
          result = await adminAPI.syncTour(id);
          break;
        case 'booking':
          result = await adminAPI.syncBooking(id);
          break;
        case 'guide':
          result = await adminAPI.syncGuide(id);
          break;
        default:
          throw new Error('Invalid type');
      }
      
      return result;
    } catch (err) {
      setSyncError(err.message);
      throw err;
    } finally {
      setSyncing(false);
    }
  };

  const syncAll = async (type) => {
    try {
      setSyncing(true);
      setSyncError(null);
      
      let result;
      switch(type) {
        case 'tours':
          result = await adminAPI.syncAllTours();
          break;
        case 'bookings':
          result = await adminAPI.syncAllBookings();
          break;
        case 'guides':
          result = await adminAPI.syncAllGuides();
          break;
        default:
          throw new Error('Invalid type');
      }
      
      return result;
    } catch (err) {
      setSyncError(err.message);
      throw err;
    } finally {
      setSyncing(false);
    }
  };

  return { syncing, syncError, syncItem, syncAll };
};