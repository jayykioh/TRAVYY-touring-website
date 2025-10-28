/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Sparkles, Navigation, ExternalLink, ShoppingCart } from 'lucide-react';
import { useItinerary } from '@/hooks/useIntinerary';
import { useAuth } from '@/auth/context';
import { toast } from 'sonner';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

// shadcn/ui
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

export default function ItineraryView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentItinerary, loadCurrentItinerary } = useItinerary();
  const { isAuth, withAuth } = useAuth();

  const passed = location.state?.itinerary;
  const itinerary = useMemo(() => passed || currentItinerary, [passed, currentItinerary]);

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (!itinerary) loadCurrentItinerary();
  }, []);

  useEffect(() => {
    if (itinerary?.items) {
      console.log('🗺️ ItineraryView - Items with coordinates:',
        itinerary.items.map((item, idx) => ({
          index: idx + 1,
          name: item.name,
          address: item.address,
          location_object: item.location,
          location_lat: item.location?.lat,
          location_lng: item.location?.lng,
          flat_lat: item.lat,
          flat_lng: item.lng,
          loc_object: item.loc,
          loc_lat: item.loc?.lat,
          loc_lng: item.loc?.lng,
        }))
      );
    }
  }, [itinerary]);

  const getCoordinates = (item) => {
    const lat = item.location?.lat || item.lat || item.loc?.lat;
    const lng = item.location?.lng || item.lng || item.loc?.lng;
    return { lat, lng };
  };

  const hasValidCoordinates = (item) => {
    const { lat, lng } = getCoordinates(item);
    return lat && lng && lat !== 0 && lng !== 0;
  };

  const prepareForDistanceMatrix = () => {
    const validItems = itinerary.items.filter(hasValidCoordinates);
    const origins = validItems.map(item => {
      const { lat, lng } = getCoordinates(item);
      return `${lat},${lng}`;
    }).join('|');

    console.log('📍 Distance Matrix Origins:', origins);
    console.log('✅ Valid items:', validItems.length, '/', itinerary.items.length);
    return { origins, validItems };
  };

  // Chỉ dùng để back an toàn (fallback -1)
  const handleBack = () => {
    navigate(-1);
    // Nếu muốn cứng về DiscoverResults, đổi thành:

  };

  const handleOptimizeClick = () => {
    if (!isAuth) {
      toast.error('Vui lòng đăng nhập để tối ưu hành trình');
      navigate('/login');
      return;
    }
    if (!itinerary?._id) {
      toast.error('Không tìm thấy hành trình. Vui lòng thử lại.');
      return;
    }
    const { validItems } = prepareForDistanceMatrix();
    if (validItems.length < 2) {
      toast.error('Cần ít nhất 2 địa điểm có tọa độ hợp lệ để tối ưu');
      return;
    }
    setShowAlert(true);
  };

  const handleOptimizeConfirm = async () => {
    try {
      setIsOptimizing(true);
      const { validItems } = prepareForDistanceMatrix();
      console.log('🚀 Calling backend optimize-ai for itinerary:', itinerary._id, {
        validCount: validItems.length
      });

      const data = await withAuth(`/api/itinerary/${itinerary._id}/optimize-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      console.log('✅ Optimize result:', data.itinerary);
      toast.success('Tối ưu hành trình thành công!');
      navigate(`/itinerary/result/${data.itinerary._id}`, {
        state: { itinerary: data.itinerary }
      });
    } catch (error) {
      console.error('❌ Optimize error:', error);
      if (error.status === 400) {
        toast.error(error.body?.error || 'Dữ liệu không hợp lệ');
      } else if (error.status === 404) {
        toast.error('Không tìm thấy hành trình');
      } else if (error.status === 500) {
        toast.error('Lỗi server. Vui lòng thử lại sau.');
      } else {
        toast.error('Lỗi khi tối ưu: ' + error.message);
      }
    } finally {
      setIsOptimizing(false);
      setShowAlert(false);
    }
  };

  if (!itinerary) {
    return (
      <div className="max-w-[1200px] mx-auto p-4">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
        <div className="mt-6 rounded-2xl border bg-white/80 p-6">Đang tải hành trình...</div>
      </div>
    );
  }

  const items = itinerary.items || [];
  const totalItems = items.length;
  const validCount = items.filter(hasValidCoordinates).length || 0;
  const totalDuration = items.reduce((sum, i) => sum + (i.duration || 0), 0) || 0;

  /* ============ EMPTY STATE: không có POI ============ */
  if (totalItems === 0) {
    return (
      <div className="min-h-screen bg-[#f6f9fb]">
        <div className="max-w-[900px] mx-auto px-5 py-6">
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-[15px] text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Trở về</span>
            </button>
          </div>

          {/* Empty card tối giản, chuyên nghiệp */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 rounded-3xl border border-slate-200 bg-white/80 backdrop-blur p-8 text-center"
          >
            <div className="mx-auto w-16 h-16 rounded-2xl grid place-items-center bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 shadow-sm">
              <ShoppingCart className="w-8 h-8 text-slate-500" />
            </div>
            <h2 className="mt-4 text-[22px] font-semibold text-slate-900">Chưa có địa điểm trong hành trình</h2>
            <p className="mt-2 text-[15px] text-slate-600">
              Hãy quay lại và thêm một vài địa điểm trước khi tối ưu hoá lộ trình nhé.
            </p>

            <div className="mt-6 flex items-center justify-center">
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-2 rounded-full bg-[#02A0AA] text-white px-5 py-2.5 text-[15px] font-medium hover:bg-[#028a94] transition"
              >
                <ArrowLeft className="w-5 h-5" />
                Quay lại để thêm địa điểm vào hành trình
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ============ NORMAL STATE: có POI ============ */
  return (
    <div className="min-h-screen bg-[#f6f9fb]">
      <div className="max-w-[900px] mx-auto px-5 py-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[15px] text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Trở về</span>
          </button>

          <button
            className="inline-flex items-center gap-2 rounded-full bg-[#02A0AA] text-white px-5 py-2.5 text-[15px] font-medium hover:bg-[#028a94] transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleOptimizeClick}
            disabled={totalItems < 2 || isOptimizing}
          >
            {isOptimizing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Đang tối ưu...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Tối ưu AI
              </>
            )}
          </button>
        </div>

        {/* Title / Stats card */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 rounded-2xl bg-white/80 backdrop-blur border border-slate-200 p-5"
        >
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-[26px] font-semibold text-slate-900 leading-tight">
              {itinerary.zoneName || 'Hành trình của bạn'}
            </h1>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              itinerary.isOptimized ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {itinerary.isOptimized ? 'ĐÃ TỐI ƯU' : 'CHƯA TỐI ƯU'}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-4 text-[14px] text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /> {totalItems} địa điểm
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {Math.floor(totalDuration / 60)}h {totalDuration % 60}m (thời lượng ở điểm)
            </span>
          </div>
          <p className="mt-2 text-[12px] text-slate-500">
            ⓘ <span className="font-medium">Chú thích:</span> “thời gian di chuyển giữa 2 điểm” là
            khoảng thời gian đi lại ước tính giữa các POI, sẽ được AI tính khi tối ưu lộ trình.
          </p>
        </motion.div>

        {/* POI timeline (single column) */}
        <section className="mt-5">
          <ol className="relative border-l-2 border-slate-200/80 pl-4">
            {items.map((item, idx) => {
              const coords = getCoordinates(item);
              const hasCoords = hasValidCoordinates(item);
              const gmapsUrl = hasCoords ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}` : null;

              return (
                <motion.li
                  key={item.poiId || idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="mb-4 last:mb-0"
                >
                  {/* node */}
                  <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-white border-2 border-[#02A0AA] grid place-items-center">
                    <span className="text-[10px] font-bold text-[#02A0AA] leading-none">{idx + 1}</span>
                  </div>

                  {/* card */}
                  <div className={`rounded-xl border p-3 bg-white/80 backdrop-blur transition hover:bg-white ${
                    !hasCoords ? 'border-amber-300 bg-amber-50/60' : 'border-slate-200'
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-[15px] font-semibold text-slate-900 truncate">
                          {item.name}
                        </h3>
                        <p className="text-[13px] text-slate-600 mt-0.5 line-clamp-2">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {item.address || 'Địa chỉ không xác định'}
                          </span>
                        </p>

                        {item.duration && (
                          <p className="text-[12px] text-slate-500 mt-1 inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {item.duration} phút (thời lượng ở điểm)
                          </p>
                        )}

                        {hasCoords ? (
                          <p className="text-[11px] text-slate-500 mt-1 inline-flex items-center gap-1 font-mono">
                            <Navigation className="w-3.5 h-3.5" />
                            {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                          </p>
                        ) : (
                          <p className="text-[11px] text-amber-600 mt-1 inline-flex items-center gap-1">
                            <Navigation className="w-3.5 h-3.5" />
                            Thiếu tọa độ
                          </p>
                        )}

                        {/* debug nhỏ gọn */}
                        <details className="mt-1">
                          <summary className="text-[10px] text-slate-400 cursor-pointer hover:text-slate-600">
                            🔍 Xem cấu trúc dữ liệu
                          </summary>
                          <pre className="text-[10px] bg-slate-50 p-2 rounded mt-1 overflow-auto max-h-36">
                            {JSON.stringify(
                              { location: item.location, lat: item.lat, lng: item.lng, loc: item.loc },
                              null,
                              2
                            )}
                          </pre>
                        </details>
                      </div>

                      {/* button Google Maps */}
                      {gmapsUrl && (
                        <a
                          href={gmapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[12px] px-2 py-1 rounded-md border border-sky-200 text-sky-700 hover:bg-sky-50 shrink-0"
                          title="Xem trên Google Maps"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Google Maps
                        </a>
                      )}
                    </div>

                    {/* travel note giữa 2 điểm */}
                    {idx < (items.length - 1) && (
                      <div className="mt-3 ml-1 text-[12px] text-slate-500">
                        <span className="px-2 py-1 rounded-full bg-slate-50 border border-slate-200">
                          Thời gian di chuyển sang điểm #{idx + 2}: sẽ được tính khi tối ưu
                        </span>
                      </div>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </section>

        {/* Tổng quan (đặt dưới danh sách) */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-2xl bg-gradient-to-br from-cyan-50 to-sky-50 border border-sky-200 p-5"
        >
          <h3 className="text-[15px] font-semibold text-sky-900 mb-2">Tổng quan nhanh</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[14px] text-sky-900/90">
            <div className="rounded-lg bg-white/70 border border-sky-200 p-3">
              <div className="text-[12px] text-slate-500">Tổng số địa điểm</div>
              <div className="mt-1 font-mono text-lg font-bold">{totalItems}</div>
            </div>
            <div className="rounded-lg bg-white/70 border border-sky-200 p-3">
              <div className="text-[12px] text-slate-500">Địa điểm có tọa độ</div>
              <div className="mt-1 font-mono text-lg font-bold">{validCount}</div>
            </div>
            <div className="rounded-lg bg-white/70 border border-sky-200 p-3">
              <div className="text-[12px] text-slate-500">Sẵn sàng tối ưu</div>
              <div className={`mt-1 text-lg font-bold ${validCount >= 2 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {validCount >= 2 ? '✓ Có' : '✗ Không'}
              </div>
            </div>
          </div>

          <p className="mt-3 text-[12.5px] text-slate-600">
            Mẹo: cập nhật tọa độ cho các điểm còn thiếu để AI sắp xếp chính xác hơn. Bạn có thể mở nhanh
            từng vị trí trên Google Maps bằng nút <span className="font-medium">Google Maps</span> trong mỗi thẻ.
          </p>
        </motion.div>
      </div>

      {/* AlertDialog xác nhận tối ưu */}
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent className="max-w-md bg-white/95 backdrop-blur-xl border-neutral-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[20px] font-semibold text-neutral-900">
              Xác nhận tối ưu hành trình
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[15px] text-neutral-500 leading-relaxed pt-2">
              Toàn bộ thông tin về lộ trình này chỉ là tham khảo.
              AI sẽ sắp xếp lại thứ tự các điểm dừng dựa trên thuật toán tối ưu khoảng cách.
              <br /><br />
              Bạn có muốn tiếp tục?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel className="rounded-full px-5 py-2.5 text-[15px] font-medium border-neutral-200 hover:bg-neutral-50">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleOptimizeConfirm}
              className="rounded-full px-5 py-2.5 text-[15px] font-medium bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-60"
              disabled={isOptimizing}
            >
              {isOptimizing ? 'Đang tối ưu...' : 'Tiếp tục'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
