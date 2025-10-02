export const STORAGE_KEY = "touring_cart_v1";

export function safeNumber(n, fallback = 0) {
  const x = Number(n);
  return Number.isFinite(x) ? x : fallback;
}

export function normalizeItem(raw) {
  const adultPrice = safeNumber(raw.price ?? raw.adultPrice, 0);
  const childPrice = Math.round(adultPrice * 0.5); // 50%
  const adults = Math.max(0, safeNumber(raw.adults, 0));
  const children = Math.max(0, safeNumber(raw.children, 0));
  return {
    id: raw.id,
    name: raw.name || raw.title || "",
    subtitle: raw.subtitle || "",
    image: raw.image || "",
    date: raw.date || "",
    duration: raw.duration || "",
    locations: raw.locations || "",
    adultPrice,
    childPrice,
    adults,
    children,
    available: raw.available !== false,
    selected: raw.selected !== false,
  };
}

export function cartReducer(state, action) {
  switch (action.type) {
    case "INIT_FROM_STORAGE":
      return Array.isArray(action.payload) ? action.payload : state;
    case "ADD_ITEM": {
      const inc = normalizeItem(action.payload);
      const idx = state.findIndex((i) => i.id === inc.id);
      if (idx !== -1) {
        const next = [...state];
        const cur = next[idx];
        next[idx] = {
          ...cur,
          adults: cur.adults + inc.adults,
          children: cur.children + inc.children,
          selected: true,
        };
        return next;
      }
      return [inc, ...state];
    }
    case "REMOVE_ITEM":
      return state.filter((i) => i.id !== action.payload);
    case "UPDATE_QTY": {
      const { id, field, delta } = action.payload;
      return state.map((i) =>
        i.id === id
          ? { ...i, [field]: Math.max(0, safeNumber(i[field]) + safeNumber(delta)) }
          : i
      );
    }
    case "TOGGLE_SELECT":
      return state.map((i) =>
        i.id === action.payload ? { ...i, selected: !i.selected } : i
      );
    case "SET_AVAILABLE": {
      const { id, available } = action.payload;
      return state.map((i) => (i.id === id ? { ...i, available: !!available } : i));
    }
    case "CLEAR_UNAVAILABLE":
      return state.filter((i) => i.available);
    case "CLEAR_ALL":
      return [];
    default:
      return state;
  }
}
