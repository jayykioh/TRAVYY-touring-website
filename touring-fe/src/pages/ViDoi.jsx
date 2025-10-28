/* eslint-disable no-unused-vars */
// VibeSelectPage.jsx
import React, {  useMemo, useState } from "react";
import { Sparkles, MapPin, X } from "lucide-react";
import { useNavigate } from "react-router-dom"; 
import { toast } from "sonner";

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

const ALL_VIBES = vibeOptions.map(v => v.id);

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

  function toggleVibe(v) {
    setSelected(prev => {
      if (prev.includes(v)) return prev.filter(x => x !== v);
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
      setErrorMsg("Mô tả quá ngắn! Hãy cho biết bạn thích gì (ví dụ: biển, núi, ẩm thực...)");
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

      // ✨ FIX: Combine vibes + freeText into single text field
      const combinedText = [
        ...selected,  // ["beach", "food"]
        freeText      // "2 ngày, tránh đông"
      ].filter(Boolean).join(", ");

      const body = {
        text: combinedText,  // ✅ "beach, food, 2 ngày, tránh đông"
        province: null       
      };

      console.log("🔵 Sending request:", body);

      const r = await fetch("/api/discover/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
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

      // Navigate
      console.log("🔵 Navigating to results...");
      navigate("/discover/results", { state: { data } });
      
    } catch (e) {
      console.error("🔴 Submit error:", e);
      setErrorMsg(e?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }
  // gợi ý vibe phổ biến: đẩy lên đầu
  const vibes = useMemo(() => {
    const hot = ["food","sunset","photo","beach","nature","nightlife","culture"];
    const setHot = new Set(hot);
    const rest = ALL_VIBES.filter(v => !setHot.has(v));
    return [...hot, ...rest];
  }, []);

  // ✨ FIX: Preview parse handler
  async function handlePreviewParse() {
    if (!freeText) return;
    setParsing(true);
    try {
      const combinedText = [
        ...selected,
        freeText
      ].filter(Boolean).join(", ");

      const r = await fetch("/api/discover/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: combinedText })  // ✅ Fix
      });

      if (!r.ok) {
        throw new Error(`Error ${r.status}`);
      }

      const data = await r.json();
      setParsedPreview(data.prefs);  // ✅ Use data.prefs not data.parsed
    } catch (e) {
      console.error("❌ Preview error:", e);
      setParsedPreview(null);
    } finally {
      setParsing(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-3xl mx-auto pt-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Chọn vibes bạn mong muốn
          </h1>
          <p className="text-gray-600">
            Hãy chọn tối đa <span className="font-semibold">{MAX}</span> vibes để chúng mình gợi ý điểm đến phù hợp ✨
          </p>
        </div>

        {/* Chips */}
        <div className="bg-white rounded-2xl shadow p-5">
          <div className="flex flex-wrap gap-2">
            {vibes.map((v) => {
              const active = selected.includes(v);
              const disabled = !active && selected.length >= MAX;
              return (
                <button
                  key={v}
                  onClick={() => toggleVibe(v)}
                  disabled={disabled}
                  className={[
                    "px-3 py-2 rounded-full text-sm font-medium border transition",
                    active
                      ? "bg-blue-600 text-white border-blue-600 shadow"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                    disabled ? "opacity-50 cursor-not-allowed" : ""
                  ].join(" ")}
                >
                  {v}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-4 text-sm">
            <span className="text-gray-500">
              Đã chọn: <strong>{selected.length}</strong> / {MAX}
            </span>
            <button
              onClick={openModal}
              disabled={!canContinue}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              Tiếp tục
            </button>
          </div>
        </div>

        {/* Gợi ý nhỏ */}
        <div className="mt-4 text-center text-xs text-gray-500">
          Gợi ý: “food, sunset, photo” / “nature, hiking, waterfall” / “nightlife, music, bar”
        </div>
      </div>

      {/* Modal nhập mô tả */}
      {showModal && (
        <div className="fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/40" 
            onClick={() => {
              console.log("🔵 Backdrop clicked - closing modal");
              setShowModal(false);
            }} 
          />
          <div 
            className="absolute inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[720px] w-full bg-white rounded-t-2xl md:rounded-2xl shadow-xl p-6"
            onClick={(e) => {
              e.stopPropagation(); // Ngăn click bubble lên backdrop
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800">Mô tả mong muốn</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded hover:bg-gray-100" aria-label="Đóng">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Viết ngắn gọn: ví dụ “2–3 ngày, thích street food rẻ, đi nhẹ, tránh đi bộ xa, muốn gần biển”
              </p>
              <textarea
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                rows={4}
                placeholder="Mô tả tự do của bạn…"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {/* ADD: Preview button */}
              <button
                onClick={handlePreviewParse}
                disabled={parsing || !freeText}
                className="text-xs px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                {parsing ? "Đang phân tích..." : "🔍 Xem hệ thống hiểu gì"}
              </button>

              {/* Show parsed preview */}
              {parsedPreview && (
                <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs">
                  <p className="font-medium">Hệ thống hiểu:</p>
                  {parsedPreview.pace && <p>• Nhịp độ: {parsedPreview.pace}</p>}
                  {parsedPreview.budget && <p>• Ngân sách: {parsedPreview.budget}</p>}
                  {parsedPreview.durationDays > 0 && <p>• Thời gian: {parsedPreview.durationDays} ngày</p>}
                  {parsedPreview.avoid?.length > 0 && <p>• Tránh: {parsedPreview.avoid.join(", ")}</p>}
                </div>
              )}

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={useMyLoc}
                  onChange={(e) => setUseMyLoc(e.target.checked)}
                />
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Dùng vị trí hiện tại để gợi ý nơi gần hơn
                </span>
              </label>

              {errorMsg && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded p-2">
                  {errorMsg}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg font-medium"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    console.log("🟢 Submit button clicked!");
                    handleSubmit(e);
                  }}
                  disabled={submitting || selected.length === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {submitting ? "Đang tạo gợi ý…" : "Tạo gợi ý điểm đến"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
