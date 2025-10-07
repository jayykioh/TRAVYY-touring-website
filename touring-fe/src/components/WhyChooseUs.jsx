import React from "react";
import { Link } from "react-router-dom";

import { 
  Shield, 
  Clock, 
  Award, 
  HeartHandshake, 
  MapPin, 
  Phone,
  DollarSign,
  Users
} from "lucide-react";

const WhyChooseUs = () => {
  const features = [
    {
      icon: Shield,
      title: "An Toàn & Uy Tín",
      description: "Đối tác chính thức với các nhà cung cấp dịch vụ uy tín, bảo hiểm du lịch toàn diện",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Clock,
      title: "Hỗ Trợ 24/7",
      description: "Đội ngũ tư vấn viên chuyên nghiệp sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: Award,
      title: "Chất Lượng Hàng Đầu",
      description: "Được khách hàng đánh giá 5 sao, giải thưởng 'Best Travel Agency 2024'",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: DollarSign,
      title: "Giá Tốt Nhất",
      description: "Cam kết giá cạnh tranh nhất thị trường, hoàn tiền nếu tìm thấy giá rẻ hơn",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      icon: MapPin,
      title: "Điểm Đến Đa Dạng",
      description: "Hơn 500 tour du lịch khắp Việt Nam và quốc tế, từ cao cấp đến bình dân",
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      icon: HeartHandshake,
      title: "Dịch Vụ Tận Tâm",
      description: "Từ lúc tư vấn đến khi kết thúc chuyến đi, chúng tôi luôn đồng hành cùng bạn",
      color: "text-pink-600",
      bgColor: "bg-pink-50"
    },
    {
      icon: Users,
      title: "Hướng Dẫn Viên Chuyên Nghiệp",
      description: "Đội ngũ HDV am hiểu địa phương, nhiều kinh nghiệm và nhiệt tình",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      icon: Phone,
      title: "Booking Dễ Dàng",
      description: "Đặt tour online nhanh chóng, thanh toán an toàn, xác nhận tức thì",
      color: "text-teal-600",
      bgColor: "bg-teal-50"
    }
  ];

  const stats = [
    { number: "5,000+", label: "Khách hàng hài lòng", icon: Users },
    { number: "150+", label: "Tour du lịch", icon: MapPin },
    { number: "4.9/5", label: "Đánh giá trung bình", icon: Award },
    { number: "5+", label: "Năm kinh nghiệm", icon: Clock }
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Tại sao chọn chúng tôi?
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Với hơn 10 năm kinh nghiệm trong ngành du lịch, chúng tôi tự hào mang đến những trải nghiệm 
            du lịch tuyệt vời nhất cho khách hàng
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group text-center p-5 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div 
          className="rounded-3xl p-8 md:p-12 text-white relative overflow-hidden"
          style={{
            backgroundImage: 'url(https://i.pinimg.com/736x/1e/34/a6/1e34a605086f2966bd2708821be135a6.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-[#1B8579] opacity-85"></div>
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <Icon className="w-6 h-6 mx-auto mb-3 opacity-90" />
                  <div className="text-2xl md:text-3xl font-bold mb-1">
                    {stat.number}
                  </div>
                  <div className="text-white text-xs md:text-sm opacity-90">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Sẵn sàng khám phá những điều tuyệt vời?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Hãy để chúng tôi giúp bạn tạo ra những kỷ niệm đáng nhớ trong chuyến du lịch sắp tới
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/ai-tour-creator"
                className="bg-[#1B8579] hover:bg-[#156b61] text-white font-semibold px-6 py-3 rounded-full transition-colors duration-200 text-sm"
              >
                Tư vấn miễn phí
              </Link>

              <Link
                to="/available-tours"
                className="border-2 border-[#1B8579] text-[#1B8579] hover:bg-[#1B8579] hover:text-white font-semibold px-6 py-3 rounded-full transition-all duration-200 text-sm"
              >
                Xem tour hot
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;