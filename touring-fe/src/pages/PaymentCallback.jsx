import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/auth/context";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState("pending");
  const [message, setMessage] = useState("Đang xử lý thanh toán...");
  const [bookingId, setBookingId] = useState(null);
  const [provider, setProvider] = useState(null);
  const [orderRef, setOrderRef] = useState(null);
  const hasProcessed = useRef(false); // ⬅️ THÊM GUARD

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const run = async () => {
      // Detect provider:
      const paypalOrderId = searchParams.get('token');
      const momoOrderId = searchParams.get('orderId');
      const momoResultCode = searchParams.get('resultCode');
      const momoMessage = searchParams.get('message');

      if (paypalOrderId) {
        // PAYPAL FLOW
        try {
          setStatus('processing');
          setProvider('paypal');
          setOrderRef(paypalOrderId);
          const resp = await fetch(`${API_BASE}/api/paypal/capture`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user?.token}`,
            },
            credentials: 'include',
            body: JSON.stringify({ orderID: paypalOrderId })
          });
          if (!resp.ok) {
            const err = await resp.json().catch(()=>({}));
            throw new Error(err.error || 'Thanh toán thất bại');
          }
          const data = await resp.json();
          if (data.success && data.bookingId) {
            setStatus('success');
            setMessage('Thanh toán PayPal thành công!');
            setBookingId(data.bookingId);
          } else {
            throw new Error('Không thể hoàn tất thanh toán');
          }
        } catch(e) {
          console.error('PayPal callback error', e);
          setStatus('error');
          setMessage(e.message || 'Lỗi thanh toán PayPal');
        }
        return;
      }

      if (momoOrderId) {
        // MOMO FLOW
        // resultCode 0 = success, !=0 = fail. Need to poll booking if success.
        const success = momoResultCode === '0';
        setProvider('momo');
        setOrderRef(momoOrderId);
        if (success) {
          setStatus('processing');
          setMessage('Đang xác nhận thanh toán MoMo...');
          
          // STEP 1: Call mark-paid to ensure session is marked as paid
          try {
            console.log('[MoMo Callback] Calling mark-paid for orderId:', momoOrderId);
            const markPaidResp = await fetch(`${API_BASE}/api/payments/momo/mark-paid`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user?.token}`
              },
              credentials: 'include',
              body: JSON.stringify({ orderId: momoOrderId, resultCode: momoResultCode })
            });
            
            if (markPaidResp.ok) {
              const markData = await markPaidResp.json();
              console.log('[MoMo Callback] Mark-paid response:', markData);
              if (markData.bookingId) {
                setStatus('success');
                setMessage('Thanh toán MoMo thành công!');
                setBookingId(markData.bookingId);
                return;
              }
            } else {
              console.warn('[MoMo Callback] Mark-paid failed:', markPaidResp.status);
            }
          } catch (e) {
            console.error('[MoMo Callback] Mark-paid error:', e);
          }
          
          // STEP 2: Poll booking creation via by-payment endpoint
          let attempts = 0;
          const poll = async () => {
            attempts++;
            try {
              console.log(`[MoMo Callback] Polling attempt ${attempts} for orderId: ${momoOrderId}`);
              const r = await fetch(`${API_BASE}/api/bookings/by-payment/momo/${momoOrderId}`, {
                headers: { 
                  'Authorization': `Bearer ${user?.token}`,
                  'Content-Type': 'application/json'
                },
                credentials: 'include'
              });
              console.log(`[MoMo Callback] Response status: ${r.status}`);
              
              if (r.ok) {
                const d = await r.json();
                console.log('[MoMo Callback] Response data:', d);
                if (d?.booking?._id) {
                  setStatus('success');
                  setMessage('Thanh toán MoMo thành công!');
                  setBookingId(d.booking._id);
                  return;
                }
              } else if (r.status === 202) {
                // Still processing
                console.log('[MoMo Callback] Payment still processing...');
              } else {
                const errData = await r.json().catch(() => ({}));
                console.warn('[MoMo Callback] Error response:', errData);
              }
            } catch (e) { 
              console.error('[MoMo Callback] Poll error:', e);
            }
            if (attempts < 15) setTimeout(poll, 2000);
            else {
              setStatus('success'); // Payment success but booking not found yet
              setMessage('Thanh toán MoMo thành công (đang cập nhật booking...)');
            }
          };
          poll();
        } else {
          setStatus('error');
          setMessage(decodeURIComponent(momoMessage || 'Thanh toán MoMo thất bại'));
        }
        return;
      }

      // No supported params
      setStatus('error');
      setMessage('Thiếu tham số nhận kết quả thanh toán');
    };
    run();
  }, [searchParams, user]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          {status === "processing" && (
            <>
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Đang xử lý</h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <div className="mb-4 text-xs text-gray-500 space-y-1">
                {provider && <div><strong>Provider:</strong> {provider}</div>}
                {orderRef && <div><strong>Order ID:</strong> {orderRef}</div>}
              </div>
              {bookingId && (
                <p className="text-sm text-gray-500 mb-6">Mã đặt chỗ: {bookingId}</p>
              )}
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => navigate("/profile/booking-history")}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Xem vé của tôi
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Về trang chủ
                </button>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Thất bại</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="mb-4 text-xs text-gray-500 space-y-1">
                {provider && <div><strong>Provider:</strong> {provider}</div>}
                {orderRef && <div><strong>Order ID:</strong> {orderRef}</div>}
              </div>
              <button
                onClick={() => navigate("/shoppingcarts")}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Quay lại giỏ hàng
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}