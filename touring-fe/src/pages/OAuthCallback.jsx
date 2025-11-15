// src/pages/OAuthCallback.jsx
import { useEffect } from "react";
import logger from "../utils/logger";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
import { useNavigate } from "react-router-dom";

export default function OAuthCallback() {
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        if (!r.ok) {
          nav("/login", { replace: true });
          return;
        }

        // parse refresh response to get accessToken and account status
        const body = await r.json().catch(() => ({}));
        const accessToken = body?.accessToken;

        logger.debug("🔐 OAuth refresh response:", {
          accountStatus: body?.accountStatus,
          statusReason: body?.statusReason,
        });

        // If backend included accountStatus in refresh response, use it immediately
        if (body?.accountStatus) {
          const status = String(body.accountStatus || "").toLowerCase();
          const isLocked =
            status === "banned" || status === "locked" || status === "lock";
          logger.debug("🔒 OAuth lock check:", { status, isLocked });

          if (isLocked) {
            const info = { message: body?.statusReason || "Tài khoản bị khóa" };
            logger.info("❌ OAuth setting bannedInfo:", info);
            try {
              sessionStorage.setItem("bannedInfo", JSON.stringify(info));
            } catch (e) {}
          } else {
            logger.info("✅ OAuth active account");
            try {
              sessionStorage.removeItem("bannedInfo");
            } catch (e) {}
          }
        }

        // If we received an access token and accountStatus wasn't returned, fall back to /me
        if (accessToken && !body?.accountStatus) {
          try {
            const meRes = await fetch(`${API_BASE}/api/auth/me`, {
              method: "GET",
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            });

            if (!meRes.ok) {
              const meBody = await meRes.json().catch(() => null);
              // If banned (403), persist info so app can show immediate message
              if (meRes.status === 403) {
                sessionStorage.setItem(
                  "bannedInfo",
                  JSON.stringify(meBody || { message: "Tài khoản bị khóa" })
                );
              } else {
                sessionStorage.removeItem("bannedInfo");
              }
            } else {
              sessionStorage.removeItem("bannedInfo");
            }
          } catch (err) {
            // ignore me errors, AuthContext will re-check on boot
          }
        }

        nav("/", { replace: true });
      } catch {
        nav("/login", { replace: true });
      }
    })();
  }, [nav]);

  return <div className="p-6">Signing you in…</div>;
}
