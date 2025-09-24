// src/mockdata/tour.js
export const mockTours = [
  {
    id: 1,
    title: "Tour Hạ Long 2N1Đ - Thăm Vịnh Di Sản",
    image: "https://picsum.photos/seed/halong/400/250",
    location: "Hạ Long, Việt Nam",
    price: 1890000,
    originalPrice: 2200000,
    rating: 4.8,
    reviews: 245,
    duration: "2N1Đ",
    groupSize: "15-20 người",
    highlights: ["Du thuyền sang trọng", "Động Thiên Cung", "Làng chài"],
  },
  {
    id: 2,
    title: "Combo Đà Nẵng Resort + Tour",
    image: "https://picsum.photos/seed/danang/400/250",
    location: "Đà Nẵng, Việt Nam",
    price: 2650000,
    originalPrice: 3100000,
    rating: 4.7,
    reviews: 189,
    duration: "3N2Đ",
    groupSize: "2-4 người",
    highlights: ["Resort 5 sao", "Ăn sáng buffet", "Tour riêng"],
  },
  {
    id: 3,
    title: "Khám phá Sapa 3N2Đ",
    image: "https://picsum.photos/seed/sapa/400/250",
    location: "Sapa, Việt Nam",
    price: 2290000,
    originalPrice: 2600000,
    rating: 4.6,
    reviews: 167,
    duration: "3N2Đ",
    groupSize: "10-15 người",
    highlights: ["Bản Cát Cát", "Fansipan", "Ẩm thực Tây Bắc"],
  },
  {
    id: 4,
    title: "Du lịch Phú Quốc 4N3Đ",
    image: "https://picsum.photos/seed/phuquoc/400/250",
    location: "Phú Quốc, Việt Nam",
    price: 3590000,
    originalPrice: 4200000,
    rating: 4.9,
    reviews: 320,
    duration: "4N3Đ",
    groupSize: "15-25 người",
    highlights: ["Vinpearl Safari", "Bãi Sao", "Cáp treo Hòn Thơm"],
  },
  {
    id: 5,
    title: "Khám phá Hội An 2N1Đ",
    image: "https://picsum.photos/seed/hoian/400/250",
    location: "Hội An, Việt Nam",
    price: 1590000,
    originalPrice: 1900000,
    rating: 4.5,
    reviews: 140,
    duration: "2N1Đ",
    groupSize: "10-20 người",
    highlights: ["Phố cổ Hội An", "Chùa Cầu", "Ẩm thực Quảng Nam"],
  },
];

// Format currency
export const formatPrice = (price) => {
  return parseInt(price).toLocaleString("vi-VN") + "đ";
};

// Calculate discount percentage
export const calculateDiscount = (originalPrice, currentPrice) => {
  const discount = ((originalPrice - currentPrice) / originalPrice) * 100;
  return Math.round(discount);
};
