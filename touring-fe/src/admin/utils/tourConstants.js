import { MapPin, CheckCircle, Clock, Calendar } from 'lucide-react';

// ============= TOUR STATUS CONSTANTS =============
export const TOUR_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// ============= STATUS CONFIG =============
export const STATUS_CONFIG = {
  active: { 
    label: 'Đang hoạt động', 
    class: 'bg-green-100 text-green-800',
    color: 'green'
  },
  pending: { 
    label: 'Chờ duyệt', 
    class: 'bg-yellow-100 text-yellow-800',
    color: 'yellow'
  },
  completed: { 
    label: 'Đã hoàn thành', 
    class: 'bg-blue-100 text-blue-800',
    color: 'blue'
  },
  cancelled: { 
    label: 'Đã hủy', 
    class: 'bg-red-100 text-red-800',
    color: 'red'
  }
};

// ============= STATS CONFIGURATION =============
export const TOUR_STATS_CONFIG = [
  {
    id: 'total-tours',
    label: 'Tổng tour',
    value: '156',
    subtitle: 'Tất cả tour',
    icon: MapPin,
    iconColor: 'text-blue-600',
    variant: 'aqua',
    trend: 'up',
    change: '+12%',
    chartData: [
      { value: 120 },
      { value: 135 },
      { value: 128 },
      { value: 142 },
      { value: 150 },
      { value: 156 }
    ]
  },
  {
    id: 'active-tours',
    label: 'Đang hoạt động',
    value: '89',
    subtitle: 'Tours đang mở',
    icon: CheckCircle,
    iconColor: 'text-green-600',
    variant: 'mint',
    trend: 'up',
    change: '+8%',
    chartData: [
      { value: 75 },
      { value: 78 },
      { value: 82 },
      { value: 85 },
      { value: 87 },
      { value: 89 }
    ]
  },
  {
    id: 'pending-tours',
    label: 'Chờ duyệt',
    value: '23',
    subtitle: 'Cần xử lý',
    icon: Clock,
    iconColor: 'text-yellow-600',
    variant: 'yellow',
    trend: 'down',
    change: '-15%',
    chartData: [
      { value: 30 },
      { value: 28 },
      { value: 26 },
      { value: 25 },
      { value: 24 },
      { value: 23 }
    ]
  },
  {
    id: 'completed-tours',
    label: 'Đã hoàn thành',
    value: '44',
    subtitle: 'Tours thành công',
    icon: Calendar,
    iconColor: 'text-purple-600',
    variant: 'purple',
    trend: 'up',
    change: '+25%',
    chartData: [
      { value: 30 },
      { value: 33 },
      { value: 36 },
      { value: 39 },
      { value: 42 },
      { value: 44 }
    ]
  }
];

// ============= FILTER OPTIONS =============
export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'completed', label: 'Đã hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' }
];

// ============= TABLE COLUMNS =============
export const TOUR_TABLE_COLUMNS = [
  { key: 'tour', label: 'Tour', sortable: true },
  { key: 'location', label: 'Địa điểm', sortable: true },
  { key: 'guide', label: 'Hướng dẫn viên', sortable: true },
  { key: 'price', label: 'Giá', sortable: true },
  { key: 'capacity', label: 'Sức chứa', sortable: false },
  { key: 'status', label: 'Trạng thái', sortable: true },
  { key: 'rating', label: 'Đánh giá', sortable: true },
  { key: 'actions', label: 'Hành động', sortable: false }
];

// ============= PAGINATION =============
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
};

// ============= VALIDATION RULES =============
export const TOUR_VALIDATION = {
  TITLE_MIN_LENGTH: 10,
  TITLE_MAX_LENGTH: 200,
  PRICE_MIN: 0,
  PRICE_MAX: 100000000,
  CAPACITY_MIN: 1,
  CAPACITY_MAX: 1000,
  DURATION_MIN: 1,
  DURATION_MAX: 365
};