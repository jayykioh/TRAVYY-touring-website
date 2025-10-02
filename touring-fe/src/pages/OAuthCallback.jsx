// src/pages/OAuthCallback.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuthCallback() {
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (r.ok) {
        //   const { accessToken } = await r.json();
          // Lưu token vào context/global state nếu bạn có
          // ví dụ: window.__access = accessToken; (tạm)
          // hoặc gọi context.setAccessToken(accessToken)
          nav("/", { replace: true }); // về trang chính (hoặc /profile)
        } else {
          nav("/login", { replace: true });
        }
      } catch {
        nav("/login", { replace: true });
      }
    })();
  }, [nav]);

  return <div className="p-6">Signing you in…</div>;
}
