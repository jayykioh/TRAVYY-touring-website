import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  Sparkles,
  Edit3,
  AlertTriangle,
  Info as InfoIcon,
  Lightbulb,
} from "lucide-react";

// ⬇️ shadcn/ui
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

export default function PreferencesSummary({ prefs, onEdit }) {
  const card =
    "bg-white/60 backdrop-blur-xl border border-white/20 rounded-lg p-4 shadow-sm";
  const sectionTitle =
    "text-[11px] font-semibold uppercase tracking-wide text-slate-500";
  const label = "text-sm text-slate-600";
  const value = "text-sm font-semibold text-slate-900";
  const chip =
    "px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/60 backdrop-blur border border-slate-200/60 text-slate-800 shadow-sm";
  const chipGhost =
    "px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/40 border border-slate-200/60 text-slate-600 backdrop-blur-sm";
  const row = "flex items-center justify-between gap-3";

  const hasVibes = Array.isArray(prefs?.vibes) && prefs.vibes.length > 0;
  const missing = [
    !hasVibes ? "vibes" : null,
    !prefs?.pace ? "pace" : null,
    !prefs?.budget ? "budget" : null,
    !(prefs?.durationDays > 0) ? "durationDays" : null,
  ].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      className={`${card} h-full flex flex-col`}
      role="region"
      aria-label="Tổng quan sở thích"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Hệ thống hiểu về bạn
            </h3>
            <p className="text-xs text-slate-500">Xem nhanh cấu hình gợi ý</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
          aria-label="Chỉnh sửa sở thích"
        >
          <Edit3 className="w-3.5 h-3.5" />
          Chỉnh sửa
        </button>
      </div>

      {/* Vibes */}
      <div className="mt-1">
        <p className={sectionTitle}>Vibes</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {hasVibes ? (
            prefs.vibes.map((v, i) => (
              <span key={i} className={chip}>
                {v}
              </span>
            ))
          ) : (
            <span className={chipGhost}>Chưa có vibes</span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="border-t border-slate-200/70 my-3" />
      <div className="space-y-1.5">
        <div className={row}>
          <span className={label}>Nhịp độ</span>
          <span className={value}>
            {prefs?.pace || <em className="text-slate-400">Chưa có</em>}
          </span>
        </div>
        <div className={row}>
          <span className={label}>Ngân sách</span>
          <span className={value}>
            {prefs?.budget || <em className="text-slate-400">Chưa có</em>}
          </span>
        </div>
        <div className={row}>
          <span className={label}>Thời gian</span>
          <span className={value}>
            {prefs?.durationDays > 0 ? (
              `${prefs.durationDays} ngày`
            ) : (
              <em className="text-slate-400">Chưa có</em>
            )}
          </span>
        </div>

        <div className="mt-1">
          <p className={sectionTitle}>Tránh</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {prefs?.avoid?.length > 0 ? (
              prefs.avoid.map((a, i) => (
                <span key={i} className={chipGhost}>
                  -{a}
                </span>
              ))
            ) : (
              <span className={chipGhost}>Không có mục cần tránh</span>
            )}
          </div>
        </div>
      </div>

      {/* Note — softened, teal accent (#02A0AA) */}
      <div
        className={`mt-3 p-3 rounded-md border text-[12px] flex items-start gap-2 backdrop-blur-md`}
        style={{
          background:
            missing.length > 0 ? "rgba(2, 160, 170, 0.08)" : "rgba(15, 23, 42, 0.04)",
          borderColor: missing.length > 0 ? "#7fdde2" : "rgba(203, 213, 225, 0.8)",
          color: missing.length > 0 ? "#0f3e41" : "#334155",
        }}
      >
        {missing.length > 0 ? (
          <>
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#02A0AA" }} />
            <div className="space-y-1">
              <p className="font-semibold">Chưa hiểu ý bạn rõ ràng</p>
              <p>
                Hãy bổ sung:{" "}
                {[
                  !hasVibes && "vibes",
                  !prefs?.pace && "nhịp độ",
                  !prefs?.budget && "ngân sách",
                  !(prefs?.durationDays > 0) && "thời gian",
                ]
                  .filter(Boolean)
                  .join(", ")}
                .
              </p>

              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={onEdit}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded font-semibold text-white hover:brightness-110"
                  style={{ backgroundColor: "#02A0AA" }}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Bổ sung
                </button>

                {/* Tips Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-2 py-1 rounded font-semibold border hover:bg-white/70 transition"
                      style={{
                        color: "#026a71",
                        backgroundColor: "rgba(255,255,255,0.7)",
                        borderColor: "#a6eaee",
                      }}
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      Mẹo
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    side="top"
                    align="start"
                    className="w-72 bg-white/80 backdrop-blur-xl border rounded-lg shadow-lg p-3"
                    style={{ borderColor: "#a6eaee" }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <InfoIcon className="w-4 h-4" style={{ color: "#02A0AA" }} />
                      <p className="text-[13px] font-semibold text-slate-800">
                        Gợi ý để hệ thống hiểu tốt hơn
                      </p>
                    </div>
                    <ul className="list-disc ml-4 space-y-1.5 text-[12px] text-slate-700">
                      <li>
                        Thêm <b>vibes</b>: “biển”, “năng động”, “ẩm thực”, “thiên nhiên”
                      </li>
                      <li>
                        Chọn <b>nhịp độ</b>: “chậm rãi”, “vừa phải”, “năng động”
                      </li>
                      <li>
                        Đặt <b>ngân sách</b>: “thấp”, “trung bình”, “cao”
                      </li>
                      <li>
                        Xác định <b>thời gian</b>: “3 ngày”, “5 ngày”, “7 ngày”
                      </li>
                    </ul>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </>
        ) : (
          <>
            <InfoIcon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#02A0AA" }} />
            <div className="space-y-1">
              <p className="font-semibold">Mẹo</p>
              <p>
                Thêm chi tiết như “đi chậm”, “ưu tiên hoàng hôn gần biển”, “tránh leo dốc”
                để match chuẩn hơn.
              </p>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
