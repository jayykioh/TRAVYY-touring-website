// src/mockdata/blogs.js
export const mockBlogs = [
  {
    slug: "sapa",
    title: "Khám phá Sapa",
 description:
  "Sapa là một thị trấn vùng cao nằm ở phía Tây Bắc Việt Nam, nổi tiếng với vẻ đẹp huyền ảo của mây trời và dãy Hoàng Liên Sơn hùng vĩ. Không khí ở đây mát mẻ quanh năm, đặc biệt là mùa thu và mùa xuân khi ruộng bậc thang vào mùa lúa chín hoặc phủ sương sớm trắng xóa. Sapa còn là nơi giao thoa văn hóa của nhiều dân tộc thiểu số như H’Mông, Dao, Giáy, Tày, với những phiên chợ tình đầy sắc màu và phong tục đặc trưng. Du khách đến đây có thể chinh phục đỉnh Fansipan – nóc nhà Đông Dương bằng cáp treo hoặc trekking, khám phá bản Cát Cát, Lao Chải, Tả Van, dạo chợ đêm Sapa, thưởng thức đồ nướng nóng hổi giữa tiết trời se lạnh và tắm lá thuốc Dao để thư giãn sau chuyến đi. Đây là điểm đến hoàn hảo cho những ai yêu thiên nhiên, muốn trải nghiệm văn hóa bản địa và tìm cảm giác bình yên giữa núi rừng.",
    banner:
      "https://d18sx48tl6nre5.cloudfront.net/webp_xl_114bd83483fe4e1aae51be8734881dcf.webp",
    activities: [
      {
        name: "Cáp treo Fansipan",
        price: "790.000đ",
        img: "https://images.unsplash.com/photo-1533750516457-a7f992034fec?q=80&w=400",
        description: "Trải nghiệm cáp treo lên đỉnh Fansipan – nóc nhà Đông Dương.",
      },
      {
        name: "Tour trekking bản Cát Cát",
        price: "1.200.000đ",
        img: "https://images.unsplash.com/photo-1554196541-ebb205b6e0a3?q=80&w=400",
        description: "Khám phá bản làng người H’Mông, check-in suối và cối xay gió.",
      },
      {
        name: "Tắm lá Dao Đỏ",
        price: "150.000đ",
        img: "https://images.unsplash.com/photo-1554188248-986adbb73f56?q=80&w=400",
        description: "Thư giãn sau chuyến trekking với bài thuốc tắm lá Dao nổi tiếng.",
      },
    ],
    sightseeing: [
      {
        name: "Núi Hàm Rồng",
        img: "https://images.unsplash.com/photo-1600674295509-6e3f1c59a70d?q=80&w=400",
      },
      {
        name: "Thác Bạc",
        img: "https://images.unsplash.com/photo-1587574293340-31b6dd42197d?q=80&w=400",
      },
      {
        name: "Đèo Ô Quy Hồ",
        img: "https://images.unsplash.com/photo-1593064198789-0ec4e9e9fcb7?q=80&w=400",
      },
    ],
    transport: [
      {
        name: "Xe Limousine Hà Nội - Sapa",
        price: "250.000đ/chuyến",
        img: "https://images.unsplash.com/photo-1602407294553-6c6d55ef5ef3?q=80&w=400",
      },
      {
        name: "Tàu hỏa đêm Hà Nội - Lào Cai",
        price: "350.000đ/vé",
        img: "https://images.unsplash.com/photo-1523653079464-6d7e2d2f6d7d?q=80&w=400",
      },
    ],
    hotels: [
      {
        name: "Hotel de la Coupole - MGallery",
        price: "4.000.000đ/đêm",
        img: "https://images.unsplash.com/photo-1582719478193-01b04c9a6d1e?q=80&w=400",
      },
      {
        name: "Chapa Ecolodge",
        price: "1.500.000đ/đêm",
        img: "https://images.unsplash.com/photo-1600047509841-d89bbbaaa2f7?q=80&w=400",
      },
    ],
    guides: [
      { title: "Đi Sapa mùa nào đẹp nhất?", link: "#" },
      { title: "Các món đặc sản phải thử ở Sapa", link: "#" },
      { title: "Tips săn mây tại đèo Ô Quy Hồ", link: "#" },
    ],
    quickInfo: {
      weather: "15–20°C",
      bestSeason: "Tháng 9–11 & 3–5",
      duration: "3 ngày 2 đêm",
      language: "Tiếng Việt, tiếng dân tộc H’Mông",
      distance: "315 km từ Hà Nội",
    },
    faq: [
      {
        q: "Sapa ở đâu?",
        a: "Sapa thuộc tỉnh Lào Cai, miền Bắc Việt Nam, cách Hà Nội khoảng 315 km.",
      },
      {
        q: "Có cần đặt vé trước khi đi cáp treo không?",
        a: "Nên đặt vé trước để tránh xếp hàng, đặc biệt cuối tuần hoặc mùa cao điểm.",
      },
      {
        q: "Đi Sapa có cần chuẩn bị gì?",
        a: "Mang áo ấm, giày trekking, thuốc chống côn trùng và sạc dự phòng.",
      },
    ],
  },

  // 🎯 HÀ NỘI MỚI
  {
    slug: "ha-noi",
    title: "Khám phá Hà Nội",
description:
  "Hà Nội – trái tim của Việt Nam – là thành phố mang đậm dấu ấn nghìn năm văn hiến, nơi lưu giữ vô số di tích lịch sử, đền chùa cổ kính và kiến trúc Pháp cổ duyên dáng. Không khí Hà Nội là sự kết hợp giữa nhịp sống hiện đại và nét hoài cổ: buổi sáng thong thả nhâm nhi ly cà phê trứng bên hồ Hoàn Kiếm, buổi trưa thưởng thức phở nóng hay bún chả, buổi tối dạo quanh phố cổ 36 phố phường với ánh đèn vàng và tiếng rao quen thuộc. Du khách có thể tham quan Lăng Chủ tịch Hồ Chí Minh, Văn Miếu – Quốc Tử Giám, chùa Một Cột, các bảo tàng hoặc đi xe buýt hai tầng ngắm thành phố về đêm. Hà Nội còn là thiên đường ẩm thực với vô số món ăn đường phố, quán cà phê view đẹp, và các khu chợ truyền thống. Đây là nơi lý tưởng để cảm nhận nét văn hóa Việt Nam đậm chất thơ và sự hiếu khách nồng hậu của người dân thủ đô.",
    banner:
      "https://vj-prod-website-cms.s3.ap-southeast-1.amazonaws.com/shutterstock1391898416-1646649508378.png",
    activities: [
      {
        name: "City Tour Hà Nội",
        price: "900.000đ",
        img: "https://images.unsplash.com/photo-1603354350317-6f7aaa5911c2?q=80&w=400",
        description: "Tham quan Lăng Bác, Văn Miếu, Hồ Hoàn Kiếm, chùa Một Cột trong 1 ngày.",
      },
      {
        name: "Food Tour Phố Cổ",
        price: "600.000đ",
        img: "https://images.unsplash.com/photo-1576402187878-974f5bb01013?q=80&w=400",
        description: "Thưởng thức phở, bún chả, cà phê trứng, nem rán tại khu phố cổ.",
      },
      {
        name: "Tour xe buýt 2 tầng",
        price: "250.000đ",
        img: "https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?q=80&w=400",
        description: "Ngồi xe buýt mui trần ngắm toàn cảnh thành phố về đêm.",
      },
    ],
    sightseeing: [
      {
        name: "Hồ Hoàn Kiếm",
        img: "https://images.unsplash.com/photo-1508766206392-8bd5cf550d1d?q=80&w=400",
      },
      {
        name: "Lăng Chủ tịch Hồ Chí Minh",
        img: "https://images.unsplash.com/photo-1603354350317-6f7aaa5911c2?q=80&w=400",
      },
      {
        name: "Phố Cổ Hà Nội",
        img: "https://images.unsplash.com/photo-1538688423619-a81d3f23454b?q=80&w=400",
      },
    ],
    transport: [
      {
        name: "Xe buýt nội thành",
        price: "7.000đ/lượt",
        img: "https://images.unsplash.com/photo-1523653079464-6d7e2d2f6d7d?q=80&w=400",
      },
      {
        name: "Taxi & Grab",
        price: "Khoảng 15.000đ/km",
        img: "https://images.unsplash.com/photo-1602407294553-6c6d55ef5ef3?q=80&w=400",
      },
    ],
    hotels: [
      {
        name: "Sofitel Legend Metropole",
        price: "5.500.000đ/đêm",
        img: "https://images.unsplash.com/photo-1615494937221-4b63b1f0d56e?q=80&w=400",
      },
      {
        name: "Hanoi La Siesta Hotel",
        price: "2.000.000đ/đêm",
        img: "https://images.unsplash.com/photo-1590490360182-8d3e97d3e8bb?q=80&w=400",
      },
    ],
    guides: [
      { title: "Hà Nội mùa nào đẹp nhất?", link: "#" },
      { title: "Top 10 quán cà phê view đẹp", link: "#" },
      { title: "Kinh nghiệm di chuyển trong nội thành", link: "#" },
    ],
    quickInfo: {
      weather: "18–30°C tuỳ mùa",
      bestSeason: "Tháng 10–3",
      duration: "2–3 ngày",
      language: "Tiếng Việt, tiếng Anh phổ biến ở khu du lịch",
      distance: "Trung tâm miền Bắc",
    },
    faq: [
      {
        q: "Hà Nội nổi tiếng về món gì?",
        a: "Phở, bún chả, cà phê trứng, bánh cuốn là những món đặc trưng.",
      },
      {
        q: "Đi lại trong Hà Nội nên dùng phương tiện gì?",
        a: "Taxi, Grab, xe buýt hoặc thuê xe máy đều thuận tiện.",
      },
    ],
  },
];
