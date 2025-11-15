/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/context";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, Star, Plus, Check, Lightbulb, AlertTriangle,
  Sun, Sunset, CloudSun, ChevronDown, ChevronUp, Cloud, Clock, Sparkles, Image as ImageIcon, Moon
} from "lucide-react";
import { useItinerary } from "../hooks/useIntinerary";
import FloatingCartWidget from "@/components/FloatingCartWidget";
import { toast } from "sonner";
import Map4DPanel from "@/components/Map4DPanel";
import POISearch from "@/components/POISearch";
import POICategoryTabs from "@/components/POICategoryTabs";

/** ✅ Ô T O U R S (giữ riêng, không sửa POI) */
import ZoneToursSection from "@/components/ZoneToursSection";

/* MiniPOICard — GIỮ NGUYÊN */
function MiniPOICard({ poi, active, onClick, isAdded, onToggleAdd }) {
  return (
    <div
      className={`group w-full rounded-lg border px-3 py-2 transition-all ${
        active ? "border-[#02A0AA] bg-[#02A0AA]/5" : "border-white/30 bg-white/70 hover:bg-white"
      }`}
    >
      <button onClick={onClick} className="w-full text-left">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-md overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 border border-white/40 grid place-items-center">
            <MapPin className="w-4 h-4 text-slate-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-[13px] text-slate-900 line-clamp-1">{poi.name}</p>
            <p className="text-[11px] text-slate-600 line-clamp-1">
              {poi.address || "Địa điểm"}
              {typeof poi.distanceKm === "number" && <> • {poi.distanceKm.toFixed(1)} km</>}
            </p>
          </div>
          {typeof poi.rating === "number" && (
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-600">
              <Star className="w-3 h-3 fill-amber-500" />
              {poi.rating.toFixed(1)}
            </span>
          )}
        </div>
      </button>

      <div className="mt-2">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleAdd(poi); }}
          className={`w-full inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-semibold transition-all ${
            isAdded
              ? "bg-[#02A0AA] text-white"
              : "bg-white border border-slate-300 text-slate-700 hover:border-[#02A0AA]"
          }`}
        >
          {isAdded ? (<><Check className="w-3.5 h-3.5" /> Đã thêm</>)
                    : (<><Plus className="w-3.5 h-3.5" /> Thêm vào hành trình</>)}
        </button>
      </div>
    </div>
  );
}

/* Skeleton — GIỮ NGUYÊN */
function SkeletonPOICard() {
  return (
    <div className="rounded-lg border px-3 py-2 bg-white/70">
      <div className="flex gap-3">
        <Skeleton className="w-10 h-10 rounded-md" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
      <Skeleton className="h-8 w-full mt-2 rounded-md" />
    </div>
  );
}

