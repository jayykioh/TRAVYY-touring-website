  export const revenueData = [
    { month: 'Jan', revenue: 150, profit: 90 },
    { month: 'Feb', revenue: 180, profit: 110 },
    { month: 'Mar', revenue: 220, profit: 140 },
    { month: 'Apr', revenue: 250, profit: 160 },
    { month: 'May', revenue: 210, profit: 130 },
    { month: 'Jun', revenue: 280, profit: 180 },
    { month: 'Jul', revenue: 320, profit: 210 },
    { month: 'Aug', revenue: 290, profit: 190 },
    { month: 'Sep', revenue: 350, profit: 230 },
    { month: 'Oct', revenue: 380, profit: 250 },
    { month: 'Nov', revenue: 360, profit: 240 },
    { month: 'Dec', revenue: 410, profit: 270 },
  ];
 
  
 
  // export const tourCategoryData = [
  //   { category: 'Adventure', value: 45, fill: 'var(--color-chart-1)' },
  //   { category: 'Cultural', value: 25, fill: 'var(--color-chart-2)' },
  //   { category: 'Nature', value: 15, fill: 'var(--color-chart-3)' },
  //   { category: 'City', value: 10, fill: 'var(--color-chart-4)' },
  //   { category: 'Relaxation', value: 5, fill: 'var(--color-chart-5)' },
  // ];
  
  
 export const tourCategoryData = [
  { name: 'Adventure', value: 45, color: '#3B82F6' },
  { name: 'Cultural', value: 25, color: '#10B981' },
  { name: 'Nature', value: 15, color: '#F59E0B' },
  { name: 'City', value: 10, color: '#8B5CF6' },
  { name: 'Relaxation', value: 5, color: '#EF4444' }
]; 
  export const bookingTrendsData = [
    { week: 'W1', bookings: 120 },
    { week: 'W2', bookings: 150 },
    { week: 'W3', bookings: 130 },
    { week: 'W4', bookings: 180 },
    { week: 'W5', bookings: 210 },
    { week: 'W6', bookings: 190 },
  ];
  
  export const guidesByRegion = [
    { region: 'North', guides: 45 },
    { region: 'South', guides: 30 },
    { region: 'East', guides: 22 },
    { region: 'West', guides: 28 },
    { region: 'Central', guides: 18 },
  ];
  
  export const recentTours= [
    { id: 1, name: 'Du lịch Hà Nội - Hạ Long', date: '15/10/2025', bookings: '25', status: 'Hoạt động' },
    { id: 2, name: 'Tour Sài Gòn - Phú Quốc', date: '18/10/2025', bookings: '18', status: 'Hoạt động' },
    { id: 3, name: 'Khám phá Đà Nẵng - Hội An', date: '20/10/2025', bookings: '32', status: 'Hoạt động' },
    { id: 4, name: 'Nha Trang - Đảo Điệp Sơn', date: '22/10/2025', bookings: '15', status: 'Chờ xác nhận' },
    { id: 5, name: 'Tây Nguyên - Pleiku - Kon Tum', date: '25/10/2025', bookings: '12', status: 'Hoạt động' },
    { id: 6, name: 'Mù Cang Chải - Sapa', date: '28/10/2025', bookings: '20', status: 'Hoạt động' },
      ];
  
  
  export const topGuides = [
    { id: 'G01', name: 'Alex Johnson', avatar: 'guide-1', toursCompleted: 128, rating: 4.9 },
    { id: 'G02', name: 'Maria Garcia', avatar: 'guide-2', toursCompleted: 112, rating: 4.8 },
    { id: 'G03', name: 'David Smith', avatar: 'guide-3', toursCompleted: 98, rating: 4.8 },
    { id: 'G04', name: 'Sophia Chen', avatar: 'guide-4', toursCompleted: 95, rating: 4.7 },
    { id: 'G05', name: 'Michael Brown', avatar: 'guide-5', toursCompleted: 85, rating: 4.7 },
  ];
