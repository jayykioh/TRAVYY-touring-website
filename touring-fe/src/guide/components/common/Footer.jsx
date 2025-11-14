// src/components/guide/FooterSmall.jsx
import React from "react";

export default function GuideFooter() {
  return (
    <footer className="mt-6 border-t border-gray-100 bg-[#f8f9fa] backdrop-blur-sm">
      {/* Thanh màu chủ đạo mảnh ở trên */}
      <div className="h-0.5 w-full bg-gray-200" />

      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-3 text-xs sm:text-sm text-gray-600">
        <p className="text-center">
          © 2025 <span className="font-semibold text-[#02A0AA]">Travyy</span> ·
          Bảng điều khiển dành cho hướng dẫn viên.
        </p>
      </div>
    </footer>
  );
}
