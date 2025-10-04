import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { destinationList } from "../mockdata/destinationList";

export default function RegionPage() {
  const navigate = useNavigate();

  // Map tên tỉnh với ảnh (bạn có thể thay bằng ảnh thật)
  const regionImages = {
    "Việt Nam": "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400",
    "Nhật Bản": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400",
    "Singapore": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400",
    "Thái Lan": "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400",
    "Trung Quốc": "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=400",
    "Hàn Quốc": "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=400",
    "Úc": "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=400",
    "Anh": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400",
    "Thụy Sĩ": "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=400",
    "Mỹ": "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=400",
    "Malaysia": "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400",
    "Indonesia": "https://images.unsplash.com/photo-1555899434-94d1eb5d0c55?w=400",
  };

  // 👇 Auto scroll to top khi load page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#007980] mb-3">
            Khám Phá Các Điểm Đến
          </h1>
          <p className="text-lg text-gray max-w-2xl mx-auto">
            Chọn điểm đến yêu thích của bạn
          </p>
          <div className="w-16 h-1 bg-[#03B3BE] mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Grid of Regions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Object.keys(destinationList).map((regionName) => (
            <div
              key={regionName}
              onClick={() => navigate(`/region/${regionName.toLowerCase()}`)}
              className="group cursor-pointer bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 p-4"
            >
              <div className="flex items-center gap-4">
                {/* Circular Image */}
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-gray-100 group-hover:ring-[#03B3BE] transition-all duration-300">
                    <img
                      src={
                        regionImages[regionName] ||
                        "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400"
                      }
                      alt={regionName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Region Name */}
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-800 group-hover:text-[#03B3BE] transition-colors duration-300">
                    {regionName.toUpperCase()}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
