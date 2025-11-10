// Admin Mock Data - Constants and Minimal Fallbacks
// Note: Most data is fetched from API - these are fallbacks only

// ==================== TOUR STATUS ====================
export const STATUS_LABELS = {
  active: "Hoạt động",
  inactive: "Tạm ngưng",
  pending: "Chờ duyệt",
  cancelled: "Đã hủy",
  completed: "Hoàn thành",
};

export const STATUS_COLORS = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
};

export const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "active", label: "Hoạt động" },
  { value: "inactive", label: "Tạm ngưng" },
  { value: "pending", label: "Chờ duyệt" },
];

// ==================== TOUR CATEGORIES ====================
export const tourCategoryData = [
  { name: "Văn hóa", value: 35, color: "#007980" },
  { name: "Thiên nhiên", value: 28, color: "#00A896" },
  { name: "Ẩm thực", value: 18, color: "#FFB703" },
  { name: "Phiêu lưu", value: 12, color: "#FB8500" },
  { name: "Biển đảo", value: 7, color: "#219EBC" },
];

// ==================== CHART DATA ====================
export const MOCK_CHART_DATA = {
  revenue: [
    { name: "T1", value: 45 },
    { name: "T2", value: 52 },
    { name: "T3", value: 48 },
    { name: "T4", value: 61 },
    { name: "T5", value: 55 },
    { name: "T6", value: 67 },
    { name: "T7", value: 70 },
  ],
  bookings: [
    { name: "T1", value: 120 },
    { name: "T2", value: 145 },
    { name: "T3", value: 132 },
    { name: "T4", value: 167 },
    { name: "T5", value: 154 },
    { name: "T6", value: 189 },
    { name: "T7", value: 203 },
  ],
};

// ==================== DASHBOARD SUMMARY STATS ====================
export const summaryStats = [
  {
    id: "total-tours",
    label: "Tổng số Tour",
    value: "0",
    subtitle: "Tour đang hoạt động",
    trend: "up",
    change: "+0%",
    icon: "TrendingUp",
    variant: "blue",
  },
  {
    id: "custom-tours",
    label: "Tour tùy chỉnh",
    value: "0",
    subtitle: "Đang chờ duyệt",
    trend: "stable",
    change: "0",
    icon: "FileText",
    variant: "purple",
  },
  {
    id: "new-users",
    label: "Người dùng mới",
    value: "0",
    subtitle: "Tháng này",
    trend: "up",
    change: "+0%",
    icon: "Users",
    variant: "green",
  },
  {
    id: "active-guides",
    label: "HDV hoạt động",
    value: "0",
    subtitle: "Sẵn sàng",
    trend: "up",
    change: "+0",
    icon: "UserCheck",
    variant: "cyan",
  },
  {
    id: "revenue",
    label: "Doanh thu",
    value: "0đ",
    subtitle: "Tháng này",
    trend: "up",
    change: "+0%",
    icon: "DollarSign",
    variant: "emerald",
    breakdown: [
      { label: "API", value: "0đ" },
      { label: "Custom", value: "0đ" },
    ],
  },
  {
    id: "cancellation-rate",
    label: "Tỷ lệ hủy",
    value: "0%",
    subtitle: "Giảm 0% so với T.trước",
    trend: "down",
    change: "-0%",
    icon: "XCircle",
    variant: "red",
  },
  {
    id: "refund-requests",
    label: "Yêu cầu hoàn tiền",
    value: "0",
    subtitle: "Đang xử lý",
    trend: "stable",
    change: "0",
    icon: "RefreshCw",
    variant: "orange",
  },
];

// ==================== DETAILED METRICS ====================
export const detailedMetrics = [
  {
    id: "total-users",
    label: "Tổng người dùng",
    value: "0",
    change: "+0%",
    trend: "up",
    icon: "Users",
  },
  {
    id: "new-users-month",
    label: "Người dùng mới (tháng)",
    value: "0",
    change: "+0%",
    trend: "up",
    previousValue: "0",
    icon: "UserPlus",
  },
  {
    id: "users-with-bookings",
    label: "Người dùng có đặt tour",
    value: "0",
    change: "+0%",
    trend: "up",
    previousValue: "0",
    percentage: "0%",
    icon: "TrendingUp",
  },
  {
    id: "retention-rate",
    label: "Tỷ lệ giữ chân",
    value: "0%",
    change: "+0%",
    trend: "up",
    previousValue: "0%",
    icon: "Target",
  },
  {
    id: "avg-reviews",
    label: "Đánh giá TB/người dùng",
    value: "0",
    change: "+0%",
    trend: "up",
    rating: 0,
    icon: "Star",
  },
  {
    id: "blocked-users",
    label: "Người dùng bị khóa",
    value: "0",
    change: "0",
    trend: "stable",
    icon: "ShieldOff",
  },
];

// ==================== REVENUE DATA ====================
export const revenueData = [
  { name: "T1", value: 0 },
  { name: "T2", value: 0 },
  { name: "T3", value: 0 },
  { name: "T4", value: 0 },
  { name: "T5", value: 0 },
  { name: "T6", value: 0 },
  { name: "T7", value: 0 },
  { name: "T8", value: 0 },
  { name: "T9", value: 0 },
  { name: "T10", value: 0 },
  { name: "T11", value: 0 },
  { name: "T12", value: 0 },
];

// ==================== RECENT TOURS ====================
export const recentTours = [];

// ==================== AVAILABLE GUIDES ====================
export const availableGuides = [];

// ==================== EMPTY MOCK DATA (replaced by API) ====================
export const mockTours = [];
export const mockBookings = [];
export const mockGuides = [];
export const MOCK_TOURS = [];
