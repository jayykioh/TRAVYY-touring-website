import React, { useMemo, useState } from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';

// Lightweight PriceAgreementCard used by traveller/guide chat components.
// Props:
// - requestDetails: object with initialBudget/latestOffer/messages etc.
// - userRole: 'user' | 'guide'
// - onSendOffer(amount) => Promise
// - onAgree() => Promise
// - loading: boolean
const PriceAgreementCard = ({
  requestDetails = {},
  userRole = 'user',
  onSendOffer = async () => true,
  onAgree = async () => true,
  loading = false,
}) => {
  const [agreeing, setAgreeing] = useState(false);
  const latestOffer = requestDetails?.latestOffer;
  const initialBudget = requestDetails?.initialBudget;
  const agreement = requestDetails?.agreement;

  const displayAmount = useMemo(() => {
    if (latestOffer?.amount) return latestOffer.amount;
    if (initialBudget?.amount) return initialBudget.amount;
    return null;
  }, [latestOffer, initialBudget]);

  const userAgreed = useMemo(() => {
    return agreement?.userAgreed || false;
  }, [agreement]);

  const guideAgreed = useMemo(() => {
    return agreement?.guideAgreed || false;
  }, [agreement]);

  const bothAgreed = useMemo(() => {
    return userAgreed && guideAgreed;
  }, [userAgreed, guideAgreed]);

  const handleSendOffer = async () => {
    // naive prompt for quick development; callers should replace with real UI
    const input = window.prompt('Enter offer amount (VND)', displayAmount || '0');
    if (!input) return;
    const amount = Number(input.replace(/[^0-9.-]+/g, '')) || 0;
    await onSendOffer({ amount });
  };

  const handleAgree = async () => {
    setAgreeing(true);
    try {
      console.log('[PriceAgreementCard] Agreeing to terms');
      const success = await onAgree();
      console.log('[PriceAgreementCard] Agree result:', success);
      if (!success) {
        alert('Đồng ý thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Error agreeing:', err);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setAgreeing(false);
    }
  };

  return (
    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            💰 Thỏa thuận giá
            {bothAgreed && (
              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                <Check className="w-3 h-3" /> Đã xác nhận
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{requestDetails?.title || ''}</div>
        </div>
        <div className="text-right">
          {displayAmount ? (
            <div className="text-lg font-bold text-teal-600 dark:text-teal-400">{displayAmount.toLocaleString('vi-VN')} VND</div>
          ) : (
            <div className="text-xs text-gray-400">Chưa có giá</div>
          )}
        </div>
      </div>

      {/* Agreement Status */}
      {agreement && (
        <div className="mb-3 space-y-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white ${
              userAgreed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}>
              {userAgreed ? <Check className="w-3 h-3" /> : ''}
            </div>
            <span className="text-xs text-gray-700 dark:text-gray-300">
              {userRole === 'user' ? 'Bạn' : 'Khách hàng'} {userAgreed ? '✅ đã đồng ý' : '⏳ chưa đồng ý'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white ${
              guideAgreed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}>
              {guideAgreed ? <Check className="w-3 h-3" /> : ''}
            </div>
            <span className="text-xs text-gray-700 dark:text-gray-300">
              {userRole === 'user' ? 'Tour guide' : 'Bạn'} {guideAgreed ? '✅ đã đồng ý' : '⏳ chưa đồng ý'}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          {userRole === 'guide' ? (
            <>
              <button
                onClick={handleSendOffer}
                disabled={loading || agreeing}
                className="px-3 py-2 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Gợi ý giá
              </button>
              <button
                onClick={handleAgree}
                disabled={loading || agreeing || guideAgreed}
                className="px-3 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
              >
                {agreeing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang xử lý...
                  </>
                ) : guideAgreed ? (
                  <>
                    <Check className="w-4 h-4" /> Đã đồng ý
                  </>
                ) : (
                  'Đồng ý'
                )}
              </button>
              {bothAgreed && (
                <span className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" /> Cả hai bên đã đồng ý, chờ thanh toán
                </span>
              )}
            </>
          ) : (
            <>
              <button
                onClick={handleSendOffer}
                disabled={loading}
                className="px-3 py-2 rounded-md bg-teal-500 text-white text-sm font-medium hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Đề xuất giá
              </button>
              <button
                onClick={handleAgree}
                disabled={loading || agreeing || userAgreed}
                className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
              >
                {agreeing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang xử lý...
                  </>
                ) : userAgreed ? (
                  <>
                    <Check className="w-4 h-4" /> Đã đồng ý
                  </>
                ) : (
                  'Đồng ý'
                )}
              </button>
              {bothAgreed && (
                <span className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" /> Sẵn sàng thanh toán
                </span>
              )}
            </>
          )}
        </div>
        
        {/* Payment button - REMOVED: Now handled by Payment Initiation Card in TravellerChatBox */}
      </div>
    </div>
  );
};

export default PriceAgreementCard;
