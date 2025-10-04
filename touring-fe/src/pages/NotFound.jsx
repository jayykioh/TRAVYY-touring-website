import { Link } from "react-router-dom";
import Lottie from "lottie-react";
import lonely404 from "../assets/404.json";

export default function NotFoundPage() {
  return (
    <main
      className="min-h-dvh flex items-center justify-center bg-white px-4"
      role="main"
      aria-label="404 Not Found"
    >
      <div className="w-full max-w-md flex flex-col items-center text-center">
        {/* Lottie 404 */}
        <div className="w-64 sm:w-72 md:w-80">
          <Lottie animationData={lonely404} loop={true} />
        </div>

        {/* Text */}
        <h1 className="mt-4 text-2xl sm:text-3xl font-semibold text-gray-800">
          Ôi! Trang không tồn tại ở Travyy
        </h1>
        <p className="mt-2 text-gray-500">
          Có thể liên kết đã sai hoặc trang đã bị xóa.
        </p>

        {/* Button */}
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-2xl px-5 py-3
                     text-white bg-[#1B8B80] shadow-lg shadow-gray-900/10 hover:scale-105 transistion-transform
                     hover:bg-[#156e65] active:scale-[0.99]
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900
                     transition" 
          aria-label="Quay về Dashboard"
        >
          Quay về Dashboard
        </Link>
      </div>

      {/* Respect reduced motion (nếu cần) */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .lottie, canvas { animation: none !important; }
        }
      `}</style>
    </main>
  );
}
