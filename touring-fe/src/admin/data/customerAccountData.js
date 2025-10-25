// Mock data for Customer Accounts Management

export const CUSTOMER_STATUS = {
  ACTIVE: 'active',
  BANNED: 'banned',
  INACTIVE: 'inactive',
  PENDING: 'pending'
};

export const CUSTOMER_GENDER = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other'
};

export const BOOKING_STATUS = {
  COMPLETED: 'completed',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
  IN_PROGRESS: 'in_progress'
};

export const ACTIVITY_TYPE = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  BOOKING: 'booking',
  PAYMENT: 'payment',
  REQUEST: 'request',
  REVIEW: 'review',
  UPDATE_PROFILE: 'update_profile'
};

export const STATUS_LABELS = {
  [CUSTOMER_STATUS.ACTIVE]: 'Hoạt động',
  [CUSTOMER_STATUS.BANNED]: 'Bị khóa',
  [CUSTOMER_STATUS.INACTIVE]: 'Không hoạt động',
  [CUSTOMER_STATUS.PENDING]: 'Chờ xác thực'
};

export const STATUS_COLORS = {
  [CUSTOMER_STATUS.ACTIVE]: 'bg-green-100 text-green-800',
  [CUSTOMER_STATUS.BANNED]: 'bg-red-100 text-red-800',
  [CUSTOMER_STATUS.INACTIVE]: 'bg-gray-100 text-gray-800',
  [CUSTOMER_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800'
};

export const GENDER_LABELS = {
  [CUSTOMER_GENDER.MALE]: 'Nam',
  [CUSTOMER_GENDER.FEMALE]: 'Nữ',
  [CUSTOMER_GENDER.OTHER]: 'Khác'
};

export const BOOKING_STATUS_LABELS = {
  [BOOKING_STATUS.COMPLETED]: 'Hoàn thành',
  [BOOKING_STATUS.PENDING]: 'Chờ khởi hành',
  [BOOKING_STATUS.CANCELLED]: 'Đã hủy',
  [BOOKING_STATUS.IN_PROGRESS]: 'Đang diễn ra'
};

export const BOOKING_STATUS_COLORS = {
  [BOOKING_STATUS.COMPLETED]: 'bg-green-100 text-green-800',
  [BOOKING_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [BOOKING_STATUS.CANCELLED]: 'bg-red-100 text-red-800',
  [BOOKING_STATUS.IN_PROGRESS]: 'bg-blue-100 text-blue-800'
};

export const ACTIVITY_LABELS = {
  [ACTIVITY_TYPE.LOGIN]: 'Đăng nhập hệ thống',
  [ACTIVITY_TYPE.LOGOUT]: 'Đăng xuất',
  [ACTIVITY_TYPE.BOOKING]: 'Đặt tour',
  [ACTIVITY_TYPE.PAYMENT]: 'Thanh toán',
  [ACTIVITY_TYPE.REQUEST]: 'Gửi yêu cầu',
  [ACTIVITY_TYPE.REVIEW]: 'Đánh giá tour',
  [ACTIVITY_TYPE.UPDATE_PROFILE]: 'Cập nhật hồ sơ'
};

export const ACTIVITY_ICONS = {
  [ACTIVITY_TYPE.LOGIN]: '🔓',
  [ACTIVITY_TYPE.LOGOUT]: '🔒',
  [ACTIVITY_TYPE.BOOKING]: '🎫',
  [ACTIVITY_TYPE.PAYMENT]: '💳',
  [ACTIVITY_TYPE.REQUEST]: '📝',
  [ACTIVITY_TYPE.REVIEW]: '⭐',
  [ACTIVITY_TYPE.UPDATE_PROFILE]: '👤'
};

// Mock customer accounts data
export const MOCK_CUSTOMER_ACCOUNTS = [
  {
    _id: 'CUST001',
    avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=3B82F6&color=fff',
    fullName: 'Nguyễn Văn A',
    email: 'nguyenvana@gmail.com',
    phone: '0123456789',
    gender: CUSTOMER_GENDER.MALE,
    dateOfBirth: '1999-05-20',
    address: 'Đà Nẵng, Việt Nam',
    createdAt: '2024-03-12T08:00:00Z',
    status: CUSTOMER_STATUS.ACTIVE,
    totalSpent: 35000000,
    totalBookings: 8,
    averageRating: 4.6,
    bookingHistory: [
      {
        bookingId: 'T001',
        tourName: 'Tour Huế 3N2Đ',
        departureDate: '2025-10-12',
        price: 4500000,
        status: BOOKING_STATUS.COMPLETED,
        reviewRating: 5
      },
      {
        bookingId: 'T002',
        tourName: 'Tour Bà Nà 1N2Đ',
        departureDate: '2025-10-28',
        price: 1200000,
        status: BOOKING_STATUS.PENDING,
        reviewRating: null
      },
      {
        bookingId: 'T003',
        tourName: 'Tour Hà Giang 4N3Đ',
        departureDate: '2025-09-05',
        price: 6000000,
        status: BOOKING_STATUS.CANCELLED,
        reviewRating: null
      }
    ],
    requests: [
      {
        type: 'custom_tour',
        summary: 'Muốn tour riêng đi Huế 2N1Đ',
        date: '2025-10-02',
        status: 'completed'
      },
      {
        type: 'feedback',
        summary: 'Hướng dẫn viên thân thiện',
        date: '2025-09-15',
        status: 'completed'
      }
    ],
    activityLog: [
      {
        timestamp: '2025-10-24T08:20:00Z',
        type: ACTIVITY_TYPE.PAYMENT,
        description: 'Thanh toán tour "Đà Lạt 3N2Đ"'
      },
      {
        timestamp: '2025-10-23T10:35:00Z',
        type: ACTIVITY_TYPE.REQUEST,
        description: 'Gửi yêu cầu custom tour'
      },
      {
        timestamp: '2025-10-23T10:32:00Z',
        type: ACTIVITY_TYPE.LOGIN,
        description: 'Đăng nhập hệ thống'
      }
    ]
  },
  {
    _id: 'CUST002',
    avatar: 'https://ui-avatars.com/api/?name=Tran+Thi+B&background=EC4899&color=fff',
    fullName: 'Trần Thị B',
    email: 'tranthib@gmail.com',
    phone: '0987654321',
    gender: CUSTOMER_GENDER.FEMALE,
    dateOfBirth: '1995-08-15',
    address: 'Hà Nội, Việt Nam',
    createdAt: '2024-01-20T10:00:00Z',
    status: CUSTOMER_STATUS.ACTIVE,
    totalSpent: 52000000,
    totalBookings: 12,
    averageRating: 4.8,
    bookingHistory: [
      {
        bookingId: 'T004',
        tourName: 'Tour Sapa 3N2Đ',
        departureDate: '2025-11-15',
        price: 5500000,
        status: BOOKING_STATUS.PENDING,
        reviewRating: null
      },
      {
        bookingId: 'T005',
        tourName: 'Tour Phú Quốc 4N3Đ',
        departureDate: '2025-09-20',
        price: 8000000,
        status: BOOKING_STATUS.COMPLETED,
        reviewRating: 5
      }
    ],
    requests: [
      {
        type: 'booking_inquiry',
        summary: 'Hỏi về tour Phú Quốc',
        date: '2025-10-19',
        status: 'in_progress'
      }
    ],
    activityLog: [
      {
        timestamp: '2025-10-24T09:15:00Z',
        type: ACTIVITY_TYPE.BOOKING,
        description: 'Đặt tour "Sapa 3N2Đ"'
      },
      {
        timestamp: '2025-10-24T09:10:00Z',
        type: ACTIVITY_TYPE.LOGIN,
        description: 'Đăng nhập hệ thống'
      }
    ]
  },
  {
    _id: 'CUST003',
    avatar: 'https://ui-avatars.com/api/?name=Le+Van+C&background=10B981&color=fff',
    fullName: 'Lê Văn C',
    email: 'levanc@gmail.com',
    phone: '0912345678',
    gender: CUSTOMER_GENDER.MALE,
    dateOfBirth: '1988-12-03',
    address: 'TP.HCM, Việt Nam',
    createdAt: '2023-11-05T14:00:00Z',
    status: CUSTOMER_STATUS.ACTIVE,
    totalSpent: 68000000,
    totalBookings: 15,
    averageRating: 4.5,
    bookingHistory: [
      {
        bookingId: 'T006',
        tourName: 'Tour Đà Lạt 3N2Đ',
        departureDate: '2025-10-15',
        price: 4200000,
        status: BOOKING_STATUS.COMPLETED,
        reviewRating: 3
      }
    ],
    requests: [
      {
        type: 'complaint',
        summary: 'Khiếu nại về chất lượng dịch vụ',
        date: '2025-10-18',
        status: 'in_progress'
      }
    ],
    activityLog: [
      {
        timestamp: '2025-10-19T16:30:00Z',
        type: ACTIVITY_TYPE.REVIEW,
        description: 'Đánh giá tour "Đà Lạt 3N2Đ"'
      },
      {
        timestamp: '2025-10-18T10:00:00Z',
        type: ACTIVITY_TYPE.REQUEST,
        description: 'Gửi khiếu nại về dịch vụ'
      }
    ]
  },
  {
    _id: 'CUST004',
    avatar: 'https://ui-avatars.com/api/?name=Pham+Thi+D&background=F59E0B&color=fff',
    fullName: 'Phạm Thị D',
    email: 'phamthid@gmail.com',
    phone: '0934567890',
    gender: CUSTOMER_GENDER.FEMALE,
    dateOfBirth: '1997-03-25',
    address: 'Nha Trang, Việt Nam',
    createdAt: '2024-06-10T09:00:00Z',
    status: CUSTOMER_STATUS.ACTIVE,
    totalSpent: 28000000,
    totalBookings: 6,
    averageRating: 4.7,
    bookingHistory: [
      {
        bookingId: 'T007',
        tourName: 'Tour Nha Trang Honeymoon',
        departureDate: '2025-11-10',
        price: 7500000,
        status: BOOKING_STATUS.PENDING,
        reviewRating: null
      }
    ],
    requests: [
      {
        type: 'special_request',
        summary: 'Yêu cầu đặc biệt cho honeymoon',
        date: '2025-10-21',
        status: 'pending'
      }
    ],
    activityLog: [
      {
        timestamp: '2025-10-21T09:00:00Z',
        type: ACTIVITY_TYPE.REQUEST,
        description: 'Gửi yêu cầu đặc biệt'
      }
    ]
  },
  {
    _id: 'CUST005',
    avatar: 'https://ui-avatars.com/api/?name=Hoang+Van+E&background=8B5CF6&color=fff',
    fullName: 'Hoàng Văn E',
    email: 'hoangvane@gmail.com',
    phone: '0945678901',
    gender: CUSTOMER_GENDER.MALE,
    dateOfBirth: '1992-07-18',
    address: 'Hải Phòng, Việt Nam',
    createdAt: '2024-08-22T11:00:00Z',
    status: CUSTOMER_STATUS.BANNED,
    totalSpent: 15000000,
    totalBookings: 3,
    averageRating: 3.2,
    bookingHistory: [
      {
        bookingId: 'T008',
        tourName: 'Tour Hạ Long 2N1Đ',
        departureDate: '2025-09-28',
        price: 3500000,
        status: BOOKING_STATUS.CANCELLED,
        reviewRating: 1
      }
    ],
    requests: [
      {
        type: 'complaint',
        summary: 'Nhiều khiếu nại không hợp lý',
        date: '2025-10-15',
        status: 'cancelled'
      }
    ],
    activityLog: [
      {
        timestamp: '2025-10-20T14:00:00Z',
        type: ACTIVITY_TYPE.LOGIN,
        description: 'Đăng nhập hệ thống (bị từ chối)'
      }
    ]
  },
  {
    _id: 'CUST006',
    avatar: 'https://ui-avatars.com/api/?name=Do+Thi+F&background=EF4444&color=fff',
    fullName: 'Đỗ Thị F',
    email: 'dothif@gmail.com',
    phone: '0956789012',
    gender: CUSTOMER_GENDER.FEMALE,
    dateOfBirth: '1993-11-30',
    address: 'Vũng Tàu, Việt Nam',
    createdAt: '2024-04-15T13:00:00Z',
    status: CUSTOMER_STATUS.ACTIVE,
    totalSpent: 42000000,
    totalBookings: 9,
    averageRating: 4.4,
    bookingHistory: [
      {
        bookingId: 'T009',
        tourName: 'Tour Team Building Vũng Tàu',
        departureDate: '2025-11-05',
        price: 12000000,
        status: BOOKING_STATUS.PENDING,
        reviewRating: null
      }
    ],
    requests: [
      {
        type: 'custom_tour',
        summary: 'Tour team building công ty',
        date: '2025-10-20',
        status: 'in_progress'
      }
    ],
    activityLog: [
      {
        timestamp: '2025-10-21T10:30:00Z',
        type: ACTIVITY_TYPE.REQUEST,
        description: 'Nhận báo giá tour team building'
      },
      {
        timestamp: '2025-10-20T11:00:00Z',
        type: ACTIVITY_TYPE.REQUEST,
        description: 'Gửi yêu cầu custom tour'
      }
    ]
  },
  {
    _id: 'CUST007',
    avatar: 'https://ui-avatars.com/api/?name=Vu+Van+G&background=06B6D4&color=fff',
    fullName: 'Vũ Văn G',
    email: 'vuvang@gmail.com',
    phone: '0967890123',
    gender: CUSTOMER_GENDER.MALE,
    dateOfBirth: '1990-02-14',
    address: 'Đà Nẵng, Việt Nam',
    createdAt: '2023-09-10T15:00:00Z',
    status: CUSTOMER_STATUS.ACTIVE,
    totalSpent: 75000000,
    totalBookings: 18,
    averageRating: 4.9,
    bookingHistory: [
      {
        bookingId: 'T010',
        tourName: 'Tour Thái Lan 5N4Đ',
        departureDate: '2025-12-01',
        price: 15000000,
        status: BOOKING_STATUS.PENDING,
        reviewRating: null
      }
    ],
    requests: [
      {
        type: 'booking_inquiry',
        summary: 'Hỏi về visa Thái Lan',
        date: '2025-10-16',
        status: 'completed'
      }
    ],
    activityLog: [
      {
        timestamp: '2025-10-24T10:00:00Z',
        type: ACTIVITY_TYPE.PAYMENT,
        description: 'Thanh toán tour Thái Lan'
      },
      {
        timestamp: '2025-10-17T09:00:00Z',
        type: ACTIVITY_TYPE.REQUEST,
        description: 'Hỏi về visa'
      }
    ]
  },
  {
    _id: 'CUST008',
    avatar: 'https://ui-avatars.com/api/?name=Bui+Thi+H&background=84CC16&color=fff',
    fullName: 'Bùi Thị H',
    email: 'buithih@gmail.com',
    phone: '0978901234',
    gender: CUSTOMER_GENDER.FEMALE,
    dateOfBirth: '1996-09-08',
    address: 'Huế, Việt Nam',
    createdAt: '2024-07-25T12:00:00Z',
    status: CUSTOMER_STATUS.ACTIVE,
    totalSpent: 31000000,
    totalBookings: 7,
    averageRating: 4.3,
    bookingHistory: [
      {
        bookingId: 'T011',
        tourName: 'Tour Sapa Accessible',
        departureDate: '2025-11-20',
        price: 8500000,
        status: BOOKING_STATUS.PENDING,
        reviewRating: null
      }
    ],
    requests: [
      {
        type: 'special_request',
        summary: 'Hỗ trợ người khuyết tật',
        date: '2025-10-21',
        status: 'pending'
      }
    ],
    activityLog: [
      {
        timestamp: '2025-10-21T14:30:00Z',
        type: ACTIVITY_TYPE.REQUEST,
        description: 'Gửi yêu cầu hỗ trợ đặc biệt'
      }
    ]
  },
  {
    _id: 'CUST009',
    avatar: 'https://ui-avatars.com/api/?name=Dinh+Van+I&background=F97316&color=fff',
    fullName: 'Đinh Văn I',
    email: 'dinhvani@gmail.com',
    phone: '0989012345',
    gender: CUSTOMER_GENDER.MALE,
    dateOfBirth: '1994-04-22',
    address: 'Huế, Việt Nam',
    createdAt: '2023-12-18T16:00:00Z',
    status: CUSTOMER_STATUS.ACTIVE,
    totalSpent: 58000000,
    totalBookings: 13,
    averageRating: 4.7,
    bookingHistory: [
      {
        bookingId: 'T012',
        tourName: 'Tour Huế - Đà Nẵng 3N2Đ',
        departureDate: '2025-09-12',
        price: 4800000,
        status: BOOKING_STATUS.COMPLETED,
        reviewRating: 5
      }
    ],
    requests: [
      {
        type: 'feedback',
        summary: 'Khen ngợi hướng dẫn viên',
        date: '2025-10-15',
        status: 'completed'
      }
    ],
    activityLog: [
      {
        timestamp: '2025-10-16T10:00:00Z',
        type: ACTIVITY_TYPE.REVIEW,
        description: 'Đánh giá tour 5 sao'
      },
      {
        timestamp: '2025-10-15T12:00:00Z',
        type: ACTIVITY_TYPE.REQUEST,
        description: 'Gửi feedback tích cực'
      }
    ]
  },
  {
    _id: 'CUST010',
    avatar: 'https://ui-avatars.com/api/?name=Ly+Thi+K&background=A855F7&color=fff',
    fullName: 'Lý Thị K',
    email: 'lythik@gmail.com',
    phone: '0990123456',
    gender: CUSTOMER_GENDER.FEMALE,
    dateOfBirth: '1991-06-12',
    address: 'Hội An, Việt Nam',
    createdAt: '2024-02-28T10:00:00Z',
    status: CUSTOMER_STATUS.ACTIVE,
    totalSpent: 22000000,
    totalBookings: 5,
    averageRating: 4.6,
    bookingHistory: [
      {
        bookingId: 'T013',
        tourName: 'Tour Hội An 2N1Đ',
        departureDate: '2025-10-28',
        price: 3200000,
        status: BOOKING_STATUS.PENDING,
        reviewRating: null
      }
    ],
    requests: [
      {
        type: 'custom_tour',
        summary: 'Tour gấp cho tuần sau',
        date: '2025-10-22',
        status: 'in_progress'
      }
    ],
    activityLog: [
      {
        timestamp: '2025-10-22T09:00:00Z',
        type: ACTIVITY_TYPE.BOOKING,
        description: 'Đặt tour gấp'
      },
      {
        timestamp: '2025-10-22T08:00:00Z',
        type: ACTIVITY_TYPE.LOGIN,
        description: 'Đăng nhập hệ thống'
      }
    ]
  },
  {
    _id: 'CUST011',
    avatar: 'https://ui-avatars.com/api/?name=Mai+Van+L&background=14B8A6&color=fff',
    fullName: 'Mai Văn L',
    email: 'maivanl@gmail.com',
    phone: '0911223344',
    gender: CUSTOMER_GENDER.MALE,
    dateOfBirth: '1989-01-05',
    address: 'Cần Thơ, Việt Nam',
    createdAt: '2024-09-14T08:00:00Z',
    status: CUSTOMER_STATUS.INACTIVE,
    totalSpent: 8000000,
    totalBookings: 2,
    averageRating: 4.0,
    bookingHistory: [
      {
        bookingId: 'T014',
        tourName: 'Tour Mê Kông Delta 1N',
        departureDate: '2025-08-15',
        price: 2500000,
        status: BOOKING_STATUS.COMPLETED,
        reviewRating: 4
      }
    ],
    requests: [
      {
        type: 'general_inquiry',
        summary: 'Hỏi về phương thức thanh toán',
        date: '2025-10-22',
        status: 'pending'
      }
    ],
    activityLog: [
      {
        timestamp: '2025-10-22T10:15:00Z',
        type: ACTIVITY_TYPE.REQUEST,
        description: 'Gửi câu hỏi về thanh toán'
      },
      {
        timestamp: '2025-08-20T14:00:00Z',
        type: ACTIVITY_TYPE.LOGIN,
        description: 'Đăng nhập lần cuối'
      }
    ]
  },
  {
    _id: 'CUST012',
    avatar: 'https://ui-avatars.com/api/?name=Ngo+Thi+M&background=6366F1&color=fff',
    fullName: 'Ngô Thị M',
    email: 'ngothim@gmail.com',
    phone: '0922334455',
    gender: CUSTOMER_GENDER.FEMALE,
    dateOfBirth: '1998-10-20',
    address: 'Quảng Ninh, Việt Nam',
    createdAt: '2024-05-30T11:00:00Z',
    status: CUSTOMER_STATUS.ACTIVE,
    totalSpent: 18000000,
    totalBookings: 4,
    averageRating: 4.5,
    bookingHistory: [
      {
        bookingId: 'T015',
        tourName: 'Tour Hạ Long Bay 2N1Đ',
        departureDate: '2025-11-08',
        price: 5200000,
        status: BOOKING_STATUS.PENDING,
        reviewRating: null
      }
    ],
    requests: [
      {
        type: 'general_inquiry',
        summary: 'Hỏi về bảo hiểm du lịch',
        date: '2025-10-21',
        status: 'completed'
      }
    ],
    activityLog: [
      {
        timestamp: '2025-10-21T17:00:00Z',
        type: ACTIVITY_TYPE.REQUEST,
        description: 'Nhận thông tin bảo hiểm'
      },
      {
        timestamp: '2025-10-21T15:30:00Z',
        type: ACTIVITY_TYPE.REQUEST,
        description: 'Hỏi về bảo hiểm'
      }
    ]
  }
];

// Helper function to get customer statistics
export const getCustomerStats = (customers) => {
  const stats = {
    total: customers.length,
    active: 0,
    banned: 0,
    inactive: 0,
    pending: 0,
    totalRevenue: 0,
    totalBookings: 0,
    averageSpending: 0
  };

  customers.forEach(customer => {
    if (customer.status === CUSTOMER_STATUS.ACTIVE) stats.active++;
    if (customer.status === CUSTOMER_STATUS.BANNED) stats.banned++;
    if (customer.status === CUSTOMER_STATUS.INACTIVE) stats.inactive++;
    if (customer.status === CUSTOMER_STATUS.PENDING) stats.pending++;
    stats.totalRevenue += customer.totalSpent;
    stats.totalBookings += customer.totalBookings;
  });

  stats.averageSpending = stats.total > 0 ? Math.round(stats.totalRevenue / stats.total) : 0;

  return stats;
};

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

// Format date
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// Format datetime
export const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};
