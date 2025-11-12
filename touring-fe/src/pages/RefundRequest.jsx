import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../auth/context";
import ConfirmModal from "../components/ConfirmModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const RefundRequest = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
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
    loadBooking();
  }, [bookingId]);

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

  // Check if tour has already happened (for enabling post-trip option)
  const isTourCompleted = () => {
    if (!booking?.items?.[0]?.date) return false;
    const tourDate = new Date(booking.items[0].date);
    const now = new Date();
    return tourDate < now;
  };

  const calculateRefundPreview = () => {
    if (!booking) return;

    const originalAmount = booking.totalAmount;
    const tourDate = new Date(booking.items[0].date);
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
    if (booking) {
      calculateRefundPreview();
    }
  }, [booking, refundType, severity]);

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
    console.log("Refund Type:", refundType);
    console.log("Booking ID from params:", bookingId);
    console.log("Booking object:", booking);
    console.log("Booking._id:", booking?._id);

    try {
      const token = user?.token;
      if (!token) {
        console.error("No token found");
        toast.error("Authentication required");
        navigate("/login");
        return;
      }

      console.log("Token exists:", token ? "Yes" : "No");

      const endpoint =
        refundType === "pre_trip_cancellation"
          ? `${API_URL}/api/refunds/pre-trip`
          : `${API_URL}/api/refunds/post-trip`;

      // Use booking._id if available, otherwise use bookingId from params
      const actualBookingId = booking?._id || bookingId;
      console.log("Actual booking ID to send:", actualBookingId);

      const payload =
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

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Booking not found
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Button with Animation */}
        <div className="mb-6 animate-fadeIn">
          <button
            onClick={() => navigate("/booking-history")}
            className="group flex items-center gap-2 text-[#007980] hover:text-[#005f65] transition-all duration-300 hover:gap-3"
          >
            <svg
              className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300"
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
            <span className="font-medium">Back to Booking History</span>
          </button>
        </div>

        {/* Header Card with Animation */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 animate-slideDown border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-gradient-to-r from-[#007980] to-[#005f65] p-3 rounded-xl">
              <svg
                className="w-8 h-8 text-white"
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
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#007980] to-[#005f65] bg-clip-text text-transparent">
                Request Refund
              </h1>
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <span className="text-sm font-medium">Booking Reference:</span>
                <span className="font-semibold text-[#007980]">
                  {booking.orderRef}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 animate-slideUp border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
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
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Booking Summary
            </h2>
          </div>
          <div className="space-y-4">
            {booking.items?.map((item, index) => (
              <div
                key={index}
                className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:border-[#007980] transition-colors duration-300"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-bold text-lg text-gray-800 mb-2">
                      {item.name}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-gray-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm text-gray-600">
                          {new Date(item.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-gray-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        <span className="text-sm text-gray-600">
                          {item.adults} Adults · {item.children} Children
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="border-t-2 border-gray-200 pt-4 mt-4">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-[#007980]/5 to-[#005f65]/5 rounded-xl">
                <span className="text-lg font-bold text-gray-800">
                  Total Amount Paid:
                </span>
                <span className="text-2xl font-bold text-[#007980]">
                  {booking.totalAmount?.toLocaleString()} VND
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Refund Type Selection */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 animate-slideUp border border-gray-100 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-100 p-2 rounded-lg">
              <svg
                className="w-6 h-6 text-purple-600"
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
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Select Refund Type
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <label
              className={`group relative flex flex-col p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                refundType === "pre_trip_cancellation"
                  ? "border-[#007980] bg-gradient-to-br from-[#007980]/5 to-[#005f65]/5 shadow-lg scale-105"
                  : "border-gray-200 hover:border-[#007980]/50 hover:shadow-md"
              }`}
            >
              <input
                type="radio"
                name="refundType"
                value="pre_trip_cancellation"
                checked={refundType === "pre_trip_cancellation"}
                onChange={(e) => setRefundType(e.target.value)}
                className="absolute top-4 right-4 w-5 h-5 text-[#007980] focus:ring-[#007980]"
              />
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`p-2 rounded-lg transition-colors duration-300 ${
                    refundType === "pre_trip_cancellation"
                      ? "bg-[#007980] text-white"
                      : "bg-gray-100 text-gray-600 group-hover:bg-[#007980]/10"
                  }`}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <p
                  className={`text-lg font-bold transition-colors duration-300 ${
                    refundType === "pre_trip_cancellation"
                      ? "text-[#007980]"
                      : "text-gray-800"
                  }`}
                >
                  Pre-Trip Cancellation
                </p>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed ml-14">
                Cancel your booking before the tour starts. Refund amount
                depends on how many days before departure.
              </p>
            </label>

            <label
              className={`group relative flex flex-col p-6 border-2 rounded-xl transition-all duration-300 ${
                !isTourCompleted()
                  ? "opacity-50 cursor-not-allowed border-gray-200 bg-gray-50"
                  : refundType === "post_trip_issue"
                  ? "border-[#007980] bg-gradient-to-br from-[#007980]/5 to-[#005f65]/5 shadow-lg scale-105 cursor-pointer"
                  : "border-gray-200 hover:border-[#007980]/50 hover:shadow-md cursor-pointer"
              }`}
            >
              <input
                type="radio"
                name="refundType"
                value="post_trip_issue"
                checked={refundType === "post_trip_issue"}
                onChange={(e) => setRefundType(e.target.value)}
                disabled={!isTourCompleted()}
                className="absolute top-4 right-4 w-5 h-5 text-[#007980] focus:ring-[#007980] disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`p-2 rounded-lg transition-colors duration-300 ${
                    refundType === "post_trip_issue"
                      ? "bg-[#007980] text-white"
                      : "bg-gray-100 text-gray-600 group-hover:bg-[#007980]/10"
                  }`}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <p
                  className={`text-lg font-bold transition-colors duration-300 ${
                    refundType === "post_trip_issue"
                      ? "text-[#007980]"
                      : "text-gray-800"
                  }`}
                >
                  Post-Trip Issue
                </p>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed ml-14">
                Report an issue after completing the tour. Refund amount depends
                on the severity of the issue.
              </p>
              {!isTourCompleted() && (
                <div className="mt-3 ml-14 flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <svg
                    className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-xs text-yellow-800 font-medium">
                    Chỉ có thể chọn sau khi tour đã hoàn thành
                  </span>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Refund Preview */}
        {refundPreview && (
          <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-2xl shadow-xl p-8 mb-8 border-2 border-green-200 animate-fadeIn hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-100 p-2 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
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
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Refund Calculation Preview
              </h2>
            </div>

            <div className="space-y-4">
              {refundType === "pre_trip_cancellation" && (
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">
                        Days before tour
                      </span>
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-blue-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-xl font-bold text-[#007980]">
                          {refundPreview.daysBeforeTour}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">
                        Policy applies
                      </span>
                      <span className="text-sm font-semibold text-gray-800">
                        {refundPreview.policy}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-white/70 backdrop-blur-sm rounded-xl">
                  <span className="text-base font-medium text-gray-700">
                    Original amount
                  </span>
                  <span className="text-lg font-semibold text-gray-800">
                    {refundPreview.originalAmount?.toLocaleString()} VND
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border-2 border-[#007980]/30">
                  <span className="text-base font-medium text-gray-700">
                    Refund percentage
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="bg-[#007980] text-white px-4 py-2 rounded-lg font-bold text-xl animate-pulse">
                      {refundPreview.percentage}%
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-white/70 backdrop-blur-sm rounded-xl">
                  <span className="text-base font-medium text-gray-700">
                    Refundable amount
                  </span>
                  <span className="text-lg font-semibold text-gray-800">
                    {refundPreview.refundableAmount?.toLocaleString()} VND
                  </span>
                </div>

                {refundPreview.processingFee > 0 && (
                  <div className="flex justify-between items-center p-4 bg-red-50 backdrop-blur-sm rounded-xl border border-red-200">
                    <span className="text-base font-medium text-gray-700">
                      Processing fee (2%)
                    </span>
                    <span className="text-lg font-semibold text-red-600">
                      -{refundPreview.processingFee?.toLocaleString()} VND
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 p-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-xl font-bold text-white">
                      Final refund amount
                    </span>
                  </div>
                  <span className="text-3xl font-bold text-white drop-shadow-lg">
                    {refundPreview.finalAmount?.toLocaleString()} VND
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Refund Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 animate-slideUp hover:shadow-2xl transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <svg
                className="w-6 h-6 text-indigo-600"
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
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Refund Request Details
            </h2>
          </div>

          {refundType === "post_trip_issue" && (
            <div className="space-y-6 mb-6">
              {/* Issue Category */}
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <svg
                    className="w-4 h-4 text-orange-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Issue Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={issueCategory}
                  onChange={(e) => setIssueCategory(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#007980] focus:ring-2 focus:ring-[#007980]/20 transition-all duration-300 bg-white hover:border-gray-300"
                  required
                >
                  <option value="">Select a category...</option>
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
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <svg
                    className="w-4 h-4 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Issue Severity <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    {
                      value: "minor",
                      label: "Minor",
                      percent: "20%",
                      color: "blue",
                      icon: "ℹ️",
                    },
                    {
                      value: "moderate",
                      label: "Moderate",
                      percent: "40%",
                      color: "yellow",
                      icon: "⚡",
                    },
                    {
                      value: "major",
                      label: "Major",
                      percent: "70%",
                      color: "orange",
                      icon: "⚠️",
                    },
                    {
                      value: "critical",
                      label: "Critical",
                      percent: "100%",
                      color: "red",
                      icon: "🚨",
                    },
                  ].map((item) => (
                    <label
                      key={item.value}
                      className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                        severity === item.value
                          ? `border-${item.color}-500 bg-${item.color}-50 shadow-lg scale-105`
                          : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                      }`}
                    >
                      <input
                        type="radio"
                        value={item.value}
                        checked={severity === item.value}
                        onChange={(e) => setSeverity(e.target.value)}
                        className="sr-only"
                      />
                      <span className="text-2xl mb-1">{item.icon}</span>
                      <span className="font-semibold text-sm text-gray-800">
                        {item.label}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          severity === item.value
                            ? `text-${item.color}-600`
                            : "text-gray-500"
                        }`}
                      >
                        {item.percent} refund
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <svg
                    className="w-4 h-4 text-purple-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Issue Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#007980] focus:ring-2 focus:ring-[#007980]/20 transition-all duration-300 resize-none hover:border-gray-300"
                  rows={5}
                  placeholder="Please describe the issue in detail. Include specific incidents, dates, and any relevant information..."
                  required
                />
                <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Be as detailed as possible to help us process your request
                  faster
                </p>
              </div>
            </div>
          )}

          {/* Request Note */}
          <div className="mb-8">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <svg
                className="w-4 h-4 text-gray-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Additional Notes
              <span className="text-gray-400 text-xs font-normal">
                (Optional)
              </span>
            </label>
            <textarea
              value={requestNote}
              onChange={(e) => setRequestNote(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#007980] focus:ring-2 focus:ring-[#007980]/20 transition-all duration-300 resize-none hover:border-gray-300"
              rows={4}
              placeholder="Any additional information you'd like to provide..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => navigate("/booking-history")}
              className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold text-gray-700 transition-all duration-300 hover:border-gray-400 hover:shadow-md flex items-center justify-center gap-2 group"
            >
              <svg
                className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-4 bg-gradient-to-r from-[#007980] to-[#005f65] text-white rounded-xl hover:from-[#005f65] hover:to-[#004a50] font-bold transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 group"
              disabled={refundPreview?.finalAmount <= 0}
            >
              <span>Submit Refund Request</span>
              <svg
                className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </div>
        </form>

        {/* Confirmation Modal */}
        <ConfirmModal
          isOpen={showConfirmModal}
          title="Xác nhận gửi yêu cầu hoàn tiền"
          message={`Bạn có chắc chắn muốn gửi yêu cầu hoàn tiền cho booking ${booking?.orderRef}? Sau khi gửi, yêu cầu sẽ được chuyển đến bộ phận xem xét.`}
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
