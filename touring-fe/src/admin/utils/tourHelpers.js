// utils/tourHelpers.js

// Format price to Vietnamese format
export const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price);
};

// Search tours by keyword
export const searchTours = (tours, searchTerm) => {
  if (!searchTerm) return tours;
  
  const term = searchTerm.toLowerCase();
  return tours.filter(tour => 
    tour.title.toLowerCase().includes(term) ||
    tour.location.toLowerCase().includes(term) ||
    (tour.guide && tour.guide.toLowerCase().includes(term))
  );
};

// Filter tours by status
export const filterByStatus = (tours, status) => {
  if (status === 'all') return tours;
  return tours.filter(tour => tour.status === status);
};

// Sort tours by field and order
export const sortTours = (tours, field, order) => {
  return [...tours].sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];
    
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (order === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
};

// Calculate total revenue from tours
export const calculateTotalRevenue = (tours) => {
  return tours.reduce((sum, tour) => sum + (tour.price * tour.booked), 0);
};

// Calculate total bookings
export const calculateTotalBookings = (tours) => {
  return tours.reduce((sum, tour) => sum + tour.booked, 0);
};

// Get tours by status
export const getToursByStatus = (tours, status) => {
  return tours.filter(tour => tour.status === status);
};

// Calculate booking percentage
export const calculateBookingPercentage = (booked, capacity) => {
  if (capacity === 0) return 0;
  return Math.round((booked / capacity) * 100);
};

// Check if tour is full
export const isTourFull = (tour) => {
  return tour.booked >= tour.capacity;
};

// Get available seats
export const getAvailableSeats = (tour) => {
  return Math.max(0, tour.capacity - tour.booked);
};

// Check if tour can be edited
export const canEditTour = (tour) => {
  return tour.status !== 'completed';
};

// Check if tour can be deleted
export const canDeleteTour = (tour) => {
  return tour.booked === 0;
};

// Validate tour data
export const validateTourData = (data) => {
  const errors = {};
  
  if (!data.title || data.title.trim() === '') {
    errors.title = 'Tên tour không được để trống';
  }
  
  if (!data.price || data.price <= 0) {
    errors.price = 'Giá phải lớn hơn 0';
  }
  
  if (!data.capacity || data.capacity <= 0) {
    errors.capacity = 'Sức chứa phải lớn hơn 0';
  }
  
  if (!data.location || data.location.trim() === '') {
    errors.location = 'Địa điểm không được để trống';
  }
  
  if (!data.startDate) {
    errors.startDate = 'Ngày khởi hành không được để trống';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

// Get today date in YYYY-MM-DD format
export const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

// Export tours to CSV format
export const exportToursToCSV = (tours) => {
  const headers = ['ID', 'Tên Tour', 'Địa điểm', 'Giá', 'Sức chứa', 'Đã đặt', 'Trạng thái', 'Hướng dẫn viên'];
  const rows = tours.map(tour => [
    tour.id,
    tour.title,
    tour.location,
    tour.price,
    tour.capacity,
    tour.booked,
    tour.status,
    tour.guide || ''
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return csvContent;
};

// Download CSV file
export const downloadCSV = (content, filename) => {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};