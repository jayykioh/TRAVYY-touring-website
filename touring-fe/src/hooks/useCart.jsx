// hooks/useCart.jsx
import { useContext, useMemo } from "react";
import { CartContext } from "../components/CartContext";
import { useAuth } from "../auth/context";
import { toast } from "sonner";

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("CartContext not found. Wrap with <CartProvider>.");

  const { user, withAuth } = useAuth() || {};
  const token = user?.token;
  const { items, totals, replace, loading } = ctx;

  const findLine = (id, date) => items?.find?.((i) => i.id === id && i.date === date);

  function needLoginGuard(msg = "Bạn cần đăng nhập để thao tác giỏ hàng.") {
    if (!token) {
      toast.warning(msg);
      throw new Error("AUTH_REQUIRED");
    }
  }

  function handleApiError(e, fallbackMsg = "Đã có lỗi xảy ra. Vui lòng thử lại.") {
    // e.status & e.body đến từ helper api() của bạn
    if (e?.status === 409 && e?.body?.error === "EXCEEDS_DEPARTURE_CAPACITY") {
      const limit = e.body?.limit ?? "?";
      toast.warning(`Số lượng vượt quá số chỗ còn lại (${limit}).`);
      return;
    }
    if (e?.status === 401) {
      toast.warning("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      return;
    }
    toast.error(fallbackMsg);
    // Log chi tiết cho dev
    console.error(fallbackMsg, e);
  }

  // ============ Actions ============
  async function add(tour, quantity = 1, opts = {}) {
    needLoginGuard("Bạn cần đăng nhập để thêm vào giỏ.");
    const payload = {
      tourId: tour._id || tour.id,
      date: (opts.date || tour.date || "").slice(0, 10),
      adults: opts.adults ?? quantity ?? 1,
      children: opts.children ?? 0,
      name: tour.title || tour.name,
      image: tour.image || tour.imageUrl,
    };
    try {
      const res = await withAuth("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      replace(res?.items || []);
      toast.success("Đã thêm vào giỏ hàng.");
    } catch (e) {
      handleApiError(e, "Không thể thêm vào giỏ hàng.");
    }
  }

  async function remove(idOrItemId, date) {
    needLoginGuard("Bạn cần đăng nhập để xoá khỏi giỏ.");
    try {
      let itemId = idOrItemId;
      const isObjectId = typeof itemId === "string" && /^[a-f0-9]{24}$/i.test(itemId);
      if (!isObjectId) itemId = findLine(idOrItemId, date)?.itemId;
      if (!itemId) return;

      const res = await withAuth(`/api/cart/${itemId}`, { method: "DELETE" });
      replace(res?.items || []);
      toast.success("Đã xoá mục khỏi giỏ.");
    } catch (e) {
      handleApiError(e, "Xoá mục khỏi giỏ thất bại.");
    }
  }

  async function qty(id, date, field, delta) {
    needLoginGuard("Bạn cần đăng nhập để cập nhật số lượng.");
    try {
      const line = findLine(id, date);
      if (!line?.itemId) return;

      const next = Math.max(0, (line[field] || 0) + (delta || 0));
      const res = await withAuth(`/api/cart/${line.itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: next }),
      });
      replace(res?.items || []);
      // toast nhẹ để tránh spam khi bấm +/-
      if (delta < 0 && next === 0) toast.info("Bạn đã giảm số vé về 0.");
    } catch (e) {
      handleApiError(e, "Cập nhật số lượng thất bại.");
    }
  }

  async function toggleSelect(id, date) {
    needLoginGuard("Bạn cần đăng nhập để cập nhật lựa chọn.");
    try {
      const line = findLine(id, date);
      if (!line?.itemId) return;

      const res = await withAuth(`/api/cart/${line.itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selected: !line.selected }),
      });
      replace(res?.items || []);
      toast.success(!line.selected ? "Đã chọn mục." : "Đã bỏ chọn mục.");
    } catch (e) {
      handleApiError(e, "Cập nhật lựa chọn thất bại.");
    }
  }

  async function clearAll() {
    needLoginGuard("Bạn cần đăng nhập để xoá giỏ.");
    try {
      const res = await withAuth("/api/cart", { method: "DELETE" });
      replace(res?.items || []);
      toast.success("Đã xoá toàn bộ giỏ hàng.");
    } catch (e) {
      handleApiError(e, "Xoá toàn bộ giỏ thất bại.");
    }
  }

  // ✅ Refresh cart from server (after payment, etc.)
  async function refreshCart() {
    if (!token) {
      replace([]);
      return;
    }
    try {
      const res = await withAuth("/api/cart", { method: "GET" });
      replace(res?.items || []);
      console.log('[Cart] Refreshed cart:', res?.items?.length || 0, 'items');
    } catch (e) {
      console.error('[Cart] Failed to refresh cart:', e);
      replace([]);
    }
  }

async function selectOnlyByKey(tourId, date) {
  const res = await withAuth("/api/cart/select-only", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemKey: { tourId, date: String(date).slice(0,10) } }),
  });
  replace(res?.items || []); // <- QUAN TRỌNG: update CartContext
  return res?.selectedItemId || null;
}


  return useMemo(
    () => ({
      loading,
      items,
      totals,
      add,
      remove,
      qty,
      toggleSelect,
      clearAll,
      refreshCart,
      selectOnlyByKey
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loading, items, totals]
  );
}

export default useCart;
