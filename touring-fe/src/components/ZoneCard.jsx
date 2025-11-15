/* eslint-disable no-unused-vars */
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

export default function ZoneCard({ zone, onExplore, index = 0, size = "md" }) {
  const heroSrc = useMemo(() => {
    if (!zone) return null;
    if (zone.heroImg?.trim()) return zone.heroImg;
    if (Array.isArray(zone.gallery) && zone.gallery.length > 0) return zone.gallery[0];
    return null;
  }, [zone]);

  const isSm = size === "sm";
  const heroH = isSm ? "h-24 sm:h-28" : "h-28 sm:h-32";
  const pad = isSm ? "p-2" : "p-3";
  const titleCls = isSm ? "text-[13px] font-semibold" : "text-sm font-semibold";
  const subCls = isSm ? "text-[11px]" : "text-xs";
  const tagCls = isSm ? "text-[10px] px-2 py-0.5" : "text-[10px] px-2 py-1";

  const matchPercent = zone.finalScore ? Math.round(zone.finalScore * 100) : null;

  return (
    <motion.div
      onClick={() => onExplore && onExplore(zone)}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 260, damping: 22 }}
      className="group relative cursor-pointer rounded-2xl border border-slate-200/70 bg-white/80 backdrop-blur-md shadow-sm hover:shadow-xl transition-all duration-300 ease-out"
    >
      {/* Hero Image */}
      <div className={`relative ${heroH} rounded-t-2xl overflow-hidden`}>
        <motion.div
          className="absolute inset-0 bg-center bg-cover"
          style={{
            backgroundImage: heroSrc ? `url(${encodeURI(heroSrc)})` : undefined,
            filter: "brightness(0.9)",
          }}
          whileHover={{ filter: "brightness(1.05)" }}
          transition={{ duration: 0.3 }}
        />
        {!heroSrc && <div className="absolute inset-0 bg-[linear-gradient(135deg,#0f172acc,#334155cc)]" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Match Badge */}
        {matchPercent !== null && (
          <motion.span
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 + 0.15 }}
            className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/70 text-white backdrop-blur px-2.5 py-0.5 text-[10px] font-medium"
          >
            <TrendingUp className="h-3 w-3" />
            {matchPercent}% match
          </motion.span>
        )}

        {/* Title */}
        <div className="absolute left-3 bottom-2 right-2">
          <h3 className={`${titleCls} text-white drop-shadow truncate`}>{zone?.name}</h3>
          <p className={`${subCls} text-slate-200/90 truncate`}>{zone?.province}</p>
        </div>
      </div>

      {/* Tags */}
      <div className={`flex flex-wrap gap-1 ${pad}`}>
        {Array.isArray(zone?.tags) &&
          zone.tags.slice(0, isSm ? 2 : 3).map((t, i) => (
            <span key={i} className={`rounded-full bg-slate-100 text-slate-700 font-medium ${tagCls}`}>
              {t}
            </span>
          ))}
      </div>

      {/* Subtle floating glow when hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-tr from-slate-200/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />
    </motion.div>
  );
}
