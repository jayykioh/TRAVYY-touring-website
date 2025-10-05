import { useEffect, useState } from "react";
import { useAuth } from "../auth/context";
import TourCard from "../components/TourCard";

export default function WishlistPage() {
  const { withAuth, booting, isAuth } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (booting || !isAuth) return;

    setLoading(true);
    (async () => {
      try {
        const res = await withAuth("/api/wishlist", {
          method: "GET",
          headers: { "Cache-Control": "no-store" }, 
        });
        if (res?.success) {
          setWishlist(res.data);
        }
      } catch (err) {
        console.error("Error loading wishlist:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [booting, isAuth, withAuth]);

  // Xoá tour khỏi wishlist
  const handleRemove = async (tourId) => {
    try {
      const res = await withAuth(`/api/wishlist/${tourId}`, { method: "DELETE" });
      if (res?.success) {
        setWishlist((prev) => prev.filter((item) => String(item.tourId?._id || item._id) !== String(tourId)));
      }
    } catch (err) {
      console.error("Error removing from wishlist:", err);
    }
  };

  // Loading UI
  if (booting || loading) {
    return <div className="p-6">⏳ Đang tải wishlist...</div>;
  }

  // Empty UI
  if (!wishlist.length) {
    return <div className="p-6 text-gray-500">📭 Chưa có tour nào trong danh sách yêu thích.</div>;
  }

  // Hiển thị danh sách wishlist
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {wishlist.map((item) => {
        const tour = item.tourId || item; // khi populate tourId từ BE
        return (
          <TourCard
            key={tour._id}
            to={`/tours/${tour._id}`}
            image={tour.imageItems?.[0]?.imageUrl}
            title={tour.title}
            location={tour.location}
            rating={tour.rating}
            reviews={tour.reviews}
            bookedText={`${tour.usageCount || 0} Đã đặt`}
            priceFrom={tour.basePrice}
            isFav={true}
            onFav={() => handleRemove(tour._id)}
          />
        );
      })}
    </div>
  );
}
