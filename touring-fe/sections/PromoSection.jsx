import React, { useState } from 'react';
import { ChevronRight, Star, Clock, MapPin, Users, Calendar, Percent, Gift, CreditCard, ChevronLeft } from 'lucide-react';

const TourPromotions = () => {
  const [currentPromoSlide, setCurrentPromoSlide] = useState(0);
  const [currentTourSlide, setCurrentTourSlide] = useState(0);


  const promotionalBanners = [
    {
      id: 1,
      title: 'MỚI GIẢM',
      discount: '50%',
      subtitle: 'SĂN DEAL SIÊU HOT',
      description: 'Tháng cuối năm',
      buttonText: 'Săn Deal ngay',
      bgColor: 'from-orange-500 to-pink-500',
      textColor: 'text-white',
      icon: '🔥'
    },
    {
      id: 2,
      title: 'Giảm tối đa',
      discount: '8%',
      subtitle: 'mọi đơn hàng',
      description: 'Khi thanh toán bằng VISA',
      buttonText: 'Săn mã ngay!',
      bgColor: 'from-blue-600 to-blue-800',
      textColor: 'text-white',
      icon: '💳'
    },
    {
      id: 3,
      title: 'Ưu đại được yêu thích',
      discount: '12%',
      subtitle: 'Khách sạn và Trải nghiệm',
      description: 'Giảm từ 10% trở lên',
      buttonText: 'Khám phá ngay',
      bgColor: 'from-purple-500 to-indigo-600',
      textColor: 'text-white',
      icon: '🎁'
    }
  ];


  const featuredTours = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      category: 'Dịch vụ du lịch',
      location: 'Thành phố Hồ Chí Minh',
      title: 'Dịch Vụ Đón Tiễn Ưu Tiên Tại Sân Bay Tân Sơn Nhất (SGN)',
      rating: 4.4,
      reviews: 1770,
      booked: '40K+',
      originalPrice: 850000,
      currentPrice: 765000,
      tags: ['Đặt trước cho ngày mai', 'Miễn phí hủy'],
      isPopular: false
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      category: 'Công viên & Vườn bách thảo',
      location: 'Thành phố Hồ Chí Minh',
      title: 'Vé Công Viên Nước Vinhpearl Sky Điều',
      rating: 4.6,
      reviews: 347,
      booked: '70K+',
      originalPrice: 390000,
      currentPrice: 351500,
      discount: 10,
      tags: ['Đặt ngay hôm nay', 'Miễn phí hủy'],
      isPopular: true
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      category: 'Tour',
      location: 'Thành phố Hồ Chí Minh',
      title: 'Tour ngày đia dao Củ Chi và đồng bằng sông Cửu Long từ TP HCM',
      rating: 4.3,
      reviews: 2573,
      booked: '40K+',
      originalPrice: 1156000,
      currentPrice: 982770,
      discount: 15,
      tags: ['Tour riêng', 'Đặt trước cho ngày mai'],
      isPopular: false
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      category: 'Tour',
      location: 'Thành phố Hồ Chí Minh',
      title: 'Tour Ngày Địa Đạo Củ Chi và Đồng Bằng Sông Cửu Long từ TP HCM',
      rating: 4.9,
      reviews: 1108,
      booked: '9K+',
      originalPrice: 1173250,
      currentPrice: 938600,
      discount: 20,
      tags: ['Đón tại khách sạn', 'Tour riêng'],
      isPopular: true
    }
  ];

  const nextPromoSlide = () => {
    setCurrentPromoSlide((prev) => (prev + 1) % promotionalBanners.length);
  };

  const prevPromoSlide = () => {
    setCurrentPromoSlide((prev) => (prev - 1 + promotionalBanners.length) % promotionalBanners.length);
  };

  const nextTourSlide = () => {
    setCurrentTourSlide((prev) => Math.min(prev + 1, featuredTours.length - 3));
  };

  const prevTourSlide = () => {
    setCurrentTourSlide((prev) => Math.max(prev - 1, 0));
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Ưu đãi cho bạn</h2>
          
          <div className="relative">
  <div className="overflow-hidden">
    <div
      className="flex gap-6 transition-transform duration-500 ease-in-out"
      style={{
        transform: `translateX(-${currentPromoSlide * (100 / 3 + 2)}%)`
      }}
    >
      {promotionalBanners.map((banner) => (
        <div
          key={banner.id}
          className="flex-shrink-0 w-1/3 min-w-[350px]"
        >
          <div
            className={`relative bg-gradient-to-r ${banner.bgColor} rounded-2xl overflow-hidden h-48 p-6 transform hover:scale-105 transition-all duration-300 cursor-pointer`}
          >
            <div className="absolute top-4 right-4 text-4xl opacity-80">
              {banner.icon}
            </div>

            <div className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`text-lg font-semibold ${banner.textColor}`}>
                    {banner.title}
                  </span>
                  <span className={`text-4xl font-bold ${banner.textColor}`}>
                    {banner.discount}
                  </span>
                </div>
                <h3 className={`text-2xl font-bold ${banner.textColor} mb-1`}>
                  {banner.subtitle}
                </h3>
                <p className={`${banner.textColor} opacity-90 text-sm`}>
                  {banner.description}
                </p>
              </div>

              <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 text-sm w-fit active:scale-95">
                {banner.buttonText}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>

  <button
    onClick={prevPromoSlide}
    className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white shadow-lg rounded-full p-2 hover:shadow-xl transition-all duration-300 active:scale-90"
  >
    <ChevronLeft className="w-6 h-6 text-gray-600" />
  </button>
  <button
    onClick={nextPromoSlide}
    className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white shadow-lg rounded-full p-2 hover:shadow-xl transition-all duration-300 active:scale-90"
  >
    <ChevronRight className="w-6 h-6 text-gray-600" />
  </button>
</div>

        </div>


        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Các hoạt động nổi bật</h2>
            <div className="flex space-x-2">
              <button
                onClick={prevTourSlide}
                disabled={currentTourSlide === 0}
                className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={nextTourSlide}
                disabled={currentTourSlide >= featuredTours.length - 3}
                className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden">
            <div 
              className="flex space-x-6 transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentTourSlide * 33.33}%)` }}
            >
              {featuredTours.map((tour) => (
                <div
                  key={tour.id}
                  className="flex-shrink-0 w-1/3 min-w-[320px] bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                >
                  <div className="relative">
                    <img
                      src={tour.image}
                      alt={tour.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {tour.isPopular && (
                      <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        chọn lọc
                      </div>
                    )}
                    {tour.discount && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Giảm {tour.discount}%
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <span>{tour.category}</span>
                      <span className="mx-2">•</span>
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{tour.location}</span>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {tour.title}
                    </h3>

                    <div className="flex items-center mb-3">
                      <div className="flex items-center mr-4">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm font-semibold">{tour.rating}</span>
                        <span className="text-xs text-gray-500 ml-1">({tour.reviews.toLocaleString()})</span>
                      </div>
                      <span className="text-xs text-gray-500">{tour.booked} Đã được đặt</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {tour.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        {tour.originalPrice > tour.currentPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            ₫ {tour.originalPrice.toLocaleString()}
                          </span>
                        )}
                        <div className="text-lg font-bold text-orange-600">
                          Từ ₫ {tour.currentPrice.toLocaleString()}
                        </div>
                      </div>
                      {tour.discount && (
                        <div className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-semibold">
                          Sale
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Title */}
        <h2 className="text-3xl font-bold mb-8">Sáng tạo theo lối riêng</h2>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6">
  {/* Card 1 */}
  <div className="relative rounded-lg overflow-hidden shadow-lg group cursor-pointer">
    {/* Background Image */}
    <img
      src="https://example.com/singapore.jpg"
      alt="Staycation Singapore"
      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
    />
    {/* Overlay Gradient */}
    <div className="absolute inset-0 bg-gradient-to-t from-purple-700/70 to-transparent"></div>
    {/* Content */}
    <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
      <h3 className="text-xl font-bold">Trải nghiệm độc đáo</h3>
      <p className="mt-2 text-sm">
        Khám phá những hoạt động chỉ có tại điểm đến, mang lại kỷ niệm khó quên
        và cảm giác mới mẻ trong từng hành trình.
      </p>
      <button className="mt-4 bg-white text-gray-900 px-4 py-2 rounded self-start font-medium hover:bg-gray-200 transition active:scale-95">
        Khám phá ngay
      </button>
    </div>
  </div>

  {/* Card 2 */}
  <div className="relative rounded-lg overflow-hidden shadow-lg group cursor-pointer">
    {/* Background Image */}
    <img
      src="https://example.com/dubai.jpg"
      alt="Activities in Dubai"
      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
    />
    {/* Overlay Gradient */}
    <div className="absolute inset-0 bg-gradient-to-t from-orange-700/70 to-transparent"></div>
    {/* Content */}
    <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
      <h3 className="text-xl font-bold">
        Thiết kế tour theo phong cách của bạn
      </h3>
      <p className="mt-2 text-sm">
        Tự do lựa chọn lịch trình, dịch vụ và trải nghiệm theo sở thích cá nhân
        để chuyến đi thực sự mang dấu ấn riêng.
      </p>
      <button className="mt-4 bg-white text-gray-900 px-4 py-2 rounded self-start font-medium hover:bg-gray-200 transition active:scale-95">
        Khám phá ngay
      </button>
    </div>
  </div>
</div>
  
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-12">
  <h2 className="text-3xl font-bold mb-8">
    Vì sao chọn chúng tôi
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
    {/* Card 1 */}
    <div className="flex flex-col items-start text-left">
      <img
        src="/icons/possibilities.png"
        alt="Discover"
        className="w-12 h-12 mb-4"
      />
      <h3 className="text-lg font-semibold text-gray-900">
        Tour hấp dẫn
      </h3>
      <p className="mt-2 text-gray-600 text-sm">
        Hàng loạt tour du lịch đặc sắc, đa dạng điểm đến cho bạn lựa chọn và trải nghiệm trọn vẹn.
      </p>
    </div>

    {/* Card 2 */}
    <div className="flex flex-col items-start text-left">
      <img
        src="/icons/deals.png"
        alt="Deals"
        className="w-12 h-12 mb-4"
      />
      <h3 className="text-lg font-semibold text-gray-900">
        Ưu đãi hấp dẫn
      </h3>
      <p className="mt-2 text-gray-600 text-sm">Tour chất lượng với giá hợp lý, nhiều khuyến mãi đặc biệt giúp bạn tiết kiệm chi phí.Hoạt động chất lượng, giá cả hợp lý. Thêm vào đó, bạn còn có thể tích điểm để tiết kiệm nhiều hơn.
      </p>
    </div>

    {/* Card 3 */}
    <div className="flex flex-col items-start text-left">
      <img
        src="/icons/explore.png"
        alt="Explore"
        className="w-12 h-12 mb-4"
      />
      <h3 className="text-lg font-semibold text-gray-900">
        Lựa chọn chuyến đi theo ý bạn
      </h3>
      <p className="mt-2 text-gray-600 text-sm">
        Tự do thiết kế lịch trình và chọn hoạt động phù hợp với sở thích của riêng bạn.
      </p>
    </div>

    {/* Card 4 */}
    <div className="flex flex-col items-start text-left">
      <img
        src="/icons/trust.png"
        alt="Trust"
        className="w-12 h-12 mb-4"
      />
      <h3 className="text-lg font-semibold text-gray-900">
        Hành trình đáng tin cậy
      </h3>
      <p className="mt-2 text-gray-600 text-sm">
        Đánh giá minh bạch, dịch vụ hỗ trợ nhanh chóng. Chúng tôi đồng hành cùng bạn trên mọi chuyến đi.
      </p>
    </div>
  </div>
</div>



      </div>
    </section>
  );
};

export default TourPromotions;