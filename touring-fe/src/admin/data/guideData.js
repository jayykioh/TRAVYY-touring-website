export const MOCK_GUIDES = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@gmail.com',
    phone: '0123456789',
    location: 'Đà Nẵng',
    experience: '5 năm',
    languages: ['Tiếng Việt', 'English', '中文'],
    rating: 4.8,
    totalTours: 156,
    completedTours: 145,
    status: 'verified',
    specialties: ['Văn hóa', 'Ẩm thực', 'Phiêu lưu'],
    avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=3B82F6&color=fff',
    joinDate: '2020-01-15',
    certifications: ['Hướng dẫn viên quốc tế', 'First Aid'],
    revenue: 125000000
  },
  {
    id: 2,
    name: 'Trần Thị B',
    email: 'tranthib@gmail.com',
    phone: '0987654321',
    location: 'Hà Nội',
    experience: '3 năm',
    languages: ['Tiếng Việt', 'English'],
    rating: 4.6,
    totalTours: 89,
    completedTours: 82,
    status: 'pending',
    specialties: ['Lịch sử', 'Văn hóa'],
    avatar: 'https://ui-avatars.com/api/?name=Tran+Thi+B&background=10B981&color=fff',
    joinDate: '2022-03-20',
    certifications: ['Hướng dẫn viên nội địa'],
    revenue: 78000000
  },
  {
    id: 3,
    name: 'Lê Văn C',
    email: 'levanc@gmail.com',
    phone: '0369852147',
    location: 'TP.HCM',
    experience: '7 năm',
    languages: ['Tiếng Việt', 'English', 'Français', '日本語'],
    rating: 4.9,
    totalTours: 234,
    completedTours: 230,
    status: 'verified',
    specialties: ['Luxury', 'Ẩm thực', 'Photography'],
    avatar: 'https://ui-avatars.com/api/?name=Le+Van+C&background=8B5CF6&color=fff',
    joinDate: '2018-06-10',
    certifications: ['Hướng dẫn viên quốc tế', 'Sommelier', 'Photography'],
    revenue: 198000000
  },
  {
    id: 4,
    name: 'Phạm Thị D',
    email: 'phamthid@gmail.com',
    phone: '0456789123',
    location: 'Hội An',
    experience: '2 năm',
    languages: ['Tiếng Việt', 'English'],
    rating: 4.5,
    totalTours: 45,
    completedTours: 43,
    status: 'active',
    specialties: ['Văn hóa', 'Craft'],
    avatar: 'https://ui-avatars.com/api/?name=Pham+Thi+D&background=F59E0B&color=fff',
    joinDate: '2023-01-05',
    certifications: ['Hướng dẫn viên nội địa'],
    revenue: 34000000
  }
];

export const STATUS_LABELS = {
  verified: 'Đã xác minh',
  pending: 'Chờ xác minh',
  active: 'Đang hoạt động',
  suspended: 'Tạm ngưng'
};

export const STATUS_COLORS = {
  verified: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  active: 'bg-blue-100 text-blue-800',
  suspended: 'bg-red-100 text-red-800'
};

export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'verified', label: 'Đã xác minh' },
  { value: 'pending', label: 'Chờ xác minh' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'suspended', label: 'Tạm ngưng' }
];
