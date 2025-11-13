import { useState, useEffect } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useNotifications } from "../context/NotificationContext";
import toast, { Toaster } from "react-hot-toast";
import Modal from "../components/Common/Modal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const PromotionManagement = () => {
  const { token } = useAdminAuth();
  const { notify } = useNotifications();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    promotion: null,
  });

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

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    console.log("PromotionManagement - token:", token);
    if (token) {
      loadPromotions();
    }
  }, [token]);

  const loadPromotions = async () => {
    try {
      console.log("Fetching promotions with token:", token);
      const response = await fetch(`${API_URL}/api/promotions`, {
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
      toast.error("Error loading promotions: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Validation function
  const validateForm = () => {
    const errors = {};

    // Validate code
    if (!formData.code || formData.code.trim() === "") {
      errors.code = "Promotion code is required";
    }

    // Validate description
    if (!formData.description || formData.description.trim() === "") {
      errors.description = "Description is required";
    }

    // Validate value
    const value = parseFloat(formData.value);
    if (!formData.value || formData.value === "") {
      errors.value = "Value is required";
    } else if (isNaN(value)) {
      errors.value = "Value must be a number";
    } else if (value < 0) {
      errors.value = "Value cannot be negative";
    } else if (formData.type === "percentage" && value > 100) {
      errors.value = "Percentage value cannot exceed 100%";
    } else if (formData.type === "percentage" && value === 0) {
      errors.value = "Percentage value must be greater than 0%";
    }

    // Validate minOrderValue
    if (formData.minOrderValue) {
      const minOrder = parseFloat(formData.minOrderValue);
      if (isNaN(minOrder)) {
        errors.minOrderValue = "Minimum order value must be a number";
      } else if (minOrder < 0) {
        errors.minOrderValue = "Minimum order value cannot be negative";
      }
    }

    // Validate maxDiscount
    if (formData.maxDiscount) {
      const maxDisc = parseFloat(formData.maxDiscount);
      if (isNaN(maxDisc)) {
        errors.maxDiscount = "Maximum discount must be a number";
      } else if (maxDisc < 0) {
        errors.maxDiscount = "Maximum discount cannot be negative";
      }
    }

    // Validate usageLimit
    if (formData.usageLimit) {
      const limit = parseInt(formData.usageLimit);
      if (isNaN(limit)) {
        errors.usageLimit = "Usage limit must be an integer";
      } else if (limit < 0) {
        errors.usageLimit = "Usage limit cannot be negative";
      } else if (limit === 0) {
        errors.usageLimit = "Usage limit must be greater than 0";
      }
    }

    // Validate dates
    if (!formData.startDate) {
      errors.startDate = "Start date is required";
    }
    if (!formData.endDate) {
      errors.endDate = "End date is required";
    }
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) {
        errors.endDate = "End date must be after start date";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submit
    if (!validateForm()) {
      toast.error("Please check the entered information");
      return;
    }

    try {
      const url = editingPromotion
        ? `${API_URL}/api/promotions/${editingPromotion._id}`
        : `${API_URL}/api/promotions`;

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
        throw new Error(error.message || "An error occurred");
      }

      const result = await response.json();

      setShowForm(false);
      resetForm();
      loadPromotions();

      const successMessage = editingPromotion
        ? `Updated promotion ${formData.code}`
        : `Created new promotion ${formData.code}`;

      toast.success(successMessage);
      notify.promotion(
        editingPromotion ? "Update Promotion" : "New Promotion",
        successMessage
      );
    } catch (error) {
      console.error("Error submitting:", error);
      toast.error(error.message || "An error occurred");
      notify.error("Promotion Error", error.message || "Cannot save promotion");
    }
  };

  const handleDelete = async (id) => {
    const promotionToDelete = promotions.find((p) => p._id === id);
    setDeleteModal({ isOpen: true, promotion: promotionToDelete });
  };

  const confirmDelete = async () => {
    const id = deleteModal.promotion._id;
    const promotionCode = deleteModal.promotion.code;

    const deletePromise = fetch(`${API_URL}/api/promotions/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error deleting");
      }
      return response;
    });

    toast.promise(deletePromise, {
      loading: "Deleting...",
      success: () => {
        loadPromotions();
        setDeleteModal({ isOpen: false, promotion: null });
        notify.promotion(
          "Delete Promotion",
          `Deleted promotion ${promotionCode || id}`
        );
        return "Deleted successfully!";
      },
      error: (err) => {
        setDeleteModal({ isOpen: false, promotion: null });
        notify.error(
          "Delete Promotion Error",
          err.message || "Cannot delete promotion"
        );
        return err.message || "Error deleting";
      },
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
    setFormErrors({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#007980] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data...</p>
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
            Promotion Management
          </h1>
          <p className="text-gray-600 mt-2">
            Create and manage promotional codes for customers
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
          Create New
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Usage
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                Actions
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
                    <p className="text-lg font-medium">No promotions yet</p>
                    <p className="text-sm">
                      Click "Create New" to add your first promotion
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
                      {promo.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button
                      onClick={() => handleEdit(promo)}
                      className="text-[#007980] hover:text-[#005f65] font-medium hover:underline transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(promo._id)}
                      className="text-red-600 hover:text-red-700 font-medium hover:underline transition-colors"
                    >
                      Delete
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
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
        >
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingPromotion ? "Edit" : "Create"} Promotion
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      });
                      if (formErrors.code) {
                        setFormErrors({ ...formErrors, code: null });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg uppercase ${
                      formErrors.code ? "border-red-500" : ""
                    }`}
                    required
                  />
                  {formErrors.code && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.code}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Status
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
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    if (formErrors.description) {
                      setFormErrors({ ...formErrors, description: null });
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    formErrors.description ? "border-red-500" : ""
                  }`}
                  rows={2}
                  required
                />
                {formErrors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        type: e.target.value,
                        value: "",
                      });
                      if (formErrors.value) {
                        setFormErrors({ ...formErrors, value: null });
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (VND)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Value *{" "}
                    {formData.type === "percentage" ? "(0-100%)" : "(VND)"}
                  </label>
                  <input
                    type="number"
                    step={formData.type === "percentage" ? "0.01" : "1000"}
                    min="0"
                    max={formData.type === "percentage" ? "100" : undefined}
                    value={formData.value}
                    onChange={(e) => {
                      setFormData({ ...formData, value: e.target.value });
                      if (formErrors.value) {
                        setFormErrors({ ...formErrors, value: null });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      formErrors.value ? "border-red-500" : ""
                    }`}
                    required
                  />
                  {formErrors.value && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.value}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Min Order Value (VND)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    value={formData.minOrderValue}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        minOrderValue: e.target.value,
                      });
                      if (formErrors.minOrderValue) {
                        setFormErrors({ ...formErrors, minOrderValue: null });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      formErrors.minOrderValue ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.minOrderValue && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.minOrderValue}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Max Discount (VND)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    value={formData.maxDiscount}
                    onChange={(e) => {
                      setFormData({ ...formData, maxDiscount: e.target.value });
                      if (formErrors.maxDiscount) {
                        setFormErrors({ ...formErrors, maxDiscount: null });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      formErrors.maxDiscount ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.maxDiscount && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.maxDiscount}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => {
                      setFormData({ ...formData, startDate: e.target.value });
                      if (formErrors.startDate) {
                        setFormErrors({ ...formErrors, startDate: null });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      formErrors.startDate ? "border-red-500" : ""
                    }`}
                    required
                  />
                  {formErrors.startDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.startDate}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => {
                      setFormData({ ...formData, endDate: e.target.value });
                      if (formErrors.endDate) {
                        setFormErrors({ ...formErrors, endDate: null });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      formErrors.endDate ? "border-red-500" : ""
                    }`}
                    required
                  />
                  {formErrors.endDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.endDate}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Max Usage Limit
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={formData.usageLimit}
                  onChange={(e) => {
                    setFormData({ ...formData, usageLimit: e.target.value });
                    if (formErrors.usageLimit) {
                      setFormErrors({ ...formErrors, usageLimit: null });
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    formErrors.usageLimit ? "border-red-500" : ""
                  }`}
                  placeholder="Leave empty = unlimited"
                />
                {formErrors.usageLimit && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.usageLimit}
                  </p>
                )}
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
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#007980] hover:bg-[#005f65] text-white rounded-lg font-medium transition-colors"
                >
                  {editingPromotion ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, promotion: null })}
        onConfirm={confirmDelete}
        title="Confirm delete promotion"
        type="warning"
        confirmText="Delete"
        cancelText="Cancel"
      >
        <p className="text-gray-600">
          Are you sure you want to delete promotion{" "}
          <span className="font-semibold text-gray-900">
            {deleteModal.promotion?.code}
          </span>
          ?
        </p>
        <p className="text-sm text-gray-500 mt-2">
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default PromotionManagement;
