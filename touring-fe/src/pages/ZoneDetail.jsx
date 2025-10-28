/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
// pages/ZoneDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Star,
  Image as ImageIcon,
  Sparkles,
  Plus,
  Check,
  Clock,
  Sun,
  CloudSun,
  Sunset,
  Moon,
  Cloud,
  Camera,
  ThumbsUp,
  AlertTriangle,
} from "lucide-react";
import GoongMapPanel from "../components/GoongMapPanel";
import { useItinerary } from "../hooks/useIntinerary";
import { useAuth } from "@/auth/context";
import FloatingCartWidget from "@/components/FloatingCartWidget";
import { toast } from "sonner";

/* Helpers: bestTime */
const bestTimeIcon = (time) => {
  switch (time) {
    case "morning":
      return <Sun className="w-3.5 h-3.5 text-amber-400" />;
    case "afternoon":
      return <CloudSun className="w-3.5 h-3.5 text-orange-400" />;
    case "evening":
      return <Sunset className="w-3.5 h-3.5 text-pink-500" />;
    case "night":
      return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
    case "anytime":
      return <Cloud className="w-3.5 h-3.5 text-slate-400" />;
    default:
      return <Clock className="w-3.5 h-3.5 text-slate-400" />;
  }
};
const bestTimeLabel = (time) => {
  switch (time) {
    case "morning":
      return "Buổi sáng";
    case "afternoon":
      return "Buổi chiều";
    case "evening":
      return "Hoàng hôn";
    case "night":
      return "Ban đêm";
    case "anytime":
      return "Bất kỳ thời điểm nào";
    default:
      return "";
  }
};

