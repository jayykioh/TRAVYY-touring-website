import { useState, useEffect } from "react";
import CartItemCard from "../components/CartItemCard";
import OrderSummary from "../components/OrderSummary";

export default function Cart() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Vé Xe Buýt 2 Tầng Ngắm Cảnh Ở TP.HCM",
      subtitle: "City Sightseeing Tour",
      image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400",
      date: "9/10/2025",
      duration: "4 giờ",
      locations: "2 Điểm tham quan",
      adults: 1,
      children: 0,
      adultPrice: 325000,
      childPrice: 162500,
      available: true,
      selected: true,
    },
    {
      id: 2,
      name: "Tour Tham Quan Địa Đạo Củ Chi & Cao Đài",
      subtitle: "Cu Chi Tunnels & Cao Dai Temple",
      image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=400",
      date: "1/10/2025",
      duration: "Cả ngày",
      locations: "Củ Chi, Cao Đài",
      adults: 0,
      children: 1,
      adultPrice: 450000,
      childPrice: 225000,
      available: false,
      selected: false,
    },
  ]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [cartItems]);

  const updateQuantity = (id, type, change) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, [type]: Math.max(0, item[type] + change) } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const toggleSelect = (id) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

const calculateTotals = () => {
  // Tổng tất cả khả dụng
  const allSubtotal = cartItems
    .filter(item => item.available && (item.adults > 0 || item.children > 0))
    .reduce(
      (sum, item) => sum + item.adults * item.adultPrice + item.children * item.childPrice,
      0
    );

  // Tổng chỉ item được tick + khả dụng + có số lượng > 0
  const selectedSubtotal = cartItems
    .filter(item => item.available && item.selected && (item.adults > 0 || item.children > 0))
    .reduce(
      (sum, item) => sum + item.adults * item.adultPrice + item.children * item.childPrice,
      0
    );

  return { allSubtotal, selectedSubtotal };
};




  const { allSubtotal, selectedSubtotal } = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
        {/* Danh sách item */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              onRemove={removeItem}
              onUpdateQuantity={updateQuantity}
              onToggleSelect={toggleSelect}
            />
          ))}
        </div>

        <OrderSummary
          cartItems={cartItems}
          subtotal={allSubtotal}
          discount={0}
          total={selectedSubtotal}
        />
      </div>
    </div>
  );
}
