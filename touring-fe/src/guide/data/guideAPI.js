// Guide API functions - centralized API calls for guide functionality

import logger from '@/utils/logger';

// Get guide profile
export const getGuideProfile = async () => {
  try {
    const response = await fetch('/api/guide/profile', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch guide profile');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    logger.error('Error fetching guide profile:', error);
    throw error;
  }
};

// Get tour requests
export const getTourRequests = async () => {
  try {
    const response = await fetch('/api/guide/requests', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tour requests');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    logger.error('Error fetching tour requests:', error);
    throw error;
  }
};

// Accept tour request
export const acceptTourRequest = async (requestId) => {
  try {
    const response = await fetch(`/api/guide/requests/${requestId}/accept`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to accept tour request');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    logger.error('Error accepting tour request:', error);
    throw error;
  }
};

// Reject tour request
export const rejectTourRequest = async (requestId) => {
  try {
    const response = await fetch(`/api/guide/requests/${requestId}/reject`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to reject tour request');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    logger.error('Error rejecting tour request:', error);
    throw error;
  }
};

// Get guide tours
export const getGuideTours = async () => {
  try {
    const response = await fetch('/api/guide/tours', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch guide tours');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    logger.error('Error fetching guide tours:', error);
    throw error;
  }
};

// Get guide earnings
export const getGuideEarnings = async () => {
  try {
    const response = await fetch('/api/guide/earnings', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Return mock data if API fails
      return getMockEarningsData();
    }

    const data = await response.json();
    return data;
  } catch (error) {
    logger.error('Error fetching guide earnings:', error);
    // Return mock data on error
    return getMockEarningsData();
  }
};

// Mock earnings data for development/fallback
const getMockEarningsData = () => {
  return {
    summary: {
      thisWeek: 4500000,
      thisMonth: 18200000,
      lastMonth: 15600000,
      totalEarnings: 142500000,
      pendingPayment: 6800000,
    },
    weeklyData: [
      { day: "T2", amount: 0 },
      { day: "T3", amount: 1200000 },
      { day: "T4", amount: 800000 },
      { day: "T5", amount: 1500000 },
      { day: "T6", amount: 1000000 },
      { day: "T7", amount: 0 },
      { day: "CN", amount: 0 },
    ],
    monthlyStats: [
      { month: "Tuần 1", earnings: 4430000 },
      { month: "Tuần 2", earnings: 3290000 },
      { month: "Tuần 3", earnings: 3180000 },
      { month: "Tuần 4", earnings: 5960000 },
    ],
    yearlyStats: [
      { month: "T1", earnings: 12500000 },
      { month: "T2", earnings: 14200000 },
      { month: "T3", earnings: 15800000 },
      { month: "T4", earnings: 13600000 },
      { month: "T5", earnings: 16400000 },
      { month: "T6", earnings: 15600000 },
      { month: "T7", earnings: 17200000 },
      { month: "T8", earnings: 18200000 },
      { month: "T9", earnings: 16800000 },
      { month: "T10", earnings: 18500000 },
      { month: "T11", earnings: 19200000 },
      { month: "T12", earnings: 21000000 },
    ],
    recentPayments: [
      {
        id: 1,
        tourName: "Tour Đà Nẵng - Hội An 3N2Đ",
        date: "2025-11-10",
        grossAmount: 5000000,
        platformFee: 500000,
        netAmount: 4500000,
        status: "paid",
      },
      {
        id: 2,
        tourName: "Tour Phong Nha - Kẻ Bàng 2N1Đ",
        date: "2025-11-08",
        grossAmount: 3500000,
        platformFee: 350000,
        netAmount: 3150000,
        status: "paid",
      },
      {
        id: 3,
        tourName: "Tour Huế - Động Thiên Đường 1 ngày",
        date: "2025-11-12",
        grossAmount: 2000000,
        platformFee: 200000,
        netAmount: 1800000,
        status: "pending",
        expectedPayout: "2025-11-19",
      },
      {
        id: 4,
        tourName: "Tour Quảng Bình - Hang Sơn Đoòng 4N3Đ",
        date: "2025-11-05",
        grossAmount: 8000000,
        platformFee: 800000,
        netAmount: 7200000,
        status: "paid",
      },
      {
        id: 5,
        tourName: "Tour Đà Lạt - Thác Datanla 2N1Đ",
        date: "2025-11-13",
        grossAmount: 3000000,
        platformFee: 300000,
        netAmount: 2700000,
        status: "pending",
        expectedPayout: "2025-11-20",
      },
    ],
  };
};

// Get guide notifications
export const getGuideNotifications = async () => {
  try {
    const response = await fetch('/api/guide/notifications', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch guide notifications');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    logger.error('Error fetching guide notifications:', error);
    throw error;
  }
};