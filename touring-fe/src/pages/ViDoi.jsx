/* eslint-disable no-unused-vars */
// VibeSelectPage.fx.jsx — Animated restyle (logic preserved)
import React, { useMemo, useState, useEffect } from "react";
import {
  Sparkles,
  MapPin,
  X,
  ChevronLeft,
  Waves,
  Mountain,
  Utensils,
  Landmark,
  Leaf,
  Sofa,
  Heart,
  Compass,
  Camera,
  Sunset as SunsetIcon,
  Music2,
  ShoppingBag,
  Home,
  History,
  Clock,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../auth/context";

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
  { id: "island", label: "🏝️ Đảo", color: "cyan" },
];

const ALL_VIBES = vibeOptions.map((v) => v.id);
const MAX = 3;

// 🎨 Subtle accent colors per vibe (used only for styling, logic unchanged)
const VIBE_ACCENTS = {
  beach: { hex: "#6366F1", rgba: "rgba(99,102,241,0.35)" },
  mountain: { hex: "#10B981", rgba: "rgba(16,185,129,0.35)" },
  food: { hex: "#F59E0B", rgba: "rgba(245,158,11,0.35)" },
  culture: { hex: "#8B5CF6", rgba: "rgba(139,92,246,0.35)" },
  nature: { hex: "#22C55E", rgba: "rgba(34,197,94,0.35)" },
  relax: { hex: "#14B8A6", rgba: "rgba(20,184,166,0.35)" },
  romantic: { hex: "#EC4899", rgba: "rgba(236,72,153,0.35)" },
  adventure: { hex: "#EF4444", rgba: "rgba(239,68,68,0.35)" },
  photo: { hex: "#EAB308", rgba: "rgba(234,179,8,0.35)" },
  sunset: { hex: "#FB923C", rgba: "rgba(251,146,60,0.35)" },
  nightlife: { hex: "#7C3AED", rgba: "rgba(124,58,237,0.35)" },
  shopping: { hex: "#F472B6", rgba: "rgba(244,114,182,0.35)" },
  temple: { hex: "#FB7185", rgba: "rgba(251,113,133,0.35)" },
  local: { hex: "#64748B", rgba: "rgba(100,116,139,0.35)" },
  island: { hex: "#06B6D4", rgba: "rgba(6,182,212,0.35)" },
};

