import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import Modal from "../components/common/Modal";
import {
  MapPin,
  Clock,
  Users,
  Calendar,
  Phone,
  Mail,
  MessageCircle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Navigation,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  DollarSign,
  FileText,
  Download,
} from "lucide-react";
import { useAuth } from "../../auth/context";

const GuideTourDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");

  const { withAuth } = useAuth();
  useEffect(() => {
    async function fetchTour() {
      setLoading(true);
      try {
        // Try to fetch tour by ID
        const data = await withAuth(`/api/tours/${id}`);
        if (data && data._id) {
          setTour(data);
        } else {
          // If not found, try to fetch requests and match by ID
          const reqData = await withAuth("/api/itinerary/guide/requests");
          if (reqData.success && Array.isArray(reqData.requests)) {
            const foundRequest = reqData.requests.find(
              (r) => r._id === id || r.id === id
            );
            setTour(foundRequest || null);
          } else {
            setTour(null);
          }
        }
      } catch {
        setTour(null);
      } finally {
        setLoading(false);
      }
    }
    fetchTour();
  }, [id, withAuth]);

  const handleAcceptRequest = () => {
    console.log("Accepting tour request:", id);
    navigate("/guide/tours");
  };

  const handleDeclineRequest = () => {
    console.log("Declining tour request:", id);
    navigate("/guide/requests");
  };

  const handleCompleteTour = () => {
    console.log("Completing tour:", id, completionNotes);
    setShowCompleteModal(false);
    navigate("/guide/tours");
  };

  const handleCancelTour = () => {
    console.log("Canceling tour:", id, cancelReason);
    setShowCancelModal(false);
    navigate("/guide/tours");
  };

  const handleContactCustomer = () => {
    console.log("Opening chat with customer");
  };

  const handleNavigateToLocation = () => {
    if (tour?.pickupPoint || tour?.location) {
      const location = tour.pickupPoint || tour.location;
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          location
        )}`,
        "_blank"
      );
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="p-6">
        <Card className="text-center py-12">
          <p className="text-6xl mb-4">🔍</p>
          <p className="text-gray-500 mb-4">Không tìm thấy tour</p>
          <Button onClick={() => navigate("/guide/tours")}>
            Quay lại Tour của tôi
          </Button>
        </Card>
      </div>
    );
  }

  const isRequest = !tour.status;
  const isOngoing = tour.status === "ongoing";
  const isUpcoming = tour.status === "accepted";
  const isCompleted = tour.status === "completed";
  const isCanceled = tour.status === "canceled";

  const statusColors = {
    ongoing: "success",
    accepted: "info",
    completed: "default",
    canceled: "danger",
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Quay lại</span>
        </button>

        {tour.status && (
          <Badge
            variant={statusColors[tour.status]}
            className="text-sm px-4 py-2 flex items-center gap-2"
          >
            <span className="font-medium">
              {tour.status === "ongoing" && "Đang diễn ra"}
              {tour.status === "accepted" && "Sắp diễn ra"}
              {tour.status === "completed" && "Đã hoàn thành"}
              {tour.status === "canceled" && "Đã hủy"}
            </span>
          </Badge>
        )}
        {isRequest && (
          <Badge variant="warning" className="text-sm px-4 py-2">
            ⏳ Yêu cầu mới
          </Badge>
        )}
      </div>

      {/* Tour Title & Basic Info */}
      <Card className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {tour.tourName}
            </h1>
            <p className="text-gray-500 text-sm">Mã tour: {tour.id}</p>
          </div>
          {tour.earnings && (
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Thu nhập dự kiến</p>
              <p className="text-2xl font-bold text-emerald-600">
                {tour.earnings.toLocaleString("vi-VN")} ₫
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 pt-4"></div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Ngày khởi hành</p>
              <p className="font-semibold text-gray-900">
                {new Date(tour.departureDate).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Thời gian</p>
              <p className="font-semibold text-gray-900">
                {tour.startTime} - {tour.endTime}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Số khách</p>
              <p className="font-semibold text-gray-900">
                {tour.numberOfGuests} người
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Thời lượng</p>
              <p className="font-semibold text-gray-900">{tour.duration}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tour Images Gallery */}
      {tour.imageItems && tour.imageItems.length > 0 && (
        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Hình ảnh Tour
          </h2>
          <div className="grid grid-cols-4 gap-2">
            <div className="col-span-4 md:col-span-2 relative cursor-pointer">
              <img
                src={tour.imageItems[0]?.imageUrl}
                alt="Tour chính"
                className="w-full h-64 md:h-80 object-cover rounded-xl hover:opacity-95 transition-opacity"
                onClick={() => setShowGallery(true)}
              />
            </div>

            <div className="col-span-2 md:col-span-1 grid grid-rows-2 gap-2">
              <img
                src={
                  tour.imageItems[1]?.imageUrl || tour.imageItems[0]?.imageUrl
                }
                alt="Thư viện 1"
                className="w-full h-32 md:h-39 object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => setShowGallery(true)}
              />
              <img
                src={
                  tour.imageItems[2]?.imageUrl || tour.imageItems[0]?.imageUrl
                }
                alt="Thư viện 2"
                className="w-full h-32 md:h-39 object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => setShowGallery(true)}
              />
            </div>

            <div className="col-span-2 md:col-span-1 grid grid-rows-2 gap-2">
              <img
                src={
                  tour.imageItems[3]?.imageUrl || tour.imageItems[0]?.imageUrl
                }
                alt="Thư viện 3"
                className="w-full h-32 md:h-39 object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => setShowGallery(true)}
              />
              <div className="relative">
                <img
                  src={
                    tour.imageItems[4]?.imageUrl || tour.imageItems[0]?.imageUrl
                  }
                  alt="Thư viện 4"
                  className="w-full h-32 md:h-39 object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <button
                    onClick={() => setShowGallery(true)}
                    className="text-white font-medium text-sm px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    Xem tất cả ({tour.imageItems.length})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Thông tin khách hàng
              </h2>
              <Badge variant="info" className="text-xs">
                ID: {tour.customerId}
              </Badge>
            </div>

            <div className="border-t border-gray-100 pt-4"></div>

            <div className="flex items-center gap-4 mb-6 mt-4">
              <img
                src={tour.customerAvatar}
                alt={tour.customerName}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-100"
              />
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-lg">
                  {tour.customerName}
                </p>
                <p className="text-sm text-gray-500">Khách hàng</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tour.contactPhone && (
                <Button
                  variant="outline"
                  onClick={() => window.open(`tel:${tour.contactPhone}`)}
                  className="justify-start"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {tour.contactPhone}
                </Button>
              )}
              {tour.customerEmail && (
                <Button
                  variant="outline"
                  onClick={() => window.open(`mailto:${tour.customerEmail}`)}
                  className="justify-start"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email khách hàng
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleContactCustomer}
                className="justify-start md:col-span-2"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Gửi tin nhắn
              </Button>
            </div>
          </Card>

          {/* Meeting Point */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Điểm đón khách
            </h2>

            <div className="border-t border-gray-100 pt-4"></div>

            <div className="mt-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Địa điểm tour</p>
                  <p className="text-gray-900 font-medium">{tour.location}</p>
                </div>
              </div>

              {tour.pickupPoint && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Navigation className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Điểm đón</p>
                    <p className="text-gray-900 font-medium mb-2">
                      {tour.pickupPoint}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleNavigateToLocation}
                    >
                      <Navigation className="w-4 h-4 mr-1" />
                      Chỉ đường
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Thời gian đón</p>
                  <p className="text-gray-900 font-medium">{tour.startTime}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Special Requests */}
          {tour.specialRequests && (
            <Card>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Yêu cầu đặc biệt từ khách hàng
                  </h3>
                  <div className="border-t border-gray-100 pt-3 mt-3"></div>
                  <p className="text-gray-700 mt-3">{tour.specialRequests}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Tour Itinerary */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Lịch trình Tour
            </h2>

            <div className="border-t border-gray-100 pt-4"></div>

            <div className="mt-4 space-y-6">
              {tour.itinerary &&
                tour.itinerary.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                      <span className="text-emerald-600 font-bold">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900">
                          {item.title}
                        </p>
                        <span className="text-sm text-emerald-600 font-medium">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          {/* Included Services */}
          {tour.includedServices && (
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Dịch vụ bao gồm
              </h2>

              <div className="border-t border-gray-100 pt-4"></div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    Bao gồm
                  </p>
                  <ul className="space-y-2">
                    {tour.includedServices.map((service, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-700 flex items-start gap-2"
                      >
                        <span className="text-emerald-500 mt-0.5">✓</span>
                        {service}
                      </li>
                    ))}
                  </ul>
                </div>

                {tour.excludedServices && (
                  <div>
                    <p className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-500" />
                      Không bao gồm
                    </p>
                    <ul className="space-y-2">
                      {tour.excludedServices.map((service, index) => (
                        <li
                          key={index}
                          className="text-sm text-gray-700 flex items-start gap-2"
                        >
                          <span className="text-red-500 mt-0.5">✗</span>
                          {service}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Tour Progress removed by product decision: platform acts as information bridge only */}

          {/* Completed Tour Info */}
          {isCompleted && (
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
                Tour đã hoàn thành
              </h2>

              <div className="border-t border-gray-100 pt-4"></div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Hoàn thành lúc</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(tour.completedAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Thu nhập của bạn</p>
                  <p className="font-bold text-emerald-600 text-xl">
                    {tour.earnings?.toLocaleString("vi-VN")} ₫
                  </p>
                </div>
                {tour.rating && (
                  <>
                    <div className="col-span-2 border-t border-gray-100 pt-4"></div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500 mb-2">
                        Đánh giá của khách hàng
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-2xl ${
                                i < tour.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-gray-600">({tour.rating}/5)</span>
                      </div>
                    </div>
                  </>
                )}
                {tour.review && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 mb-2">
                      Nhận xét từ khách hàng
                    </p>
                    <p className="text-gray-700 italic">"{tour.review}"</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Canceled Tour Info */}
          {isCanceled && (
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <XCircle className="w-6 h-6 text-red-500" />
                Tour đã hủy
              </h2>

              <div className="border-t border-gray-100 pt-4"></div>

              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Hủy lúc</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(tour.canceledAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Người hủy</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {tour.canceledBy === "customer"
                      ? "Khách hàng"
                      : "Hướng dẫn viên"}
                  </p>
                </div>
                {tour.cancelReason && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Lý do</p>
                    <p className="text-gray-700">{tour.cancelReason}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Payment Information */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Thông tin thanh toán
            </h2>

            <div className="border-t border-gray-100 pt-4"></div>

            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Tổng giá trị</span>
                <span className="text-xl font-bold text-gray-900">
                  {tour.totalPrice.toLocaleString("vi-VN")} ₫
                </span>
              </div>

              {tour.earnings && (
                <>
                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Phí nền tảng (20%)</span>
                      <span className="text-gray-700 font-medium">
                        -
                        {(tour.totalPrice - tour.earnings).toLocaleString(
                          "vi-VN"
                        )}{" "}
                        ₫
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">
                        Thu nhập của bạn
                      </span>
                      <span className="text-2xl font-bold text-emerald-600">
                        {tour.earnings.toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                  </div>
                </>
              )}

              {tour.paymentStatus && (
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Trạng thái</span>
                    <Badge
                      variant={
                        tour.paymentStatus === "paid" ? "success" : "warning"
                      }
                    >
                      {tour.paymentStatus === "paid"
                        ? "Đã thanh toán"
                        : "Chưa thanh toán"}
                    </Badge>
                  </div>
                </div>
              )}

              {tour.paymentMethod && (
                <div className="text-sm">
                  <span className="text-gray-600">Phương thức: </span>
                  <span className="text-gray-900 font-medium">
                    {tour.paymentMethod}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Action Buttons */}
          <Card>
            <div className="space-y-3">
              {isRequest && (
                <>
                  <Button
                    variant="success"
                    fullWidth
                    onClick={handleAcceptRequest}
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Chấp nhận yêu cầu
                  </Button>
                  <Button
                    variant="danger"
                    fullWidth
                    onClick={handleDeclineRequest}
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Từ chối yêu cầu
                  </Button>
                </>
              )}

              {isUpcoming && (
                <>
                  <Button
                    variant="success"
                    fullWidth
                    onClick={() => navigate("/guide/tours")}
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Bắt đầu Tour
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={handleNavigateToLocation}
                  >
                    <Navigation className="w-5 h-5 mr-2" />
                    Chỉ đường
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setShowCancelModal(true)}
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Hủy Tour
                  </Button>
                </>
              )}

              {isOngoing && (
                <>
                  <Button
                    variant="success"
                    fullWidth
                    onClick={() => setShowCompleteModal(true)}
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Hoàn thành Tour
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={handleNavigateToLocation}
                  >
                    <Navigation className="w-5 h-5 mr-2" />
                    Chỉ đường
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={handleContactCustomer}
                  >
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Báo cáo vấn đề
                  </Button>
                </>
              )}

              {isCompleted && (
                <>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => navigate("/guide/reviews")}
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    Xem đánh giá
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => console.log("Export invoice")}
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Xuất hóa đơn
                  </Button>
                </>
              )}

              {(isCompleted || isCanceled) && (
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => navigate("/guide/tours")}
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Quay lại danh sách
                </Button>
              )}
            </div>
          </Card>

          {/* Important Notes */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-500" />
              Lưu ý quan trọng
            </h3>

            <div className="border-t border-gray-100 pt-3"></div>

            <ul className="text-sm text-gray-700 space-y-2 mt-3">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Đến sớm 15 phút trước giờ bắt đầu</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Mang theo thiết bị và vật dụng cần thiết</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Kiểm tra điều kiện thời tiết trước khi khởi hành</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Luôn thông báo cho khách hàng trong suốt tour</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Tuân thủ hướng dẫn an toàn mọi lúc</span>
              </li>
            </ul>
          </Card>

          {/* Quick Actions */}
          {(isUpcoming || isOngoing) && (
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">
                Hành động nhanh
              </h3>

              <div className="border-t border-gray-100 pt-3"></div>

              <div className="space-y-2 mt-3">
                {tour.contactPhone && (
                  <button
                    onClick={() => window.open(`tel:${tour.contactPhone}`)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Gọi khách hàng
                      </p>
                      <p className="text-xs text-gray-500">
                        {tour.contactPhone}
                      </p>
                    </div>
                  </button>
                )}

                <button
                  onClick={handleContactCustomer}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Nhắn tin cho khách
                    </p>
                    <p className="text-xs text-gray-500">Mở chat</p>
                  </div>
                </button>

                <button
                  onClick={handleNavigateToLocation}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Navigation className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Chỉ đường đến điểm đón
                    </p>
                    <p className="text-xs text-gray-500">Mở Google Maps</p>
                  </div>
                </button>

                <button
                  onClick={() => console.log("Download itinerary")}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                    <Download className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Tải lịch trình PDF
                    </p>
                    <p className="text-xs text-gray-500">Lưu vào thiết bị</p>
                  </div>
                </button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Complete Tour Modal */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Hoàn thành Tour"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Bạn có chắc chắn muốn đánh dấu tour này là đã hoàn thành? Hành động
            này không thể hoàn tác.
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú hoàn thành (Tùy chọn)
            </label>
            <textarea
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="Thêm ghi chú về tour..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              rows={4}
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowCompleteModal(false)}
            >
              Hủy
            </Button>
            <Button variant="success" fullWidth onClick={handleCompleteTour}>
              Xác nhận hoàn thành
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Tour Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Hủy Tour"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Vui lòng cung cấp lý do hủy tour này. Khách hàng sẽ được thông báo.
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do hủy *
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Nhập lý do hủy..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows={4}
              required
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowCancelModal(false)}
            >
              Quay lại
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={handleCancelTour}
              disabled={!cancelReason.trim()}
            >
              Xác nhận hủy
            </Button>
          </div>
        </div>
      </Modal>

      {/* Image Gallery Modal */}
      {showGallery && (
        <ImageGalleryModal
          images={tour.imageItems}
          onClose={() => setShowGallery(false)}
        />
      )}
    </div>
  );
};

/* ========== Image Gallery Modal Component ========== */
function ImageGalleryModal({ images, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasImages = Array.isArray(images) && images.length > 0;

  const prevImage = useCallback(() => {
    if (!hasImages) return;
    setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }, [hasImages, images]);

  const nextImage = useCallback(() => {
    if (!hasImages) return;
    setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }, [hasImages, images]);

  const goToImage = useCallback(
    (i) => {
      if (!hasImages) return;
      setCurrentIndex(i);
    },
    [hasImages]
  );

  const handleKey = useCallback(
    (e) => {
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "Escape") onClose();
    },
    [prevImage, nextImage, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  if (!hasImages) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm">
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white shadow-lg transition"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="flex-1 flex items-center justify-center w-full max-w-6xl px-4">
        <button
          onClick={prevImage}
          className="absolute left-4 md:left-10 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors z-10"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <img
          src={images[currentIndex]?.imageUrl || images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          className="max-h-[80vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
        />

        <button
          onClick={nextImage}
          className="absolute right-4 md:right-10 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors z-10"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <span className="absolute bottom-6 right-6 text-white text-sm bg-black/50 px-3 py-1 rounded-lg">
          {currentIndex + 1} / {images.length}
        </span>
      </div>

      <div className="flex gap-2 mt-4 mb-6 overflow-x-auto px-4 max-w-6xl">
        {images.map((img, i) => (
          <img
            key={i}
            src={img?.imageUrl || img}
            onClick={() => goToImage(i)}
            alt={`Thumbnail ${i + 1}`}
            className={`h-20 w-28 object-cover rounded-lg cursor-pointer transition-all ${
              i === currentIndex
                ? "ring-2 ring-emerald-500 scale-105"
                : "opacity-70 hover:opacity-100"
            }`}
          />
        ))}
      </div>
    </div>,
    document.body
  );
}

export default GuideTourDetailPage;
