// src/pages/guide/MyToursPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import { Clock, CheckCircle } from "lucide-react";
import { useAuth } from "../../auth/context";
import { toast } from "sonner";
import TourCard from "../components/home/TourCard";

const MyToursPage = () => {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "accepted";
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const { user, withAuth } = useAuth();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const fetchTours = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await withAuth("/api/itinerary/guide/accepted-tours");

      if (data.success && Array.isArray(data.tours)) {
        setTours(data.tours);
      } else {
        setTours([]);
      }
    } catch (error) {
      console.error("Error fetching tours:", error);
      toast.error("Không thể tải danh sách tour");
      setTours([]);
    } finally {
      setLoading(false);
    }
  }, [user, withAuth]);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  // Categorize tours by status/dates
  const categorizeTours = (tours) => {
    const now = new Date();
    const result = {
      accepted: [],
      upcoming: [],
      completed: [],
      inProgress: [],
    };

    tours.forEach((tour) => {
      const preferredDate = tour.preferredDate
        ? new Date(tour.preferredDate)
        : null;

      if (tour.tourGuideRequest?.status === "completed") {
        result.completed.push(tour);
      } else if (
        preferredDate &&
        preferredDate.toDateString() === now.toDateString()
      ) {
        result.inProgress.push(tour);
      } else if (preferredDate && preferredDate > now) {
        result.upcoming.push(tour);
        result.accepted.push(tour);
      } else {
        result.accepted.push(tour);
      }
    });

    return result;
  };

  const categorized = categorizeTours(tours);

  const tabs = [
    {
      value: "accepted",
      label: "Sắp tới",
      count: categorized.accepted.length,
      color: "success",
      icon: <CheckCircle className="w-4 h-4" />,
    },
    {
      value: "inProgress",
      label: "Đang diễn ra",
      count: categorized.inProgress.length,
      color: "info",
      icon: <Clock className="w-4 h-4" />,
    },
    {
      value: "completed",
      label: "Hoàn thành",
      count: categorized.completed.length,
      color: "default",
      icon: <CheckCircle className="w-4 h-4" />,
    },
  ];

  const currentTours = categorized[activeTab] || [];

  return (
    <div className="px-6 py-4 min-h-screen">
      <div className="mb-6 ml-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
          Tour của tôi
        </h1>
        <p className="text-gray-500 text-sm sm:text-base">
          Quản lý tất cả tour của bạn tại một nơi
        </p>
      </div>

      {/* Tabs - nhỏ gọn, dạng pill */}
      <div className="flex flex-wrap gap-2 mb-4 sm:mb-6 items-center">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={[
                "inline-flex items-center gap-1.5 rounded-full",
                "px-3 py-1.5 text-xs sm:text-sm font-medium",
                "border transition-colors",
                isActive
                  ? "bg-[#02A0AA] text-white border-transparent shadow-sm"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50",
              ].join(" ")}
            >
              <span className="hidden sm:inline-flex">{tab.icon}</span>
              <span className="truncate">{tab.label}</span>
              <Badge
                variant={isActive ? "default" : tab.color}
                className={`ml-1 px-2 py-[1px] text-[11px] ${
                  isActive ? "bg-white text-[#02A0AA]" : ""
                }`}
              >
                {tab.count}
              </Badge>
            </button>
          );
        })}
      </div>

      {/* Tours Grid */}
      {loading ? (
        <Card className="text-center py-12 sm:py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-[#02A0AA] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm sm:text-base">
              Đang tải dữ liệu tour...
            </p>
          </div>
        </Card>
      ) : currentTours.length === 0 ? (
        <Card className="text-center py-12 sm:py-16">
          <div className="mb-3 sm:mb-4 flex items-center justify-center text-gray-400">
            {activeTab === "accepted" && (
              <CheckCircle className="w-10 h-10 sm:w-14 sm:h-14 text-emerald-500" />
            )}
            {activeTab === "inProgress" && (
              <Clock className="w-10 h-10 sm:w-14 sm:h-14 text-blue-500" />
            )}
            {activeTab === "completed" && (
              <CheckCircle className="w-10 h-10 sm:w-14 sm:h-14 text-emerald-500" />
            )}
          </div>
          <p className="text-gray-500 text-sm sm:text-base mb-1">
            Không có tour{" "}
            {tabs.find((t) => t.value === activeTab)?.label.toLowerCase()}
          </p>
          <p className="text-xs sm:text-sm text-gray-400">
            {activeTab === "accepted" && "Các tour sắp tới sẽ hiện ở đây"}
            {activeTab === "inProgress" && "Không có tour nào đang diễn ra"}
            {activeTab === "completed" && "Tour đã hoàn thành sẽ hiện ở đây"}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {currentTours.map((tour) => (
            <TourCard
              key={tour._id}
              tour={tour}
              status={activeTab} // 'accepted' | 'inProgress' | 'completed'
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyToursPage;
