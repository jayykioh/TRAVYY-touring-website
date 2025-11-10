import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { MapPin, Star, Navigation2, Tag } from "lucide-react";

/**
 * POICard (minimalist, elegant)
 * Props:
 *  - poi: { id, name, address, category, distanceKm, rating, tags?: string[], loc }
 *  - selected?: boolean
 *  - onSelect?: (poi) => void
 *  - onViewOnMap?: (poi) => void
 *  - dense?: boolean
 */
export default function POICard({
  poi,
  selected = false,
  onSelect,
  onViewOnMap,
  dense = false,
}) {
  const pad = dense ? "p-3" : "p-4";
  const titleSize = dense ? "text-[14px]" : "text-[15px]";
  const subSize = "text-[12px]";
  const hasTags = Array.isArray(poi?.tags) && poi.tags.length > 0;

  const wrap = [
    "group w-full rounded-lg",
    "border bg-white/75 backdrop-blur-xl",
    "border-white/30 hover:border-slate-300",
    "shadow-sm hover:shadow-md",
    "transition-all",
    selected ? "border-slate-900 ring-2 ring-slate-200" : "",
  ].join(" ");

  return (
    <motion.div
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.995 }}
      className={`${wrap} ${pad}`}
      onClick={() => onSelect?.(poi)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect?.(poi);
      }}
      aria-pressed={selected}
      aria-label={`Chọn ${poi?.name || "địa điểm"}`}
    >
      {/* Header: name + rating */}
      <div className="flex items-start justify-between gap-3">
        <h3
          className={[
            "font-semibold text-slate-900 leading-snug line-clamp-2",
            titleSize,
          ].join(" ")}
          title={poi?.name}
        >
          {poi?.name || "Tên địa điểm"}
        </h3>

        {typeof poi?.rating === "number" && (
          <div
            className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5
                       text-amber-700 text-[11px] font-semibold"
            title="Đánh giá"
          >
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            {poi.rating.toFixed(1)}
          </div>
        )}
      </div>

      {/* Address / Category / Distance */}
      <div className="mt-1.5 space-y-1.5">
        <p
          className={`${subSize} text-slate-600 line-clamp-1`}
          title={poi?.address || poi?.category}
        >
          {poi?.address || poi?.category || "Địa điểm tham quan"}
        </p>

        {typeof poi?.distanceKm === "number" && (
          <p className={`${subSize} text-slate-500 flex items-center gap-1.5`}>
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            Cách {poi.distanceKm.toFixed(1)} km
          </p>
        )}
      </div>

      {/* Tags (optional) */}
      {hasTags && (
        <div className="mt-2 flex items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-slate-400" />
          <div className="flex flex-wrap gap-1.5">
            {poi.tags.slice(0, 2).map((t, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-medium"
                title={t}
              >
                {t}
              </span>
            ))}
            {poi.tags.length > 2 && (
              <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 text-[11px] font-medium">
                +{poi.tags.length - 2}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="mt-3 border-t border-slate-200/70" />

      {/* Actions */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
          Nhấn để chọn • xem bản đồ
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewOnMap?.(poi);
          }}
          className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 text-white px-3 py-1.5
                     text-[12px] font-semibold hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
          aria-label="Xem trên bản đồ"
        >
          <Navigation2 className="w-4 h-4" />
          Bản đồ
        </button>
      </div>
    </motion.div>
  );
}
