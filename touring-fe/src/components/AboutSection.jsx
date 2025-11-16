import React from 'react';
import { 
  Shield, 
  Award, 
  Users, 
  Globe, 
  Heart, 
  Star,
  CheckCircle,
  MapPin,
  Clock,
  Headphones
} from 'lucide-react';

const AboutSection = () => {
  const features = [
    {
      icon: Shield,
      title: 'An toàn & Bảo mật',
      description: 'Thanh toán an toàn, bảo mật thông tin khách hàng tuyệt đối',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Award,
      title: 'Chất lượng đảm bảo',
      description: 'Hướng dẫn viên chuyên nghiệp, tour được kiểm duyệt kỹ lưỡng',
      color: 'from-amber-500 to-amber-600'
    },
    {
      icon: Headphones,
      title: 'Hỗ trợ 24/7',
      description: 'Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ bạn',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Heart,
      title: 'Giá tốt nhất',
      description: 'Cam kết giá cạnh tranh, nhiều ưu đãi hấp dẫn',
      color: 'from-pink-500 to-pink-600'
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Khách hàng hài lòng', icon: Users },
    { value: '500+', label: 'Tour đa dạng', icon: MapPin },
    { value: '4.8/5', label: 'Đánh giá trung bình', icon: Star },
    { value: '100+', label: 'Hướng dẫn viên', icon: Globe }
  ];

  const whyChooseUs = [
    'Đặt tour nhanh chóng, tiện lợi chỉ với vài bước',
    'Hệ thống AI gợi ý tour phù hợp với sở thích',
    'Tạo hành trình tùy chỉnh theo nhu cầu cá nhân',
    'Thanh toán linh hoạt, hoàn tiền dễ dàng',
    'Đánh giá minh bạch từ khách hàng thực tế',
    'Kết nối trực tiếp với hướng dẫn viên địa phương'
  ];

  return (
    <section className="py-20 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Về chúng tôi
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Nền tảng kết nối du khách với hướng dẫn viên địa phương, 
            mang đến trải nghiệm du lịch độc đáo và đáng nhớ tại Việt Nam
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-linear-to-br from-blue-500 to-teal-500 text-white mb-4">
                <stat.icon className="w-7 h-7" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Tại sao chọn chúng tôi?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-linear-to-br ${feature.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Why Choose Us List */}
        <div className="bg-linear-to-br from-blue-50 via-white to-teal-50 rounded-3xl p-8 md:p-12 shadow-xl border border-gray-200">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Điểm khác biệt của chúng tôi
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {whyChooseUs.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-4 hover:bg-white hover:shadow-md transition-all duration-300"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <CheckCircle className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium leading-relaxed">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="mt-20 text-center max-w-4xl mx-auto">
          <div className="bg-linear-to-r from-blue-600 to-teal-600 rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="relative z-10">
              <Globe className="w-16 h-16 mx-auto mb-6 opacity-90" />
              <h3 className="text-3xl font-bold mb-4">
                Sứ mệnh của chúng tôi
              </h3>
              <p className="text-lg leading-relaxed text-blue-50">
                Kết nối du khách với những trải nghiệm du lịch đích thực, 
                góp phần phát triển du lịch bền vững và nâng cao chất lượng dịch vụ du lịch Việt Nam. 
                Chúng tôi tin rằng mỗi chuyến đi là một câu chuyện đáng nhớ.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
};

export default AboutSection;
