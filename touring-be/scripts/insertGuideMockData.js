const mongoose = require("mongoose");
const Guide = require("../models/guide/Guide");
const TourRequest = require("../models/guide/TourRequest");
const GuideTour = require("../models/guide/GuideTour");
const GuideEarnings = require("../models/guide/GuideEarnings");
const GuideNotification = require("../models/guide/GuideNotification");
require("dotenv").config();

const mockGuide = {
  guideId: "guide-001",
  name: "Nguyễn Văn A",
  firstName: "Văn A",
  avatar: "https://i.pravatar.cc/150?img=12",
  email: "nguyenvana@travyy.com",
  phone: "+84 912 345 678",
  location: "Đà Nẵng, Việt Nam",
  experience: "5 years",
  languages: ["Tiếng Việt", "English", "日本語"],
  rating: 4.8,
  totalTours: 247,
  toursConducted: 247,
  responseTime: "1h 20m",
  availability: "Available",
  specialties: ["Cultural Tours", "Adventure Tours", "Food Tours"],
  joinedDate: new Date("2020-01-15"),
  bio: "Hướng dẫn viên địa phương giàu kinh nghiệm, hơn 5 năm giới thiệu cho du khách những điểm đến tuyệt vời nhất của Đà Nẵng và khu vực lân cận. Tôi yêu thích việc chia sẻ văn hóa, lịch sử và những nét đẹp ẩn giấu của miền Trung Việt Nam.",
};

const mockRequests = [
  {
    requestId: "req-001",
    tourName: "Ha Long Bay Cruise & Kayaking Adventure",
    customerId: "cust-101",
    customerName: "Sarah Johnson",
    customerAvatar: "https://i.pravatar.cc/150?img=5",
    customerEmail: "sarah.johnson@email.com",
    departureDate: new Date("2025-11-05"),
    startTime: "08:00",
    endTime: "17:00",
    location: "Ha Long Bay, Quang Ninh",
    pickupPoint: "Ha Long International Cruise Port",
    numberOfGuests: 4,
    duration: "2 days 1 night",
    totalPrice: 12500000,
    earnings: 10000000,
    requestedAt: new Date("2025-10-27T08:30:00"),
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
  // Add more requests as needed...
];

const mockTours = {
  ongoing: [
    {
      tourId: "tour-001",
      tourName: "Hanoi Street Food & Old Quarter Walking Tour",
      customerId: "cust-201",
      customerName: "David Lee",
      customerAvatar: "https://i.pravatar.cc/150?img=7",
      customerEmail: "david.lee@email.com",
      departureDate: new Date("2025-10-27"),
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
    // Add upcoming tours...
  ],
  completed: [
    // Add completed tours...
  ],
  canceled: [
    // Add canceled tours...
  ]
};

const mockEarnings = {
  summary: {
    thisWeek: 15760000,
    thisMonth: 48500000,
    lastMonth: 52300000,
    totalEarnings: 287600000,
    pendingPayment: 4200000
  },
  weeklyData: [
    { day: "Mon", amount: 3600000 },
    { day: "Tue", amount: 0 },
    { day: "Wed", amount: 5440000 },
    { day: "Thu", amount: 0 },
    { day: "Fri", amount: 6720000 },
    { day: "Sat", amount: 0 },
    { day: "Sun", amount: 0 }
  ],
  recentPayments: [
    {
      paymentId: "pay-001",
      tourId: "tour-101",
      tourName: "Hue Imperial City & Royal Tombs",
      date: new Date("2025-10-25"),
      amount: 3600000,
      commission: 20,
      netAmount: 3600000,
      status: "paid",
      paidAt: new Date("2025-10-26T10:00:00")
    },
    // Add more payments...
  ],
  monthlyStats: [
    { month: "T1", earnings: 45000000 },
    { month: "T2", earnings: 52000000 },
    { month: "T3", earnings: 48000000 },
    { month: "T4", earnings: 62000000 }
  ],
  yearlyStats: [
    { month: "Jan", earnings: 38000000 },
    { month: "Feb", earnings: 42000000 },
    { month: "Mar", earnings: 45000000 },
    { month: "Apr", earnings: 50000000 },
    { month: "May", earnings: 42000000 },
    { month: "Jun", earnings: 48500000 },
    { month: "Jul", earnings: 55200000 },
    { month: "Aug", earnings: 51800000 },
    { month: "Sep", earnings: 52300000 },
    { month: "Oct", earnings: 48500000 },
    { month: "Nov", earnings: 47000000 },
    { month: "Dec", earnings: 53000000 }
  ]
};

const mockNotifications = [
  {
    notificationId: "notif-001",
    type: "new_request",
    title: "New Tour Request!",
    message: "You have a new tour request for Ha Long Bay Cruise & Kayaking Adventure",
    tourId: "req-001",
    timestamp: new Date("2025-10-27T08:30:00"),
    read: false,
    icon: "📬",
    priority: "high"
  },
  // Add more notifications...
];

async function insertMockData() {
  try {
    const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/travelApp";
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Insert Guide
    const guide = new Guide(mockGuide);
    await guide.save();
    console.log("✅ Guide inserted");

    // Insert Tour Requests
    for (const request of mockRequests) {
      const tourRequest = new TourRequest({ ...request, guideId: guide._id });
      await tourRequest.save();
    }
    console.log("✅ Tour requests inserted");

    // Insert Tours
    const allTours = [
      ...mockTours.ongoing,
      ...mockTours.upcoming,
      ...mockTours.completed,
      ...mockTours.canceled
    ];

    for (const tour of allTours) {
      const guideTour = new GuideTour({ ...tour, guideId: guide._id });
      await guideTour.save();
    }
    console.log("✅ Tours inserted");

    // Insert Earnings
    const earnings = new GuideEarnings({ ...mockEarnings, guideId: guide._id });
    await earnings.save();
    console.log("✅ Earnings inserted");

    // Insert Notifications
    for (const notification of mockNotifications) {
      const guideNotification = new GuideNotification({ ...notification, guideId: guide._id });
      await guideNotification.save();
    }
    console.log("✅ Notifications inserted");

    console.log("🎉 All mock data inserted successfully!");
  } catch (error) {
    console.error("❌ Error inserting mock data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

insertMockData();