import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import TourCard from "../components/home/TourCard";
import { mockTours } from "../data/mockTours";

const MyToursPage = () => {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "ongoing";
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const tabs = [
    {
      value: "ongoing",
      label: "Đang diễn ra",
      count: mockTours.ongoing.length,
      color: "success",
    },
    {
      value: "upcoming",
      label: "Sắp tới",
      count: mockTours.upcoming.length,
      color: "info",
    },
    {
      value: "completed",
      label: "Hoàn thành",
      count: mockTours.completed.length,
      color: "default",
    },
    {
      value: "canceled",
      label: "Đã hủy",
      count: mockTours.canceled.length,
      color: "danger",
    },
  ];

  const currentTours = mockTours[activeTab] || [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tour của tôi</h1>
        <p className="text-gray-500">Quản lý tất cả tour của bạn tại một nơi</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.value
                ? "bg-[#02A0AA] text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {tab.label}
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
      {currentTours.length === 0 ? (
        <Card className="text-center py-16">
          <p className="text-6xl mb-4">
            {activeTab === "ongoing" && "🚀"}
            {activeTab === "upcoming" && "📆"}
            {activeTab === "completed" && "✅"}
            {activeTab === "canceled" && "❌"}
          </p>
          <p className="text-gray-500 mb-2">
            Không có tour{" "}
            {tabs.find((t) => t.value === activeTab)?.label.toLowerCase()}
          </p>
          <p className="text-sm text-gray-400">
            {activeTab === "ongoing" && "Không có tour nào đang diễn ra"}
            {activeTab === "upcoming" &&
              "Chấp nhận yêu cầu mới để lên lịch tour"}
            {activeTab === "completed" && "Tour đã hoàn thành sẽ hiện ở đây"}
            {activeTab === "canceled" && "Tour đã hủy sẽ hiện ở đây"}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyToursPage;
