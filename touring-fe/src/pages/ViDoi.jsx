/* eslint-disable no-unused-vars */
// VibeSelectPage.fx.jsx — Animated restyle (logic preserved)
import React, { useMemo, useState } from "react";
import { Sparkles, MapPin, X, ChevronLeft, Waves, Mountain, Utensils, Landmark, Leaf, Sofa, Heart, Compass, Camera, Sunset as SunsetIcon, Music2, ShoppingBag, Home} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../auth/AuthContext";

// ✅ SYNCED WITH DATABASE: Top 16 tags from zone.tags
// Based on frequency analysis: photo(32), nature(19), local(13), history(12), culture(12), food(11), beach(8), temple(7), sunset(7), view(6), architecture(5), nightlife(5), adventure(4), market(4), shopping(4), cave(3)
const vibeOptions = [
  { id: "photo", label: "📸 Chụp ảnh", color: "yellow" },
  { id: "nature", label: "� Thiên nhiên", color: "green" },
  { id: "local", label: "�️ Bản địa", color: "brown" },
  { id: "history", label: "📜 Lịch sử", color: "purple" },
  { id: "culture", label: "🏛️ Văn hóa", color: "purple" },
  { id: "food", label: "� Ẩm thực", color: "orange" },
  { id: "beach", label: "🏖️ Biển", color: "blue" },
  { id: "temple", label: "⛩️ Tâm linh", color: "pink" },
  { id: "sunset", label: "🌅 Hoàng hôn", color: "amber" },
  { id: "view", label: "🏞️ Cảnh đẹp", color: "teal" },
  { id: "architecture", label: "�️ Kiến trúc", color: "indigo" },
  { id: "nightlife", label: "🍻 Nightlife", color: "violet" },
  { id: "adventure", label: "�️ Khám phá", color: "red" },
  { id: "market", label: "🏪 Chợ", color: "orange" },
  { id: "shopping", label: "🛍️ Shopping", color: "pink" },
  { id: "cave", label: "�️ Hang động", color: "gray" }
];

const ALL_VIBES = vibeOptions.map((v) => v.id);
const MAX = 3;

// 🎨 Subtle accent colors per tag (synced with database)
const VIBE_ACCENTS = {
  photo: { hex: "#EAB308", rgba: "rgba(234,179,8,0.35)" },
  nature: { hex: "#22C55E", rgba: "rgba(34,197,94,0.35)" },
  local: { hex: "#64748B", rgba: "rgba(100,116,139,0.35)" },
  history: { hex: "#8B5CF6", rgba: "rgba(139,92,246,0.35)" },
  culture: { hex: "#8B5CF6", rgba: "rgba(139,92,246,0.35)" },
  food: { hex: "#F59E0B", rgba: "rgba(245,158,11,0.35)" },
  beach: { hex: "#6366F1", rgba: "rgba(99,102,241,0.35)" },
  temple: { hex: "#FB7185", rgba: "rgba(251,113,133,0.35)" },
  sunset: { hex: "#FB923C", rgba: "rgba(251,146,60,0.35)" },
  view: { hex: "#14B8A6", rgba: "rgba(20,184,166,0.35)" },
  architecture: { hex: "#6366F1", rgba: "rgba(99,102,241,0.35)" },
  nightlife: { hex: "#7C3AED", rgba: "rgba(124,58,237,0.35)" },
  adventure: { hex: "#EF4444", rgba: "rgba(239,68,68,0.35)" },
  market: { hex: "#F59E0B", rgba: "rgba(245,158,11,0.35)" },
  shopping: { hex: "#F472B6", rgba: "rgba(244,114,182,0.35)" },
  cave: { hex: "#6B7280", rgba: "rgba(107,114,128,0.35)" }
};

const getAccent = (v) => VIBE_ACCENTS[v] || { hex: "#6366F1", rgba: "rgba(99,102,241,0.35)" };

// 🔣 Icon map for vibes (visual hint only)
const VIBE_ICONS = {
  beach: Waves,
  mountain: Mountain,
  food: Utensils,
  culture: Landmark,
  nature: Leaf,
  relax: Sofa,
  romantic: Heart,
  adventure: Compass,
  photo: Camera,
  sunset: SunsetIcon,
  nightlife: Music2,
  shopping: ShoppingBag,
  temple: Landmark,
  local: Home,
  island: Waves,
};

