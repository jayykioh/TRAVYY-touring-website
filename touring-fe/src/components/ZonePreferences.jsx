import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Edit3,
  AlertTriangle,
  Info as InfoIcon,
  Lightbulb,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

// 👉 dùng React.memo để tránh re-render không cần thiết
function PreferencesSummaryInner({ prefs, onEdit }) {
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

  // ⚙️ useMemo để tránh tính toán lại khi prefs không đổi
  const hasVibes = useMemo(
    () => Array.isArray(prefs?.vibes) && prefs.vibes.length > 0,
    [prefs?.vibes]
  );

  const missingKeys = useMemo(
    () =>
      [
        !hasVibes ? "vibes" : null,
        !prefs?.pace ? "pace" : null,
        !prefs?.budget ? "budget" : null,
        !(prefs?.durationDays > 0) ? "durationDays" : null,
      ].filter(Boolean),
    [hasVibes, prefs?.pace, prefs?.budget, prefs?.durationDays]
  );

  const hasMissing = missingKeys.length > 0;

  // 🎨 hoist style ra useMemo để không tạo object mới mỗi render
  const noteStyles = useMemo(
    () => ({
      background: hasMissing
        ? "rgba(2, 160, 170, 0.08)"
        : "rgba(15, 23, 42, 0.04)",
      borderColor: hasMissing ? "#7fdde2" : "rgba(203, 213, 225, 0.8)",
      color: hasMissing ? "#0f3e41" : "#334155",
    }),
    [hasMissing]
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      // hover nhẹ, nhưng không quá “spring” để đỡ tốn
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={`${card} h-full flex flex-col transition-shadow duration-300 hover:shadow-lg`}
      role="region"
      aria-label="Tổng quan sở thích"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <motion.div
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-white"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
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
            // 👉 animate nguyên cụm vibes, không animate từng chip để nhẹ hơn
            <motion.div
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="flex flex-wrap gap-1.5"
            >
              {prefs.vibes.map((v, i) => (
                <span key={i} className={chip}>
                  {v}
                </span>
              ))}
            </motion.div>
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

      {/* Note — chỉ animate nhẹ, không remount bằng key nữa */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: hasMissing ? 1.01 : 1,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="mt-3 p-3 rounded-md border text-[12px] flex items-start gap-2 backdrop-blur-md"
        style={noteStyles}
      >
        {hasMissing ? (
          <>
            <AlertTriangle
              className="w-4 h-4 mt-0.5 flex-shrink-0"
              style={{ color: "#02A0AA" }}
            />
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
                      <InfoIcon
                        className="w-4 h-4"
                        style={{ color: "#02A0AA" }}
                      />
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
            <InfoIcon
              className="w-4 h-4 mt-0.5 flex-shrink-0"
              style={{ color: "#02A0AA" }}
            />
            <div className="space-y-1">
              <p className="font-semibold">Mẹo</p>
              <p>
                Thêm chi tiết như “đi chậm”, “ưu tiên hoàng hôn gần biển”, “tránh leo dốc”
                để match chuẩn hơn.
              </p>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ✅ bọc React.memo để tối ưu re-render
const PreferencesSummary = React.memo(PreferencesSummaryInner);

export default PreferencesSummary;
