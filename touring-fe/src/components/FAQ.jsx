// src/components/FAQ.jsx
import React, { useState } from "react";
import { ChevronDown, ChevronUp, MessageCircle, Globe, MapPin, Search, User, Users } from "lucide-react";
import { faqs as faqData } from "../mockdata/helpData";

export default function FAQ() {
  const [openItems, setOpenItems] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const toggleItem = (id) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const categories = [
    { id: "all", name: "Tất cả", icon: Globe },
    { id: "weather", name: "Thời tiết", icon: Globe },
    { id: "transport", name: "Di chuyển", icon: MapPin },
    { id: "food", name: "Ẩm thực", icon: MessageCircle },
    { id: "planning", name: "Lên kế hoạch", icon: MapPin },
    { id: "culture", name: "Văn hóa", icon: Users },
    { id: "activities", name: "Hoạt động", icon: MessageCircle },
    { id: "shopping", name: "Mua sắm", icon: MapPin },
    { id: "money", name: "Tiền tệ", icon: Globe }
  ];

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredFAQs = faqData.slice(0, 3);
  const localFAQs = filteredFAQs.filter(faq => faq.isLocal);
  const foreignFAQs = filteredFAQs.filter(faq => !faq.isLocal);

  return (
    <section className="py-16 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Giải đáp thắc mắc
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Những câu hỏi thường gặp từ du khách khi khám phá Việt Nam. 
            Kinh nghiệm từ người địa phương để chuyến đi của bạn trọn vẹn hơn.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{faqData.length}+</h3>
            <p className="text-gray-600">Câu hỏi được giải đáp</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{localFAQs.length}</h3>
            <p className="text-gray-600">Từ người địa phương</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{foreignFAQs.length}</h3>
            <p className="text-gray-600">Từ du khách quốc tế</p>
          </div>
        </div>

        {/* Featured FAQs */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {featuredFAQs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-blue-500"
            >
              <div className="flex items-start mb-4">
                <MessageCircle className="w-6 h-6 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                <h3 className="font-semibold text-gray-800 text-lg leading-tight">
                  "{faq.question.split('?')[0]}?"
                </h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-4 mb-4">
                {faq.answer.substring(0, 120)}...
              </p>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <MapPin className="w-3 h-3 mr-1" />
                  {faq.location}
                </span>
                {faq.isLocal && (
                  <span className="text-xs text-green-600 font-medium flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    Người địa phương
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm câu hỏi theo từ khóa, địa điểm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const IconComponent = category.icon;
                const count = category.id === "all" ? faqData.length : faqData.filter(faq => faq.category === category.id).length;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      selectedCategory === category.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {category.name}
                    <span className="ml-1 text-xs opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Count */}
        {searchTerm || selectedCategory !== "all" ? (
          <div className="mb-6">
            <p className="text-gray-600">
              Tìm thấy <span className="font-semibold text-blue-600">{filteredFAQs.length}</span> câu hỏi
              {searchTerm && ` cho "${searchTerm}"`}
              {selectedCategory !== "all" && ` trong danh mục "${categories.find(c => c.id === selectedCategory)?.name}"`}
            </p>
          </div>
        ) : null}

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-lg mb-2">
                      {faq.question}
                    </h3>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <MapPin className="w-3 h-3 mr-1" />
                        {faq.location}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        faq.category === 'weather' ? 'bg-yellow-100 text-yellow-800' :
                        faq.category === 'transport' ? 'bg-purple-100 text-purple-800' :
                        faq.category === 'food' ? 'bg-red-100 text-red-800' :
                        faq.category === 'planning' ? 'bg-indigo-100 text-indigo-800' :
                        faq.category === 'culture' ? 'bg-pink-100 text-pink-800' :
                        faq.category === 'activities' ? 'bg-green-100 text-green-800' :
                        faq.category === 'shopping' ? 'bg-orange-100 text-orange-800' :
                        faq.category === 'money' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {faq.category === 'weather' ? '🌤️ Thời tiết' :
                         faq.category === 'transport' ? '🚗 Di chuyển' :
                         faq.category === 'food' ? '🍜 Ẩm thực' :
                         faq.category === 'planning' ? '📅 Kế hoạch' :
                         faq.category === 'culture' ? '🏛️ Văn hóa' :
                         faq.category === 'activities' ? '🎯 Hoạt động' :
                         faq.category === 'shopping' ? '🛍️ Mua sắm' :
                         faq.category === 'money' ? '💰 Tiền tệ' :
                         faq.category === 'accommodation' ? '🏨 Lưu trú' :
                         faq.category === 'adventure' ? '🏔️ Mạo hiểm' :
                         faq.category === 'comparison' ? '⚖️ So sánh' :
                         faq.category === 'insurance' ? '🛡️ Bảo hiểm' :
                         faq.category === 'packing' ? '🎒 Hành lý' :
                         faq.category}
                      </span>
                      {faq.isLocal ? (
                        <span className="text-xs text-green-600 font-medium flex items-center bg-green-50 px-2 py-1 rounded-full">
                          <User className="w-3 h-3 mr-1" />
                          Kinh nghiệm địa phương
                        </span>
                      ) : (
                        <span className="text-xs text-orange-600 font-medium flex items-center bg-orange-50 px-2 py-1 rounded-full">
                          <Users className="w-3 h-3 mr-1" />
                          Du khách quốc tế
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    {openItems[faq.id] ? (
                      <ChevronUp className="w-6 h-6 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                </button>
                
                {openItems[faq.id] && (
                  <div className="border-t border-gray-100 bg-gray-50">
                    <div className="p-6">
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {faq.answer}
                        </p>
                      </div>
                      {/* Related Questions */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500 mb-2">Câu hỏi liên quan cùng địa điểm:</p>
                        <div className="flex flex-wrap gap-2">
                          {faqData
                            .filter(relatedFaq => 
                              relatedFaq.location === faq.location && 
                              relatedFaq.id !== faq.id
                            )
                            .slice(0, 2)
                            .map(relatedFaq => (
                              <button
                                key={relatedFaq.id}
                                onClick={() => toggleItem(relatedFaq.id)}
                                className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition-colors duration-200"
                              >
                                {relatedFaq.question.substring(0, 50)}...
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-500 mb-2">
                Không tìm thấy câu hỏi nào
              </h3>
              <p className="text-gray-400 mb-4">
                Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác
              </p>
              <button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>

        {/* Contact for More Questions */}
        <div className="mt-12">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white text-center">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-80" />
            <h3 className="text-2xl font-bold mb-4">
              Chưa tìm thấy câu trả lời?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Đừng ngại liên hệ với chúng tôi! Đội ngũ tư vấn viên địa phương với kinh nghiệm 
              nhiều năm sẵn sàng hỗ trợ bạn 24/7 để chuyến đi trở nên hoàn hảo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300">
                Liên hệ tư vấn
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300">
                Gửi câu hỏi mới
              </button>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-green-500">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center">
              <User className="w-5 h-5 text-green-500 mr-2" />
              Tips từ người địa phương
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Mặc cả là văn hóa bình thường ở Việt Nam</li>
              <li>• Ăn ở những nơi có nhiều người Việt</li>
              <li>• Học vài câu tiếng Việt đơn giản</li>
              <li>• Luôn mang theo tiền mặt</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-orange-500">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center">
              <Users className="w-5 h-5 text-orange-500 mr-2" />
              Lưu ý cho khách quốc tế
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Tải ứng dụng Grab để di chuyển</li>
              <li>• Mang theo bằng lái quốc tế</li>
              <li>• Chụp ảnh passport và visa</li>
              <li>• Bảo hiểm du lịch là cần thiết</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}