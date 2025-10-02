// src/pages/Cart.jsx
import { useEffect } from "react";
import { useCart } from "../hooks/useCart";
import CartItemCard from "../components/CartItemCard";
import OrderSummary from "../components/OrderSummary";

export default function Cart() {
  const {
    items,
    remove,        
    qty,           
    select,        
    totals,     
  } = useCart();

  const { allSubtotal, selectedSubtotal, canCheckout, hasChildrenWithoutAdults, selectedQty } = totals;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [items]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItemCard
              key={`${item.id}-${item.date || ""}`}
              item={item}

              // CartItemCard hiện đang gọi onRemove(id) → mình wrap để luôn dùng item.id/item.date
              onRemove={() => remove(item.id, item.date)}

              // CartItemCard gọi onUpdateQuantity(id, field, delta)
              // -> mình bỏ qua id do đã có trong closure
              onUpdateQuantity={(_id, field, delta) => qty(item.id, item.date, field, delta)}

              // CartItemCard gọi onToggleSelect(id)
              onToggleSelect={() => select(item.id, item.date)}
            />
          ))}
        </div>

        <OrderSummary
          cartItems={items}
          subtotal={allSubtotal}
          discount={0}
          total={selectedSubtotal}
          canCheckout={canCheckout}
          hasChildrenWithoutAdults={hasChildrenWithoutAdults}
          selectedQty={selectedQty}
        />
      </div>
    </div>
  );
}
