import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Component mã giảm giá
const DiscountCode = ({ code, title, description, discount, expiry, minOrder, onCopy, bgColor = "bg-red-500", borderColor = "border-red-600" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    onCopy && onCopy(code);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`${bgColor} rounded-lg p-4 border-2 ${borderColor} shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm">%</span>
          <span className="font-bold text-xl text-white">{discount}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold hover:bg-white/30 transition-all duration-300"
        >
          {copied ? "✓" : "📋"}
          {copied ? "Đã copy" : "Copy"}
        </button>
      </div>
      
      <h3 className="font-bold text-white text-sm mb-1">{title}</h3>
      <p className="text-white/90 text-xs mb-3">{description}</p>
      
      <div className="border-t border-white/20 pt-2 mt-2">
        <div className="flex justify-between items-center text-xs text-white">
          <span className="font-mono font-bold bg-white/20 px-2 py-1 rounded backdrop-blur-sm">
            {code}
          </span>
          <div className="text-right text-white/90">
            <div>Đơn tối thiểu: {minOrder}</div>
            <div className="flex items-center gap-1 mt-1">
              <span>⏰</span>
              <span>HSD: {expiry}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DiscountCodesPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [copiedCodes, setCopiedCodes] = useState([]);

  // Dữ liệu mã giảm giá
  const discountCodes = [
    {
      id: 1,
      code: "VISA8OFF",
      title: "Giảm 8% thanh toán VISA",
      description: "Áp dụng cho tất cả đơn hàng thanh toán bằng thẻ VISA",
      discount: "8% OFF",
      expiry: "31/12/2024",
      minOrder: "500,000₫",
      category: "payment",
      bgColor: "bg-blue-600",
      borderColor: "border-blue-800",
    },
    {
      id: 2,
      code: "MEGA50",
      title: "Mega Sale cuối năm",
      description: "Giảm tới 50% cho các tour hot nhất",
      discount: "50% OFF",
      expiry: "15/01/2025",
      minOrder: "1,000,000₫",
      category: "tour",
      bgColor: "bg-red-500",
      borderColor: "border-red-700",
    },
    {
      id: 3,
      code: "HOTEL12",
      title: "Ưu đãi khách sạn & trải nghiệm",
      description: "Giảm 12% cho booking khách sạn và các hoạt động trải nghiệm",
      discount: "12% OFF",
      expiry: "28/02/2025",
      minOrder: "800,000₫",
      category: "hotel",
      bgColor: "bg-purple-500",
      borderColor: "border-purple-700",
    },
    {
      id: 4,
      code: "NEWUSER20",
      title: "Chào mừng thành viên mới",
      description: "Giảm 20% cho lần đặt tour đầu tiên",
      discount: "20% OFF",
      expiry: "31/03/2025",
      minOrder: "600,000₫",
      category: "new",
      bgColor: "bg-green-500",
      borderColor: "border-green-700",
    },
    {
      id: 5,
      code: "WEEKEND15",
      title: "Khuyến mãi cuối tuần",
      description: "Giảm 15% cho các tour khởi hành cuối tuần",
      discount: "15% OFF",
      expiry: "30/04/2025",
      minOrder: "700,000₫",
      category: "weekend",
      bgColor: "bg-orange-500",
      borderColor: "border-orange-600",
    },
    {
      id: 6,
      code: "VIP25",
      title: "Thành viên VIP",
      description: "Ưu đãi đặc biệt dành cho thành viên VIP",
      discount: "25% OFF",
      expiry: "31/05/2025",
      minOrder: "1,500,000₫",
      category: "vip",
      bgColor: "bg-gray-800",
      borderColor: "border-gray-900",
    },
  ];

  // Categories filter
  const categories = [
    { id: "all", name: "Tất cả", icon: "🎁" },
    { id: "payment", name: "Thanh toán", icon: "💳" },
    { id: "tour", name: "Tour", icon: "✨" },
    { id: "hotel", name: "Khách sạn", icon: "⭐" },
    { id: "new", name: "Thành viên mới", icon: "🏷️" },
    { id: "weekend", name: "Cuối tuần", icon: "📅" },
    { id: "vip", name: "VIP", icon: "%" },
  ];

  // Filter codes based on selected category
  const filteredCodes = selectedCategory === "all" 
    ? discountCodes 
    : discountCodes.filter(code => code.category === selectedCategory);

  const handleCopyCode = (code) => {
    setCopiedCodes(prev => [...prev, code]);
  };

  const handleBack = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-full transition-colors duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Quay lại</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mã giảm giá</h1>
                <p className="text-gray-600">Săn ngay các deal hot nhất!</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Có sẵn</div>
              <div className="text-xl font-bold text-blue-600">{filteredCodes.length} mã</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">🎉 Săn mã giảm giá siêu hot!</h2>
              <p className="text-blue-100 text-lg">
                Tiết kiệm lên đến 50% cho chuyến du lịch trong mơ của bạn
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                <span className="text-5xl">✨</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh mục</h3>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200"
                }`}
              >
                <span>{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Discount Codes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredCodes.map((code) => (
            <DiscountCode
              key={code.id}
              code={code.code}
              title={code.title}
              description={code.description}
              discount={code.discount}
              expiry={code.expiry}
              minOrder={code.minOrder}
              bgColor={code.bgColor}
              borderColor={code.borderColor}
              onCopy={handleCopyCode}
            />
          ))}
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            🎁 Hướng dẫn sử dụng mã giảm giá
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Sao chép mã</h4>
                  <p className="text-gray-600 text-sm">Nhấn nút "Copy" để sao chép mã giảm giá</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Chọn tour</h4>
                  <p className="text-gray-600 text-sm">Thêm tour/dịch vụ yêu thích vào giỏ hàng</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Nhập mã</h4>
                  <p className="text-gray-600 text-sm">Dán mã vào ô "Mã giảm giá" khi thanh toán</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Nhận ưu đãi</h4>
                  <p className="text-gray-600 text-sm">Hoàn tất thanh toán và tận hưởng ưu đãi</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center gap-2">
            💡 Mẹo tiết kiệm
          </h3>
          <ul className="space-y-2 text-yellow-700">
            <li>• Theo dõi thường xuyên để không bỏ lỡ mã giảm giá mới</li>
            <li>• Kết hợp nhiều ưu đãi để tiết kiệm tối đa</li>
            <li>• Đặt trước để được giá tốt nhất</li>
            <li>• Chia sẻ với bạn bè để cùng nhận ưu đãi</li>
          </ul>
        </div>

        {/* Stats */}
        {copiedCodes.length > 0 && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-green-800">
              <span>✓</span>
              <span className="font-medium">
                Bạn đã sao chép {copiedCodes.length} mã giảm giá
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}