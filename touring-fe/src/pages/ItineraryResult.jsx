/* eslint-disable no-unused-vars */
// pages/ItineraryResult.jsx
// ✅ Modern, clean design with optimized layout

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/context";
import { toast } from "sonner";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Route,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Navigation,
  Loader2,
  RefreshCw,
  Copy,
  UserPlus,
  Home,
  Wand2,
} from "lucide-react";
import GoongMapPanel from "@/components/GoongMapPanel";
import MapLibrePanel from "@/components/GoongMapLibre.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import RequestGuideModal from "@/components/RequestGuideModal";
import TravellerChatBox from "@/components/TravellerChatBox";

export default function ItineraryResult() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { withAuth, accessToken } = useAuth();

  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [useMapLibre, setUseMapLibre] = useState(true);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [showRequestGuideModal, setShowRequestGuideModal] = useState(false);
  const [showChat, setShowChat] = useState(true);

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
      toast.success("Đã sao chép liên kết!");
    } catch (e) {
      console.error(e);
      toast.error("Không thể sao chép liên kết");
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
      toast.success("Đang tối ưu hóa lại...");
    } catch (e) {
      console.error("❌ [FE] Re-optimize error:", e);
      setIsAIProcessing(false);
      toast.error("Không thể tối ưu hóa");
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

  // ✅ MAIN RENDER - Modern layout with optimized structure
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50">
      {/* ===== Header ===== */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Title & Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-slate-900 truncate">
                {itinerary.zoneName || "Hành trình"}
              </h1>
              {itinerary.isOptimized && (
                <div className="shrink-0 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
                  ✓ Đã tối ưu
                </div>
              )}
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/")}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 transition-all"
                title="Về trang chủ"
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Trang chủ</span>
              </button>
              
              <button
                onClick={() => navigate("/ai-tour-creator")}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 transition-all"
                title="Quay lại AI Tour Creator"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tối ưu</span>
              </button>

              <button
                onClick={() => {
                  if (!itinerary?.items || itinerary.items.length === 0) {
                    toast.error('Vui lòng thêm các địa điểm vào lộ trình trước khi yêu cầu hướng dẫn viên');
                    return;
                  }
                  setShowRequestGuideModal(true);
                }}
                className="px-3 py-1.5 text-xs rounded-lg bg-linear-to-r from-[#02A0AA] to-[#029ca6] text-white hover:shadow-md transition-all flex items-center gap-1.5 font-medium"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Yêu cầu HDV</span>
              </button>

              <button
                onClick={handleReOptimize}
                disabled={isAIProcessing}
                className="px-3 py-1.5 text-xs rounded-lg bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1.5 disabled:opacity-60 transition-all"
              >
                {isAIProcessing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 transition-all"
                title="Sao chép liên kết"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {items.length} điểm
            </span>
            <span className="flex items-center gap-1.5">
              <Route className="w-3.5 h-3.5" />
              {totalDistanceText} km
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {totalDurationText} phút
            </span>
          </div>
        </div>
      </div>

      {/* ===== Main Content: 2-Column Layout ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-180px)]">
          
          {/* ===== LEFT COLUMN: Map (Fixed Height) ===== */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:sticky lg:top-24 h-full"
          >
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
              {/* Map Header */}
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-900">Bản đồ lộ trình</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setUseMapLibre(true)}
                      className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                        useMapLibre
                          ? "bg-[#02A0AA] text-white border-[#02A0AA]"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      MapLibre
                    </button>
                    <button
                      onClick={() => setUseMapLibre(false)}
                      className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                        !useMapLibre
                          ? "bg-[#02A0AA] text-white border-[#02A0AA]"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      Goong
                    </button>
                  </div>
                </div>
              </div>

              {/* Map Container */}
              <div className="flex-1 bg-slate-100 relative">
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

              {/* Map Footer Stats */}
              <div className="border-t border-slate-200 bg-slate-50 px-4 py-2.5 shrink-0">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Route className="w-3.5 h-3.5" />
                    {totalDistanceText} km
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {totalDurationText} phút
                  </span>
                  {mapError && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="text-amber-600">{String(mapError)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ===== RIGHT COLUMN: Timeline + AI Tips (Scrollable) ===== */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="overflow-y-auto h-full space-y-4 pr-2"
            style={{ scrollbarWidth: 'thin' }}
          >
            {/* Timeline Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-slate-700" />
                  <h2 className="text-sm font-semibold text-slate-900">Lộ trình</h2>
                </div>
                <span className="text-xs text-slate-500">
                  {items.length} điểm
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
                      {/* Travel segment */}
                      {idx > 0 && item?.travelFromPrevious && (
                        <div className="pl-5 py-1">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Route className="w-3 h-3" />
                            <span>{item.travelFromPrevious.distance} km • {item.travelFromPrevious.duration} phút</span>
                          </div>
                        </div>
                      )}

                      {/* POI card */}
                      <div className="relative pl-5 pb-1 border-l-2 border-slate-200 last:border-0">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-semibold">
                          {idx + 1}
                        </div>

                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-slate-900 text-xs mb-0.5">
                              {item.name}
                            </h3>
                            {item.address && (
                              <p className="text-[11px] text-slate-500 mb-1 line-clamp-1">
                                {item.address}
                              </p>
                            )}

                            {(item.startTime || item.endTime || item.duration) && (
                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                                {(item.startTime || item.endTime) && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
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

                          {gmapsUrl && (
                            <a
                              href={gmapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 px-2 py-1 text-[10px] rounded-md border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
                              title="Xem trên Google Maps"
                            >
                              Bản đồ
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Insights Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#02A0AA]" />
                  <h2 className="text-sm font-semibold text-slate-900">Gợi ý AI</h2>
                </div>

                <button
                  onClick={handleRefresh}
                  disabled={isAIProcessing}
                  className="text-[10px] px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isAIProcessing ? 'animate-spin' : ''}`} />
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
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Loader2 className="w-3.5 h-3.5 text-[#02A0AA] animate-spin" />
                      <span>Đang phân tích...</span>
                    </div>
                    <div className="space-y-1.5">
                      {[100, 85, 70].map((w, i) => (
                        <div
                          key={i}
                          style={{ width: `${w}%` }}
                          className="h-2.5 bg-slate-100 rounded-full animate-pulse"
                        />
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    {ai?.summary && (
                      <div className="bg-linear-to-br from-slate-50 to-slate-100 rounded-lg p-3 border border-slate-200">
                        <p className="text-xs text-slate-700 leading-relaxed">{ai.summary}</p>
                      </div>
                    )}

                    {tips.length > 0 && (
                      <Collapsible>
                        <CollapsibleTrigger className="w-full flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                          <span className="text-xs font-medium text-slate-900">
                            Chi tiết ({tips.length})
                          </span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        </CollapsibleTrigger>

                        <CollapsibleContent className="mt-2 space-y-1.5">
                          {tips.map((tip, i) => (
                            <div
                              key={i}
                              className="flex gap-2 text-xs text-slate-700 bg-slate-50 rounded-lg p-2 border border-slate-200"
                            >
                              <span className="shrink-0 w-4 h-4 rounded-full bg-[#02A0AA]/10 text-[#02A0AA] flex items-center justify-center text-[10px] font-semibold">
                                {i + 1}
                              </span>
                              <span className="leading-relaxed">{tip}</span>
                            </div>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    {!ai?.summary && tips.length === 0 && (
                      <div className="text-center py-4">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2">
                          <Sparkles className="w-4 h-4 text-slate-400" />
                        </div>
                        <p className="text-xs text-slate-500 mb-2">Chưa có gợi ý AI</p>
                        <button
                          onClick={handleRefresh}
                          className="text-[10px] px-3 py-1.5 rounded-lg bg-[#02A0AA] text-white hover:bg-[#018F99] transition-colors"
                        >
                          Tạo gợi ý
                        </button>
                      </div>
                    )}

                    {(ai?.summary || tips.length > 0) && (
                      <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-amber-800 leading-relaxed">
                          Gợi ý AI chỉ mang tính tham khảo. Hãy điều chỉnh theo nhu cầu thực tế.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
                      {/* ===== Tour Guide Request Button at bottom ===== */}
      

      {/* Tour Guide Request Pending Button below map */}
     

      {/* Chat Box - Show when request is pending or accepted */}
      {showChat && itinerary.tourGuideRequest?._id && (itinerary.tourGuideRequest?.status === 'pending' || itinerary.tourGuideRequest?.status === 'accepted') && (
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 mt-8 mb-8">
          <TravellerChatBox
            requestId={itinerary.tourGuideRequest._id}
            guideName={itinerary.tourGuideRequest.guideId?.name || "Tour Guide"}
            onClose={() => setShowChat(false)}
            tourInfo={{
              tourName: itinerary.name,
              name: itinerary.name,
              location: itinerary.zoneName,
              departureDate: itinerary.preferredDate,
              numberOfGuests: itinerary.numberOfPeople,
              duration: itinerary.totalDuration ? `${Math.floor(itinerary.totalDuration / 60)}h ${itinerary.totalDuration % 60}m` : '',
              itinerary: itinerary.items?.map(item => ({
                title: item.name,
                time: item.arrivalTime || '',
                description: item.description
              })),
              totalPrice: itinerary.estimatedCost
            }}
          />
        </div>
      )}

      {/* Reopen Chat Button - Show when chat is closed */}
      {/* DEV helper: always show a debug button to open chat when developing */}
    

      {!showChat && itinerary.tourGuideRequest?._id && (itinerary.tourGuideRequest?.status === 'pending' || itinerary.tourGuideRequest?.status === 'accepted') && (
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 mt-8 mb-8">
          <button
            onClick={() => {
              console.log('[ItineraryResult] Reopen Chat button clicked');
              setShowChat(true);
            }}
            className="w-full px-6 py-4 bg-linear-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Mở Chat với Tour Guide
          </button>
        </div>
      )}

   

      {/* Deposit Paid Success Message */}
      {itinerary.isCustomTour && 
       itinerary.tourGuideRequest?.status === 'accepted' && 
       itinerary.paymentInfo?.status === 'deposit_paid' && (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 mt-6 mb-8">
          <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg border-2 border-green-500/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-full shadow-md">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#0F172A] mb-1">
                  Đã đặt cọc thành công!
                </h3>
                <p className="text-sm text-slate-600">
                  Tour guide sẽ liên hệ với bạn để xác nhận chi tiết và hoàn tất các bước tiếp theo.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Guide Modal */}
      <RequestGuideModal
        isOpen={showRequestGuideModal}
        onClose={() => setShowRequestGuideModal(false)}
        itineraryId={itinerary?._id}
        itineraryName={itinerary?.zoneName}
        itineraryLocation={itinerary?.zoneName}
      />
    </div>
  );
}
