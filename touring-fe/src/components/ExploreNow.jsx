import { ChevronRight, ChevronLeft, Heart } from "lucide-react";
import TourCard from "./TourCard";
import { Link } from "react-router-dom";

const ExploreNow = () => {
  return (
    <section className="pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Creative sections */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-bold mb-8">Sáng tạo theo lối riêng</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Link
              to={"/experiences"}
              className="relative rounded-lg overflow-hidden shadow-lg group cursor-pointer transform hover:scale-105 transition-all duration-500"
            >
              <img
                src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1170&auto=format&fit=crop"
                alt="Trải nghiệm độc đáo"
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-700/70 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                <h3 className="text-xl font-bold">Trải nghiệm độc đáo</h3>
                <p className="mt-2 text-sm">
                  Khám phá những hoạt động chỉ có tại điểm đến, mang lại kỷ niệm
                  khó quên và cảm giác mới mẻ trong từng hành trình.
                </p>
                <button className="mt-4 bg-white text-gray-900 px-4 py-2 rounded self-start font-medium hover:bg-gray-200 transition active:scale-95">
                  Khám phá ngay
                </button>
              </div>
            </Link>

            <Link
              to={"/customTour"}
              className="relative rounded-lg overflow-hidden shadow-lg group cursor-pointer transform hover:scale-105 transition-all duration-500"
            >
              <img
                src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1170&auto=format&fit=crop"
                alt="Thiết kế tour theo phong cách"
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-orange-700/70 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                <h3 className="text-xl font-bold">
                  Thiết kế tour theo phong cách của bạn
                </h3>
                <p className="mt-2 text-sm">
                  Tự do lựa chọn lịch trình, dịch vụ và trải nghiệm theo sở
                  thích cá nhân để chuyến đi thực sự mang dấu ấn riêng.
                </p>
                <button className="mt-4 bg-white text-gray-900 px-4 py-2 rounded self-start font-medium hover:bg-gray-200 transition active:scale-95">
                  Khám phá ngay
                </button>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExploreNow;
