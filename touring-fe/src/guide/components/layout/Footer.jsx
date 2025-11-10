// src/components/guide/FooterSmall.jsx
import React from "react";

export default function GuideFooter() {
  return (
    <footer className="bg-white/60 backdrop-blur-sm border-t border-gray-200 py-3 text-center text-sm text-gray-600">
      <p>
        © 2025 <span className="font-semibold text-gray-800">Travyy</span>. Hỗ
        trợ hướng dẫn viên:{" "}
        <a
          href="mailto:support@travyy.vn"
          className="text-blue-600 hover:underline"
        >
          support@travyy.vn
        </a>
      </p>
    </footer>
  );
}
