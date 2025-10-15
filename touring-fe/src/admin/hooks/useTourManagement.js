import { useState, useEffect } from 'react';
import { TOUR_STATUS, PAGINATION_CONFIG } from '../utils/tourConstants';
import { getTours } from '../services/tourAPI';

export const useTourManagement = () => {
  const [tours, setTours] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [pageSize] = useState(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE);

  const filteredTours = tours.filter(tour => {
    if (statusFilter === 'all') return true;
    return tour.status === statusFilter;
  });

  // Check if tour is active
  const isActiveTour = (tour) => tour.status === TOUR_STATUS.ACTIVE;

  return {
    tours: filteredTours,
    statusFilter,
    setStatusFilter,
    pageSize,
    isActiveTour
  };
};