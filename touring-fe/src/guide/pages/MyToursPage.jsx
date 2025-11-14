import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import TourCard from "../components/home/TourCard";
import { useAuth } from "../../auth/context";
import { useSocket } from "../../context/SocketContext";
import { toast } from "sonner";

const MyToursPage = () => {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "accepted";
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const { user, withAuth } = useAuth();
  const { socket, on, joinRoom } = useSocket();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const fetchTours = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch tours that this guide has accepted
      const data = await withAuth("/api/itinerary/guide/accepted-tours");
      
      if (data.success && Array.isArray(data.tours)) {
        setTours(data.tours);
      } else {
        setTours([]);
      }
    } catch (error) {
      console.error('Error fetching tours:', error);
      toast.error('Không thể tải danh sách tour');
      setTours([]);
    } finally {
      setLoading(false);
    }
  }, [user, withAuth]);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  // Join socket room for real-time updates
  useEffect(() => {
    if (!socket || !user?._id) return;
    
    // Join user-specific room to receive payment and tour completion notifications
    joinRoom(`user-${user._id}`);
    
    // Listen for payment success
    const unsubscribePayment = on('paymentSuccessful', (data) => {
      console.log('🔔 Payment successful:', data);
      toast.success(`Khách hàng đã thanh toán cho ${data.tourTitle || 'tour'}`);
      // Optionally refetch tours to update status
      fetchTours();
    });
    
    // Listen for tour marked as done
    const unsubscribeTourDone = on('tourMarkedDone', (data) => {
      console.log('🔔 Tour marked done:', data);
      toast.success(`Tour "${data.tourTitle || 'Không xác định'}" đã hoàn thành!`);
      fetchTours();
    });
    
    // Listen for tour completion notification
    const unsubscribeTourCompleted = on('tourCompleted', (data) => {
      console.log('🔔 Tour completed:', data);
      toast.info(`Tour "${data.tourTitle || 'Không xác định'}" được đánh dấu hoàn thành`);
      fetchTours();
    });
    
    return () => {
      unsubscribePayment?.();
      unsubscribeTourDone?.();
      unsubscribeTourCompleted?.();
    };
  }, [socket, user?._id, joinRoom, fetchTours, on]);

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
      const preferredDate = tour.preferredDate ? new Date(tour.preferredDate) : null;
      
      // Check if tour has been completed
      if (tour.tourGuideRequest?.status === 'completed') {
        result.completed.push(tour);
      }
      // Check if tour is in progress (today)
      else if (preferredDate && preferredDate.toDateString() === now.toDateString()) {
        result.inProgress.push(tour);
      }
      // Check if tour is upcoming (future date)
      else if (preferredDate && preferredDate > now) {
        result.upcoming.push(tour);
      }
      // All accepted tours
      else {
        result.accepted.push(tour);
      }
    });
    
    return result;
  };

  const categorized = categorizeTours(tours);
  
  const tabs = [
    {
      value: "accepted",
      label: "Đã chấp nhận",
      count: categorized.accepted.length,
      color: "success",
      icon: "✅",
    },
    {
      value: "inProgress",
      label: "Đang diễn ra",
      count: categorized.inProgress.length,
      color: "info",
      icon: "🚀",
    },
    {
      value: "upcoming",
      label: "Sắp tới",
      count: categorized.upcoming.length,
      color: "warning",
      icon: "📆",
    },
    {
      value: "completed",
      label: "Hoàn thành",
      count: categorized.completed.length,
      color: "default",
      icon: "🎉",
    },
  ];

  const currentTours = categorized[activeTab] || [];

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
      {loading ? (
        <Card className="text-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-[#02A0AA] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500">Đang tải dữ liệu tour...</p>
          </div>
        </Card>
      ) : currentTours.length === 0 ? (
        <Card className="text-center py-16">
          <p className="text-6xl mb-4">
            {tabs.find((t) => t.value === activeTab)?.icon || "📦"}
          </p>
          <p className="text-gray-500 mb-2">
            Không có tour {tabs.find((t) => t.value === activeTab)?.label.toLowerCase()}
          </p>
          <p className="text-sm text-gray-400">
            {activeTab === "accepted" && "Các tour đã chấp nhận sẽ hiện ở đây"}
            {activeTab === "inProgress" && "Không có tour nào đang diễn ra"}
            {activeTab === "upcoming" && "Chấp nhận yêu cầu mới để lên lịch tour"}
            {activeTab === "completed" && "Tour đã hoàn thành sẽ hiện ở đây"}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentTours.map((tour) => (
            <Card key={tour._id} hover className="p-4">
              <div className="mb-3">
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                  {tour.name || tour.zoneName || 'Tour'}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  📍 {tour.zoneName || tour.province || 'Chưa có thông tin'}
                </p>
                {tour.preferredDate && (
                  <p className="text-sm text-gray-600">
                    📅 {new Date(tour.preferredDate).toLocaleDateString('vi-VN')}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-4 mb-3 text-sm">
                {tour.numberOfPeople && (
                  <div className="flex items-center gap-1">
                    <span>👥</span>
                    <span>{tour.numberOfPeople} người</span>
                  </div>
                )}
                {tour.totalDuration && (
                  <div className="flex items-center gap-1">
                    <span>⏱️</span>
                    <span>{Math.floor(tour.totalDuration / 60)}h{tour.totalDuration % 60}m</span>
                  </div>
                )}
              </div>

              {tour.estimatedCost && (
                <div className="bg-emerald-50 rounded-lg p-2 mb-3">
                  <p className="text-sm text-gray-600">Giá tour</p>
                  <p className="font-bold text-[#02A0AA]">
                    {tour.estimatedCost.toLocaleString('vi-VN')} VND
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <Badge variant={tabs.find(t => t.value === activeTab)?.color || "default"}>
                  {tabs.find(t => t.value === activeTab)?.label}
                </Badge>
                <button 
                  onClick={() => window.location.href = `/guide/tours/${tour._id}`}
                  className="text-[#02A0AA] hover:text-[#018f95] text-sm font-medium"
                >
                  Chi tiết →
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyToursPage;
