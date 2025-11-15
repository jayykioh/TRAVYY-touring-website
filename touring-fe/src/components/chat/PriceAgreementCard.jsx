import React, { useMemo, useState } from 'react';
import { Check, X, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

// Lightweight PriceAgreementCard used by traveller/guide chat components.
// Props:
// - requestDetails: object with initialBudget/latestOffer/messages etc.
// - userRole: 'user' | 'guide'
// - onSendOffer({amount}) => Promise<boolean>
// - onAgree() => Promise<boolean>
// - loading: boolean
const PriceAgreementCard = ({
  requestDetails = {},
  userRole = "user",
  onSendOffer = async () => true,
  onAgree = async () => true,
  loading = false,
}) => {
  const PRIMARY = "#02A0AA";
  const [agreeing, setAgreeing] = useState(false);
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [offerInput, setOfferInput] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);
  

  const latestOffer = requestDetails?.latestOffer;
  const initialBudget = requestDetails?.initialBudget;
  const agreement = requestDetails?.agreement;

  const displayAmount = useMemo(() => {
    if (latestOffer?.amount) return latestOffer.amount;
    if (initialBudget?.amount) return initialBudget.amount;
    return null;
  }, [latestOffer, initialBudget]);

  const userAgreed = useMemo(() => agreement?.userAgreed || false, [agreement]);
  const guideAgreed = useMemo(
    () => agreement?.guideAgreed || false,
    [agreement]
  );
  const bothAgreed = useMemo(
    () => userAgreed && guideAgreed,
    [userAgreed, guideAgreed]
  );

  // Format number - remove non-digits
  const formatNumber = (str) => {
    return str.replace(/[^0-9]/g, '');
  };

  // Display formatted number with thousands separator
  const getDisplayFormattedNumber = (str) => {
    const cleaned = formatNumber(str);
    return cleaned ? parseInt(cleaned).toLocaleString('vi-VN') : '';
  };

  const handleSendOffer = async () => {
    const cleanedAmount = formatNumber(offerInput);
    const amount = Number(cleanedAmount) || 0;
    
    if (!amount || amount <= 0) {
      toast.error('Vui lòng nhập số tiền > 0');
      return;
    }

    setSubmittingOffer(true);
    try {
      const success = await onSendOffer({ amount });
      if (success) {
        toast.success(`Đã gửi đề xuất: ${amount.toLocaleString('vi-VN')} VND`);
        setShowOfferDialog(false);
        setOfferInput('');
      } else {
        toast.error('Gửi đề xuất thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      toast.error(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleAgree = async () => {
    setAgreeing(true);
    try {
      const ok = await onAgree();
      if (!ok) toast.error("Đồng ý thất bại. Vui lòng thử lại.");
    } catch (err) {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setAgreeing(false);
    }
  };

  return (
    <div
      className="p-4 rounded-xl shadow-sm border"
      style={{
        borderColor: "#bfe8eb",
        background:
          "linear-gradient(90deg, rgba(2,160,170,0.06), rgba(50,198,207,0.06))",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <span>Thỏa thuận giá</span>
            {bothAgreed && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                Đã xác nhận
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500">
            {requestDetails?.title || ""}
          </div>
        </div>
        <div className="text-right">
          {displayAmount ? (
            <div className="text-lg font-bold" style={{ color: PRIMARY }}>
              {Number(displayAmount).toLocaleString("vi-VN")} VND
            </div>
          ) : (
            <div className="text-xs text-gray-400">Chưa có giá</div>
          )}
        </div>
      </div>

      {/* Agreement Status */}
      {agreement && (
        <div className="mb-3 space-y-2 p-2 rounded-lg bg-white/60">
          {/* Dòng 1 */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-4 h-4 rounded-full ${
                userAgreed ? "bg-green-500" : "bg-gray-300"
              }`}
              aria-hidden="true"
            />
            <span className="text-xs text-gray-700">
              {userRole === "user" ? "Bạn" : "Khách hàng"}{" "}
              {userAgreed ? "đã đồng ý" : "chưa đồng ý"}
            </span>
          </div>
          {/* Dòng 2 */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-4 h-4 rounded-full ${
                guideAgreed ? "bg-green-500" : "bg-gray-300"
              }`}
              aria-hidden="true"
            />
            <span className="text-xs text-gray-700">
              {userRole === "user" ? "Hướng dẫn viên" : "Bạn"}{" "}
              {guideAgreed ? "đã đồng ý" : "chưa đồng ý"}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          {userRole === "guide" ? (
            <>
              {/* Gợi ý giá: outline chủ đạo */}
              <button
                onClick={() => setShowOfferDialog(true)}
                disabled={loading || agreeing}
                className="px-4 h-9 rounded-full text-sm font-semibold border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  borderColor: PRIMARY,
                  color: PRIMARY,
                }}
                onMouseEnter={(e) => {
                  if (!loading && !agreeing)
                    e.currentTarget.style.backgroundColor = "#ecfeff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Gợi ý giá
              </button>

              {/* Đồng ý: solid chủ đạo */}
              <button
                onClick={handleAgree}
                disabled={loading || agreeing || guideAgreed}
                className="px-4 h-9 rounded-full text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ backgroundColor: PRIMARY }}
                onMouseEnter={(e) => {
                  if (!loading && !agreeing && !guideAgreed)
                    e.currentTarget.style.backgroundColor = "#0d8e96";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = PRIMARY;
                }}
              >
                {agreeing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang xử lý...
                  </>
                ) : guideAgreed ? (
                  "Đã đồng ý"
                ) : (
                  "Đồng ý"
                )}
              </button>

              {bothAgreed && (
                <span className="text-xs text-green-600 font-medium">
                  Cả hai bên đã đồng ý, chờ thanh toán
                </span>
              )}
            </>
          ) : (
            <>
              {/* Đề xuất giá (user): outline chủ đạo */}
              <button
                onClick={() => setShowOfferDialog(true)}
                disabled={loading}
                className="px-4 h-9 rounded-full text-sm font-semibold border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  borderColor: PRIMARY,
                  color: PRIMARY,
                }}
                onMouseEnter={(e) => {
                  if (!loading)
                    e.currentTarget.style.backgroundColor = "#ecfeff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Đề xuất giá
              </button>

              {/* Đồng ý (user): solid xanh dương đậm × chủ đạo */}
              <button
                onClick={handleAgree}
                disabled={loading || agreeing || userAgreed}
                className="px-4 h-9 rounded-full text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ backgroundColor: PRIMARY }}
                onMouseEnter={(e) => {
                  if (!loading && !agreeing && !userAgreed)
                    e.currentTarget.style.backgroundColor = "#0d8e96";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = PRIMARY;
                }}
              >
                {agreeing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang xử lý...
                  </>
                ) : userAgreed ? (
                  "Đã đồng ý"
                ) : (
                  "Đồng ý"
                )}
              </button>

              {bothAgreed && (
                <span className="text-xs text-green-600 font-medium">
                  Sẵn sàng thanh toán
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Offer Dialog */}
      {showOfferDialog && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-2 sm:slide-in-from-center">
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-teal-600" />
                Đề xuất giá
              </h2>
              <button
                onClick={() => {
                  setShowOfferDialog(false);
                  setOfferInput('');
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Số tiền (VND)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={getDisplayFormattedNumber(offerInput)}
                    onChange={(e) => setOfferInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendOffer();
                      }
                    }}
                    placeholder="Nhập số tiền (VD: 2000000)"
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:bg-gray-700 dark:text-white outline-none transition-all"
                    autoFocus
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    VND
                  </div>
                </div>
                {displayAmount && (
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    📌 Ngân sách ban đầu: <span className="font-semibold">{displayAmount.toLocaleString('vi-VN')} VND</span>
                  </p>
                )}
              </div>

              {/* Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  💡 <span className="font-medium">Mẹo:</span> Nhập số tiền dễ dàng mà không cần chấm phẩy hoặc dấu cách
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <button
                onClick={() => {
                  setShowOfferDialog(false);
                  setOfferInput('');
                }}
                className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSendOffer}
                disabled={submittingOffer || !offerInput.trim()}
                className="flex-1 px-4 py-3 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {submittingOffer ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Gửi...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Gửi đề xuất
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceAgreementCard;
