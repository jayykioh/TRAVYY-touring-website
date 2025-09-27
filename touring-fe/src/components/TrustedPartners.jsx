import React from "react";

const TrustedPartners = () => {
  const partners = [
    {
      id: 1,
      name: "Vietnam Airlines",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Vietnam_Airlines_logo.svg/200px-Vietnam_Airlines_logo.svg.png",
      category: "Hàng không"
    },
    {
      id: 2,
      name: "Saigon Tourist",
      logo: "https://via.placeholder.com/200x80/0066CC/FFFFFF?text=Saigon+Tourist",
      category: "Tour operator"
    },
    {
      id: 3,
      name: "Vinpearl",
      logo: "https://via.placeholder.com/200x80/FF6B35/FFFFFF?text=Vinpearl",
      category: "Resort & Entertainment"
    },
    {
      id: 4,
      name: "Sun World",
      logo: "https://via.placeholder.com/200x80/FFA500/FFFFFF?text=Sun+World",
      category: "Theme Parks"
    },
    {
      id: 5,
      name: "Bamboo Airways",
      logo: "https://via.placeholder.com/200x80/4CAF50/FFFFFF?text=Bamboo+Airways",
      category: "Hàng không"
    },
    {
      id: 6,
      name: "Muong Thanh Hotels",
      logo: "https://via.placeholder.com/200x80/9C27B0/FFFFFF?text=Muong+Thanh",
      category: "Hospitality"
    },
    {
      id: 7,
      name: "Jetstar",
      logo: "https://via.placeholder.com/200x80/FF5722/FFFFFF?text=Jetstar",
      category: "Hàng không"
    },
    {
      id: 8,
      name: "FLC Hotels",
      logo: "https://via.placeholder.com/200x80/2196F3/FFFFFF?text=FLC+Hotels",
      category: "Hospitality"
    },
    {
      id: 9,
      name: "Agoda",
      logo: "https://via.placeholder.com/200x80/E91E63/FFFFFF?text=Agoda",
      category: "Booking Platform"
    },
    {
      id: 10,
      name: "Booking.com",
      logo: "https://via.placeholder.com/200x80/003580/FFFFFF?text=Booking.com",
      category: "Booking Platform"
    }
  ];

  const certifications = [
    {
      id: 1,
      name: "Vietnam Tourism",
      logo: "https://via.placeholder.com/120x120/FF0000/FFFFFF?text=VN+Tourism",
      description: "Chứng nhận từ Tổng cục Du lịch Việt Nam"
    },
    {
      id: 2,
      name: "ASTA",
      logo: "https://via.placeholder.com/120x120/1E88E5/FFFFFF?text=ASTA",
      description: "Thành viên Hiệp hội Du lịch Mỹ"
    },
    {
      id: 3,
      name: "IATA",
      logo: "https://via.placeholder.com/120x120/2E7D32/FFFFFF?text=IATA",
      description: "Đại lý được chứng nhận IATA"
    },
    {
      id: 4,
      name: "ISO 9001",
      logo: "https://via.placeholder.com/120x120/FF6F00/FFFFFF?text=ISO+9001",
      description: "Chứng chỉ chất lượng quốc tế"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Đối tác tin cậy
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Chúng tôi hợp tác cùng những thương hiệu uy tín hàng đầu để mang đến dịch vụ tốt nhất
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-16">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="group flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="h-16 w-auto object-contain mb-3 grayscale group-hover:grayscale-0 transition-all duration-300"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.name)}&background=random&size=200&format=png`;
                }}
              />
              <h4 className="text-sm font-semibold text-gray-900 text-center mb-1">
                {partner.name}
              </h4>
              <p className="text-xs text-gray-500 text-center">
                {partner.category}
              </p>
            </div>
          ))}
        </div>

        {/* Certifications */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Chứng nhận & Giấy phép
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Được công nhận và chứng nhận bởi các tổ chức uy tín trong và ngoài nước
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {certifications.map((cert) => (
              <div
                key={cert.id}
                className="group text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative mb-4">
                  <img
                    src={cert.logo}
                    alt={cert.name}
                    className="h-20 w-20 object-contain mx-auto rounded-full group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(cert.name)}&background=random&size=120&format=png`;
                    }}
                  />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">
                  {cert.name}
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {cert.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">100+</div>
            <div className="text-gray-600">Đối tác chiến lược</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">15+</div>
            <div className="text-gray-600">Năm hợp tác</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">50+</div>
            <div className="text-gray-600">Quốc gia & vùng lãnh thổ</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">99%</div>
            <div className="text-gray-600">Độ hài lòng khách hàng</div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 bg-gray-50 rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Đảm bảo chất lượng</h4>
              <p className="text-gray-600 text-sm">
                Tất cả đối tác đều được kiểm duyệt kỹ lưỡng về chất lượng dịch vụ
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Thanh toán an toàn</h4>
              <p className="text-gray-600 text-sm">
                Hệ thống thanh toán được bảo mật với công nghệ SSL 256-bit
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Hỗ trợ 24/7</h4>
              <p className="text-gray-600 text-sm">
                Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ mọi lúc
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedPartners;