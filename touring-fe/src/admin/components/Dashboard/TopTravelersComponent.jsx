import React, { useState } from 'react';
import { TrendingUp, Crown, Award, Star, User, X } from 'lucide-react';

const mockTravelers = [
  {
    id: 1,
    icon: Crown,
    name: "Nguyễn Văn An",
    age: "35 tuổi",
    percentage: "28%",
    tours: 45,
    totalSpent: "285,000,000 VNĐ",
    description: "Khách hàng VIP, đặt tour cao cấp nhất với dịch vụ premium và trải nghiệm độc đáo cho gia đình. Ưu tiên các tour nghỉ dưỡng 5 sao và du thuyền.",
    preferences: "Tour cao cấp, Du thuyền, Resort 5 sao",
    lastBooking: "Tour Maldives Premium - 15/10/2025"
  },
  {
    id: 2,
    icon: Award,
    name: "Trần Thị Minh",
    age: "42 tuổi",
    percentage: "24%",
    tours: 38,
    totalSpent: "220,000,000 VNĐ",
    description: "Khách hàng thân thiết, có thu nhập cao, thường xuyên đặt tour du lịch nước ngoài và nghỉ dưỡng cao cấp. Yêu thích khám phá các nền văn hóa khác nhau.",
    preferences: "Du lịch châu Âu, Nghỉ dưỡng, Văn hóa",
    lastBooking: "Tour Pháp - Thụy Sĩ - Ý - 08/10/2025"
  },
  {
    id: 3,
    icon: Star,
    name: "Lê Hoàng Phúc",
    age: "32 tuổi",
    percentage: "19%",
    tours: 31,
    totalSpent: "175,000,000 VNĐ",
    description: "Khách hàng trung thành, đặt tour team building cho công ty và du lịch cùng bạn bè. Ưu tiên các hoạt động ngoài trời và trải nghiệm nhóm.",
    preferences: "Team building, Phiêu lưu, Tour nhóm",
    lastBooking: "Team Building Đà Lạt - 01/10/2025"
  },
  {
    id: 4,
    icon: User,
    name: "Phạm Thu Hương",
    age: "38 tuổi",
    percentage: "16%",
    tours: 26,
    totalSpent: "148,000,000 VNĐ",
    description: "Ưa thích tour khám phá văn hóa, thường đặt tour châu Á và các điểm đến mới lạ. Quan tâm đến ẩm thực địa phương và lịch sử.",
    preferences: "Văn hóa châu Á, Ẩm thực, Lịch sử",
    lastBooking: "Tour Nhật Bản - Kyoto - 25/09/2025"
  },
  {
    id: 5,
    icon: User,
    name: "Hoàng Minh Tuấn",
    age: "29 tuổi",
    percentage: "13%",
    tours: 22,
    totalSpent: "118,000,000 VNĐ",
    description: "Khách hàng tiềm năng lớn, thích tour phiêu lưu và trải nghiệm độc đáo với nhóm bạn. Yêu thích các hoạt động thể thao mạo hiểm.",
    preferences: "Phiêu lưu, Thể thao mạo hiểm, Camping",
    lastBooking: "Tour Trekking Sapa - 18/09/2025"
  }
];

export default function TopTravelersComponent() {
  const [selectedTraveler, setSelectedTraveler] = useState(null);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-emerald-600" strokeWidth={2.5} />
          <h1 className="text-xl font-bold text-gray-800">Top Travelers</h1>
        </div>
        
        {/* Cards */}
        <div className="space-y-4 flex-1">
          {mockTravelers.map((traveler, index) => {
            const IconComponent = traveler.icon;
            return (
              <div
                key={traveler.id}
                onClick={() => setSelectedTraveler(traveler)}
                className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white font-bold text-lg">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-800 font-semibold text-lg">{traveler.name}</h3>
                  </div>
                  <IconComponent className="w-6 h-6 text-emerald-600" strokeWidth={2} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {selectedTraveler && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-6 rounded-t-2xl relative">
              <button
                onClick={() => setSelectedTraveler(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  {React.createElement(selectedTraveler.icon, { className: "w-8 h-8 text-white", strokeWidth: 2 })}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedTraveler.name}</h2>
                  <p className="text-white/90">{selectedTraveler.age}</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border-2 border-emerald-200">
                  <p className="text-gray-600 text-sm mb-1">Số tour đã đặt</p>
                  <p className="text-2xl font-bold text-emerald-600">{selectedTraveler.tours}</p>
                </div>
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-xl border-2 border-teal-200">
                  <p className="text-gray-600 text-sm mb-1">Tỷ lệ đóng góp</p>
                  <p className="text-2xl font-bold text-teal-600">{selectedTraveler.percentage}</p>
                </div>
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 rounded-xl border-2 border-cyan-200">
                  <p className="text-gray-600 text-sm mb-1">Tổng chi tiêu</p>
                  <p className="text-lg font-bold text-cyan-600">{selectedTraveler.totalSpent}</p>
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-2">Thông tin chi tiết</h3>
                <p className="text-gray-600 leading-relaxed">{selectedTraveler.description}</p>
              </div>

              {/* Preferences */}
              <div className="bg-emerald-50 p-4 rounded-xl border-2 border-emerald-200">
                <h3 className="font-semibold text-gray-800 mb-2">Sở thích du lịch</h3>
                <p className="text-gray-700">{selectedTraveler.preferences}</p>
              </div>

              {/* Last Booking */}
              <div className="bg-teal-50 p-4 rounded-xl border-2 border-teal-200">
                <h3 className="font-semibold text-gray-800 mb-2">Booking gần nhất</h3>
                <p className="text-gray-700">{selectedTraveler.lastBooking}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}