const getAccent = (v) =>
  VIBE_ACCENTS[v] || { hex: "#6366F1", rgba: "rgba(99,102,241,0.35)" };

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
  const { isAuth, withAuth } = useAuth();
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [freeText, setFreeText] = useState("");
  const [useMyLoc, setUseMyLoc] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [parsedPreview, setParsedPreview] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    type: null,
    entryId: null,
  });

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

      // 💾 Save to user history if logged in
      if (isAuth) {
        console.log("🟢 User is authenticated, saving to history...", {
          vibes: selected,
          freeText,
          zonesCount: data.zones?.length,
        });
        saveToHistory(selected, freeText, data.prefs, data.zones);
      } else {
        console.warn("⚠️ User not authenticated, skipping history save");
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

  // 💾 Save search to history
  async function saveToHistory(vibes, freeText, parsedPrefs, zoneResults) {
    try {
      console.log("📤 Sending history to backend:", {
        vibes,
        freeText,
        parsedPrefs,
        zonesCount: zoneResults?.length,
      });

      const response = await withAuth("/api/discover/save-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vibes,
          freeText,
          parsedPrefs,
          zoneResults,
        }),
      });

      console.log("✅ History saved successfully:", response);

      // Reload history to update UI
      loadHistory();
    } catch (error) {
      console.error("❌ Failed to save history:", error);
    }
  }

  // 📜 Load history
  async function loadHistory() {
    if (!isAuth) return;
    setLoadingHistory(true);
    try {
      const data = await withAuth("/api/discover/history");
      if (data.ok) {
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error("❌ Failed to load history:", error);
    } finally {
      setLoadingHistory(false);
    }
  }

  // 🔄 Load from history entry
  function loadFromHistory(entry) {
    setSelected(entry.vibes || []);
    setFreeText(entry.freeText || "");
    setShowHistory(false);
    toast.success("Đã tải lại lựa chọn cũ!");
  }

  // 👁️ View history results
  function viewHistoryResults(entry, e) {
    e.stopPropagation();

    // Group zones by province for byProvince field
    const byProvince = {};

    // Reconstruct data object to match discover results format
    const zones =
      entry.zoneResults?.map((zr) => {
        const zoneData = zr.zoneId || {};
        const zone = {
          id: zoneData.id || zoneData._id || zr.zoneId, // Prioritize 'id' (slug) over '_id'
          _id: zoneData._id || zoneData.id || zr.zoneId,
          name: zr.zoneName || zoneData.name,
          province: zoneData.province || "Unknown",
          heroImg: zoneData.heroImg,
          gallery: zoneData.gallery || [],
          desc: zoneData.desc,
          tags: zoneData.tags || [],
          center: zoneData.center,
          poly: zoneData.poly,
          polyComputed: zoneData.polyComputed,
          bestTime: zoneData.bestTime,
          funActivities: zoneData.funActivities || [],
          tips: zoneData.tips || [],
          donts: zoneData.donts || [],
          rating: zoneData.rating,
          // Scoring fields
          finalScore: zr.matchScore || 0,
          matchScore: zr.matchScore || 0,
          embedScore: zr.embedScore || 0,
          ruleScore: zr.ruleScore || 0,
          ruleReasons: zr.ruleReasons || [],
        };

        // Group by province
        if (!byProvince[zone.province]) {
          byProvince[zone.province] = [];
        }
        byProvince[zone.province].push(zone);

        return zone;
      }) || [];

    const data = {
      ok: true,
      prefs: entry.parsedPrefs || {},
      zones,
      byProvince,
      strategy: entry.strategy || "history",
      reason: `Lịch sử tìm kiếm - ${zones.length} zones`,
      fallback: false,
    };

    console.log("[ViDoi] Reconstructed data for history:", data);

    // Save to sessionStorage
    try {
      window.sessionStorage.setItem("discover_result", JSON.stringify(data));
    } catch (err) {
      console.error("SessionStorage error:", err);
    }

    // Navigate to results
    setShowHistory(false);
    navigate("/discover/results", { state: { data } });
  }

  // 🗑️ Delete single history entry
  async function deleteHistoryEntry(entryId, e) {
    e.stopPropagation();
    setDeleteModal({ show: true, type: "single", entryId });
  }

  // 🗑️ Delete all history
  async function deleteAllHistory() {
    setDeleteModal({ show: true, type: "all", entryId: null });
  }

  // 🗑️ Confirm delete action
  async function confirmDelete() {
    try {
      if (deleteModal.type === "all") {
        const data = await withAuth("/api/discover/clear-history", {
          method: "DELETE",
        });

        if (data.ok) {
          toast.success("Đã xóa toàn bộ lịch sử");
          setHistory([]);
          setShowHistory(false);
        }
      } else if (deleteModal.type === "single") {
        const data = await withAuth(
          `/api/discover/history/${deleteModal.entryId}`,
          {
            method: "DELETE",
          }
        );

        if (data.ok) {
          toast.success("Đã xóa lịch sử");
          loadHistory(); // Reload history
        }
      }
    } catch (error) {
      console.error("❌ Failed to delete history:", error);
      toast.error("Không thể xóa lịch sử");
    } finally {
      setDeleteModal({ show: false, type: null, entryId: null });
    }
  }

  // Load history on mount if logged in
  useEffect(() => {
    if (isAuth) {
      loadHistory();
    }
  }, [isAuth]);

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
    animate: (i) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay: 0.015 * i,
        type: "spring",
        stiffness: 280,
        damping: 18,
      },
    }),
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
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #000 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
        initial={{ backgroundPosition: "0px 0px" }}
        animate={{ backgroundPosition: ["0px 0px", "20px 20px", "0px 0px"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />

      {/* Header with back button */}
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-between">
          <motion.button
            {...fadeInUp}
            onClick={() => navigate("/ai-tour-creator")}
            className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-slate-200 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Quay lại
          </motion.button>

          {/* History button - show if logged in */}
          {isAuth && (
            <motion.button
              {...fadeInUp}
              onClick={() => setShowHistory(true)}
              className="inline-flex items-center gap-2 text-indigo-700 hover:text-indigo-900 bg-indigo-50/80 backdrop-blur px-3 py-1.5 rounded-full border border-indigo-200 shadow-sm"
            >
              <History className="w-4 h-4" />
              Lịch sử {history.length > 0 && `(${history.length})`}
            </motion.button>
          )}
        </div>
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
            Hãy chọn tối đa <span className="font-semibold">{MAX}</span> vibes
            để chúng mình gợi ý điểm đến phù hợp ✨
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
                  whileHover={
                    active
                      ? { y: -2, boxShadow: `0 12px 28px ${rgba}`, scale: 1.01 }
                      : {
                          y: -2,
                          boxShadow: `0 12px 28px ${rgba}`,
                          backgroundColor: rgba,
                        }
                  }
                  whileTap={{ scale: 0.97 }}
                  onClick={() => toggleVibe(v)}
                  disabled={disabled}
                  className={[
                    "group relative inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-base font-semibold border transition focus:outline-none focus:ring-2 focus:ring-offset-2",
                    active
                      ? "text-white border-transparent"
                      : "text-slate-800 bg-white border-slate-200",
                    disabled ? "opacity-50 cursor-not-allowed" : "",
                  ].join(" ")}
                  style={{
                    borderColor: active ? "transparent" : hex,
                    background: undefined,
                    backgroundColor: active ? rgba : "white",
                    boxShadow: active ? `0 8px 26px ${rgba}` : undefined,
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
                  <span className={active ? "text-white" : "text-slate-800"}>
                    {v}
                  </span>
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
              <div className="text-xs text-slate-500 sm:order-2">
                AI sẽ phân tích & gợi ý khu vực phù hợp
              </div>
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
          Gợi ý: “food, sunset, photo” / “nature, hiking, waterfall” /
          “nightlife, music, bar”
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
                  <h2 className="text-lg font-semibold text-slate-900">
                    Mô tả mong muốn
                  </h2>
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
                    <span className="text-[11px] text-slate-500">
                      {freeText.length}/240
                    </span>
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
                            style={{
                              color: hex,
                              backgroundColor: "white",
                              border: `1px solid ${hex}20`,
                            }}
                          >
                            <span
                              className="inline-block w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: hex }}
                            />
                            {sv}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <motion.textarea
                    value={freeText}
                    onChange={(e) => setFreeText(e.target.value.slice(0, 240))}
                    rows={5}
                    placeholder="Ví dụ: 2–3 ngày, thích street food rẻ, đi nhẹ, tránh đi bộ xa, muốn gần biển"
                    className="w-full px-4 py-3 rounded-xl bg-white/95 border border-slate-300 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                    whileFocus={{
                      boxShadow: "0 0 0 2px rgba(99,102,241,0.25)",
                    }}
                  />
                </div>

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
                      {parsedPreview.pace && (
                        <p>• Nhịp độ: {parsedPreview.pace}</p>
                      )}
                      {parsedPreview.budget && (
                        <p>• Ngân sách: {parsedPreview.budget}</p>
                      )}
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

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Lịch sử tìm kiếm
                </h3>
                <div className="flex items-center gap-2">
                  {history.length > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={deleteAllHistory}
                      className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg px-3 py-1.5 text-sm font-medium transition-all"
                    >
                      <Trash2 className="w-4 h-4 inline mr-1" />
                      Xóa tất cả
                    </motion.button>
                  )}
                  <button
                    onClick={() => setShowHistory(false)}
                    className="text-white/80 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* History List */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                {loadingHistory ? (
                  <div className="text-center py-8 text-slate-500">
                    Đang tải...
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    Chưa có lịch sử tìm kiếm nào
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((entry, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-slate-50 hover:bg-slate-100 rounded-xl p-4 border border-slate-200 transition-all"
                      >
                        {/* Timestamp */}
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                          <Clock className="w-3 h-3" />
                          {new Date(entry.createdAt).toLocaleDateString(
                            "vi-VN",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>

                        {/* Vibes */}
                        {entry.vibes && entry.vibes.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {entry.vibes.map((vibe) => {
                              const vibeData = vibeOptions.find(
                                (v) => v.id === vibe
                              );
                              return (
                                <span
                                  key={vibe}
                                  className="px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200"
                                >
                                  {vibeData?.label || vibe}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {/* Free Text */}
                        {entry.freeText && (
                          <p className="text-sm text-slate-700 mb-2">
                            "{entry.freeText}"
                          </p>
                        )}

                        {/* Results summary */}
                        {entry.zoneResults && entry.zoneResults.length > 0 && (
                          <div className="text-xs text-slate-500 mb-3">
                            {entry.zoneResults.length} kết quả •
                            {entry.zoneResults
                              .slice(0, 3)
                              .map((z) => z.zoneName)
                              .join(", ")}
                            {entry.zoneResults.length > 3 && "..."}
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => loadFromHistory(entry)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-indigo-300 transition-all"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Tải lại vibes
                          </motion.button>

                          {entry.zoneResults &&
                            entry.zoneResults.length > 0 && (
                              <motion.button
                                whileHover={{ y: -1 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={(e) => viewHistoryResults(entry, e)}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
                              >
                                <MapPin className="w-3.5 h-3.5" />
                                Xem kết quả
                              </motion.button>
                            )}

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => deleteHistoryEntry(entry._id, e)}
                            className="inline-flex items-center justify-center p-2 text-xs font-medium rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-all"
                            title="Xóa lịch sử này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() =>
              setDeleteModal({ show: false, type: null, entryId: null })
            }
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-center text-slate-800 mb-2">
                {deleteModal.type === "all"
                  ? "Xóa tất cả lịch sử?"
                  : "Xóa lịch sử này?"}
              </h3>

              {/* Message */}
              <p className="text-center text-slate-600 mb-6">
                {deleteModal.type === "all"
                  ? "Bạn có chắc chắn muốn xóa toàn bộ lịch sử tìm kiếm? Hành động này không thể hoàn tác."
                  : "Bạn có chắc chắn muốn xóa lịch sử này? Hành động này không thể hoàn tác."}
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    setDeleteModal({ show: false, type: null, entryId: null })
                  }
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  Hủy
                </motion.button>
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
                >
                  Xóa
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
