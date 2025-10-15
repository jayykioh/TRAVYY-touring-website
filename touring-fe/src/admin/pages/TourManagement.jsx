// components/TourManagement.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { RefreshCw, Download, Plus } from 'lucide-react';
import { Users, DollarSign, Calendar, MapPin } from 'lucide-react';

// Components
import StatCard from '../components/Dashboard/StatsCard';
import TourFilters from '../components/Tours/TourFilters';
import TourTableRow from '../components/Tours/TourTableRow';
import TourForm from '../components/Tours/TourForm';

// Data & Utils
import { MOCK_TOURS, MOCK_CHART_DATA } from '../data/mockData';
import {
  searchTours,
  filterByStatus,
  sortTours,
  calculateTotalRevenue,
  calculateTotalBookings,
  getToursByStatus,
  exportToursToCSV,
  downloadCSV
} from '../utils/tourHelpers';

const TourManagement = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ field: 'title', order: 'asc' });
  const [showForm, setShowForm] = useState(false);
  const [editingTour, setEditingTour] = useState(null);

  // Simulate API loading with mock data
  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    setLoading(true);
    setTimeout(() => {
      setTours(MOCK_TOURS);
      setLoading(false);
    }, 800);
  };

  // Reload tours
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setTours(MOCK_TOURS);
      setLoading(false);
    }, 500);
  };

  // Apply filters and search
  const filteredTours = useMemo(() => {
    let result = tours;
    result = searchTours(result, searchTerm);
    result = filterByStatus(result, statusFilter);
    result = sortTours(result, sortConfig.field, sortConfig.order);
    return result;
  }, [tours, searchTerm, statusFilter, sortConfig]);

  // Calculate statistics
  const totalRevenue = calculateTotalRevenue(filteredTours);
  const totalBookings = calculateTotalBookings(filteredTours);
  const activeTours = getToursByStatus(tours, 'active').length;
  const pendingTours = getToursByStatus(tours, 'pending').length;

  // Stats configuration
  const stats = [
    {
      id: 'revenue',
      label: 'Tổng doanh thu',
      value: `${new Intl.NumberFormat('vi-VN').format(totalRevenue)} VNĐ`,
      subtitle: 'Từ các tour đã đặt',
      trend: 'up',
      change: '+12.5%',
      icon: DollarSign,
      iconColor: 'text-green-600',
      variant: 'mint',
      chartData: MOCK_CHART_DATA.revenue
    },
    {
      id: 'bookings',
      label: 'Tổng đặt chỗ',
      value: totalBookings,
      subtitle: 'Khách hàng đã đặt',
      trend: 'up',
      change: '+8.3%',
      icon: Users,
      iconColor: 'text-blue-600',
      variant: 'aqua',
      chartData: MOCK_CHART_DATA.bookings
    },
    {
      id: 'active',
      label: 'Tours đang hoạt động',
      value: activeTours,
      subtitle: 'Đang mở đặt chỗ',
      trend: 'up',
      change: '+2',
      icon: MapPin,
      iconColor: 'text-purple-600',
      variant: 'mint',
      chartData: []
    },
    {
      id: 'pending',
      label: 'Tours chờ xác nhận',
      value: pendingTours,
      subtitle: 'Cần xử lý',
      trend: 'down',
      change: '-1',
      icon: Calendar,
      iconColor: 'text-orange-600',
      variant: 'yellow',
      chartData: []
    }
  ];

  // Handle Export CSV
  const handleExport = () => {
    if (filteredTours.length === 0) {
      alert('Không có dữ liệu để export');
      return;
    }
    
    const csvContent = exportToursToCSV(filteredTours);
    downloadCSV(csvContent, `tours_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // Handle Add Tour
  const handleAddTour = () => {
    setEditingTour(null);
    setShowForm(true);
  };

  // Handle Edit Tour
  const handleEditTour = (tour) => {
    setEditingTour(tour);
    setShowForm(true);
  };

  // Handle Delete Tour
  const handleDeleteTour = (tour) => {
    if (window.confirm(`Bạn có chắc muốn xóa tour "${tour.title}"?`)) {
      setTours(tours.filter(t => t.id !== tour.id));
      alert('Đã xóa tour thành công!');
    }
  };

  // Handle Form Submit
  const handleFormSubmit = (formData) => {
    if (editingTour) {
      // Update existing tour
      setTours(tours.map(t => 
        t.id === editingTour.id 
          ? { ...t, ...formData }
          : t
      ));
      alert('Cập nhật tour thành công!');
    } else {
      // Add new tour
      const newTour = {
        id: Math.max(...tours.map(t => t.id)) + 1,
        ...formData,
        booked: 0,
        status: 'pending'
      };
      setTours([...tours, newTour]);
      alert('Thêm tour mới thành công!');
    }
    setShowForm(false);
    setEditingTour(null);
  };

  // Handle Form Cancel
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTour(null);
  };

  // Loading state
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Tour</h1>
          <p className="text-gray-600">Tổng quan và quản lý các tour du lịch</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Hiển thị {filteredTours.length} / {tours.length} tours
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Làm mới
              </button>
              <button
                onClick={handleExport}
                disabled={filteredTours.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button 
                onClick={handleAddTour}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Thêm Tour
              </button>
            </div>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingTour ? 'Chỉnh sửa Tour' : 'Thêm Tour Mới'}
                </h2>
              </div>
              <TourForm 
                tour={editingTour}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </div>
          </div>
        )}

        {/* Filters */}
        <TourFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />

        {/* Tour List */}
        <div className="mt-6">
          {filteredTours.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🏖️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Không tìm thấy tour
              </h3>
              <p className="text-gray-600 mb-4">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tour
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giá
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Booking
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTours.map((tour) => (
                      <TourTableRow
                        key={tour.id}
                        tour={tour}
                        onEdit={handleEditTour}
                        onDelete={handleDeleteTour}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TourManagement;