import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import TourCard from "../components/home/TourCard";

import { useAuth } from "../../auth/context";

const MyToursPage = () => {
  const [searchParams] = useSearchParams();

  const tabFromUrl = searchParams.get("tab") || "ongoing";
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const { user, withAuth } = useAuth();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  useEffect(() => {
    async function fetchTours() {
      setLoading(true);
      try {
        const data = await withAuth("/api/tours");
        // Filter tours by current user's agencyId
        const myTours = Array.isArray(data)
          ? data.filter(
              (tour) =>
                tour.agencyId &&
                (tour.agencyId._id === user?.agencyId ||
                  tour.agencyId === user?.agencyId)
            )
          : [];
        setTours(myTours);
      } catch {
        setTours([]);
      } finally {
        setLoading(false);
      }
    }
    if (user?.agencyId) fetchTours();
  }, [user?.agencyId, withAuth]);

  // Categorize tours by status/dates
  const categorizeTours = (tours) => {
    const now = new Date();
    const result = {
      ongoing: [],
      upcoming: [],
      completed: [],
      canceled: [],
    };
    tours.forEach((tour) => {
      // You may need to adjust this logic based on your real tour data structure
      // Example: check tour.status or compare tour.departures dates
      if (tour.isHidden || tour.status === "canceled") {
        result.canceled.push(tour);
      } else if (tour.status === "completed") {
        result.completed.push(tour);
      } else if (tour.departures && tour.departures.length > 0) {
        // Find the next departure
        const nextDeparture = tour.departures.find((d) => {
          if (!d.date) return false;
          const depDate = new Date(d.date);
          return depDate >= now;
        });
        if (nextDeparture) {
          result.upcoming.push(tour);
        } else {
          // If all departures are in the past, mark as completed
          result.completed.push(tour);
        }
      } else {
        // If no departures, treat as ongoing
        result.ongoing.push(tour);
      }
    });
    return result;
  };

  const categorized = categorizeTours(tours);
  const tabs = [
    {
      value: "ongoing",
      label: "Đang diễn ra",
      count: categorized.ongoing.length,
      color: "success",
    },
    {
      value: "upcoming",
      label: "Sắp tới",
      count: categorized.upcoming.length,
      color: "info",
    },
    {
      value: "completed",
      label: "Hoàn thành",
      count: categorized.completed.length,
      color: "default",
    },
    {
      value: "canceled",
      label: "Đã hủy",
      count: categorized.canceled.length,
      color: "danger",
    },
  ];

  const currentTours = categorized[activeTab] || [];

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6 text-center sm:text-left">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
          Tour của tôi
        </h1>
        <p className="text-gray-500 text-sm sm:text-base">
          Quản lý tất cả tour của bạn tại một nơi
        </p>
      </div>

      {/* Tabs — không có cuộn ngang, tự co giãn trong 1 hàng */}
      <div className="flex flex-wrap justify-between gap-2 mb-4 sm:mb-6 w-full">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-1 min-w-[70px] px-2 sm:px-4 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base transition-all flex items-center justify-center gap-2 truncate ${
              activeTab === tab.value
                ? "bg-[#02A0AA] text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            <span className="truncate">{tab.label}</span>
            <Badge
              variant={activeTab === tab.value ? "default" : tab.color}
              className={
                activeTab === tab.value ? "bg-white text-[#02A0AA]" : ""
              }
            >
              {tab.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Tours Grid */}
      {loading ? (
        <Card className="text-center py-12 sm:py-16 text-gray-500 text-sm sm:text-base">
          Đang tải dữ liệu tour...
        </Card>
      ) : currentTours.length === 0 ? (
        <Card className="text-center py-12 sm:py-16">
          <div className="mb-3 sm:mb-4 flex items-center justify-center">
            {activeTab === "ongoing" && (
              <Clock className="w-10 h-10 sm:w-14 sm:h-14 text-emerald-500" />
            )}
            {activeTab === "upcoming" && (
              <Calendar className="w-10 h-10 sm:w-14 sm:h-14 text-blue-500" />
            )}
            {activeTab === "completed" && (
              <CheckCircle className="w-10 h-10 sm:w-14 sm:h-14 text-emerald-500" />
            )}
            {activeTab === "canceled" && (
              <XCircle className="w-10 h-10 sm:w-14 sm:h-14 text-red-500" />
            )}
          </div>
          <p className="text-gray-500 text-sm sm:text-base mb-1">
            Không có tour{" "}
            {tabs.find((t) => t.value === activeTab)?.label.toLowerCase()}
          </p>
          <p className="text-xs sm:text-sm text-gray-400">
            {activeTab === "ongoing" && "Không có tour nào đang diễn ra"}
            {activeTab === "upcoming" &&
              "Chấp nhận yêu cầu mới để lên lịch tour"}
            {activeTab === "completed" && "Tour đã hoàn thành sẽ hiện ở đây"}
            {activeTab === "canceled" && "Tour đã hủy sẽ hiện ở đây"}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {currentTours.map((tour) => (
            <TourCard key={tour._id || tour.id} tour={tour} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyToursPage;
