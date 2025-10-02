"use client";
import React, { createContext, useEffect, useMemo, useReducer } from "react";
import { STORAGE_KEY, cartReducer, initCartState, safeNumber } from "@/hooks/cart-logic";

export const CartContext = createContext(null);

export default function CartProvider({ children }) {
  // 1) Khởi tạo đồng bộ từ localStorage (rehydrate)
  const [items, dispatch] = useReducer(cartReducer, [], initCartState);

  // 2) Persist mỗi khi đổi
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {
      console.log("Lỗi khi persist lỗi");
    }
  }, [items]);

  // 3) (Optional) Đồng bộ đa tab
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const next = JSON.parse(e.newValue);
          // replace state nếu khác
          if (JSON.stringify(items) !== e.newValue) {
            dispatch({ type: "__REPLACE__", payload: next });
          }
        } catch {
          console.log("Error khi đồng bộ");
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [items]);

  // Actions
  const add        = (item)                  => dispatch({ type: "ADD", payload: item });
  const remove     = (id, date)              => dispatch({ type: "REMOVE", payload: { id, date } });
  const qty        = (id, date, field, d)    => dispatch({ type: "QTY", payload: { id, date, field, delta: d } });
  const select     = (id, date)              => dispatch({ type: "SELECT", payload: { id, date } });
  const available  = (id, date, v)           => dispatch({ type: "AVAILABLE", payload: { id, date, available: v } });
  const clearAll   = ()                      => dispatch({ type: "CLEAR_ALL" });
  const clearAvail = ()                      => dispatch({ type: "CLEAR_UNAVAILABLE" });

  // Selectors
  const totals = useMemo(() => {
    const valid = items.filter(i => i.available && (safeNumber(i.adults) > 0 || safeNumber(i.children) > 0));
    const selected = valid.filter(i => i.selected);

    const sum = (arr) => arr.reduce((s,i)=> s + i.adults*i.adultPrice + i.children*i.childPrice, 0);

    const allSubtotal = sum(valid);
    const selectedSubtotal = sum(selected);
    const selectedQty = selected.reduce((s,i)=> s + safeNumber(i.adults) + safeNumber(i.children), 0);
    const hasChildrenNoAdults = selected.some(i => i.children > 0 && i.adults === 0);
    const canCheckout = selected.length > 0 && selectedSubtotal > 0 && !hasChildrenNoAdults && selectedQty > 0;

    const cartCountAll = items.length;

    return { allSubtotal, selectedSubtotal, selectedQty, hasChildrenNoAdults, canCheckout, cartCountAll };
  }, [items]);

  const value = { items, add, remove, qty, select, available, clearAll, clearAvail, totals };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
