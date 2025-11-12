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

  useEffect(() => {
    if (token) {
      loadRefunds();
      loadStats();
    }
  }, [token, statusFilter, typeFilter]);

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

      toast.success(`Refund ${reviewAction}d successfully`);
      setShowReviewModal(false);
      loadRefunds();
      loadStats();
    } catch (error) {
      console.error("Error reviewing refund:", error);
      toast.error("Error reviewing refund");
    }
  };

  const handleProcess = (refund) => {
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

      if (!response.ok) throw new Error("Failed to process refund");

      toast.success("Refund processed successfully");
      setShowProcessModal(false);
      loadRefunds();
      loadStats();
    } catch (error) {
      console.error("Error processing refund:", error);
      toast.error("Error processing refund");
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
                        {refund.userId?.name || "N/A"}
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
                  <td className="px-6 py-4">{getStatusBadge(refund.status)}</td>
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
                    {refund.status === "approved" && (
                      <button
                        onClick={() => handleProcess(refund)}
                        className="text-green-600 hover:underline text-sm font-medium"
                      >
                        Process
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
          onConfirm={submitProcess}
          title="Process Refund"
          confirmText="Process Refund"
          type="success"
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
                  <p className="text-xs text-green-600 mt-2">
                    Cung cấp lúc:{" "}
                    {new Date(
                      selectedRefund.bankInfo.providedAt
                    ).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>
            )}

            {/* Warning if no bank info */}
            {!selectedRefund.bankInfo?.accountNumber && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
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
                    <p className="text-sm font-semibold text-yellow-800">
                      Chưa có thông tin tài khoản
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Khách hàng chưa cung cấp thông tin ngân hàng. Bạn có thể
                      xử lý thủ công hoặc đợi khách hàng cập nhật.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Refund Method *
              </label>
              <select
                value={refundMethod}
                onChange={(e) => setRefundMethod(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="original_payment">
                  Original Payment Method
                </option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="wallet">Wallet</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Transaction ID
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Enter transaction ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Processing Note
              </label>
              <textarea
                value={processNote}
                onChange={(e) => setProcessNote(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                placeholder="Add processing notes..."
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Amount to refund:</strong>{" "}
                {selectedRefund.finalRefundAmount?.toLocaleString()} VND
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default RefundManagement;
