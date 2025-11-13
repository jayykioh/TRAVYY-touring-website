import React, { useMemo } from 'react';

// Lightweight PriceAgreementCard used by traveller/guide chat components.
// Props:
// - requestDetails: object with initialBudget/latestOffer/messages etc.
// - userRole: 'user' | 'guide'
// - onSendOffer(amount) => Promise
// - onAgree() => Promise
// - onProceedToPayment() => void (optional)
// - loading: boolean
const PriceAgreementCard = ({
  requestDetails = {},
  userRole = 'user',
  onSendOffer = async () => true,
  onAgree = async () => true,
  onProceedToPayment,
  loading = false,
}) => {
  const latestOffer = requestDetails?.latestOffer;
  const initialBudget = requestDetails?.initialBudget;

  const displayAmount = useMemo(() => {
    if (latestOffer?.amount) return latestOffer.amount;
    if (initialBudget?.amount) return initialBudget.amount;
    return null;
  }, [latestOffer, initialBudget]);

  const handleSendOffer = async () => {
    // naive prompt for quick development; callers should replace with real UI
    const input = window.prompt('Enter offer amount (VND)', displayAmount || '0');
    if (!input) return;
    const amount = Number(input.replace(/[^0-9.-]+/g, '')) || 0;
    await onSendOffer({ amount });
  };

  const handleAgree = async () => {
    await onAgree();
  };

  return (
    <div className="p-3 bg-white border rounded-xl shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Thỏa thuận giá</div>
          <div className="text-xs text-gray-500">{requestDetails?.title || ''}</div>
        </div>
        <div className="text-right">
          {displayAmount ? (
            <div className="text-sm font-bold text-teal-600">{displayAmount.toLocaleString('vi-VN')} VND</div>
          ) : (
            <div className="text-xs text-gray-400">Chưa có giá</div>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {userRole === 'guide' ? (
          <>
            <button
              onClick={handleSendOffer}
              disabled={loading}
              className="px-3 py-1 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm"
            >
              Gợi ý giá
            </button>
            <button
              onClick={handleAgree}
              disabled={loading}
              className="px-3 py-1 rounded-md bg-green-600 text-white text-sm"
            >
              Đồng ý
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleSendOffer}
              disabled={loading}
              className="px-3 py-1 rounded-md bg-teal-500 text-white text-sm"
            >
              Đề xuất giá
            </button>
            {onProceedToPayment && (
              <button
                onClick={onProceedToPayment}
                className="px-3 py-1 rounded-md bg-orange-500 text-white text-sm"
              >
                Thanh toán
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PriceAgreementCard;
