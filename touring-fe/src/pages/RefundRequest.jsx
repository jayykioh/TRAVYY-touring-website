import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../auth/context";
import ConfirmModal from "../components/ConfirmModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const RefundRequest = ({ isCustomTour = false }) => {
  const { bookingId, tourRequestId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [tourRequest, setTourRequest] = useState(null);
  const [refundType, setRefundType] = useState("pre_trip_cancellation");
  const [refundPreview, setRefundPreview] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Pre-trip form
  const [requestNote, setRequestNote] = useState("");

  // Post-trip form
  const [issueCategory, setIssueCategory] = useState("");
  const [severity, setSeverity] = useState("moderate");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState([]);

  useEffect(() => {
    if (isCustomTour) {
      loadTourRequest();
    } else {
      loadBooking();
    }
  }, [bookingId, tourRequestId, isCustomTour]);

  const loadBooking = async () => {
    try {
      const token = user?.token;
      if (!token) {
        toast.error("Authentication required");
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to load booking");

      const data = await response.json();
      setBooking(data.data || data);

      // Auto-detect refund type based on tour date
      if (data.data?.items?.[0]?.date) {
        const tourDate = new Date(data.data.items[0].date);
        const now = new Date();
        setRefundType(
          tourDate > now ? "pre_trip_cancellation" : "post_trip_issue"
        );
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading booking:", error);
      toast.error("Error loading booking details");
      setLoading(false);
    }
  };

  const loadTourRequest = async () => {
    try {
      const token = user?.token;
      if (!token) {
        toast.error("Authentication required");
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/tour-requests/${tourRequestId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to load tour request");

      const data = await response.json();
      setTourRequest(data);

      // Auto-detect refund type based on tour date
      if (data.departureDate) {
        const tourDate = new Date(data.departureDate);
        const now = new Date();
        setRefundType(
          tourDate > now ? "pre_trip_cancellation" : "post_trip_issue"
        );
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading tour request:", error);
      toast.error("Error loading tour request details");
      setLoading(false);
    }
  };

  // Check if tour has already happened (for enabling post-trip option)
  const isTourCompleted = () => {
    if (isCustomTour) {
      if (!tourRequest?.departureDate) return false;
      const tourDate = new Date(tourRequest.departureDate);
      const now = new Date();
      return tourDate < now;
    } else {
      if (!booking?.items?.[0]?.date) return false;
      const tourDate = new Date(booking.items[0].date);
      const now = new Date();
      return tourDate < now;
    }
  };

  const getTourDate = () => {
    if (isCustomTour) {
      return tourRequest?.departureDate
        ? new Date(tourRequest.departureDate)
        : null;
    } else {
      return booking?.items?.[0]?.date ? new Date(booking.items[0].date) : null;
    }
  };

  const getTotalAmount = () => {
    if (isCustomTour) {
      return tourRequest?.totalPrice || 0;
    } else {
      return booking?.totalAmount || 0;
    }
  };

  const calculateRefundPreview = () => {
    const tourData = isCustomTour ? tourRequest : booking;
    if (!tourData) return;

    const originalAmount = getTotalAmount();
    const tourDate = getTourDate();
    if (!tourDate) return;

    const now = new Date();
    const daysBeforeTour = Math.ceil((tourDate - now) / (1000 * 60 * 60 * 24));

    if (refundType === "pre_trip_cancellation") {
      let percentage = 0;
      let policy = "";

      if (daysBeforeTour >= 30) {
        percentage = 90;
        policy = "30+ days: 90% refund";
      } else if (daysBeforeTour >= 14) {
        percentage = 70;
        policy = "14-29 days: 70% refund";
      } else if (daysBeforeTour >= 7) {
        percentage = 50;
        policy = "7-13 days: 50% refund";
      } else if (daysBeforeTour >= 3) {
        percentage = 25;
        policy = "3-6 days: 25% refund";
      } else if (daysBeforeTour >= 1) {
        percentage = 10;
        policy = "1-2 days: 10% refund";
      } else {
        percentage = 0;
        policy = "Less than 1 day: No refund";
      }

      const refundableAmount = Math.round(originalAmount * (percentage / 100));
      const processingFee = Math.round(refundableAmount * 0.02);
      const finalAmount = refundableAmount - processingFee;

      setRefundPreview({
        originalAmount,
        percentage,
        policy,
        refundableAmount,
        processingFee,
        finalAmount,
        daysBeforeTour,
      });
    } else {
      // Post-trip
      let percentage = 0;
      switch (severity) {
        case "critical":
          percentage = 100;
          break;
        case "major":
          percentage = 70;
          break;
        case "moderate":
          percentage = 40;
          break;
        case "minor":
          percentage = 20;
          break;
        default:
          percentage = 30;
      }

      const refundableAmount = Math.round(originalAmount * (percentage / 100));
      setRefundPreview({
        originalAmount,
        percentage,
        refundableAmount,
        processingFee: 0,
        finalAmount: refundableAmount,
      });
    }
  };

  useEffect(() => {
    if (booking || tourRequest) {
      calculateRefundPreview();
    }
  }, [booking, tourRequest, refundType, severity]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate post-trip refund can only be requested after tour completion
    if (refundType === "post_trip_issue" && !isTourCompleted()) {
      toast.error(
        "Không thể yêu cầu hoàn tiền sau chuyến đi cho tour chưa hoàn thành"
      );
      return;
    }

    if (refundType === "post_trip_issue" && (!issueCategory || !description)) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Show confirmation modal instead of submitting directly
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    console.log("=== Starting refund submission ===");
    console.log("Is Custom Tour:", isCustomTour);
    console.log("Refund Type:", refundType);
    console.log("Booking ID from params:", bookingId);
    console.log("Tour Request ID from params:", tourRequestId);
    console.log("Booking object:", booking);
    console.log("Tour Request object:", tourRequest);

    try {
      const token = user?.token;
      if (!token) {
        console.error("No token found");
        toast.error("Authentication required");
        navigate("/login");
        return;
      }

      console.log("Token exists:", token ? "Yes" : "No");

      let endpoint, payload;

      if (isCustomTour) {
        // Custom tour refund
        endpoint =
          refundType === "pre_trip_cancellation"
            ? `${API_URL}/api/refunds/custom-tour/pre-trip`
            : `${API_URL}/api/refunds/custom-tour/post-trip`;

        const actualTourRequestId = tourRequest?._id || tourRequestId;
        console.log("Actual tour request ID to send:", actualTourRequestId);

        if (!actualTourRequestId) {
          console.error("❌ No tour request ID found!");
          toast.error("Không tìm thấy tour request ID");
          return;
        }

        payload =
          refundType === "pre_trip_cancellation"
            ? { tourRequestId: actualTourRequestId, requestNote }
            : {
                tourRequestId: actualTourRequestId,
                issueCategory,
                description,
                severity,
                evidence,
                requestNote,
              };
      } else {
        // Regular booking refund
        endpoint =
          refundType === "pre_trip_cancellation"
            ? `${API_URL}/api/refunds/pre-trip`
            : `${API_URL}/api/refunds/post-trip`;

        const actualBookingId = booking?._id || booking?.id || bookingId;
        console.log("Actual booking ID to send:", actualBookingId);

        if (!actualBookingId) {
          console.error("❌ No booking ID found!");
          toast.error("Không tìm thấy booking ID");
          return;
        }

        payload =
          refundType === "pre_trip_cancellation"
            ? { bookingId: actualBookingId, requestNote }
            : {
                bookingId: actualBookingId,
                issueCategory,
                description,
                severity,
                evidence,
                requestNote,
              };
      }

      console.log("Endpoint:", endpoint);
      console.log("Payload:", payload);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        // Show specific error message from backend
        const errorMessage =
          data.message || data.error || "Failed to submit refund request";
        console.error("Backend error:", errorMessage);
        throw new Error(errorMessage);
      }

      console.log("Refund submitted successfully!");
      setShowConfirmModal(false);
      toast.success(
        "Refund request submitted successfully! You will be notified via email when your request is reviewed."
      );

      // Navigate to refund list page to see the newly created request
      setTimeout(() => {
        console.log("Navigating to /profile/refunds");
        navigate("/profile/refunds");
      }, 1500);
    } catch (error) {
      console.error("=== Error submitting refund ===");
      console.error("Error details:", error);
      console.error("Error message:", error.message);
      toast.error(error.message || "Error submitting refund request");
      throw error; // Rethrow to let modal handle loading state
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007980]"></div>
      </div>
    );
  }

  if (!booking && !tourRequest) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {isCustomTour ? "Tour request not found" : "Booking not found"}
          </h2>
        </div>
      </div>
    );
  }

  const currentData = isCustomTour ? tourRequest : booking;
  const displayId = isCustomTour
    ? tourRequest?.requestId || tourRequest?._id
    : booking?.payment?.orderId || booking?.orderRef || booking?._id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02A0AA]/5 via-white to-[#02A0AA]/10 py-6">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Compact Header */}
        <div className="mb-4">
          <button
            onClick={() => navigate("/booking-history")}
            className="group flex items-center gap-2 text-[#02A0AA] hover:text-[#028a94] transition-all mb-3"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </button>

          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-[#02A0AA]">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[#02A0AA]">
                  Request Refund
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {isCustomTour ? "Custom Tour:" : "Booking:"}{" "}
                  <span className="font-semibold text-gray-800">
                    {displayId}
                  </span>
                </p>
              </div>
              <div className="bg-[#02A0AA]/10 p-2 rounded-lg">
                <svg
                  className="w-6 h-6 text-[#02A0AA]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Booking Summary */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4 border border-gray-100">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-[#02A0AA]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            {isCustomTour ? "Tour Info" : "Booking Info"}
          </h3>
          <div className="space-y-2">
            {isCustomTour ? (
              <div className="p-3 bg-[#02A0AA]/5 rounded-lg text-sm">
                <p className="font-semibold text-gray-800 mb-1">
                  {tourRequest.tourName}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span>
                    📅{" "}
                    {new Date(tourRequest.departureDate).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </span>
                  <span>👥 {tourRequest.numberOfGuests} guests</span>
                </div>
              </div>
            ) : (
              booking.items?.map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-[#02A0AA]/5 rounded-lg text-sm"
                >
                  <p className="font-semibold text-gray-800 mb-1">
                    {item.name}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>
                      📅{" "}
                      {new Date(item.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span>
                      👥 {item.adults}A · {item.children}C
                    </span>
                  </div>
                </div>
              ))
            )}
            <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">
                Total Paid:
              </span>
              <span className="text-lg font-bold text-[#02A0AA]">
                {getTotalAmount()?.toLocaleString()} VND
              </span>
            </div>
          </div>
        </div>

        {/* Compact Refund Type Selection */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4 border border-gray-100">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-[#02A0AA]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            Refund Type
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            <label
              className={`relative flex items-start p-3 border-2 rounded-lg cursor-pointer transition-all ${
                refundType === "pre_trip_cancellation"
                  ? "border-[#02A0AA] bg-[#02A0AA]/5"
                  : "border-gray-200 hover:border-[#02A0AA]/50"
              }`}
            >
              <input
                type="radio"
                name="refundType"
                value="pre_trip_cancellation"
                checked={refundType === "pre_trip_cancellation"}
                onChange={(e) => setRefundType(e.target.value)}
                className="mt-1 w-4 h-4 text-[#02A0AA] focus:ring-[#02A0AA]"
              />
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-gray-800">
                  ❌ Pre-Trip Cancellation
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Cancel before tour starts
                </p>
              </div>
            </label>

            <label
              className={`relative flex items-start p-3 border-2 rounded-lg transition-all ${
                !isTourCompleted()
                  ? "opacity-50 cursor-not-allowed border-gray-200 bg-gray-50"
                  : refundType === "post_trip_issue"
                  ? "border-[#02A0AA] bg-[#02A0AA]/5 cursor-pointer"
                  : "border-gray-200 hover:border-[#02A0AA]/50 cursor-pointer"
              }`}
            >
              <input
                type="radio"
                name="refundType"
                value="post_trip_issue"
                checked={refundType === "post_trip_issue"}
                onChange={(e) => setRefundType(e.target.value)}
                disabled={!isTourCompleted()}
                className="mt-1 w-4 h-4 text-[#02A0AA] focus:ring-[#02A0AA] disabled:opacity-50"
              />
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-gray-800">
                  ⚠️ Post-Trip Issue
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Report issue after tour
                </p>
                {!isTourCompleted() && (
                  <p className="text-xs text-yellow-700 mt-1 bg-yellow-50 px-2 py-1 rounded">
                    Chỉ khi tour hoàn thành
                  </p>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Compact Refund Preview */}
        {refundPreview && (
          <div className="bg-gradient-to-r from-[#02A0AA]/10 to-[#02A0AA]/5 rounded-xl shadow-md p-4 mb-4 border-l-4 border-[#02A0AA]">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-[#02A0AA]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Refund Preview
            </h3>

            {refundType === "pre_trip_cancellation" && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-white rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-600">Days Before</p>
                  <p className="text-lg font-bold text-[#02A0AA]">
                    {refundPreview.daysBeforeTour}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-600">Policy</p>
                  <p className="text-xs font-semibold text-gray-800">
                    {refundPreview.policy}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between bg-white rounded-lg p-2">
                <span className="text-gray-600">Original</span>
                <span className="font-semibold">
                  {refundPreview.originalAmount?.toLocaleString()} VND
                </span>
              </div>
              <div className="flex justify-between bg-[#02A0AA]/20 rounded-lg p-2 border border-[#02A0AA]/30">
                <span className="text-gray-700 font-medium">Refund %</span>
                <span className="font-bold text-[#02A0AA] text-lg">
                  {refundPreview.percentage}%
                </span>
              </div>
              {refundPreview.processingFee > 0 && (
                <div className="flex justify-between bg-red-50 rounded-lg p-2 border border-red-200">
                  <span className="text-gray-600">Fee (2%)</span>
                  <span className="font-semibold text-red-600">
                    -{refundPreview.processingFee?.toLocaleString()} VND
                  </span>
                </div>
              )}
              <div className="flex justify-between bg-[#02A0AA] text-white rounded-lg p-3 mt-2">
                <span className="font-bold">Final Refund</span>
                <span className="font-bold text-lg">
                  {refundPreview.finalAmount?.toLocaleString()} VND
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Compact Refund Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-md p-4 border border-gray-100"
        >
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-[#02A0AA]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Request Details
          </h3>

          {refundType === "post_trip_issue" && (
            <div className="space-y-3 mb-4">
              {/* Issue Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Issue Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={issueCategory}
                  onChange={(e) => setIssueCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#02A0AA] focus:ring-1 focus:ring-[#02A0AA]"
                  required
                >
                  <option value="">Select...</option>
                  <option value="service_quality">🌟 Service Quality</option>
                  <option value="safety_concern">⚠️ Safety Concern</option>
                  <option value="itinerary_deviation">
                    📍 Itinerary Deviation
                  </option>
                  <option value="guide_issue">👤 Guide Issue</option>
                  <option value="accommodation_problem">
                    🏨 Accommodation Problem
                  </option>
                  <option value="transportation_issue">
                    🚌 Transportation Issue
                  </option>
                  <option value="other">📝 Other</option>
                </select>
              </div>

              {/* Severity */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Severity <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    {
                      value: "minor",
                      label: "Minor",
                      percent: "20%",
                      icon: "ℹ️",
                    },
                    {
                      value: "moderate",
                      label: "Moderate",
                      percent: "40%",
                      icon: "⚡",
                    },
                    {
                      value: "major",
                      label: "Major",
                      percent: "70%",
                      icon: "⚠️",
                    },
                    {
                      value: "critical",
                      label: "Critical",
                      percent: "100%",
                      icon: "🚨",
                    },
                  ].map((item) => (
                    <label
                      key={item.value}
                      className={`flex flex-col items-center p-2 border-2 rounded-lg cursor-pointer transition-all ${
                        severity === item.value
                          ? "border-[#02A0AA] bg-[#02A0AA]/10"
                          : "border-gray-200 hover:border-[#02A0AA]/50"
                      }`}
                    >
                      <input
                        type="radio"
                        value={item.value}
                        checked={severity === item.value}
                        onChange={(e) => setSeverity(e.target.value)}
                        className="sr-only"
                      />
                      <span className="text-lg mb-1">{item.icon}</span>
                      <span className="text-xs font-semibold text-gray-800">
                        {item.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {item.percent}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Issue Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#02A0AA] focus:ring-1 focus:ring-[#02A0AA] resize-none"
                  rows={3}
                  placeholder="Describe the issue..."
                  required
                />
              </div>
            </div>
          )}

          {/* Request Note */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Additional Notes{" "}
              <span className="text-gray-400 text-xs font-normal">
                (Optional)
              </span>
            </label>
            <textarea
              value={requestNote}
              onChange={(e) => setRequestNote(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#02A0AA] focus:ring-1 focus:ring-[#02A0AA] resize-none"
              rows={2}
              placeholder="Any additional information..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/booking-history")}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm text-gray-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-[#02A0AA] text-white rounded-lg hover:bg-[#028a94] font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={refundPreview?.finalAmount <= 0}
            >
              Submit Request
            </button>
          </div>
        </form>

        {/* Confirmation Modal */}
        <ConfirmModal
          isOpen={showConfirmModal}
          title="Xác nhận gửi yêu cầu hoàn tiền"
          message={`Bạn có chắc chắn muốn gửi yêu cầu hoàn tiền cho ${
            isCustomTour ? "tour request" : "booking"
          } ${displayId}? Sau khi gửi, yêu cầu sẽ được chuyển đến bộ phận xem xét.`}
          confirmText="Gửi Yêu Cầu"
          cancelText="Hủy"
          confirmStyle="primary"
          onConfirm={handleConfirmSubmit}
          onCancel={() => setShowConfirmModal(false)}
        />
      </div>
    </div>
  );
};

export default RefundRequest;
