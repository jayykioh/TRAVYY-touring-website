// 📁 src/pages/GuideManagement.jsx
// ============================================

import React, { useState, useMemo, useEffect } from 'react';
import {
  RefreshCw,
  Download,
  Plus,
  Users,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';

// Components
import StatCard from '../components/Dashboard/StatsCard';
import GuideFilters from '../components/Guides/GuideFilters';
import GuideCard from '../components/Guides/GuideCard';
import GuideForm from '../components/Guides/GuideForm';

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
  const [showForm, setShowForm] = useState(false);
  const [editingGuide, setEditingGuide] = useState(null);

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

  const handleAddGuide = () => {
    setEditingGuide(null);
    setShowForm(true);
  };

  const handleEditGuide = (guide) => {
    setEditingGuide(guide);
    setShowForm(true);
  };

  const handleVerifyGuide = (guide) => {
    if (window.confirm(`Xác minh hướng dẫn viên "${guide.name}"?`)) {
      setGuides(guides.map(g => 
        g.id === guide.id 
          ? { ...g, status: 'verified' }
          : g
      ));
      alert('Đã xác minh hướng dẫn viên thành công!');
    }
  };

  const handleViewGuide = (guide) => {
    alert(`Xem chi tiết: ${guide.name}\nĐây là chức năng demo`);
  };

  const handleFormSubmit = (formData) => {
    if (editingGuide) {
      setGuides(guides.map(g => 
        g.id === editingGuide.id 
          ? { ...g, ...formData }
          : g
      ));
      alert('Cập nhật hướng dẫn viên thành công!');
    } else {
      const newGuide = {
        id: Math.max(...guides.map(g => g.id)) + 1,
        ...formData,
        rating: 0,
        totalTours: 0,
        completedTours: 0,
        status: 'pending',
        revenue: 0,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=3B82F6&color=fff`,
        joinDate: new Date().toISOString().split('T')[0],
        certifications: []
      };
      setGuides([...guides, newGuide]);
      alert('Thêm hướng dẫn viên mới thành công!');
    }
    setShowForm(false);
    setEditingGuide(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingGuide(null);
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
            <p className="text-gray-600 mt-1">Quản lý và xác minh hướng dẫn viên trong hệ thống</p>
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
            <button 
              onClick={handleAddGuide}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Thêm HDV
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

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingGuide ? 'Chỉnh sửa Hướng dẫn viên' : 'Thêm Hướng dẫn viên mới'}
                </h2>
              </div>
              <GuideForm 
                guide={editingGuide}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </div>
          </div>
        )}

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
            <p className="text-gray-600 mb-4">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
            <button 
              onClick={handleAddGuide}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Thêm hướng dẫn viên mới
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuides.map((guide) => (
              <GuideCard
                key={guide.id}
                guide={guide}
                onView={handleViewGuide}
                onEdit={handleEditGuide}
                onVerify={handleVerifyGuide}
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


