import { useState, useEffect } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import toast, { Toaster } from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const PromotionManagement = () => {
  const { token } = useAdminAuth();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    type: "percentage",
    value: "",
    minOrderValue: "",
    maxDiscount: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    status: "active",
  });

  useEffect(() => {
    console.log("PromotionManagement - token:", token);
    if (token) {
      loadPromotions();
    }
  }, [token]);

  const loadPromotions = async () => {
    try {
      console.log("Fetching promotions with token:", token);
      const response = await fetch(`${API_URL}/promotions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.message || "Failed to fetch promotions");
      }

      const data = await response.json();
      console.log("Promotions data:", data);
      setPromotions(data.data || data || []);
    } catch (error) {
      console.error("Error loading promotions:", error);
      toast.error("Lỗi khi tải promotions: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingPromotion
        ? `${API_URL}/promotions/${editingPromotion._id}`
        : `${API_URL}/promotions`;

      const method = editingPromotion ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Có lỗi xảy ra");
      }

      setShowForm(false);
      resetForm();
      loadPromotions();
      toast.success(
        editingPromotion ? "Cập nhật thành công!" : "Tạo mới thành công!"
      );
    } catch (error) {
      console.error("Error submitting:", error);
      toast.error(error.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xác nhận xóa promotion này?")) return;

    const deletePromise = fetch(`${API_URL}/promotions/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Lỗi khi xóa");
      }
      return response;
    });

    toast.promise(deletePromise, {
      loading: "Đang xóa...",
      success: () => {
        loadPromotions();
        return "Đã xóa thành công!";
      },
      error: (err) => err.message || "Lỗi khi xóa",
    });
  };

  const handleEdit = (promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      code: promotion.code,
      description: promotion.description,
      type: promotion.type,
      value: promotion.value,
      minOrderValue: promotion.minOrderValue || "",
      maxDiscount: promotion.maxDiscount || "",
      startDate: promotion.startDate?.slice(0, 10) || "",
      endDate: promotion.endDate?.slice(0, 10) || "",
      usageLimit: promotion.usageLimit || "",
      status: promotion.status,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      type: "percentage",
      value: "",
      minOrderValue: "",
      maxDiscount: "",
      startDate: "",
      endDate: "",
      usageLimit: "",
      status: "active",
    });
    setEditingPromotion(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#007980] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#333",
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "0 10px 25px rgba(0, 121, 128, 0.15)",
          },
          success: {
            iconTheme: {
              primary: "#007980",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#007980] to-[#005f65] bg-clip-text text-transparent">
            Quản Lý Promotion
          </h1>
          <p className="text-gray-600 mt-2">
            Tạo và quản lý mã khuyến mãi cho khách hàng
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-[#007980] to-[#005f65] text-white rounded-xl hover:shadow-lg hover:shadow-[#007980]/30 transition-all duration-200 flex items-center gap-2 font-medium"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Tạo Mới
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Mã Code
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Mô tả
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Giá trị
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Sử dụng
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {promotions.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-16 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center gap-3">
                    <svg
                      className="w-16 h-16 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    <p className="text-lg font-medium">Chưa có promotion nào</p>
                    <p className="text-sm">
                      Nhấn "Tạo Mới" để thêm promotion đầu tiên
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              promotions.map((promo) => (
                <tr
                  key={promo._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="font-bold text-[#007980] bg-[#007980]/10 px-3 py-1.5 rounded-lg">
                      {promo.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {promo.description}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">
                      {promo.type === "percentage"
                        ? `${promo.value}%`
                        : `${promo.value.toLocaleString()}đ`}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {promo.usageCount || 0} / {promo.usageLimit || "∞"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        promo.status === "active"
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {promo.status === "active"
                        ? "Đang hoạt động"
                        : "Tạm dừng"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button
                      onClick={() => handleEdit(promo)}
                      className="text-[#007980] hover:text-[#005f65] font-medium hover:underline transition-colors"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(promo._id)}
                      className="text-red-600 hover:text-red-700 font-medium hover:underline transition-colors"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingPromotion ? "Sửa" : "Tạo"} Promotion
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mã *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Mô tả *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Loại *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Cố định (VND)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Giá trị *
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Đơn tối thiểu (VND)
                  </label>
                  <input
                    type="number"
                    value={formData.minOrderValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minOrderValue: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Giảm tối đa (VND)
                  </label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) =>
                      setFormData({ ...formData, maxDiscount: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ngày bắt đầu *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ngày kết thúc *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Số lần sử dụng tối đa
                </label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, usageLimit: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Để trống = không giới hạn"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#007980] hover:bg-[#005f65] text-white rounded-lg font-medium transition-colors"
                >
                  {editingPromotion ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionManagement;
