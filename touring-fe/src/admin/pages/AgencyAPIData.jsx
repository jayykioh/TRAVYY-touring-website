import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Download, Upload, Filter, MoreVertical, CheckCircle, XCircle, Clock, Eye, Edit, Trash2, AlertCircle, Server, Database, Activity, TrendingUp } from 'lucide-react';
import StatCard from '../components/Dashboard/StatsCard';
import { 
  formatPrice, 
  searchTours, 
  filterByStatus, 
  exportToursToCSV, 
  downloadCSV,
  calculateTotalRevenue,
  calculateTotalBookings,
  getToursByStatus
} from '../utils/tourHelpers';

const AgencyAPIData = () => {
  const [activeTab, setActiveTab] = useState('tours');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncingItem, setSyncingItem] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());

  // Mock data cho tours
  const mockTours = [
    {
      id: 'T001',
      title: 'Ha Long Bay Adventure',
      name: 'Ha Long Bay Adventure',
      category: 'Beach & Island',
      location: 'Ha Long Bay',
      region: 'North Vietnam',
      duration: '3 days 2 nights',
      price: 2500000,
      capacity: 20,
      booked: 15,
      status: 'active',
      lastSync: '2 hours ago',
      apiEndpoint: '/api/tours/T001',
      guide: 'Le Van C'
    },
    {
      id: 'T002',
      title: 'Sapa Trekking Experience',
      name: 'Sapa Trekking Experience',
      category: 'Mountain & Trekking',
      location: 'Sapa',
      region: 'North Vietnam',
      duration: '2 days 1 night',
      price: 1800000,
      capacity: 15,
      booked: 12,
      status: 'active',
      lastSync: '5 hours ago',
      apiEndpoint: '/api/tours/T002',
      guide: 'Pham Thi D'
    },
    {
      id: 'T003',
      title: 'Hoi An Cultural Tour',
      name: 'Hoi An Cultural Tour',
      category: 'Cultural',
      location: 'Hoi An',
      region: 'Central Vietnam',
      duration: '1 day',
      price: 800000,
      capacity: 25,
      booked: 8,
      status: 'pending',
      lastSync: '1 day ago',
      apiEndpoint: '/api/tours/T003',
      guide: 'Le Van C'
    },
    {
      id: 'T004',
      title: 'Mekong Delta Discovery',
      name: 'Mekong Delta Discovery',
      category: 'River & Delta',
      location: 'Mekong Delta',
      region: 'South Vietnam',
      duration: '2 days 1 night',
      price: 1500000,
      capacity: 18,
      booked: 0,
      status: 'inactive',
      lastSync: '3 days ago',
      apiEndpoint: '/api/tours/T004',
      guide: 'Nguyen Van E'
    },
    {
      id: 'T005',
      title: 'Phong Nha Cave Exploration',
      name: 'Phong Nha Cave Exploration',
      category: 'Adventure',
      location: 'Phong Nha',
      region: 'Central Vietnam',
      duration: '2 days 1 night',
      price: 2200000,
      capacity: 12,
      booked: 10,
      status: 'active',
      lastSync: '4 hours ago',
      apiEndpoint: '/api/tours/T005',
      guide: 'Pham Thi D'
    }
  ];

  // Mock data cho bookings
  const mockBookings = [
    {
      id: 'B001',
      tourId: 'T001',
      tourName: 'Ha Long Bay Adventure',
      customerName: 'Nguyen Van A',
      customerEmail: 'nguyenvana@email.com',
      customerPhone: '0901234567',
      bookingDate: '2025-10-15',
      tourDate: '2025-11-20',
      guests: 2,
      status: 'confirmed',
      totalAmount: 5000000,
      lastSync: '1 hour ago',
      paymentStatus: 'paid'
    },
    {
      id: 'B002',
      tourId: 'T002',
      tourName: 'Sapa Trekking Experience',
      customerName: 'Tran Thi B',
      customerEmail: 'tranthib@email.com',
      customerPhone: '0902345678',
      bookingDate: '2025-10-20',
      tourDate: '2025-11-25',
      guests: 2,
      status: 'pending',
      totalAmount: 3600000,
      lastSync: '3 hours ago',
      paymentStatus: 'pending'
    },
    {
      id: 'B003',
      tourId: 'T001',
      tourName: 'Ha Long Bay Adventure',
      customerName: 'Le Van C',
      customerEmail: 'levanc@email.com',
      customerPhone: '0903456789',
      bookingDate: '2025-10-14',
      tourDate: '2025-11-20',
      guests: 3,
      status: 'confirmed',
      totalAmount: 7500000,
      lastSync: '2 hours ago',
      paymentStatus: 'paid'
    }
  ];

  // Mock data cho guides
  const mockGuides = [
    {
      id: 'G001',
      name: 'Le Van C',
      email: 'levanc@travvy.com',
      phone: '0901234567',
      specialties: ['Cultural', 'Historical'],
      languages: ['English', 'Vietnamese'],
      status: 'active',
      rating: 4.8,
      totalTours: 145,
      lastSync: '30 mins ago',
      availability: 'available'
    },
    {
      id: 'G002',
      name: 'Pham Thi D',
      email: 'phamthid@travvy.com',
      phone: '0902345678',
      specialties: ['Mountain', 'Trekking'],
      languages: ['English', 'Vietnamese', 'French'],
      status: 'active',
      rating: 4.9,
      totalTours: 189,
      lastSync: '2 hours ago',
      availability: 'available'
    },
    {
      id: 'G003',
      name: 'Nguyen Van E',
      email: 'nguyenvane@travvy.com',
      phone: '0903456789',
      specialties: ['River', 'Delta'],
      languages: ['English', 'Vietnamese'],
      status: 'inactive',
      rating: 4.5,
      totalTours: 98,
      lastSync: '1 day ago',
      availability: 'unavailable'
    }
  ];

  // Calculate statistics using tourHelpers
  const activeTours = getToursByStatus(mockTours, 'active');
  const totalRevenue = calculateTotalRevenue(mockTours);
  const totalBookings = calculateTotalBookings(mockTours);
  const pendingBookings = mockBookings.filter(b => b.status === 'pending').length;

  // Stats data for StatCard
  const statsData = [
    {
      id: 'total-tours',
      label: 'Total Tours',
      value: mockTours.length.toString(),
      subtitle: `${activeTours.length} active tours`,
      change: '+12%',
      trend: 'up',
      icon: Server,
      iconColor: 'text-blue-600',
      variant: 'aqua',
      chartData: [
        { value: 20 }, { value: 25 }, { value: 22 }, { value: 28 }, { value: 30 }
      ]
    },
    {
      id: 'total-bookings',
      label: 'Total Bookings',
      value: mockBookings.length.toString(),
      subtitle: `${totalBookings} seats booked`,
      change: '+8%',
      trend: 'up',
      icon: Activity,
      iconColor: 'text-green-600',
      variant: 'mint',
      chartData: [
        { value: 15 }, { value: 18 }, { value: 20 }, { value: 22 }, { value: 25 }
      ]
    },
    {
      id: 'revenue',
      label: 'Total Revenue',
      value: `${formatPrice(totalRevenue)} ₫`,
      subtitle: 'From all tours',
      change: '+15%',
      trend: 'up',
      icon: TrendingUp,
      iconColor: 'text-purple-600',
      variant: 'mint',
      chartData: [
        { value: 50 }, { value: 55 }, { value: 60 }, { value: 65 }, { value: 70 }
      ]
    },
    {
      id: 'pending',
      label: 'Pending Requests',
      value: pendingBookings.toString(),
      subtitle: 'Need attention',
      change: '-5%',
      trend: 'down',
      icon: AlertCircle,
      iconColor: 'text-yellow-600',
      variant: 'yellow',
      chartData: [
        { value: 10 }, { value: 8 }, { value: 6 }, { value: 5 }, { value: 3 }
      ]
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      inactive: 'bg-gray-100 text-gray-700',
      confirmed: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700',
      available: 'bg-green-100 text-green-700',
      unavailable: 'bg-gray-100 text-gray-700',
      paid: 'bg-green-100 text-green-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    const icons = {
      active: <CheckCircle className="w-4 h-4" />,
      pending: <Clock className="w-4 h-4" />,
      inactive: <XCircle className="w-4 h-4" />,
      confirmed: <CheckCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />,
      available: <CheckCircle className="w-4 h-4" />,
      unavailable: <XCircle className="w-4 h-4" />,
      paid: <CheckCircle className="w-4 h-4" />
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  const handleSync = (id) => {
    setSyncingItem(id);
    setTimeout(() => {
      setSyncingItem(null);
      setLastSyncTime(new Date());
      alert(`✓ Synced ${id} successfully`);
    }, 1500);
  };

  const handleSyncAll = () => {
    setShowSyncModal(true);
    setTimeout(() => {
      setShowSyncModal(false);
      setLastSyncTime(new Date());
      alert('✓ All data synced successfully');
    }, 2000);
  };

  const handleExport = () => {
    let dataToExport;
    let filename;

    if (activeTab === 'tours') {
      const csvContent = exportToursToCSV(filteredTours);
      downloadCSV(csvContent, `tours-${new Date().toISOString().split('T')[0]}.csv`);
    } else if (activeTab === 'bookings') {
      const headers = ['Booking ID', 'Tour', 'Customer', 'Date', 'Guests', 'Amount', 'Status'];
      const rows = mockBookings.map(b => [
        b.id, b.tourName, b.customerName, b.bookingDate, b.guests, b.totalAmount, b.status
      ]);
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      downloadCSV(csvContent, `bookings-${new Date().toISOString().split('T')[0]}.csv`);
    } else {
      const headers = ['Guide ID', 'Name', 'Email', 'Phone', 'Rating', 'Total Tours', 'Status'];
      const rows = mockGuides.map(g => [
        g.id, g.name, g.email, g.phone, g.rating, g.totalTours, g.status
      ]);
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      downloadCSV(csvContent, `guides-${new Date().toISOString().split('T')[0]}.csv`);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        alert(`Importing ${file.name}...`);
      }
    };
    input.click();
  };

  const handleBulkSync = () => {
    if (selectedItems.length === 0) {
      alert('Please select items to sync');
      return;
    }
    alert(`Syncing ${selectedItems.length} items...`);
    setSelectedItems([]);
  };

  const handleSelectAll = (items) => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item.id));
    }
  };

  const toggleItemSelection = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Use tourHelpers for filtering
  const filteredTours = filterByStatus(
    searchTours(mockTours, searchTerm),
    filterStatus
  );

  const filteredBookings = mockBookings.filter(booking => {
    const matchesSearch = 
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.tourName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || booking.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredGuides = mockGuides.filter(guide => {
    const matchesSearch = 
      guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || guide.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Agency API Data</h1>
            <p className="text-gray-600">Quản lý và đồng bộ dữ liệu từ API</p>
          </div>
          <div className="text-sm text-gray-500">
            Last sync: {lastSyncTime.toLocaleTimeString('vi-VN')}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsData.map(stat => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>

      {/* Sync Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
              <h3 className="text-lg font-semibold">Syncing All Data...</h3>
            </div>
            <p className="text-gray-600 mb-4">Please wait while we sync all data from the API.</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { key: 'tours', label: 'Tours', count: mockTours.length },
              { key: 'bookings', label: 'Bookings', count: mockBookings.length },
              { key: 'guides', label: 'Guides', count: mockGuides.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setSearchTerm('');
                  setFilterStatus('all');
                  setSelectedItems([]);
                }}
                className={`py-4 px-6 font-medium text-sm capitalize flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
                {activeTab === 'bookings' && <option value="confirmed">Confirmed</option>}
                {activeTab === 'bookings' && <option value="cancelled">Cancelled</option>}
              </select>
            </div>

            <div className="flex gap-2 w-full lg:w-auto">
              {selectedItems.length > 0 && (
                <button
                  onClick={handleBulkSync}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Sync Selected ({selectedItems.length})
                </button>
              )}
              <button
                onClick={handleExport}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={handleImport}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Import
              </button>
              <button
                onClick={handleSyncAll}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Sync All
              </button>
            </div>
          </div>
        </div>

        {/* Tours Table */}
        {activeTab === 'tours' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredTours.length && filteredTours.length > 0}
                      onChange={() => handleSelectAll(filteredTours)}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tour ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Sync</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTours.map((tour) => (
                  <tr key={tour.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(tour.id)}
                        onChange={() => toggleItemSelection(tour.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{tour.id}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{tour.name}</div>
                      <div className="text-sm text-gray-500">{tour.duration}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{tour.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{tour.region}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatPrice(tour.price)} ₫
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {tour.booked}/{tour.capacity}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(tour.status)}`}>
                        {getStatusIcon(tour.status)}
                        {tour.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{tour.lastSync}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSync(tour.id)}
                          disabled={syncingItem === tour.id}
                          className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                          title="Sync"
                        >
                          <RefreshCw className={`w-4 h-4 text-gray-600 ${syncingItem === tour.id ? 'animate-spin' : ''}`} />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded" title="View">
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded" title="Edit">
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded" title="Delete">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bookings Table */}
        {activeTab === 'bookings' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredBookings.length && filteredBookings.length > 0}
                      onChange={() => handleSelectAll(filteredBookings)}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tour</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tour Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guests</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(booking.id)}
                        onChange={() => toggleItemSelection(booking.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{booking.id}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{booking.tourName}</div>
                      <div className="text-sm text-gray-500">{booking.tourId}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{booking.customerName}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{booking.customerEmail}</div>
                      <div className="text-sm text-gray-500">{booking.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{booking.tourDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{booking.guests}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatPrice(booking.totalAmount)} ₫
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.paymentStatus)}`}>
                        {getStatusIcon(booking.paymentStatus)}
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSync(booking.id)}
                          disabled={syncingItem === booking.id}
                          className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                        >
                          <RefreshCw className={`w-4 h-4 text-gray-600 ${syncingItem === booking.id ? 'animate-spin' : ''}`} />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Guides Table */}
        {activeTab === 'guides' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredGuides.length && filteredGuides.length > 0}
                      onChange={() => handleSelectAll(filteredGuides)}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guide ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialties</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Languages</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Tours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Availability</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGuides.map((guide) => (
                  <tr key={guide.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(guide.id)}
                        onChange={() => toggleItemSelection(guide.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{guide.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{guide.name}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{guide.email}</div>
                      <div className="text-sm text-gray-500">{guide.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {guide.specialties.map((spec, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {guide.languages.map((lang, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-gray-900">{guide.rating}</span>
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{guide.totalTours} tours</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(guide.status)}`}>
                        {getStatusIcon(guide.status)}
                        {guide.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(guide.availability)}`}>
                        {getStatusIcon(guide.availability)}
                        {guide.availability}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSync(guide.id)}
                          disabled={syncingItem === guide.id}
                          className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                        >
                          <RefreshCw className={`w-4 h-4 text-gray-600 ${syncingItem === guide.id ? 'animate-spin' : ''}`} />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {((activeTab === 'tours' && filteredTours.length === 0) ||
          (activeTab === 'bookings' && filteredBookings.length === 0) ||
          (activeTab === 'guides' && filteredGuides.length === 0)) && (
          <div className="p-12 text-center">
            <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No data found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No data available at the moment'}
            </p>
            {(searchTerm || filterStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* API Endpoint Info */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-blue-600" />
          API Endpoints Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-2">Tours API</h4>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded block mb-2">
              GET /api/admin/tours
            </code>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded block mb-2">
              POST /api/admin/tours/sync
            </code>
            <p className="text-xs text-gray-500">Manage tour data and sync</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-2">Bookings API</h4>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded block mb-2">
              GET /api/admin/bookings
            </code>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded block mb-2">
              POST /api/admin/bookings/sync
            </code>
            <p className="text-xs text-gray-500">Manage booking data and sync</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-2">Guides API</h4>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded block mb-2">
              GET /api/admin/guides
            </code>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded block mb-2">
              POST /api/admin/guides/sync
            </code>
            <p className="text-xs text-gray-500">Manage guide data and sync</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyAPIData;