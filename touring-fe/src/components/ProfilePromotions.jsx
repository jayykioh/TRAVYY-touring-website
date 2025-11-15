import { useState, useEffect, useContext } from "react";
import logger from '@/utils/logger';
import { toast } from "sonner";
import { Copy, Check, Tag, Calendar, Percent } from "lucide-react";
import { AuthCtx } from "@/auth/context";

export default function ProfilePromotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const { withAuth } = useContext(AuthCtx);

  useEffect(() => {
    fetchPromotions();

    // ✅ Listen event refresh
    const handleRefresh = () => fetchPromotions();
    window.addEventListener('promotion-changed', handleRefresh);
    return () => window.removeEventListener('promotion-changed', handleRefresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPromotions = async () => {
    try {
      logger.debug('🎫 ProfilePromotions: Starting fetch');
      logger.debug('🎫 withAuth function exists?', typeof withAuth === 'function');
      
      const res = withAuth 
        ? await withAuth('/api/promotions/active')
        : await fetch('/api/promotions/active').then(r => r.json());
      
      logger.debug('✅ ProfilePromotions: Response received:', res);
      logger.debug('✅ Data structure:', {
        success: res?.success,
        dataLength: res?.data?.length,
        dataType: typeof res?.data,
        isArray: Array.isArray(res?.data)
      });
      
      if (res && res.data) {
        logger.debug('✅ Setting promotions:', res.data.length, 'items');
        setPromotions(res.data);
      } else {
        logger.warn('⚠️ No data in response:', res);
        setPromotions([]);
      }
    } catch (error) {
      logger.error("❌ ProfilePromotions: Load failed:", error);
      logger.error("❌ Error details:", {
        message: error.message,
        response: error.response,
        stack: error.stack
      });
      toast.error("Không thể tải danh sách mã giảm giá.");
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Đã sao chép mã ${code}!`);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const formatValue = (promo) => {
    return promo.type === "percentage"
      ? `${promo.value}%`
      : `${promo.value.toLocaleString()}đ`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="border rounded-lg p-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {promotions.length === 0 ? (
        <div className="border border-gray-200 rounded-lg p-8 bg-white text-center">
          <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            Chưa có mã giảm giá
          </h3>
          <p className="text-gray-500 text-sm">
            Khi có khuyến mãi, mã giảm giá sẽ xuất hiện tại đây.
          </p>
        </div>
      ) : (
        <>
          {promotions.map((promo) => (
            <div
              key={promo._id}
              className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <Percent className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {promo.description}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Giảm {formatValue(promo)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    {promo.minOrderValue > 0 && (
                      <div className="flex items-center gap-1">
                        <span>•</span>
                        <span>
                          Đơn tối thiểu:{" "}
                          <strong className="text-gray-900">
                            {promo.minOrderValue.toLocaleString()}đ
                          </strong>
                        </span>
                      </div>
                    )}
                    {promo.maxDiscount && (
                      <div className="flex items-center gap-1">
                        <span>•</span>
                        <span>
                          Giảm tối đa:{" "}
                          <strong className="text-gray-900">
                            {promo.maxDiscount.toLocaleString()}đ
                          </strong>
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        HSD:{" "}
                        <strong className="text-gray-900">
                          {new Date(promo.endDate).toLocaleDateString("vi-VN")}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 px-3 py-1.5 rounded border border-gray-300 font-mono text-sm font-semibold text-gray-900">
                      {promo.code}
                    </code>
                    <button
                      onClick={() => copyCode(promo.code)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      {copiedCode === promo.code ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Đã sao chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span>💡</span>
              <span>Cách sử dụng</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Chọn tour và thêm vào giỏ hàng</li>
              <li>Nhập mã khuyến mãi tại bước thanh toán</li>
              <li>Nhấn "Áp dụng" để kích hoạt giảm giá</li>
            </ol>
          </div>
        </>
      )}
    </div>
  );
}
