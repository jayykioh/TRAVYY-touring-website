import { useState } from "react";
import { API_URL } from "@/config/api";
import PropTypes from "prop-types";
import { useAuth } from "../auth/context";

const BankInfoModal = ({ isOpen, onClose, refundId, onSuccess }) => {
  // Always call hooks at the top level, before any early returns
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
    branchName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  console.log("🏦 BankInfoModal render:", {
    isOpen,
    refundId,
    refundIdType: typeof refundId,
    refundIdLength: refundId?.length,
  });

  // Don't use early return - always render the component
  // Control visibility with conditional rendering of JSX instead

  const VIETNAMESE_BANKS = [
    "Vietcombank - Ngân hàng Ngoại thương Việt Nam",
    "VietinBank - Ngân hàng Công thương Việt Nam",
    "BIDV - Ngân hàng Đầu tư và Phát triển Việt Nam",
    "Agribank - Ngân hàng Nông nghiệp và Phát triển Nông thôn",
    "Techcombank - Ngân hàng Kỹ thương Việt Nam",
    "ACB - Ngân hàng Á Châu",
    "MB Bank - Ngân hàng Quân đội",
    "VPBank - Ngân hàng Việt Nam Thịnh Vượng",
    "TPBank - Ngân hàng Tiên Phong",
    "Sacombank - Ngân hàng TMCP Sài Gòn Thương Tín",
    "HDBank - Ngân hàng Phát triển Thành phố Hồ Chí Minh",
    "SHB - Ngân hàng Sài Gòn - Hà Nội",
    "VIB - Ngân hàng Quốc tế",
    "MSB - Ngân hàng Hàng Hải",
    "OCB - Ngân hàng Phương Đông",
    "SeABank - Ngân hàng Đông Nam Á",
    "LienVietPostBank - Ngân hàng Bưu điện Liên Việt",
    "PVcomBank - Ngân hàng Đại Chúng",
    "BacABank - Ngân hàng Bắc Á",
    "VietCapitalBank - Ngân hàng Bản Việt",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (
      !formData.bankName ||
      !formData.accountNumber ||
      !formData.accountName
    ) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    // Validate account number (only digits, 9-14 characters for Vietnamese banks)
    if (!/^\d{9,14}$/.test(formData.accountNumber)) {
      setError("Số tài khoản không hợp lệ (9-14 chữ số)");
      return;
    }

    setLoading(true);

    try {
      // Get token from auth context (user.token or user.accessToken)
      const token = user?.token || user?.accessToken;

      console.log("🔑 BankInfoModal - Token check:", {
        hasUser: !!user,
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : "NO TOKEN",
      });

      if (!token) {
        setError("Vui lòng đăng nhập lại");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/refunds/${refundId}/bank-info`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể gửi thông tin ngân hàng");
      }

      onSuccess?.();
      onClose();

      // Reset form
      setFormData({
        bankName: "",
        accountNumber: "",
        accountName: "",
        branchName: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Don't return null - always render but conditionally show/hide
  console.log("🏦 Rendering modal with isOpen:", isOpen);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Center modal */}
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        {/* Modal panel */}
        <div className="relative z-10 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#007980] to-[#005f65] px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Cung Cấp Thông Tin Ngân Hàng
              </h3>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
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
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <div className="space-y-4">
              {/* Info Alert */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-blue-800">
                      Yêu cầu hoàn tiền đã được chấp nhận
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Vui lòng cung cấp thông tin tài khoản ngân hàng để nhận
                      tiền hoàn. Tiền sẽ được chuyển vào tài khoản này trong 3-5
                      ngày làm việc.
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Bank Name */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Ngân Hàng <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007980] focus:border-[#007980] transition-colors"
                    required
                  >
                    <option value="">-- Chọn ngân hàng --</option>
                    {VIETNAMESE_BANKS.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Số Tài Khoản <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007980] focus:border-[#007980] transition-colors"
                    placeholder="9-14 chữ số"
                    pattern="[0-9]{9,14}"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Nhập đúng số tài khoản như trên thẻ ATM hoặc app ngân hàng
                  </p>
                </div>

                {/* Account Name */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Tên Chủ Tài Khoản <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="accountName"
                    value={formData.accountName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007980] focus:border-[#007980] transition-colors uppercase"
                    placeholder="NGUYEN VAN A"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tên chủ tài khoản phải khớp với thông tin trên thẻ ngân hàng
                  </p>
                </div>

                {/* Branch Name (Optional) */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Chi Nhánh (Không bắt buộc)
                  </label>
                  <input
                    type="text"
                    name="branchName"
                    value={formData.branchName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007980] focus:border-[#007980] transition-colors"
                    placeholder="VD: Chi nhánh Hà Nội, Chi nhánh TP.HCM"
                  />
                </div>

                {/* Security Note */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-xs text-yellow-800">
                      <strong>Lưu ý bảo mật:</strong> Chỉ cung cấp thông tin tài
                      khoản thật của bạn. Không chia sẻ mã PIN hoặc mật khẩu
                      ngân hàng.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#007980] to-[#005f65] text-white rounded-lg hover:from-[#005f65] hover:to-[#004a50] font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Xác Nhận Gửi
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

BankInfoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  refundId: PropTypes.string.isRequired,
  onSuccess: PropTypes.func,
};

export default BankInfoModal;
