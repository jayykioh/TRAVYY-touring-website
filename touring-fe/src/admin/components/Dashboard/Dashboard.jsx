// src/admin/components/Dashboard/Dashboard.jsx

import React, { useState, useEffect } from "react";
import StatCard from "../Dashboard/StatsCard";
import DetailedMetrics from "../Dashboard/DetailedMetrics";
import ChartCard from "../Common/ChartCard";
import RevenueChart from "./RevenueChart";
import CategoryPieChart from "./CategoryPieChart";
import BookingTrendsChart from "./BookingTrendsChart";
import ToursByRegionChart from "./ToursByRegionChart";
import TopPopularToursTable from "./TopPopularToursTable";
import RecentReviewsTable from "./RecentReviewsTable";
import AgeDistributionChart from "./AgeDistributionChart";
import TopTravelersTable from "./TopTravelersTable";
import { adminAPI } from "../../services/adminAPI";
import logger from "../../../utils/logger";

import {
  summaryStats,
  detailedMetrics,
  revenueData,
  tourCategoryData,
} from "../../data/mockData";
import { useAdminAuth } from "../../context/AdminAuthContext";

const Dashboard = () => {
  const [revenueChartData, setRevenueChartData] = useState(revenueData);
  const [categoryChartData, setCategoryChartData] = useState(tourCategoryData);
  const [dashboardStats, setDashboardStats] = useState(summaryStats);
  const [userMetrics, setUserMetrics] = useState(detailedMetrics);
  const [bookingTrendsChartData, setBookingTrendsChartData] = useState([]);
  const [toursByRegionData, setToursByRegionData] = useState([]);
  const [ageDistributionData, setAgeDistributionData] = useState([]);
  const [topTravelersData, setTopTravelersData] = useState([]);
  const [topPopularToursData, setTopPopularToursData] = useState([]);
  const [recentReviewsData, setRecentReviewsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Helper function to format refresh time
  const formatRefreshTime = (date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  // Handle refresh all data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update last refresh time
      setLastRefresh(new Date());
      setIsRefreshing(false);
    } catch (error) {
      logger.error("Error refreshing dashboard:", error);
      setIsRefreshing(false);
    }
  };

  // Handle export report to CSV
  const handleExportReport = () => {
    try {
      const timestamp = formatRefreshTime(new Date());
      let csvContent = `BÁO CÁO THỐNG KÊ DASHBOARD TRAVYY\nThời gian: ${timestamp}\n\n`;

      // 1. Summary Stats
      csvContent += "=== THỐNG KÊ TỔNG QUAN ===\n";
      csvContent += "Chỉ số,Giá trị,Thay đổi,Xu hướng\n";
      dashboardStats.forEach((stat) => {
        csvContent += `"${stat.label}","${stat.value}","${
          stat.change || "N/A"
        }","${stat.trend || "N/A"}"\n`;
      });
      csvContent += "\n";

      // 2. User Metrics Summary (không có data user cá nhân)
      csvContent += "=== CHỈ SỐ NGƯỜI DÙNG ===\n";
      csvContent += "Chỉ số,Giá trị,Thay đổi,Xu hướng\n";
      userMetrics.forEach((metric) => {
        csvContent += `"${metric.label}","${metric.value}","${
          metric.change || "N/A"
        }","${metric.trend || "N/A"}"\n`;
      });
      csvContent += "\n";

      // 3. Revenue Data
      if (revenueChartData && revenueChartData.length > 0) {
        csvContent += "=== DOANH THU THEO THÁNG ===\n";
        csvContent += "Tháng,Doanh thu (triệu đồng)\n";
        revenueChartData.forEach((item) => {
          csvContent += `"${item.name || item.month}","${
            item.value || item.revenue
          }"\n`;
        });
        csvContent += "\n";
      }

      // 4. Category Data
      if (categoryChartData && categoryChartData.length > 0) {
        csvContent += "=== PHÂN LOẠI TOUR ===\n";
        csvContent += "Danh mục,Số lượng,Tỷ lệ (%)\n";
        categoryChartData.forEach((item) => {
          csvContent += `"${item.name}","${item.value}","${
            item.percentage || "N/A"
          }"\n`;
        });
        csvContent += "\n";
      }

      // 5. Booking Trends
      if (bookingTrendsChartData && bookingTrendsChartData.length > 0) {
        csvContent += "=== XU HƯỚNG ĐẶT TOUR ===\n";
        csvContent += "Tuần,Số lượt đặt\n";
        bookingTrendsChartData.forEach((item) => {
          csvContent += `"${item.week || item.name}","${
            item.bookings || item.value
          }"\n`;
        });
        csvContent += "\n";
      }

      // 6. Tours by Region
      if (toursByRegionData && toursByRegionData.length > 0) {
        csvContent += "=== TOUR THEO KHU VỰC ===\n";
        csvContent += "Khu vực,Số lượng tour\n";
        toursByRegionData.forEach((item) => {
          csvContent += `"${item.region || item.name}","${
            item.tours || item.value
          }"\n`;
        });
        csvContent += "\n";
      }

      // 7. Age Distribution (statistical summary only)
      if (ageDistributionData && ageDistributionData.length > 0) {
        csvContent += "=== PHÂN BỐ ĐỘ TUỔI ===\n";
        csvContent += "Nhóm tuổi,Số lượng,Tỷ lệ (%)\n";
        ageDistributionData.forEach((item) => {
          csvContent += `"${item.ageGroup || item.name}","${
            item.count || item.value
          }","${item.percentage || "N/A"}"\n`;
        });
        csvContent += "\n";
      }

      // Add BOM for UTF-8 encoding (to support Vietnamese characters in Excel)
      const BOM = "\uFEFF";
      const csvWithBOM = BOM + csvContent;

      // Create blob and download
      const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Travyy_Bao_Cao_Thong_Ke_${new Date().getTime()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Báo cáo CSV đã được xuất thành công!");
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Có lỗi khi xuất báo cáo. Vui lòng thử lại!");
    }
  };

  // Fetch dashboard summary stats
  const { token, isAuthenticated, loading: authLoading } = useAdminAuth();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Fetch main dashboard stats
        const result = await adminAPI.getDashboardStats();

        // Fetch refund stats
        const refundResult = await adminAPI.getRefundStats();

        // Fetch available guides
        const guidesResult = await adminAPI.getAvailableGuides();

        if (result.success && result.data) {
          const { totalUsers, totalTours, totalBookings, totalRevenue } =
            result.data;

          // Get refund data
          const refundData = refundResult.success
            ? refundResult.data
            : { pending: 0, total: 0 };

          // Get guides data
          const guidesData = guidesResult.success
            ? guidesResult.data
            : { totalGuides: 0 };

          // Update stats with real data
          const updatedStats = [
            // ✅ Card 1: Total Tours - HAS API
            {
              ...summaryStats[0],
              value: String(totalTours || 0),
            },
            // ❌ Card 2: Custom Tours - NO API YET
            {
              ...summaryStats[1],
            },
            // ✅ Card 3: New Users - HAS API
            {
              ...summaryStats[2],
              value: String(totalUsers || 0),
            },
            // ✅ Card 4: Active Guides - NOW HAS API
            {
              ...summaryStats[3],
              value: String(guidesData.totalGuides || 0),
            },
            // ✅ Card 5: Revenue - HAS API (partial)
            {
              ...summaryStats[4],
              value: `${(totalRevenue / 1000000000).toFixed(1)}B đ`,
              breakdown: [
                { label: "API", value: "1.5B" }, // Placeholder
                { label: "Custom", value: "0.9B" }, // Placeholder
              ],
            },
            // ❌ Card 6: Cancellation Rate - NO API YET
            {
              ...summaryStats[5],
            },
            // ✅ Card 7: Refund Requests - NOW HAS API
            {
              ...summaryStats[6],
              value: String(refundData.total || 0),
              subtitle: `${refundData.pending || 0} chờ xử lý, ${
                refundData.approved || 0
              } đã duyệt`,
            },
          ];

          setDashboardStats(updatedStats);
        }
      } catch (error) {
          logger.error("Error fetching dashboard stats:", error);
          // Giữ mock data nếu API fail
        }
    };

    // Only fetch if authenticated (token present)
    if (!authLoading && isAuthenticated) {
      fetchDashboardStats();
    }
  }, [isAuthenticated, authLoading]);

  // Fetch revenue data từ API
  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        const result = await adminAPI.getRevenueStats(selectedYear);

        if (result.success && result.data) {
          setRevenueChartData(result.data);
        } else {
          logger.error("API response not successful:", result);
          setRevenueChartData(revenueData); // Fallback
        }
      } catch (error) {
        logger.error("Error fetching revenue data:", error);
        setRevenueChartData(revenueData); // Fallback to mock data
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && isAuthenticated) {
      fetchRevenueData();
    }
  }, [selectedYear, isAuthenticated, authLoading]);

  // Fetch category data từ API
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const result = await adminAPI.getCategoryStats();

        if (result.success && result.data) {
          setCategoryChartData(result.data);
        } else {
          logger.error("Category API response not successful:", result);
          setCategoryChartData(tourCategoryData); // Fallback
        }
      } catch (error) {
        logger.error("Error fetching category data:", error);
        setCategoryChartData(tourCategoryData); // Fallback to mock data
      }
    };

    if (!authLoading && isAuthenticated) {
      fetchCategoryData();
    }
  }, [isAuthenticated, authLoading]);

  // Fetch user metrics data từ API
  useEffect(() => {
    const fetchUserMetrics = async () => {
      try {
        const result = await adminAPI.getUserMetrics();

        if (result.success && result.data) {
          const apiData = result.data;

          // Map API data to DetailedMetrics format
          const updatedMetrics = [
            {
              ...detailedMetrics[0],
              value: apiData.totalUsers.value.toLocaleString(),
              change: apiData.totalUsers.change,
              trend: apiData.totalUsers.trend,
            },
            {
              ...detailedMetrics[1],
              value: apiData.newUsersThisMonth.value.toLocaleString(),
              change: apiData.newUsersThisMonth.change,
              trend: apiData.newUsersThisMonth.trend,
              previousValue: apiData.newUsersThisMonth.previousValue.toString(),
            },
            {
              ...detailedMetrics[2],
              value: apiData.usersWithBookings.value.toLocaleString(),
              change: apiData.usersWithBookings.change,
              trend: apiData.usersWithBookings.trend,
              previousValue: apiData.usersWithBookings.previousValue.toString(),
              percentage: apiData.usersWithBookings.percentage,
            },
            {
              ...detailedMetrics[3],
              value: apiData.retentionRate.value,
              change: apiData.retentionRate.change,
              trend: apiData.retentionRate.trend,
              previousValue: apiData.retentionRate.previousValue,
            },
            {
              ...detailedMetrics[4],
              value: apiData.avgReviewsPerUser.value,
              change: apiData.avgReviewsPerUser.change,
              trend: apiData.avgReviewsPerUser.trend,
              rating: apiData.avgReviewsPerUser.rating,
              // NOTE: ⚠️ Chưa có Review model trong backend
            },
            {
              ...detailedMetrics[5],
              value: apiData.blockedUsers.value.toString(),
              change: apiData.blockedUsers.change,
              trend: apiData.blockedUsers.trend,
              // NOTE: ⚠️ Cần thêm field 'status' vào User model
            },
          ];

          setUserMetrics(updatedMetrics);
        } else {
          logger.error("User metrics API response not successful:", result);
        }
      } catch (error) {
        logger.error("Error fetching user metrics:", error);
        // Giữ mock data nếu API fail
      }
    };

    if (!authLoading && isAuthenticated) {
      fetchUserMetrics();
    }
  }, [isAuthenticated, authLoading]);

  // Fetch NEW dashboard charts data
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        // Fetch booking trends
        const bookingTrendsResult = await adminAPI.getBookingTrends();
        if (bookingTrendsResult.success && bookingTrendsResult.data) {
          setBookingTrendsChartData(bookingTrendsResult.data);
        }

        // Fetch tours by region
        const toursByRegionResult = await adminAPI.getToursByRegion();
        if (toursByRegionResult.success && toursByRegionResult.data) {
          setToursByRegionData(toursByRegionResult.data);
        }

        // Fetch age distribution
        const ageDistResult = await adminAPI.getAgeDistribution();
        if (ageDistResult.success && ageDistResult.data) {
          setAgeDistributionData(ageDistResult.data);
        }

        // Fetch top travelers
        const topTravelersResult = await adminAPI.getTopTravelers();
        if (topTravelersResult.success && topTravelersResult.data) {
          setTopTravelersData(topTravelersResult.data);
        }

        // Fetch top popular tours
        const topToursResult = await adminAPI.getTopPopularTours();
        if (topToursResult.success && topToursResult.data) {
          setTopPopularToursData(topToursResult.data);
        }

        // Fetch recent reviews
        const reviewsResult = await adminAPI.getRecentReviews();
        if (reviewsResult.success && reviewsResult.data) {
          setRecentReviewsData(reviewsResult.data);
        }
      } catch (error) {
        logger.error("Error fetching chart data:", error);
        // Giữ mock data nếu API fail
      }
    };

    if (!authLoading && isAuthenticated) {
      fetchChartData();
    }
  }, [isAuthenticated, authLoading]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Refresh Loading Modal */}
      {isRefreshing && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
        >
          <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100 max-w-sm w-full mx-4">
            <div className="flex items-center justify-center mb-4">
              <svg
                className="animate-spin h-12 w-12 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
              Đang tải lại dữ liệu...
            </h3>
            <p className="text-center text-sm text-gray-600">
              Vui lòng chờ trong khi chúng tôi cập nhật thông tin dashboard
            </p>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full animate-pulse"
                style={{ width: "70%" }}
              ></div>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5 sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-700">
              Dashboard
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Tổng quan hoạt động hệ thống
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-500">Cập nhật lần cuối</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatRefreshTime(lastRefresh)}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Làm mới
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Summary Stats - Improved Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {dashboardStats.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>

        {/* Section Title */}
        <div className="pt-4">
          <h2 className="text-xl font-bold text-slate-700 mb-1">
            Phân tích chi tiết
          </h2>
          <p className="text-sm text-gray-600">
            Biểu đồ và thống kê chuyên sâu
          </p>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title={`Doanh thu theo tháng ${selectedYear} (triệu đồng)`}
            subtitle={
              loading
                ? "Đang tải..."
                : `${revenueChartData.length} tháng có dữ liệu`
            }
          >
            <RevenueChart data={revenueChartData} />
          </ChartCard>

          <ChartCard title="Phân loại tour (%)">
            <CategoryPieChart data={categoryChartData} />
          </ChartCard>
        </div>

        {/* Detailed Metrics */}
        <DetailedMetrics metrics={userMetrics} />

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Lượt đặt tour theo tuần">
            <BookingTrendsChart data={bookingTrendsChartData} />
          </ChartCard>

          <ChartCard title="Tour theo khu vực">
            <ToursByRegionChart data={toursByRegionData} />
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <AgeDistributionChart data={ageDistributionData} />
          <TopTravelersTable data={topTravelersData} />
        </div>

        {/* Section Title */}
        <div className="pt-4">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Hoạt động gần đây
          </h2>
          <p className="text-sm text-gray-600">
            Theo dõi các hoạt động mới nhất
          </p>
        </div>

        {/* Tables - Top Popular Tours & Recent Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopPopularToursTable data={topPopularToursData} />
          <RecentReviewsTable data={recentReviewsData} />
        </div>

        {/* Footer Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">💡</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Gợi ý: Xuất báo cáo
              </p>
              <p className="text-xs text-gray-600">
                Tải xuống báo cáo tổng hợp để phân tích sâu hơn
              </p>
            </div>
          </div>
          <button
            onClick={handleExportReport}
            className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Xuất báo cáo
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
