/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Compass,
  Image as ImageIcon,
  Sun,
  CloudSun,
  Sunset,
  Moon,
  Cloud,
  Sparkles,
  ThumbsUp,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

export default function ZonePreview({ zone, onExplore, verbose = true }) {
  const card =
    "bg-white/70 backdrop-blur-xl border border-white/20 rounded-xl shadow-md overflow-hidden h-full flex flex-col";
  const heroH = "h-36";
  const bodyPad = "p-4 pb-3 space-y-2";

  if (!zone) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`${card} items-center justify-center`}
      >
        <p className="text-slate-600">Chọn một zone để xem chi tiết</p>
      </motion.div>
    );
  }

  // ✅ FIXED: Calculate from finalScore
  const matchPercent = zone.finalScore
    ? Math.round(zone.finalScore * 100)
    : null;

  // ✅ Debug log
  console.log("[ZonePreview]", {
    name: zone.name,
    finalScore: zone.finalScore,
    matchPercent,
  });

  const imgSrc = zone.heroImg || zone.gallery?.[0];

  const bestTimeIcon = (time) => {
    switch (time) {
      case "morning":
        return <Sun className="w-4 h-4 text-amber-400" />;
      case "afternoon":
        return <CloudSun className="w-4 h-4 text-orange-400" />;
      case "evening":
        return <Sunset className="w-4 h-4 text-pink-500" />;
      case "night":
        return <Moon className="w-4 h-4 text-indigo-400" />;
      case "anytime":
        return <Cloud className="w-4 h-4 text-slate-400" />;
      default:
        return null;
    }
  };

  const bestTimeLabel = (time) => {
    switch (time) {
      case "morning":
        return "Buổi sáng";
      case "afternoon":
        return "Buổi chiều";
      case "evening":
        return "Hoàng hôn";
      case "night":
        return "Ban đêm";
      case "anytime":
        return "Bất kỳ thời điểm nào";
      default:
        return "";
    }
  };

  return (
    <motion.div
      key={zone.id}
      initial={{ opacity: 0, x: 10, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25 }}
      className={card}
    >
      {/* Hero */}
      <div className={`relative ${heroH} bg-slate-200`}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={zone.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <ImageIcon className="w-10 h-10 text-slate-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

        {/* ✅ Match Badge - FIXED */}
        {matchPercent !== null && (
          <motion.span
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/70 text-white backdrop-blur px-2.5 py-0.5 text-[10px] font-medium"
          >
            <TrendingUp className="h-3 w-3" />
            {matchPercent}% match
          </motion.span>
        )}

        {/* Title */}
        <div className="absolute left-3 bottom-2 right-3">
          <h3 className="text-white text-[15px] sm:text-[16px] font-semibold leading-tight drop-shadow">
            {zone.name}
          </h3>
          <p className="text-slate-200 text-[11px] flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5" />
            {zone.province}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className={bodyPad}>
        {/* Tags */}
        {zone.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {zone.tags.slice(0, 3).map((t, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-800"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {zone.desc && (
          <p className="text-[13px] text-slate-700 leading-relaxed line-clamp-2">
            {zone.desc}
          </p>
        )}

        {/* Best Time */}
        {verbose && zone.bestTime && (
          <div className="flex items-center gap-1 text-[12px] text-slate-600">
            {bestTimeIcon(zone.bestTime)}
            <span>{bestTimeLabel(zone.bestTime)}</span>
          </div>
        )}

        {/* Activities & Tips */}
        {verbose && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[12px] text-slate-600 space-y-1"
          >
            {zone.funActivities?.length > 0 && (
              <div className="flex items-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-500 mt-0.5" />
                <span>{zone.funActivities[0]}</span>
              </div>
            )}
            {zone.tips?.length > 0 && (
              <div className="flex items-start gap-1.5">
                <ThumbsUp className="w-3.5 h-3.5 text-green-500 mt-0.5" />
                <span>{zone.tips[0]}</span>
              </div>
            )}
            {zone.donts?.length > 0 && (
              <div className="flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5" />
                <span>{zone.donts[0]}</span>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-auto border-t border-slate-200/60 bg-white/60 backdrop-blur-md px-3 py-2.5 flex gap-2">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${zone?.center?.lat},${zone?.center?.lng}`}
          target="_blank"
          rel="noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-300/70 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          <MapPin className="w-3.5 h-3.5" />
          Bản đồ - Xem trên Google Map
        </a>

        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={onExplore}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-slate-900 px-2.5 py-1.5 text-[12px] font-semibold text-white hover:bg-slate-700 transition"
        >
          <Compass className="w-3.5 h-3.5" />
          Khám phá
        </motion.button>
      </div>
    </motion.div>
  );
}
