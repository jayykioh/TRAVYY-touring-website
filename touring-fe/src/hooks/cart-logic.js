export const STORAGE_KEY = "cart:v1"; // có version để sau này migrate dễ

export function safeNumber(n, fb = 0) {
  const x = Number(n);
  return Number.isFinite(x) ? x : fb;
}

export function normalizeItem(raw) {
  const priceAdult = safeNumber(raw.adultPrice ?? raw.price, 0);
  const priceChild = safeNumber(raw.childPrice, Math.round(priceAdult * 0.5));
  return {
    id: raw.id,
    name: raw.name || raw.title || "",
    date: raw.date || "",
    adults: Math.max(0, safeNumber(raw.adults, 0)),
    children: Math.max(0, safeNumber(raw.children, 0)),
    adultPrice: priceAdult,
    childPrice: priceChild,
    selected: raw.selected !== false,
    available: raw.available !== false,
    image: raw.image || "",
  };
}

export function initCartState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(normalizeItem) : [];
  } catch { return []; }
}

export function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const inc = normalizeItem(action.payload);
      const idx = state.findIndex(i => i.id === inc.id && i.date === inc.date);
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
    case "REMOVE":
      return state.filter(i => !(i.id === action.payload.id && i.date === action.payload.date));
    case "QTY":
      return state.map(i =>
        (i.id === action.payload.id && i.date === action.payload.date)
          ? { ...i, [action.payload.field]: Math.max(0, safeNumber(i[action.payload.field]) + safeNumber(action.payload.delta)) }
          : i
      );
    case "SELECT":
      return state.map(i =>
        (i.id === action.payload.id && i.date === action.payload.date)
          ? { ...i, selected: !i.selected }
          : i
      );
    case "AVAILABLE":
      return state.map(i =>
        (i.id === action.payload.id && i.date === action.payload.date)
          ? { ...i, available: !!action.payload.available }
          : i
      );
    case "CLEAR_UNAVAILABLE":
      return state.filter(i => i.available);
    case "CLEAR_ALL":
      return [];
    case "__REPLACE__":
      return Array.isArray(action.payload) ? action.payload.map(normalizeItem) : state;
    default:
      return state;
  }
}
