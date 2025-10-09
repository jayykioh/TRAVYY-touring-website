import { useEffect, useState } from "react";
import { useAuth } from "../auth/context";
import TourCard from "../components/TourCard";
import { Skeleton } from "@/components/ui/skeleton"; // ⬅️ shadcn skeleton

function SkeletonTourCard() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
      {/* Image placeholder */}
      <Skeleton className="h-40 w-full" />
      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton className="h-5 w-3/4" />
        {/* Location + rating */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        {/* Price line */}
        <Skeleton className="h-4 w-24" />
        {/* CTA row */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function WishlistPage() {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy wishlist khi user thay đổi
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    fetch(`/api/wishlist`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setWishlist(res.data);
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
          prev.filter((item) => String(item.tourId._id) !== String(tourId))
        );
      } else {
        console.error("Failed to remove from wishlist");
      }
    } catch (err) {
      console.error("Error removing from wishlist:", err);
    }
  };

  // Loading UI -> Skeleton grid (gần giống card layout)
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonTourCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Empty UI (tối giản, nhẹ nhàng)
  if (!wishlist.length) {
    return (
      <div className="max-w-xl mx-auto px-4 py-14 text-center">
        <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center">
          <span className="text-2xl" role="img" aria-label="empty">
            📭
          </span>
        </div>
        <p className="text-neutral-700">Chưa có tour nào trong danh sách yêu thích.</p>
        <button
          onClick={() => (window.location.href = "/")}
          className="mt-4 px-5 py-2.5 rounded-lg text-white text-sm shadow-sm"
          style={{ backgroundColor: "#02A0AA" }}
        >
          Khám phá tour ngay
        </button>
      </div>
    );
  }

  // Hiển thị danh sách wishlist
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {wishlist.map((item) => {
          const tour = item.tourId; // đã populate
          return (
            <TourCard
              key={tour._id}
              to={`/tours/${tour._id}`}
              image={tour.imageItems?.[0]?.imageUrl}
              title={tour.title}
              location={tour.location}
              rating={tour.isRating}
              reviews={tour.isReview}
              bookedText={`${tour.usageCount || 0} Đã đặt`}
              priceFrom={tour.basePrice}
              isFav={true}
              onFav={() => handleRemove(tour._id)}
            />
          );
        })}
      </div>
    </div>
  );
}