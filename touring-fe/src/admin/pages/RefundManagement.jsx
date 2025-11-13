import { useState, useEffect } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import toast, { Toaster } from "react-hot-toast";
import Modal from "../components/Common/Modal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const RefundManagement = () => {
  const { token } = useAdminAuth();
  const [refunds, setRefunds] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showManualPaymentModal, setShowManualPaymentModal] = useState(false);
  const [manualPaymentData, setManualPaymentData] = useState(null);
  const [isAutoChecking, setIsAutoChecking] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Review form
  const [reviewAction, setReviewAction] = useState("approve");
  const [reviewNote, setReviewNote] = useState("");
  const [adjustedAmount, setAdjustedAmount] = useState("");

  // Process form
  const [refundMethod, setRefundMethod] = useState("original_payment");
  const [transactionId, setTransactionId] = useState("");
  const [processNote, setProcessNote] = useState("");

  // Check and save payment return params on FIRST render (before auth check)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get("paymentSuccess");
    const refundId = urlParams.get("refundId");

    if (paymentSuccess === "true" && refundId) {
      console.log(
        "🔄 Detected return from MoMo payment - saving params to localStorage"
      );
      // Save to localStorage to persist across any navigation
      localStorage.setItem(
        "pendingPaymentCheck",
        JSON.stringify({
          refundId,
          timestamp: Date.now(),
        })
      );
      // Clear URL params
      window.history.replaceState({}, "", "/admin/refunds");
      console.log("✅ Payment params saved and URL cleaned");
    }
  }, []); // Empty deps = run once on mount

  useEffect(() => {
    if (token) {
      loadRefunds();
      loadStats();
      checkPaymentReturn();
    }
  }, [token, statusFilter, typeFilter]);

  // Auto-check payment status when Payment Modal is open
  useEffect(() => {
    if (!showManualPaymentModal || !selectedRefund || isAutoChecking) {
      return;
    }

    console.log("🔄 Starting auto-check for payment...");
    setIsAutoChecking(true);

    // Check payment every 5 seconds
    const intervalId = setInterval(async () => {
      try {
        console.log("⏰ Auto-checking payment status...");
        const response = await fetch(
          `${API_URL}/api/admin/refunds/${selectedRefund._id}/check-payment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (result.success) {
          console.log("✅ Payment completed! Stopping auto-check.");
          clearInterval(intervalId);
          setIsAutoChecking(false);

          toast.success(
            "✅ Thanh toán thành công! Hoàn tiền đã hoàn tất và email đã được gửi.",
            {
              duration: 6000,
            }
          );

          // Close modal and reload
          setShowManualPaymentModal(false);
          setManualPaymentData(null);
          await loadRefunds();
          await loadStats();
        } else {
          console.log("⏳ Payment not completed yet, will check again...");
        }
      } catch (error) {
        console.error("❌ Error in auto-check:", error);
      }
    }, 5000); // Check every 5 seconds

    // Cleanup on unmount or when modal closes
    return () => {
      console.log("🛑 Stopping auto-check");
      clearInterval(intervalId);
      setIsAutoChecking(false);
    };
  }, [showManualPaymentModal, selectedRefund, token]);

  // Check if returning from MoMo payment
  const checkPaymentReturn = async () => {
    // Check localStorage for pending payment check
    const pendingCheck = localStorage.getItem("pendingPaymentCheck");

    if (pendingCheck) {
      try {
        const { refundId, timestamp } = JSON.parse(pendingCheck);

        // Only process if less than 10 minutes old (give time for login)
        if (Date.now() - timestamp < 10 * 60 * 1000) {
          console.log(
            "🔄 Processing pending payment check for refund:",
            refundId
          );

          // Clear localStorage IMMEDIATELY to prevent duplicate checks
          localStorage.removeItem("pendingPaymentCheck");

          // Show loading toast
          const loadingToast = toast.loading(
            "Đang kiểm tra thanh toán MoMo..."
          );

          try {
            // Wait a bit for MoMo to process
            await new Promise((resolve) => setTimeout(resolve, 3000));

            // Check payment status
            console.log("📤 Sending check-payment request to backend...");
            const response = await fetch(
              `${API_URL}/api/admin/refunds/${refundId}/check-payment`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const result = await response.json();
            console.log("📥 Backend response:", result);

            toast.dismiss(loadingToast);

            if (result.success) {
              toast.success(
                "✅ Thanh toán thành công! Hoàn tiền đã hoàn tất và email đã được gửi.",
                {
                  duration: 6000,
                }
              );
              // Reload data
              await loadRefunds();
              await loadStats();
            } else {
              toast.error(
                "⏳ " +
                  (result.message ||
                    "Thanh toán chưa hoàn tất. Vui lòng thử lại sau."),
                {
                  duration: 5000,
                }
              );
            }
          } catch (error) {
            toast.dismiss(loadingToast);
            console.error("❌ Error checking payment:", error);
            toast.error(
              "Lỗi kiểm tra thanh toán. Vui lòng kiểm tra thủ công trong modal.",
              {
                duration: 6000,
              }
            );
          }
        } else {
          // Too old, clear it
          console.log(
            "⚠️ Pending payment check expired (>10 minutes), clearing"
          );
          localStorage.removeItem("pendingPaymentCheck");
        }
      } catch (error) {
        console.error("❌ Error parsing pending payment check:", error);
        localStorage.removeItem("pendingPaymentCheck");
      }
    }
  };

  const loadRefunds = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (typeFilter) params.append("type", typeFilter);

      const response = await fetch(
        `${API_URL}/api/admin/refunds?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to load refunds");

      const data = await response.json();
      setRefunds(data.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error loading refunds:", error);
      toast.error("Error loading refunds");
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/refunds/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to load stats");

      const data = await response.json();
      setStats(data.data);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleViewDetails = (refund) => {
    console.log("=== Opening Detail Modal ===");
    console.log("Refund:", refund);
    console.log("Requires manual processing:", refund.requiresManualProcessing);
    console.log("Status:", refund.status);
    setSelectedRefund(refund);
    setShowDetailModal(true);
  };

  const handleReview = (refund) => {
    setSelectedRefund(refund);
    setReviewAction("approve");
    setReviewNote("");
    setAdjustedAmount("");
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    try {
      const payload = {
        action: reviewAction,
        reviewNote,
      };

      if (reviewAction === "approve" && adjustedAmount) {
        payload.adjustedAmount = parseFloat(adjustedAmount);
      }

      const response = await fetch(
        `${API_URL}/api/admin/refunds/${selectedRefund._id}/review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Failed to review refund");

      const result = await response.json();

      if (reviewAction === "approve") {
        toast.success(
          "✅ Refund approved! User has been notified to provide bank information via email.",
          { duration: 5000 }
        );
      } else {
        toast.success("Refund rejected successfully");
      }

      setShowReviewModal(false);
      loadRefunds();
      loadStats();
    } catch (error) {
      console.error("Error reviewing refund:", error);
      toast.error("Error reviewing refund");
    }
  };

  const handleProcess = (refund) => {
    // Check if bank info is provided
    if (!refund.bankInfo?.accountNumber) {
      toast.error(
        "⚠️ Cannot process refund without bank information. User must provide bank details first.",
        { duration: 5000 }
      );
      return;
    }

    setSelectedRefund(refund);
    setRefundMethod("original_payment");
    setTransactionId("");
    setProcessNote("");
    setShowProcessModal(true);
  };

  const submitProcess = async () => {
    try {
      const payload = {
        refundMethod,
        transactionId,
        note: processNote,
      };

      const response = await fetch(
        `${API_URL}/api/admin/refunds/${selectedRefund._id}/process`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      // Handle auto-process failure (still success response but needs manual handling)
      if (result.autoProcessFailed) {
        toast.error(
          `⚠️ Auto-refund failed: ${result.error}\n\n` +
            `Refund marked for manual processing. Use "Create Payment" button to generate MoMo transfer.`,
          { duration: 10000 }
        );
        setShowProcessModal(false);
        loadRefunds();
        loadStats();
        return;
      }

      if (!response.ok) {
        if (result.requiresBankInfo) {
          throw new Error(
            "Cannot process refund without bank information. User must provide bank details first."
          );
        }
        throw new Error(result.message || "Failed to process refund");
      }

      toast.success(
        result.refundResult?.requiresManualProcessing
          ? "⚠️ Refund marked for manual processing"
          : "✅ Refund processed successfully! Email sent to user.",
        { duration: 5000 }
      );

      setShowProcessModal(false);
      loadRefunds();
      loadStats();
    } catch (error) {
      console.error("Error processing refund:", error);
      toast.error(error.message || "Error processing refund");
    }
  };

  const createManualPayment = async () => {
    try {
      console.log("=== Creating Manual Payment ===");
      console.log("Refund ID:", selectedRefund._id);
      console.log(
        "API URL:",
        `${API_URL}/api/admin/refunds/${selectedRefund._id}/create-manual-payment`
      );

      const response = await fetch(
        `${API_URL}/api/admin/refunds/${selectedRefund._id}/create-manual-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      console.log("Response status:", response.status);
      console.log("Response data:", result);

      if (!response.ok) {
        throw new Error(result.message || "Failed to create payment");
      }

      console.log("Payment data:", result.payment);
      setManualPaymentData(result.payment);
      setShowProcessModal(false); // Close process modal
      setShowManualPaymentModal(true);
      toast.success("✅ Đã tạo mã thanh toán MoMo! Scan QR để thanh toán.", {
        duration: 4000,
      });
    } catch (error) {
      console.error("Error creating manual payment:", error);
      toast.error(error.message || "Error creating manual payment");
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      under_review: "bg-blue-100 text-blue-700 border-blue-200",
      approved: "bg-green-100 text-green-700 border-green-200",
      processing: "bg-purple-100 text-purple-700 border-purple-200",
      completed: "bg-green-100 text-green-800 border-green-300",
      rejected: "bg-red-100 text-red-700 border-red-200",
      cancelled: "bg-gray-100 text-gray-700 border-gray-200",
    };

    return (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full border ${
          statusColors[status] || "bg-gray-100 text-gray-700"
        }`}
      >
        {status.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    return type === "pre_trip_cancellation" ? (
      <span className="text-xs text-orange-600 font-medium">Pre-Trip</span>
    ) : (
      <span className="text-xs text-blue-600 font-medium">Post-Trip</span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#007980] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading refunds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#007980] to-[#005f65] bg-clip-text text-transparent">
          Refund Management
        </h1>
        <p className="text-gray-600 mt-2">Review and process refund requests</p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-gray-400">
            <p className="text-sm text-gray-600 mb-1">Total Refunds</p>
            <p className="text-2xl font-bold text-gray-800">
              {stats.totalRefunds || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">All requests</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-yellow-400">
            <p className="text-sm text-gray-600 mb-1">Pending Review</p>
            <p className="text-2xl font-bold text-yellow-600">
              {(stats.pendingCount || 0) + (stats.underReviewCount || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.pendingCount || 0} pending, {stats.underReviewCount || 0}{" "}
              reviewing
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-green-400">
            <p className="text-sm text-gray-600 mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.completedCount || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Successfully processed</p>
          </div>
          <div className="bg-gradient-to-br from-[#007980] to-[#005f65] rounded-xl shadow-lg p-4 border-l-4 border-[#003f45]">
            <p className="text-sm text-white/90 mb-1">Approved Amount</p>
            <p className="text-xl font-bold text-white">
              {(stats.approvedAmount || 0).toLocaleString()} VND
            </p>
            <p className="text-xs text-white/80 mt-1">
              {stats.approvedCount || 0} approved, {stats.processingCount || 0}{" "}
              processing
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">All Types</option>
            <option value="pre_trip_cancellation">Pre-Trip Cancellation</option>
            <option value="post_trip_issue">Post-Trip Issue</option>
          </select>
        </div>
      </div>

      {/* Refunds Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                Reference
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                Date
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {refunds.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-16 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-lg font-medium">No refunds found</p>
                  </div>
                </td>
              </tr>
            ) : (
              refunds.map((refund) => (
                <tr key={refund._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-semibold text-[#007980]">
                      {refund.refundReference}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">
                        {refund.userId?.fullName ||
                          refund.userId?.name ||
                          "N/A"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {refund.userId?.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getTypeBadge(refund.refundType)}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-green-600">
                        {refund.finalRefundAmount?.toLocaleString()} VND
                      </p>
                      <p className="text-xs text-gray-500">
                        {refund.refundPercentage}% of{" "}
                        {refund.originalAmount?.toLocaleString()}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {getStatusBadge(refund.status)}
                      {refund.requiresManualProcessing &&
                        refund.status === "approved" && (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                            ⚠️ Manual Required
                          </span>
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(refund.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleViewDetails(refund)}
                      className="text-[#007980] hover:underline text-sm font-medium"
                    >
                      View
                    </button>
                    {(refund.status === "pending" ||
                      refund.status === "under_review") && (
                      <button
                        onClick={() => handleReview(refund)}
                        className="text-blue-600 hover:underline text-sm font-medium"
                      >
                        Review
                      </button>
                    )}
                    {(refund.status === "approved" ||
                      refund.status === "processing") && (
                      <button
                        onClick={() => handleProcess(refund)}
                        disabled={!refund.bankInfo?.accountNumber}
                        className={`text-sm font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed ${
                          refund.bankInfo?.accountNumber
                            ? "text-green-600"
                            : "text-orange-600"
                        }`}
                        title={
                          refund.bankInfo?.accountNumber
                            ? "Bank info received - Ready to process"
                            : "Waiting for bank info from user"
                        }
                      >
                        {refund.bankInfo?.accountNumber
                          ? refund.status === "processing"
                            ? "Retry Process"
                            : "Process"
                          : "Pending Info"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRefund && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Refund Details"
          showActions={false}
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Reference</p>
              <p className="font-semibold">{selectedRefund.refundReference}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Booking Reference</p>
              <p className="font-semibold">
                {selectedRefund.orderRef ||
                  selectedRefund.bookingId?.orderRef ||
                  selectedRefund.bookingId?.payment?.orderId ||
                  (typeof selectedRefund.bookingId === "string"
                    ? selectedRefund.bookingId.slice(-8)
                    : "N/A")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Type</p>
              <p className="font-semibold capitalize">
                {selectedRefund.refundType.replace("_", " ")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Refund Amount</p>
              <p className="font-semibold text-green-600">
                {selectedRefund.finalRefundAmount?.toLocaleString()} VND (
                {selectedRefund.refundPercentage}%)
              </p>
            </div>
            {selectedRefund.cancellationDetails && (
              <div>
                <p className="text-sm text-gray-600">Cancellation Policy</p>
                <p className="font-semibold">
                  {selectedRefund.cancellationDetails.cancellationPolicy}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedRefund.cancellationDetails.daysBeforeTour} days
                  before tour
                </p>
              </div>
            )}
            {selectedRefund.issueDetails && (
              <div>
                <p className="text-sm text-gray-600">Issue</p>
                <p className="font-semibold capitalize">
                  {selectedRefund.issueDetails.issueCategory?.replace("_", " ")}{" "}
                  - {selectedRefund.issueDetails.severity}
                </p>
                <p className="text-sm mt-1">
                  {selectedRefund.issueDetails.description}
                </p>
              </div>
            )}
            {selectedRefund.requestNote && (
              <div>
                <p className="text-sm text-gray-600">User Note</p>
                <p className="text-sm">{selectedRefund.requestNote}</p>
              </div>
            )}
            {selectedRefund.reviewNote && (
              <div>
                <p className="text-sm text-gray-600">Admin Review Note</p>
                <p className="text-sm">{selectedRefund.reviewNote}</p>
              </div>
            )}
            {selectedRefund.status === "approved" && (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Bank Information Status
                </p>
                {selectedRefund.bankInfo?.accountNumber ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm font-semibold text-green-700 mb-1">
                      ✅ Bank Info Received
                    </p>
                    <div className="text-xs text-green-600 space-y-1">
                      <p>
                        <strong>Bank:</strong>{" "}
                        {selectedRefund.bankInfo.bankName}
                      </p>
                      <p>
                        <strong>Account:</strong>{" "}
                        {selectedRefund.bankInfo.accountNumber}
                      </p>
                      <p>
                        <strong>Name:</strong>{" "}
                        {selectedRefund.bankInfo.accountName}
                      </p>
                      {selectedRefund.bankInfo.branchName && (
                        <p>
                          <strong>Branch:</strong>{" "}
                          {selectedRefund.bankInfo.branchName}
                        </p>
                      )}
                      <p className="text-green-500 mt-2">
                        Provided at:{" "}
                        {new Date(
                          selectedRefund.bankInfo.providedAt
                        ).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <p className="text-sm font-semibold text-orange-700">
                      ⏳ Waiting for Bank Information
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      User has been notified to provide bank account details
                    </p>
                  </div>
                )}
              </div>
            )}
            {selectedRefund.requiresManualProcessing && (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mt-4">
                <p className="text-sm font-bold text-red-800 mb-2">
                  ⚠️ REQUIRES MANUAL PROCESSING
                </p>
                <p className="text-xs text-red-700 mb-2">
                  Automatic refund via payment gateway failed. Create a MoMo
                  payment to transfer refund manually.
                </p>
                {selectedRefund.processingNote && (
                  <div className="bg-red-100 rounded p-2 mt-2">
                    <p className="text-xs text-red-800">
                      <strong>Error:</strong> {selectedRefund.processingNote}
                    </p>
                  </div>
                )}
                <div className="mt-3 flex justify-center">
                  <button
                    onClick={createManualPayment}
                    className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-semibold transition-colors"
                  >
                    🏦 Create MoMo Payment
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedRefund && (
        <Modal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onConfirm={submitReview}
          title="Review Refund Request"
          confirmText={
            reviewAction === "approve" ? "✓ Approve Refund" : "✗ Reject Refund"
          }
          type={reviewAction === "approve" ? "success" : "error"}
          size="lg"
        >
          <div className="space-y-4">
            {/* Refund Info Summary */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600">Reference</p>
                  <p className="font-semibold text-sm">
                    {selectedRefund.refundReference}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Amount</p>
                  <p className="font-semibold text-sm text-green-600">
                    {selectedRefund.finalRefundAmount?.toLocaleString()} VND
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">User</p>
                  <p className="font-semibold text-sm">
                    {selectedRefund.userId?.fullName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Type</p>
                  <p className="font-semibold text-sm">
                    {selectedRefund.refundType === "pre_trip_cancellation"
                      ? "Pre-Trip"
                      : "Post-Trip"}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Selection */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700">
                Review Decision *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReviewAction("approve")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    reviewAction === "approve"
                      ? "border-green-500 bg-green-50 shadow-md"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        reviewAction === "approve"
                          ? "border-green-500 bg-green-500"
                          : "border-gray-300"
                      }`}
                    >
                      {reviewAction === "approve" && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="text-left flex-1">
                      <p
                        className={`font-semibold ${
                          reviewAction === "approve"
                            ? "text-green-700"
                            : "text-gray-700"
                        }`}
                      >
                        ✓ Approve
                      </p>
                      <p className="text-xs text-gray-500">
                        Chấp nhận yêu cầu hoàn tiền
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewAction("reject")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    reviewAction === "reject"
                      ? "border-red-500 bg-red-50 shadow-md"
                      : "border-gray-200 hover:border-red-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        reviewAction === "reject"
                          ? "border-red-500 bg-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      {reviewAction === "reject" && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="text-left flex-1">
                      <p
                        className={`font-semibold ${
                          reviewAction === "reject"
                            ? "text-red-700"
                            : "text-gray-700"
                        }`}
                      >
                        ✗ Reject
                      </p>
                      <p className="text-xs text-gray-500">
                        Từ chối yêu cầu hoàn tiền
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {reviewAction === "approve" && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Adjusted Amount (optional)
                </label>
                <input
                  type="number"
                  value={adjustedAmount}
                  onChange={(e) => setAdjustedAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder={`Current: ${selectedRefund.finalRefundAmount?.toLocaleString()} VND`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use the calculated amount
                </p>
              </div>
            )}

            {reviewAction === "reject" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-red-800">
                      Lưu ý khi từ chối
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      Khi từ chối yêu cầu hoàn tiền, vui lòng cung cấp lý do rõ
                      ràng để khách hàng hiểu được quyết định của bạn.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                {reviewAction === "approve"
                  ? "Approval Note *"
                  : "Rejection Reason *"}
              </label>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                  reviewAction === "approve"
                    ? "border-gray-300 focus:ring-green-500 focus:border-green-500"
                    : "border-red-300 focus:ring-red-500 focus:border-red-500"
                }`}
                rows={4}
                placeholder={
                  reviewAction === "approve"
                    ? "Enter your approval notes (optional but recommended)..."
                    : "Explain why this refund request is being rejected. This will be shown to the customer."
                }
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {reviewAction === "approve"
                  ? "This note will be visible to the customer"
                  : "Be clear and professional - customer will see this message"}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Process Modal */}
      {showProcessModal && selectedRefund && (
        <Modal
          isOpen={showProcessModal}
          onClose={() => setShowProcessModal(false)}
          title="Process Refund"
          size="md"
        >
          <div className="space-y-4">
            {/* Bank Account Info Display */}
            {selectedRefund.bankInfo?.accountNumber && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-green-800 mb-2">
                  ✅ Thông Tin Tài Khoản Nhận Tiền
                </p>
                <div className="space-y-1 text-sm text-green-700">
                  <p>
                    <strong>Ngân hàng:</strong>{" "}
                    {selectedRefund.bankInfo.bankName}
                  </p>
                  <p>
                    <strong>Số tài khoản:</strong>{" "}
                    {selectedRefund.bankInfo.accountNumber}
                  </p>
                  <p>
                    <strong>Tên chủ TK:</strong>{" "}
                    {selectedRefund.bankInfo.accountName}
                  </p>
                  {selectedRefund.bankInfo.branchName && (
                    <p>
                      <strong>Chi nhánh:</strong>{" "}
                      {selectedRefund.bankInfo.branchName}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Amount Display */}
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <p className="text-lg font-bold text-blue-900 text-center">
                Số tiền hoàn:{" "}
                {selectedRefund.finalRefundAmount?.toLocaleString()} VND
              </p>
            </div>

            {/* Create MoMo Payment Button */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-300 rounded-lg p-6">
              <p className="text-sm font-bold text-pink-800 mb-2 text-center">
                💳 Tạo Thanh Toán MoMo
              </p>
              <p className="text-xs text-gray-700 mb-4 text-center">
                Tạo mã QR MoMo để chuyển tiền hoàn trả cho khách hàng
              </p>
              <div className="flex justify-center">
                <button
                  onClick={createManualPayment}
                  className="px-8 py-4 bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-xl hover:from-pink-700 hover:to-pink-800 font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  🏦 Tạo MoMo Payment
                </button>
              </div>
            </div>

            {/* Warning if no bank info */}
            {!selectedRefund.bankInfo?.accountNumber && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm font-semibold text-yellow-800">
                  ⚠️ Chưa có thông tin tài khoản
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Khách hàng chưa cung cấp thông tin ngân hàng.
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Manual Payment Modal - MoMo QR Code */}
      {showManualPaymentModal && manualPaymentData && (
        <Modal
          isOpen={showManualPaymentModal}
          onClose={() => {
            // Warn if auto-checking is in progress
            if (isAutoChecking) {
              const confirm = window.confirm(
                "Hệ thống đang tự động kiểm tra thanh toán. Đóng modal này có thể làm gián đoạn quá trình. Bạn có chắc muốn đóng không?"
              );
              if (!confirm) return;
            }
            setShowManualPaymentModal(false);
            setManualPaymentData(null);
            setIsAutoChecking(false);
            loadRefunds(); // Reload to check if payment completed
          }}
          title="🏦 MoMo Manual Refund Payment"
          size="lg"
        >
          <div className="space-y-6 text-center">
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6 border-2 border-pink-200">
              <h3 className="text-lg font-bold text-pink-800 mb-2">
                Scan QR Code to Transfer Refund
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                Amount:{" "}
                <span className="font-bold text-pink-700">
                  {manualPaymentData.amount.toLocaleString()} VND
                </span>
              </p>

              {/* QR Code */}
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-lg shadow-lg border-4 border-pink-300">
                  <img
                    src={manualPaymentData.qrCodeUrl}
                    alt="MoMo QR Code"
                    className="w-64 h-64"
                  />
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-white rounded-lg p-4 text-left space-y-2">
                <p className="text-xs text-gray-600 font-semibold">
                  📱 Hướng dẫn:
                </p>
                <ol className="text-xs text-gray-700 space-y-2 list-decimal list-inside">
                  <li>
                    <strong>Scan QR:</strong> Mở ứng dụng MoMo → Quét mã QR bên
                    trên
                  </li>
                  <li>
                    <strong>Hoặc:</strong> Click nút "Open in MoMo App" phía
                    dưới
                  </li>
                  <li>
                    <strong>Thanh toán:</strong> Xác nhận và hoàn tất giao dịch{" "}
                    {manualPaymentData.amount.toLocaleString()} VND trong app
                    MoMo
                  </li>
                  <li>
                    <strong>Sau khi thanh toán:</strong> Có thể đóng app MoMo và
                    quay lại trang này
                  </li>
                  <li>
                    <strong>Tự động hoàn tất:</strong> Modal này sẽ tự động đóng
                    trong 5-10 giây khi thanh toán thành công
                  </li>
                </ol>

                {isAutoChecking && (
                  <div className="mt-3 flex items-center gap-2 text-blue-600 bg-blue-50 p-2 rounded animate-pulse">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <span className="text-xs font-semibold">
                      Đang tự động kiểm tra thanh toán mỗi 5 giây...
                    </span>
                  </div>
                )}
              </div>

              {/* Order ID */}
              <div className="mt-4 bg-gray-50 rounded p-3">
                <p className="text-xs text-gray-600">
                  <strong>Order ID:</strong> {manualPaymentData.orderId}
                </p>
              </div>

              {/* Alternative: Open in MoMo app */}
              {manualPaymentData.deeplink && (
                <div className="mt-4">
                  <a
                    href={manualPaymentData.deeplink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-semibold transition-colors"
                  >
                    Open in MoMo App
                  </a>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-lg p-4 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-7 h-7 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-green-900 mb-2">
                    🔄 Tự động xác nhận thanh toán
                  </p>
                  <p className="text-xs text-green-800 leading-relaxed">
                    Sau khi thanh toán xong trong MoMo, bạn sẽ được{" "}
                    <strong>tự động chuyển về trang này</strong>. Hệ thống sẽ tự
                    động xác nhận thanh toán, hoàn tất refund và gửi email cho
                    khách hàng.
                  </p>
                  <p className="text-xs text-green-700 mt-2 font-semibold">
                    ✉️ Không cần làm gì thêm - mọi thứ đều tự động!
                  </p>
                </div>
              </div>

              {/* Manual verify button (backup) */}
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-xs text-blue-700 mb-2 text-center">
                  Hoặc kiểm tra thủ công nếu cần:
                </p>
                <button
                  onClick={async () => {
                    try {
                      const loadingToast = toast.loading(
                        "Đang kiểm tra thanh toán..."
                      );

                      const response = await fetch(
                        `${API_URL}/api/admin/refunds/${selectedRefund._id}/check-payment`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                        }
                      );

                      const result = await response.json();
                      toast.dismiss(loadingToast);

                      if (result.success) {
                        toast.success(
                          "✅ Thanh toán thành công! Refund đã hoàn tất.",
                          { duration: 5000 }
                        );
                        setShowManualPaymentModal(false);
                        setManualPaymentData(null);
                        loadRefunds();
                        loadStats();
                      } else {
                        toast.error(
                          result.message ||
                            "Thanh toán chưa hoàn tất. Vui lòng thử lại.",
                          { duration: 4000 }
                        );
                      }
                    } catch (error) {
                      console.error("Error checking payment:", error);
                      toast.error("Lỗi kiểm tra thanh toán");
                    }
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors text-sm"
                >
                  🔄 Kiểm tra thanh toán ngay
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default RefundManagement;
