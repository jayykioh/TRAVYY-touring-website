export const mockTours = {
  ongoing: [
    {
      id: "tour-001",
      tourName: "Hanoi Street Food & Old Quarter Walking Tour",
      customerId: "cust-201",
      customerName: "David Lee",
      customerAvatar: "https://i.pravatar.cc/150?img=7",
      customerEmail: "david.lee@email.com",
      departureDate: "2025-10-27",
      startTime: "18:00",
      endTime: "21:00",
      location: "Hanoi Old Quarter",
      numberOfGuests: 2,
      duration: "3 hours",
      totalPrice: 1500000,
      earnings: 1200000,
      status: "ongoing",
      progress: 60,
      pickupPoint: "Hoan Kiem Lake, Sword Monument",
      specialRequests: "No seafood for one guest",
      contactPhone: "+84 901 234 567",
      paymentStatus: "paid",
      paymentMethod: "MoMo",
      imageItems: [
        { imageUrl: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200" },
        { imageUrl: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800" },
        { imageUrl: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800" },
        { imageUrl: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800" },
        { imageUrl: "https://images.unsplash.com/photo-1601637155580-ac6c49428450?w=800" },
      ],
      itinerary: [
        {
          title: "Điểm gặp mặt",
          time: "18:00",
          description: "Gặp khách tại Hồ Hoàn Kiếm, bắt đầu tour khám phá ẩm thực phố cổ Hà Nội"
        },
        {
          title: "Trải nghiệm món ăn đường phố",
          time: "18:30 - 20:30",
          description: "Thưởng thức các món đặc sản như phở, bún chả, bánh mì, cà phê trứng và hơn thế nữa"
        },
        {
          title: "Kết thúc tour",
          time: "21:00",
          description: "Kết thúc tour tại khu vực phố cổ, đưa khách về điểm trả"
        }
      ],
      includedServices: [
        "Hướng dẫn viên tiếng Anh",
        "Tất cả các món ăn và đồ uống",
        "Nước suối",
        "Bảo hiểm du lịch"
      ],
      excludedServices: [
        "Đồ uống có cồn",
        "Chi phí cá nhân",
        "Tiền tip (tùy chọn)"
      ]
    }
  ],
  upcoming: [
    {
      id: "tour-002",
      tourName: "Cu Chi Tunnels Half-Day Tour",
      customerId: "cust-202",
      customerName: "Maria Garcia",
      customerAvatar: "https://i.pravatar.cc/150?img=24",
      customerEmail: "maria.garcia@email.com",
      departureDate: "2025-10-28",
      startTime: "08:00",
      endTime: "13:00",
      location: "Cu Chi, Ho Chi Minh City",
      numberOfGuests: 5,
      duration: "5 hours",
      totalPrice: 4200000,
      earnings: 3360000,
      status: "accepted",
      pickupPoint: "District 1, Hotel pickup",
      specialRequests: "Need wheelchair accessible transport",
      contactPhone: "+84 912 345 678",
      paymentStatus: "paid",
      paymentMethod: "Chuyển khoản",
      imageItems: [
        { imageUrl: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200" },
        { imageUrl: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800" },
        { imageUrl: "https://images.unsplash.com/photo-1601637155580-ac6c49428450?w=800" },
        { imageUrl: "https://images.unsplash.com/photo-1569940117028-8fa2e48dd95c?w=800" },
        { imageUrl: "https://images.unsplash.com/photo-1578894381163-e72c17f2d2f2?w=800" },
      ],
      itinerary: [
        {
          title: "Đón khách tại khách sạn",
          time: "08:00",
          description: "Đón khách tại khách sạn khu vực Quận 1, di chuyển đến địa đạo Củ Chi"
        },
        {
          title: "Tham quan địa đạo Củ Chi",
          time: "09:30 - 12:00",
          description: "Khám phá hệ thống địa đạo lịch sử, xem trình diễn bẫy và vũ khí thời chiến"
        },
        {
          title: "Trở về TP.HCM",
          time: "12:00 - 13:00",
          description: "Đưa khách trở về khách sạn hoặc điểm trả theo yêu cầu"
        }
      ],
      includedServices: [
        "Xe ô tô đời mới có điều hòa",
        "Hướng dẫn viên tiếng Anh",
        "Vé tham quan địa đạo",
        "Nước suối",
        "Bảo hiểm"
      ],
      excludedServices: [
        "Bữa trưa",
        "Chi phí bắn súng (tùy chọn)",
        "Chi phí cá nhân"
      ]
    },
    {
      id: "tour-003",
      tourName: "Phong Nha Cave Exploration",
      customerId: "cust-203",
      customerName: "John Smith",
      customerAvatar: "https://i.pravatar.cc/150?img=11",
      customerEmail: "john.smith@email.com",
      departureDate: "2025-10-29",
      startTime: "07:30",
      endTime: "16:00",
      location: "Phong Nha-Ke Bang National Park",
      numberOfGuests: 4,
      duration: "1 day",
      totalPrice: 7800000,
      earnings: 6240000,
      status: "accepted",
      pickupPoint: "Dong Hoi City Center",
      specialRequests: "Photography enthusiasts - need extra time for photos",
      contactPhone: "+84 923 456 789",
      paymentStatus: "paid",
      paymentMethod: "Tiền mặt",
      imageItems: [
        { imageUrl: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200" },
        { imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800" },
        { imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800" },
        { imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800" },
        { imageUrl: "https://images.unsplash.com/photo-1601581987809-a874a81309c9?w=800" },
      ],
      itinerary: [
        {
          title: "Đón khách và khởi hành",
          time: "07:30",
          description: "Đón khách tại trung tâm Đồng Hới, di chuyển đến Vườn Quốc gia Phong Nha-Kẻ Bàng"
        },
        {
          title: "Khám phá động Phong Nha",
          time: "09:00 - 12:00",
          description: "Đi thuyền khám phá động Phong Nha với nhũ đá kỳ vĩ, chụp ảnh và ngắm cảnh"
        },
        {
          title: "Nghỉ trưa",
          time: "12:00 - 13:00",
          description: "Dùng bữa trưa tại nhà hàng địa phương với đặc sản miền Trung"
        },
        {
          title: "Tham quan thêm và trở về",
          time: "13:00 - 16:00",
          description: "Tham quan động Thiên Đường hoặc Tám Cô (tùy chọn), sau đó trở về Đồng Hới"
        }
      ],
      includedServices: [
        "Xe ô tô đời mới",
        "Hướng dẫn viên chuyên nghiệp",
        "Vé tham quan các động",
        "Bữa trưa đặc sản",
        "Nước suối",
        "Bảo hiểm"
      ],
      excludedServices: [
        "Chi phí cá nhân",
        "Đồ uống có cồn",
        "Tiền tip"
      ]
    },
    {
      id: "tour-004",
      tourName: "Dalat Countryside & Coffee Farm Tour",
      customerId: "cust-204",
      customerName: "Lisa Nguyen",
      customerAvatar: "https://i.pravatar.cc/150?img=32",
      customerEmail: "lisa.nguyen@email.com",
      departureDate: "2025-11-01",
      startTime: "09:00",
      endTime: "15:00",
      location: "Dalat, Lam Dong",
      numberOfGuests: 3,
      duration: "6 hours",
      totalPrice: 3900000,
      earnings: 3120000,
      status: "accepted",
      pickupPoint: "Dalat City Center",
      specialRequests: "Coffee tasting experience required",
      contactPhone: "+84 934 567 890",
      paymentStatus: "pending",
      paymentMethod: "MoMo",
      itinerary: [
        {
          title: "Đón khách và khởi hành",
          time: "09:00",
          description: "Đón khách tại trung tâm thành phố Đà Lạt, bắt đầu hành trình khám phá nông thôn"
        },
        {
          title: "Tham quan nông trại cà phê",
          time: "10:00 - 12:00",
          description: "Tìm hiểu quy trình trồng và chế biến cà phê Đà Lạt, thưởng thức cà phê tươi"
        },
        {
          title: "Nghỉ trưa",
          time: "12:00 - 13:00",
          description: "Dùng bữa trưa tại farmstay với rau củ quả hữu cơ"
        },
        {
          title: "Tham quan vườn dâu tây và trở về",
          time: "13:00 - 15:00",
          description: "Tham quan vườn dâu tây, hái dâu tự tay, sau đó trở về trung tâm Đà Lạt"
        }
      ],
      includedServices: [
        "Xe ô tô đời mới",
        "Hướng dẫn viên",
        "Vé tham quan các điểm",
        "Coffee tasting",
        "Bữa trưa organic",
        "Nước suối"
      ],
      excludedServices: [
        "Mua cà phê và dâu tây",
        "Chi phí cá nhân"
      ]
    }
  ],
  completed: [
    {
      id: "tour-101",
      tourName: "Hue Imperial City & Royal Tombs",
      customerId: "cust-301",
      customerName: "Robert Johnson",
      customerAvatar: "https://i.pravatar.cc/150?img=15",
      customerEmail: "robert.johnson@email.com",
      departureDate: "2025-10-25",
      startTime: "08:00",
      endTime: "17:00",
      location: "Hue, Thua Thien Hue",
      numberOfGuests: 2,
      duration: "1 day",
      totalPrice: 4500000,
      status: "completed",
      completedAt: "2025-10-25T17:30:00",
      rating: 5,
      review: "Excellent guide! Very knowledgeable about Vietnamese history.",
      earnings: 3600000,
      paymentStatus: "paid",
      paymentMethod: "Chuyển khoản",
      contactPhone: "+84 945 678 901",
      pickupPoint: "Hue City Center",
      itinerary: [
        {
          title: "Đón khách và tham quan Đại Nội",
          time: "08:00 - 11:00",
          description: "Khám phá Hoàng thành Huế với kiến trúc cung điện cổ kính"
        },
        {
          title: "Nghỉ trưa",
          time: "11:00 - 12:00",
          description: "Dùng cơm trưa với đặc sản Huế"
        },
        {
          title: "Tham quan lăng tẩm",
          time: "12:00 - 16:00",
          description: "Tham quan lăng Khải Định và lăng Tự Đức"
        },
        {
          title: "Trở về",
          time: "16:00 - 17:00",
          description: "Đưa khách về điểm trả"
        }
      ],
      includedServices: [
        "Xe ô tô đời mới có điều hòa",
        "Hướng dẫn viên tiếng Anh",
        "Vé tham quan tất cả các điểm",
        "Bữa trưa đặc sản Huế",
        "Nước suối",
        "Bảo hiểm"
      ],
      excludedServices: [
        "Chi phí cá nhân",
        "Đồ uống có cồn",
        "Tiền tip"
      ]
    },
    {
      id: "tour-102",
      tourName: "Ninh Binh Tam Coc & Bai Dinh Pagoda",
      customerId: "cust-302",
      customerName: "Sophie Martin",
      customerAvatar: "https://i.pravatar.cc/150?img=44",
      customerEmail: "sophie.martin@email.com",
      departureDate: "2025-10-23",
      startTime: "08:30",
      endTime: "18:00",
      location: "Ninh Binh",
      numberOfGuests: 4,
      duration: "1 day",
      totalPrice: 6800000,
      status: "completed",
      completedAt: "2025-10-23T18:15:00",
      rating: 5,
      review: "Amazing experience! The scenery was breathtaking.",
      earnings: 5440000,
      paymentStatus: "paid",
      paymentMethod: "MoMo",
      contactPhone: "+84 956 789 012",
      pickupPoint: "Hanoi Old Quarter",
      itinerary: [
        {
          title: "Đón khách tại Hà Nội",
          time: "08:30",
          description: "Đón khách tại khu vực phố cổ Hà Nội, khởi hành đi Ninh Bình"
        },
        {
          title: "Tham quan chùa Bái Đính",
          time: "10:30 - 12:00",
          description: "Khám phá chùa Bái Đính - quần thể chùa lớn nhất Việt Nam"
        },
        {
          title: "Nghỉ trưa",
          time: "12:00 - 13:00",
          description: "Dùng bữa trưa với đặc sản Ninh Bình"
        },
        {
          title: "Chèo thuyền Tam Cốc",
          time: "13:30 - 16:00",
          description: "Chèo thuyền qua 3 hang động với phong cảnh núi non hữu tình"
        },
        {
          title: "Trở về Hà Nội",
          time: "16:00 - 18:00",
          description: "Đưa khách trở về Hà Nội"
        }
      ],
      includedServices: [
        "Xe ô tô đời mới",
        "Hướng dẫn viên tiếng Anh",
        "Vé tham quan và chèo thuyền",
        "Bữa trưa",
        "Nước suối",
        "Bảo hiểm"
      ],
      excludedServices: [
        "Chi phí cá nhân",
        "Tiền tip cho người chèo thuyền"
      ]
    },
    {
      id: "tour-103",
      tourName: "Nha Trang Beach & Island Hopping",
      customerId: "cust-303",
      customerName: "Alex Brown",
      customerAvatar: "https://i.pravatar.cc/150?img=33",
      customerEmail: "alex.brown@email.com",
      departureDate: "2025-10-20",
      startTime: "09:00",
      endTime: "16:00",
      location: "Nha Trang, Khanh Hoa",
      numberOfGuests: 6,
      duration: "1 day",
      totalPrice: 8400000,
      status: "completed",
      completedAt: "2025-10-20T16:30:00",
      rating: 4,
      review: "Good tour but weather wasn't perfect.",
      earnings: 6720000,
      paymentStatus: "paid",
      paymentMethod: "Tiền mặt",
      contactPhone: "+84 967 890 123",
      pickupPoint: "Nha Trang Beach Hotels",
      itinerary: [
        {
          title: "Đón khách và khởi hành",
          time: "09:00",
          description: "Đón khách tại các khách sạn, di chuyển đến cảng tàu"
        },
        {
          title: "Tour 4 đảo",
          time: "10:00 - 15:00",
          description: "Tham quan Hòn Mun, Hòn Tằm, Hòn Miễu, lặn ngắm san hô, tắm biển"
        },
        {
          title: "Trở về bờ",
          time: "15:00 - 16:00",
          description: "Đưa khách về lại khách sạn"
        }
      ],
      includedServices: [
        "Xe đưa đón",
        "Tàu cao tốc",
        "Hướng dẫn viên",
        "Bữa trưa trên tàu",
        "Thiết bị lặn",
        "Nước suối",
        "Bảo hiểm"
      ],
      excludedServices: [
        "Đồ uống có cồn",
        "Chi phí cá nhân"
      ]
    }
  ],
  canceled: [
    {
      id: "tour-201",
      tourName: "Da Nang & Marble Mountains",
      customerId: "cust-401",
      customerName: "James Wilson",
      customerAvatar: "https://i.pravatar.cc/150?img=52",
      customerEmail: "james.wilson@email.com",
      departureDate: "2025-10-26",
      startTime: "08:00",
      endTime: "17:00",
      location: "Da Nang",
      numberOfGuests: 3,
      totalPrice: 4200000,
      earnings: 3360000,
      status: "canceled",
      canceledAt: "2025-10-25T14:00:00",
      cancelReason: "Customer changed travel plans",
      canceledBy: "customer",
      contactPhone: "+84 978 901 234",
      pickupPoint: "Da Nang City Center",
      paymentStatus: "refunded",
      paymentMethod: "Chuyển khoản",
      itinerary: [
        {
          title: "Đón khách",
          time: "08:00",
          description: "Đón khách tại trung tâm Đà Nẵng"
        },
        {
          title: "Tham quan Ngũ Hành Sơn",
          time: "09:00 - 11:00",
          description: "Khám phá các hang động và chùa chiền trên núi"
        },
        {
          title: "Bãi biển Mỹ Khê",
          time: "11:00 - 13:00",
          description: "Tắm biển và nghỉ trưa"
        },
        {
          title: "Cầu Rồng và bán đảo Sơn Trà",
          time: "14:00 - 16:00",
          description: "Tham quan các điểm nổi tiếng"
        },
        {
          title: "Trở về",
          time: "16:00 - 17:00",
          description: "Đưa khách về điểm trả"
        }
      ],
      includedServices: [
        "Xe ô tô đời mới",
        "Hướng dẫn viên",
        "Vé tham quan",
        "Bữa trưa",
        "Nước suối"
      ],
      excludedServices: [
        "Chi phí cá nhân"
      ]
    }
  ]
};

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
  }
];