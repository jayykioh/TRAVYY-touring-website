import React from "react";
import { useAuth } from "../auth/context";
import logger from "../utils/logger";
import TourHeroSection from "../components/TourHeroSection";
import TourPromotions from "../components/TourRecommend";
import AboutSection from "../components/AboutSection";
import TravelBlog from "../components/TravelBlog";
import FAQ from "../components/FAQ";
import VietnamDestinations from "../components/VietnamDestinations";
import TrustedPartners from "../components/TrustedPartners";
import QuickBooking from "../components/QuickBooking";
import WhyChooseUs from "../components/WhyChooseUs";
import TourDetailPage from "../pages/TourDetailPage";
import Explore from "../components/ExploreNow";
import RegionSection from "../components/RegionSection";

export default function MainHome() {
  const { bannedInfo, booting } = useAuth();

  logger.debug(
    "🏠 MainHome render - bannedInfo:",
    bannedInfo,
    "booting:",
    booting
  );

  // Wait for auth state to initialize
  if (booting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (bannedInfo) {
    const reason =
      bannedInfo.reason ||
      bannedInfo.message ||
      "Tài khoản của bạn đã bị khóa.";
    logger.info("🚫 Showing ban UI with reason:", reason);
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="max-w-xl bg-white rounded-lg shadow p-8 text-center border">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Tài khoản bị khóa
          </h2>
          <p className="text-gray-700 mb-4">
            Bạn không thể truy cập vì tài khoản của bạn đã bị khóa.
          </p>
          {reason && (
            <div className="bg-red-50 border border-red-100 p-3 rounded text-sm text-red-700 mb-4">
              <strong>Lý do:</strong> {reason}
            </div>
          )}
          <p className="text-sm text-gray-500">
            Nếu bạn nghĩ đây là nhầm lẫn, vui lòng liên hệ bộ phận hỗ trợ.
          </p>
        </div>
      </div>
    );
  }
  return (
    <>
      {/* Hero section với tour slider */}
      <TourHeroSection />

      {/* Quick Booking Bar - sticky booking form */}
      <QuickBooking />

      {/* Tour promotions với điều hướng tới trang mã giảm giá */}

      <TourPromotions />
      <RegionSection />

      <Explore />

      {/* Why Choose Us */}
      {/* <WhyChooseUs /> */}

      {/* FAQ */}
      {/* <FAQ/> */}

      {/* Travel Blog & Guides */}
      <TravelBlog />

      {/* Vietnam Destinations */}
      {/* <VietnamDestinations /> */}

      {/* About Section */}
      <AboutSection />
    </>
  );
}