export default function ZoneDetail() {
  const { zoneId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuth } = useAuth();

  const [zone, setZone] = useState(location.state?.zone || null);
  const [loading, setLoading] = useState(true);
  const [showZoneInfo, setShowZoneInfo] = useState(false);

  /** ✅ markersTours: từ ô Tours; markersPOIs: từ POIs; mapMarkers = gộp cả hai */
  const [markersTours, setMarkersTours] = useState([]);
  const [selectedPoiId, setSelectedPoiId] = useState(null);

  // POI state — GIỮ NGUYÊN
  const { withAuth } = useAuth();
  const [poisByCategory, setPoisByCategory] = useState({
    views: [], beach: [], nature: [], food: [], culture: [], shopping: [], nightlife: [], recent: [],
  });
  const [activeCategory, setActiveCategory] = useState("views");
  const [loadingCategories, setLoadingCategories] = useState(new Set());

  const { currentItinerary, isPOIInCart, addPOI, removePOI, openCart, addTour } = useItinerary();

  // Load recent — GIỮ NGUYÊN
  useEffect(() => {
    if (!zoneId) return;
    try {
      const raw = localStorage.getItem(`recent:${zoneId}`);
      setPoisByCategory((prev) => ({ ...prev, recent: raw ? JSON.parse(raw) : [] }));
    } catch {
      setPoisByCategory((prev) => ({ ...prev, recent: [] }));
    }
  }, [zoneId]);

  // Fetch zone — GIỮ NGUYÊN
  useEffect(() => {
    let ignore = false;
    async function fetchZone() {
      try {
        setLoading(true);
        const timestamp = Date.now();
        const res = await fetch(`/api/zones/${zoneId}?_t=${timestamp}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
        });
        const json = await res.json();
        if (json?.ok && json.zone && !ignore) setZone(json.zone);
      } catch (e) {
        console.error("❌ Zone fetch error:", e);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchZone();
    return () => { ignore = true; };
  }, [zoneId]);

  // Priority POIs — ✅ WITH USER LOCATION
  useEffect(() => {
    async function loadPriorityPOIs() {
      try {
        // Try to get user location
        let userLocation = null;
        if (navigator.geolocation) {
          try {
            console.log('📍 Requesting user location for POI sorting...');
            const position = await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: false,
                timeout: 3000,
                maximumAge: 60000 // Cache for 1 minute
              });
            });
            userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            console.log('✅ User location obtained:', userLocation);
          } catch (err) {
            console.warn('⚠️ Could not get user location for POIs:', err.message);
            // User denied permission or timeout - continue without location
          }
        } else {
          console.warn('⚠️ Geolocation not supported by browser');
        }
        
        // Build query params
        const params = new URLSearchParams({ limit: '7' });
        if (userLocation) {
          params.append('userLat', userLocation.lat);
          params.append('userLng', userLocation.lng);
          console.log('📤 Sending POI request WITH user location');
        } else {
          console.log('📤 Sending POI request WITHOUT user location');
        }
        
        const res = await fetch(`/api/zones/${zoneId}/pois-priority?${params}`);
        const json = await res.json();
        if (json.ok) {
          setPoisByCategory((prev) => ({
            ...prev,
            ...json.data, // { views, beach, nature }
          }));
        }
      } catch (err) {
        console.error("❌ Error loading priority POIs:", err);
      }
    }
    if (zoneId) loadPriorityPOIs();
  }, [zoneId]);

  // Persist recent — GIỮ NGUYÊN
  const persistRecent = (list) => {
    try { localStorage.setItem(`recent:${zoneId}`, JSON.stringify(list)); } catch {}
  };

  // Lazy load POI theo tab — GIỮ NGUYÊN
  const loadCategory = async (categoryKey) => {
    if (
      ["recent", "views", "beach", "nature"].includes(categoryKey) ||
      (poisByCategory[categoryKey]?.length ?? 0) > 0
    ) return;

    setLoadingCategories((prev) => new Set(prev).add(categoryKey));
    try {
      const res = await fetch(`/api/zones/${zoneId}/pois/${categoryKey}?limit=7`);
      const json = await res.json();
      if (json.ok) {
        setPoisByCategory((prev) => ({ ...prev, [categoryKey]: json.pois || [] }));
      }
    } catch (err) {
      console.error(`❌ Error loading ${categoryKey}:`, err);
    } finally {
      setLoadingCategories((prev) => { const next = new Set(prev); next.delete(categoryKey); return next; });
    }
  };

  const handleCategoryChange = (categoryKey) => {
    setActiveCategory(categoryKey);
    loadCategory(categoryKey);
  };

  // Search chọn POI — GIỮ NGUYÊN
  const handleSearchSelect = (poi) => {
    const id = poi.place_id || poi.id;
    setSelectedPoiId(id);
    setPoisByCategory((prev) => {
      const curr = prev.recent || [];
      const dedup = [poi, ...curr.filter((p) => (p.place_id || p.id) !== id)].slice(0, 12);
      persistRecent(dedup);
      return { ...prev, recent: dedup };
    });
    setActiveCategory("recent");
  };

  // Add/Remove POI — GIỮ NGUYÊN
  const toggleAddPoi = async (poi) => {
    if (!isAuth) { toast.error("Vui lòng đăng nhập"); navigate("/login"); return; }
    const id = poi.place_id || poi.id;
    try {
      if (isPOIInCart(id)) {
        await removePOI(id);
      } else {
        await addPOI(poi, zoneId, zone?.name || "Unknown");
        openCart();
      }
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra");
    }
  };

  // POIs đang hiển thị theo tab — GIỮ NGUYÊN
  const currentPOIs = useMemo(() => {
    return poisByCategory[activeCategory] || [];
  }, [poisByCategory, activeCategory]);

  // Center map — GIỮ NGUYÊN
  const center = useMemo(() => zone?.center || { lat: 16.047, lng: 108.206 }, [zone]);

  // Markers của POIs (gộp tất cả tab) — GIỮ NGUYÊN
  const markersPOIs = useMemo(() => {
    return Object.values(poisByCategory).flat().map((p) => {
      const id = p.place_id || p.id;
      return {
        id,
        name: p.name,
        address: p.address || "",
        location: p.location || (p.geometry?.location ? {
          lat: p.geometry.location.lat, lng: p.geometry.location.lng
        } : null),
      };
    }).filter(m => m.location && typeof m.location.lat === "number" && typeof m.location.lng === "number");
  }, [poisByCategory]);

  /** ✅ GỘP MARKERS: Tours + POIs (Map4DPanel vẫn dùng `pois`) */
  const mapMarkers = useMemo(() => {
    // ưu tiên không trùng id: nếu trùng, giữ cái đầu tiên
    const byId = new Map();
    [...markersTours, ...markersPOIs].forEach(m => {
      if (!byId.has(m.id)) byId.set(m.id, m);
    });
    return Array.from(byId.values());
  }, [markersTours, markersPOIs]);

  // ===== UI helpers (best time badges) — GIỮ NGUYÊN =====
  const bestTimeIcon = (time) => {
    switch (time) {
      case "morning": return <Sun className="w-3.5 h-3.5 text-amber-400" />;
      case "afternoon": return <CloudSun className="w-3.5 h-3.5 text-orange-400" />;
      case "evening": return <Sunset className="w-3.5 h-3.5 text-pink-500" />;
      case "night": return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
      case "anytime": return <Cloud className="w-3.5 h-3.5 text-slate-400" />;
      default: return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };
  const bestTimeLabel = (time) => {
    switch (time) {
      case "morning": return "Buổi sáng";
      case "afternoon": return "Buổi chiều";
      case "evening": return "Hoàng hôn";
      case "night": return "Ban đêm";
      case "anytime": return "Bất kỳ thời điểm nào";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <FloatingCartWidget />

      {/* ===== Banner (GIỮ NGUYÊN) ===== */}
      {zone && (
        <section className="relative">
          <div className="relative h-52 w-full overflow-hidden">
            {zone.heroImg || zone.gallery?.[0] ? (
              <img src={zone.heroImg || zone.gallery[0]} alt={zone.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full grid place-items-center bg-slate-200">
                <ImageIcon className="w-10 h-10 text-slate-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
            <button
              onClick={() => {
                const discoverData = location.state?.data || null;
                if (discoverData) navigate("/discover-results", { state: { data: discoverData } });
                else navigate("/discover-results");
              }}
              className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/80 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-slate-700 border border-white/40 shadow-sm hover:bg-white"
              aria-label="Quay lại"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại
            </button>

            <div className="absolute left-4 right-4 bottom-2 space-y-2">
              <div className="flex items-end justify-between">
                <div>
                  <h1 className="text-white text-2xl font-bold drop-shadow">{zone.name}</h1>
                  <p className="text-slate-200 text-xs flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {zone.province}
                  </p>
                </div>
                {typeof zone.matchScore === "number" && (
                  <span className="inline-flex items-center gap-1.5 bg-white/85 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-[#02A0AA]" />
                    <span className="text-[12px] font-bold text-slate-900">{(zone.matchScore * 100).toFixed(0)}%</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {zone.tags?.slice(0, 4).map((t, i) => (
                  <span key={i} className="px-2.5 py-0.5 rounded-full bg-white/90 text-slate-900 text-[11px] font-medium border border-white/30 backdrop-blur">
                    {t}
                  </span>
                ))}
                {zone.bestTime && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/40 text-white text-[11px] border border-white/20 backdrop-blur">
                    {bestTimeIcon(zone.bestTime)} {bestTimeLabel(zone.bestTime)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== Main (GIỮ NGUYÊN POI, CHỈ THÊM Ô TOURS) ===== */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-[420px_1fr] gap-5">
        {/* LEFT */}
        <div className="space-y-4">
          {/* Zone Info — GIỮ NGUYÊN */}
          {zone && (
            <div className="rounded-xl bg-white/80 backdrop-blur-sm border shadow-sm overflow-hidden">
              <button
                onClick={() => setShowZoneInfo(!showZoneInfo)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/60 transition"
              >
                <h3 className="font-semibold text-slate-900">Thông tin khu vực</h3>
                {showZoneInfo ? <ChevronUp className="w-5 h-5 text-slate-600" /> : <ChevronDown className="w-5 h-5 text-slate-600" />}
              </button>

              {showZoneInfo && (
                <div className="px-4 pb-4 space-y-3 text-sm">
                  {zone.desc && <p className="text-slate-700 leading-relaxed">{zone.desc}</p>}
                  {zone.tips?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-900 flex items-center gap-1.5 mb-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" /> Mẹo du lịch
                      </h4>
                      <ul className="space-y-1.5 text-slate-700">
                        {zone.tips.slice(0, 3).map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#02A0AA] mt-0.5">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {zone.donts?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-900 flex items-center gap-1.5 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" /> Lưu ý
                      </h4>
                      <ul className="space-y-1.5 text-slate-700">
                        {zone.donts.slice(0, 3).map((dont, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">⚠</span>
                            <span>{dont}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

            <POISearch zoneId={zoneId} onSelectPOI={handleSearchSelect} />
          {/* Tabs + Content: Tour tab sẽ show danh sách tour, các tab khác giữ nguyên */}
          <POICategoryTabs activeCategory={activeCategory} onSelectCategory={handleCategoryChange} />
          <div className="rounded-xl bg-white/80 border p-3">
            {activeCategory === "tour" ? (
              <ZoneToursSection
                zoneId={zoneId}
                zoneName={zone?.name || "Unknown"}
                onMarkersChange={setMarkersTours}
                createOrGetDraft={async (zId, zName) => {
                  const data = await withAuth("/api/itinerary", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ zoneId: zId, zoneName: zName }),
                  });
                  if (!data?.success) throw new Error(data?.error || "Create draft failed");
                  return data.itinerary._id;
                }}
                addPoiToItinerary={async (itineraryId, poiLike) => {
                  await addTour(
                    { ...poiLike, tourId: poiLike.tourId || poiLike.id?.replace(/^tour:/, "") },
                    zoneId,
                    zone?.name || "Unknown"
                  );
                  openCart(); // Open cart after adding tour for smooth UX
                }}
              />
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-slate-900">
                    {loadingCategories.has(activeCategory) ? "Đang tải..." : `${(poisByCategory[activeCategory] || []).length} địa điểm`}
                  </h2>
                  <span className="text-xs text-[#02A0AA] font-semibold">
                    {currentItinerary?.items?.length || 0} đã thêm
                  </span>
                </div>
                <div className="max-h-[50vh] overflow-auto space-y-2">
                  {loadingCategories.has(activeCategory) ? (
                    Array.from({ length: 5 }).map((_, i) => <SkeletonPOICard key={i} />)
                  ) : currentPOIs.length === 0 ? (
                    <div className="text-center text-sm text-slate-600 py-8">
                      <p>Chưa có địa điểm nào</p>
                      <p className="text-xs text-slate-500 mt-1">Thử chọn danh mục khác hoặc tìm kiếm</p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {currentPOIs.map((poi) => {
                        const id = poi.place_id || poi.id;
                        return (
                          <motion.div key={id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                            <MiniPOICard
                              poi={poi}
                              active={id === selectedPoiId}
                              onClick={() => setSelectedPoiId(id)}
                              isAdded={isPOIInCart(id)}
                              onToggleAdd={async (p) => {
                                if (!isAuth) { toast.error("Vui lòng đăng nhập"); navigate("/login"); return; }
                                try {
                                  if (isPOIInCart(id)) { await removePOI(id); }
                                  else { await addPOI(p, zoneId, zone?.name || "Unknown"); openCart(); }
                                } catch (e) { toast.error(e.message || "Có lỗi xảy ra"); }
                              }}
                            />
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  )}
                </div>
              </>
            )}
          </div>

          {/* 🔵 Search — GIỮ NGUYÊN */}
        
        </div>

        {/* RIGHT: Map — dùng markers đã GỘP từ Tours + POIs */}
        <div className="h-[70vh] lg:h-[78vh]">
          <Map4DPanel
            center={zone?.center || { lat: 16.047, lng: 108.206 }}
            pois={mapMarkers}
            selectedPoiId={selectedPoiId}
            onPoiClick={(poi) => setSelectedPoiId(poi.place_id || poi.id)}
            polygon={zone?.polyComputed || zone?.poly}
          />
        </div>
      </div>
    </div>
  );
}
