import { useEffect, useState, useCallback } from "react";
import { AuthCtx } from "./context";
const API_BASE = "http://localhost:4000";
// helper fetch: luôn gửi cookie (để BE đọc refresh_token)
async function api(input, init = {}) {
  // Don't set Accept header if body is FormData (for file uploads)
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
  const body = ct.includes("application/json") ? await r.json().catch(() => null) : null;
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




  // gọi API có kèm Bearer; nếu 401 thì refresh rồi retry
const withAuth = useCallback(async (input, init = {}) => {
  // Ensure input is a string
  if (typeof input !== "string") {
    console.error("withAuth: first parameter must be a string URL, got:", typeof input, input);
    throw new Error("withAuth: first parameter must be a string URL");
  }

  const url = !/^https?:\/\//.test(input)
    ? `${API_BASE}${input}` // << tự prefix
    : input;

  const headers = { ...(init.headers || {}) };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  try {
    return await api(url, { ...init, headers });
  } catch (e) {
    if (e.status === 401) {
      const r = await api(`${API_BASE}/api/auth/refresh`, { method: "POST" }).catch(() => null);
      if (!r?.accessToken) throw e;
      setAccessToken(r.accessToken);
      return await api(url, { ...init, headers: { ...headers, Authorization: `Bearer ${r.accessToken}` } });
    }
    throw e;
  }
}, [accessToken]);

  // App mount: sau khi Google redirect về, gọi refresh để lấy access, rồi gọi /me (Bearer)
  useEffect(() => {
    (async () => {
      try {
        const r = await api("http://localhost:4000/api/auth/refresh", { method: "POST" });
        if (r?.accessToken) {
          setAccessToken(r.accessToken);
          const me = await api("http://localhost:4000/api/auth/me", {
            headers: { Authorization: `Bearer ${r.accessToken}` },
          }).catch(() => null);
          if (me) {
            if (!me.role) me.role = null; // giữ logic role null như bạn cũ
            setUser({ ...me, token: r.accessToken }); 
          } else {
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
  }, []);

  async function logout() {
    try {
      await api("http://localhost:4000/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }

  // helper flag: có user nhưng chưa chọn role
  const needsRole = !!user && user.role === "uninitialized";

  const value = {
    user,
    isAuth: !!user,
    booting,
    needsRole,
    setUser,
    login,
    logout,
    accessToken,
    withAuth, // dùng cái này để call API bảo vệ
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
