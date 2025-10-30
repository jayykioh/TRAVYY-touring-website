// pages/DiscoverResults.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, MapPin, Compass, ArrowLeft } from "lucide-react";

import PreferencesSummary from "../components/ZonePreferences";
import ZonePreview from "../components/ZonePreview";
import ZonesGrid from "../components/ZoneGrid";
import ProvinceFilter from "../components/ProvinceFilter";
import FloatingCartWidget from "@/components/FloatingCartWidget";

export default function DiscoverResults() {
  const location = useLocation();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState("all");

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

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Compass className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-600 mb-6">
            Không có dữ liệu. Hãy quay lại tìm kiếm.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/intinerary-creator")}
            className="px-6 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-colors"
          >
            Quay lại tìm kiếm
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-3">
            {/* Nút Quay lại */}
            <button
              onClick={() => {
                // Quay về form discover, truyền lại data để form có thể hồi phục
                navigate("/intinerary-creator", {
                  state: { from: "results", data },
                });
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white hover:bg-slate-50 text-slate-700"
              aria-label="Quay lại"
            >
              <ArrowLeft className="w-4 h-4 shadow-sm hover:scale-105 transform ease-in-out duration-200" />
              Quay lại
            </button>

            <div className="p-2 bg-white rounded-xl shadow-sm">
              <Globe className="w-6 h-6 text-slate-700" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Zones gợi ý</h1>
          </div>
        </motion.div>

        <div className="w-full mx-auto">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
            {/* Left 30% */}
            <div className="lg:basis-[30%] lg:shrink-0">
              <div className="h-full min-h-[280px]">
                <PreferencesSummary
                  prefs={data.prefs}
                  compact
                  onEdit={() => navigate("/intinerary-creator", { state: { data } })}
                  maxVibes={6}
                  maxAvoid={4}
                />
              </div>
            </div>

            {/* Right 70% */}
            <div className="lg:basis-[70%] lg:shrink-0">
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
            </div>
          </div>
        </div>

        {/* ProvinceFilter */}
        <div className="mt-6">
          <ProvinceFilter
            value={selectedProvince}
            onChange={setSelectedProvince}
          />
        </div>

        {/* Zones Grid */}
        <div className="mt-4">
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">{zones.length} zones khả dụng</span>
          </div>

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
        </div>
      </div>

      <FloatingCartWidget />
    </div>
  );
}
