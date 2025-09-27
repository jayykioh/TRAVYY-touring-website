import React from "react";
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
    { number: "50,000+", label: "Khách hàng hài lòng", icon: Users },
    { number: "500+", label: "Tour du lịch", icon: MapPin },
    { number: "4.9/5", label: "Đánh giá trung bình", icon: Award },
    { number: "10+", label: "Năm kinh nghiệm", icon: Clock }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Tại sao chọn chúng tôi?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Với hơn 10 năm kinh nghiệm trong ngành du lịch, chúng tôi tự hào mang đến những trải nghiệm 
            du lịch tuyệt vời nhất cho khách hàng
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group text-center p-6 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className={`inline-flex p-4 rounded-2xl ${feature.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <Icon className="w-8 h-8 mx-auto mb-4 opacity-80" />
                  <div className="text-3xl md:text-4xl font-bold mb-2">
                    {stat.number}
                  </div>
                  <div className="text-blue-100 text-sm md:text-base">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Sẵn sàng khám phá những điều tuyệt vời?
            </h3>
            <p className="text-gray-600 mb-8">
              Hãy để chúng tôi giúp bạn tạo ra những kỷ niệm đáng nhớ trong chuyến du lịch sắp tới
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-full transition-colors duration-200">
                Tư vấn miễn phí
              </button>
              <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold px-8 py-4 rounded-full transition-all duration-200">
                Xem tour hot
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;