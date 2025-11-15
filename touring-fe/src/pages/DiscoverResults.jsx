/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
// pages/DiscoverResults.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, MapPin, Compass, ArrowLeft } from "lucide-react";
import { useAuth } from "../auth/context";

import PreferencesSummary from "../components/ZonePreferences";
import ZonePreview from "../components/ZonePreview";
import ZonesGrid from "../components/ZoneGrid";
import ProvinceFilter from "../components/ProvinceFilter";
import FloatingCartWidget from "@/components/FloatingCartWidget";

export default function DiscoverResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { withAuth } = useAuth();

  const [data, setData] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [loading, setLoading] = useState(false);

  // Lưu selectedProvince vào sessionStorage mỗi khi đổi
  useEffect(() => {
    try {
      window.sessionStorage.setItem(
        "discover_selected_province",
        selectedProvince
      );
    } catch {}
  }, [selectedProvince]);

  // Khởi tạo từ state hoặc fallback sessionStorage
  useEffect(() => {
    const navigationData = location.state?.data;
    const fromWrapped = location.state?.fromWrapped;
    
    // ✅ NEW: If coming from DiscoveryWrapped, auto-search zones
    if (fromWrapped && location.state?.vibes && location.state?.vibes.length > 0) {
      console.log('[DiscoverResults] Coming from DiscoveryWrapped, auto-searching...');
      autoSearchFromProfile(location.state);
      return;
    }
    
    if (navigationData) {
      setData(navigationData);

      console.log("[DiscoverResults] Received data:", {
        zonesCount: navigationData.zones?.length,
        firstZone: navigationData.zones?.[0],
        hasFinalScore: !!navigationData.zones?.[0]?.finalScore,
        finalScore: navigationData.zones?.[0]?.finalScore,
      });

      if (navigationData.zones?.length > 0) {
        setSelectedZone(navigationData.zones[0]);
      }

      // Ghi nhớ data mới lên sessionStorage
      try {
        window.sessionStorage.setItem(
          "discover_result",
          JSON.stringify(navigationData)
        );
      } catch {}
    } else {
      // Fallback: đọc lại từ sessionStorage
      try {
        const raw = window.sessionStorage.getItem("discover_result");
        if (raw) {
          const saved = JSON.parse(raw);
          setData(saved);

          // Khôi phục province + zone đã chọn nếu có
          const savedProvince =
            window.sessionStorage.getItem("discover_selected_province") ||
            "all";
          setSelectedProvince(savedProvince);

          if (saved?.zones?.length > 0) {
            const savedZoneId =
              window.sessionStorage.getItem("discover_selected_zone_id") || "";
            const found =
              saved.zones.find((z) => z.id === savedZoneId) || saved.zones[0];
            setSelectedZone(found);
          }
        }
      } catch {}
    }
  }, [location.state]);

  // ✅ NEW: Auto-search zones from profile
  const autoSearchFromProfile = async (wrappedState) => {
    try {
      setLoading(true);
      const { vibes, freeText = '', profile } = wrappedState;
      
      console.log('[DiscoverResults] Auto-searching with:', { vibes, profile });
      
      // Call discover API (reuse existing endpoint)
      const response = await withAuth('/api/discover/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vibes,
          freeText,
          userLocation: null // Use profile-based location if available
        })
      });
      
      if (response.ok && response.zones) {
        const resultData = {
          zones: response.zones,
          byProvince: response.byProvince,
          preferences: {
            vibes,
            freeText,
            fromProfile: true,
            confidence: profile?.confidence,
            travelStyle: profile?.travelStyle
          }
        };
        
        setData(resultData);
        
        if (response.zones.length > 0) {
          setSelectedZone(response.zones[0]);
        }
        
        // Save to sessionStorage
        try {
          window.sessionStorage.setItem('discover_result', JSON.stringify(resultData));
        } catch {}
        
        console.log('[DiscoverResults] Auto-search success:', response.zones.length, 'zones');
      } else {
        console.error('[DiscoverResults] Auto-search failed:', response);
        setData({ zones: [], preferences: { vibes, fromProfile: true } });
      }
    } catch (error) {
      console.error('[DiscoverResults] Auto-search error:', error);
      setData({ zones: [], preferences: { vibes: wrappedState.vibes, fromProfile: true } });
    } finally {
      setLoading(false);
    }
  };

  // Lọc theo province
  const zones = useMemo(() => {
    if (!data?.zones) return [];
    if (selectedProvince === "all") return data.zones;
    return data.zones.filter((z) => z.province === selectedProvince);
  }, [data, selectedProvince]);

  // Click "Khám phá zone" → vào ZoneDetail và mang theo state để quay lại
  const handleExploreZone = () => {
    if (!selectedZone) return;

    console.log("[DEBUG] selectedZone:", selectedZone);
    console.log("[DEBUG] selectedZone.id:", selectedZone.id);
    console.log("[DEBUG] selectedZone.name:", selectedZone.name);

    const zoneSlug = selectedZone.id;
    if (!zoneSlug) {
      console.error("[ERROR] Zone has no id field!", selectedZone);
      alert("Zone ID không hợp lệ");
      return;
    }

    console.log(`[FE] Navigating to /zone/${zoneSlug}`);

    navigate(`/zone/${zoneSlug}`, {
      state: {
        zone: selectedZone,
        prefs: data?.prefs,
        data, // Giữ full data để quay lại không mất
      },
    });
  };

  if (!data || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 left-0 w-96 h-96 bg-[#02A0AA]/20 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center relative z-10"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mb-4"
          >
            <Compass className="w-16 h-16 mx-auto text-[#02A0AA]" />
          </motion.div>
          <p className="text-slate-600 mb-6">
            Không có dữ liệu. Hãy quay lại tìm kiếm.
          </p>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/intinerary-creator")}
            className="px-6 py-3 bg-white/80 backdrop-blur-sm text-slate-900 rounded-2xl hover:bg-white transition-all shadow-lg hover:shadow-xl border border-[#02A0AA]/20"
          >
            Quay lại tìm kiếm
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Animated background patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-[#02A0AA]/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8 z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-3">
            {/* Nút Quay lại */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                // Quay về form discover, truyền lại data để form có thể hồi phục
                navigate("/intinerary-creator", {
                  state: { from: "results", data },
                });
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white/80 hover:bg-white backdrop-blur-sm shadow-sm hover:shadow-md text-slate-700 transition-all"
              aria-label="Quay lại"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </motion.button>

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="p-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm"
            >
              <Globe className="w-6 h-6 text-[#02A0AA]" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-3xl font-bold bg-gradient-to-r from-[#02A0AA] via-cyan-600 to-teal-600 bg-clip-text text-transparent"
            >
              Zones gợi ý
            </motion.h1>
          </div>
        </motion.div>

        <div className="w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
            className="flex flex-col gap-4 lg:flex-row lg:items-stretch"
          >
            {/* Left 30% */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="lg:basis-[30%] lg:shrink-0"
            >
              <div className="h-full min-h-[280px]">
                <PreferencesSummary
                  prefs={data.prefs}
                  compact
                  onEdit={() => navigate("/intinerary-creator", { state: { data } })}
                  maxVibes={6}
                  maxAvoid={4}
                />
              </div>
            </motion.div>

            {/* Right 70% */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="lg:basis-[70%] lg:shrink-0"
            >
              <div className="h-full min-h-[280px]">
                <AnimatePresence mode="wait">
                  <ZonePreview
                    zone={selectedZone}
                    onExplore={handleExploreZone}
                    compact
                    verbose
                  />
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ProvinceFilter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-6"
        >
          <ProvinceFilter
            value={selectedProvince}
            onChange={setSelectedProvince}
          />
        </motion.div>

        {/* Zones Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="mt-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.4 }}
            className="flex items-center gap-2 text-sm text-slate-600 mb-2"
          >
            <MapPin className="w-4 h-4" />
            <span className="font-medium">{zones.length} zones khả dụng</span>
          </motion.div>

          <ZonesGrid
            zones={zones}
            selectedZoneId={selectedZone?.id}
            onSelectZone={(z) => {
              setSelectedZone(z);
              try {
                window.sessionStorage.setItem(
                  "discover_selected_zone_id",
                  z?.id || ""
                );
              } catch {}
            }}
            onHoverZone={() => {}}
          />
        </motion.div>
      </div>

      <FloatingCartWidget />
    </div>
  );
}
