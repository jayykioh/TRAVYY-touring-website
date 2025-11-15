import { useEffect, useState, useCallback } from "react";
import { AuthCtx } from "./context";
const API_BASE = "http://localhost:4000";

// helper fetch: luôn gửi cookie (để BE đọc refresh_token)

export { useAuth } from "./context";

const MOCK_ADMINS = [
  {
    id: 1,
    email: "admin@travyy.com",
    password: "Admin@123",
    name: "Melissa Peters",
    role: "admin", // ⬅️ Đánh dấu đây là admin
    adminRole: "Super Admin",
    avatar:
      "https://ui-avatars.com/api/?name=Melissa+Peters&background=3B82F6&color=fff",
    permissions: ["all"],
  },
  // ... 2 admin khác
];

async function api(input, init = {}) {
  const isFormData = init.body instanceof FormData;
  const headers = isFormData
    ? { ...(init.headers || {}) }
    : { Accept: "application/json", ...(init.headers || {}) };

  const r = await fetch(input, {
    credentials: "include",
    headers,
    ...init,
  });
  const ct = r.headers.get("content-type") || "";
  const body = ct.includes("application/json")
    ? await r.json().catch(() => null)
    : null;
  if (!r.ok) {
    const err = new Error(String(r.status));
    err.status = r.status;
    err.body = body;
    throw err;
  }
  return body;
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null); // ⬅️ giữ access in-memory
  const [bannedInfo, setBannedInfo] = useState(() => {
    try {
      const raw = sessionStorage.getItem("bannedInfo");
      const parsed = raw ? JSON.parse(raw) : null;
      console.log(
        "🔧 AuthContext initial bannedInfo from sessionStorage:",
        parsed
      );
      return parsed;
    } catch {
      return null;
    }
  }); // { message, reason }
  const [booting, setBooting] = useState(true);

  const login = useCallback(async (username, password) => {
    const res = await api(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res?.accessToken) {
      setAccessToken(res.accessToken);
    }

    if (res?.user) {
      // 👇 gộp token vào user luôn
      setUser({ ...res.user, token: res.accessToken });
    }

    return res?.user;
  }, []);

  const adminLogin = useCallback(async (username, password) => {
    const res = await api(`${API_BASE}/api/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res?.accessToken) {
      setAccessToken(res.accessToken);
    }

    if (res?.user) {
      setUser({ ...res.user, token: res.accessToken, role: "admin" });
    }

    return res?.user;
  }, []);

  // gọi API có kèm Bearer; nếu 401 thì refresh rồi retry
  const withAuth = useCallback(
    async (input, init = {}) => {
      if (typeof input !== "string") {
        console.error(
          "withAuth: first parameter must be a string URL, got:",
          typeof input,
          input
        );
        throw new Error("withAuth: first parameter must be a string URL");
      }

      const url = !/^https?:\/\//.test(input) ? `${API_BASE}${input}` : input;

      const headers = { ...(init.headers || {}) };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      try {
        return await api(url, { ...init, headers });
      } catch (e) {
        if (e.status === 401) {
          const r = await api(`${API_BASE}/api/auth/refresh`, {
            method: "POST",
          }).catch(() => null);
          if (!r?.accessToken) throw e;
          setAccessToken(r.accessToken);
          return await api(url, {
            ...init,
            headers: { ...headers, Authorization: `Bearer ${r.accessToken}` },
          });
        }
        throw e;
      }
    },
    [accessToken]
  );

  // ✅ thêm flag để tránh refresh sau khi logout
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  // App mount: sau khi Google redirect về, gọi refresh để lấy access, rồi gọi /me (Bearer)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (isLoggedOut || cancelled) return; // 👈 tránh auto refresh sau logout

        const r = await api(`${API_BASE}/api/auth/refresh`, { method: "POST" });
        console.log("🔄 Refresh response:", {
          accountStatus: r?.accountStatus,
          statusReason: r?.statusReason,
        });

        // If backend returned accountStatus in refresh response, respect it immediately
        if (r?.accountStatus) {
          const status = String(r.accountStatus || "").toLowerCase();
          const isLocked =
            status === "banned" || status === "locked" || status === "lock";
          console.log("🔒 Lock check:", { status, isLocked });

          if (isLocked) {
            const info = { message: r.statusReason || "Tài khoản bị khóa" };
            console.log("❌ Setting bannedInfo:", info);
            setBannedInfo(info);
            try {
              sessionStorage.setItem("bannedInfo", JSON.stringify(info));
            } catch {}
            // do not attempt to load /me for banned/locked accounts
            setUser(null);
            setBooting(false);
            return;
          } else {
            // accountStatus present and not banned/locked -> clear any stale bannedInfo
            console.log("✅ Active account, clearing banned info");
            setBannedInfo(null);
            try {
              sessionStorage.removeItem("bannedInfo");
            } catch {}
          }
        }

        if (r?.accessToken) {
          setAccessToken(r.accessToken);
          try {
            const me = await api(`${API_BASE}/api/auth/me`, {
              headers: { Authorization: `Bearer ${r.accessToken}` },
            });
            if (me) {
              if (!me.role) me.role = null; // giữ logic role null như bạn cũ
              setUser({ ...me, token: r.accessToken });
              setBannedInfo(null);
              sessionStorage.removeItem("bannedInfo");
            }
          } catch (err) {
            // If backend returns 403 for banned accounts, capture and expose it
            if (err?.status === 403) {
              const info = err?.body || {
                message: err.message || "Tài khoản bị khóa",
              };
              setBannedInfo(info);
              try {
                sessionStorage.setItem("bannedInfo", JSON.stringify(info));
              } catch {}
            }
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setBooting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoggedOut]); // 👈 thêm dependency để khi logout => dừng refresh

  // expose a helper to clear banned info (e.g., after logout)
  const clearBannedInfo = () => setBannedInfo(null);

  async function logout() {
    try {
      await api(`${API_BASE}/api/auth/logout`, { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // 🧹 Dọn sạch session phía client
      setAccessToken(null);
      setUser(null);
      setIsLoggedOut(true);

      // ✅ Keep trustedDeviceToken in localStorage (don't remove on logout)
      // User can still skip 2FA on next login if they chose "Remember this device"
      // To remove trusted device, user should go to Security Settings

      // ✅ Keep rememberedUsername in sessionStorage (don't remove on logout)
      const rememberedUsername = sessionStorage.getItem("rememberedUsername");

      // Clear other session data
      sessionStorage.clear();

      // ✅ Restore rememberedUsername after clear
      if (rememberedUsername) {
        sessionStorage.setItem("rememberedUsername", rememberedUsername);
      }

      // 🧠 Xóa cookie (nếu không phải HttpOnly)
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
      });
    }
  }

  // helper flag: có user nhưng chưa chọn role
  const needsRole = !!user && user.role === "uninitialized";

  const value = {
    user,
    isAuth: !!user,
    isAdmin: !!user && user.role === "admin",
    booting,
    needsRole,
    setUser,
    login,
    adminLogin,
    logout,
    accessToken,
    withAuth, // dùng cái này để call API bảo vệ
    bannedInfo,
    clearBannedInfo,
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
