import { useState, useEffect } from "react";
import { useAuth } from "../auth/context";
import { toast } from "react-hot-toast";
import RefundCard from "./RefundCard";
import RefundDetailModal from "./RefundDetailModal";
import ConfirmModal from "./ConfirmModal";
import BankInfoModal from "./BankInfoModal";

import { API_URL } from "@/config/api";

const UserRefundList = () => {
  const { user } = useAuth();
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [cancellingRefundId, setCancellingRefundId] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [refundToCancel, setRefundToCancel] = useState(null);
  const [showBankInfoModal, setShowBankInfoModal] = useState(false);
  const [bankInfoRefundId, setBankInfoRefundId] = useState(null);

  useEffect(() => {
    loadRefunds();
  }, [filter]);

  const loadRefunds = async () => {
    try {
      const token = user?.token;
      if (!token) {
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      if (filter !== "all") params.append("status", filter);

      const response = await fetch(
        `${API_URL}/api/refunds/my-refunds?${params.toString()}`,
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
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "text-yellow-600 bg-yellow-50",
      under_review: "text-blue-600 bg-blue-50",
      approved: "text-green-600 bg-green-50",
      processing: "text-purple-600 bg-purple-50",
      completed: "text-green-700 bg-green-100",
      rejected: "text-red-600 bg-red-50",
      cancelled: "text-gray-600 bg-gray-50",
    };
    return colors[status] || "text-gray-600 bg-gray-50";
  };

  const handleViewDetails = async (refundId) => {
    try {
      const token = user?.token;
      const response = await fetch(`${API_URL}/api/refunds/${refundId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to load refund details");

      const data = await response.json();
      setSelectedRefund(data.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error loading refund details:", error);
      toast.error("Không thể tải chi tiết refund");
    }
  };

  const handleProvideBankInfo = (refundId) => {
    console.log("🏦 Opening bank info modal for refund:", refundId);
    console.log("🏦 Current states before update:", {
      showBankInfoModal,
      bankInfoRefundId,
    });
    setBankInfoRefundId(refundId);
    setShowBankInfoModal(true);
    console.log("🏦 States updated (will apply on next render)");
  };

  const handleBankInfoSuccess = () => {
    toast.success("Đã gửi thông tin ngân hàng thành công!");
    loadRefunds(); // Reload to update status
    setShowBankInfoModal(false);
  };

  const handleCancelRequest = async (refundId) => {
    // Show confirm modal instead of browser confirm
    setRefundToCancel(refundId);
    setShowCancelConfirm(true);
  };

  const confirmCancelRequest = async () => {
    if (!refundToCancel) return;

    try {
      setCancellingRefundId(refundToCancel);
      setShowCancelConfirm(false);

      const token = user?.token;
      const response = await fetch(
        `${API_URL}/api/refunds/${refundToCancel}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: "Cancelled by user",
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to cancel refund");
      }

      console.log("✅ Refund cancelled successfully, dispatching event...");
      toast.success(
        "Đã hủy yêu cầu hoàn tiền thành công. Vui lòng kiểm tra lịch sử đặt tour."
      );

      // Signal to other components that refund data has changed
      window.dispatchEvent(
        new CustomEvent("refundUpdated", {
          detail: { refundId: refundToCancel, action: "cancelled" },
        })
      );

      loadRefunds(); // Reload list

      // Close the detail modal if it's open and showing the cancelled refund
      if (showDetailModal && selectedRefund?._id === refundToCancel) {
        setShowDetailModal(false);
        setSelectedRefund(null);
      }
    } catch (error) {
      console.error("Error cancelling refund:", error);
      toast.error(error.message || "Không thể hủy yêu cầu hoàn tiền");
    } finally {
      setCancellingRefundId(null);
      setRefundToCancel(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007980]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Danh Sách Yêu Cầu Hoàn Tiền
        </h2>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm focus:border-[#007980] focus:ring-2 focus:ring-[#007980]/20 transition-all"
        >
          <option value="all">Tất Cả Trạng Thái</option>
          <option value="pending">Đang Chờ</option>
          <option value="approved">Đã Duyệt</option>
          <option value="completed">Hoàn Thành</option>
          <option value="rejected">Từ Chối</option>
          <option value="cancelled">Đã Hủy</option>
        </select>
      </div>

      {refunds.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-500 text-lg">
            Không tìm thấy yêu cầu hoàn tiền nào
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {refunds.map((refund) => (
            <RefundCard
              key={refund._id}
              refund={refund}
              onViewDetails={handleViewDetails}
              onCancel={handleCancelRequest}
              isCancelling={cancellingRefundId === refund._id}
              onProvideBankInfo={handleProvideBankInfo}
            />
          ))}
        </div>
      )}

      {/* Bank Info Modal - Always rendered, visibility controlled by isOpen prop */}
      <BankInfoModal
        isOpen={showBankInfoModal}
        onClose={() => {
          setShowBankInfoModal(false);
          setBankInfoRefundId(null);
        }}
        refundId={bankInfoRefundId || ""}
        onSuccess={handleBankInfoSuccess}
      />

      {/* Detail Modal */}
      <RefundDetailModal
        refund={selectedRefund}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={showCancelConfirm}
        title="Xác nhận hủy yêu cầu"
        message="Bạn có chắc muốn hủy yêu cầu hoàn tiền này?"
        confirmText="Hủy Yêu Cầu"
        cancelText="Đóng"
        confirmStyle="danger"
        onConfirm={confirmCancelRequest}
        onCancel={() => {
          setShowCancelConfirm(false);
          setRefundToCancel(null);
        }}
      />
    </div>
  );
};

export default UserRefundList;
