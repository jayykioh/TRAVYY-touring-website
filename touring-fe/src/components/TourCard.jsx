import { Link } from "react-router-dom";
import { Heart, Star } from "lucide-react";

export default function TourCard({
  to = "#",
  image,
  title,
  location,
  tags = [],
  rating = 4.8,
  reviews = 2971,
  bookedText = "50K+ Đã được đặt",
  priceFrom = "1,260,000", // "1,260,000"
  onFav,
  isFav = false,
}) {
  return (
    <Link
      to={to}
      className="group block rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-400 ease-out hover:-translate-y-1 "
      style={{ maxWidth: 300 }} // <-- modified line
    >
      {/* Media */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "https://picsum.photos/seed/fallback/600/450";
          }}
          className="h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-105"
        />

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onFav?.();
          }}
          aria-label={isFav ? "Bỏ yêu thích" : "Thêm yêu thích"}
          className="absolute right-3 top-3 grid place-items-center rounded-full bg-white/90 backdrop-blur-sm p-2.5 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 ease-out hover:bg-white z-10"
        >
          <Heart
            className={`h-5 w-5 transition-all duration-300 ${
              isFav
                ? "fill-pink-500 text-pink-500 scale-110"
                : "text-gray-600 hover:text-pink-400"
            }`}
          />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-2">
        {/* Location */}
        {location && (
          <p className="text-xs text-gray-500 font-medium tracking-wide uppercase opacity-90 group-hover:opacity-100 transition-opacity duration-300">
            {location}
          </p>
        )}

        {/* Title */}
        <h3 className="text-[15px] font-semibold leading-snug text-gray-900 line-clamp-2 group-hover:text-gray-800 transition-colors duration-300">
          {title}
        </h3>

        {/* Tags / chips */}
        {tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t, i) => (
              <span
                key={i}
                className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] text-gray-600 font-medium hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 ease-out transform hover:scale-105"
                style={{
                  animationDelay: `${i * 50}ms`,
                }}
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Rating row */}
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1 font-semibold text-amber-500 group-hover:text-amber-600 transition-colors duration-300">
            <Star className="h-4 w-4 fill-current group-hover:scale-110 transition-transform duration-300" />
            <span className="group-hover:scale-105 transition-transform duration-300 inline-block">
              {rating.toFixed(1)}
            </span>
          </span>
          {reviews != null && (
            <span className="text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
              ({reviews.toLocaleString()})
            </span>
          )}
          {bookedText && (
            <>
              <span className="text-gray-300 group-hover:text-gray-400 transition-colors duration-300">
                •
              </span>
              <span className="text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                {bookedText}
              </span>
            </>
          )}
        </div>

        {/* Price */}
        <div className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-300 flex items-center gap-1">
          <span className="text-gray-900 font-bold text-sm group-hover:text-black group-hover:scale-105 transition-all duration-300">
            {Intl.NumberFormat("vi-VN").format(
              Number((priceFrom + "").replace(/[^\d]/g, ""))
            )}
            ₫
          </span>
        </div>
      </div>
    </Link>
  );
}
