import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useAuth } from "@/auth/context";
import { CheckCircle2, XCircle, Loader2, ArrowLeft } from "lucide-react";
import logger from '@/utils/logger';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function ItineraryPaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { id } = useParams(); // itinerary ID
  const { withAuth } = useAuth();
  
  const [status, setStatus] = useState("pending");
  const [message, setMessage] = useState("Đang xử lý thanh toán...");
  const [itinerary, setItinerary] = useState(null);
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const run = async () => {
      const momoOrderId = searchParams.get('orderId');
      const momoResultCode = searchParams.get('resultCode');
      const momoMessage = searchParams.get('message');

      if (momoOrderId && momoResultCode) {
        const success = momoResultCode === '0';
        
        if (success) {
          setStatus('processing');
          setMessage('Đang xác nhận thanh toán đặt cọc...');
          
          // Wait a bit for the callback to process
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Poll for payment confirmation
          let attempts = 0;
          const maxAttempts = 10;
          
          while (attempts < maxAttempts) {
            attempts++;
            logger.debug(`[Deposit Payment] Polling attempt ${attempts} for itinerary ${id}`);
            
            try {
              const result = await withAuth(`/api/itinerary/${id}`);
              if (result?.itinerary) {
                const itin = result.itinerary;
                setItinerary(itin);
                
                if (itin.paymentInfo?.status === 'deposit_paid') {
                  setStatus('success');
                  setMessage('Thanh toán đặt cọc thành công!');
                  logger.info('[Deposit Payment] Payment confirmed');
                  break;
                } else {
                  logger.debug('[Deposit Payment] Payment still pending...');
                }
              }
            } catch (e) {
              logger.error('[Deposit Payment] Poll error:', e);
            }
            
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
          
          if (attempts >= maxAttempts) {
            setStatus('success');
            setMessage('Thanh toán đã được gửi, đang chờ xác nhận từ hệ thống.');
          }
        } else {
          setStatus('error');
          setMessage(momoMessage || 'Thanh toán thất bại');
        }
      } else {
        setStatus('error');
        setMessage('Thông tin thanh toán không hợp lệ');
      }
    };

    run();
  }, [searchParams, id, withAuth]);

  const handleBackToItinerary = () => {
    navigate(`/itinerary/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E0F7F9] to-[#B8F0F4] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {status === 'pending' || status === 'processing' ? (
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <Loader2 className="w-16 h-16 text-[#02A0AA] animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Đang xử lý thanh toán
            </h1>
            <p className="text-slate-600">{message}</p>
          </div>
        ) : status === 'success' ? (
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Thanh toán thành công!
            </h1>
            <p className="text-slate-600 mb-6">{message}</p>
            
            {itinerary && (
              <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
                <h2 className="font-semibold text-slate-900 mb-3">Chi tiết thanh toán</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tour:</span>
                    <span className="font-medium text-slate-900">{itinerary.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Số tiền cọc:</span>
                    <span className="font-semibold text-[#02A0AA]">
                      {itinerary.paymentInfo?.depositAmount?.toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Trạng thái:</span>
                    <span className="font-medium text-green-600">Đã thanh toán</span>
                  </div>
                </div>
              </div>
            )}
            
            <button
              onClick={handleBackToItinerary}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#02A0AA] to-[#018F99] text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Quay lại trang tour
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Thanh toán thất bại
            </h1>
            <p className="text-slate-600 mb-6">{message}</p>
            <button
              onClick={handleBackToItinerary}
              className="w-full px-6 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Quay lại và thử lại
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
