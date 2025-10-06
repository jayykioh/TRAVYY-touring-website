import { useEffect, useState } from "react";
import { useAuth } from "../auth/context";
import TourCard from "../components/TourCard";

export default function WishlistPage() {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());

  const handleFavoriteToggle = (tourId) => {
    setFavorites((prev) => {
      const newSet = new Set(prev);
      newSet.has(tourId) ? newSet.delete(tourId) : newSet.add(tourId);
      return newSet;
    });
  };

  // Lấy wishlist khi user thay đổi
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    fetch(`/api/wishlist`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setWishlist(res.data);
        }
      })
      .catch((err) => console.error("Error loading wishlist:", err))
      .finally(() => setLoading(false));
  }, [user]);

  // Xoá tour khỏi wishlist
  const handleRemove = async (tourId) => {
    try {
      const res = await fetch(`/api/wishlist/${tourId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        setWishlist((prev) =>
          prev.filter((item) =>
            item.tour ? item.tour._id !== tourId : item._id !== tourId
          )
        );
      } else {
        console.error("Failed to remove from wishlist");
      }
    } catch (err) {
      console.error("Error removing from wishlist:", err);
    }
  };

  // Loading UI
  if (loading) {
    return <div className="p-6">⏳ Đang tải wishlist...</div>;
  }

  // Empty UI
  if (!wishlist.length) {
    return (
      <div className="p-6 text-gray-500">
        📭 Chưa có tour nào trong danh sách yêu thích.
      </div>
    );
  }

  // Hiển thị danh sách wishlist
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {wishlist.map((item) => {
        const tour = item.tourId || item;
        return (
          <TourCard
            id={tour._id}
            to={`/tours/${tour._id}`}
            image={tour.imageItems?.[0]?.imageUrl}
            title={tour.description}
            location={tour.locations?.[0]?.name || "Địa điểm"}
            tags={tour.tags}
            bookedText={`${tour.usageCount} Đã được đặt`}
            rating={tour.isRating}
            reviews={tour.isReview}
            priceFrom={tour.basePrice.toString()}
            originalPrice={tour.basePrice}
            isFav={favorites.has(tour._id)}
            onFav={() => handleFavoriteToggle(tour._id)}
          />
        );
      })}
    </div>
  );
}
