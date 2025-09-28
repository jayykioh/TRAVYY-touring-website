import { useEffect, useState } from "react";
import { AuthCtx } from "./context";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  // App mount -> check session từ backend
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          credentials: "include", // gửi cookie session
        });

        if (res.ok) {
          const data = await res.json();
          // Nếu chưa set role => gắn "uninitialized" cho FE dễ nhận biết
          if (!data.role) data.role = null;
          setUser(data);
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
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
    }
  }

  // helper flag: có user nhưng chưa chọn role
  const needsRole = !!user && user.role === "uninitialized";

  const value = { user, isAuth: !!user, booting, needsRole, setUser, logout };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
