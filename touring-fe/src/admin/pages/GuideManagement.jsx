// 📁 src/pages/GuideManagement.jsx
// ============================================

import React, { useState, useMemo, useEffect } from 'react';
import {
  RefreshCw,
  Download,
  Users,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';

// Components
import StatCard from '../components/Dashboard/StatsCard';
import GuideFilters from '../components/Guides/GuideFilters';
import GuideCard from '../components/Guides/GuideCard';

// Data & Utils
import { MOCK_GUIDES } from '../data/guideData';
import {
  searchGuides,
  filterByStatus,
  calculateTotalRevenue,
  calculateTotalTours,
  getGuidesByStatus,
  calculateAverageRating,
  exportGuidesToCSV,
  downloadCSV,
  formatPrice
} from '../utils/guideHelpers';

const GuideManagement = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    setLoading(true);
    setTimeout(() => {
      setGuides(MOCK_GUIDES);
      setLoading(false);
    }, 800);
  };

  const handleRefresh = () => {
    loadMockData();
  };

  const filteredGuides = useMemo(() => {
    let result = guides;
    result = searchGuides(result, searchTerm);
    result = filterByStatus(result, statusFilter);
    return result;
  }, [guides, searchTerm, statusFilter]);

  const totalRevenue = calculateTotalRevenue(guides);
  const totalTours = calculateTotalTours(guides);
  const verifiedGuides = getGuidesByStatus(guides, 'verified').length;
  const pendingGuides = getGuidesByStatus(guides, 'pending').length;
  const averageRating = calculateAverageRating(guides);

  const stats = [
    {
      id: 'total',
      label: 'Tổng HDV',
      value: guides.length,
      subtitle: 'Hướng dẫn viên',
      icon: Users,
      color: 'blue'
    },
    {
      id: 'verified',
      label: 'Đã xác minh',
      value: verifiedGuides,
      subtitle: 'HDV đã xác minh',
      icon: CheckCircle,
      color: 'green'
    },
    {
      id: 'pending',
      label: 'Chờ xác minh',
      value: pendingGuides,
      subtitle: 'Cần xử lý',
      icon: Clock,
      color: 'yellow'
    },
    {
      id: 'rating',
      label: 'Đánh giá TB',
      value: `${averageRating}⭐`,
      subtitle: 'Trung bình',
      icon: Star,
      color: 'purple'
    }
  ];

  const handleExport = () => {
    if (filteredGuides.length === 0) {
      alert('Không có dữ liệu để export');
      return;
    }
    const csvContent = exportGuidesToCSV(filteredGuides);
    downloadCSV(csvContent, `guides_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleViewGuide = (guide) => {
    alert(`Xem chi tiết: ${guide.name}\nĐây là chức năng demo`);
  };

  const handleSyncGuide = async (guide) => {
    // Giả lập đồng bộ dữ liệu từ Agency
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Đồng bộ HDV:', guide.name);
  };

  const handleStatusChange = (guide, newStatus, reason) => {
    setGuides(guides.map(g => 
      g.id === guide.id 
        ? { ...g, activityStatus: newStatus }
        : g
    ));
    console.log(`Chuyển trạng thái ${guide.name} sang ${newStatus}. Lý do: ${reason}`);
    alert(`Đã chuyển trạng thái ${guide.name} thành công!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Hướng dẫn viên</h1>
            <p className="text-gray-600 mt-1">Quản lý và theo dõi hướng dẫn viên trong hệ thống</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleExport}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
            <button 
              onClick={handleRefresh}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Làm mới
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Hiển thị {filteredGuides.length} / {guides.length} hướng dẫn viên
            </div>
            <div className="flex gap-3">
              <div className="text-sm text-gray-600">
                Tổng doanh thu: <span className="font-bold text-green-600">₫{formatPrice(totalRevenue)}</span>
              </div>
              <div className="text-sm text-gray-600">
                Tổng tours: <span className="font-bold text-blue-600">{totalTours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <GuideFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />

        {/* Guides Grid */}
        {filteredGuides.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không tìm thấy hướng dẫn viên
            </h3>
            <p className="text-gray-600">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuides.map((guide) => (
              <GuideCard
                key={guide.id}
                guide={guide}
                onView={handleViewGuide}
                onSync={handleSyncGuide}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredGuides.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">1-{filteredGuides.length}</span> trong tổng số <span className="font-medium">{filteredGuides.length}</span> hướng dẫn viên
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
                Trước
              </button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">1</button>
              <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">2</button>
              <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuideManagement;