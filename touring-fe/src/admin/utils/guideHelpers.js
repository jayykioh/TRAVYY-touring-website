// 📁 src/utils/guideHelpers.js
// ============================================

// Format price to Vietnamese format
export const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price);
};

// Search guides by keyword
export const searchGuides = (guides, searchTerm) => {
  if (!searchTerm) return guides;
  
  const term = searchTerm.toLowerCase();
  return guides.filter(guide => 
    guide.name.toLowerCase().includes(term) ||
    guide.email.toLowerCase().includes(term) ||
    guide.location.toLowerCase().includes(term)
  );
};

// Filter guides by status
export const filterByStatus = (guides, status) => {
  if (status === 'all') return guides;
  return guides.filter(guide => guide.status === status);
};

// Calculate total revenue from guides
export const calculateTotalRevenue = (guides) => {
  return guides.reduce((sum, guide) => sum + guide.revenue, 0);
};

// Calculate total tours
export const calculateTotalTours = (guides) => {
  return guides.reduce((sum, guide) => sum + guide.totalTours, 0);
};

// Get guides by status
export const getGuidesByStatus = (guides, status) => {
  return guides.filter(guide => guide.status === status);
};

// Calculate average rating
export const calculateAverageRating = (guides) => {
  if (guides.length === 0) return 0;
  const sum = guides.reduce((acc, guide) => acc + guide.rating, 0);
  return (sum / guides.length).toFixed(1);
};

// Validate guide data
export const validateGuideData = (data) => {
  const errors = {};
  
  if (!data.name || data.name.trim() === '') {
    errors.name = 'Tên hướng dẫn viên không được để trống';
  }
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Email không hợp lệ';
  }
  
  if (!data.phone || !/^[0-9]{10}$/.test(data.phone)) {
    errors.phone = 'Số điện thoại phải có 10 chữ số';
  }
  
  if (!data.location || data.location.trim() === '') {
    errors.location = 'Địa điểm không được để trống';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

// Export guides to CSV format
export const exportGuidesToCSV = (guides) => {
  const headers = ['ID', 'Tên', 'Email', 'Điện thoại', 'Địa điểm', 'Kinh nghiệm', 'Đánh giá', 'Tổng Tours', 'Doanh thu', 'Trạng thái'];
  const rows = guides.map(guide => [
    guide.id,
    guide.name,
    guide.email,
    guide.phone,
    guide.location,
    guide.experience,
    guide.rating,
    guide.totalTours,
    guide.revenue,
    guide.status
  ]);
  
  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
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