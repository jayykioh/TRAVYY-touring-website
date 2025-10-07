// src/mockdata/tours.js

const tours = [
  {
    id: 1,
    name: "Khám phá Hà Nội - Sapa - Hạ Long",
    region: "north",
    duration: "5 ngày 4 đêm",
    participants: "2-15 người",
    price: "8500000",
    rating: 4.8,
    reviews: 124,
    image: "https://picsum.photos/seed/hanoi/400/300",
    highlights: ["Đỉnh Fansipan", "Vịnh Hạ Long", "Phố cổ Hà Nội"],
    category: "Miền Bắc",
    description: "Hành trình khám phá vẻ đẹp hùng vĩ của miền Bắc Việt Nam, từ thủ đô ngàn năm văn hiến đến vùng núi Tây Bắc và di sản thiên nhiên thế giới.",
    departure: "Hà Nội",
    destination: "Hà Nội - Sapa - Hạ Long",
    schedule: [
      "Ngày 1: Hà Nội - Tham quan Văn Miếu, Hồ Gươm, Phố cổ",
      "Ngày 2-3: Sapa - Chinh phục Fansipan, thăm bản Cát Cát",
      "Ngày 4: Hạ Long - Du thuyền trên vịnh",
      "Ngày 5: Trở về Hà Nội"
    ]
  },
  {
    id: 2,
    name: "Tour Đà Nẵng - Hội An - Huế",
    region: "central",
    duration: "4 ngày 3 đêm",
    participants: "2-20 người",
    price: "6900000",
    rating: 4.9,
    reviews: 89,
    image: "https://picsum.photos/seed/danang/400/300",
    highlights: ["Cầu Vàng", "Phố cổ Hội An", "Đại Nội Huế"],
    category: "Miền Trung",
    description: "Trải nghiệm vẻ đẹp kỳ diệu của miền Trung với những di sản văn hóa thế giới và phong cảnh thiên nhiên tuyệt đẹp.",
    departure: "Đà Nẵng",
    destination: "Đà Nẵng - Hội An - Huế",
    schedule: [
      "Ngày 1: Đà Nẵng - Bà Nà Hills, Cầu Vàng",
      "Ngày 2: Hội An - Phố cổ, Chùa Cầu, làng gốm Thanh Hà",
      "Ngày 3: Huế - Đại Nội, chùa Thiên Mụ",
      "Ngày 4: Trở về Đà Nẵng"
    ]
  },
  {
    id: 3,
    name: "Miền Tây sông nước - Cần Thơ",
    region: "south",
    duration: "3 ngày 2 đêm",
    participants: "2-12 người",
    price: "4500000",
    rating: 4.7,
    reviews: 67,
    image: "https://picsum.photos/seed/mekong/400/300",
    highlights: ["Chợ nổi Cái Răng", "Vườn trái cây", "Làng nghề"],
    category: "Miền Nam",
    description: "Khám phá vùng đất sông nước miền Tây Nam Bộ với chợ nổi đặc trưng và vườn trái cây xanh mát.",
    departure: "TP. Hồ Chí Minh",
    destination: "Cần Thơ - Vĩnh Long - Tiền Giang",
    schedule: [
      "Ngày 1: TP.HCM - Cần Thơ, tham quan chùa Khmer",
      "Ngày 2: Chợ nổi Cái Răng, vườn trái cây Mỹ Khánh",
      "Ngày 3: Làng nghề kẹo dừa, về TP.HCM"
    ]
  },
  {
    id: 4,
    name: "Phú Quốc thiên đường biển đảo",
    region: "south",
    duration: "4 ngày 3 đêm",
    participants: "2-10 người",
    price: "7800000",
    rating: 4.9,
    reviews: 156,
    image: "https://picsum.photos/seed/phuquoc/400/300",
    highlights: ["Bãi Sao", "VinWonders", "Câu cá ngắm san hô"],
    category: "Miền Nam",
    description: "Nghỉ dưỡng tại đảo ngọc Phú Quốc với bãi biển tuyệt đẹp, nước biển trong xanh và các hoạt động vui chơi giải trí phong phú.",
    departure: "TP. Hồ Chí Minh",
    destination: "Phú Quốc",
    schedule: [
      "Ngày 1: Bay đến Phú Quốc, check-in resort",
      "Ngày 2: Bãi Sao, lặn biển ngắm san hô",
      "Ngày 3: VinWonders, cáp treo Hòn Thơm",
      "Ngày 4: Mua sắm, về TP.HCM"
    ]
  },
  {
    id: 5,
    name: "Nha Trang - Đà Lạt lãng mạn",
    region: "central",
    duration: "5 ngày 4 đêm",
    participants: "2-15 người",
    price: "6200000",
    rating: 4.6,
    reviews: 98,
    image: "https://picsum.photos/seed/nhatrang/400/300",
    highlights: ["Vinpearl Land", "Thác Datanla", "Hồ Xuân Hương"],
    category: "Miền Trung",
    description: "Kết hợp biển Nha Trang trong xanh và thành phố ngàn hoa Đà Lạt mộng mơ trong một chuyến đi.",
    departure: "TP. Hồ Chí Minh",
    destination: "Nha Trang - Đà Lạt",
    schedule: [
      "Ngày 1: Bay đến Nha Trang, tắm biển",
      "Ngày 2: Vinpearl Land, tắm bùn khoáng",
      "Ngày 3: Di chuyển đến Đà Lạt",
      "Ngày 4: Thác Datanla, hồ Xuân Hương, chợ Đà Lạt",
      "Ngày 5: Về TP.HCM"
    ]
  },
  {
    id: 6,
    name: "Mai Châu - Ninh Bình huyền bí",
    region: "north",
    duration: "3 ngày 2 đêm",
    participants: "2-20 người",
    price: "3900000",
    rating: 4.5,
    reviews: 45,
    image: "https://picsum.photos/seed/maichau/400/300",
    highlights: ["Tràng An", "Hang Múa", "Bản Lác"],
    category: "Miền Bắc",
    description: "Khám phá vẻ đẹp hoang sơ của Mai Châu và danh thắng Tràng An - di sản thế giới tại Ninh Bình.",
    departure: "Hà Nội",
    destination: "Mai Châu - Ninh Bình",
    schedule: [
      "Ngày 1: Hà Nội - Mai Châu, tham quan bản Lác",
      "Ngày 2: Ninh Bình - Tràng An, Hang Múa",
      "Ngày 3: Tam Cốc, về Hà Nội"
    ]
  },
  {
    id: 7,
    name: "Quy Nhơn - Phú Yên hoang sơ",
    region: "central",
    duration: "4 ngày 3 đêm",
    participants: "2-12 người",
    price: "5500000",
    rating: 4.7,
    reviews: 72,
    image: "https://picsum.photos/seed/quynhon/400/300",
    highlights: ["Kỳ Co", "Gành Đá Đĩa", "Ghềnh Đá Đĩa"],
    category: "Miền Trung",
    description: "Trải nghiệm bờ biển hoang sơ đẹp nhất Việt Nam với Quy Nhơn - Phú Yên.",
    departure: "TP. Hồ Chí Minh",
    destination: "Quy Nhơn - Phú Yên",
    schedule: [
      "Ngày 1: Bay đến Quy Nhơn, Kỳ Co - Eo Gió",
      "Ngày 2: Ghềnh Đá Đĩa Phú Yên",
      "Ngày 3: Mũi Điện, check-in cây cầu gỗ",
      "Ngày 4: Về TP.HCM"
    ]
  },
  {
    id: 8,
    name: "Côn Đảo huyền thoại",
    region: "south",
    duration: "3 ngày 2 đêm",
    participants: "2-8 người",
    price: "8900000",
    rating: 4.9,
    reviews: 134,
    image: "https://picsum.photos/seed/condao/400/300",
    highlights: ["Đầm Trấu", "Nhà tù Côn Đảo", "Lặn biển"],
    category: "Miền Nam",
    description: "Khám phá hòn đảo thiên đường với lịch sử hào hùng và thiên nhiên tuyệt đẹp.",
    departure: "TP. Hồ Chí Minh",
    destination: "Côn Đảo",
    schedule: [
      "Ngày 1: Bay đến Côn Đảo, Đầm Trấu",
      "Ngày 2: Lặn biển, tham quan nhà tù",
      "Ngày 3: Bãi Nhát, về TP.HCM"
    ]
  },
  {
    id: 9,
    name: "Mù Cang Chải - Mộc Châu",
    region: "north",
    duration: "4 ngày 3 đêm",
    participants: "2-15 người",
    price: "5800000",
    rating: 4.6,
    reviews: 56,
    image: "https://picsum.photos/seed/mucangchai/400/300",
    highlights: ["Ruộng bậc thang", "Đồi chè Mộc Châu", "Thác Dải Yếm"],
    category: "Miền Bắc",
    description: "Chinh phục vẻ đẹp ruộng bậc thang mùa vàng và đồi chè xanh mướt.",
    departure: "Hà Nội",
    destination: "Mù Cang Chải - Mộc Châu",
    schedule: [
      "Ngày 1: Hà Nội - Mộc Châu",
      "Ngày 2: Đồi chè, thác Dải Yếm",
      "Ngày 3: Mù Cang Chải - ruộng bậc thang",
      "Ngày 4: Về Hà Nội"
    ]
  },
  {
    id: 10,
    name: "Vũng Tàu - Hồ Cốc nghỉ dưỡng",
    region: "south",
    duration: "2 ngày 1 đêm",
    participants: "2-10 người",
    price: "2900000",
    rating: 4.4,
    reviews: 88,
    image: "https://picsum.photos/seed/vungtau/400/300",
    highlights: ["Bãi Dài", "Hồ Cốc", "Tượng Chúa Kitô"],
    category: "Miền Nam",
    description: "Nghỉ dưỡng cuối tuần gần TP.HCM với bãi biển đẹp và hải sản tươi ngon.",
    departure: "TP. Hồ Chí Minh",
    destination: "Vũng Tàu - Hồ Cốc",
    schedule: [
      "Ngày 1: TP.HCM - Vũng Tàu, tham quan, tắm biển",
      "Ngày 2: Hồ Cốc, về TP.HCM"
    ]
  }
];

export const categories = ["Tất cả", "Miền Bắc", "Miền Trung", "Miền Nam"];

export default tours;