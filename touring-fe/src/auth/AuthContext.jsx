import { useEffect, useState, useCallback } from "react";
import { useRef } from "react";
import { AuthCtx } from "./context";
import { identifyUser, resetPostHog } from '../utils/posthog';
const API_BASE = "http://localhost:4000";

// helper fetch: luôn gửi cookie (để BE đọc refresh_token)

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
  const headers = { Accept: "application/json", ...(init.headers || {}) };
  
  // If body is a string (JSON stringified), ensure Content-Type is set
  if (typeof init.body === 'string' && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }

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
    const serverMessage = body?.error || body?.message || null;
    const errMsg = serverMessage || `HTTP ${r.status}`;
    const err = new Error(errMsg);
    err.status = r.status;
    err.body = body;
    // include full server debug when available (non-production)
    throw err;
  }
  return body;
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Initialize accessToken: check localStorage first, but sanitize invalid strings
  const [accessToken, setAccessToken] = useState(() => {
    const stored = localStorage.getItem('accessToken');
    if (stored && stored !== 'null' && stored !== 'undefined') {
      return stored;
    }
    return null;
  });
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
  // keep a ref of booting so callbacks can observe latest value without
  // being recreated too often
  const bootingRef = useRef(booting);

  const login = useCallback(async (username, password) => {
    const res = await api(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res?.accessToken) {
      setAccessToken(res.accessToken);
      // Store in localStorage for API calls that don't use withAuth
      localStorage.setItem('accessToken', res.accessToken);
    }

    if (res?.user) {
      // 👇 gộp token vào user luôn
      setUser({ ...res.user, token: res.accessToken });
      
      // ✅ Identify user in PostHog for tracking
      identifyUser(res.user._id, {
        email: res.user.email,
        username: res.user.username,
        role: 'user'
      });
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
      // Store in localStorage for API calls that don't use withAuth
      localStorage.setItem('accessToken', res.accessToken);
    }

    if (res?.user) {
      setUser({ ...res.user, token: res.accessToken, role: "admin" });
      
      // ✅ Identify admin in PostHog
      identifyUser(res.user._id, {
        email: res.user.email,
        username: res.user.username,
        role: 'admin'
      });
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

      // If the auth system is still booting (refresh in progress), wait a
      // short while for it to finish to avoid making calls without a token.
      // This guards consumers from calling APIs mid-auth-reset.
      const waitForBoot = async (timeout = 3000) => {
        const start = Date.now();
        while (bootingRef.current) {
          if (Date.now() - start > timeout) return false;
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => setTimeout(r, 50));
        }
        return true;
      };

      if (bootingRef.current) {
        try {
          const ok = await waitForBoot(3000);
          if (!ok) {
            console.debug("withAuth: booting did not finish within timeout");
          }
        } catch (err) {
          console.debug("withAuth: error waiting for boot", err);
        }
      }

      const headers = { ...(init.headers || {}) };
      // If we already have an access token, attach it. Otherwise try a
      // proactive refresh to avoid an initial 401 that pollutes Network tab.
      // Defensive: ignore string values 'null' or 'undefined' which sometimes
      // get stored in localStorage by mistake and would result in `Bearer null`.
      const validAccessToken = accessToken && accessToken !== 'null' && accessToken !== 'undefined' ? accessToken : null;
      if (validAccessToken) {
        headers.Authorization = `Bearer ${validAccessToken}`;
      } else {
        try {
          const r = await api(`${API_BASE}/api/auth/refresh`, { method: "POST" }).catch(() => null);
          if (r?.accessToken) {
            setAccessToken(r.accessToken);
            if (r.accessToken && r.accessToken !== 'null' && r.accessToken !== 'undefined') {
              localStorage.setItem('accessToken', r.accessToken);
            }
            headers.Authorization = `Bearer ${r.accessToken}`;
          }
        } catch (e) {
          // Log debug so we can see why refresh failed during proactive attempt
          console.debug("withAuth: proactive refresh failed:", e && e.message ? e.message : e);
        }
      }

      try {
        return await api(url, { ...init, headers });
      } catch (e) {
        if (e.status === 401) {
          const r = await api(`${API_BASE}/api/auth/refresh`, {
            method: "POST",
          }).catch(() => null);
          if (!r?.accessToken) throw e;
          setAccessToken(r.accessToken);
          // Update localStorage as well (only if token is a valid string)
          if (r.accessToken && r.accessToken !== 'null' && r.accessToken !== 'undefined') {
            localStorage.setItem('accessToken', r.accessToken);
          }
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
  const hasCheckedLogout = useRef(false); // ✅ Prevent double-check in Strict Mode

  // App mount: sau khi Google redirect về, gọi refresh để lấy access, rồi gọi /me (Bearer)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // ✅ Check if user just logged out (prevent auto-login on F5)
        // Use ref to ensure this only runs once even in React Strict Mode
        if (!hasCheckedLogout.current) {
          const justLoggedOut = localStorage.getItem("justLoggedOut");
          if (justLoggedOut === "true") {
            console.log("🚫 Just logged out detected - SKIPPING auto-login");
            localStorage.removeItem("justLoggedOut"); // Clear flag
            hasCheckedLogout.current = true; // Mark as checked
            setBooting(false);
            setUser(null);
            setAccessToken(null);
            return;
          }
          hasCheckedLogout.current = true; // Mark as checked even if no logout flag
        }

        if (isLoggedOut || cancelled) {
          console.log("🚫 isLoggedOut or cancelled - SKIPPING refresh");
          setBooting(false);
          return;
        }

        console.log("� Attempting auto-login via refresh...");
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
            } catch (err) {
              console.warn("AuthContext: failed to save bannedInfo to sessionStorage", err && err.message ? err.message : err);
            }
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
            } catch (err) {
              console.warn("AuthContext: failed to remove bannedInfo from sessionStorage", err && err.message ? err.message : err);
            }
          }
        }

        if (r?.accessToken) {
          setAccessToken(r.accessToken);
          // Store in localStorage for API calls
          localStorage.setItem('accessToken', r.accessToken);
          try {
            const me = await api(`${API_BASE}/api/auth/me`, {
              headers: { Authorization: `Bearer ${r.accessToken}` },
            });
            if (me) {
              if (!me.role) me.role = null; // giữ logic role null như bạn cũ
              setUser({ ...me, token: r.accessToken });
              setBannedInfo(null);
              sessionStorage.removeItem("bannedInfo");
              
              // ✅ Identify user in PostHog (OAuth login)
              identifyUser(me._id, {
                email: me.email,
                username: me.username,
                role: me.role || 'user'
              });
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
              } catch (err) {
                console.warn("AuthContext: failed to save bannedInfo during refresh flow", err && err.message ? err.message : err);
              }
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
  }, []); // ✅ Only run once on mount - isLoggedOut check is inside the function

  // keep bootingRef in sync with booting state
  useEffect(() => {
    bootingRef.current = booting;
  }, [booting]);

  // Instrumentation: log accessToken/user/booting transitions to help
  // diagnose mid-flow resets reported by users.
  useEffect(() => {
    try {
      console.debug("AuthContext state", {
        time: new Date().toISOString(),
        booting,
        user: user ? { id: user._id || user.id, role: user?.role } : null,
        hasAccessToken: !!accessToken,
      });
    } catch (err) {
      // non-fatal
    }
  }, [accessToken, user, booting]);

  // expose a helper to clear banned info (e.g., after logout)
  const clearBannedInfo = () => setBannedInfo(null);

  async function logout() {
    // ✅ Set flag IMMEDIATELY before any async operation
    console.log("🚪 Setting justLoggedOut flag BEFORE logout");
    localStorage.setItem("justLoggedOut", "true");
    setIsLoggedOut(true);

    try {
      await api(`${API_BASE}/api/auth/logout`, { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // 🧹 Dọn sạch session phía client
      setAccessToken(null);
      setUser(null);

      // ✅ Keep trustedDeviceToken in localStorage (don't remove on logout)
      // User can still skip 2FA on next login if they chose "Remember this device"
      // To remove trusted device, user should go to Security Settings

      // ✅ Keep rememberedUsername in sessionStorage (don't remove on logout)
      const rememberedUsername = sessionStorage.getItem("rememberedUsername");

      // Clear other session data
      sessionStorage.clear();
      
      // ✅ Reset PostHog session (clear user identity)
      resetPostHog();

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

      // 🚀 Force redirect to login page to prevent auto-refresh
      console.log("🚀 Redirecting to login page...");
      window.location.href = "/";
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
