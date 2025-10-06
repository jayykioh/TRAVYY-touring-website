// components/CartContext.jsx
import { createContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "../auth/context";

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user, withAuth } = useAuth() || {};
  const isAuth = !!user?.token;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const replace = useCallback((nextItems) => {
    setItems(Array.isArray(nextItems) ? nextItems : []);
  }, []);

  // load cart on auth change
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isAuth) return replace([]);
      setLoading(true);
      try {
        const res = await withAuth("/api/cart", { method: "GET" });
        if (!cancelled) replace(res?.items || []);
      } catch {
        if (!cancelled) replace([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isAuth, withAuth, replace]);

  // totals (tính trên FE từ snapshot giá)
// ... giữ nguyên import & state

// totals (tính trên FE từ snapshot giá)
const totals = items.reduce(
  (acc, it) => {
    const line =
      (Number(it.adultPrice) || 0) * (Number(it.adults) || 0) +
      (Number(it.childPrice) || 0) * (Number(it.children) || 0);

    if (it.selected) {
      acc.selected += line;
      acc.cartCountSelected += 1;
      acc.paxSelected += (Number(it.adults) || 0) + (Number(it.children) || 0);
    }

    acc.all += line;
    acc.cartCountAll += 1;
    acc.paxAll += (Number(it.adults) || 0) + (Number(it.children) || 0);
    return acc;
  },
  {
    selected: 0,
    all: 0,
    cartCountAll: 0,        // 👈 tổng số dòng trong giỏ
    cartCountSelected: 0,   // 👈 số dòng đã tick chọn
    paxAll: 0,              // tổng khách (người lớn + trẻ em) tất cả dòng
    paxSelected: 0,         // tổng khách của dòng đã chọn
  }
);

// ... value = { loading, items, totals, replace }


  const value = {
    loading,
    items,
    totals,
    replace,
    // các action sẽ được “bọc” ở useCart (để giữ UI gọn)
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
