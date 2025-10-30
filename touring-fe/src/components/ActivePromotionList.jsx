import { useState, useEffect, useContext } from 'react';
import { Copy, Tag } from 'lucide-react';
import { AuthCtx } from '../auth/context';

const ActivePromotionList = ({ onSelectCode }) => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const { withAuth } = useContext(AuthCtx);

  useEffect(() => {
    loadPromotions();

    // ✅ Lắng nghe event thay vì context
    const handleRefresh = () => loadPromotions();
    window.addEventListener('promotion-changed', handleRefresh);
    return () => window.removeEventListener('promotion-changed', handleRefresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPromotions = async () => {
    try {
      console.log('🎫 ActivePromotionList: Loading with auth');
      const response = withAuth 
        ? await withAuth('/api/promotions/active')
        : await fetch('/api/promotions/active').then(r => r.json());
      console.log('✅ ActivePromotionList: Got promotions:', response.data?.length);
      setPromotions(response.data || []);
    } catch (error) {
      console.error('❌ ActivePromotionList: Load failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    if (onSelectCode) onSelectCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) return <div className="text-center py-4 text-gray-600">Đang tải...</div>;
  if (promotions.length === 0) return null;

  return (
    <div className="rounded-2xl p-6 mb-6 backdrop-blur-xl bg-white/60 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-center w-10 h-10 bg-emerald-500 rounded-lg">
          <Tag className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Mã giảm giá khả dụng</h3>
          <p className="text-sm text-gray-600">{promotions.length} mã đang hoạt động</p>
        </div>
      </div>

      {/* Promotion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promotions.map((promo) => {
          const isCopied = copiedCode === promo.code;
          const isExpiringSoon = () => {
            const endDate = new Date(promo.endDate);
            const today = new Date();
            const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
            return daysLeft <= 3 && daysLeft > 0;
          };
          
          return (
            <div
              key={promo._id}
              className="relative rounded-lg p-4 bg-white border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all"
            >
              {/* Expiring Badge */}
              {isExpiringSoon() && (
                <span className="absolute -top-2 -right-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                  ⚡ Sắp hết hạn
                </span>
              )}
              
              <div className="space-y-3">
                {/* Code and Copy Button */}
                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500 rounded-lg">
                    <span className="font-bold text-white text-sm tracking-wide">
                      {promo.code}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => copyCode(promo.code)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isCopied
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    <Copy className="w-3 h-3" />
                    {isCopied ? 'Đã copy' : 'Copy'}
                  </button>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-700 line-clamp-2 min-h-[40px]">
                  {promo.description}
                </p>

                {/* Value */}
                <div className="inline-flex items-center py-1.5 px-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <span className="font-bold text-emerald-600 text-sm">
                    {promo.type === 'percentage'
                      ? `Giảm ${promo.value}%`
                      : `Giảm ${promo.value.toLocaleString()}₫`}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1 text-xs text-gray-600 pt-2 border-t border-gray-100">
                  {promo.minOrderValue > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400">•</span>
                      <span>Đơn tối thiểu: <span className="font-semibold text-gray-900">{promo.minOrderValue.toLocaleString()}₫</span></span>
                    </div>
                  )}
                  
                  {promo.maxDiscount && promo.type === 'percentage' && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400">•</span>
                      <span>Giảm tối đa: <span className="font-semibold text-gray-900">{promo.maxDiscount.toLocaleString()}₫</span></span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">•</span>
                    <span>HSD: {new Date(promo.endDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Footer note */}
      <div className="mt-5 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          💡 Nhấn "Copy" để sao chép mã, sau đó áp dụng tại trang thanh toán
        </p>
      </div>
    </div>
  );
};

export default ActivePromotionList;
