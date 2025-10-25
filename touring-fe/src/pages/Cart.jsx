// pages/Cart.jsx
import useCart from "../hooks/useCart";
import CartItemCard from "../components/CartItemCard";
import OrderSummary from "../components/OrderSummary";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton"; // ⬅️ shadcn

export default function CartPage() {
  const { items, totals, remove, qty, toggleSelect, clearAll, loading } =
    useCart();
  const navigate = useNavigate();

  // (Nếu muốn tránh scroll giật, có thể bỏ dòng này)
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          {/* Header skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-56 rounded-md" />
              <Skeleton className="h-4 w-48 rounded-md" />
            </div>
            <Skeleton className="h-10 w-36 rounded-xl" />
          </div>

          {/* Grid skeleton */}
          <div className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6">
            {/* List skeleton */}
            <div className="space-y-4">
              <CartItemSkeleton />
              <CartItemSkeleton />
              <CartItemSkeleton />
            </div>

            {/* Summary skeleton */}
            <div className="space-y-3">
              <Skeleton className="h-8 w-48 rounded-md" />
              <div className="rounded-2xl p-6 border border-gray-200/70 bg-white">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                  <div className="space-y-2 mt-4">
                    <Skeleton className="h-4 w-56" />
                    <Skeleton className="h-4 w-44" />
                    <Skeleton className="h-6 w-40" />
                  </div>
                  <Skeleton className="h-11 w-full rounded-2xl mt-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasItems = items.length > 0;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
              Giỏ hàng
            </h1>
            <p className="text-gray-500 mt-1">
              Bạn có{" "}
              <span className="font-semibold text-gray-700">
                {items.length}
              </span>{" "}
              mục trong giỏ
            </p>
          </div>

          {hasItems && (
            <button
              onClick={clearAll}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl
                         bg-white border border-gray-200 shadow-sm
                         hover:bg-gray-50 hover:shadow transition-all duration-200
                         active:scale-[0.98] text-gray-700 font-medium"
            >
              <svg
                className="w-4 h-4 mr-2 opacity-80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M3 6h18M8 6v14a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M10 6V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2"
                  strokeWidth="1.6"
                />
                <path d="M10 11v6M14 11v6" strokeWidth="1.6" />
              </svg>
              Xoá toàn bộ
            </button>
          )}
        </div>

        {/* Content */}
        {hasItems ? (
          <div className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6">
            {/* List */}
            <div className="space-y-4">
              {items.map((item) => (
                <CartItemCard
                  key={item.itemId}
                  item={item}
                  onRemove={(idOrItemId, date) => remove(idOrItemId, date)}
                  onUpdateQuantity={(id, date, field, delta) =>
                    qty(id, date, field, delta)
                  }
                  onToggleSelect={(id, date) => toggleSelect(id, date)}
                  onOpen={(it) =>
                    navigate(
                      `/tours/${it.id}?date=${encodeURIComponent(
                        it.date || ""
                      )}`
                    )
                  }
                />
              ))}

              {/* Clear all button (mobile) */}
              <div className="sm:hidden pt-2">
                <button
                  onClick={clearAll}
                  className="w-full py-3 rounded-xl font-semibold
                             bg-gradient-to-r from-red-500 to-rose-500 text-white
                             shadow-sm hover:shadow-md transition-all duration-200
                             active:scale-[0.98]"
                >
                  Xoá toàn bộ
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="relative">
              <OrderSummary
                totals={totals}
                cartItems={items}
                onCheckout={() => navigate("/booking")}
              />
            </div>
          </div>
        ) : (
          // Empty state
          <div className="flex flex-col items-center justify-center text-center py-16 sm:py-20">
            <div className="w-20 h-20 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center mb-4">
              <svg
                className="w-10 h-10 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M6 6h15l-1.5 9a2 2 0 0 1-2 1.7H8.5a2 2 0 0 1-2-1.7L5 4H3"
                  strokeWidth="1.6"
                />
                <circle cx="9" cy="20" r="1" />
                <circle cx="18" cy="20" r="1" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Giỏ hàng trống
            </h3>
            <p className="text-gray-500 mt-1 max-w-md">
              Hãy khám phá các tour hấp dẫn và thêm vào giỏ nhé.
            </p>
            <a
              href="/"
              className="mt-5 inline-flex items-center px-4 py-2 rounded-xl
                         bg-[#02A0AA] text-white font-semibold
                         shadow-sm hover:shadow-md 
                         transition-all duration-200 active:scale-[0.98]"
            >
              Khám phá tour
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

/* --- Skeleton for a cart item card --- */
function CartItemSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex gap-4">
      <div className="flex flex-col items-center pt-2">
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      <div className="relative flex-shrink-0">
        <Skeleton className="w-32 h-32 rounded-xl" />
      </div>
      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex justify-between gap-4">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-6 rounded" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