import { MapPin, Users, DollarSign, CalendarCheck, Star, AlertTriangle } from 'lucide-react';
export const summaryStats = [
  { 
    id: 1,
    variant: 'mint', // Nền xanh mint nhạt
    label: 'Tổng số tour', 
    subtitle: 'Tours đang hoạt động',
    value: '248', 
    change: '+12%', 
    trend: 'up', 
    icon: MapPin, 
    iconColor: 'text-blue-600',
    chartData: [
      { value: 180 },
      { value: 195 },
      { value: 185 },
      { value: 210 },
      { value: 205 },
      { value: 230 },
      { value: 248 }
    ]
  },
  { 
    id: 2,
    variant: 'gray', // Nền xám nhạt
    label: 'Hướng dẫn viên', 
    subtitle: 'HDV đã đăng ký',
    value: '156', 
    change: '+8%', 
    trend: 'up', 
    icon: Users, 
    iconColor: 'text-green-600',
    chartData: [
      { value: 120 },
      { value: 128 },
      { value: 135 },
      { value: 142 },
      { value: 148 },
      { value: 152 },
      { value: 156 }
    ]
  },
  { 
    id: 3,
    variant: 'mint', // Nền xanh mint
    label: 'Doanh thu tháng', 
    subtitle: 'Tổng doanh thu tháng này',
    value: '2.4B đ', 
    change: '+23%', 
    trend: 'up', 
    icon: DollarSign, 
    iconColor: 'text-yellow-600',
    chartData: [
      { value: 1.5 },
      { value: 1.7 },
      { value: 1.9 },
      { value: 2.0 },
      { value: 2.1 },
      { value: 2.3 },
      { value: 2.4 }
    ]
  },
  { 
    id: 4,
    variant: 'gray', // Nền xám nhạt
    label: 'Đơn đặt tour', 
    subtitle: 'Booking tháng này',
    value: '1,284', 
    change: '+15%', 
    trend: 'up', 
    icon: CalendarCheck, 
    iconColor: 'text-purple-600',
    chartData: [
      { value: 980 },
      { value: 1020 },
      { value: 1050 },
      { value: 1120 },
      { value: 1180 },
      { value: 1230 },
      { value: 1284 }
    ]
  },
  { 
    id: 5,
    variant: 'mint', // Nền xanh mint
    label: 'Đánh giá TB', 
    subtitle: 'Rating trung bình',
    value: '4.7', 
    change: '+0.2', 
    trend: 'up', 
    icon: Star, 
    iconColor: 'text-orange-600',
    chartData: [
      { value: 4.3 },
      { value: 4.4 },
      { value: 4.5 },
      { value: 4.5 },
      { value: 4.6 },
      { value: 4.6 },
      { value: 4.7 }
    ]
  },
  { 
    id: 6,
    variant: 'yellow', // Nền vàng cảnh báo
    label: 'Báo cáo chờ', 
    subtitle: 'Cần xử lý',
    value: '12', 
    change: '-3', 
    trend: 'down', 
    icon: AlertTriangle, 
    iconColor: 'text-red-600',
    chartData: [
      { value: 18 },
      { value: 17 },
      { value: 16 },
      { value: 15 },
      { value: 14 },
      { value: 13 },
      { value: 12 }
    ]
  }
];


export const tours = [
    {
      id: 1,
      title: 'Tour Đà Nẵng - Hội An 3N2Đ',
      location: 'Đà Nẵng',
      guide: 'Nguyễn Văn A',
      price: '2,500,000',
      duration: '3 ngày 2 đêm',
      capacity: 20,
      booked: 15,
      status: 'active',
      rating: 4.8,
      startDate: '2025-10-15',
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=300'
    },
    {
      id: 2,
      title: 'Tour Sapa - Fansipan 4N3Đ',
      location: 'Lào Cai',
      guide: 'Trần Thị B',
      price: '3,800,000',
      duration: '4 ngày 3 đêm',
      capacity: 15,
      booked: 12,
      status: 'pending',
      rating: 4.6,
      startDate: '2025-10-20',
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=300'
    },
    {
      id: 3,
      title: 'Tour Phú Quốc Resort 5N4Đ',
      location: 'Kiên Giang',
      guide: 'Lê Văn C',
      price: '5,200,000',
      duration: '5 ngày 4 đêm',
      capacity: 25,
      booked: 25,
      status: 'completed',
      rating: 4.9,
      startDate: '2025-10-10',
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=300'
    },
    {
      id: 4,
      title: 'Tour Hà Nội - Hạ Long 2N1Đ',
      location: 'Hà Nội',
      guide: 'Phạm Thị D',
      price: '1,900,000',
      duration: '2 ngày 1 đêm',
      capacity: 30,
      booked: 8,
      status: 'active',
      rating: 4.5,
      startDate: '2025-10-18',
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=300'
    }
  ];

  // TOUR

  // data/mockData.js

