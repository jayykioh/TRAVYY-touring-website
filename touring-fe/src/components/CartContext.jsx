"use client";
import { createContext, useEffect, useMemo, useReducer } from "react";
import { STORAGE_KEY, cartReducer, normalizeItem, safeNumber } from "../hooks/cart-logic";

const CartContext = createContext(null);

export default function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          dispatch({ type: "INIT_FROM_STORAGE", payload: parsed.map(normalizeItem) });
        }
      }
    } catch {
      console.log("load faild in cartcontext");
    }
  }, []);

  // save
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {    console.log("load faild in cartcontext");}
  }, [items]);

  // actions
  const addToCart      = (item)                  => dispatch({ type: "ADD_ITEM", payload: item });
  const removeItem     = (id)                    => dispatch({ type: "REMOVE_ITEM", payload: id });
  const updateQty      = (id, field, delta)      => dispatch({ type: "UPDATE_QTY", payload: { id, field, delta } });
  const toggleSelect   = (id)                    => dispatch({ type: "TOGGLE_SELECT", payload: id });
  const setAvailable   = (id, available)         => dispatch({ type: "SET_AVAILABLE", payload: { id, available } });
  const clearUnavailable = ()                    => dispatch({ type: "CLEAR_UNAVAILABLE" });
  const clearAll       = ()                      => dispatch({ type: "CLEAR_ALL" });

  // selectors
  const totals = useMemo(() => {
    const valid = items.filter(
      (i) => i.available && (safeNumber(i.adults) > 0 || safeNumber(i.children) > 0)
    );

    const allSubtotal = valid.reduce(
      (s, i) => s + i.adults * i.adultPrice + i.children * i.childPrice,
      0
    );

    const selected = valid.filter((i) => i.selected);
    const selectedSubtotal = selected.reduce(
      (s, i) => s + i.adults * i.adultPrice + i.children * i.childPrice,
      0
    );

    const selectedQty = selected.reduce((s, i) => s + i.adults + i.children, 0);
    const hasChildrenWithoutAdults = selected.some((i) => i.children > 0 && i.adults === 0);
    const canCheckout = selected.length > 0 && selectedSubtotal > 0 && !hasChildrenWithoutAdults && selectedQty > 0;

    return { allSubtotal, selectedSubtotal, canCheckout, hasChildrenWithoutAdults, selectedQty };
  }, [items]);

  const value = {
    items,
    addToCart,
    removeItem,
    updateQty,
    toggleSelect,
    setAvailable,
    clearUnavailable,
    clearAll,
    totals,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// hook tách sang file riêng để file này chỉ export component
export { CartContext };
