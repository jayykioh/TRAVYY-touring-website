/* eslint-disable no-unused-vars */
// VibeSelectPage.fx.jsx — Animated restyle (logic preserved)
import React, { useMemo, useState } from "react";
import { Sparkles, MapPin, X, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// ✅ STANDARDIZED: Match with backend vibePatterns
const vibeOptions = [
  { id: "beach", label: "🏖️ Biển", color: "blue" },
  { id: "mountain", label: "🏔️ Núi", color: "green" },
  { id: "food", label: "🍜 Ẩm thực", color: "orange" },
  { id: "culture", label: "🏛️ Văn hóa", color: "purple" },
  { id: "nature", label: "🌿 Thiên nhiên", color: "green" },
  { id: "relax", label: "🧘 Nghỉ ngơi", color: "teal" },
  { id: "romantic", label: "💕 Lãng mạn", color: "pink" },
  { id: "adventure", label: "🗺️ Khám phá", color: "red" },
  { id: "photo", label: "📸 Chụp ảnh", color: "yellow" },
  { id: "sunset", label: "🌅 Hoàng hôn", color: "amber" },
  { id: "nightlife", label: "🍻 Nightlife", color: "violet" },
  { id: "shopping", label: "🛍️ Shopping", color: "pink" },
  { id: "temple", label: "⛩️ Tâm linh", color: "gold" },
  { id: "local", label: "🏘️ Bản địa", color: "brown" },
  { id: "island", label: "🏝️ Đảo", color: "cyan" }
];

const ALL_VIBES = vibeOptions.map((v) => v.id);
const MAX = 3;

export default function VibeSelectPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [freeText, setFreeText] = useState("");
  const [useMyLoc, setUseMyLoc] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [parsedPreview, setParsedPreview] = useState(null);
  const [parsing, setParsing] = useState(false);

  const canContinue = selected.length > 0 && selected.length <= MAX;

  // ====== Logic functions (UNCHANGED) ======
  function toggleVibe(v) {
    setSelected((prev) => {
      if (prev.includes(v)) return prev.filter((x) => x !== v);
      if (prev.length >= MAX) return prev;
      return [...prev, v];
    });
  }

  function openModal() {
    if (!canContinue) return;
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e?.preventDefault();
    e?.stopPropagation();

    console.log("🟢 handleSubmit called!", { selected, freeText });

    if (selected.length === 0 && !freeText.trim()) {
      setErrorMsg("Hãy chọn ít nhất 1 vibe HOẶC mô tả rõ hơn!");
      toast("⚠️ No vibes and no meaningful text");
      return;
    }

    if (selected.length === 0 && freeText.trim().length < 10) {
      setErrorMsg(
        "Mô tả quá ngắn! Hãy cho biết bạn thích gì (ví dụ: biển, núi, ẩm thực...)"
      );
      console.warn("⚠️ Text too short:", freeText);
      return;
    }

    if (submitting) {
      console.warn("⚠️ Already submitting");
      return;
    }

    setErrorMsg("");
    setSubmitting(true);

    try {
      let origin = null;
      if (useMyLoc && navigator.geolocation) {
        console.log("🔵 Getting geolocation...");
        origin = await new Promise((resolve) =>
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              console.log("🟢 Got location:", pos.coords);
              resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            },
            (err) => {
              console.warn("⚠️ Geolocation error:", err);
              resolve(null);
            },
            { enableHighAccuracy: true, timeout: 6000 }
          )
        );
      }

      const combinedText = [...selected, freeText].filter(Boolean).join(", ");

      const body = {
        text: combinedText,
        province: null,
      };

      console.log("🔵 Sending request:", body);

      const r = await fetch("/api/discover/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      console.log("🔵 Response status:", r.status);

      if (!r.ok) {
        const err = await r.text();
        console.error("🔴 Error response:", err);
        throw new Error(`Server trả lỗi ${r.status}: ${err}`);
      }

      const data = await r.json();
      console.log("🟢 Response data:", data);

      try {
        window.sessionStorage.setItem("discover_result", JSON.stringify(data));
        console.log("🟢 Saved to sessionStorage");
      } catch (storageErr) {
        console.error("🔴 SessionStorage error:", storageErr);
      }

      console.log("🔵 Navigating to results...");
      navigate("/discover/results", { state: { data } });
    } catch (e) {
      console.error("🔴 Submit error:", e);
      setErrorMsg(e?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  const vibes = useMemo(() => {
    const hot = [
      "food",
      "sunset",
      "photo",
      "beach",
      "nature",
      "nightlife",
      "culture",
    ];
    const setHot = new Set(hot);
    const rest = ALL_VIBES.filter((v) => !setHot.has(v));
    return [...hot, ...rest];
  }, []);

  async function handlePreviewParse() {
    if (!freeText) return;
    setParsing(true);
    try {
      const combinedText = [...selected, freeText].filter(Boolean).join(", ");

      const r = await fetch("/api/discover/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: combinedText }),
      });

      if (!r.ok) {
        throw new Error(`Error ${r.status}`);
      }

      const data = await r.json();
      setParsedPreview(data.prefs);
    } catch (e) {
      console.error("❌ Preview error:", e);
      setParsedPreview(null);
    } finally {
      setParsing(false);
    }
  }

  // ====== Animation presets ======
  const fadeInUp = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { type: "spring", stiffness: 120, damping: 16 },
  };

  const chipVariants = {
    initial: { opacity: 0, scale: 0.9, y: 8 },
    animate: (i) => ({ opacity: 1, scale: 1, y: 0, transition: { delay: 0.015 * i, type: "spring", stiffness: 280, damping: 18 } }),
    whileHover: { y: -2 },
    whileTap: { scale: 0.96 },
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-purple-50">
      {/* Soft animated background orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-purple-200/40 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="absolute -bottom-24 -right-24 w-[480px] h-[480px] rounded-full bg-blue-200/40 blur-3xl"
        />
      </div>

      {/* Header with back button */}
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <motion.button
          {...fadeInUp}
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-slate-200 shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Quay lại
        </motion.button>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-6 pb-12">
        {/* Title */}
        <motion.div
          {...fadeInUp}
          transition={{ ...fadeInUp.transition, delay: 0.05 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
            Chọn vibes bạn mong muốn
          </h1>
          <p className="text-slate-600">
            Hãy chọn tối đa <span className="font-semibold">{MAX}</span> vibes để chúng mình gợi ý điểm đến phù hợp ✨
          </p>
        </motion.div>

        {/* Chips card */}
        <motion.div
          {...fadeInUp}
          transition={{ ...fadeInUp.transition, delay: 0.1 }}
          className="bg-white/90 rounded-2xl shadow-lg ring-1 ring-slate-200/60 p-5"
        >
          <div className="flex flex-wrap gap-2">
            {vibes.map((v, i) => {
              const active = selected.includes(v);
              const disabled = !active && selected.length >= MAX;
              return (
                <motion.button
                  key={v}
                  custom={i}
                  variants={chipVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="whileHover"
                  whileTap="whileTap"
                  onClick={() => toggleVibe(v)}
                  disabled={disabled}
                  className={[
                    "px-3 py-2 rounded-full text-sm font-medium border transition focus:outline-none focus:ring-2 focus:ring-offset-2",
                    active
                      ? "bg-indigo-600 text-white border-indigo-600 shadow"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200",
                    disabled ? "opacity-50 cursor-not-allowed" : "",
                  ].join(" ")}
                >
                  {v}
                </motion.button>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between mt-4 text-sm"
          >
            <span className="text-slate-500">
              Đã chọn: <strong>{selected.length}</strong> / {MAX}
            </span>
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={openModal}
              disabled={!canContinue}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed shadow"
            >
              <Sparkles className="w-4 h-4" />
              Tiếp tục
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Gợi ý nhỏ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-4 text-center text-xs text-slate-500"
        >
          Gợi ý: “food, sunset, photo” / “nature, hiking, waterfall” / “nightlife, music, bar”
        </motion.div>
      </div>

      {/* Modal nhập mô tả */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                console.log("🔵 Backdrop clicked - closing modal");
                setShowModal(false);
              }}
            />

            {/* Sheet/Card */}
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 160, damping: 18 }}
              className="absolute inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[720px] w-full bg-white rounded-t-2xl md:rounded-2xl shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-semibold text-slate-900">Mô tả mong muốn</h2>
                </div>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  transition={{ type: "spring", stiffness: 260, damping: 14 }}
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded hover:bg-slate-100"
                  aria-label="Đóng"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  Viết ngắn gọn: ví dụ “2–3 ngày, thích street food rẻ, đi nhẹ, tránh đi bộ xa, muốn gần biển”
                </p>
                <motion.textarea
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  rows={4}
                  placeholder="Mô tả tự do của bạn…"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  whileFocus={{ boxShadow: "0 0 0 2px rgba(99,102,241,0.4)" }}
                />

                {/* Preview parse */}
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePreviewParse}
                  disabled={parsing || !freeText}
                  className="text-xs px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-50"
                >
                  {parsing ? "Đang phân tích..." : "🔍 Xem hệ thống hiểu gì"}
                </motion.button>

                <AnimatePresence>
                  {parsedPreview && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="bg-indigo-50 border border-indigo-200 rounded p-2 text-xs"
                    >
                      <p className="font-medium">Hệ thống hiểu:</p>
                      {parsedPreview.pace && <p>• Nhịp độ: {parsedPreview.pace}</p>}
                      {parsedPreview.budget && <p>• Ngân sách: {parsedPreview.budget}</p>}
                      {parsedPreview.durationDays > 0 && (
                        <p>• Thời gian: {parsedPreview.durationDays} ngày</p>
                      )}
                      {parsedPreview.avoid?.length > 0 && (
                        <p>• Tránh: {parsedPreview.avoid.join(", ")}</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={useMyLoc}
                    onChange={(e) => setUseMyLoc(e.target.checked)}
                  />
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    Dùng vị trí hiện tại để gợi ý nơi gần hơn
                  </span>
                </label>

                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-red-600 bg-red-50 border border-red-100 rounded p-2"
                  >
                    {errorMsg}
                  </motion.div>
                )}

                <div className="flex gap-2 pt-2">
                  <motion.button
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 py-2 rounded-lg font-medium"
                  >
                    Quay lại
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      console.log("🟢 Submit button clicked!");
                      handleSubmit(e);
                    }}
                    disabled={submitting || selected.length === 0}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Đang tạo gợi ý…" : "Tạo gợi ý điểm đến"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
