import { useState, useEffect, useContext } from 'react';
import { toast } from 'sonner';
import { AuthCtx } from '../auth/context';

const VoucherSelector = ({ totalAmount, tourId, onVoucherApply }) => {
  const [showModal, setShowModal] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [loading, setLoading] = useState(false);
  const { withAuth } = useContext(AuthCtx);

  // Load khi mở modal
  useEffect(() => {
    if (showModal) {
      loadPromotions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal]);

  // ✅ Lắng nghe event refresh
  useEffect(() => {
    const handleRefresh = () => {
      if (showModal) loadPromotions();
    };
    window.addEventListener('promotion-changed', handleRefresh);
    return () => window.removeEventListener('promotion-changed', handleRefresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal]);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      console.log('🎫 VoucherSelector: Loading promotions...');
      const response = withAuth 
        ? await withAuth('/api/promotions/active')
        : await fetch('/api/promotions/active').then(r => r.json());
      console.log('✅ VoucherSelector: Loaded promotions:', response.data?.length);
      setPromotions(response.data || []);
    } catch (error) {
      console.error('❌ VoucherSelector: Error loading promotions:', error);
      toast.error('Không thể tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVoucher = async (promo) => {
    if (!totalAmount || totalAmount <= 0) {
      toast.error('Vui lòng chọn tour trước');
      return;
    }

    try {
      const result = withAuth
        ? await withAuth('/api/promotions/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: promo.code,
              totalAmount,
              ...(tourId && { tourId })
            })
          })
        : await fetch('/api/promotions/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: promo.code,
              totalAmount,
              ...(tourId && { tourId })
            })
          }).then(r => r.json());
      
      if (result.valid) {
        setSelectedPromo(promo);
        setAppliedPromo(result);
        setShowModal(false);
        onVoucherApply(result.promotion, result.discount);
        toast.success(`Áp dụng voucher thành công! Giảm ${result.discount.toLocaleString('vi-VN')}đ`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể áp dụng voucher');
    }
  };

  const handleRemoveVoucher = () => {
    setSelectedPromo(null);
    setAppliedPromo(null);
    onVoucherApply(null);
    toast.success('Đã xóa voucher');
  };

  const formatValue = (type, value) => {
    if (type === 'percentage') return `Giảm ${value}%`;
    return `Giảm ${value.toLocaleString('vi-VN')}đ`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  return (
    <>
      {/* Voucher Button (giống Shopee) */}
      <div 
        onClick={() => setShowModal(true)}
        className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
            </svg>
            <div>
              {appliedPromo ? (
                <div>
                  <p className="font-medium text-gray-900">{selectedPromo.code}</p>
                  <p className="text-sm text-green-600">
                    Tiết kiệm {appliedPromo.discount.toLocaleString('vi-VN')}đ
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-gray-900">Chọn Voucher</p>
                  <p className="text-sm text-gray-500">Nhận ngay ưu đãi</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {appliedPromo && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveVoucher();
                }}
                className="text-red-500 text-sm hover:underline"
              >
                Xóa
              </button>
            )}
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Modal Voucher List (giống Shopee) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-2xl sm:rounded-lg max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold">Chọn Voucher</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Voucher List */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Đang tải...</p>
                </div>
              ) : promotions.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-gray-500 mt-4">Chưa có voucher khả dụng</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {promotions.map((promo) => {
                    const isSelected = selectedPromo?._id === promo._id;
                    const canApply = totalAmount >= promo.minOrderValue;

                    return (
                      <div
                        key={promo._id}
                        className={`border rounded-lg p-4 transition-all ${
                          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                        } ${!canApply ? 'opacity-50' : 'cursor-pointer'}`}
                        onClick={() => canApply && handleSelectVoucher(promo)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-2 rounded">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
                            </svg>
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-bold text-gray-900">{promo.code}</p>
                                <p className="text-sm text-gray-600 mt-1">{promo.description}</p>
                              </div>
                              {isSelected && (
                                <svg className="w-6 h-6 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                </svg>
                              )}
                            </div>

                            {/* Value */}
                            <div className="bg-orange-50 rounded px-2 py-1 inline-block mt-2">
                              <span className="text-orange-600 font-bold text-sm">
                                {formatValue(promo.type, promo.value)}
                              </span>
                            </div>

                            {/* Conditions */}
                            <div className="mt-2 space-y-1 text-xs text-gray-500">
                              {promo.minOrderValue > 0 && (
                                <p>• Đơn tối thiểu: {promo.minOrderValue.toLocaleString('vi-VN')}đ</p>
                              )}
                              {promo.maxDiscount && (
                                <p>• Giảm tối đa: {promo.maxDiscount.toLocaleString('vi-VN')}đ</p>
                              )}
                              <p>• HSD: {formatDate(promo.endDate)}</p>
                            </div>

                            {/* Can't apply message */}
                            {!canApply && (
                              <p className="text-xs text-red-500 mt-2">
                                Đơn hàng chưa đủ điều kiện
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t p-4">
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VoucherSelector;
