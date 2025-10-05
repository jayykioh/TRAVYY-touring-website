import { useEffect, useState } from "react";
import { useAuth } from "../auth/context";
import TourCard from "../components/TourCard";
import LoadingScreen from "@/components/LoadingScreen";

export default function WishlistPage() {
  const { withAuth, booting, isAuth } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());

  const handleFavoriteToggle = (tourId) => {
    const key = String(tourId);
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // Lấy wishlist khi trạng thái auth thay đổi
  useEffect(() => {
    if (booting) return;

    // Nếu chưa đăng nhập
    if (!isAuth) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const res = await withAuth("/api/wishlist", {
          method: "GET",
          headers: { "Cache-Control": "no-store" },
        });
        if (res?.success && Array.isArray(res.data)) {
          // Lọc bớt item lỗi (tourId null) phòng hờ BE
          const safe = res.data.filter((it) => it?.tourId);
          setWishlist(safe);
        }
      } catch (err) {
        console.error("Error loading wishlist:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [booting, isAuth, withAuth]);

  // Xoá tour khỏi wishlist
  const handleRemove = async (tourId) => {
    try {
      const res = await withAuth(`/api/wishlist/${tourId}`, { method: "DELETE" });
      // Giả sử BE trả { success: true } hoặc 204; ta chỉ cần khác lỗi là cập nhật UI
      if (res?.success !== false) {
        setWishlist((prev) =>
          prev.filter(
            (item) =>
              String(item.tourId?._id || item._id) !== String(tourId)
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
  if (booting || loading) {
    return <LoadingScreen />;
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
        const tour = item.tourId ?? item; // khi BE populate tourId
        const tourId = tour?._id;

        return (
          <TourCard
            key={tourId}
            id={tourId}
            to={`/tours/${tourId}`}
            image={tour?.imageItems?.[0]?.imageUrl || tour?.images?.[0]}
            title={tour?.title || tour?.description || "Chưa có tiêu đề"}
            location={
              tour?.location?.name ||
              tour?.locations?.[0]?.name ||
              "Địa điểm"
            }
            tags={tour?.tags || []}
            bookedText={`${tour?.usageCount ?? 0} đã đặt`}
            rating={tour?.rating ?? 0}
            reviews={tour?.reviews ?? 0}
            priceFrom={tour?.basePrice}
            originalPrice={tour?.basePrice}
            isFav={favorites.has(String(tourId))}
            onFav={() => handleFavoriteToggle(tourId)}
            onRemove={() => handleRemove(tourId)}
          />
        );
      })}
    </div>
  );
}