export default function VibeSelectPage() {
  const navigate = useNavigate();
  const { accessToken } = useAuth(); // ✅ Lấy token từ context
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [freeText, setFreeText] = useState("");
  const [useMyLoc, setUseMyLoc] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
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

      const body = {
        vibes: selected,                    // Send selected vibes as array
        freeText: freeText.trim(),          // Send free text separately
        ...(origin && { userLocation: origin })  // Include location if available
      };

      console.log("🔵 Sending request:", body);

      // Get access token from Auth context
      const headers = { "Content-Type": "application/json" };
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const r = await fetch("/api/discover/parse", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        credentials: "include",  // ✅ Gửi refresh_token cookie
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

      {/* Subtle animated grid overlay */}
      <motion.div
        className="absolute inset-0 -z-10 opacity-[0.04]"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #000 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        initial={{ backgroundPosition: "0px 0px" }}
        animate={{ backgroundPosition: ["0px 0px", "20px 20px", "0px 0px"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />

      {/* Header with back button */}
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <motion.button
          {...fadeInUp}
          onClick={() => navigate('/ai-tour-creator')}
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
          <div className="flex flex-wrap gap-3">
            {vibes.map((v, i) => {
              const active = selected.includes(v);
              const disabled = !active && selected.length >= MAX;
              const { hex, rgba } = getAccent(v);
              const Icon = VIBE_ICONS[v];
              return (
                <motion.button
                  key={v}
                  custom={i}
                  variants={chipVariants}
                  initial="initial"
                  animate="animate"
                  whileHover={ active ? { y: -2, boxShadow: `0 12px 28px ${rgba}`, scale: 1.01 } : { y: -2, boxShadow: `0 12px 28px ${rgba}`, backgroundColor: rgba } }
                  whileTap={{ scale: 0.97 }}
                  onClick={() => toggleVibe(v)}
                  disabled={disabled}
                  className={[
                    'group relative inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-base font-semibold border transition focus:outline-none focus:ring-2 focus:ring-offset-2',
                    active
                      ? 'text-white border-transparent'
                      : 'text-slate-800 bg-white border-slate-200',
                    disabled ? 'opacity-50 cursor-not-allowed' : ''
                  ].join(' ')}
                  style={{
                    borderColor: active ? 'transparent' : hex,
                    background: undefined,
                    backgroundColor: active ? rgba : 'white',
                    boxShadow: active ? `0 8px 26px ${rgba}` : undefined
                  }}
                >
                  {/* Accent dot */}
                  <span
                    aria-hidden
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: hex }}
                  />
                  {/* Optional icon */}
                  {Icon ? <Icon className="w-4.5 h-4.5 text-current" /> : null}
                  {/* Label */}
                  <span className={active ? 'text-white' : 'text-slate-800'}>{v}</span>
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
              <span className="text-slate-600">
                Đã chọn: <strong>{selected.length}</strong> / {MAX}
              </span>
              <div className="text-xs text-slate-500 sm:order-2">AI sẽ phân tích & gợi ý khu vực phù hợp</div>
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={openModal}
                disabled={!canContinue}
                className="sm:order-3 inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed shadow"
              >
                <Sparkles className="w-4 h-4" />
                <span className="tracking-wide">Tiếp tục</span>
              </motion.button>
            </div>
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
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-slate-700">
                      Viết ngắn gọn mong muốn của bạn
                    </p>
                    <span className="text-[11px] text-slate-500">{freeText.length}/240</span>
                  </div>

                  {/* Selected vibes preview */}
                  {selected.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {selected.map((sv) => {
                        const { hex, rgba } = getAccent(sv);
                        return (
                          <span
                            key={sv}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium"
                            style={{ color: hex, backgroundColor: 'white', border: `1px solid ${hex}20` }}
                          >
                            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: hex }} />
                            {sv}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <motion.textarea
                    value={freeText}
                    onChange={(e) => setFreeText(e.target.value.slice(0,240))}
                    rows={5}
                    placeholder="Ví dụ: 2–3 ngày, thích street food rẻ, đi nhẹ, tránh đi bộ xa, muốn gần biển"
                    className="w-full px-4 py-3 rounded-xl bg-white/95 border border-slate-300 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                    whileFocus={{ boxShadow: "0 0 0 2px rgba(99,102,241,0.25)" }}
                  />
                </div>

                {/* Preview parse */}
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}

                  disabled={parsing || !freeText}
                  className="text-xs px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-50"
                >
                
                </motion.button>
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
