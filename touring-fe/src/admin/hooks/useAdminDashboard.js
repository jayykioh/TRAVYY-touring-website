    // ============================================================
// touring-fe/src/admin/hooks/useAdminDashboard.js
// ============================================================

import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/adminAPI';

export const useAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [statsRes, activitiesRes, performanceRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentActivities(),
        dashboardAPI.getPerformanceData()
      ]);

      setStats(statsRes.data.stats);
      setActivities(activitiesRes.data.activities);
      setPerformance(performanceRes.data.performance);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchDashboardData();
  };

  return {
    stats,
    activities,
    performance,
    loading,
    error,
    refreshData
  };
};