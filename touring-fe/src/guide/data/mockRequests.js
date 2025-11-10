export const mockRequests = [
  {
    id: "req-001",
    tourName: "Ha Long Bay Cruise & Kayaking Adventure",
    customerId: "cust-101",
    customerName: "Sarah Johnson",
    customerAvatar: "https://i.pravatar.cc/150?img=5",
    customerEmail: "sarah.johnson@email.com",
    departureDate: "2025-11-05",
    startTime: "08:00",
    endTime: "17:00",
    location: "Ha Long Bay, Quang Ninh",
    pickupPoint: "Ha Long International Cruise Port",
    numberOfGuests: 4,
    duration: "2 days 1 night",
    totalPrice: 12500000,
    earnings: 10000000,
    requestedAt: "2025-10-27T08:30:00",
    specialRequests: "Vegetarian meals for 2 guests",
    contactPhone: "+84 905 123 456",
    paymentStatus: "pending",
    paymentMethod: "MoMo",
    imageItems: [
      { imageUrl: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1200" },
      { imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800" },
      { imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800" },
      { imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800" },
      { imageUrl: "https://images.unsplash.com/photo-1601581987809-a874a81309c9?w=800" },
    ],
    itinerary: [
      {
        title: "Ngày 1: Đón khách và lên tàu",
        time: "08:00 - 12:00",
        description: "Đón khách tại Hà Nội, di chuyển đến Vịnh Hạ Long, lên tàu du lịch"
      },
      {
        title: "Ngày 1: Hoạt động chiều",
        time: "12:00 - 18:00",
        description: "Chèo thuyền kayak, tham quan hang động, tắm biển, xem hoàng hôn"
      },
      {
        title: "Ngày 1: Tối và qua đêm",
        time: "18:00 - 22:00",
        description: "Bữa tối trên tàu, câu mực đêm, nghỉ ngơi trên tàu"
      },
      {
        title: "Ngày 2: Sáng và trở về",
        time: "07:00 - 17:00",
        description: "Thái cực quyền sáng sớm, tham quan thêm, trở về Hà Nội"
      }
    ],
    includedServices: [
      "Xe đưa đón Hà Nội - Hạ Long - Hà Nội",
      "Tàu du lịch 3 sao",
      "Cabin 2 người có điều hòa",
      "Hướng dẫn viên tiếng Anh",
      "Tất cả các bữa ăn (2 bữa trưa, 1 bữa tối, 1 bữa sáng)",
      "Kayak và thiết bị",
      "Vé tham quan",
      "Nước suối",
      "Bảo hiểm"
    ],
    excludedServices: [
      "Đồ uống có cồn",
      "Chi phí cá nhân",
      "Tiền tip"
    ]
  },
  {
    id: "req-002",
    tourName: "Hoi An Ancient Town & Lantern Workshop",
    customerId: "cust-102",
    customerName: "Tanaka Yuki",
    customerAvatar: "https://i.pravatar.cc/150?img=9",
    customerEmail: "tanaka.yuki@email.com",
    departureDate: "2025-11-02",
    startTime: "14:00",
    endTime: "20:00",
    location: "Hoi An, Quang Nam",
    pickupPoint: "Hoi An Ancient Town Main Entrance",
    numberOfGuests: 2,
    duration: "1 day",
    totalPrice: 3500000,
    earnings: 2800000,
    requestedAt: "2025-10-27T09:15:00",
    specialRequests: "English and Japanese speaking guide preferred",
    contactPhone: "+84 916 234 567",
    paymentStatus: "pending",
    paymentMethod: "Tiền mặt",
    imageItems: [
      { imageUrl: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200" },
      { imageUrl: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800" },
      { imageUrl: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800" },
      { imageUrl: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800" },
      { imageUrl: "https://images.unsplash.com/photo-1601637155580-ac6c49428450?w=800" },
    ],
    itinerary: [
      {
        title: "Gặp mặt và tham quan phố cổ",
        time: "14:00 - 16:00",
        description: "Khám phá các di tích lịch sử, chùa cầu Nhật Bản, nhà cổ"
      },
      {
        title: "Workshop làm đèn lồng",
        time: "16:00 - 18:00",
        description: "Học cách làm đèn lồng truyền thống Hội An"
      },
      {
        title: "Bữa tối và ngắm phố đèn",
        time: "18:00 - 20:00",
        description: "Dùng bữa tối với đặc sản Hội An, ngắm phố cổ về đêm"
      }
    ],
    includedServices: [
      "Hướng dẫn viên tiếng Anh/Nhật",
      "Vé tham quan phố cổ",
      "Workshop làm đèn lồng",
      "Bữa tối",
      "Nước suối"
    ],
    excludedServices: [
      "Đồ uống có cồn",
      "Chi phí cá nhân",
      "Mua đèn lồng thành phẩm"
    ]
  },
  {
    id: "req-003",
    tourName: "Sapa Trekking & Homestay Experience",
    customerId: "cust-103",
    customerName: "Michael Chen",
    customerAvatar: "https://i.pravatar.cc/150?img=13",
    customerEmail: "michael.chen@email.com",
    departureDate: "2025-11-10",
    startTime: "07:00",
    endTime: "18:00",
    location: "Sapa, Lao Cai",
    pickupPoint: "Sapa Town Center",
    numberOfGuests: 6,
    duration: "3 days 2 nights",
    totalPrice: 18000000,
    earnings: 14400000,
    requestedAt: "2025-10-26T14:20:00",
    specialRequests: "Need experienced trekking guide",
    contactPhone: "+84 927 345 678",
    paymentStatus: "pending",
    paymentMethod: "Chuyển khoản",
    imageItems: [
      { imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200" },
      { imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800" },
      { imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800" },
      { imageUrl: "https://images.unsplash.com/photo-1601581987809-a874a81309c9?w=800" },
      { imageUrl: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800" },
    ],
    itinerary: [
      {
        title: "Ngày 1: Đón khách và trekking",
        time: "07:00 - 17:00",
        description: "Đón khách tại Sapa, trekking qua các bản làng dân tộc, homestay"
      },
      {
        title: "Ngày 2: Trekking và khám phá",
        time: "08:00 - 18:00",
        description: "Tiếp tục trekking, tham quan ruộng bậc thang, giao lưu văn hóa"
      },
      {
        title: "Ngày 3: Kết thúc và trở về",
        time: "08:00 - 15:00",
        description: "Trekking về Sapa, tham quan chợ, trở về điểm xuất phát"
      }
    ],
    includedServices: [
      "Hướng dẫn viên trekking chuyên nghiệp",
      "Homestay 2 đêm",
      "Tất cả các bữa ăn",
      "Nước suối",
      "Bảo hiểm"
    ],
    excludedServices: [
      "Xe đưa đón từ Hà Nội",
      "Đồ uống có cồn",
      "Chi phí cá nhân"
    ]
  },
  {
    id: "req-004",
    tourName: "Mekong Delta Discovery",
    customerId: "cust-104",
    customerName: "Emma Wilson",
    customerAvatar: "https://i.pravatar.cc/150?img=23",
    customerEmail: "emma.wilson@email.com",
    departureDate: "2025-10-30",
    startTime: "05:00",
    endTime: "17:00",
    location: "Can Tho, Mekong Delta",
    pickupPoint: "Can Tho Pier",
    numberOfGuests: 3,
    duration: "2 days 1 night",
    totalPrice: 8500000,
    earnings: 6800000,
    requestedAt: "2025-10-27T10:45:00",
    specialRequests: "Early morning floating market visit",
    contactPhone: "+84 938 456 789",
    paymentStatus: "pending",
    paymentMethod: "MoMo",
    imageItems: [
      { imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200" },
      { imageUrl: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800" },
      { imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800" },
      { imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800" },
      { imageUrl: "https://images.unsplash.com/photo-1601581987809-a874a81309c9?w=800" },
    ],
    itinerary: [
      {
        title: "Ngày 1: Đón khách và tham quan",
        time: "05:00 - 18:00",
        description: "Đón khách tại TP.HCM, đi Cần Thơ, tham quan vườn trái cây, chợ nổi, homestay"
      },
      {
        title: "Ngày 2: Chợ nổi sáng sớm và trở về",
        time: "05:00 - 17:00",
        description: "Tham quan chợ nổi Cái Răng lúc sáng sớm, ăn sáng trên thuyền, trở về TP.HCM"
      }
    ],
    includedServices: [
      "Xe đưa đón TP.HCM - Cần Thơ - TP.HCM",
      "Hướng dẫn viên",
      "Thuyền tham quan",
      "Homestay 1 đêm",
      "Tất cả các bữa ăn",
      "Vé tham quan",
      "Nước suối",
      "Bảo hiểm"
    ],
    excludedServices: [
      "Đồ uống có cồn",
      "Mua trái cây và đặc sản",
      "Chi phí cá nhân"
    ]
  },
  {
  id: "req-005",
  tourName: "Ninh Binh Day Trip - Trang An & Bai Dinh",
  customerId: "cust-105",
  customerName: "Lê Minh",
  customerAvatar: "https://i.pravatar.cc/150?img=45",
  customerEmail: "le.minh@email.com",
  departureDate: "2025-11-03",
  startTime: "07:00",
  endTime: "18:00",
  location: "Ninh Binh, Vietnam",
  pickupPoint: "Trang An Wharf",
  numberOfGuests: 5,
  duration: "1 day",
  totalPrice: 5500000,
  earnings: 4200000,
  requestedAt: new Date().toISOString(), // 🟢 thời gian hiện tại
  specialRequests: "Xe 7 chỗ, cần hướng dẫn viên tiếng Anh",
  contactPhone: "+84 912 345 678",
  paymentStatus: "pending",
  paymentMethod: "Chuyển khoản",
  imageItems: [
    { imageUrl: "https://images.unsplash.com/photo-1617957719187-fbcad3e5b9df?w=1200" },
    { imageUrl: "https://images.unsplash.com/photo-1600047503364-49b4e9df9e43?w=800" },
    { imageUrl: "https://images.unsplash.com/photo-1596815078927-2f6e79f33b6c?w=800" },
    { imageUrl: "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?w=800" },
    { imageUrl: "https://images.unsplash.com/photo-1600047599863-4a937a6a6e8e?w=800" },
  ],
  itinerary: [
    {
      title: "Buổi sáng: Tham quan chùa Bái Đính",
      time: "07:00 - 11:30",
      description: "Đón khách tại Hà Nội, tham quan quần thể chùa lớn nhất Việt Nam"
    },
    {
      title: "Buổi chiều: Khám phá Tràng An",
      time: "13:00 - 17:00",
      description: "Đi thuyền xuyên hang động, ngắm cảnh núi đá vôi hùng vĩ"
    }
  ],
  includedServices: [
    "Xe đưa đón Hà Nội - Ninh Bình - Hà Nội",
    "Hướng dẫn viên chuyên nghiệp",
    "Vé tham quan",
    "Bữa trưa buffet",
    "Nước suối"
  ],
  excludedServices: [
    "Chi phí cá nhân",
    "Đồ uống có cồn",
    "Tiền tip"
  ]
},
{
  id: "req-006",
  tourName: "Ninh Binh Day Trip - Trang An & Bai Dinh",
  customerId: "cust-105",
  customerName: "Lê Minh",
  customerAvatar: "https://i.pravatar.cc/150?img=45",
  customerEmail: "le.minh@email.com",
  departureDate: "2025-11-03",
  startTime: "07:00",
  endTime: "18:00",
  location: "Ninh Binh, Vietnam",
  pickupPoint: "Trang An Wharf",
  numberOfGuests: 5,
  duration: "1 day",
  totalPrice: 5500000,
  earnings: 4200000,
  requestedAt: new Date().toISOString(), // 🟢 thời gian hiện tại
  specialRequests: "Xe 7 chỗ, cần hướng dẫn viên tiếng Anh",
  contactPhone: "+84 912 345 678",
  paymentStatus: "pending",
  paymentMethod: "Chuyển khoản",
  imageItems: [
    { imageUrl: "https://images.unsplash.com/photo-1617957719187-fbcad3e5b9df?w=1200" },
    { imageUrl: "https://images.unsplash.com/photo-1600047503364-49b4e9df9e43?w=800" },
    { imageUrl: "https://images.unsplash.com/photo-1596815078927-2f6e79f33b6c?w=800" },
    { imageUrl: "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?w=800" },
    { imageUrl: "https://images.unsplash.com/photo-1600047599863-4a937a6a6e8e?w=800" },
  ],
  itinerary: [
    {
      title: "Buổi sáng: Tham quan chùa Bái Đính",
      time: "07:00 - 11:30",
      description: "Đón khách tại Hà Nội, tham quan quần thể chùa lớn nhất Việt Nam"
    },
    {
      title: "Buổi chiều: Khám phá Tràng An",
      time: "13:00 - 17:00",
      description: "Đi thuyền xuyên hang động, ngắm cảnh núi đá vôi hùng vĩ"
    }
  ],
  includedServices: [
    "Xe đưa đón Hà Nội - Ninh Bình - Hà Nội",
    "Hướng dẫn viên chuyên nghiệp",
    "Vé tham quan",
    "Bữa trưa buffet",
    "Nước suối"
  ],
  excludedServices: [
    "Chi phí cá nhân",
    "Đồ uống có cồn",
    "Tiền tip"
  ]
},
{
  id: "req-007",
  tourName: "Ninh Binh Day Trip - Trang An & Bai Dinh",
  customerId: "cust-105",
  customerName: "Lê Minh",
  customerAvatar: "https://i.pravatar.cc/150?img=45",
  customerEmail: "le.minh@email.com",
  departureDate: "2025-11-03",
  startTime: "07:00",
  endTime: "18:00",
  location: "Ninh Binh, Vietnam",
  pickupPoint: "Trang An Wharf",
  numberOfGuests: 5,
  duration: "1 day",
  totalPrice: 5500000,
  earnings: 4200000,
  requestedAt: new Date().toISOString(), // 🟢 thời gian hiện tại
  specialRequests: "Xe 7 chỗ, cần hướng dẫn viên tiếng Anh",
  contactPhone: "+84 912 345 678",
  paymentStatus: "pending",
  paymentMethod: "Chuyển khoản",
  imageItems: [
    { imageUrl: "https://images.unsplash.com/photo-1617957719187-fbcad3e5b9df?w=1200" },
    { imageUrl: "https://images.unsplash.com/photo-1600047503364-49b4e9df9e43?w=800" },
    { imageUrl: "https://images.unsplash.com/photo-1596815078927-2f6e79f33b6c?w=800" },
    { imageUrl: "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?w=800" },
    { imageUrl: "https://images.unsplash.com/photo-1600047599863-4a937a6a6e8e?w=800" },
  ],
  itinerary: [
    {
      title: "Buổi sáng: Tham quan chùa Bái Đính",
      time: "07:00 - 11:30",
      description: "Đón khách tại Hà Nội, tham quan quần thể chùa lớn nhất Việt Nam"
    },
    {
      title: "Buổi chiều: Khám phá Tràng An",
      time: "13:00 - 17:00",
      description: "Đi thuyền xuyên hang động, ngắm cảnh núi đá vôi hùng vĩ"
    }
  ],
  includedServices: [
    "Xe đưa đón Hà Nội - Ninh Bình - Hà Nội",
    "Hướng dẫn viên chuyên nghiệp",
    "Vé tham quan",
    "Bữa trưa buffet",
    "Nước suối"
  ],
  excludedServices: [
    "Chi phí cá nhân",
    "Đồ uống có cồn",
    "Tiền tip"
  ]
}

];