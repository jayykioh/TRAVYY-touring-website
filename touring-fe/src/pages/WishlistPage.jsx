import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../auth/context";
import TourCard from "../components/TourCard";

export default function WishlistPage() {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    axios
      .get(`http://localhost:5000/api/wishlist/${user._id}`)
      .then((res) => {
        console.log("Wishlist data:", res.data); // 👉 check data thực tế
        setWishlist(res.data);
      })
      .catch((err) => console.error("Error loading wishlist:", err))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return <div className="p-6">⏳ Đang tải wishlist...</div>;
  }

  if (!wishlist.length) {
    return (
      <div className="p-6 text-gray-500">
        📭 Chưa có tour nào trong danh sách yêu thích.
      </div>
    );
  }

  // Hàm xoá tour khỏi wishlist
  const handleRemove = async (tourId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/wishlist/${user._id}/${tourId}`
      );
      setWishlist((prev) =>
        prev.filter((item) =>
          item.tour ? item.tour._id !== tourId : item._id !== tourId
        )
      );
    } catch (err) {
      console.error("Error removing from wishlist:", err);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {wishlist.map((item) => {
        // Hỗ trợ cả 2 format:
        const tour = item.tour || item;
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
