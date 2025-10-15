// src/admin/components/Dashboard/Dashboard.jsx

import React from 'react';
import StatCard from '../Dashboard/StatsCard';
import ChartCard from '../Common/ChartCard';
import RevenueChart from './RevenueChart';
import CategoryPieChart from './CategoryPieChart';
import BookingTrendsChart from './BookingTrendsChart';
import GuidesByRegionChart from './GuidesByRegionChart';
import RecentToursTable from './RecentToursTable';
import TopGuidesTable from './TopGuidesTable';
import {
  summaryStats,
  revenueData,
  tourCategoryData,
  bookingTrendsData,
  guidesByRegion,
  recentTours,
  topGuides
} from '../../data/mockData';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5 sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Tổng quan hoạt động hệ thống</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-500">Cập nhật lần cuối</p>
              <p className="text-sm font-semibold text-gray-900">11/10/2025 - 14:30</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Làm mới
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Summary Stats - Improved Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {summaryStats.map(stat => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>

        {/* Section Title */}
        <div className="pt-4">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Phân tích chi tiết</h2>
          <p className="text-sm text-gray-600">Biểu đồ và thống kê chuyên sâu</p>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Doanh thu theo tháng (triệu đồng)">
            <RevenueChart data={revenueData} />
          </ChartCard>

          <ChartCard title="Phân loại tour (%)">
            <CategoryPieChart data={tourCategoryData} />
          </ChartCard>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Lượt đặt tour theo tuần">
            <BookingTrendsChart data={bookingTrendsData} />
          </ChartCard>

          <ChartCard title="Hướng dẫn viên theo khu vực">
            <GuidesByRegionChart data={guidesByRegion} />
          </ChartCard>
        </div>

        {/* Section Title */}
        <div className="pt-4">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Hoạt động gần đây</h2>
          <p className="text-sm text-gray-600">Theo dõi các hoạt động mới nhất</p>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentToursTable data={recentTours} />
          <TopGuidesTable data={topGuides} />
        </div>

        {/* Footer Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">💡</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Gợi ý: Xuất báo cáo</p>
              <p className="text-xs text-gray-600">Tải xuống báo cáo tổng hợp để phân tích sâu hơn</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Xuất báo cáo
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;