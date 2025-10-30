import React from "react";
import {
  Camera,
  Map,
  Mountain,
  Utensils,
  Landmark,
  ShoppingBag,
  Moon,
  Clock
} from "lucide-react";

const CATEGORY_CONFIG = [
  { key: "views", label: "Điểm tham quan", icon: Camera },
  { key: "beach", label: "Biển & Đảo", icon: Map },
  { key: "nature", label: "Thiên nhiên", icon: Mountain },
  { key: "food", label: "Ẩm thực", icon: Utensils },
  { key: "culture", label: "Văn hóa", icon: Landmark },
  { key: "shopping", label: "Mua sắm", icon: ShoppingBag },
  { key: "nightlife", label: "Giải trí", icon: Moon },
  { key: "recent", label: "Đã tìm gần đây", icon: Clock }, // ✅ NEW
];

export default function POICategoryTabs({ activeCategory, onSelectCategory }) {
  return (
    <div className="rounded-xl bg-white/80 backdrop-blur-sm border shadow-sm overflow-hidden">
      <div className="grid grid-cols-4 gap-px bg-slate-200">
        {CATEGORY_CONFIG.map(({ key, label, icon: Icon }) => {
          const isActive = activeCategory === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectCategory?.(key)}
              aria-pressed={isActive}
              aria-current={isActive ? "true" : "false"}
              className={[
                "min-h-[76px] w-full px-2 py-2 text-center",
                "transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#02A0AA]",
                isActive
                  ? "bg-[#02A0AA] text-white shadow-md ring-2 ring-[#02A0AA] scale-[0.99]"
                  : "bg-white text-slate-700 hover:bg-white",
                "active:scale-[0.98] active:shadow-inner",
              ].join(" ")}
            >
              <div className="flex flex-col items-center gap-1">
                <Icon className={["w-5 h-5", isActive ? "text-white" : "text-slate-600"].join(" ")} />
                <span className={["text-[10px] font-semibold leading-none", isActive ? "text-white" : "text-slate-800"].join(" ")}>
                  {label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
