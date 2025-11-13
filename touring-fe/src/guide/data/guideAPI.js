// Guide API functions - centralized API calls for guide functionality

// Helper to get access token from AuthContext (stored in memory)
const getAccessToken = () => {
  // Try to get from localStorage as fallback (some pages may store it there)
  const token = localStorage.getItem('accessToken');
  return token;
};

// Get guide profile
export const getGuideProfile = async () => {
  try {
    const token = getAccessToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch('/api/guide/profile', {
      method: 'GET',
      credentials: 'include',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch guide profile');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching guide profile:', error);
    throw error;
  }
};

// Get tour requests
export const getTourRequests = async () => {
  try {
    const token = getAccessToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch('/api/guide/requests', {
      method: 'GET',
      credentials: 'include',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tour requests');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching tour requests:', error);
    throw error;
  }
};

// Accept tour request
export const acceptTourRequest = async (requestId) => {
  try {
    const token = getAccessToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`/api/guide/requests/${requestId}/accept`, {
      method: 'PUT',
      credentials: 'include',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to accept tour request');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error accepting tour request:', error);
    throw error;
  }
};

// Reject tour request
export const rejectTourRequest = async (requestId) => {
  try {
    const token = getAccessToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`/api/guide/requests/${requestId}/reject`, {
      method: 'PUT',
      credentials: 'include',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to reject tour request');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error rejecting tour request:', error);
    throw error;
  }
};

// Get guide tours
export const getGuideTours = async () => {
  try {
    const token = getAccessToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch('/api/guide/tours', {
      method: 'GET',
      credentials: 'include',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch guide tours');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching guide tours:', error);
    throw error;
  }
};

// Get guide earnings
export const getGuideEarnings = async () => {
  try {
    const token = getAccessToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch('/api/guide/earnings', {
      method: 'GET',
      credentials: 'include',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch guide earnings');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching guide earnings:', error);
    throw error;
  }
};

// Get guide notifications
export const getGuideNotifications = async () => {
  try {
    const token = getAccessToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch('/api/guide/notifications', {
      method: 'GET',
      credentials: 'include',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch guide notifications');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching guide notifications:', error);
    throw error;
  }
};