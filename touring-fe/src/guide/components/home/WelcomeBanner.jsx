import React from "react";
import { mockGuide } from "../../data/mockGuide";

const WelcomeBanner = () => {
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Chào buổi sáng"
      : currentHour < 18
      ? "Chào buổi chiều"
      : "Chào buổi tối";

  return (
    <div className="bg-gradient-to-r from-[#02A0AA] to-[#029ca6] rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">
            {greeting}, {mockGuide.name}! 👋
          </h2>
          <p className="text-white opacity-90 text-sm">
            Bạn có tour hôm nay. Hãy tạo cho họ một trải nghiệm đáng nhớ!
          </p>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold">{mockGuide.totalTours}</p>
            <p className="text-white opacity-80 text-xs">Tổng tour</p>
          </div>
          <div className="w-px h-12 bg-white opacity-30" />
          <div className="text-center">
            <p className="text-3xl font-bold flex items-center gap-1">
              {mockGuide.rating} <span className="text-yellow-300">⭐</span>
            </p>
            <p className="text-white opacity-80 text-xs">Đánh giá</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
