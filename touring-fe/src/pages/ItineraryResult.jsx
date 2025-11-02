/* eslint-disable no-unused-vars */
// pages/ItineraryResult.jsx
// ✅ Clean, minimalist design with clear information hierarchy

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/context";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Route,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  Navigation,
  ListChecks,
  Lightbulb,
  Loader2,
  RefreshCw,
  Copy,
  Download,
  Map,
  MapPinned,
} from "lucide-react";
import GoongMapPanel from "@/components/GoongMapPanel";
import MapLibrePanel from "@/components/GoongMapLibre.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
export default function ItineraryResult() {
  // ========== Handle Send Tour Guide Request ========== 
  async function handleSendGuideRequest() {
    if (!itinerary?._id) return;
    setGuideReqLoading(true);
    setGuideReqMsg("");
    try {
      console.log("[TourGuideRequest] Bắt đầu gửi yêu cầu cho tour guide với itineraryId:", itinerary._id);
      const res = await withAuth(`/api/itinerary/${itinerary._id}/request-tour-guide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res?.success) {
        setGuideReqMsg("Đã gửi yêu cầu tour guide thành công!");
        // Reload itinerary to update status
        const result = await withAuth(`/api/itinerary/${itinerary._id}`);
        setItinerary(result.itinerary);
        console.log("[TourGuideRequest] Thành công:", result.itinerary.tourGuideRequest);
      } else {
        setGuideReqMsg(res?.error || "Gửi yêu cầu thất bại");
        console.warn("[TourGuideRequest] Thất bại:", res);
      }
    } catch (e) {
      setGuideReqMsg("Gửi yêu cầu thất bại: " + (e?.message || e));
      console.error("[TourGuideRequest] Lỗi:", e);
    } finally {
      setGuideReqLoading(false);
    }
  }
  // ========== Tour Guide Request State ==========
  const [guideReqLoading, setGuideReqLoading] = useState(false);
  const [guideReqMsg, setGuideReqMsg] = useState("");

  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { withAuth, accessToken } = useAuth();

  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [useMapLibre, setUseMapLibre] = useState(true);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [mapError, setMapError] = useState(null);

  // ========== Load itinerary ========== 
  useEffect(() => {
    const loadItinerary = async () => {
      try {
        setLoading(true);
        let data = location.state?.itinerary;

        if (!data) {
          console.log("🔄 [Load] Fetching from API...");
          const result = await withAuth(`/api/itinerary/${id}`);
          data = result.itinerary;
        }

        console.log("📥 [Load] Initial data:", {
          id: data._id,
          name: data.zoneName,
          aiProcessing: data.aiProcessing,
          aiProcessingType: typeof data.aiProcessing,
          hasAiInsights: !!data.aiInsights,
          summaryPreview: data.aiInsights?.summary?.substring(0, 50),
          tipsCount: data.aiInsights?.tips?.length,
          isCustomTour: data.isCustomTour,
          tourGuideRequest: data.tourGuideRequest,
        });

        setItinerary(data);
        setIsAIProcessing(Boolean(data.aiProcessing));
      } catch (error) {
        console.error("❌ [Load] Error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadItinerary();
  }, [id, location.state, withAuth]);

  // ========== Poll for AI insights ==========
  useEffect(() => {
    if (!isAIProcessing) {
      console.log("🛑 [Polling] Not needed - aiProcessing is false");
      return;
    }

    console.log("🔄 [Polling] Starting (check every 2s)...");
    let pollCount = 0;
    const MAX_POLLS = 30; // 60 seconds max

    const interval = setInterval(async () => {
      pollCount++;
      console.log(`🔍 [Polling] Attempt ${pollCount}/${MAX_POLLS}`);

      try {
        const result = await withAuth(`/api/itinerary/${id}`);
        const data = result.itinerary;

        console.log(`📥 [Polling] Response:`, {
          aiProcessing: data.aiProcessing,
          aiProcessingType: typeof data.aiProcessing,
          hasAiInsights: !!data.aiInsights,
          hasSummary: !!data.aiInsights?.summary,
          summaryLength: data.aiInsights?.summary?.length,
          tipsCount: data.aiInsights?.tips?.length,
          firstTipPreview: data.aiInsights?.tips?.[0]?.substring(0, 30),
        });

        // ✅ Check if processing is complete
        if (data.aiProcessing === false) {
          console.log("✅ [Polling] AI processing completed!");

          // Validate insights
          const hasValidInsights =
            data.aiInsights?.summary &&
            data.aiInsights.summary.length > 0 &&
            Array.isArray(data.aiInsights.tips) &&
            data.aiInsights.tips.length > 0;

          if (hasValidInsights) {
            console.log("✅ [Polling] Valid insights:", {
              summary: data.aiInsights.summary.substring(0, 80),
              tips: data.aiInsights.tips.length,
            });
            setItinerary(data);
            setIsAIProcessing(false);
          } else {
            console.warn("⚠️ [Polling] Processing done but no valid insights");
            setItinerary(data);
            setIsAIProcessing(false);
          }
        } else {
          console.log(
            `⏳ [Polling] Still processing... (${pollCount}/${MAX_POLLS})`
          );
        }

        // Stop after max
        if (pollCount >= MAX_POLLS) {
          console.warn("⏰ [Polling] Timeout - stopping after 60s");
          setIsAIProcessing(false);
        }
      } catch (error) {
        console.error("❌ [Polling] Error:", error.message);
      }
    }, 2000);

    return () => {
      console.log("🛑 [Polling] Cleanup");
      clearInterval(interval);
    };
  }, [isAIProcessing, id, withAuth]);

  // ✅ Manual refresh
  async function handleRefresh() {
    console.log("🔄 [Manual Refresh] Triggered");
    try {
      const result = await withAuth(`/api/itinerary/${id}`);
      if (result?.itinerary) {
        const data = result.itinerary;

        console.log("📥 [Manual Refresh] Data:", {
          aiProcessing: data.aiProcessing,
          hasSummary: !!data.aiInsights?.summary,
          tipsCount: data.aiInsights?.tips?.length,
        });

        setItinerary(data);
        setIsAIProcessing(data.aiProcessing);
      }
    } catch (error) {
      console.error("❌ [Manual Refresh] Error:", error);
    }
  }

  // ========== Derived data ==========
  const items = useMemo(() => {
    if (!itinerary) return [];
    return (itinerary.items || []).filter(Boolean);
  }, [itinerary]);

  const poisForMap = useMemo(() => {
    return items
      .map((it, idx) => {
        const loc = it.loc || it.location;
        if (!loc?.lat || !loc?.lng) return null;
        return {
          id: it.poiId || `poi-${idx}`,
          name: it.name || `Điểm ${idx + 1}`,
          order: idx + 1,
          loc: { lat: loc.lat, lng: loc.lng },
        };
      })
      .filter(Boolean);
  }, [items]);

  const mapCenter = useMemo(() => {
    if (itinerary?.center?.lat && itinerary?.center?.lng)
      return itinerary.center;
    if (poisForMap.length > 0) return poisForMap[0].loc;
    return { lat: 21.028, lng: 105.84 };
  }, [itinerary?.center, poisForMap]);

  const totalDistanceText = useMemo(() => {
    return (itinerary?.totalDistance || 0).toFixed(2);
  }, [itinerary?.totalDistance]);

  const totalDurationText = useMemo(() => {
    return Math.round(itinerary?.totalDuration || 0);
  }, [itinerary?.totalDuration]);

  const ai = itinerary?.aiInsights || {};
  const tips = Array.isArray(ai.tips) ? ai.tips : [];

  // ========== UI helpers ==========
  async function handleCopyLink() {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      alert("Đã sao chép liên kết!");
    } catch (e) {
      console.error(e);
    }
  }

  async function handleReOptimize() {
    try {
      if (!id) return;
      setIsAIProcessing(true);
      await withAuth(`/api/itinerary/${id}/optimize-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: true }),
      });
    } catch (e) {
      console.error("❌ [FE] Re-optimize error:", e);
      setIsAIProcessing(false);
    }
  }

  async function handleDownloadGpx() {
    try {
      const url = `/api/itinerary/${id}/export.gpx`;

      let res = await fetch(url, {
        method: "GET",
        credentials: "include", // để BE đọc refresh cookie khi refresh sau
        headers: {
          Accept: "application/gpx+xml",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      // nếu 401 -> tự refresh rồi thử lại 1 lần
      if (res.status === 401) {
        const ref = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
          headers: { Accept: "application/json" },
        })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null);

        const token2 = ref?.accessToken || accessToken || null;
        res = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/gpx+xml",
            ...(token2 ? { Authorization: `Bearer ${token2}` } : {}),
          },
        });
      }

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Download failed: ${res.status} ${txt}`);
      }

      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const filenameBase = (
        itinerary?.zoneName ||
        itinerary?.name ||
        "route"
      ).replace(/\s+/g, "_");

      const a = document.createElement("a");
      a.href = objUrl;
      a.download = `${filenameBase}.gpx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objUrl);
    } catch (err) {
      console.error("GPX download error:", err);
      alert("Tải GPX thất bại. Vui lòng thử lại.");
    }
  }

  // ========== Loading state ==========
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-slate-400" />
          <p className="text-slate-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // ========== Not found state ==========
  if (!itinerary) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Không tìm thấy hành trình</h2>
          <button
            onClick={() => navigate("/itinerary")}
            className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-lg"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // ✅ MAIN RENDER - Same as before, just verify AI section logs data correctly
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ===== Header ===== */}
      <div className="border-b bg-white sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate("/itinerary")}
              className="mt-1 p-2 -ml-2 hover:bg-slate-50 rounded-lg transition"
              aria-label="Quay lại"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-semibold text-slate-900 truncate">
                  {itinerary.zoneName || "Hành trình"}
                </h1>
                {itinerary.isOptimized && (
                  <div className="flex-shrink-0 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded">
                    Đã tối ưu
                  </div>
                )}
              </div>



              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {items.length} điểm
                </span>
                <span className="flex items-center gap-1.5">
                  <Route className="w-4 h-4" />
                  {totalDistanceText} km
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {totalDurationText} phút
                </span>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="px-3 py-2 text-xs rounded-lg border hover:bg-slate-50 flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" /> Sao chép link
              </button>
              <button
                onClick={handleDownloadGpx}
                className="px-3 py-1.5 text-xs rounded-lg border hover:bg-slate-50"
              >
                Tải GPX
              </button>

              <button
                onClick={handleReOptimize}
                disabled={isAIProcessing}
                className="px-3 py-2 text-xs rounded-lg bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1.5 disabled:opacity-60"
              >
                {isAIProcessing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}{" "}
                Tối ưu lại
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Main Content ===== */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ===== Left Column: Timeline & AI Insights ===== */}
       {/* ===== Left Column: Timeline (on top) + AI Tips (right below) ===== */}
