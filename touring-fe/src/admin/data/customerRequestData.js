// Mock data for Customer Requests
export const CUSTOMER_REQUEST_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const REQUEST_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

export const REQUEST_TYPE = {
  CUSTOM_TOUR: 'custom_tour',
  BOOKING_INQUIRY: 'booking_inquiry',
  COMPLAINT: 'complaint',
  GENERAL_INQUIRY: 'general_inquiry',
  SPECIAL_REQUEST: 'special_request'
};

export const STATUS_LABELS = {
  [CUSTOMER_REQUEST_STATUS.PENDING]: 'Chờ xử lý',
  [CUSTOMER_REQUEST_STATUS.IN_PROGRESS]: 'Đang xử lý',
  [CUSTOMER_REQUEST_STATUS.COMPLETED]: 'Hoàn thành',
  [CUSTOMER_REQUEST_STATUS.CANCELLED]: 'Đã hủy'
};

export const STATUS_COLORS = {
  [CUSTOMER_REQUEST_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [CUSTOMER_REQUEST_STATUS.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [CUSTOMER_REQUEST_STATUS.COMPLETED]: 'bg-green-100 text-green-800',
  [CUSTOMER_REQUEST_STATUS.CANCELLED]: 'bg-gray-100 text-gray-800'
};

export const PRIORITY_LABELS = {
  [REQUEST_PRIORITY.LOW]: 'Thấp',
  [REQUEST_PRIORITY.MEDIUM]: 'Trung bình',
  [REQUEST_PRIORITY.HIGH]: 'Cao',
  [REQUEST_PRIORITY.URGENT]: 'Khẩn cấp'
};

export const PRIORITY_COLORS = {
  [REQUEST_PRIORITY.LOW]: 'bg-gray-100 text-gray-700',
  [REQUEST_PRIORITY.MEDIUM]: 'bg-blue-100 text-blue-700',
  [REQUEST_PRIORITY.HIGH]: 'bg-orange-100 text-orange-700',
  [REQUEST_PRIORITY.URGENT]: 'bg-red-100 text-red-700'
};

export const TYPE_LABELS = {
  [REQUEST_TYPE.CUSTOM_TOUR]: 'Tour tùy chỉnh',
  [REQUEST_TYPE.BOOKING_INQUIRY]: 'Hỏi đáp đặt tour',
  [REQUEST_TYPE.COMPLAINT]: 'Khiếu nại',
  [REQUEST_TYPE.GENERAL_INQUIRY]: 'Câu hỏi chung',
  [REQUEST_TYPE.SPECIAL_REQUEST]: 'Yêu cầu đặc biệt'
};

export const TYPE_COLORS = {
  [REQUEST_TYPE.CUSTOM_TOUR]: 'bg-purple-100 text-purple-700',
  [REQUEST_TYPE.BOOKING_INQUIRY]: 'bg-blue-100 text-blue-700',
  [REQUEST_TYPE.COMPLAINT]: 'bg-red-100 text-red-700',
  [REQUEST_TYPE.GENERAL_INQUIRY]: 'bg-gray-100 text-gray-700',
  [REQUEST_TYPE.SPECIAL_REQUEST]: 'bg-pink-100 text-pink-700'
};

// Mock customer requests data
export const MOCK_CUSTOMER_REQUESTS = [
  {
    _id: '1',
    requestId: 'REQ-2025-001',
    customerName: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    phone: '0901234567',
    type: REQUEST_TYPE.CUSTOM_TOUR,
    priority: REQUEST_PRIORITY.HIGH,
    status: CUSTOMER_REQUEST_STATUS.PENDING,
    subject: 'Yêu cầu tour du lịch Hạ Long 5 ngày 4 đêm cho gia đình',
    message: 'Chào admin, tôi muốn đặt một tour du lịch Hạ Long cho gia đình gồm 8 người (4 người lớn, 4 trẻ em). Thời gian dự kiến từ 15-20/11/2025. Mong nhận được tư vấn chi tiết về giá cả và lịch trình.',
    numberOfPeople: 8,
    preferredDates: ['2025-11-15', '2025-11-20'],
    budget: '50000000',
    destination: 'Hạ Long, Quảng Ninh',
    createdAt: '2025-10-20T08:30:00Z',
    updatedAt: '2025-10-20T08:30:00Z',
    assignedTo: null,
    notes: []
  },
  {
    _id: '2',
    requestId: 'REQ-2025-002',
    customerName: 'Trần Thị B',
    email: 'tranthib@email.com',
    phone: '0912345678',
    type: REQUEST_TYPE.BOOKING_INQUIRY,
    priority: REQUEST_PRIORITY.MEDIUM,
    status: CUSTOMER_REQUEST_STATUS.IN_PROGRESS,
    subject: 'Hỏi về tour Phú Quốc',
    message: 'Cho em hỏi tour Phú Quốc 3 ngày 2 đêm còn chỗ không ạ? Em muốn đi vào cuối tháng này.',
    numberOfPeople: 2,
    preferredDates: ['2025-10-28', '2025-10-30'],
    budget: '15000000',
    destination: 'Phú Quốc',
    createdAt: '2025-10-19T14:20:00Z',
    updatedAt: '2025-10-20T09:15:00Z',
    assignedTo: 'Admin Linh',
    notes: [
      {
        content: 'Đã gọi điện tư vấn, khách đang cân nhắc',
        createdBy: 'Admin Linh',
        createdAt: '2025-10-20T09:15:00Z'
      }
    ]
  },
  {
    _id: '3',
    requestId: 'REQ-2025-003',
    customerName: 'Lê Văn C',
    email: 'levanc@email.com',
    phone: '0923456789',
    type: REQUEST_TYPE.COMPLAINT,
    priority: REQUEST_PRIORITY.URGENT,
    status: CUSTOMER_REQUEST_STATUS.IN_PROGRESS,
    subject: 'Khiếu nại về chất lượng dịch vụ tour Đà Lạt',
    message: 'Tôi vừa đi tour Đà Lạt ngày 15/10 và rất không hài lòng về khách sạn. Phòng không giống như hình ảnh quảng cáo và thiết bị trong phòng bị hỏng.',
    numberOfPeople: 4,
    destination: 'Đà Lạt',
    createdAt: '2025-10-18T10:00:00Z',
    updatedAt: '2025-10-19T16:30:00Z',
    assignedTo: 'Admin Manager',
    notes: [
      {
        content: 'Đã liên hệ khách sạn để xác minh thông tin',
        createdBy: 'Admin Manager',
        createdAt: '2025-10-19T11:00:00Z'
      },
      {
        content: 'Khách sạn xác nhận sự cố và đồng ý bồi thường 30%',
        createdBy: 'Admin Manager',
        createdAt: '2025-10-19T16:30:00Z'
      }
    ]
  },
  {
    _id: '4',
    requestId: 'REQ-2025-004',
    customerName: 'Phạm Thị D',
    email: 'phamthid@email.com',
    phone: '0934567890',
    type: REQUEST_TYPE.SPECIAL_REQUEST,
    priority: REQUEST_PRIORITY.HIGH,
    status: CUSTOMER_REQUEST_STATUS.PENDING,
    subject: 'Yêu cầu đặc biệt cho tour honeymoon Nha Trang',
    message: 'Chúng tôi muốn đặt tour Nha Trang cho tuần trăng mật. Có thể sắp xếp bàn ăn tối lãng mạn trên bãi biển và phòng có view biển không ạ?',
    numberOfPeople: 2,
    preferredDates: ['2025-11-10', '2025-11-13'],
    budget: '25000000',
    destination: 'Nha Trang',
    createdAt: '2025-10-21T09:00:00Z',
    updatedAt: '2025-10-21T09:00:00Z',
    assignedTo: null,
    notes: []
  },
  {
    _id: '5',
    requestId: 'REQ-2025-005',
    customerName: 'Hoàng Văn E',
    email: 'hoangvane@email.com',
    phone: '0945678901',
    type: REQUEST_TYPE.GENERAL_INQUIRY,
    priority: REQUEST_PRIORITY.LOW,
    status: CUSTOMER_REQUEST_STATUS.COMPLETED,
    subject: 'Hỏi về chính sách hủy tour',
    message: 'Cho tôi hỏi nếu hủy tour trước 7 ngày thì có được hoàn tiền không?',
    numberOfPeople: null,
    createdAt: '2025-10-17T13:45:00Z',
    updatedAt: '2025-10-17T15:20:00Z',
    assignedTo: 'Admin Support',
    notes: [
      {
        content: 'Đã trả lời email giải thích chính sách hủy tour',
        createdBy: 'Admin Support',
        createdAt: '2025-10-17T15:20:00Z'
      }
    ]
  },
  {
    _id: '6',
    requestId: 'REQ-2025-006',
    customerName: 'Đỗ Thị F',
    email: 'dothif@email.com',
    phone: '0956789012',
    type: REQUEST_TYPE.CUSTOM_TOUR,
    priority: REQUEST_PRIORITY.MEDIUM,
    status: CUSTOMER_REQUEST_STATUS.IN_PROGRESS,
    subject: 'Tour team building công ty tại Vũng Tàu',
    message: 'Công ty chúng tôi muốn tổ chức tour team building cho 50 nhân viên tại Vũng Tàu trong 2 ngày 1 đêm. Có thể tư vấn gói dịch vụ và các hoạt động team building không?',
    numberOfPeople: 50,
    preferredDates: ['2025-11-05', '2025-11-06'],
    budget: '100000000',
    destination: 'Vũng Tàu',
    createdAt: '2025-10-20T11:00:00Z',
    updatedAt: '2025-10-21T10:30:00Z',
    assignedTo: 'Admin Minh',
    notes: [
      {
        content: 'Đã gửi báo giá chi tiết qua email',
        createdBy: 'Admin Minh',
        createdAt: '2025-10-21T10:30:00Z'
      }
    ]
  },
  {
    _id: '7',
    requestId: 'REQ-2025-007',
    customerName: 'Vũ Văn G',
    email: 'vuvang@email.com',
    phone: '0967890123',
    type: REQUEST_TYPE.BOOKING_INQUIRY,
    priority: REQUEST_PRIORITY.MEDIUM,
    status: CUSTOMER_REQUEST_STATUS.COMPLETED,
    subject: 'Hỏi về visa cho tour Thái Lan',
    message: 'Tour Thái Lan 5 ngày có hỗ trợ làm visa không ạ?',
    numberOfPeople: 3,
    destination: 'Thái Lan',
    createdAt: '2025-10-16T16:00:00Z',
    updatedAt: '2025-10-17T09:00:00Z',
    assignedTo: 'Admin Support',
    notes: [
      {
        content: 'Đã tư vấn quy trình làm visa và phí dịch vụ',
        createdBy: 'Admin Support',
        createdAt: '2025-10-17T09:00:00Z'
      }
    ]
  },
  {
    _id: '8',
    requestId: 'REQ-2025-008',
    customerName: 'Bùi Thị H',
    email: 'buithih@email.com',
    phone: '0978901234',
    type: REQUEST_TYPE.SPECIAL_REQUEST,
    priority: REQUEST_PRIORITY.HIGH,
    status: CUSTOMER_REQUEST_STATUS.PENDING,
    subject: 'Yêu cầu hỗ trợ người khuyết tật cho tour Sapa',
    message: 'Bố tôi đi xe lăn, tour Sapa có thể hỗ trợ di chuyển không ạ? Khách sạn có phòng thang máy không?',
    numberOfPeople: 4,
    preferredDates: ['2025-11-20', '2025-11-23'],
    budget: '30000000',
    destination: 'Sapa',
    createdAt: '2025-10-21T14:30:00Z',
    updatedAt: '2025-10-21T14:30:00Z',
    assignedTo: null,
    notes: []
  },
  {
    _id: '9',
    requestId: 'REQ-2025-009',
    customerName: 'Đinh Văn I',
    email: 'dinhvani@email.com',
    phone: '0989012345',
    type: REQUEST_TYPE.COMPLAINT,
    priority: REQUEST_PRIORITY.MEDIUM,
    status: CUSTOMER_REQUEST_STATUS.COMPLETED,
    subject: 'Phản hồi về hướng dẫn viên',
    message: 'Hướng dẫn viên trong tour Huế - Đà Nẵng rất nhiệt tình và chuyên nghiệp. Tôi muốn gửi lời cảm ơn và đề xuất thưởng cho bạn ấy.',
    numberOfPeople: 6,
    destination: 'Huế - Đà Nẵng',
    createdAt: '2025-10-15T12:00:00Z',
    updatedAt: '2025-10-16T10:00:00Z',
    assignedTo: 'Admin Manager',
    notes: [
      {
        content: 'Đã chuyển lời cảm ơn đến hướng dẫn viên và ghi nhận thành tích',
        createdBy: 'Admin Manager',
        createdAt: '2025-10-16T10:00:00Z'
      }
    ]
  },
  {
    _id: '10',
    requestId: 'REQ-2025-010',
    customerName: 'Lý Thị K',
    email: 'lythik@email.com',
    phone: '0990123456',
    type: REQUEST_TYPE.CUSTOM_TOUR,
    priority: REQUEST_PRIORITY.URGENT,
    status: CUSTOMER_REQUEST_STATUS.IN_PROGRESS,
    subject: 'Tour gấp cho tuần sau - Hội An',
    message: 'Tôi cần đặt tour Hội An cho 4 người, khởi hành tuần sau (28-30/10). Có thể sắp xếp gấp không ạ?',
    numberOfPeople: 4,
    preferredDates: ['2025-10-28', '2025-10-30'],
    budget: '20000000',
    destination: 'Hội An',
    createdAt: '2025-10-22T08:00:00Z',
    updatedAt: '2025-10-22T09:00:00Z',
    assignedTo: 'Admin Linh',
    notes: [
      {
        content: 'Đang kiểm tra tình trạng chỗ trống và khách sạn',
        createdBy: 'Admin Linh',
        createdAt: '2025-10-22T09:00:00Z'
      }
    ]
  },
  {
    _id: '11',
    requestId: 'REQ-2025-011',
    customerName: 'Mai Văn L',
    email: 'maivanl@email.com',
    phone: '0911223344',
    type: REQUEST_TYPE.BOOKING_INQUIRY,
    priority: REQUEST_PRIORITY.LOW,
    status: CUSTOMER_REQUEST_STATUS.PENDING,
    subject: 'Hỏi về phương thức thanh toán',
    message: 'Tôi có thể thanh toán qua chuyển khoản ngân hàng không? Có cần đặt cọc không ạ?',
    numberOfPeople: 2,
    createdAt: '2025-10-22T10:15:00Z',
    updatedAt: '2025-10-22T10:15:00Z',
    assignedTo: null,
    notes: []
  },
  {
    _id: '12',
    requestId: 'REQ-2025-012',
    customerName: 'Ngô Thị M',
    email: 'ngothim@email.com',
    phone: '0922334455',
    type: REQUEST_TYPE.GENERAL_INQUIRY,
    priority: REQUEST_PRIORITY.LOW,
    status: CUSTOMER_REQUEST_STATUS.COMPLETED,
    subject: 'Hỏi về bảo hiểm du lịch',
    message: 'Tour có bao gồm bảo hiểm du lịch không? Mức bảo hiểm là bao nhiêu ạ?',
    numberOfPeople: null,
    createdAt: '2025-10-21T15:30:00Z',
    updatedAt: '2025-10-21T17:00:00Z',
    assignedTo: 'Admin Support',
    notes: [
      {
        content: 'Đã gửi thông tin chi tiết về bảo hiểm du lịch',
        createdBy: 'Admin Support',
        createdAt: '2025-10-21T17:00:00Z'
      }
    ]
  }
];

// Helper function to get request statistics
export const getRequestStats = (requests) => {
  const stats = {
    total: requests.length,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    urgent: 0,
    high: 0
  };

  requests.forEach(request => {
    if (request.status === CUSTOMER_REQUEST_STATUS.PENDING) stats.pending++;
    if (request.status === CUSTOMER_REQUEST_STATUS.IN_PROGRESS) stats.inProgress++;
    if (request.status === CUSTOMER_REQUEST_STATUS.COMPLETED) stats.completed++;
    if (request.status === CUSTOMER_REQUEST_STATUS.CANCELLED) stats.cancelled++;
    if (request.priority === REQUEST_PRIORITY.URGENT) stats.urgent++;
    if (request.priority === REQUEST_PRIORITY.HIGH) stats.high++;
  });

  return stats;
};

// Chart data for statistics
export const REQUEST_CHART_DATA = {
  requests: [
    { name: 'T2', value: 12 },
    { name: 'T3', value: 19 },
    { name: 'T4', value: 15 },
    { name: 'T5', value: 22 },
    { name: 'T6', value: 18 },
    { name: 'T7', value: 25 },
    { name: 'CN', value: 20 }
  ],
  responseTime: [
    { name: 'T2', value: 2.5 },
    { name: 'T3', value: 1.8 },
    { name: 'T4', value: 2.2 },
    { name: 'T5', value: 1.5 },
    { name: 'T6', value: 2.0 },
    { name: 'T7', value: 1.3 },
    { name: 'CN', value: 1.6 }
  ]
};
