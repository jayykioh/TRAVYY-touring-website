import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

/* ---------------- SVG ICONS ---------------- */
const Svg = ({ children, className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
);

const GlobeIcon = ({ className = "w-5 h-5" }) => (
  <Svg className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a15 15 0 0 0 0 18a15 15 0 0 0 0-18Z" />
  </Svg>
);

const BeachIcon = ({ className = "w-5 h-5" }) => (
  <Svg className={className}>
    <path d="M4 10c3-6 13-6 16 0" />
    <path d="M12 7v11" />
    <path d="M5 10h14" />
    <path d="M3 18c1.2.9 2.4.9 3.6 0c1.2-.9 2.4-.9 3.6 0c1.2.9 2.4.9 3.6 0c1.2-.9 2.4-.9 3.6 0" />
  </Svg>
);

const CitadelIcon = ({ className = "w-5 h-5" }) => (
  <Svg className={className}>
    <path d="M5 9h14l-2-3H7l-2 3Z" />
    <rect x="6" y="9" width="12" height="9" rx="1" />
    <path d="M10 18v-4h4v4" />
    <path d="M8 6V4l2 1l-2 1Z" />
    <path d="M16 6V4l2 1l-2 1Z" />
  </Svg>
);

const CaveIcon = ({ className = "w-5 h-5" }) => (
  <Svg className={className}>
    <path d="M3 18c0-7 4-12 9-12s9 5 9 12" />
    <path d="M8 18c0-3 2-6 4-6s4 3 4 6" />
    <path d="M3 18h18" />
  </Svg>
);

const IslandIcon = ({ className = "w-5 h-5" }) => (
  <Svg className={className}>
    <circle cx="12" cy="7" r="2.2" />
    <path d="M3 18c1.5-1 4-1 6 0c2 1 4 1 6 0c2-1 4-1 6 0" />
    <path d="M4 20c1 .6 2 .6 3 0c1-.6 2-.6 3 0c1 .6 2 .6 3 0c1-.6 2-.6 3 0" />
  </Svg>
);

/* 🌅 Nha Trang – sun over sea */
const SunSeaIcon = ({ className = "w-5 h-5" }) => (
  <Svg className={className}>
    {/* sun */}
    <circle cx="12" cy="8" r="2.5" />
    {/* rays */}
    <path d="M12 3v1.5M12 13.5v1.5M7.5 8H6M18 8h-1.5M8.5 5L7.5 4M15.5 12L16.5 13M15.5 5L16.5 4M8.5 12L7.5 13" />
    {/* waves */}
    <path d="M3 17c1 .7 2 .7 3 0s2-.7 3 0s2 .7 3 0s2-.7 3 0s2 .7 3 0" />
  </Svg>
);

/* ---------------- PROVINCES ---------------- */
const PROVINCES = [
  { id: "all", name: "Tất cả", icon: <GlobeIcon className="w-5 h-5 text-gray-700" /> },
  { id: "da-nang", name: "Đà Nẵng", icon: <BeachIcon className="w-5 h-5 text-sky-600" /> },
  { id: "hue", name: "Huế", icon: <CitadelIcon className="w-5 h-5 text-amber-700" /> },
  { id: "quang-ngai", name: "Quảng Ngãi", icon: <IslandIcon className="w-5 h-5 text-indigo-600" /> },
  { id: "nha-trang", name: "Nha Trang", icon: <SunSeaIcon className="w-5 h-5 text-cyan-600" /> },
  { id: "quang-binh", name: "Quảng Bình", icon: <CaveIcon className="w-5 h-5 text-emerald-700" /> },
];

/* ---------------- COMPONENT ---------------- */
export default function ProvinceFilter({ value, onChange }) {
  return (
    <div className="rounded-2xl bg-white/40 backdrop-blur-lg">
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {PROVINCES.map((p) => {
          const active = value === p.id;
          return (
            <motion.button
              key={p.id}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange(p.id)}
              aria-pressed={active}
              className={`group px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[13px] sm:text-sm font-medium 
                border transition-all duration-200 flex items-center
                ${
                  active
                    ? "bg-white/90 border-slate-300 text-slate-900 shadow-sm"
                    : "bg-white/30 border-white/20 text-slate-700 hover:bg-white/50 hover:border-white/40"
                }`}
            >
              <span className="mr-1.5 sm:mr-2 transition-transform group-hover:scale-110">
                {p.icon}
              </span>
              {p.name}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
