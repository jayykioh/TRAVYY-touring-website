import { useLocation, Link } from "react-router-dom";
import { useMemo, useEffect, useState } from "react";
import { useAuth } from "@/auth/context";

export default function MoMoSandbox() {
  const location = useLocation();
  const { user } = useAuth() || {};
  const token = user?.token;
  const [markStatus, setMarkStatus] = useState("");
  const params = useMemo(() => Object.fromEntries(new URLSearchParams(location.search)), [location.search]);
  const resultCode = params.resultCode;
  const message = params.message;
  const amount = params.amount;
  const orderId = params.orderId;

  const success = resultCode === "0"; // MoMo sandbox success code

  // Poll session status until paid (IPN updates server)
  useEffect(() => {
    if (!orderId || !token) return;
    let cancelled = false;
    let attempts = 0;
    const poll = async () => {
      attempts++;
      try {
        const r = await fetch(`/api/payments/momo/session/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) throw new Error("status error");
        const data = await r.json();
        if (cancelled) return;
        if (data.status === "paid") {
          setMarkStatus("paid");
          return; // stop polling
        }
        if (data.status === "failed") {
          setMarkStatus("failed");
          return;
        }
      } catch {
        if (!cancelled) setMarkStatus((m) => (m ? m : "đang kiểm tra..."));
      }
      if (!cancelled && attempts < 30) {
        setTimeout(poll, 2000);
      } else if (!cancelled && !markStatus) {
        setMarkStatus("timeout");
      }
    };
    poll();
    return () => { cancelled = true; };
  }, [orderId, token, markStatus]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-xl bg-white shadow-sm rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-4 text-pink-600">MoMo Sandbox</h1>
        {!resultCode && (
          <p className="text-gray-700 mb-4">
            Bạn đang ở trang nhận kết quả thanh toán MoMo Sandbox. Khi người
            dùng hoàn tất trên cổng MoMo, họ sẽ được redirect về đây với các
            tham số kết quả (resultCode, orderId, amount, ...).
          </p>
        )}
        {resultCode && (
          <div className="mb-6">
            <div className={`p-4 rounded-lg ${success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
              <h2 className="font-semibold mb-2 text-lg">
                {success ? "Thanh toán thành công" : "Thanh toán thất bại"}
              </h2>
              <ul className="text-sm text-gray-700 space-y-1">
                <li><strong>orderId:</strong> {orderId}</li>
                <li><strong>amount:</strong> {Number(amount||0).toLocaleString("vi-VN")}đ</li>
                <li><strong>resultCode:</strong> {resultCode}</li>
                {message && <li><strong>message:</strong> {decodeURIComponent(message)}</li>}
                {orderId && <li><strong>trạng thái:</strong> {markStatus || "đang kiểm tra..."}</li>}
              </ul>
            </div>
          </div>
        )}
        <div className="flex gap-3 justify-center">
          <Link to="/booking" className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">Quay lại thanh toán</Link>
          <Link to="/" className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300">Trang chủ</Link>
        </div>
        <p className="text-xs text-gray-400 mt-6 text-center">
          (Sandbox demo – cần triển khai xác minh signature & cập nhật trạng thái đơn hàng ở môi trường thật)
        </p>
      </div>
    </div>
  );
}