<div className="lg:col-span-1 space-y-5">
  {/* LỘ TRÌNH — đặt trên cùng, padding gọn */}
  <motion.section
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2 }}
  >
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-2">
        <Navigation className="w-5 h-5 text-slate-700" />
        <h2 className="text-base font-semibold text-slate-900">Lộ trình</h2>
      </div>
      <span className="text-xs text-slate-500">
        {items.length} điểm • {totalDistanceText} km • {totalDurationText} phút
      </span>
  
    </div>

    <div className="space-y-2">
      {items.map((item, idx) => {
        const loc = item.loc || item.location;
        const hasLatLng = !!(loc?.lat && loc?.lng);
        const gmapsUrl = hasLatLng
          ? `https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`
          : item?.address
          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address)}`
          : null;

        return (
          <div key={item.poiId || idx}>
            {/* Đoạn di chuyển giữa 2 điểm + chú thích */}
            {idx > 0 && item?.travelFromPrevious && (
              <div className="pl-6 py-1">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Route className="w-3.5 h-3.5" />
                  <span>{item.travelFromPrevious.distance} km</span>
                  <span>•</span>
                  <span>{item.travelFromPrevious.duration} phút</span>
                </div>
                <p className="text-[11px] text-slate-500 pl-6">
                  *Thời gian là ước tính di chuyển giữa 2 địa điểm liền kề.
                </p>
              </div>
            )}

            {/* POI node dạng timeline (không đóng khung) */}
            <div className="relative pl-6 pb-2 border-l-2 border-slate-200 last:border-0">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-semibold">
                {idx + 1}
              </div>

              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-medium text-slate-900 text-sm mb-0.5 truncate">
                    {item.name}
                  </h3>
                  {item.address && (
                    <p className="text-xs text-slate-500 mb-1 truncate">
                      {item.address}
                    </p>
                  )}

                  {(item.startTime || item.endTime || item.duration) && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                      {(item.startTime || item.endTime) && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {item.startTime} {item.endTime && "–"} {item.endTime}
                        </span>
                      )}
                      {item.duration && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span>{item.duration} phút</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Nút xem Google Maps (mở tab mới) */}
                {gmapsUrl && (
                  <a
                    href={gmapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 px-2 py-1 text-[11px] rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
                    title="Mở trên Google Maps"
                  >
                    Xem bản đồ
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </motion.section>

  {/* GỢI Ý AI — ngay dưới lộ trình, padding gọn, hiện đại */}
  <section>
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-[#02A0AA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h2 className="text-base font-semibold text-slate-900">Gợi ý AI</h2>
      </div>

      <button
        onClick={handleRefresh}
        disabled={isAIProcessing}
        className="text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-white hover:border-slate-300 transition-all flex items-center gap-1.5 disabled:opacity-50"
        title="Làm mới"
      >
        <motion.div
          animate={{ rotate: isAIProcessing ? 360 : 0 }}
          transition={{ duration: 1, repeat: isAIProcessing ? Infinity : 0, ease: "linear" }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </motion.div>
        Làm mới
      </button>
    </div>

    <AnimatePresence mode="wait">
      {isAIProcessing ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Loader2 className="w-4 h-4 text-[#02A0AA] animate-spin" />
            <span>Đang phân tích với AI...</span>
          </div>

          <div className="space-y-1.5 mt-1">
            {[100, 85, 70].map((w, i) => (
              <motion.div
                key={i}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: `${w}%`, opacity: 1 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="h-3 bg-slate-100 rounded-full"
              />
            ))}
          </div>

          <p className="text-[11px] text-slate-500 mt-1.5">Có thể mất 10–15 giây để tạo gợi ý tối ưu...</p>
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-3"
        >
          {ai?.summary && (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-3 border border-slate-200">
              <p className="text-sm text-slate-700 leading-relaxed">{ai.summary}</p>
            </div>
          )}

          {tips.length > 0 && (
            <Collapsible>
              <CollapsibleTrigger className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#02A0AA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-slate-900">
                    Lời khuyên chi tiết ({tips.length})
                  </span>
                </div>
                <div className="text-slate-400 group-hover:text-slate-600">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-2">
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5"
                >
                  {tips.map((tip, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex gap-3 text-sm text-slate-700 bg-white rounded-lg p-2.5 border border-slate-200 hover:border-[#02A0AA]/30 transition-colors"
                    >
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#02A0AA]/10 text-[#02A0AA] flex items-center justify-center text-xs font-semibold">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{tip}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {!ai?.summary && tips.length === 0 && (
            <div className="text-center py-5">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="text-sm text-slate-500 mb-2">Chưa có gợi ý AI</p>
              <button
                onClick={handleRefresh}
                className="text-[11px] px-3 py-1.5 rounded-lg bg-[#02A0AA] text-white hover:bg-[#018F99] transition-colors shadow-sm"
              >
                Tạo gợi ý ngay
              </button>
            </div>
          )}

          {(ai?.summary || tips.length > 0) && (
            <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
              <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                <span className="font-medium">*Lưu ý:</span> Các gợi ý & lộ trình do AI tối ưu chỉ mang tính tham khảo. Hãy điều chỉnh theo nhu cầu thực tế của bạn.
              </p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  </section>
</div>


          {/* ===== Right Column: Map ===== */}
          {/* ===== Right Column: Map ===== */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      Bản đồ
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {itinerary?.isOptimized
                        ? "Đường đi đã được tối ưu hóa"
                        : "Lộ trình hiện tại"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setUseMapLibre(true)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-all flex items-center gap-1.5 ${
                        useMapLibre
                          ? "bg-[#02A0AA] text-white border-[#02A0AA] shadow-sm"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                        />
                      </svg>
                      MapLibre
                    </button>
                    <button
                      onClick={() => setUseMapLibre(false)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-all flex items-center gap-1.5 ${
                        !useMapLibre
                          ? "bg-[#02A0AA] text-white border-[#02A0AA] shadow-sm"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Goong
                    </button>
                  </div>
                </div>
              </div>

              <div className="h-[500px] sm:h-[600px] bg-slate-100 relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={useMapLibre ? "maplibre" : "goong"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full"
                  >
                    {useMapLibre ? (
                      <MapLibrePanel
                        center={mapCenter}
                        zoom={13}
                        pois={poisForMap}
                        selectedPoiId={null}
                        onPoiClick={() => {}}
                        routePolyline={itinerary.routePolyline}
                        onError={(e) => {
                          setMapError(e || "MapLibre error");
                          setUseMapLibre(false);
                        }}
                      />
                    ) : (
                      <GoongMapPanel
                        center={mapCenter}
                        zoom={13}
                        pois={poisForMap}
                        selectedPoiId={null}
                        onPoiClick={() => {}}
                        markerVariant="numbered"
                        routePolyline={itinerary.routePolyline}
                        onError={(e) => setMapError(e || "Goong error")}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
                
              </div>
                    
              <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                    Quãng đường:{" "}
                    <strong className="text-slate-900 ml-1">
                      {totalDistanceText} km
                    </strong>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1.5">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Thời gian:{" "}
                    <strong className="text-slate-900 ml-1">
                      {totalDurationText} phút
                    </strong>
                  </span>
                  {mapError && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="text-amber-700 flex items-center gap-1">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        {String(mapError)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
                      {/* ===== Tour Guide Request Button at bottom ===== */}
      {/* Tour Guide Request Button (active) at bottom */}
      {itinerary.isCustomTour && (itinerary.tourGuideRequest?.status === 'none' || itinerary.tourGuideRequest?.status === 'rejected') && (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 mt-auto">
          <div className="flex flex-col items-center justify-center">
            <button
              onClick={handleSendGuideRequest}
              disabled={guideReqLoading}
              className="px-4 py-3 rounded-lg bg-[#02A0AA] text-white hover:bg-[#018F99] text-base font-semibold flex items-center gap-2 disabled:opacity-60 shadow-md"
            >
              {guideReqLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              Gửi yêu cầu tour guide
            </button>
            {guideReqMsg && (
              <div className="mt-2 text-sm text-slate-700 font-medium">{guideReqMsg}</div>
            )}
          </div>
        </div>
      )}

      {/* Tour Guide Request Pending Button below map */}
      {itinerary.isCustomTour && itinerary.tourGuideRequest?.status === 'pending' && (
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 mt-6">
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-3 bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl px-6 py-4 shadow-sm">
              <Loader2 className="w-6 h-6 animate-spin text-[#02A0AA]" />
              <span className="text-base font-semibold text-[#0F172A]">Đã gửi yêu cầu tour guide</span>
            </div>
          </div>
        </div>
      )}
            {/* Mobile Actions */}
            <div className="sm:hidden mt-4 flex flex-col gap-2">
              <button
                onClick={handleCopyLink}
                className="w-full px-4 py-3 text-sm rounded-lg border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Sao chép liên kết
              </button>

              {/* dùng đúng handleDownloadGpx (tên hàm gốc) */}
              <button
                onClick={handleDownloadGpx}
                className="w-full px-4 py-3 text-sm rounded-lg border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Tải xuống GPX
              </button>

              <button
                onClick={handleReOptimize}
                disabled={isAIProcessing}
                className="w-full px-4 py-3 text-sm rounded-lg bg-[#02A0AA] text-white hover:bg-[#018F99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm"
              >
                {isAIProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                )}
                Tối ưu lại với AI
              </button>
              
            </div>
          </motion.div>
          
        </div>
      </div>
    </div>
  );
}