// Mock Tours Data
export const MOCK_TOURS = [
  {
    id: 1,
    title: 'Du lịch Hội An - Phố cổ',
    location: 'Hội An, Quảng Nam',
    price: 1500000,
    capacity: 30,
    booked: 25,
    status: 'active',
    guide: 'Nguyễn Văn A',
    duration: '3 ngày 2 đêm',
    startDate: '2025-11-01'
  },
  {
    id: 2,
    title: 'Khám phá Sơn Đoòng',
    location: 'Quảng Bình',
    price: 72000000,
    capacity: 10,
    booked: 10,
    status: 'completed',
    guide: 'Trần Thị B',
    duration: '5 ngày 4 đêm',
    startDate: '2025-10-15'
  },
  {
    id: 3,
    title: 'Vịnh Hạ Long',
    location: 'Quảng Ninh',
    price: 2500000,
    capacity: 40,
    booked: 15,
    status: 'active',
    guide: 'Lê Văn C',
    duration: '2 ngày 1 đêm',
    startDate: '2025-11-10'
  },
  {
    id: 4,
    title: 'Phú Quốc - Đảo Ngọc',
    location: 'Kiên Giang',
    price: 5000000,
    capacity: 25,
    booked: 8,
    status: 'pending',
    guide: 'Phạm Thị D',
    duration: '4 ngày 3 đêm',
    startDate: '2025-11-20'
  },
  {
    id: 5,
    title: 'Sapa - Chinh phục Fansipan',
    location: 'Lào Cai',
    price: 3500000,
    capacity: 20,
    booked: 20,
    status: 'active',
    guide: 'Hoàng Văn E',
    duration: '3 ngày 2 đêm',
    startDate: '2025-11-05'
  },
  {
    id: 6,
    title: 'Đà Lạt - Thành phố ngàn hoa',
    location: 'Lâm Đồng',
    price: 2000000,
    capacity: 35,
    booked: 12,
    status: 'inactive',
    guide: 'Vũ Thị F',
    duration: '3 ngày 2 đêm',
    startDate: '2025-12-01'
  }
];

// Status Filter Options
export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'completed', label: 'Đã hoàn thành' },
  { value: 'inactive', label: 'Tạm dừng' }
];

// Tour Status Constants
export const TOUR_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  COMPLETED: 'completed',
  INACTIVE: 'inactive'
};

// Mock Chart Data for Statistics
export const MOCK_CHART_DATA = {
  revenue: [
    { value: 50 }, { value: 65 }, { value: 45 }, { value: 70 }, 
    { value: 85 }, { value: 75 }, { value: 90 }
  ],
  bookings: [
    { value: 30 }, { value: 45 }, { value: 35 }, { value: 55 }, 
    { value: 65 }, { value: 60 }, { value: 78 }
  ]
};

// Status Labels in Vietnamese
export const STATUS_LABELS = {
  active: 'Hoạt động',
  pending: 'Chờ xác nhận',
  completed: 'Hoàn thành',
  inactive: 'Tạm dừng'
};

// Status Color Classes
export const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  inactive: 'bg-gray-100 text-gray-800'
};

// data/mockData.js
export const mockTours = [
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
    guide: 'Le Van C',
    startDate: '2025-11-20',
    description: 'Explore the stunning beauty of Ha Long Bay'
  },
  // ... thêm tours khác
];

export const mockBookings = [
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
  // ... thêm bookings khác
];

export const mockGuides = [
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
  // ... thêm guides khác
];