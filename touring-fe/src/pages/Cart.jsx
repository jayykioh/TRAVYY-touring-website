// src/pages/Cart.jsx
import { useEffect } from "react";
import { useCart } from "../hooks/useCart";
import CartItemCard from "../components/CartItemCard";
import OrderSummary from "../components/OrderSummary";

export default function Cart() {
  const {
    items,
    removeItem,
    updateQty,
    toggleSelect,
    totals: { allSubtotal, selectedSubtotal, canCheckout, hasChildrenWithoutAdults, selectedQty },
  } = useCart();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [items]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              onRemove={removeItem}
              onUpdateQuantity={(id, field, delta) => updateQty(id, field, delta)}
              onToggleSelect={toggleSelect}
            />
          ))}
        </div>

        <OrderSummary
          cartItems={items}
          subtotal={allSubtotal}
          discount={0}
          total={selectedSubtotal}
          // (tuỳ) truyền cờ để disable nút thanh toán
          canCheckout={canCheckout}
          hasChildrenWithoutAdults={hasChildrenWithoutAdults}
          selectedQty={selectedQty}
        />
      </div>
    </div>
  );
}
