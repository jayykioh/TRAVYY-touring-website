import React, { useMemo, useState } from "react";

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

  const handleSendOffer = async () => {
    const input = window.prompt("Nhập giá đề xuất (VND)", displayAmount || "0");
    if (input == null) return;
    const amount = Number(String(input).replace(/[^0-9.-]+/g, "")) || 0;

    try {
      const ok = await onSendOffer({ amount });
      if (!ok) alert("Gửi đề xuất thất bại. Vui lòng thử lại.");
    } catch (err) {
      alert(err?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const handleAgree = async () => {
    setAgreeing(true);
    try {
      const ok = await onAgree();
      if (!ok) alert("Đồng ý thất bại. Vui lòng thử lại.");
    } catch (err) {
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
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
                onClick={handleSendOffer}
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
                onClick={handleSendOffer}
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
    </div>
  );
};

export default PriceAgreementCard;