/* MiniPOICard */
function MiniPOICard({ poi, active, onClick, isAdded, onToggleAdd }) {
  return (
    <div
      className={`group w-full rounded-lg border px-3 py-2 transition-all ${
        active
          ? "border-[#02A0AA] bg-[#02A0AA]/5"
          : "border-white/30 bg-white/70 hover:bg-white"
      }`}
    >
      <button onClick={onClick} className="w-full text-left">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-md overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 border border-white/40 grid place-items-center">
            <MapPin className="w-4 h-4 text-slate-400" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-[13px] text-slate-900 line-clamp-1">
              {poi.name}
            </p>
            <p className="text-[11px] text-slate-600 line-clamp-1">
              {poi.address || "Địa điểm"}
              {typeof poi.distanceKm === "number" && (
                <> • {poi.distanceKm.toFixed(1)} km</>
              )}
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

      <div className="mt-2 flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleAdd(poi);
          }}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-semibold transition-all ${
            isAdded
              ? "bg-[#02A0AA] text-white"
              : "bg-white border border-slate-300 text-slate-700 hover:border-[#02A0AA] hover:text-[#02A0AA]"
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Đã thêm
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              Thêm vào hành trình
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* SkeletonPOICard (shadcn) */
function SkeletonPOICard() {
  return (
    <div className="group w-full rounded-lg border px-3 py-2 bg-white/70">
      <div className="flex gap-3">
        <Skeleton className="w-10 h-10 rounded-md" />
        <div className="min-w-0 flex-1 space-y-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <Skeleton className="h-4 w-10" />
      </div>
      <div className="mt-2 flex gap-2">
        <Skeleton className="h-8 w-full rounded-md" />
      </div>
    </div>
  );
}

export default function ZoneDetail() {
  const { zoneId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [pois, setPOIs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isAuth } = useAuth();

  const [zone, setZone] = useState(location.state?.zone || null);
  const [selectedPoiId, setSelectedPoiId] = useState(null);

  // Itinerary context
  const {
    setCurrentItinerary,
    currentItinerary,
    isPOIInCart,
    addPOI,
    removePOI,
    openCart,
    loadCurrentItinerary,
  } = useItinerary();

  // Load itinerary on mount (if logged in)
  useEffect(() => {
    if (isAuth) {
      loadCurrentItinerary();
    }
  }, [isAuth, zoneId]);

  // Load zone detail
  useEffect(() => {
    let ignore = false;
    async function run() {
      try {
        setLoading(true);
        if (!zone) {
          const res = await fetch(`/api/zones/${zoneId}`);
          const json = await res.json();
          if (!ignore && json?.ok) setZone(json.zone);
        }
      } catch (e) {
        toast.error(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    run();
    return () => {
      ignore = true;
    };
  }, [zoneId]);

  // Load or reuse itinerary for this zone
  useEffect(() => {
    async function loadItinerary() {
      try {
        const res = await fetch("/api/itinerary", {
          credentials: "include",
        });
        const data = await res.json();

        if (data.success) {
          const existing = data.itineraries.find(
            (it) => it.zoneId === zoneId && it.status === "draft"
          );

          if (existing) {
            setCurrentItinerary(existing);
          }
        }
      } catch (error) {
        console.error("Error loading itinerary:", error);
      }
    }

    loadItinerary();
  }, [zoneId]);

  // Toggle POI in cart
  const toggleAddPoi = async (poi) => {
    if (!isAuth) {
      alert("Vui lòng đăng nhập để thêm vào hành trình");
      navigate("/login");
      return;
    }

    const id = poi.place_id || poi.id;

    try {
      if (isPOIInCart(id)) {
        await removePOI(id);
      } else {
        await addPOI(
          poi,
          zoneId,
          zone?.name || "Unknown",
          location.state?.prefs
        );
        openCart();
      }
    } catch (error) {
      console.error("Error toggling POI:", error);
      toast.error(error.message || "Có lỗi xảy ra");
    }
  };

  const handlePoiClick = (poi) => {
    const id = poi.place_id || poi.id;
    setSelectedPoiId(id);
  };

  const center = useMemo(() => {
    if (zone?.center) return zone.center;
    if (zone?.loc) return zone.loc;
    return { lat: 16.047, lng: 108.206 };
  }, [zone]);

  // Fetch POIs
  useEffect(() => {
    const fetchPOIs = async () => {
      try {
        setLoading(true);
        setError(null);

        const vibes = location.state?.prefs?.vibes || [];
        const vibesParam = vibes.length > 0 ? vibes.join(",") : "";

        const url = `/api/zones/${zoneId}/pois?vibes=${vibesParam}&limit=10`;
        console.log("📤 [ZoneDetail] Fetching POIs from:", url);

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        console.log("📥 [ZoneDetail] Response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("📥 [ZoneDetail] Response data:", data);

        if (!data.pois || !Array.isArray(data.pois)) {
          console.error("❌ [ZoneDetail] Invalid response format:", data);
          throw new Error("Invalid POI data format");
        }

        if (data.pois.length > 0) {
          console.log("📥 [ZoneDetail] First POI received:", {
            name: data.pois[0].name,
            lat: data.pois[0].lat,
            lng: data.pois[0].lng,
            loc: data.pois[0].loc,
            location: data.pois[0].location,
            address: data.pois[0].address,
            keys: Object.keys(data.pois[0]),
          });
        }

        console.log(
          `✅ [ZoneDetail] Setting ${data.pois.length} POIs to state`
        );
        setPOIs(data.pois);
      } catch (err) {
        console.error("❌ [ZoneDetail] Fetch error:", err);
        setError(err.message);
        setPOIs([]);
      } finally {
        setLoading(false);
      }
    };

    if (zoneId) {
      fetchPOIs();
    }
  }, [zoneId, location.state?.prefs?.vibes]);

  useEffect(() => {
    console.log("🔄 [ZoneDetail] POIs state updated:", {
      count: pois.length,
      pois: pois.map((p) => ({ name: p.name, lat: p.lat, lng: p.lng })),
    });
  }, [pois]);

  // Error page (optional — keep for debugging)
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">❌ Lỗi: {error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <FloatingCartWidget />

      {/* ================= Banner ================= */}
      {zone && (
        <section className="relative">
          <div className="relative h-52 w-full overflow-hidden">
            {zone.heroImg || zone.gallery?.[0] ? (
              <img
                src={zone.heroImg || zone.gallery[0]}
                alt={zone.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full grid place-items-center bg-slate-200">
                <ImageIcon className="w-10 h-10 text-slate-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

            {/* Back button on banner */}
            {/* Back button on banner */}
            <button
              onClick={() => {
                // Nếu có dữ liệu discover trước đó → quay lại và giữ nguyên state
                const discoverData = location.state?.data || null;
                if (discoverData) {
                  navigate("/discover/results", {
                    state: { data: discoverData },
                  });
                } else {
                  // fallback nếu không có data
                  navigate("/discover/results");
                }
              }}
              className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/80 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-slate-700 border border-white/40 shadow-sm hover:bg-white"
              aria-label="Quay lại"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Quay lại
            </button>

            {/* Title + tags + bestTime overlay */}
            <div className="absolute left-4 right-4 bottom-2 space-y-2">
              <div className="flex items-end justify-between">
                <div>
                  <h1 className="text-white text-2xl font-bold drop-shadow">
                    {zone.name}
                  </h1>
                  <p className="text-slate-200 text-xs flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {zone.province}
                  </p>
                </div>

                {typeof zone.matchScore === "number" && (
                  <span className="inline-flex items-center gap-1.5 bg-white/85 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-[#02A0AA]" />
                    <span className="text-[12px] font-bold text-slate-900">
                      {(zone.matchScore * 100).toFixed(0)}%
                    </span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {zone.tags?.slice(0, 4).map((t, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-full bg-white/90 text-slate-900 text-[11px] font-medium border border-white/30 backdrop-blur"
                  >
                    {t}
                  </span>
                ))}
                {zone.bestTime && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/40 text-white text-[11px] border border-white/20 backdrop-blur">
                    {bestTimeIcon(zone.bestTime)}
                    {bestTimeLabel(zone.bestTime)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================= Main 2-columns ================= */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-[420px_1fr] gap-5">
        {/* Left: Zone info + POI list */}
        <div className="space-y-4">
          {zone && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-white/80 backdrop-blur-xl border border-white/20 p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-3 text-[12px] text-slate-600">
                {zone.mustSee?.length > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-purple-500" />
                    Điểm nổi bật:{" "}
                    <span className="font-medium">{zone.mustSee[0]}</span>
                  </span>
                )}
              </div>

              {zone.desc && (
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  {zone.desc}
                </p>
              )}

              {zone.whyChoose?.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-semibold text-slate-900 mb-1.5">
                    Lý do nên chọn
                  </h4>
                  <ul className="space-y-1.5">
                    {zone.whyChoose.slice(0, 3).map((r, i) => (
                      <li key={i} className="text-sm text-slate-700">
                        • {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(zone.tips?.length > 0 || zone.donts?.length > 0) && (
                <div className="mt-3 grid grid-cols-1 gap-2">
                  {zone.tips?.length > 0 && (
                    <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                      <ThumbsUp className="w-4 h-4 text-green-600 mt-0.5" />
                      <div className="text-sm text-slate-700">
                        {zone.tips[0]}
                        {zone.tips[1] && (
                          <div className="mt-1">{zone.tips[1]}</div>
                        )}
                      </div>
                    </div>
                  )}
                  {zone.donts?.length > 0 && (
                    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                      <div className="text-sm text-slate-700">
                        {zone.donts[0]}
                        {zone.donts[1] && (
                          <div className="mt-1">{zone.donts[1]}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* POI list with Skeleton */}
          <section className="rounded-xl bg-white/80 backdrop-blur-xl border border-white/20 p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-slate-900">
                Địa điểm gợi ý ({loading ? "Đang tải..." : pois.length})
              </h2>
              <span className="text-[11px] text-[#02A0AA] font-semibold">
                {currentItinerary?.items?.length || 0} đã thêm
              </span>
            </div>

            <div className="max-h-[56vh] overflow-auto pr-1 space-y-2">
              {loading || (!loading && pois.length === 0) ? (
                <>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonPOICard key={i} />
                  ))}
                </>
              ) : (
                <AnimatePresence initial={false}>
                  {pois.map((poi) => {
                    const id = poi.place_id || poi.id;
                    return (
                      <motion.div
                        key={id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <MiniPOICard
                          poi={poi}
                          active={id === selectedPoiId}
                          onClick={() => setSelectedPoiId(id)}
                          isAdded={isPOIInCart(id)}
                          onToggleAdd={toggleAddPoi}
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </section>
        </div>

        {/* Right: Map */}
        <div className="h-[70vh] lg:h-[78vh]">
          <GoongMapPanel
            center={center}
            pois={pois}
            selectedPoiId={selectedPoiId}
            onPoiClick={handlePoiClick}
            
          />
        </div>
      </div>

      <FloatingCartWidget />
    </div>
  );
}
